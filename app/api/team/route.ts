import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail, getTeamInviteEmailHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Get team members and pending invites
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can manage team
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can manage team members' }, { status: 403 });
    }

    const [members, invites] = await Promise.all([
      prisma.user.findMany({
        where: { churchId: session.user.churchId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.teamInvite.findMany({
        where: {
          churchId: session.user.churchId,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ members, invites });
  } catch (error: any) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// Create new team invite
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can invite
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can invite team members' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = 'member' } = body || {};

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user already exists with this email in this church
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        churchId: session.user.churchId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A team member with this email already exists' },
        { status: 400 }
      );
    }

    // Check for existing pending invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        email,
        churchId: session.user.churchId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invite has already been sent to this email' },
        { status: 400 }
      );
    }

    // Get church details
    const church = await prisma.church.findUnique({
      where: { id: session.user.churchId },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invite
    const invite = await prisma.teamInvite.create({
      data: {
        churchId: session.user.churchId,
        email,
        role: role as 'admin' | 'member',
        token,
        invitedBy: session.user.id,
        expiresAt,
      },
    });

    // Send invite email
    const baseUrl = process.env.NEXTAUTH_URL || 'https://freechurchtexting.com';
    const inviteLink = `${baseUrl}/invite?token=${token}`;

    await sendEmail({
      to: email,
      subject: `You've been invited to join ${church.name} on Free Church Texting`,
      html: getTeamInviteEmailHtml(session.user.name || 'A team member', church.name, inviteLink),
    });

    return NextResponse.json({ invite });
  } catch (error: any) {
    console.error('Create invite error:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}
