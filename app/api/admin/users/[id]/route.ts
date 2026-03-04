import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Update user/church (upgrade tier, reset onboarding, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, subscriptionTier } = body || {};
    const userId = params.id;

    // Get the user and their church
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { church: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't allow modifying other super admins
    if (user.isSuperAdmin) {
      return NextResponse.json({ error: 'Cannot modify super admin accounts' }, { status: 403 });
    }

    switch (action) {
      case 'upgrade':
        // Upgrade subscription tier
        if (!subscriptionTier || !['free', 'blue_shared', 'blue_dedicated'].includes(subscriptionTier)) {
          return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
        }
        await prisma.church.update({
          where: { id: user.churchId },
          data: { subscriptionTier },
        });
        return NextResponse.json({ success: true, message: `Upgraded to ${subscriptionTier}` });

      case 'reset_onboarding':
        // Reset onboarding status
        await prisma.church.update({
          where: { id: user.churchId },
          data: { onboardingCompleted: false },
        });
        return NextResponse.json({ success: true, message: 'Onboarding reset' });

      case 'complete_onboarding':
        // Complete onboarding
        await prisma.church.update({
          where: { id: user.churchId },
          data: { onboardingCompleted: true },
        });
        return NextResponse.json({ success: true, message: 'Onboarding completed' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete user and their church
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { church: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't allow deleting super admins
    if (user.isSuperAdmin) {
      return NextResponse.json({ error: 'Cannot delete super admin accounts' }, { status: 403 });
    }

    // Delete the church (this will cascade delete the user due to onDelete: Cascade)
    await prisma.church.delete({
      where: { id: user.churchId },
    });

    return NextResponse.json({ success: true, message: 'User and church deleted' });
  } catch (error: any) {
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
