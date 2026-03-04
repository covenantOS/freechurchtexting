import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

    const contactId = params.id;

    // Verify contact belongs to church
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        churchId,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get messages sent directly to this contact (individual messages)
    const directMessages = await prisma.message.findMany({
      where: {
        churchId,
        recipientContactId: contactId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get messages this contact received as part of a group/blast
    const recipientMessages = await prisma.messageRecipient.findMany({
      where: {
        contactId: contactId,
        message: {
          churchId,
        },
      },
      orderBy: { sentAt: 'desc' },
      take: 50,
      include: {
        message: {
          include: {
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Combine and format messages
    const allMessages = [
      ...directMessages.map((msg) => ({
        id: msg.id,
        body: msg.body,
        type: msg.type,
        status: msg.status,
        sentAt: msg.sentAt || msg.createdAt,
        senderName: msg.sender.name,
        isBlast: false,
      })),
      ...recipientMessages
        .filter((mr) => !directMessages.some((dm) => dm.id === mr.messageId)) // Avoid duplicates
        .map((mr) => ({
          id: mr.message.id,
          body: mr.message.body,
          type: mr.message.type,
          status: mr.status,
          sentAt: mr.sentAt || mr.message.createdAt,
          senderName: mr.message.sender.name,
          isBlast: mr.message.type === 'blast' || mr.message.type === 'imessage_blast',
        })),
    ].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    return NextResponse.json({ messages: allMessages.slice(0, 50) });
  } catch (error: any) {
    console.error('Get contact messages error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
