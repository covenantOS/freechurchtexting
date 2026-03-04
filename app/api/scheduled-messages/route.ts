import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// Get all scheduled messages for the church
export async function GET(request: NextRequest) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const scheduledMessages = await prisma.scheduledMessage.findMany({
      where: {
        churchId,
      },
      include: {
        sender: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    return NextResponse.json({ scheduledMessages });
  } catch (error: any) {
    console.error('Get scheduled messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled messages' },
      { status: 500 }
    );
  }
}

// Create a new scheduled message
export async function POST(request: NextRequest) {
  try {
    const { churchId, userId, error } = await getEffectiveChurchId(request);
    if (error || !churchId || !userId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, recipientGroupId, body: messageBody, scheduledFor, timezone } = body || {};

    if (!type || !messageBody || !scheduledFor) {
      return NextResponse.json(
        { error: 'Message type, body, and scheduled time are required' },
        { status: 400 }
      );
    }

    if (type === 'blast' && !recipientGroupId) {
      return NextResponse.json(
        { error: 'Recipient group is required for blast messages' },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Get church timezone if not provided
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { timezone: true },
    });

    const scheduledMessage = await prisma.scheduledMessage.create({
      data: {
        churchId,
        senderUserId: userId,
        type,
        recipientGroupId: recipientGroupId || null,
        body: messageBody,
        scheduledFor: scheduledDate,
        timezone: timezone || church?.timezone || 'America/New_York',
      },
      include: {
        sender: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ scheduledMessage });
  } catch (error: any) {
    console.error('Create scheduled message error:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled message' },
      { status: 500 }
    );
  }
}
