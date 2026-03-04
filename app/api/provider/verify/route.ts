import { NextRequest, NextResponse } from 'next/server';
import { verifyProviderCredentials, ProviderType } from '@/lib/sms-provider';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, accountSid, authToken } = body || {};

    const providerType = (provider || 'twilio') as ProviderType;

    if (providerType === 'telnyx') {
      if (!accountSid) {
        return NextResponse.json(
          { valid: false, error: 'API Key is required' },
          { status: 400 }
        );
      }
    } else {
      if (!accountSid || !authToken) {
        return NextResponse.json(
          { valid: false, error: 'Account SID and Auth Token are required' },
          { status: 400 }
        );
      }
    }

    const result = await verifyProviderCredentials(providerType, accountSid, authToken || '');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Provider verify error:', error);
    return NextResponse.json(
      { valid: false, error: error?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
