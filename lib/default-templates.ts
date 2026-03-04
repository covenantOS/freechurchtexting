/**
 * Default templates seeded for every new church.
 * Shared between signup route, seed script, and reset-defaults API.
 */
export const DEFAULT_TEMPLATES = [
  // WELCOME (4)
  { name: 'First-Time Visitor', category: 'welcome' as const, body: 'Hi {first_name}! So glad you joined us this Sunday. We\'d love to connect with you more. Feel free to reply with any questions!' },
  { name: 'New Member Welcome', category: 'welcome' as const, body: 'Welcome to the {church_name} family, {first_name}! We\'re so happy you\'re here. Reply if you need anything at all.' },
  { name: 'Welcome Back', category: 'welcome' as const, body: 'Hey {first_name}, great to see you back! We missed you. Hope to see you again soon.' },
  { name: 'Connection Card Follow-Up', category: 'welcome' as const, body: 'Hi {first_name}, thanks for filling out a connection card! We\'d love to help you get plugged in. What are you interested in?' },

  // EVENT (5)
  { name: 'Sunday Service Reminder', category: 'event' as const, body: 'Reminder: Join us tomorrow for Sunday service at 10am! Bring a friend and come expectant. See you there!' },
  { name: 'Event Announcement', category: 'event' as const, body: 'Save the date! {church_name} is hosting a special event. Stay tuned for more details. We\'d love for you to be there!' },
  { name: 'Bible Study Invite', category: 'event' as const, body: 'Hey {first_name}! Our Bible study group meets this week. It\'s a great time of fellowship and learning. Hope to see you!' },
  { name: 'Potluck Reminder', category: 'event' as const, body: 'Don\'t forget our church potluck this Sunday after service! Bring a dish to share. Can\'t wait to eat and fellowship together.' },
  { name: 'VBS Registration', category: 'event' as const, body: 'Vacation Bible School is coming! Register your kids for a week of fun, learning, and adventure. Spots are limited!' },

  // PRAYER (4)
  { name: 'Prayer Request Follow-Up', category: 'prayer' as const, body: 'Hi {first_name}, we received your prayer request and our team is lifting you up. God is faithful. How can we continue to support you?' },
  { name: 'Weekly Prayer', category: 'prayer' as const, body: 'Good morning {first_name}! This week, let\'s pray for our community and each other. Reply with any prayer requests you have.' },
  { name: 'Prayer Chain Alert', category: 'prayer' as const, body: 'Prayer request: Please join us in praying today. Your prayers matter and make a difference. Reply PRAYED when you\'ve prayed.' },
  { name: 'Encouragement', category: 'prayer' as const, body: 'Hey {first_name}, just wanted to encourage you today. God loves you and has a plan for your life. You\'re not alone!' },

  // VOLUNTEER (4)
  { name: 'Volunteer Opportunity', category: 'volunteer' as const, body: 'Hi {first_name}! We need volunteers this weekend. Your help makes such a difference. Reply YES if you can serve!' },
  { name: 'Thank You Volunteer', category: 'volunteer' as const, body: 'Thank you so much for volunteering, {first_name}! Your service blesses our whole church family. We appreciate you!' },
  { name: 'Volunteer Schedule', category: 'volunteer' as const, body: 'Hi {first_name}, just a reminder you\'re scheduled to serve this Sunday. Please arrive 15 minutes early. Thank you!' },
  { name: 'Ministry Team Meeting', category: 'volunteer' as const, body: 'Hey team! We have a ministry meeting this week to plan for the upcoming month. Your input matters. Hope to see everyone there!' },

  // GENERAL (3)
  { name: 'General Announcement', category: 'general' as const, body: 'Hi {church_name} family! Quick update: Check our website for the latest news and upcoming events. God bless!' },
  { name: 'Giving Reminder', category: 'general' as const, body: 'Thank you for your generosity, {first_name}. Your giving supports our mission to serve our community. Every gift makes a difference.' },
  { name: 'Pastor Check-In', category: 'general' as const, body: 'Hey {first_name}, just checking in. How are you doing? Is there anything I can pray about or help with? We care about you.' },
];

/** Names of all built-in default templates (used to identify them in the UI) */
export const DEFAULT_TEMPLATE_NAMES = DEFAULT_TEMPLATES.map((t) => t.name);
