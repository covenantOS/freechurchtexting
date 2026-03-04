import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { sendSMS } from '@/lib/twilio-client';
import { calculateSegments } from '@/lib/sms-calculator';
import { sendEmail, getScheduledMessageReminderHtml } from '@/lib/email';
import { processSpintax } from '@/lib/spintax';

export const dynamic = 'force-dynamic';

// Simulated iMessage/RCS sending for Blue tier
async function sendIMessageRCS(phone: string, body: string): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const success = Math.random() > 0.05;
  if (success) {
    return {
      success: true,
      messageSid: `imsg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
  return { success: false, error: 'Failed to deliver via iMessage/RCS' };
}

function replaceMergeTags(
  body: string,
  contact: { firstName: string; lastName?: string | null },
  church: { name: string; phone?: string | null; website?: string | null }
): string {
  let result = body || '';
  result = result.replace(/{first_name}/gi, contact.firstName || '');
  result = result.replace(/{last_name}/gi, contact.lastName || '');
  result = result.replace(/{church_name}/gi, church.name || '');
  result = result.replace(/{church_phone}/gi, church.phone || '');
  result = result.replace(/{church_website}/gi, church.website || '');
  return result;
}

// This endpoint should be called by a cron job every minute
export async function GET(request: NextRequest) {
  try {
    // Authenticate cron requests via Authorization header or query param
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('Authorization') || '';
      const { searchParams } = new URL(request.url);
      const secret = searchParams.get('secret');
      const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

      if (bearerToken !== cronSecret && secret !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();
    const results: Array<{ id: string; status: string; sent?: number; failed?: number; error?: string }> = [];

    // =========================================================================
    // SECTION 1: Process scheduled messages (existing behavior)
    // =========================================================================
    const pendingMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: 'pending',
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        church: true,
        sender: true,
      },
    });

    for (const scheduledMsg of pendingMessages) {
      try {
        // Mark as processing
        await prisma.scheduledMessage.update({
          where: { id: scheduledMsg.id },
          data: { status: 'processing' },
        });

        const church = scheduledMsg.church;
        const isBlue = church.subscriptionTier === 'blue_shared' || church.subscriptionTier === 'blue_dedicated';

        // For non-Blue users, require provider configuration
        let accountSid = '';
        let authToken = '';
        let fromNumber = '';
        let messagingServiceSid: string | null = null;

        if (!isBlue) {
          if (!church.providerAccountSid || !church.providerAuthToken || !church.providerPhoneNumber) {
            throw new Error('Church missing provider configuration');
          }
          accountSid = decrypt(church.providerAccountSid);
          authToken = decrypt(church.providerAuthToken);
          fromNumber = church.providerPhoneNumber;
          messagingServiceSid = church.providerMessagingServiceSid;
        }

        // Get recipients
        type ContactType = Awaited<ReturnType<typeof prisma.contact.findMany>>[number];
        let contacts: ContactType[] = [];

        if (scheduledMsg.type === 'blast' || scheduledMsg.type === 'imessage_blast') {
          if (scheduledMsg.recipientGroupId === 'all-opted-in' || !scheduledMsg.recipientGroupId) {
            contacts = await prisma.contact.findMany({
              where: {
                churchId: church.id,
                optInStatus: 'opted_in',
              },
            });
          } else {
            const allContacts = await prisma.contact.findMany({
              where: {
                churchId: church.id,
                optInStatus: 'opted_in',
              },
            });
            contacts = allContacts.filter((c) => {
              const groups = Array.isArray(c.groups) ? c.groups : [];
              return (groups as string[]).includes(scheduledMsg.recipientGroupId || '');
            });
          }
        }

        if (contacts.length === 0) {
          throw new Error('No opted-in recipients found');
        }

        const segmentInfo = calculateSegments(scheduledMsg.body);
        const segmentsPerMessage = segmentInfo.segments || 1;

        // Create the message record
        const message = await prisma.message.create({
          data: {
            churchId: church.id,
            senderUserId: scheduledMsg.senderUserId,
            type: isBlue ? 'imessage_blast' : 'blast',
            recipientGroupId: scheduledMsg.recipientGroupId,
            body: scheduledMsg.body,
            status: 'sending',
            totalRecipients: contacts.length,
            segmentsUsed: isBlue ? 0 : segmentsPerMessage * contacts.length,
          },
        });

        // Send to each recipient
        let sentCount = 0;
        let failedCount = 0;

        for (const contact of contacts) {
          try {
            // Apply spintax per-recipient, then merge tags
            const spintaxBody = processSpintax(scheduledMsg.body);
            const personalizedBody = replaceMergeTags(spintaxBody, contact, church);

            let result;
            if (isBlue) {
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

            await prisma.messageRecipient.create({
              data: {
                messageId: message.id,
                contactId: contact.id,
                status: result.success ? 'sent' : 'failed',
                providerMessageSid: result.messageSid || null,
                errorMessage: result.error || null,
                sentAt: result.success ? new Date() : null,
              },
            });

            if (result.success) sentCount++;
            else failedCount++;
          } catch (sendError: any) {
            failedCount++;
            await prisma.messageRecipient.create({
              data: {
                messageId: message.id,
                contactId: contact.id,
                status: 'failed',
                errorMessage: sendError.message,
              },
            });
          }
        }

        // Update message status
        await prisma.message.update({
          where: { id: message.id },
          data: {
            status: failedCount === contacts.length ? 'failed' : 'sent',
            sentAt: new Date(),
          },
        });

        // Mark scheduled message as sent
        await prisma.scheduledMessage.update({
          where: { id: scheduledMsg.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            messageId: message.id,
          },
        });

        // Send email notification
        if (scheduledMsg.sender.email) {
          const preview = scheduledMsg.body.substring(0, 100) + (scheduledMsg.body.length > 100 ? '...' : '');
          sendEmail({
            to: scheduledMsg.sender.email,
            subject: 'Scheduled Message Sent - Free Church Texting',
            html: getScheduledMessageReminderHtml(
              church.name,
              preview,
              sentCount,
              now.toLocaleString('en-US', { timeZone: scheduledMsg.timezone })
            ),
          }).catch(console.error);
        }

        results.push({
          id: scheduledMsg.id,
          status: 'sent',
          sent: sentCount,
          failed: failedCount,
        });
      } catch (error: any) {
        console.error(`Failed to process scheduled message ${scheduledMsg.id}:`, error);

        await prisma.scheduledMessage.update({
          where: { id: scheduledMsg.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
          },
        });

        results.push({
          id: scheduledMsg.id,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // =========================================================================
    // SECTION 2: Process queued drip/random MessageRecipients
    // =========================================================================
    let dripRandomSent = 0;
    let dripRandomFailed = 0;

    const queuedRecipients = await prisma.messageRecipient.findMany({
      where: {
        status: 'queued',
        scheduledSendAt: {
          lte: now,
        },
      },
      include: {
        message: {
          include: {
            church: true,
          },
        },
        contact: true,
      },
      take: 50,
      orderBy: {
        scheduledSendAt: 'asc',
      },
    });

    for (const queuedRecipient of queuedRecipients) {
      try {
        const parentMessage = queuedRecipient.message;
        const church = parentMessage.church;
        const contact = queuedRecipient.contact;
        const isBlue = church.subscriptionTier === 'blue_shared' || church.subscriptionTier === 'blue_dedicated';

        // Get provider credentials for non-Blue churches
        let accountSid = '';
        let authToken = '';
        let fromNumber = '';
        let messagingServiceSid: string | null = null;

        if (!isBlue) {
          if (!church.providerAccountSid || !church.providerAuthToken || !church.providerPhoneNumber) {
            throw new Error('Church missing provider configuration');
          }
          accountSid = decrypt(church.providerAccountSid);
          authToken = decrypt(church.providerAuthToken);
          fromNumber = church.providerPhoneNumber;
          messagingServiceSid = church.providerMessagingServiceSid;
        }

        // Apply spintax per-recipient, then merge tags
        const spintaxBody = processSpintax(parentMessage.body);
        const personalizedBody = replaceMergeTags(spintaxBody, contact, church);

        let result;
        if (isBlue) {
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

        // Update the MessageRecipient status
        await prisma.messageRecipient.update({
          where: { id: queuedRecipient.id },
          data: {
            status: result.success ? 'sent' : 'failed',
            providerMessageSid: result.messageSid || null,
            errorMessage: result.error || null,
            sentAt: result.success ? new Date() : null,
          },
        });

        if (result.success) dripRandomSent++;
        else dripRandomFailed++;
      } catch (sendError: any) {
        console.error(`Failed to process queued recipient ${queuedRecipient.id}:`, sendError);
        dripRandomFailed++;

        await prisma.messageRecipient.update({
          where: { id: queuedRecipient.id },
          data: {
            status: 'failed',
            errorMessage: sendError.message,
          },
        });
      }
    }

    // Check if any parent Messages are now fully processed (all recipients sent/failed)
    // Collect unique message IDs from the batch we just processed
    const processedMessageIds = [...new Set(queuedRecipients.map((qr) => qr.messageId))];

    for (const messageId of processedMessageIds) {
      const remainingQueued = await prisma.messageRecipient.count({
        where: {
          messageId,
          status: 'queued',
        },
      });

      if (remainingQueued === 0) {
        // All recipients have been processed -- update the parent Message status
        const recipientStats = await prisma.messageRecipient.groupBy({
          by: ['status'],
          where: { messageId },
          _count: { status: true },
        });

        const totalRecipients = recipientStats.reduce((sum, s) => sum + s._count.status, 0);
        const failedRecipients = recipientStats.find((s) => s.status === 'failed')?._count.status || 0;

        await prisma.message.update({
          where: { id: messageId },
          data: {
            status: failedRecipients === totalRecipients ? 'failed' : 'sent',
            sentAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
      dripRandom: {
        processed: dripRandomSent + dripRandomFailed,
        sent: dripRandomSent,
        failed: dripRandomFailed,
      },
    });
  } catch (error: any) {
    console.error('Process scheduled messages error:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled messages' },
      { status: 500 }
    );
  }
}
