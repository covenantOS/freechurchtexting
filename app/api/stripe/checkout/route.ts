import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { product, churchId, churchName, email } = await request.json();

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'https://freechurchtexting.com';

    let priceId: string;
    let mode: 'payment' | 'subscription';
    let productName: string;

    switch (product) {
      case 'a2p':
        priceId = STRIPE_PRICES.A2P_SETUP;
        mode = 'payment';
        productName = 'A2P 10DLC Registration Service';
        break;
      case 'blue-shared':
        priceId = STRIPE_PRICES.BLUE_SHARED;
        mode = 'subscription';
        productName = 'Church Posting Blue - Shared Enterprise';
        break;
      case 'blue-dedicated':
        priceId = STRIPE_PRICES.BLUE_DEDICATED;
        mode = 'subscription';
        productName = 'Church Posting Blue - Dedicated';
        break;
      default:
        return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Product not configured. Please contact support.' },
        { status: 400 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&product=${product}`,
      cancel_url: `${origin}/blue?canceled=true`,
      customer_email: email || session?.user?.email || undefined,
      metadata: {
        product,
        churchId: churchId || '',
        churchName: churchName || '',
        userId: session?.user?.id || '',
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
