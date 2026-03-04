import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get detailed church info with users and counts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const churchId = params.id;

    const church = await prisma.church.findUnique({
      where: { id: churchId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isSuperAdmin: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            contacts: true,
            messages: true,
            templates: true,
            groups: true,
            scheduledMessages: true,
            autoReplies: true,
            inboundMessages: true,
          },
        },
      },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    // Get the last message date
    const lastMessage = await prisma.message.findFirst({
      where: { churchId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Get the last inbound message date
    const lastInbound = await prisma.inboundMessage.findFirst({
      where: { churchId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return NextResponse.json({
      ...church,
      lastMessageAt: lastMessage?.createdAt || null,
      lastInboundAt: lastInbound?.createdAt || null,
    });
  } catch (error: any) {
    console.error('Admin get church error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
