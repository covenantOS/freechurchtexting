import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_GROUPS = [
  { name: 'All Members', description: 'All church members', color: '#3B82F6' },
  { name: 'Visitors', description: 'First-time and recent visitors', color: '#10B981' },
  { name: 'Youth', description: 'Youth ministry members', color: '#8B5CF6' },
  { name: 'Small Groups', description: 'Small group participants', color: '#F59E0B' },
  { name: 'Volunteers', description: 'Church volunteers', color: '#EC4899' },
  { name: 'Leaders', description: 'Church leadership team', color: '#EF4444' },
];

const DEFAULT_TEMPLATES = [
  {
    name: 'Sunday Reminder',
    body: 'Hi {first_name}! Just a reminder that service starts tomorrow at 10am. We can\'t wait to see you! \u26ea',
    category: 'general',
  },
  {
    name: 'Event Announcement',
    body: 'Hey {first_name}! We have an exciting event coming up. Save the date and join us! More details to come.',
    category: 'event',
  },
  {
    name: 'Prayer Request Follow-up',
    body: 'Hi {first_name}, we\'ve been praying for you this week. How are you doing? Let us know if there\'s anything else we can pray about. \ud83d\ude4f',
    category: 'prayer',
  },
  {
    name: 'Welcome Visitor',
    body: 'Hi {first_name}! Thank you so much for visiting us! We loved having you and hope to see you again soon. Feel free to reach out with any questions!',
    category: 'welcome',
  },
  {
    name: 'Volunteer Reminder',
    body: 'Hi {first_name}! This is a friendly reminder that you\'re scheduled to serve this Sunday. Thank you for your dedication! \ud83d\udc4f',
    category: 'volunteer',
  },
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = session.user.churchId;

    // Create default groups
    for (const group of DEFAULT_GROUPS) {
      await prisma.group.upsert({
        where: { churchId_name: { churchId, name: group.name } },
        update: {},
        create: { churchId, ...group },
      });
    }

    // Create default templates
    for (const template of DEFAULT_TEMPLATES) {
      await prisma.template.upsert({
        where: { churchId_name: { churchId, name: template.name } },
        update: {},
        create: {
          churchId,
          name: template.name,
          body: template.body,
          category: template.category as any,
        },
      });
    }

    // Mark onboarding as complete
    await prisma.church.update({
      where: { id: churchId },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
