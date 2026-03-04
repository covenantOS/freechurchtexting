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

    // Support admin impersonation
    const isSuperAdmin = (session.user as any).isSuperAdmin;
    const impersonateChurchId = request.headers.get('X-Impersonate-Church-Id');
    
    // Use impersonated church ID if admin is impersonating
    const churchId = (isSuperAdmin && impersonateChurchId) 
      ? impersonateChurchId 
      : session.user.churchId;

    // Get total contacts
    const totalContacts = await prisma.contact.count({
      where: { churchId },
    });

    // Get messages sent this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const messagesSentThisMonth = await prisma.message.count({
      where: {
        churchId,
        createdAt: { gte: startOfMonth },
      },
    });

    // Calculate delivery rate
    const deliveredMessages = await prisma.message.count({
      where: {
        churchId,
        status: { in: ['delivered', 'sent'] },
      },
    });

    const totalMessages = await prisma.message.count({
      where: { churchId },
    });

    const deliveryRate = totalMessages > 0 ? Math.round((deliveredMessages / totalMessages) * 100) : 100;

    // Get A2P status and provider info
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: {
        a2pStatus: true,
        provider: true,
        providerPhoneNumber: true,
        subscriptionTier: true,
      },
    });

    return NextResponse.json({
      totalContacts,
      messagesSentThisMonth,
      deliveryRate,
      a2pStatus: church?.a2pStatus || 'not_started',
      provider: church?.provider || 'twilio',
      hasProviderConfigured: !!church?.providerPhoneNumber,
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
