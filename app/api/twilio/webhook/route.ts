import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function validateTwilioSignature(authToken: string, url: string, params: Record<string, string>, signature: string): boolean {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }
  const expected = crypto.createHmac('sha1', authToken).update(data).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// Handle inbound SMS webhooks from Twilio
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = formData?.get?.('Body')?.toString?.()?.trim?.() || '';
    const bodyLower = body.toLowerCase();
    const from = formData?.get?.('From')?.toString?.() || '';
    const to = formData?.get?.('To')?.toString?.() || '';
    const messageSid = formData?.get?.('MessageSid')?.toString?.() || null;
    const numMedia = parseInt(formData?.get?.('NumMedia')?.toString?.() || '0', 10);
    const mediaUrl = numMedia > 0 ? formData?.get?.('MediaUrl0')?.toString?.() || null : null;

    if (!from || !to) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Find the church by phone number
    const church = await prisma.church.findFirst({
      where: { providerPhoneNumber: to },
    });

    if (!church) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Validate Twilio webhook signature (skip in development)
    if (process.env.NODE_ENV !== 'development' && church.providerAuthToken) {
      const twilioSignature = request.headers.get('X-Twilio-Signature') || '';
      const webhookUrl = request.url;
      const authToken = decrypt(church.providerAuthToken);

      // Build params from form data
      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });

      if (!validateTwilioSignature(authToken, webhookUrl, params, twilioSignature)) {
        console.error('Twilio webhook signature validation failed');
        return new NextResponse('Forbidden', { status: 403 });
      }
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
        body,
        mediaUrl,
        providerMessageSid: messageSid,
      },
    });

    let responseMessage = '';

    // Handle built-in keywords
    if (bodyLower === 'stop' || bodyLower === 'unsubscribe' || bodyLower === 'cancel' || bodyLower === 'end' || bodyLower === 'quit') {
      // Opt out
      if (contact) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { optInStatus: 'opted_out', optOutDate: new Date() },
        });
      }
      responseMessage = `You have been unsubscribed from ${church.name} messages. Reply START to resubscribe.`;
    } else if (bodyLower === 'start' || bodyLower === 'subscribe' || bodyLower === 'yes') {
      // Opt in
      if (contact) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { optInStatus: 'opted_in', optInDate: new Date() },
        });
      }
      responseMessage = `You have been subscribed to ${church.name} messages. Reply STOP to unsubscribe.`;
    } else if (bodyLower === 'help' || bodyLower === 'info') {
      // Help
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

    if (responseMessage) {
      // Escape XML special characters in the response
      const escapedMessage = responseMessage
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapedMessage}</Message></Response>`,
        { headers: { 'Content-Type': 'text/xml' } }
      );
    }

    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('Twilio webhook error:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
