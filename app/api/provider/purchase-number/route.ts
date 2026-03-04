import { NextRequest, NextResponse } from 'next/server';
import { purchasePhoneNumber, ProviderType } from '@/lib/sms-provider';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, accountSid, authToken, phoneNumber } = body || {};

    const providerType = (provider || 'twilio') as ProviderType;

    if (!accountSid || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (providerType === 'twilio' && !authToken) {
      return NextResponse.json(
        { success: false, error: 'Auth Token is required for Twilio' },
        { status: 400 }
      );
    }

    const result = await purchasePhoneNumber(providerType, accountSid, authToken || '', phoneNumber);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Purchase number error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Purchase failed' },
      { status: 500 }
    );
  }
}
