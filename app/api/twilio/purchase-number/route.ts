import { NextRequest, NextResponse } from 'next/server';
import { purchasePhoneNumber } from '@/lib/twilio-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountSid, authToken, phoneNumber } = body || {};

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await purchasePhoneNumber(accountSid, authToken, phoneNumber);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Purchase number error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Purchase failed' },
      { status: 500 }
    );
  }
}
