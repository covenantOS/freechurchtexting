import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Cancel a scheduled message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the scheduled message
    const scheduledMessage = await prisma.scheduledMessage.findUnique({
      where: { id },
    });

    if (!scheduledMessage) {
      return NextResponse.json(
        { error: 'Scheduled message not found' },
        { status: 404 }
      );
    }

    if (scheduledMessage.churchId !== session.user.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Can only cancel pending messages
    if (scheduledMessage.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending scheduled messages' },
        { status: 400 }
      );
    }

    // Update status to cancelled
    await prisma.scheduledMessage.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel scheduled message error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled message' },
      { status: 500 }
    );
  }
}

// Update a scheduled message
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { body: messageBody, scheduledFor, recipientGroupId } = body || {};

    // Find the scheduled message
    const scheduledMessage = await prisma.scheduledMessage.findUnique({
      where: { id },
    });

    if (!scheduledMessage) {
      return NextResponse.json(
        { error: 'Scheduled message not found' },
        { status: 404 }
      );
    }

    if (scheduledMessage.churchId !== session.user.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Can only edit pending messages
    if (scheduledMessage.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only edit pending scheduled messages' },
        { status: 400 }
      );
    }

    // Validate scheduled time if provided
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.scheduledMessage.update({
      where: { id },
      data: {
        ...(messageBody && { body: messageBody }),
        ...(scheduledFor && { scheduledFor: new Date(scheduledFor) }),
        ...(recipientGroupId !== undefined && { recipientGroupId }),
      },
      include: {
        sender: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ scheduledMessage: updated });
  } catch (error: any) {
    console.error('Update scheduled message error:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled message' },
      { status: 500 }
    );
  }
}
