import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      where: { churchId },
      orderBy: { name: 'asc' },
    });

    // Count members for each group
    const contacts = await prisma.contact.findMany({
      where: { churchId },
      select: { groups: true },
    });

    const groupsWithCounts = groups?.map?.((group) => ({
      ...group,
      memberCount: contacts?.filter?.((c) => {
        const contactGroups = c?.groups as string[] || [];
        // Support both group ID and group name (for legacy data)
        return contactGroups?.includes?.(group?.id || '') || contactGroups?.includes?.(group?.name || '');
      })?.length ?? 0,
    }));

    return NextResponse.json({ groups: groupsWithCounts });
  } catch (error: any) {
    console.error('Get groups error:', error);
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
    const { name, description, color } = body || {};

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        churchId,
        name,
        description: description || null,
        color: color || '#3B82F6',
      },
    });

    return NextResponse.json({ group });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A group with this name already exists' },
        { status: 400 }
      );
    }
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
