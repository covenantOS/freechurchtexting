import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatE164 } from '@/lib/phone';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id: params?.id,
        churchId,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ contact });
  } catch (error: any) {
    console.error('Get contact error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: any = {};

    if (body?.firstName !== undefined) updateData.firstName = body.firstName;
    if (body?.lastName !== undefined) updateData.lastName = body.lastName || null;
    if (body?.phone !== undefined) updateData.phone = formatE164(body.phone);
    if (body?.email !== undefined) updateData.email = body.email || null;
    if (body?.groups !== undefined) updateData.groups = body.groups;
    if (body?.tags !== undefined) updateData.tags = body.tags;
    if (body?.notes !== undefined) updateData.notes = body.notes || null;
    if (body?.optInStatus !== undefined) updateData.optInStatus = body.optInStatus;

    const contact = await prisma.contact.updateMany({
      where: {
        id: params?.id,
        churchId,
      },
      data: updateData,
    });

    if (contact.count === 0) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    await prisma.contact.deleteMany({
      where: {
        id: params?.id,
        churchId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
