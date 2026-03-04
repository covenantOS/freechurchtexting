import { NextRequest, NextResponse } from 'next/server';
import { searchAvailableNumbers, ProviderType } from '@/lib/sms-provider';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, accountSid, authToken, areaCode } = body || {};

    const providerType = (provider || 'twilio') as ProviderType;

    if (!accountSid || !areaCode) {
      return NextResponse.json(
        { numbers: [], error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (providerType === 'twilio' && !authToken) {
      return NextResponse.json(
        { numbers: [], error: 'Auth Token is required for Twilio' },
        { status: 400 }
      );
    }

    const result = await searchAvailableNumbers(providerType, accountSid, authToken || '', areaCode);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Search numbers error:', error);
    return NextResponse.json(
      { numbers: [], error: error?.message || 'Search failed' },
      { status: 500 }
    );
  }
}
