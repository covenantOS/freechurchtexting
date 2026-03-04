import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendEmail, sendAdminNotification, getWelcomeEmailHtml } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 signups per hour per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed, remaining } = checkRateLimit(`signup:${ip}`, 3, 3600000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '3600', 'X-RateLimit-Remaining': '0' } }
      );
    }

    const body = await request.json();
    const { email, password, name, churchName } = body || {};

    if (!email || !password || !name || !churchName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if church email exists
    const existingChurch = await prisma.church.findUnique({
      where: { email },
    });

    if (existingChurch) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create church and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const church = await tx.church.create({
        data: {
          name: churchName,
          email,
          onboardingCompleted: false,
        },
      });

      const user = await tx.user.create({
        data: {
          churchId: church.id,
          name,
          email,
          passwordHash,
          role: 'admin',
        },
      });

      return { church, user };
    });

    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      subject: 'Welcome to Free Church Texting!',
      html: getWelcomeEmailHtml(name, churchName),
    }).catch((err) => console.error('Failed to send welcome email:', err));

    // Send admin notification via Resend (non-blocking)
    sendAdminNotification(
      `New Signup: ${churchName} (${name})`,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827; border-bottom: 2px solid #C28C88; padding-bottom: 10px;">
          New User Signup!
        </h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 10px 0;"><strong>Church:</strong> ${churchName}</p>
        </div>
        <p style="color: #666; font-size: 12px;">
          Signed up at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
        </p>
      </div>`
    ).catch((err) => console.error('Failed to send admin notification:', err));

    return NextResponse.json({
      success: true,
      userId: result.user.id,
      churchId: result.church.id,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
