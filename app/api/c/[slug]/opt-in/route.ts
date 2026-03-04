import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatE164, isValidPhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Look up church by slug
    const church = await prisma.church.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!church) {
      return NextResponse.json(
        { error: 'Church not found' },
        { status: 404 }
      );
    }

    const churchId = church.id;
    const body = await request.json();
    const { firstName, lastName, phone, email, marketingConsent, nonMarketingConsent } = body || {};

    if (!firstName || !phone) {
      return NextResponse.json(
        { error: 'First name and phone number are required' },
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

    // Check if contact already exists for this church
    const existing = await prisma.contact.findUnique({
      where: {
        churchId_phone: {
          churchId,
          phone: formattedPhone,
        },
      },
    });

    if (existing) {
      // Update existing contact's opt-in status
      await prisma.contact.update({
        where: { id: existing.id },
        data: {
          firstName,
          lastName: lastName || existing.lastName,
          email: email || existing.email,
          optInStatus: 'opted_in',
          optInDate: new Date(),
          optOutDate: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'You have been opted in to text messages.',
      });
    }

    // Create new contact
    await prisma.contact.create({
      data: {
        churchId,
        firstName,
        lastName: lastName || null,
        phone: formattedPhone,
        email: email || null,
        optInStatus: 'opted_in',
        optInDate: new Date(),
        source: 'manual',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'You have been opted in to text messages.',
    });
  } catch (error: any) {
    console.error('Slug opt-in error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
