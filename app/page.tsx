'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  MessageSquare,
  Users,
  Smartphone,
  Shield,
  Upload,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Zap,
  FileText,
  Repeat,
  MessageSquareText,
  Heart,
  Church,
  Apple,
  Star,
  ChevronRight,
  Mail,
  Phone,
  Send,
  Target,
  Calendar,
  BarChart3,
  Gift,
  Globe,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// Animated stats counter
function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (inView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-brand-500">
        {count}{suffix}
      </div>
      <div className="text-gray-600 mt-2">{label}</div>
    </div>
  );
}

// Feature card component
function FeatureCard({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ delay: index * 0.1 }}
      className="feature-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-brand-200"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Testimonial component
function Testimonial({ quote, name, role, church, image, index }: { quote: string; name: string; role: string; church: string; image: string; index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={scaleIn}
      transition={{ delay: index * 0.15 }}
      className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 text-lg italic leading-relaxed mb-6">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center">
          {image ? (
            <Image src={image} alt={name} fill className="object-cover" />
          ) : (
            <Church className="w-7 h-7 text-brand-600" />
          )}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">{role}{church ? `, ${church}` : ''}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Phone mockup with animated messages
function PhoneMockup() {
  const messages = [
    { text: "Good morning, Grace Church family! ☀️", time: "9:00 AM", sent: true },
    { text: "Don't forget - Prayer meeting tonight at 7pm in the fellowship hall!", time: "9:01 AM", sent: true },
    { text: "Thanks for the reminder Pastor! I'll be there 🙏", time: "9:05 AM", sent: false },
    { text: "See you tonight Sarah!", time: "9:06 AM", sent: true },
  ];
  
  return (
    <div className="relative animate-float">
      <div className="w-[280px] md:w-[320px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
        <div className="bg-white rounded-[2.5rem] overflow-hidden">
          {/* Phone status bar */}
          <div className="bg-gray-100 px-6 py-3 flex justify-between items-center">
            <span className="text-xs text-gray-500">9:06 AM</span>
            <div className="w-20 h-6 bg-black rounded-full" />
            <span className="text-xs text-gray-500">100%</span>
          </div>
          {/* Messages header */}
          <div className="px-4 py-3 border-b flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
              <Church className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">Grace Church</div>
              <div className="text-xs text-green-600">Active now</div>
            </div>
          </div>
          {/* Messages */}
          <div className="p-4 space-y-3 min-h-[280px]">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.4 + 0.5 }}
                className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sent
                    ? 'bg-brand-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  {msg.text}
                  <div className={`text-[10px] mt-1 ${msg.sent ? 'text-brand-100' : 'text-gray-400'}`}>
                    {msg.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute -z-10 top-10 -left-10 w-32 h-32 bg-brand-200 rounded-full blur-3xl opacity-50" />
      <div className="absolute -z-10 bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-50" />
    </div>
  );
}

export default function LandingPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  
  // Redirect authenticated users
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      if (user.isSuperAdmin) {
        router.push('/admin');
      } else if (user.churchId) {
        const hasCompletedOnboarding = user.onboardingCompleted;
        router.push(hasCompletedOnboarding ? '/dashboard' : '/onboarding');
      }
    }
  }, [status, session, router]);

  const features = [
    {
      icon: MessageSquare,
      title: 'Two-Way Texting',
      description: 'Real conversations with your congregation. Receive replies, prayer requests, and connect personally.',
    },
    {
      icon: Users,
      title: 'Smart Groups',
      description: 'Organize your flock into color-coded groups: Youth, Worship Team, Small Groups, and more.',
    },
    {
      icon: Clock,
      title: 'Scheduled Messages',
      description: 'Write your Sunday reminder on Monday. Schedule it to send Saturday evening automatically.',
    },
    {
      icon: Repeat,
      title: 'Personal Touch',
      description: 'Every message feels personal with {first_name} merge tags. "Hi Sarah" beats "Hi Member" every time.',
    },
    {
      icon: Shield,
      title: 'Full Compliance',
      description: 'Built-in opt-in/opt-out handling keeps you right with TCPA laws. We handle the legal stuff.',
    },
    {
      icon: Upload,
      title: 'Easy Import',
      description: 'Upload your existing contact list from Planning Center, Breeze, or any CSV in seconds.',
    },
    {
      icon: FileText,
      title: 'Message Templates',
      description: 'Save templates for weekly reminders, event announcements, and prayer chains.',
    },
    {
      icon: Calculator,
      title: 'Cost Transparency',
      description: 'See exactly what each message costs before sending. No surprise bills, ever.',
    },
    {
      icon: Smartphone,
      title: 'Your Own Number',
      description: 'Get a dedicated local phone number that your congregation recognizes and trusts.',
    },
  ];

  const testimonials = [
    {
      quote: "10 out of 10 product would highly recommend this for any church looking to grow their congregation and outreach.",
      name: "Garrett",
      role: "Pastor",
      church: "",
      image: "",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up in 30 seconds with your church name and email. No credit card needed to start.",
      icon: Church,
    },
    {
      step: 2,
      title: "Connect Your Provider",
      description: "Link your Twilio or Telnyx account. We'll guide you through creating one if you're starting fresh.",
      icon: Zap,
    },
    {
      step: 3,
      title: "Get Your Number",
      description: "Choose a local phone number in your area code. Your congregation will recognize your church.",
      icon: Phone,
    },
    {
      step: 4,
      title: "Import Your Flock",
      description: "Upload your contact list via CSV or add members manually. Organize into groups.",
      icon: Upload,
    },
    {
      step: 5,
      title: "Start Connecting",
      description: "Send your first message and watch your engagement soar. It's that simple.",
      icon: Send,
    },
  ];

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo showByline={true} />
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                About
              </Link>
              <Link href="/blue" className="text-sky-600 hover:text-sky-700 transition-colors font-medium flex items-center gap-1">
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 hero-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>98% Open Rate • Built for Churches</span>
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Reach Your <span className="gradient-text">Entire Congregation</span> in Seconds
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Text messages have a 98% open rate compared to 20% for email. Stop watching your announcements go unread. Start connecting with your flock where they actually pay attention.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                    Start For Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                    See How It Works
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {['/images/marketing/hero.png', '/images/marketing/family.png', '/images/marketing/volunteers.png'].map((img, i) => (
                    <div key={i} className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                      <Image src={img} alt="Pastor" fill className="object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">50,000+</span> church members reached daily
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right - Phone mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value={98} suffix="%" label="Open Rate" />
            <AnimatedStat value={45} suffix="%" label="Response Rate" />
            <AnimatedStat value={90} suffix="%" label="Read in 3 Minutes" />
            <AnimatedStat value={3} suffix="x" label="Higher Attendance" />
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Your Emails Are Going Unread. <span className="text-brand-500">Your Congregation Deserves Better.</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-lg">✕</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email Open Rates Are Plummeting</h4>
                    <p className="text-gray-600">Only 20% of your church emails ever get opened. That important announcement about the potluck? 4 out of 5 people never saw it.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600 text-lg">✕</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Social Media Gets Lost in the Noise</h4>
                    <p className="text-gray-600">Your Facebook post about Sunday's sermon got 12 likes. Algorithm changes mean your members rarely see what you share.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Text Messages Get Read — 98% of Them</h4>
                    <p className="text-gray-600">90% of texts are read within 3 minutes. When you need to reach your congregation, texting is how you actually get through.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/marketing/small_group.png"
                  alt="Church small group connecting together"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">5x</div>
                    <div className="text-sm text-gray-500">More engagement</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Connected
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for churches, not retrofitted from some corporate marketing tool. Every feature designed with your ministry in mind.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <Link href="/features">
              <Button size="lg" variant="outline" className="text-lg">
                Explore All Features <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Under 5 Minutes
            </h2>
            <p className="text-xl text-gray-600">
              No tech degree required. If you can send a text, you can use Free Church Texting.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-5 gap-6">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="text-center relative"
                >
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-brand-200 to-brand-100" />
                  )}
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border mx-auto flex items-center justify-center mb-4">
                      <Icon className="w-9 h-9 text-brand-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm shadow">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials / Trust Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Ministry, Not Marketing
            </h2>
            <p className="text-xl text-gray-600">
              We understand churches because we serve churches. Here's what pastors are saying.
            </p>
          </motion.div>
          
          <div className="max-w-2xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} index={index} />
            ))}
          </div>
          
          {/* Trust Indicators */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Shield, text: "TCPA Compliant" },
              { icon: Clock, text: "24hr Support Response" },
              { icon: CheckCircle2, text: "No Long-term Contracts" },
              { icon: Heart, text: "Church-First Design" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-brand-600" />
                </div>
                <p className="font-medium text-gray-700">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* iMessage CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                <Apple className="w-4 h-4" />
                <span>Church Posting Blue</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Unlock iMessage & RCS for Your Church
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Skip the A2P registration headaches. Send through our verified infrastructure with iMessage blue bubbles. 3x higher reply rates, unlimited messaging, zero carrier filtering.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Blue iMessage bubbles your congregation trusts",
                  "No A2P 10DLC registration required",
                  "$0.00 per message — flat monthly rate",
                  "RCS support for Android users",
                  "Setup in 3-4 days, not 2-4 weeks"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/blue">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg">
                  Learn About Blue Tier <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative w-[280px]">
                <Image
                  src="/images/marketing/phone_mockup.png"
                  alt="iPhone showing iMessage"
                  width={280}
                  height={500}
                  className="rounded-3xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
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
              Simple, Honest Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No platform fees. No monthly minimums. Pay only for what you send.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Tier</h3>
                <p className="text-gray-600">Bring Your Own Provider</p>
              </div>
              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
                <p className="text-sm text-gray-500 mt-2">+ Twilio/Telnyx messaging costs</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited contacts & groups",
                  "SMS messaging via your provider",
                  "Scheduled messages",
                  "Message templates",
                  "CSV import/export",
                  "Compliance tools"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="w-full text-lg">
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
            
            {/* Blue Tier */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Church Posting Blue</h3>
                <p className="text-blue-100">iMessage + RCS Included</p>
              </div>
              <div className="text-center mb-8">
                <span className="text-5xl font-bold">$197</span>
                <span className="text-blue-100">/month</span>
                <p className="text-sm text-blue-200 mt-2">$0 per message</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Everything in Free, plus:",
                  "iMessage & RCS messaging",
                  "$0.00 per message",
                  "No A2P registration needed",
                  "3x higher reply rates",
                  "Priority support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/blue">
                <Button size="lg" className="w-full text-lg bg-white text-blue-600 hover:bg-blue-50">
                  Learn More <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center text-gray-500 mt-8"
          >
            <Link href="/pricing" className="text-brand-600 hover:underline">
              View full pricing details →
            </Link>
          </motion.p>
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
            <Heart className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Your Congregation Is Waiting to Hear From You
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your church communication today. Start connecting with your flock in the place they actually pay attention — their text messages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                  Start For Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                  Talk to Our Team
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Set up in under 5 minutes • Cancel anytime
            </p>
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
              <p className="text-gray-400 mb-4">
                Helping churches connect with their congregations through the power of text messaging.
              </p>
              <p className="text-sm text-gray-500">
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
              <h4 className="font-semibold text-lg mb-4">Get Started</h4>
              <ul className="space-y-3">
                <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Create Account</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2026 Church Posting. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm">Terms</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
