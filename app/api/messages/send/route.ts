import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { sendSMS } from '@/lib/twilio-client';
import { calculateSegments } from '@/lib/sms-calculator';
import { getEffectiveChurchId } from '@/lib/api-helpers';
import { processSpintax } from '@/lib/spintax';
import { SendingMode } from '@prisma/client';
import { isDemoChurch, simulateSMSResult } from '@/lib/demo';

export const dynamic = 'force-dynamic';

function replaceMergeTags(
  body: string,
  contact: { firstName: string; lastName?: string | null },
  church?: { name: string; phone?: string | null; website?: string | null }
): string {
  let result = body || '';
  result = result.replace(/{first_name}/gi, contact?.firstName || '');
  result = result.replace(/{last_name}/gi, contact?.lastName || '');
  if (church) {
    result = result.replace(/{church_name}/gi, church.name || '');
    result = result.replace(/{church_phone}/gi, church.phone || '');
    result = result.replace(/{church_website}/gi, church.website || '');
  }
  return result;
}

// Simulated iMessage/RCS sending (in production, this would integrate with Apple/Google APIs)
async function sendIMessageRCS(phone: string, body: string): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  // Simulate successful send with 95% success rate and random delivery channel
  const success = Math.random() > 0.05;
  if (success) {
    return {
      success: true,
      messageSid: `imsg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
  return { success: false, error: 'Failed to deliver via iMessage/RCS' };
}

export async function POST(request: NextRequest) {
  try {
    const { churchId, userId, error } = await getEffectiveChurchId(request);
    if (error || !churchId || !userId) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      recipientContactId,
      recipientGroupId,
      sendToAll,
      body: messageBody,
      sendingMode: rawSendingMode,
      dripIntervalSeconds,
      randomMinSeconds,
      randomMaxSeconds,
    } = body || {};

    if (!messageBody) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    // Validate and default the sending mode
    const sendingMode: SendingMode =
      rawSendingMode === 'drip' || rawSendingMode === 'random' ? rawSendingMode : 'instant';

    // Validate drip/random params
    if (sendingMode === 'drip') {
      if (!dripIntervalSeconds || dripIntervalSeconds < 1) {
        return NextResponse.json(
          { error: 'Drip interval must be at least 1 second' },
          { status: 400 }
        );
      }
    }
    if (sendingMode === 'random') {
      if (!randomMinSeconds || !randomMaxSeconds || randomMinSeconds < 1 || randomMaxSeconds < randomMinSeconds) {
        return NextResponse.json(
          { error: 'Random mode requires valid min and max seconds (min >= 1, max >= min)' },
          { status: 400 }
        );
      }
    }

    // Get church with subscription info
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    // Check if Blue tier (uses iMessage/RCS instead of Twilio)
    const isBlue = church.subscriptionTier === 'blue_shared' || church.subscriptionTier === 'blue_dedicated';

    // Check if this is a demo church (simulates SMS without actually sending)
    const isDemo = isDemoChurch(churchId);

    // For non-Blue, non-demo users, require Twilio configuration
    let accountSid = '';
    let authToken = '';
    let fromNumber = '';
    let messagingServiceSid: string | null = null;

    if (!isBlue && !isDemo) {
      if (!church?.providerAccountSid || !church?.providerAuthToken || !church?.providerPhoneNumber) {
        return NextResponse.json(
          { error: 'SMS provider is not configured. Please complete setup in Settings.' },
          { status: 400 }
        );
      }
      accountSid = decrypt(church.providerAccountSid);
      authToken = decrypt(church.providerAuthToken);
      fromNumber = church.providerPhoneNumber;
      messagingServiceSid = church.providerMessagingServiceSid;
    }

    const segmentInfo = calculateSegments(messageBody);

    // Individual message
    if (type === 'individual' && recipientContactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: recipientContactId, churchId },
      });

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }

      // Apply spintax BEFORE merge tags so each recipient gets a unique variation
      const spintaxBody = processSpintax(messageBody);
      const personalizedBody = replaceMergeTags(spintaxBody, contact, church);

      // Use demo simulation, iMessage/RCS for Blue tier, or SMS for free tier
      let result;
      if (isDemo) {
        const demoResult = simulateSMSResult();
        result = { success: demoResult.success, messageSid: demoResult.messageSid || undefined, error: demoResult.success ? undefined : 'Demo: simulated failure' };
      } else if (isBlue) {
        result = await sendIMessageRCS(contact.phone, personalizedBody);
      } else {
        result = await sendSMS(
          accountSid,
          authToken,
          contact.phone,
          personalizedBody,
          fromNumber,
          messagingServiceSid || undefined
        );
      }

      const message = await prisma.message.create({
        data: {
          churchId,
          senderUserId: userId,
          type: isBlue ? 'imessage' : 'individual',
          recipientContactId,
          body: messageBody,
          status: result?.success ? 'sent' : 'failed',
          sentAt: result?.success ? new Date() : null,
          providerMessageSid: result?.messageSid || null,
          segmentsUsed: isBlue ? 0 : (segmentInfo?.segments || 1),
          totalRecipients: 1,
          errorMessage: result?.error || null,
          sendingMode: 'instant',
        },
      });

      return NextResponse.json({
        success: result?.success,
        message,
        channel: isBlue ? 'iMessage/RCS' : 'SMS'
      });
    }

    // Blast message
    let recipients: { id: string; firstName: string; lastName?: string | null; phone: string }[] = [];

    if (sendToAll) {
      recipients = await prisma.contact.findMany({
        where: {
          churchId,
          optInStatus: 'opted_in',
        },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });
    } else if (recipientGroupId) {
      // Get the group to check its name (for legacy contacts with group names)
      const group = await prisma.group.findUnique({
        where: { id: recipientGroupId },
        select: { name: true },
      });

      const allContacts = await prisma.contact.findMany({
        where: {
          churchId,
          optInStatus: 'opted_in',
        },
        select: { id: true, firstName: true, lastName: true, phone: true, groups: true },
      });

      recipients = allContacts?.filter?.((c) => {
        const groups = c?.groups as string[] || [];
        // Check for both group ID and group name (legacy support)
        return groups?.includes?.(recipientGroupId) || (group?.name && groups?.includes?.(group.name));
      })?.map?.((c) => ({
        id: c?.id,
        firstName: c?.firstName,
        lastName: c?.lastName,
        phone: c?.phone,
      })) ?? [];
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'No opted-in recipients found' }, { status: 400 });
    }

    // Create the blast message record with sending mode fields
    const message = await prisma.message.create({
      data: {
        churchId,
        senderUserId: userId,
        type: isBlue ? 'imessage_blast' : 'blast',
        recipientGroupId: recipientGroupId || null,
        body: messageBody,
        status: 'sending',
        segmentsUsed: isBlue ? 0 : (segmentInfo?.segments || 1),
        totalRecipients: recipients?.length || 0,
        sendingMode,
        dripIntervalSeconds: sendingMode === 'drip' ? dripIntervalSeconds : null,
        randomMinSeconds: sendingMode === 'random' ? randomMinSeconds : null,
        randomMaxSeconds: sendingMode === 'random' ? randomMaxSeconds : null,
      },
    });

    // --- DRIP or RANDOM mode: queue recipients with scheduled send times ---
    if (sendingMode === 'drip' || sendingMode === 'random') {
      const now = new Date();
      let cumulativeOffsetMs = 0;

      for (let i = 0; i < recipients.length; i++) {
        let scheduledSendAt: Date;

        if (i === 0) {
          // First recipient sends immediately
          scheduledSendAt = now;
        } else if (sendingMode === 'drip') {
          cumulativeOffsetMs = i * dripIntervalSeconds * 1000;
          scheduledSendAt = new Date(now.getTime() + cumulativeOffsetMs);
        } else {
          // random mode: add a random interval since the last message
          const randomDelay =
            (randomMinSeconds + Math.random() * (randomMaxSeconds - randomMinSeconds)) * 1000;
          cumulativeOffsetMs += randomDelay;
          scheduledSendAt = new Date(now.getTime() + cumulativeOffsetMs);
        }

        await prisma.messageRecipient.create({
          data: {
            messageId: message.id,
            contactId: recipients[i].id,
            status: 'queued',
            scheduledSendAt,
          },
        });
      }

      // Return immediately -- the cron job will process queued recipients
      return NextResponse.json({
        success: true,
        message,
        stats: { queued: recipients.length },
        sendingMode,
        channel: isBlue ? 'iMessage/RCS' : 'SMS',
      });
    }

    // --- INSTANT mode: send immediately (existing behavior) ---
    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      // Apply spintax per-recipient so each gets a different variation
      const spintaxBody = processSpintax(messageBody);
      const personalizedBody = replaceMergeTags(spintaxBody, recipient, church);

      // Use demo simulation, iMessage/RCS for Blue tier, or SMS for free tier
      let result;
      if (isDemo) {
        const demoResult = simulateSMSResult();
        result = { success: demoResult.success, messageSid: demoResult.messageSid || undefined, error: demoResult.success ? undefined : 'Demo: simulated failure' };
      } else if (isBlue) {
        result = await sendIMessageRCS(recipient?.phone || '', personalizedBody);
      } else {
        result = await sendSMS(
          accountSid,
          authToken,
          recipient?.phone || '',
          personalizedBody,
          fromNumber,
          messagingServiceSid || undefined
        );
      }

      await prisma.messageRecipient.create({
        data: {
          messageId: message.id,
          contactId: recipient?.id || '',
          status: result?.success ? 'sent' : 'failed',
          providerMessageSid: result?.messageSid || null,
          errorMessage: result?.error || null,
          sentAt: result?.success ? new Date() : null,
        },
      });

      if (result?.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Update message status
    await prisma.message.update({
      where: { id: message.id },
      data: {
        status: failCount === recipients.length ? 'failed' : 'sent',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message,
      stats: { sent: successCount, failed: failCount },
      channel: isBlue ? 'iMessage/RCS' : 'SMS'
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
