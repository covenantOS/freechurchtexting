'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" showByline={true} />
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Button asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Back Link */}
      <div className="pt-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-[#111827] rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#C28C88]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-500">Last Updated: March 3, 2026</p>
              </div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6 text-lg">
              Church Posting ("we," "us," or "our") operates Free Church Texting and Church Posting Blue. This Privacy Policy explains how we collect, use, and protect your information.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#C28C88]" />
              1. Information We Collect
            </h2>
            <p className="text-gray-600 mb-4"><strong>Account Information:</strong></p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Name, email address, church name</li>
              <li>Login credentials (passwords are encrypted)</li>
              <li>Billing information (processed by Stripe; we don't store card numbers)</li>
            </ul>
            <p className="text-gray-600 mb-4"><strong>Messaging Data:</strong></p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Contact information you upload (names, phone numbers, emails)</li>
              <li>Message content and templates you create</li>
              <li>Delivery status and engagement data</li>
              <li>Opt-in/opt-out records</li>
            </ul>
            <p className="text-gray-600 mb-4"><strong>Technical Information:</strong></p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>IP addresses, browser type, device information</li>
              <li>Usage logs and analytics data</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#C28C88]" />
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>To provide and operate the Service</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send transactional emails (welcome, password reset, etc.)</li>
              <li>To provide customer support</li>
              <li>To improve our products and develop new features</li>
              <li>To comply with legal obligations</li>
              <li>To protect against fraud and abuse</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#C28C88]" />
              3. Information Sharing
            </h2>
            <p className="text-gray-600 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Service Providers:</strong> Twilio, Telnyx (for SMS), Stripe (for payments), hosting providers, and analytics services</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share</li>
            </ul>
            <p className="text-gray-600 mb-4">
              <strong>We do not sell your personal information to third parties.</strong>
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#C28C88]" />
              4. Data Security
            </h2>
            <p className="text-gray-600 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Encryption at rest and in transit (TLS/SSL)</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>API credentials are encrypted before storage</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication requirements</li>
            </ul>
            <p className="text-gray-600 mb-4">
              No system is 100% secure. We cannot guarantee absolute security but strive to protect your data using reasonable safeguards.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#C28C88]" />
              5. Your Rights
            </h2>
            <p className="text-gray-600 mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise these rights, contact us at <a href="mailto:privacy@churchposting.com" className="text-[#C28C88] hover:underline">privacy@churchposting.com</a>.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-[#C28C88]" />
              6. Data Retention
            </h2>
            <p className="text-gray-600 mb-4">
              We retain your data for as long as your account is active or as needed to provide services. After account deletion:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Most data is deleted within 30 days</li>
              <li>Some data may be retained for legal/compliance purposes (up to 7 years for financial records)</li>
              <li>Aggregated, anonymized data may be retained indefinitely</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#C28C88]" />
              7. Cookies
            </h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Authentication and session management</li>
              <li>Remembering your preferences</li>
              <li>Analytics and performance monitoring</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#C28C88]" />
              8. Children's Privacy
            </h2>
            <p className="text-gray-600 mb-4">
              Our Service is not intended for children under 13. We do not knowingly collect information from children. If you believe we have collected data from a child, please contact us immediately.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#C28C88]" />
              9. Contact Us
            </h2>
            <p className="text-gray-600 mb-4">
              For privacy-related questions or concerns:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Email: <a href="mailto:privacy@churchposting.com" className="text-[#C28C88] hover:underline">privacy@churchposting.com</a></li>
              <li>Contact form: <Link href="/contact" className="text-[#C28C88] hover:underline">freechurchtexting.com/contact</Link></li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#C28C88]" />
              10. Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the Service. Your continued use after changes constitutes acceptance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" showByline={true} />
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          © 2026{' '}
          <a href="https://churchposting.com" target="_blank" rel="noopener noreferrer" className="text-[#C28C88] hover:underline">
            Church Posting
          </a>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
}
