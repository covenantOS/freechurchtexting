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
    const updateData: Record<string, unknown> = {};

    if (body?.keyword !== undefined) {
      const normalizedKeyword = body.keyword.trim().toLowerCase();

      // Check for reserved keywords
      const reserved = ['stop', 'unsubscribe', 'cancel', 'end', 'quit', 'start', 'subscribe', 'yes', 'help', 'info'];
      if (reserved.includes(normalizedKeyword)) {
        return NextResponse.json(
          { error: `"${body.keyword}" is a reserved keyword and cannot be used for auto-replies` },
          { status: 400 }
        );
      }

      updateData.keyword = normalizedKeyword;
    }
    if (body?.response !== undefined) {
      updateData.response = body.response.trim();
    }
    if (body?.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }

    const result = await prisma.autoReply.updateMany({
      where: {
        id: params.id,
        churchId,
      },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Auto-reply not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An auto-reply with this keyword already exists' },
        { status: 400 }
      );
    }
    console.error('Update auto-reply error:', error);
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

    const result = await prisma.autoReply.deleteMany({
      where: {
        id: params.id,
        churchId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Auto-reply not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete auto-reply error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
