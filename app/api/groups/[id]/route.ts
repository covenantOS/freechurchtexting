import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

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

    if (body?.name !== undefined) updateData.name = body.name;
    if (body?.description !== undefined) updateData.description = body.description || null;
    if (body?.color !== undefined) updateData.color = body.color;

    await prisma.group.updateMany({
      where: {
        id: params?.id,
        churchId,
      },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update group error:', error);
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

    await prisma.group.deleteMany({
      where: {
        id: params?.id,
        churchId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete group error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
