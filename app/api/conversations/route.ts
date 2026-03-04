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

    // 1. Get all contacts who have exchanged messages with the church
    //    We need to combine: contacts with outbound messages AND contacts/phones with inbound messages

    // Get contacts with outbound messages (via MessageRecipient)
    const outboundRecipients = await prisma.messageRecipient.findMany({
      where: {
        message: { churchId },
      },
      select: {
        contactId: true,
        sentAt: true,
        message: {
          select: {
            body: true,
            createdAt: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    // Also get individual (non-blast) messages that used recipientContactId
    const directOutbound = await prisma.message.findMany({
      where: {
        churchId,
        recipientContactId: { not: null },
        type: { in: ['individual', 'imessage'] },
      },
      select: {
        id: true,
        recipientContactId: true,
        body: true,
        createdAt: true,
        sentAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get inbound messages
    const inboundMessages = await prisma.inboundMessage.findMany({
      where: { churchId },
      select: {
        id: true,
        contactId: true,
        from: true,
        body: true,
        createdAt: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build a map of conversations keyed by contactId or phone number
    const conversationsMap = new Map<string, {
      contactId: string | null;
      contactName: string;
      phone: string;
      lastMessage: string;
      lastMessageAt: string;
      lastDirection: 'inbound' | 'outbound';
      hasInbound: boolean;
    }>();

    // Process inbound messages
    for (const msg of inboundMessages) {
      const key = msg.contactId || `phone:${msg.from}`;
      const existing = conversationsMap.get(key);
      const msgTime = msg.createdAt.toISOString();

      if (!existing || msgTime > existing.lastMessageAt) {
        conversationsMap.set(key, {
          contactId: msg.contactId,
          contactName: msg.contact
            ? `${msg.contact.firstName}${msg.contact.lastName ? ' ' + msg.contact.lastName : ''}`
            : '',
          phone: msg.contact?.phone || msg.from,
          lastMessage: msg.body,
          lastMessageAt: msgTime,
          lastDirection: 'inbound',
          hasInbound: true,
        });
      } else if (!existing.hasInbound) {
        existing.hasInbound = true;
      }
    }

    // Process outbound recipient messages
    for (const mr of outboundRecipients) {
      if (!mr.contact) continue;
      const key = mr.contactId;
      const existing = conversationsMap.get(key);
      const msgTime = (mr.sentAt || mr.message.createdAt).toISOString();

      if (!existing || msgTime > existing.lastMessageAt) {
        conversationsMap.set(key, {
          contactId: mr.contactId,
          contactName: `${mr.contact.firstName}${mr.contact.lastName ? ' ' + mr.contact.lastName : ''}`,
          phone: mr.contact.phone,
          lastMessage: mr.message.body,
          lastMessageAt: msgTime,
          lastDirection: 'outbound',
          hasInbound: existing?.hasInbound || false,
        });
      }
    }

    // Process direct outbound messages
    for (const msg of directOutbound) {
      if (!msg.recipientContactId) continue;
      const key = msg.recipientContactId;
      const existing = conversationsMap.get(key);
      const msgTime = (msg.sentAt || msg.createdAt).toISOString();

      if (!existing) {
        // We need contact info - look it up
        const contact = await prisma.contact.findUnique({
          where: { id: msg.recipientContactId },
          select: { id: true, firstName: true, lastName: true, phone: true },
        });
        if (contact) {
          conversationsMap.set(key, {
            contactId: contact.id,
            contactName: `${contact.firstName}${contact.lastName ? ' ' + contact.lastName : ''}`,
            phone: contact.phone,
            lastMessage: msg.body,
            lastMessageAt: msgTime,
            lastDirection: 'outbound',
            hasInbound: false,
          });
        }
      } else if (msgTime > existing.lastMessageAt) {
        conversationsMap.set(key, {
          ...existing,
          lastMessage: msg.body,
          lastMessageAt: msgTime,
          lastDirection: 'outbound',
        });
      }
    }

    // Convert to array and sort by most recent message
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
