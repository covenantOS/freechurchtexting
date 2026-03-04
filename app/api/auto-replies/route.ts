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

    const autoReplies = await prisma.autoReply.findMany({
      where: { churchId },
      orderBy: { keyword: 'asc' },
    });

    return NextResponse.json({ autoReplies });
  } catch (error: any) {
    console.error('Get auto-replies error:', error);
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
    const { keyword, response, isActive } = body || {};

    if (!keyword || !response) {
      return NextResponse.json(
        { error: 'Keyword and response are required' },
        { status: 400 }
      );
    }

    const normalizedKeyword = keyword.trim().toLowerCase();

    // Check for reserved keywords
    const reserved = ['stop', 'unsubscribe', 'cancel', 'end', 'quit', 'start', 'subscribe', 'yes', 'help', 'info'];
    if (reserved.includes(normalizedKeyword)) {
      return NextResponse.json(
        { error: `"${keyword}" is a reserved keyword and cannot be used for auto-replies` },
        { status: 400 }
      );
    }

    const autoReply = await prisma.autoReply.create({
      data: {
        churchId,
        keyword: normalizedKeyword,
        response: response.trim(),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ autoReply });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An auto-reply with this keyword already exists' },
        { status: 400 }
      );
    }
    console.error('Create auto-reply error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
