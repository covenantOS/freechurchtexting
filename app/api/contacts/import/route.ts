import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { prisma } from '@/lib/db';
import { formatE164, isValidPhone } from '@/lib/phone';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// Map various CSV column names to our internal field names
const COLUMN_MAP: Record<string, string> = {
  firstname: 'firstName',
  first_name: 'firstName',
  'first name': 'firstName',
  lastname: 'lastName',
  last_name: 'lastName',
  'last name': 'lastName',
  phone: 'phone',
  phonenumber: 'phone',
  phone_number: 'phone',
  'phone number': 'phone',
  mobile: 'phone',
  cell: 'phone',
  email: 'email',
  emailaddress: 'email',
  email_address: 'email',
  'email address': 'email',
  groups: 'groups',
  group: 'groups',
  notes: 'notes',
  note: 'notes',
};

function normalizeColumnName(col: string): string | null {
  const key = col.trim().toLowerCase().replace(/[^a-z0-9_ ]/g, '');
  return COLUMN_MAP[key] || null;
}

export async function POST(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const defaultOptInStatus = (formData.get('defaultOptInStatus') as string) || 'pending';

    if (!file) {
      return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
    }

    // Validate opt-in status
    const validStatuses = ['opted_in', 'opted_out', 'pending'];
    if (!validStatuses.includes(defaultOptInStatus)) {
      return NextResponse.json({ error: 'Invalid opt-in status' }, { status: 400 });
    }

    const csvText = await file.text();

    if (!csvText.trim()) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Parse CSV
    let records: Record<string, string>[];
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
      });
    } catch (parseError: any) {
      return NextResponse.json(
        { error: `Failed to parse CSV: ${parseError?.message || 'Invalid format'}` },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json({ error: 'CSV file contains no data rows' }, { status: 400 });
    }

    // Map columns from the CSV headers
    const csvColumns = Object.keys(records[0] || {});
    const columnMapping: Record<string, string> = {};
    for (const col of csvColumns) {
      const mapped = normalizeColumnName(col);
      if (mapped) {
        columnMapping[col] = mapped;
      }
    }

    // Check that at least phone column is present
    const hasPhone = Object.values(columnMapping).includes('phone');
    if (!hasPhone) {
      return NextResponse.json(
        { error: 'CSV must contain a phone column (phone, phone_number, mobile, or cell)' },
        { status: 400 }
      );
    }

    // Get existing contacts for this church to check duplicates
    const existingContacts = await prisma.contact.findMany({
      where: { churchId },
      select: { phone: true },
    });
    const existingPhones = new Set(existingContacts.map((c) => c.phone));

    const imported: number[] = [];
    const skipped: number[] = [];
    const errors: string[] = [];
    const contactsToCreate: any[] = [];

    // Track phones in this batch to avoid duplicates within the CSV itself
    const batchPhones = new Set<string>();

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 because row 1 is headers, data starts at row 2

      // Map row data
      const mapped: Record<string, string> = {};
      for (const [csvCol, internalCol] of Object.entries(columnMapping)) {
        if (row[csvCol] !== undefined && row[csvCol] !== '') {
          mapped[internalCol] = row[csvCol];
        }
      }

      // Validate phone (required)
      if (!mapped.phone) {
        errors.push(`Row ${rowNum}: Missing phone number`);
        continue;
      }

      const formattedPhone = formatE164(mapped.phone);
      if (!isValidPhone(formattedPhone)) {
        errors.push(`Row ${rowNum}: Invalid phone number "${mapped.phone}"`);
        continue;
      }

      // Check for duplicate in existing contacts
      if (existingPhones.has(formattedPhone)) {
        skipped.push(rowNum);
        continue;
      }

      // Check for duplicate within this CSV batch
      if (batchPhones.has(formattedPhone)) {
        skipped.push(rowNum);
        continue;
      }

      batchPhones.add(formattedPhone);

      // Parse groups (comma-separated)
      const groupsList = mapped.groups
        ? mapped.groups.split(',').map((g) => g.trim()).filter(Boolean)
        : [];

      contactsToCreate.push({
        churchId,
        firstName: mapped.firstName || 'Unknown',
        lastName: mapped.lastName || null,
        phone: formattedPhone,
        email: mapped.email || null,
        groups: groupsList,
        tags: [],
        notes: mapped.notes || null,
        optInStatus: defaultOptInStatus,
        optInDate: defaultOptInStatus === 'opted_in' ? new Date() : null,
        source: 'csv_import',
      });
    }

    // Bulk create contacts
    let importedCount = 0;
    if (contactsToCreate.length > 0) {
      const result = await prisma.contact.createMany({
        data: contactsToCreate,
        skipDuplicates: true,
      });
      importedCount = result.count;
    }

    return NextResponse.json({
      imported: importedCount,
      skipped: skipped.length,
      errors,
      total: records.length,
    });
  } catch (error: any) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
