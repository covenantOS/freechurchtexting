import { PrismaClient, OptInStatus, SubscriptionTier, TemplateCategory, MessageType, MessageStatus, SendingMode } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomPhone(index: number): string {
  // Deterministic 555-xxxx format based on index to avoid collisions
  const num = 5550000 + index * 7 + 1000;
  return `+1${num.toString().padStart(10, '0')}`;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Contact name pools
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael',
  'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan',
  'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher',
  'Nancy', 'Daniel', 'Lisa', 'Matthew',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris',
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('Starting database seed...\n');

  const demoPasswordHash = await bcrypt.hash('demo123', 12);

  // =========================================================================
  // (a) Update existing admin user / Church Posting church
  // =========================================================================
  console.log('[1/3] Updating admin church "Church Posting" ...');

  const adminChurch = await prisma.church.upsert({
    where: { email: 'willbham16@gmail.com' },
    update: {
      name: 'Church Posting',
      subscriptionTier: 'free' as SubscriptionTier,
    },
    create: {
      name: 'Church Posting',
      email: 'willbham16@gmail.com',
      subscriptionTier: 'free' as SubscriptionTier,
      onboardingCompleted: true,
    },
  });

  // Make sure the admin user exists and has isSuperAdmin = true but NO special tier
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
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

  console.log(`  Admin church ID: ${adminChurch.id}`);
  console.log('  Admin user: willbham16@gmail.com (super admin, free tier)\n');

  // =========================================================================
  // (b-1) Demo Church 1 - Grace Community Church (Blue Dedicated)
  // =========================================================================
  console.log('[2/3] Creating "Grace Community Church" (blue_dedicated) ...');

  const graceChurch = await prisma.church.upsert({
    where: { email: 'demo-blue@freechurchtexting.com' },
    update: {
      name: 'Grace Community Church',
      subscriptionTier: 'blue_dedicated' as SubscriptionTier,
      onboardingCompleted: true,
      provider: 'twilio',
      providerPhoneNumber: '+15551000001',
      a2pStatus: 'fully_approved',
      leaderName: 'Pastor David Mitchell',
      phone: '+15551000000',
      address: '4200 Oak Avenue',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
      website: 'https://gracecommunitychurch.example.com',
    },
    create: {
      name: 'Grace Community Church',
      email: 'demo-blue@freechurchtexting.com',
      subscriptionTier: 'blue_dedicated' as SubscriptionTier,
      onboardingCompleted: true,
      provider: 'twilio',
      providerPhoneNumber: '+15551000001',
      a2pStatus: 'fully_approved',
      leaderName: 'Pastor David Mitchell',
      phone: '+15551000000',
      address: '4200 Oak Avenue',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
      website: 'https://gracecommunitychurch.example.com',
    },
  });

  const graceUser = await prisma.user.upsert({
    where: { email: 'demo-blue@freechurchtexting.com' },
    update: {},
    create: {
      churchId: graceChurch.id,
      name: 'David Mitchell',
      email: 'demo-blue@freechurchtexting.com',
      passwordHash: demoPasswordHash,
      role: 'admin',
    },
  });

  // --- Groups ---
  const graceGroups = [
    { name: 'Youth Group', description: 'Students ages 12-18', color: '#8B5CF6' },
    { name: 'Sunday School', description: 'Sunday morning classes for all ages', color: '#F59E0B' },
    { name: 'Prayer Team', description: 'Intercessory prayer team members', color: '#10B981' },
  ];

  for (const g of graceGroups) {
    await prisma.group.upsert({
      where: { churchId_name: { churchId: graceChurch.id, name: g.name } },
      update: {},
      create: { churchId: graceChurch.id, ...g },
    });
  }

  const graceGroupNames = graceGroups.map((g) => g.name);

  // --- 25 Contacts ---
  const graceContactIds: string[] = [];
  for (let i = 0; i < 25; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const phone = `+1555${(1001 + i).toString().padStart(7, '0')}`;
    const assignedGroup = graceGroupNames[i % graceGroupNames.length];

    try {
      const contact = await prisma.contact.upsert({
        where: { churchId_phone: { churchId: graceChurch.id, phone } },
        update: {},
        create: {
          churchId: graceChurch.id,
          firstName,
          lastName,
          phone,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
          groups: JSON.stringify([assignedGroup]),
          optInStatus: i < 22 ? ('opted_in' as OptInStatus) : ('pending' as OptInStatus),
          optInDate: daysAgo(90 - i * 3),
          source: i < 20 ? 'manual' : 'csv_import',
        },
      });
      graceContactIds.push(contact.id);
    } catch {
      // skip duplicate
    }
  }

  console.log(`  Created ${graceContactIds.length} contacts`);

  // --- 3 Templates ---
  const graceTemplates = [
    { name: 'Weekly Reminder', body: 'Hi {first_name}! Just a reminder that service is this Sunday at 10am. See you there!', category: 'event' as TemplateCategory },
    { name: 'Event Announcement', body: 'Hey {first_name}, join us for {event_name} on {date}! Reply YES to RSVP.', category: 'event' as TemplateCategory },
    { name: 'Prayer Request', body: 'Hi {first_name}, the prayer team is praying for you this week. Let us know how we can continue to support you.', category: 'prayer' as TemplateCategory },
  ];

  for (const t of graceTemplates) {
    await prisma.template.upsert({
      where: { churchId_name: { churchId: graceChurch.id, name: t.name } },
      update: {},
      create: { churchId: graceChurch.id, ...t },
    });
  }

  // --- 2 Auto-replies ---
  const graceAutoReplies = [
    { keyword: 'PRAYER', response: 'Thank you for reaching out. A member of our prayer team will follow up with you soon. God bless!' },
    { keyword: 'INFO', response: 'Grace Community Church - 4200 Oak Avenue, Dallas TX 75201. Sunday services at 9am & 11am. Visit gracecommunitychurch.example.com for more info!' },
  ];

  for (const ar of graceAutoReplies) {
    await prisma.autoReply.upsert({
      where: { churchId_keyword: { churchId: graceChurch.id, keyword: ar.keyword } },
      update: {},
      create: { churchId: graceChurch.id, ...ar, isActive: true },
    });
  }

  // --- 10 Sent messages (mix of individual and blast) ---
  const graceMessageBodies = [
    { body: 'Good morning! Reminder: service starts at 10am this Sunday. Bring a friend!', type: 'blast' as MessageType },
    { body: 'Youth Group meets Wednesday at 6:30pm. Pizza night this week!', type: 'blast' as MessageType },
    { body: 'Hey James, just checking in. How are you and the family doing?', type: 'individual' as MessageType },
    { body: 'Prayer meeting tonight at 7pm in the fellowship hall. All are welcome.', type: 'blast' as MessageType },
    { body: 'Hi Mary, your volunteer shift is confirmed for Sunday morning. Thank you!', type: 'individual' as MessageType },
    { body: 'Sunday School resumes next week. Classes for all ages!', type: 'blast' as MessageType },
    { body: 'Hey John, Pastor David would love to meet with you this week. Reply with a good time.', type: 'individual' as MessageType },
    { body: 'Potluck lunch after service this Sunday! Please bring a dish to share.', type: 'blast' as MessageType },
    { body: 'VBS registration is now open! Sign up at our website.', type: 'blast' as MessageType },
    { body: 'Hi Patricia, we missed you last Sunday. Hope everything is okay!', type: 'individual' as MessageType },
  ];

  for (let i = 0; i < graceMessageBodies.length; i++) {
    const mb = graceMessageBodies[i];
    const contactId = graceContactIds[i % graceContactIds.length];
    const sentAt = hoursAgo((graceMessageBodies.length - i) * 12);

    const msg = await prisma.message.create({
      data: {
        churchId: graceChurch.id,
        senderUserId: graceUser.id,
        type: mb.type,
        body: mb.body,
        status: 'delivered' as MessageStatus,
        sentAt,
        providerMessageSid: `SM_DEMO_GRACE_${Date.now()}_${i}`,
        segmentsUsed: 1,
        totalRecipients: mb.type === 'blast' ? 10 : 1,
        sendingMode: 'instant' as SendingMode,
        recipientContactId: mb.type === 'individual' ? contactId : null,
      },
    });

    // Create message recipient record
    if (contactId) {
      await prisma.messageRecipient.create({
        data: {
          messageId: msg.id,
          contactId,
          status: 'delivered' as MessageStatus,
          providerMessageSid: `SM_DEMO_GRACE_RCPT_${Date.now()}_${i}`,
          sentAt,
        },
      });
    }
  }

  console.log('  Created 10 sent messages');

  // --- 5 Inbound messages ---
  const graceInbound = [
    { body: 'PRAYER Please pray for my mom, she is having surgery Friday.', from: '+15551001000' },
    { body: 'Yes! We will be there Sunday.', from: '+15551001001' },
    { body: 'What time does youth group start?', from: '+15551001002' },
    { body: 'INFO', from: '+15551001003' },
    { body: 'Thank you for the prayers. Mom is doing much better!', from: '+15551001004' },
  ];

  for (let i = 0; i < graceInbound.length; i++) {
    const ib = graceInbound[i];
    await prisma.inboundMessage.create({
      data: {
        churchId: graceChurch.id,
        contactId: graceContactIds[i] || null,
        from: ib.from,
        to: '+15551000001',
        body: ib.body,
        providerMessageSid: `SM_DEMO_GRACE_IN_${Date.now()}_${i}`,
        createdAt: hoursAgo((graceInbound.length - i) * 6),
      },
    });
  }

  console.log('  Created 5 inbound messages');
  console.log('  Created 3 templates, 2 auto-replies, 3 groups');
  console.log(`  Grace Community Church ID: ${graceChurch.id}\n`);

  // =========================================================================
  // (b-2) Demo Church 2 - First Baptist Fellowship (Free tier)
  // =========================================================================
  console.log('[3/3] Creating "First Baptist Fellowship" (free) ...');

  const fbfChurch = await prisma.church.upsert({
    where: { email: 'demo-free@freechurchtexting.com' },
    update: {
      name: 'First Baptist Fellowship',
      subscriptionTier: 'free' as SubscriptionTier,
      onboardingCompleted: true,
      provider: 'twilio',
      providerPhoneNumber: '+15552000001',
      a2pStatus: 'not_started',
      leaderName: 'Pastor Sarah Thompson',
      phone: '+15552000000',
      address: '780 Elm Street',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
    },
    create: {
      name: 'First Baptist Fellowship',
      email: 'demo-free@freechurchtexting.com',
      subscriptionTier: 'free' as SubscriptionTier,
      onboardingCompleted: true,
      provider: 'twilio',
      providerPhoneNumber: '+15552000001',
      a2pStatus: 'not_started',
      leaderName: 'Pastor Sarah Thompson',
      phone: '+15552000000',
      address: '780 Elm Street',
      city: 'Austin',
      state: 'TX',
      zip: '73301',
    },
  });

  const fbfUser = await prisma.user.upsert({
    where: { email: 'demo-free@freechurchtexting.com' },
    update: {},
    create: {
      churchId: fbfChurch.id,
      name: 'Sarah Thompson',
      email: 'demo-free@freechurchtexting.com',
      passwordHash: demoPasswordHash,
      role: 'admin',
    },
  });

  // --- 1 Group ---
  await prisma.group.upsert({
    where: { churchId_name: { churchId: fbfChurch.id, name: 'All Members' } },
    update: {},
    create: { churchId: fbfChurch.id, name: 'All Members', description: 'All church members', color: '#3B82F6' },
  });

  // --- 10 Contacts ---
  const fbfContactIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    const firstName = FIRST_NAMES[(i + 10) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i + 5) % LAST_NAMES.length];
    const phone = `+1555${(2001 + i).toString().padStart(7, '0')}`;

    try {
      const contact = await prisma.contact.upsert({
        where: { churchId_phone: { churchId: fbfChurch.id, phone } },
        update: {},
        create: {
          churchId: fbfChurch.id,
          firstName,
          lastName,
          phone,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
          groups: JSON.stringify(['All Members']),
          optInStatus: i < 8 ? ('opted_in' as OptInStatus) : ('pending' as OptInStatus),
          optInDate: daysAgo(60 - i * 5),
          source: 'manual',
        },
      });
      fbfContactIds.push(contact.id);
    } catch {
      // skip duplicate
    }
  }

  console.log(`  Created ${fbfContactIds.length} contacts`);

  // --- 5 Sent messages ---
  const fbfMessageBodies = [
    { body: 'Good morning church family! Service this Sunday at 10:30am.', type: 'blast' as MessageType },
    { body: 'Hi David, thanks for visiting last Sunday! We hope to see you again.', type: 'individual' as MessageType },
    { body: 'Bible study Wednesday night at 7pm. We are studying Romans.', type: 'blast' as MessageType },
    { body: 'Hey Barbara, can you help with the bake sale this weekend?', type: 'individual' as MessageType },
    { body: 'Happy Thanksgiving from First Baptist Fellowship! We are grateful for each of you.', type: 'blast' as MessageType },
  ];

  for (let i = 0; i < fbfMessageBodies.length; i++) {
    const mb = fbfMessageBodies[i];
    const contactId = fbfContactIds[i % fbfContactIds.length];
    const sentAt = hoursAgo((fbfMessageBodies.length - i) * 24);

    const msg = await prisma.message.create({
      data: {
        churchId: fbfChurch.id,
        senderUserId: fbfUser.id,
        type: mb.type,
        body: mb.body,
        status: 'delivered' as MessageStatus,
        sentAt,
        providerMessageSid: `SM_DEMO_FBF_${Date.now()}_${i}`,
        segmentsUsed: 1,
        totalRecipients: mb.type === 'blast' ? 5 : 1,
        sendingMode: 'instant' as SendingMode,
        recipientContactId: mb.type === 'individual' ? contactId : null,
      },
    });

    if (contactId) {
      await prisma.messageRecipient.create({
        data: {
          messageId: msg.id,
          contactId,
          status: 'delivered' as MessageStatus,
          providerMessageSid: `SM_DEMO_FBF_RCPT_${Date.now()}_${i}`,
          sentAt,
        },
      });
    }
  }

  console.log('  Created 5 sent messages');
  console.log('  Created 1 group');
  console.log(`  First Baptist Fellowship ID: ${fbfChurch.id}\n`);

  // =========================================================================
  // Summary + DEMO_CHURCH_IDS output
  // =========================================================================
  const demoIds = [graceChurch.id, fbfChurch.id].join(',');

  console.log('='.repeat(60));
  console.log('Seed completed successfully!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Demo accounts (password: demo123):');
  console.log('----------------------------------');
  console.log(`  Blue Dedicated : demo-blue@freechurchtexting.com`);
  console.log(`                   Church: Grace Community Church`);
  console.log(`                   ID:     ${graceChurch.id}`);
  console.log('');
  console.log(`  Free Tier      : demo-free@freechurchtexting.com`);
  console.log(`                   Church: First Baptist Fellowship`);
  console.log(`                   ID:     ${fbfChurch.id}`);
  console.log('');
  console.log('Super Admin (password: admin123):');
  console.log('----------------------------------');
  console.log(`  willbham16@gmail.com  (Church Posting, free tier)`);
  console.log(`  Church ID: ${adminChurch.id}`);
  console.log('');
  console.log('Add this to your .env file for demo mode:');
  console.log('------------------------------------------');
  console.log(`DEMO_CHURCH_IDS=${demoIds}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
