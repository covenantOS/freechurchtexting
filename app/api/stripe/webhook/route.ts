import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { sendAdminNotification } from '@/lib/email';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // If no webhook secret, parse the event directly (for testing)
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { product, churchId, churchName, userId } = session.metadata || {};

        console.log('Checkout completed:', { product, churchId, userId, sessionId: session.id });

        // Get product details
        let productName = 'Unknown Product';
        let amount = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';
        
        switch (product) {
          case 'a2p':
            productName = 'A2P 10DLC Registration Service ($197)';
            break;
          case 'blue-shared':
            productName = 'Church Posting Blue - Shared Enterprise ($249/mo)';
            // Update subscription tier
            if (churchId) {
              await prisma.church.update({
                where: { id: churchId },
                data: { subscriptionTier: 'blue_shared' },
              });
            }
            break;
          case 'blue-dedicated':
            productName = 'Church Posting Blue - Dedicated ($397/mo)';
            // Update subscription tier
            if (churchId) {
              await prisma.church.update({
                where: { id: churchId },
                data: { subscriptionTier: 'blue_dedicated' },
              });
            }
            break;
        }

        // Send admin notification via Resend
        sendAdminNotification(
          `New Purchase: ${productName}`,
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #111827; border-bottom: 2px solid #10B981; padding-bottom: 10px;">
              New Purchase!
            </h2>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <p style="margin: 10px 0; font-size: 18px;"><strong>${productName}</strong></p>
              <p style="margin: 10px 0;"><strong>Amount:</strong> $${amount}</p>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Customer Email:</strong> ${session.customer_email || 'N/A'}</p>
              <p style="margin: 10px 0;"><strong>Church:</strong> ${churchName || 'N/A'}</p>
              <p style="margin: 10px 0;"><strong>Stripe Session:</strong> ${session.id}</p>
            </div>
            <p style="color: #666; font-size: 12px;">
              Purchased at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
            </p>
          </div>`
        ).catch((err) => console.error('Failed to send purchase notification:', err));

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription event:', event.type, subscription.id);
        // Handle subscription status updates
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription canceled:', subscription.id);
        // Handle subscription cancellation
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
