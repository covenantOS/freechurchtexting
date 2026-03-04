import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

export const STRIPE_PRICES = {
  A2P_SETUP: process.env.STRIPE_A2P_PRICE_ID || '',
  BLUE_SHARED: process.env.STRIPE_BLUE_SHARED_PRICE_ID || '',
  BLUE_DEDICATED: process.env.STRIPE_BLUE_DEDICATED_PRICE_ID || '',
};
