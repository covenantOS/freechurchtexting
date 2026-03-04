import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatE164, isValidPhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { churchId: string } }
) {
  try {
    const churchId = params?.churchId;

    // Verify church exists
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { id: true },
    });

    if (!church) {
      // Return success even if church not found (for privacy)
      return NextResponse.json({
        success: true,
        message: 'If your number was on our list, you have been unsubscribed.',
      });
    }

    const body = await request.json();
    const { phone } = body || {};

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatE164(phone);
    if (!isValidPhone(formattedPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid US phone number' },
        { status: 400 }
      );
    }

    // Find contact by churchId + phone
    const contact = await prisma.contact.findUnique({
      where: {
        churchId_phone: {
          churchId,
          phone: formattedPhone,
        },
      },
    });

    if (contact) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          optInStatus: 'opted_out',
          optOutDate: new Date(),
        },
      });
    }

    // Always return success for privacy (don't reveal if contact exists)
    return NextResponse.json({
      success: true,
      message: 'If your number was on our list, you have been unsubscribed.',
    });
  } catch (error: any) {
    console.error('Opt-out error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
