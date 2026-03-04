import { NextRequest, NextResponse } from 'next/server';
import { verifyTwilioCredentials } from '@/lib/twilio-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountSid, authToken } = body || {};

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { valid: false, error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const result = await verifyTwilioCredentials(accountSid, authToken);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Twilio verify error:', error);
    return NextResponse.json(
      { valid: false, error: error?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
