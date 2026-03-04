import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, contactIds, tag, groupId } = body || {};

    if (!action || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'action and contactIds are required' },
        { status: 400 }
      );
    }

    // Verify all contacts belong to this church
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        churchId,
      },
    });

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No matching contacts found' }, { status: 404 });
    }

    if (action === 'add_tag') {
      if (!tag || typeof tag !== 'string') {
        return NextResponse.json({ error: 'tag is required for add_tag action' }, { status: 400 });
      }
      const trimmedTag = tag.trim();
      let updated = 0;
      for (const contact of contacts) {
        const existingTags = Array.isArray(contact.tags) ? (contact.tags as string[]) : [];
        if (!existingTags.includes(trimmedTag)) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { tags: [...existingTags, trimmedTag] },
          });
          updated++;
        }
      }
      return NextResponse.json({ success: true, updated });
    }

    if (action === 'add_to_group') {
      if (!groupId || typeof groupId !== 'string') {
        return NextResponse.json({ error: 'groupId is required for add_to_group action' }, { status: 400 });
      }
      // Verify group belongs to this church
      const group = await prisma.group.findFirst({
        where: { id: groupId, churchId },
      });
      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }
      let updated = 0;
      for (const contact of contacts) {
        const existingGroups = Array.isArray(contact.groups) ? (contact.groups as string[]) : [];
        if (!existingGroups.includes(groupId)) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { groups: [...existingGroups, groupId] },
          });
          updated++;
        }
      }
      return NextResponse.json({ success: true, updated });
    }

    if (action === 'delete') {
      const result = await prisma.contact.deleteMany({
        where: {
          id: { in: contactIds },
          churchId,
        },
      });
      return NextResponse.json({ success: true, deleted: result.count });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk contacts error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
