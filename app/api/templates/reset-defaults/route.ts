import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveChurchId } from '@/lib/api-helpers';
import { DEFAULT_TEMPLATES } from '@/lib/default-templates';

export const dynamic = 'force-dynamic';

/**
 * POST /api/templates/reset-defaults
 * Re-creates any missing default templates for the current church.
 * Does NOT delete or overwrite user-modified templates.
 */
export async function POST(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    // Get existing template names for this church
    const existing = await prisma.template.findMany({
      where: { churchId },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((t) => t.name));

    // Find which default templates are missing
    const missing = DEFAULT_TEMPLATES.filter((t) => !existingNames.has(t.name));

    if (missing.length === 0) {
      return NextResponse.json({ restored: 0, message: 'All default templates already exist.' });
    }

    // Create missing templates
    await prisma.template.createMany({
      data: missing.map((t) => ({
        churchId,
        name: t.name,
        body: t.body,
        category: t.category,
      })),
    });

    return NextResponse.json({
      restored: missing.length,
      message: `Restored ${missing.length} default template${missing.length !== 1 ? 's' : ''}.`,
    });
  } catch (error: any) {
    console.error('Reset defaults error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
