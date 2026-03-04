import { PrismaClient, OptInStatus, A2PStatus, SubscriptionTier, TemplateCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_GROUPS = [
  { name: 'All Members', description: 'All church members', color: '#3B82F6' },
  { name: 'Visitors', description: 'First-time visitors', color: '#10B981' },
  { name: 'Volunteers', description: 'Volunteer team members', color: '#F59E0B' },
  { name: 'Youth Group', description: 'Youth ministry contacts', color: '#8B5CF6' },
  { name: 'Small Groups', description: 'Small group leaders and members', color: '#EC4899' },
];

const DEFAULT_TEMPLATES = [
  { name: 'Sunday Reminder', body: 'Hi {first_name}! See you this Sunday at 10am! 🙏', category: 'event' as TemplateCategory },
  { name: 'Event Announcement', body: 'Hey {first_name}! Join us for {event_name} on {date}. Reply YES to confirm!', category: 'event' as TemplateCategory },
  { name: 'Prayer Request Follow-up', body: 'Hi {first_name}, we\'ve been praying for you. How are you doing?', category: 'prayer' as TemplateCategory },
  { name: 'Welcome Message', body: 'Welcome to our church family, {first_name}! We\'re so glad you visited. Let us know if you have any questions!', category: 'welcome' as TemplateCategory },
  { name: 'Volunteer Request', body: 'Hi {first_name}! We need help with {task}. Can you serve this Sunday?', category: 'volunteer' as TemplateCategory },
];

// Demo church configurations
const DEMO_CHURCHES = [
  {
    name: 'Grace Community Church',
    email: 'demo-free@freechurchtexting.com',
    tier: 'free' as SubscriptionTier,
    provider: 'twilio' as const,
    a2pStatus: 'fully_approved' as A2PStatus,
    phone: '+15551234567',
    contactCount: 150,
    messageCount: 45,
    description: 'Free tier church with Twilio SMS - fully onboarded',
  },
  {
    name: 'New Hope Fellowship',
    email: 'demo-telnyx@freechurchtexting.com',
    tier: 'free' as SubscriptionTier,
    provider: 'telnyx' as const,
    a2pStatus: 'campaign_approved' as A2PStatus,
    phone: '+15559876543',
    contactCount: 85,
    messageCount: 23,
    description: 'Free tier church with Telnyx - A2P in progress',
  },
  {
    name: 'Hillside Baptist',
    email: 'demo-blueshared@freechurchtexting.com',
    tier: 'blue_shared' as SubscriptionTier,
    provider: 'twilio' as const,
    a2pStatus: 'not_started' as A2PStatus,
    phone: '+15555551234',
    contactCount: 320,
    messageCount: 178,
    description: 'Blue Shared tier - iMessage/RCS messaging',
  },
  {
    name: 'The Rock Church',
    email: 'demo-bluededi@freechurchtexting.com',
    tier: 'blue_dedicated' as SubscriptionTier,
    provider: 'twilio' as const,
    a2pStatus: 'not_started' as A2PStatus,
    phone: '+15555559999',
    contactCount: 1250,
    messageCount: 892,
    description: 'Blue Dedicated tier - unlimited iMessage/RCS',
  },
  {
    name: 'First Presbyterian',
    email: 'demo-onboarding@freechurchtexting.com',
    tier: 'free' as SubscriptionTier,
    provider: 'twilio' as const,
    a2pStatus: 'not_started' as A2PStatus,
    phone: null,
    contactCount: 0,
    messageCount: 0,
    description: 'New signup - still onboarding',
    onboardingCompleted: false,
  },
];

// Sample contact names
const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

function randomPhone() {
  return `+1555${Math.floor(1000000 + Math.random() * 9000000)}`;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Create password hash (same for all demo accounts)
  const passwordHash = await bcrypt.hash('demo123', 12);
  const adminPasswordHash = await bcrypt.hash('admin123', 12);

  // Create super admin account
  console.log('Creating super admin account...');
  const adminChurch = await prisma.church.upsert({
    where: { email: 'willbham16@gmail.com' },
    update: {},
    create: {
      name: 'Admin - Church Posting',
      email: 'willbham16@gmail.com',
      subscriptionTier: 'blue_dedicated',
      onboardingCompleted: true,
      a2pStatus: 'fully_approved',
    },
  });

  await prisma.user.upsert({
    where: { email: 'willbham16@gmail.com' },
    update: { isSuperAdmin: true },
    create: {
      churchId: adminChurch.id,
      name: 'Will',
      email: 'willbham16@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isSuperAdmin: true,
    },
  });

  console.log('✅ Super admin created: willbham16@gmail.com / admin123');

  // Create demo churches
  for (const demoConfig of DEMO_CHURCHES) {
    console.log(`Creating demo church: ${demoConfig.name}...`);

    const church = await prisma.church.upsert({
      where: { email: demoConfig.email },
      update: {
        subscriptionTier: demoConfig.tier,
        a2pStatus: demoConfig.a2pStatus,
        provider: demoConfig.provider,
        providerPhoneNumber: demoConfig.phone,
      },
      create: {
        name: demoConfig.name,
        email: demoConfig.email,
        subscriptionTier: demoConfig.tier,
        a2pStatus: demoConfig.a2pStatus,
        provider: demoConfig.provider,
        providerPhoneNumber: demoConfig.phone,
        onboardingCompleted: demoConfig.onboardingCompleted !== false,
        leaderName: 'Pastor Demo',
        phone: '+15551112222',
        address: '123 Church St',
        city: 'Springfield',
        state: 'TX',
        zip: '75001',
      },
    });

    // Create user for this church
    const userName = demoConfig.name.split(' ')[0];
    await prisma.user.upsert({
      where: { email: demoConfig.email },
      update: {},
      create: {
        churchId: church.id,
        name: `${userName} Admin`,
        email: demoConfig.email,
        passwordHash,
        role: 'admin',
      },
    });

    // Create default groups
    for (const group of DEFAULT_GROUPS) {
      await prisma.group.upsert({
        where: { churchId_name: { churchId: church.id, name: group.name } },
        update: {},
        create: {
          churchId: church.id,
          ...group,
        },
      });
    }

    // Create default templates
    for (const template of DEFAULT_TEMPLATES) {
      await prisma.template.upsert({
        where: { churchId_name: { churchId: church.id, name: template.name } },
        update: {},
        create: {
          churchId: church.id,
          ...template,
        },
      });
    }

    // Create sample contacts
    const contactsToCreate = demoConfig.contactCount;
    for (let i = 0; i < contactsToCreate; i++) {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const phone = randomPhone();
      
      try {
        await prisma.contact.create({
          data: {
            churchId: church.id,
            firstName,
            lastName,
            phone,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            groups: JSON.stringify([randomElement(DEFAULT_GROUPS.map(g => g.name))]),
            optInStatus: randomElement(['opted_in', 'opted_in', 'opted_in', 'pending']) as OptInStatus,
            optInDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          },
        });
      } catch (e) {
        // Ignore duplicate phone errors
      }
    }

    console.log(`✅ Created ${demoConfig.name} with ${contactsToCreate} contacts`);
  }

  console.log('');
  console.log('🎉 Seed completed!');
  console.log('');
  console.log('Demo accounts (all password: demo123):');
  console.log('----------------------------------------');
  DEMO_CHURCHES.forEach(c => {
    console.log(`${c.tier.padEnd(15)} | ${c.email}`);
  });
  console.log('');
  console.log('Super Admin (password: admin123):');
  console.log('----------------------------------------');
  console.log('willbham16@gmail.com');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
