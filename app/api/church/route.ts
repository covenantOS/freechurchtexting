import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const church = await prisma.church.findUnique({
      where: { id: session.user.churchId },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    // Mask sensitive data
    return NextResponse.json({
      church: {
        ...church,
        providerAccountSid: church.providerAccountSid ? '••••••••' + church.providerAccountSid?.slice?.(-4) : null,
        providerAuthToken: church.providerAuthToken ? '••••••••' : null,
      },
    });
  } catch (error: any) {
    console.error('Get church error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
