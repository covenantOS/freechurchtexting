import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Handle inbound SMS webhooks from Telnyx
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();

    // Telnyx sends webhook events wrapped in a data object
    const eventType = json?.data?.event_type;

    // Only process inbound message events
    if (eventType !== 'message.received') {
      return NextResponse.json({ status: 'ignored' });
    }

    const payload = json?.data?.payload;
    if (!payload) {
      return NextResponse.json({ status: 'no payload' });
    }

    const from = payload?.from?.phone_number || '';
    const to = payload?.to?.[0]?.phone_number || '';
    const body = payload?.text || '';
    const bodyLower = body.trim().toLowerCase();
    const messageSid = payload?.id || null;
    const mediaUrl = payload?.media?.[0]?.url || null;

    if (!from || !to) {
      return NextResponse.json({ status: 'missing from/to' });
    }

    // Find the church by phone number
    const church = await prisma.church.findFirst({
      where: { providerPhoneNumber: to },
    });

    if (!church) {
      return NextResponse.json({ status: 'no church found' });
    }

    // Find the contact
    const contact = await prisma.contact.findFirst({
      where: { churchId: church.id, phone: from },
    });

    // Store the inbound message (always, regardless of keyword)
    await prisma.inboundMessage.create({
      data: {
        churchId: church.id,
        contactId: contact?.id || null,
        from,
        to,
        body: body.trim(),
        mediaUrl,
        providerMessageSid: messageSid,
      },
    });

    let responseMessage = '';

    // Handle built-in keywords
    if (bodyLower === 'stop' || bodyLower === 'unsubscribe' || bodyLower === 'cancel' || bodyLower === 'end' || bodyLower === 'quit') {
      if (contact) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { optInStatus: 'opted_out', optOutDate: new Date() },
        });
      }
      responseMessage = `You have been unsubscribed from ${church.name} messages. Reply START to resubscribe.`;
    } else if (bodyLower === 'start' || bodyLower === 'subscribe' || bodyLower === 'yes') {
      if (contact) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { optInStatus: 'opted_in', optInDate: new Date() },
        });
      }
      responseMessage = `You have been subscribed to ${church.name} messages. Reply STOP to unsubscribe.`;
    } else if (bodyLower === 'help' || bodyLower === 'info') {
      responseMessage = `${church.name}: For help, visit ${church.website || 'our website'} or call ${church.phone || 'us'}. Reply STOP to unsubscribe.`;
    }

    // If no built-in keyword matched, check for custom auto-replies
    if (!responseMessage) {
      const autoReply = await prisma.autoReply.findFirst({
        where: {
          churchId: church.id,
          keyword: bodyLower,
          isActive: true,
        },
      });

      if (autoReply) {
        responseMessage = autoReply.response;
      }
    }

    // If we have a response, send it via Telnyx API
    if (responseMessage && church.providerAccountSid) {
      try {
        const { decrypt } = await import('@/lib/encryption');
        const apiKey = decrypt(church.providerAccountSid);

        await fetch('https://api.telnyx.com/v2/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: to,
            to: from,
            text: responseMessage,
          }),
        });
      } catch (sendError) {
        console.error('Telnyx auto-reply send error:', sendError);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Telnyx webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
