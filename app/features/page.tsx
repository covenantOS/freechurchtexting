'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  MessageSquare,
  Users,
  Clock,
  Repeat,
  Shield,
  Upload,
  FileText,
  Calculator,
  Smartphone,
  Zap,
  Bell,
  BarChart3,
  Calendar,
  Heart,
  Search,
  Tag,
  MessageCircle,
  Send,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Apple,
  Target,
  Globe,
  Lock,
  Mail,
  MessageSquareText,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

function FeatureSection({ 
  title, 
  description, 
  features, 
  image, 
  imageAlt, 
  reverse = false 
}: { 
  title: string; 
  description: string; 
  features: { icon: any; title: string; desc: string }[]; 
  image: string; 
  imageAlt: string; 
  reverse?: boolean 
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  
  return (
    <div ref={ref} className={`grid lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeInUp}
        className={reverse ? 'lg:order-2' : ''}
      >
        <h3 className="text-3xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-lg text-gray-600 mb-8">{description}</p>
        <div className="space-y-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
      
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={scaleIn}
        className={reverse ? 'lg:order-1' : ''}
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
          <Image src={image} alt={imageAlt} fill className="object-cover" />
        </div>
      </motion.div>
    </div>
  );
}

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: MessageSquare,
      title: "Two-Way Conversations",
      description: "Real conversations, not broadcasts. Receive replies directly in your dashboard. When a member responds to your prayer meeting reminder, you can reply back immediately.",
    },
    {
      icon: Users,
      title: "Smart Contact Groups",
      description: "Color-code your congregation: Youth Group (purple), Worship Team (blue), Small Group Leaders (green). Send targeted messages to exactly who needs them.",
    },
    {
      icon: Clock,
      title: "Schedule Ahead",
      description: "Write your Sunday service reminder on Monday. Schedule it to send Saturday at 6pm. Set it and forget it — we'll handle the rest.",
    },
    {
      icon: Repeat,
      title: "Personal Merge Tags",
      description: "Every message feels personal. Use {first_name} and {last_name} to turn 'Hi Member' into 'Hi Sarah.' Your congregation will feel the difference.",
    },
    {
      icon: Shield,
      title: "Built-in Compliance",
      description: "TCPA compliance handled automatically. Opt-in tracking, easy unsubscribe, quiet hours — we keep you right with the law so you can focus on ministry.",
    },
    {
      icon: Upload,
      title: "Easy CSV Import",
      description: "Already have contacts in Planning Center, Breeze, or a spreadsheet? Upload your CSV and we'll import everyone in seconds. No manual entry required.",
    },
  ];

  const messagingFeatures = [
    { icon: Send, title: "Instant Delivery", desc: "Messages deliver within seconds, not minutes. Time-sensitive announcements reach your congregation immediately." },
    { icon: MessageCircle, title: "Reply Tracking", desc: "See every response in one place. Track conversations, follow up on prayer requests, and never lose a message." },
    { icon: Bell, title: "Delivery Receipts", desc: "Know your message was delivered. Track sent, delivered, and read statuses for every text." },
  ];

  const organizationFeatures = [
    { icon: Tag, title: "Custom Tags", desc: "Add custom tags like 'New Member' or 'Volunteer' to any contact. Filter and search by tag." },
    { icon: Search, title: "Smart Search", desc: "Find any contact instantly. Search by name, phone, group, or tag." },
    { icon: UserPlus, title: "Easy Entry", desc: "Add new contacts in seconds. Type a phone number and name — that's all you need." },
  ];

  const templateFeatures = [
    { icon: FileText, title: "Saved Templates", desc: "Save your best messages as templates. Weekly reminder? Event invite? One click to use again." },
    { icon: Calendar, title: "Template Categories", desc: "Organize templates by type: Announcements, Events, Prayer Chains, Volunteer Requests." },
    { icon: Target, title: "Merge Tag Ready", desc: "Templates support merge tags too. Personalized messages, reusable formats." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo showByline={true} />
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-brand-600 font-semibold">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                About
              </Link>
              <Link href="/blue" className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-1">
                <Apple className="w-4 h-4" /> iMessage
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="font-medium">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Everything Your Church Needs to <span className="gradient-text">Stay Connected</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Built by people who understand ministry. Every feature designed to help you reach your congregation, not to impress a corporate marketing team.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start For Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The essentials every church needs to communicate effectively
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
              
              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="feature-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Messaging Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureSection
            title="Powerful Messaging That Actually Reaches People"
            description="98% of text messages are opened. Compare that to 20% for email. When you need to reach your congregation, text messaging is how you actually get through."
            features={messagingFeatures}
            image="/images/marketing/phone_closeup.png"
            imageAlt="Phone showing text messages"
          />
        </div>
      </section>

      {/* Organization Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureSection
            title="Keep Your Congregation Organized"
            description="From 50 members to 5,000, Free Church Texting scales with you. Smart organization tools that grow with your ministry."
            features={organizationFeatures}
            image="/images/marketing/volunteers.png"
            imageAlt="Church volunteer team meeting"
            reverse
          />
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureSection
            title="Save Time with Message Templates"
            description="Stop rewriting the same messages every week. Create templates once, use them forever. Your best announcements, ready to send in one click."
            features={templateFeatures}
            image="/images/marketing/pastor_desk.png"
            imageAlt="Pastor working at desk"
          />
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Stay Compliant Without the Headache
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TCPA, CTIA, A2P 10DLC — it's a lot of acronyms. We handle the compliance so you can focus on ministry.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Opt-In Management",
                description: "Track consent automatically. Know exactly when each contact opted in and how."
              },
              {
                icon: Shield,
                title: "Easy Unsubscribe",
                description: "When someone texts STOP, they're automatically removed. No manual work required."
              },
              {
                icon: Clock,
                title: "Quiet Hours",
                description: "Never accidentally text at 3am. Built-in safeguards respect your congregation's time."
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
              
              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* iMessage CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <Apple className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Want iMessage & RCS? Upgrade to Blue.
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Skip A2P registration entirely. Send through our verified infrastructure with 94% delivery rates. Blue bubbles your congregation recognizes and trusts.
            </p>
            <Link href="/blue">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg">
                Learn About Blue Tier <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Church Communication?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of churches who've discovered the power of text messaging. Start for free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquareText className="w-8 h-8 text-brand-400" />
                <span className="font-bold text-xl">Free Church Texting</span>
              </div>
              <p className="text-gray-400">
                A ministry of <a href="https://churchposting.com" className="text-brand-400 hover:underline">Church Posting</a>
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/blue" className="text-gray-400 hover:text-white transition-colors">Church Posting Blue</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            © 2026 Church Posting. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
