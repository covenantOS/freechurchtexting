import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { formatE164, isValidPhone } from '@/lib/phone';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const contacts = await prisma.contact.findMany({
      where: { churchId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ contacts });
  } catch (error: any) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, email, groups, notes, optInStatus, tags } = body || {};

    if (!firstName || !phone) {
      return NextResponse.json(
        { error: 'First name and phone are required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatE164(phone);
    if (!isValidPhone(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.contact.findUnique({
      where: {
        churchId_phone: {
          churchId,
          phone: formattedPhone,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A contact with this phone number already exists' },
        { status: 400 }
      );
    }

    const validStatuses = ['opted_in', 'opted_out', 'pending'];
    const resolvedStatus = validStatuses.includes(optInStatus) ? optInStatus : 'pending';

    const contact = await prisma.contact.create({
      data: {
        churchId,
        firstName,
        lastName: lastName || null,
        phone: formattedPhone,
        email: email || null,
        groups: groups || [],
        tags: tags || [],
        notes: notes || null,
        optInStatus: resolvedStatus,
        optInDate: resolvedStatus === 'opted_in' ? new Date() : null,
        source: 'manual',
      },
    });

    return NextResponse.json({ contact });
  } catch (error: any) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
