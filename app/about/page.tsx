'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Heart,
  Church,
  MessageSquare,
  Users,
  ArrowRight,
  Apple,
  Star,
  CheckCircle2,
  Globe,
  Target,
  MessageSquareText,
  BookOpen,
  HandHeart,
  Cross,
  Lightbulb,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Ministry First",
      description: "We're not building software for the sake of technology. Every feature exists to serve the local church and help pastors connect with their people."
    },
    {
      icon: BookOpen,
      title: "Gospel-Centered",
      description: "Our work is ministry. We believe communication tools should help churches share the good news of Jesus Christ more effectively."
    },
    {
      icon: HandHeart,
      title: "Servant Posture",
      description: "We serve churches. If something isn't working for you, it's our problem to fix. Your success is our success."
    },
    {
      icon: Lightbulb,
      title: "Simple & Honest",
      description: "No complicated pricing. No hidden fees. No pushy sales tactics. Just straightforward tools that work."
    },
  ];

  const stats = [
    { number: "98%", label: "Text Open Rate" },
    { number: "3x", label: "Higher Reply Rates" },
    { number: "2-4", label: "Weeks Saved on A2P" },
    { number: "24hr", label: "Support Response" },
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
              <Link href="/about" className="text-brand-600 font-semibold">
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
      <section className="pt-32 pb-20 bg-gradient-to-b from-amber-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                <span>Built for the Church, by the Church</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                We Believe Every Church Deserves to <span className="text-amber-600">Connect Well</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Free Church Texting was born from a simple observation: churches were struggling to reach their congregations. Emails went unread. Announcements fell flat. Something had to change.
              </p>
              <div className="flex items-center gap-4">
                <Church className="w-12 h-12 text-amber-600" />
                <div>
                  <p className="font-semibold text-gray-900">A ministry of Church Posting</p>
                  <p className="text-gray-600">Serving churches since 2023</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/marketing/congregation.png"
                  alt="Church congregation in worship"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-500">Text open rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Our Story
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-xl leading-relaxed mb-6">
                Church Posting has been helping churches with their social media and communication since 2023. Along the way, we kept hearing the same complaint: "Emails go unread. Facebook posts get buried. How do we actually reach our people?"
              </p>
              
              <p className="leading-relaxed mb-6">
                Pastors were frustrated. Email blasts had 18% open rates on a good day. Facebook posts disappeared into algorithmic obscurity. Phone trees were exhausting for volunteers. Meanwhile, every church member had a smartphone in their pocket that they checked 50 times a day.
              </p>
              
              <p className="leading-relaxed mb-6">
                <strong className="text-gray-900">Text messages had a 98% open rate.</strong> That stat hit different.
              </p>
              
              <p className="leading-relaxed mb-6">
                But the texting tools available were built for marketers, not ministers. They were complicated. Expensive. Full of features churches didn't need and missing ones they did. The pricing models were confusing, the setup required a tech degree, and the support teams didn't understand what a Wednesday night prayer meeting even was.
              </p>
              
              <p className="leading-relaxed mb-6">
                So in 2026, we decided to build something different.
              </p>
              
              <p className="leading-relaxed mb-6">
                <strong className="text-gray-900">Free Church Texting is built by people who get it.</strong> We understand that your "campaigns" are prayer chains and potluck reminders, not sales funnels. We know that your "audience segments" are the youth group and the choir. We get that you're not trying to maximize ROI — you're trying to shepherd your flock.
              </p>
              
              <p className="text-xl leading-relaxed font-medium text-gray-900">
                We built Free Church Texting to serve the local church. No venture capital agenda. No growth-at-all-costs mentality. Just simple, honest tools that help pastors connect with the people God has entrusted to their care.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-amber-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
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
              What We Believe
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our values aren't corporate buzzwords. They're convictions that shape how we build and serve.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
              
              return (
                <motion.div
                  key={index}
                  ref={ref}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="bg-amber-50 rounded-2xl p-8 border border-amber-100"
                >
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Church Posting Section */}
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
                Part of the Church Posting Family
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Free Church Texting is one piece of a larger mission. <strong className="text-gray-900">Church Posting</strong> exists to help churches communicate more effectively — whether that's through social media, text messaging, or the next communication channel that comes along.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We're not a tech company that happens to serve churches. We're church people who happen to build technology. The distinction matters.
              </p>
              <a href="https://churchposting.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="text-lg">
                  Visit Church Posting <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/marketing/greeter_door.png"
                  alt="Church greeter welcoming visitors"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Heart */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-8">
              <Cross className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              "Go therefore and make disciples..."
            </h2>
            <p className="text-xl text-gray-600 mb-8 italic">
              The Great Commission hasn't changed. But the tools available to fulfill it have. We're honored to play a small role in helping churches reach people with the message that matters most.
            </p>
            <p className="text-lg text-gray-900 font-semibold">
              Matthew 28:19-20
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Connect With Your Congregation?
            </h2>
            <p className="text-xl text-amber-100 mb-8">
              Join hundreds of churches who've discovered a better way to reach their people. Start for free today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-8 py-6 w-full sm:w-auto">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white bg-white/10 text-white hover:bg-white hover:text-amber-600 text-lg px-8 py-6 w-full sm:w-auto">
                  Talk to Us
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
