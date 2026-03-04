import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEffectiveChurchId } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const { churchId, error } = await getEffectiveChurchId(request);
    if (error || !churchId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const contactId = params.contactId;

    // Check if this is a phone-number-based lookup (for unknown contacts)
    const isPhoneLookup = contactId.startsWith('phone:');
    const phoneNumber = isPhoneLookup ? decodeURIComponent(contactId.replace('phone:', '')) : null;

    let contact: { id: string; firstName: string; lastName: string | null; phone: string } | null = null;

    if (isPhoneLookup) {
      // Try to find a contact by phone
      contact = await prisma.contact.findFirst({
        where: { churchId, phone: phoneNumber! },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });
    } else {
      // Look up contact by ID
      contact = await prisma.contact.findFirst({
        where: { id: contactId, churchId },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });
    }

    const effectivePhone = contact?.phone || phoneNumber || '';
    const effectiveContactId = contact?.id || null;

    // Get inbound messages
    let inboundMessages;
    if (effectiveContactId) {
      inboundMessages = await prisma.inboundMessage.findMany({
        where: {
          churchId,
          OR: [
            { contactId: effectiveContactId },
            { from: effectivePhone, contactId: null },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: 200,
      });
    } else {
      inboundMessages = await prisma.inboundMessage.findMany({
        where: {
          churchId,
          from: effectivePhone,
          contactId: null,
        },
        orderBy: { createdAt: 'asc' },
        take: 200,
      });
    }

    // Get outbound messages to this contact
    let outboundMessages: Array<{
      id: string;
      body: string;
      status: string;
      timestamp: Date;
    }> = [];

    if (effectiveContactId) {
      // Get messages sent directly to this contact (individual messages)
      const directMessages = await prisma.message.findMany({
        where: {
          churchId,
          recipientContactId: effectiveContactId,
          type: { in: ['individual', 'imessage'] },
        },
        select: {
          id: true,
          body: true,
          status: true,
          sentAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 200,
      });

      // Get messages this contact received as part of a group/blast
      const recipientMessages = await prisma.messageRecipient.findMany({
        where: {
          contactId: effectiveContactId,
          message: { churchId },
        },
        select: {
          id: true,
          status: true,
          sentAt: true,
          message: {
            select: {
              id: true,
              body: true,
              createdAt: true,
            },
          },
        },
        orderBy: { sentAt: 'asc' },
        take: 200,
      });

      // Combine outbound messages, avoiding duplicates
      const seenMessageIds = new Set<string>();

      for (const msg of directMessages) {
        seenMessageIds.add(msg.id);
        outboundMessages.push({
          id: msg.id,
          body: msg.body,
          status: msg.status,
          timestamp: msg.sentAt || msg.createdAt,
        });
      }

      for (const mr of recipientMessages) {
        if (!seenMessageIds.has(mr.message.id)) {
          seenMessageIds.add(mr.message.id);
          outboundMessages.push({
            id: mr.id,
            body: mr.message.body,
            status: mr.status,
            timestamp: mr.sentAt || mr.message.createdAt,
          });
        }
      }
    }

    // Interleave and sort by timestamp
    const timeline = [
      ...inboundMessages.map((msg) => ({
        id: msg.id,
        direction: 'inbound' as const,
        body: msg.body,
        timestamp: msg.createdAt.toISOString(),
        status: 'received' as string,
        mediaUrl: msg.mediaUrl,
      })),
      ...outboundMessages.map((msg) => ({
        id: msg.id,
        direction: 'outbound' as const,
        body: msg.body,
        timestamp: msg.timestamp.toISOString(),
        status: msg.status,
        mediaUrl: null as string | null,
      })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({
      contact: contact
        ? {
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.phone,
          }
        : {
            id: null,
            firstName: effectivePhone,
            lastName: null,
            phone: effectivePhone,
          },
      messages: timeline,
    });
  } catch (error: any) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
