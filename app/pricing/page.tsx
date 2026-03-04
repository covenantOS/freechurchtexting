'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  CheckCircle2,
  X,
  ArrowRight,
  Apple,
  MessageSquare,
  Users,
  Clock,
  Shield,
  Zap,
  HelpCircle,
  ChevronDown,
  MessageSquareText,
  Sparkles,
  Calculator,
  Phone,
  Building,
  Crown,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left"
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="pb-6"
        >
          <p className="text-gray-600">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [messageCount, setMessageCount] = useState(500);
  const costPerMessage = 0.0079;
  const estimatedCost = (messageCount * costPerMessage).toFixed(2);

  const faqs = [
    {
      question: "Do I need my own Twilio or Telnyx account?",
      answer: "For the Free tier, yes. You'll connect your own Twilio or Telnyx account, which gives you full control and the lowest possible messaging costs (around $0.0079 per message). Don't worry — we walk you through setting it up step by step during onboarding. It takes about 2 minutes."
    },
    {
      question: "What's included in Church Posting Blue?",
      answer: "Blue tier includes iMessage and RCS messaging through our verified infrastructure. No Twilio account needed, no A2P registration required, no per-message costs. Blue Shared is $197/month (20 new contacts/day limit). Blue Dedicated is $397/month (unlimited contacts) — coming down to $247 soon as we sign on more churches. You also get priority support and higher reply rates."
    },
    {
      question: "What's A2P 10DLC and do I need it?",
      answer: "A2P 10DLC (Application-to-Person messaging on 10-digit long codes) is a carrier requirement for businesses sending SMS. With the Free tier, you'll need to register your church. We provide a free guide to do it yourself, or for $197 we'll log into your Twilio/Telnyx and do the whole registration for you. With Blue tier, you skip A2P entirely because you're sending through our pre-verified infrastructure."
    },
    {
      question: "How does the cost calculator work?",
      answer: "Twilio charges approximately $0.0079 per SMS segment (160 characters). Longer messages split into multiple segments. Our cost calculator shows you the exact cost before you send. No hidden fees, no surprises."
    },
    {
      question: "Can I switch from Free to Blue later?",
      answer: "Absolutely! You can upgrade anytime. Your contacts, groups, and templates all carry over. Many churches start with Free tier to test the platform, then upgrade to Blue when they want the simplicity of unlimited messaging."
    },
    {
      question: "Is there a contract or can I cancel anytime?",
      answer: "No contracts, ever. Blue tier is month-to-month and you can cancel anytime. Your data stays with you — export your contacts whenever you want."
    },
    {
      question: "What's the difference between Shared and Dedicated Blue?",
      answer: "Blue Shared ($197/mo) uses our pooled infrastructure with a limit of 20 new contacts per day — great for most churches. Blue Dedicated ($397/mo, coming down to $247 soon) gives you unlimited new contacts, your own sending infrastructure, and dedicated phone numbers. Ideal for large churches (1000+ contacts) who need higher throughput. Note: You can message existing contacts who've replied unlimited times on both tiers."
    },
    {
      question: "Do you offer discounts for multiple churches?",
      answer: "Yes! If you're a multi-site church or denomination, contact us for volume pricing. We love working with church networks."
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
              <Link href="/pricing" className="text-brand-600 font-semibold">
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
      <section className="pt-32 pb-16 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Simple, <span className="gradient-text">Honest Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No platform fees. No monthly minimums. No hidden costs. Choose the plan that fits your church.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Tier</h3>
                <p className="text-gray-600">Bring Your Own Provider</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
                <p className="text-sm text-gray-500 mt-2">+ ~$0.0079 per message via Twilio/Telnyx</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  { text: "Unlimited contacts", included: true },
                  { text: "Unlimited groups", included: true },
                  { text: "SMS messaging", included: true },
                  { text: "Scheduled messages", included: true },
                  { text: "Message templates", included: true },
                  { text: "CSV import/export", included: true },
                  { text: "Compliance tools", included: true },
                  { text: "iMessage/RCS", included: false },
                  { text: "Skip A2P registration", included: false },
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/signup">
                <Button size="lg" variant="outline" className="w-full text-lg">
                  Get Started Free
                </Button>
              </Link>
            </motion.div>

            {/* Blue Shared */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden transform md:-translate-y-4 md:scale-105"
            >
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Most Popular
              </div>
              
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <Apple className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Blue Shared</h3>
                <p className="text-blue-100">iMessage + RCS Included</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold">$197</span>
                <span className="text-blue-100">/month</span>
                <p className="text-sm text-blue-200 mt-2">$0 per message</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  { text: "Everything in Free, plus:", included: true, highlight: true },
                  { text: "iMessage + RCS messaging", included: true },
                  { text: "20 new contacts/day*", included: true },
                  { text: "$0.00 per message", included: true },
                  { text: "No A2P registration", included: true },
                  { text: "3x higher reply rates", included: true },
                  { text: "Shared infrastructure", included: true },
                  { text: "Priority support", included: true },
                ].map((feature, i) => (
                  <li key={i} className={`flex items-center gap-3 ${feature.highlight ? 'text-blue-200' : ''}`}>
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-blue-200 mb-4">*Unlimited messages to existing contacts who have replied.</p>
              
              <Link href="/blue">
                <Button size="lg" className="w-full text-lg bg-white text-blue-600 hover:bg-blue-50">
                  Learn More <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

            {/* Blue Dedicated */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Blue Dedicated</h3>
                <p className="text-gray-600">Your Own Infrastructure</p>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900">$397</span>
                <span className="text-gray-600">/month</span>
                <p className="text-sm text-green-600 mt-2">Coming down to $247 soon!</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  { text: "Everything in Blue Shared, plus:", included: true, highlight: true },
                  { text: "Unlimited new contacts*", included: true },
                  { text: "Dedicated sending infrastructure", included: true },
                  { text: "Dedicated phone numbers", included: true },
                  { text: "Higher throughput", included: true },
                  { text: "White-glove onboarding", included: true },
                  { text: "Direct phone support", included: true },
                  { text: "Ideal for 1000+ contacts", included: true },
                ].map((feature, i) => (
                  <li key={i} className={`flex items-center gap-3 ${feature.highlight ? 'text-purple-600' : ''}`}>
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mb-4">*Subject to Apple's rate limits. Must follow messaging best practices.</p>
              
              <Link href="/blue">
                <Button size="lg" variant="outline" className="w-full text-lg border-purple-200 text-purple-600 hover:bg-purple-50">
                  Contact Us <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-2xl p-8 shadow-lg border"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Free Tier Cost Calculator</h3>
                <p className="text-gray-600">Estimate your monthly messaging costs</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many messages do you send per month?
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={messageCount}
                  onChange={(e) => setMessageCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>100</span>
                  <span className="text-xl font-bold text-gray-900">{messageCount.toLocaleString()} messages</span>
                  <span>5,000</span>
                </div>
              </div>
              
              <div className="bg-brand-50 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Estimated Monthly Cost (Twilio)</p>
                <p className="text-4xl font-bold text-brand-600">${estimatedCost}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Based on ${costPerMessage.toFixed(4)} per SMS segment
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
                <p className="text-sm text-blue-100 mb-2">Or switch to Blue Shared</p>
                <p className="text-4xl font-bold">$197/month</p>
                <p className="text-sm text-blue-200 mt-2">
                  iMessage + RCS messaging included
                </p>
                <p className="text-sm text-green-300 mt-2">
                  {messageCount > 2493 ? (
                    <span>You'd save ${(parseFloat(estimatedCost) - 197).toFixed(2)}/month with Blue!</span>
                  ) : (
                    <span>Blue makes sense at ~2,500+ messages/month (plus higher reply rates!)</span>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Detailed Feature Comparison</h2>
            <p className="text-gray-600">Everything you need to know about each plan</p>
          </motion.div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-600">Blue Shared</th>
                  <th className="text-center py-4 px-4 font-semibold text-purple-600">Blue Dedicated</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Platform Fee', free: '$0', shared: '$197/mo', dedicated: '$397/mo*' },
                  { feature: 'Message Cost', free: '~$0.0079/msg', shared: '$0.00', dedicated: '$0.00' },
                  { feature: 'New Contacts/Day', free: 'Unlimited', shared: '20/day', dedicated: 'Unlimited' },
                  { feature: 'Groups', free: 'Unlimited', shared: 'Unlimited', dedicated: 'Unlimited' },
                  { feature: 'SMS', free: true, shared: true, dedicated: true },
                  { feature: 'iMessage', free: false, shared: true, dedicated: true },
                  { feature: 'RCS', free: false, shared: true, dedicated: true },
                  { feature: 'Scheduled Messages', free: true, shared: true, dedicated: true },
                  { feature: 'Templates', free: true, shared: true, dedicated: true },
                  { feature: 'Merge Tags', free: true, shared: true, dedicated: true },
                  { feature: 'Compliance Tools', free: true, shared: true, dedicated: true },
                  { feature: 'A2P Registration Required', free: true, shared: false, dedicated: false },
                  { feature: 'Reply Rates', free: 'Lower', shared: '3x Higher', dedicated: '3x Higher' },
                  { feature: 'Dedicated Infrastructure', free: false, shared: false, dedicated: true },
                  { feature: 'Priority Support', free: false, shared: true, dedicated: true },
                  { feature: 'Phone Support', free: false, shared: false, dedicated: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-gray-600">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center bg-blue-50/50">
                      {typeof row.shared === 'boolean' ? (
                        row.shared ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-blue-600 font-medium">{row.shared}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.dedicated === 'boolean' ? (
                        row.dedicated ? <CheckCircle2 className="w-5 h-5 text-purple-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-purple-600 font-medium">{row.dedicated}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-gray-500 mt-4">* Blue Dedicated coming down to $247/mo soon as we sign on more churches</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Got questions? We've got answers.</p>
          </motion.div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Church Communication?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start with the Free tier and upgrade when you're ready. No commitment, no risk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 w-full sm:w-auto">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
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
