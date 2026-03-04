import { NextRequest, NextResponse } from 'next/server';
import { searchAvailableNumbers } from '@/lib/twilio-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountSid, authToken, areaCode } = body || {};

    if (!accountSid || !authToken || !areaCode) {
      return NextResponse.json(
        { numbers: [], error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await searchAvailableNumbers(accountSid, authToken, areaCode);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Search numbers error:', error);
    return NextResponse.json(
      { numbers: [], error: error?.message || 'Search failed' },
      { status: 500 }
    );
  }
}
