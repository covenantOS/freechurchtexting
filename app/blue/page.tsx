'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Apple,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  MessageSquare,
  Users,
  Crown,
  X,
  Sparkles,
  Phone,
  Globe,
  Clock,
  BadgeCheck,
  TrendingUp,
  MessageSquareText,
  FileWarning,
  AlertTriangle,
  Smartphone,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

function ComparisonRow({ feature, sms, imessage }: { feature: string; sms: string | boolean; imessage: string | boolean }) {
  return (
    <div className="grid grid-cols-3 py-4 border-b border-gray-100">
      <div className="font-medium text-gray-700">{feature}</div>
      <div className="text-center">
        {typeof sms === 'boolean' ? (
          sms ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
        ) : (
          <span className="text-gray-600">{sms}</span>
        )}
      </div>
      <div className="text-center">
        {typeof imessage === 'boolean' ? (
          imessage ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-400 mx-auto" />
        ) : (
          <span className="text-blue-600 font-medium">{imessage}</span>
        )}
      </div>
    </div>
  );
}

export default function BluePage() {
  const { data: session } = useSession() || {};
  const [loadingShared, setLoadingShared] = React.useState(false);
  const [loadingDedicated, setLoadingDedicated] = React.useState(false);

  const handleCheckout = async (tier: 'blue_shared' | 'blue_dedicated') => {
    const setLoading = tier === 'blue_shared' ? setLoadingShared : setLoadingDedicated;
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Unable to start checkout. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Apple,
      title: "Blue iMessage Bubbles",
      description: "Your messages appear as trusted blue bubbles that your congregation recognizes. No more green SMS bubbles that look like spam."
    },
    {
      icon: Shield,
      title: "Skip A2P Registration",
      description: "No confusing carrier registrations. No waiting weeks for approval. No compliance paperwork. Just connect and send."
    },
    {
      icon: TrendingUp,
      title: "3x Higher Reply Rates",
      description: "iMessage feels like a real person texting. Congregations reply more because it doesn't feel like marketing."
    },
    {
      icon: Zap,
      title: "$0 Per Message",
      description: "$0.00 per message. Send to 10 people or 10,000 — the same flat monthly rate. No surprise bills."
    },
    {
      icon: Smartphone,
      title: "RCS for Android",
      description: "Android users get rich messaging too. Read receipts, high-quality images, and a better experience."
    },
    {
      icon: Clock,
      title: "Priority Support",
      description: "Questions answered within hours, not days. Direct access to people who understand church communication."
    },
  ];

  const a2pProblems = [
    {
      icon: FileWarning,
      title: "Confusing Registration Process",
      description: "A2P 10DLC requires registering your 'brand' and 'campaigns' with mobile carriers. The process is designed for corporations, not churches."
    },
    {
      icon: Clock,
      title: "Weeks of Waiting",
      description: "Registration takes 2-4 weeks. Some churches wait months. All while your messages go undelivered."
    },
    {
      icon: AlertTriangle,
      title: "Low Reply Rates",
      description: "Green bubble SMS feels impersonal. Congregations often ignore them thinking it's spam or marketing — not their pastor."
    },
    {
      icon: X,
      title: "Rejections & Errors",
      description: "Churches often get rejected for unclear reasons. Resubmitting means starting the weeks-long wait over again."
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
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
              <Link href="/blue" className="text-blue-600 font-semibold flex items-center gap-1">
                <Apple className="w-4 h-4" /> iMessage
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 font-medium">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                <Apple className="w-4 h-4" />
                <span>Church Posting Blue</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                iMessage & RCS for <span className="text-blue-200">Your Church</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Skip the A2P registration headaches. Send through our pre-verified infrastructure with iMessage blue bubbles your congregation trusts. Unlimited messaging included.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                {[
                  { value: "3x", label: "Higher Reply Rate" },
                  { value: "$0", label: "Per Message" },
                  { value: "0", label: "A2P Paperwork" },
                  { value: "3-4", label: "Days to Setup" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {session ? (
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
                    onClick={() => handleCheckout('blue_shared')}
                    disabled={loadingShared}
                  >
                    {loadingShared ? 'Processing...' : 'Upgrade to Blue Shared'}
                  </Button>
                ) : (
                  <Link href="/signup">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 w-full sm:w-auto">
                      Get Started <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 w-full sm:w-auto">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center"
            >
              <div className="relative">
                <Image
                  src="/images/marketing/phone_mockup.png"
                  alt="iPhone showing iMessage"
                  width={300}
                  height={533}
                  className="rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Delivered via</div>
                      <div className="text-sm font-semibold text-gray-900">iMessage</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is iMessage for Churches? */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why iMessage Matters for Your Church
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                When you send a standard SMS, it shows up as a <strong className="text-green-600">green bubble</strong> on iPhones. That green bubble signals "not from iPhone" — and increasingly, "probably spam."
              </p>
              <p className="text-lg text-gray-600 mb-6">
                <strong className="text-blue-600">Blue bubbles</strong> are different. They signal trust. They signal a verified sender. When your prayer meeting reminder arrives as a blue iMessage, your congregation knows it's really from their church.
              </p>
              <p className="text-lg text-gray-600">
                For Android users, we send via <strong className="text-gray-900">RCS (Rich Communication Services)</strong> — Google's equivalent to iMessage. Same rich experience, same verified sender status.
              </p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <div className="bg-gray-100 rounded-2xl p-8">
                <h3 className="font-semibold text-gray-900 mb-6 text-center">Message Appearance</h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-gray-500 mb-2">Standard SMS (Green Bubble)</div>
                    <div className="flex justify-end">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
                        Don't forget - Prayer meeting tonight at 7pm!
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span>May be filtered as spam</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-200">
                    <div className="text-xs text-gray-500 mb-2">iMessage (Blue Bubble)</div>
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
                        Don't forget - Prayer meeting tonight at 7pm!
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Trusted & verified delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The A2P Problem */}
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
              The Problem With Standard SMS
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A2P 10DLC registration was supposed to help. Instead, it created a bureaucratic nightmare for churches.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {a2pProblems.map((problem, index) => {
              const Icon = problem.icon;
              const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
              
              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-red-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{problem.title}</h3>
                  <p className="text-gray-600 text-sm">{problem.description}</p>
                </motion.div>
              );
            })}
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-700 px-6 py-3 rounded-full">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Church Posting Blue eliminates all of this.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
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
              Why Churches Choose Blue
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Send through our pre-verified infrastructure. No registration, no waiting, no headaches.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
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
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              SMS vs iMessage: Side by Side
            </h2>
            <p className="text-gray-600">See why churches are making the switch</p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="grid grid-cols-3 pb-4 border-b-2 border-gray-200">
              <div className="font-semibold text-gray-500">Feature</div>
              <div className="text-center">
                <div className="font-semibold text-green-600">SMS (Free Tier)</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">iMessage (Blue)</div>
              </div>
            </div>
            
            <ComparisonRow feature="Reply Rate" sms="Low" imessage="3x Higher" />
            <ComparisonRow feature="Message Cost" sms="~$0.0079/msg" imessage="$0.00" />
            <ComparisonRow feature="A2P Registration" sms={true} imessage={false} />
            <ComparisonRow feature="Carrier Filtering" sms="High" imessage="None" />
            <ComparisonRow feature="Blue Bubbles" sms={false} imessage={true} />
            <ComparisonRow feature="RCS Support" sms={false} imessage={true} />
            <ComparisonRow feature="Setup Time" sms="2-4 weeks" imessage="3-4 days" />
            <ComparisonRow feature="Read Receipts" sms={false} imessage={true} />
            <ComparisonRow feature="Typing Indicators" sms={false} imessage={true} />
            
            <p className="text-sm text-gray-500 mt-4">* SMS reply rates are lower because green bubbles feel impersonal to recipients</p>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Blue Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Unlimited messaging. One flat monthly rate.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Blue Shared */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Most Popular
              </div>
              
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <Apple className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Blue Shared</h3>
                <p className="text-blue-100">Perfect for most churches</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold">$197</span>
                <span className="text-blue-100">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  { text: "iMessage + RCS messaging", hasTooltip: false },
                  { text: "20 new contacts per day*", hasTooltip: true },
                  { text: "$0.00 per message", hasTooltip: false },
                  { text: "No A2P registration needed", hasTooltip: false },
                  { text: "3x higher reply rates", hasTooltip: false },
                  { text: "Shared sending infrastructure", hasTooltip: false },
                  { text: "All Free tier features", hasTooltip: false },
                  { text: "Priority email support", hasTooltip: false },
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-blue-200 mb-4">*20 NEW contacts/day. Unlimited messages to existing contacts who have replied.</p>
              
              {session ? (
                <Button
                  size="lg"
                  className="w-full text-lg bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => handleCheckout('blue_shared')}
                  disabled={loadingShared}
                >
                  {loadingShared ? 'Processing...' : 'Upgrade Now'}
                </Button>
              ) : (
                <Link href="/signup">
                  <Button size="lg" className="w-full text-lg bg-white text-blue-600 hover:bg-blue-50">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Blue Dedicated */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-200"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Blue Dedicated</h3>
                <p className="text-gray-600">For large churches (1000+ contacts)</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900">$397</span>
                <span className="text-gray-600">/month</span>
                <p className="text-sm text-green-600 mt-1">Coming down to $247 soon!</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Everything in Blue Shared, plus:",
                  "Unlimited new contacts*",
                  "Dedicated sending infrastructure",
                  "Your own phone numbers",
                  "Higher throughput capacity",
                  "White-glove onboarding",
                  "Direct phone support",
                  "Custom integrations available",
                ].map((feature, i) => (
                  <li key={i} className={`flex items-center gap-3 ${i === 0 ? 'text-purple-600' : ''}`}>
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mb-4">*Subject to Apple's own rate limits. Must follow messaging best practices.</p>
              
              {session ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full text-lg border-purple-200 text-purple-600 hover:bg-purple-50"
                  onClick={() => handleCheckout('blue_dedicated')}
                  disabled={loadingDedicated}
                >
                  {loadingDedicated ? 'Processing...' : 'Upgrade Now'}
                </Button>
              ) : (
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full text-lg border-purple-200 text-purple-600 hover:bg-purple-50">
                    Contact Us <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Questions About Blue</h2>
          </motion.div>
          
          <div className="space-y-6">
            {[
              {
                q: "How does Blue avoid A2P registration?",
                a: "We've already completed the extensive verification process with Apple and mobile carriers. When you send through Blue, you're using our pre-verified infrastructure. We handle all the compliance — you just send your messages."
              },
              {
                q: "Will my congregation see my church name?",
                a: "Yes. Messages appear from your church's verified identity. Your congregation will see it's from their trusted church, not some unknown number."
              },
              {
                q: "What happens if someone doesn't have iMessage?",
                a: "For iPhone users without iMessage enabled, and for Android users, we send via RCS when available, falling back to high-quality SMS. Either way, your messages get delivered."
              },
              {
                q: "Can I upgrade from Free tier to Blue?",
                a: "Absolutely. Your contacts, groups, templates, and message history all carry over. Many churches start on Free tier and upgrade when they're ready."
              },
              {
                q: "What's the difference between Shared and Dedicated?",
                a: "Blue Shared ($197/mo) uses our pooled infrastructure with a limit of 20 new contacts per day — great for most churches. Blue Dedicated ($397/mo, coming down to $247 soon) gives you unlimited new contacts, your own isolated sending environment with dedicated phone numbers, ideal for large churches who need maximum throughput."
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 ml-8">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Apple className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Send Messages That Actually Get Read?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join churches across America who've upgraded to Blue. No A2P headaches, no carrier filtering, no messages lost to spam folders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
                  onClick={() => handleCheckout('blue_shared')}
                  disabled={loadingShared}
                >
                  {loadingShared ? 'Processing...' : 'Upgrade to Blue'}
                </Button>
              ) : (
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 w-full sm:w-auto">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 w-full sm:w-auto">
                  Talk to Our Team
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
                <MessageSquareText className="w-8 h-8 text-blue-400" />
                <span className="font-bold text-xl">Free Church Texting</span>
              </div>
              <p className="text-gray-400">
                A ministry of <a href="https://churchposting.com" className="text-blue-400 hover:underline">Church Posting</a>
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
