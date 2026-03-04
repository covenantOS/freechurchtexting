'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, FileText, Scale, Shield, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
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
                <Scale className="h-6 w-6 text-[#C28C88]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                <p className="text-gray-500">Last Updated: March 3, 2026</p>
              </div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 mb-4">
              By accessing, using, or paying for Free Church Texting or Church Posting Blue (collectively, the "Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Service.
            </p>
            <p className="text-gray-600 mb-4">
              Free Church Texting is operated by Church Posting ("we," "us," or "our"). You must be of legal age to enter into this agreement. By using the Service, you represent that you are at least 18 years old.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              2. Service Description
            </h2>
            <p className="text-gray-600 mb-4">
              <strong>Free Church Texting (Free Tier):</strong> A platform that allows churches to send SMS messages using their own Twilio or Telnyx account. You pay your provider directly for messaging costs; we charge no subscription fees.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Church Posting Blue (Premium Tier):</strong> A premium messaging service that enables iMessage and RCS messaging through our infrastructure. Blue tier includes Shared Enterprise ($249/month) and Dedicated ($397/month) plans.
            </p>
            <p className="text-gray-600 mb-4">
              The Service is provided "AS IS" and "AS AVAILABLE" without warranties. We do not control third-party services (Twilio, Telnyx, Apple iMessage, etc.) and are not responsible for their availability or terms.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#C28C88]" />
              3. User Obligations & Compliance
            </h2>
            <p className="text-gray-600 mb-4">
              You are solely responsible for ensuring your use of the Service complies with all applicable laws, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>TCPA Compliance:</strong> You must obtain prior express consent from recipients before sending text messages. This is a legal requirement, not optional.</li>
              <li><strong>A2P 10DLC Registration:</strong> For Free Tier users sending SMS via Twilio/Telnyx, you may need to register your campaign with carriers.</li>
              <li><strong>Opt-Out Handling:</strong> You must honor STOP requests immediately and maintain opt-out records.</li>
              <li><strong>Content Restrictions:</strong> You may not send spam, illegal content, or messages that harass or deceive recipients.</li>
            </ul>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 text-sm flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <strong>Important:</strong> We are a technology platform, not a legal compliance service. You are responsible for understanding and following messaging laws in your jurisdiction.
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              4. Church Posting Blue — iMessage Terms
            </h2>
            <p className="text-gray-600 mb-4">
              Church Posting Blue utilizes iMessage and RCS messaging infrastructure. By using Blue:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>You acknowledge that Apple may impose restrictions or rate limits on iMessage usage at any time.</li>
              <li>"Unlimited messaging" is subject to Apple's fair use policies and infrastructure limitations—not our own restrictions.</li>
              <li>You must still obtain consent from recipients before messaging them.</li>
              <li>Cold outreach (contacting individuals without prior consent or relationship) is strictly prohibited.</li>
              <li>Violation of these terms results in immediate account termination without refund.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              5. Prohibited Uses
            </h2>
            <p className="text-gray-600 mb-4">You may not use the Service to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Send spam, unsolicited messages, or violate anti-spam laws</li>
              <li>Harass, threaten, or discriminate against anyone</li>
              <li>Send illegal, deceptive, or fraudulent content</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Attempt to reverse engineer, hack, or circumvent our systems</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use the Service for any commercial mass-marketing purposes unrelated to church ministry</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              6. Payment & Refunds
            </h2>
            <p className="text-gray-600 mb-4">
              <strong>Free Tier:</strong> No payment to Church Posting. You pay Twilio or Telnyx directly.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Blue Tier:</strong> Subscription fees are billed monthly in advance. Refunds may be issued only if no messages have been sent through the Service. Once a single message is sent, all payments are final and non-refundable.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>A2P Registration Service ($197):</strong> This is a one-time service fee. No refunds after work has begun on your registration.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              7. Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, Church Posting and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill.
            </p>
            <p className="text-gray-600 mb-4">
              Our aggregate liability is limited to the amount you paid us in the three months prior to the event giving rise to the claim, or $100, whichever is greater.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              8. Indemnification
            </h2>
            <p className="text-gray-600 mb-4">
              You agree to indemnify and hold Church Posting harmless from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or violation of any law or third-party rights.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              9. Termination
            </h2>
            <p className="text-gray-600 mb-4">
              We may suspend or terminate your access at any time, with or without cause, with or without notice. Upon termination, your right to use the Service ceases immediately. Provisions relating to intellectual property, disclaimers, indemnification, and limitations of liability survive termination.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              10. Governing Law
            </h2>
            <p className="text-gray-600 mb-4">
              These Terms are governed by the laws of the State of Florida, USA, without regard to conflict of law principles.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#C28C88]" />
              11. Contact
            </h2>
            <p className="text-gray-600 mb-4">
              Questions about these Terms? Contact us at <a href="mailto:hello@churchposting.com" className="text-[#C28C88] hover:underline">hello@churchposting.com</a> or use our <Link href="/contact" className="text-[#C28C88] hover:underline">contact form</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" showByline={true} />
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
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
