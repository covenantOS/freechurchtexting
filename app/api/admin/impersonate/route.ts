import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { sign } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { church: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data for session switching
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        churchId: user.churchId,
        churchName: user.church?.name || '',
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        subscriptionTier: user.church?.subscriptionTier || 'free',
        onboardingCompleted: user.church?.onboardingCompleted || false,
      },
    });
  } catch (error) {
    console.error('Error impersonating user:', error);
    return NextResponse.json({ error: 'Failed to impersonate user' }, { status: 500 });
  }
}
