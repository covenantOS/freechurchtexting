import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch users with their churches (expanded fields)
    const users = await prisma.user.findMany({
      include: {
        church: {
          select: {
            id: true,
            name: true,
            slug: true,
            leaderName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            zip: true,
            website: true,
            ein: true,
            provider: true,
            providerPhoneNumber: true,
            a2pStatus: true,
            subscriptionTier: true,
            onboardingCompleted: true,
            complianceCompletedAt: true,
            timezone: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get unique church IDs
    const churchIds = [...new Set(users.map(u => u.churchId))];

    // Batch fetch contact counts - single query
    const contactCounts = await prisma.contact.groupBy({
      by: ['churchId'],
      where: { churchId: { in: churchIds } },
      _count: { id: true },
    });

    // Batch fetch message counts - single query
    const messageCounts = await prisma.message.groupBy({
      by: ['churchId'],
      where: { churchId: { in: churchIds } },
      _count: { id: true },
    });

    // Batch fetch user counts per church
    const userCounts = await prisma.user.groupBy({
      by: ['churchId'],
      where: { churchId: { in: churchIds } },
      _count: { id: true },
    });

    // Get last message date per church
    const lastMessages = await prisma.message.groupBy({
      by: ['churchId'],
      where: { churchId: { in: churchIds } },
      _max: { createdAt: true },
    });

    // Create lookup maps for quick access
    const contactCountMap = new Map(
      contactCounts.map(c => [c.churchId, c._count.id])
    );
    const messageCountMap = new Map(
      messageCounts.map(m => [m.churchId, m._count.id])
    );
    const userCountMap = new Map(
      userCounts.map(u => [u.churchId, u._count.id])
    );
    const lastMessageMap = new Map(
      lastMessages.map(m => [m.churchId, m._max.createdAt])
    );

    // Map users with their stats
    const usersWithStats = users.map((user) => ({
      ...user,
      passwordHash: undefined, // Never expose password
      stats: {
        contactCount: contactCountMap.get(user.churchId) || 0,
        messageCount: messageCountMap.get(user.churchId) || 0,
        userCount: userCountMap.get(user.churchId) || 0,
        lastMessageAt: lastMessageMap.get(user.churchId) || null,
      },
    }));

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
