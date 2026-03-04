'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface ChurchData {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  providerPhoneNumber: string | null;
  businessType: string | null;
  provider: string | null;
}

export default function ChurchPrivacyPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [church, setChurch] = React.useState<ChurchData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (slug) {
      fetchChurchInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchChurchInfo = async () => {
    try {
      const res = await fetch(`/api/c/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        throw new Error('Failed to load church information');
      }
      const data = await res.json();
      setChurch(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = () => {
    if (!church) return null;
    const parts = [church.address, church.city, church.state, church.zip].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const providerName = church?.provider === 'telnyx' ? 'Telnyx' : 'Twilio';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound || !church) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
          <p className="text-gray-600">This privacy policy page is not available. Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  const fullAddress = formatAddress();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={`/c/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {church.name}
          </Link>
          {church.logoUrl && (
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              <Image
                src={church.logoUrl}
                alt={`${church.name} logo`}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-[#C28C88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-gray-500">Last Updated: March 2026</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              This privacy policy applies to text messaging services provided by {church.name}.
            </p>
          </div>

          {/* Policy Content */}
          <div className="prose prose-gray max-w-none">
            {/* 1. Introduction */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              1. Introduction
            </h2>
            <p className="text-gray-600 mb-4">
              {church.name} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting
              the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you opt in to receive text messages from us.
            </p>
            <p className="text-gray-600 mb-4">
              By providing your phone number and consenting to receive text messages, you agree to the practices described in this policy.
            </p>

            {/* 2. Information We Collect */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              2. Information We Collect
            </h2>
            <p className="text-gray-600 mb-4">
              When you sign up to receive text messages from {church.name}, we may collect the following information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Name</strong> (first name and last name)</li>
              <li><strong>Phone number</strong> (required for text messaging)</li>
              <li><strong>Email address</strong> (optional)</li>
              <li><strong>Messaging preferences</strong> (marketing vs. non-marketing consent)</li>
              <li><strong>Opt-in and opt-out records</strong> (dates and timestamps for compliance)</li>
            </ul>

            {/* 3. How We Use Your Information */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Send text messages you have consented to receive</li>
              <li>Deliver church event reminders, service time updates, and ministry announcements</li>
              <li>Send prayer requests and spiritual encouragement</li>
              <li>Provide important church communications and updates</li>
              <li>Respond to your inquiries or HELP requests</li>
              <li>Maintain opt-in and opt-out records for legal compliance</li>
            </ul>

            {/* 4. SMS/Text Message Consent */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              4. SMS/Text Message Consent
            </h2>
            <p className="text-gray-600 mb-4">
              By opting in to receive text messages from {church.name}, you expressly consent to receive recurring
              text messages at the phone number you provided. Consent is not a condition of any purchase or service.
            </p>
            <p className="text-gray-600 mb-4">
              We offer two categories of text messages, each requiring separate consent:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Marketing messages:</strong> Special offers, promotions, discounts, and service updates</li>
              <li><strong>Non-marketing messages:</strong> Service times, event reminders, prayer requests, and ministry updates</li>
            </ul>
            <p className="text-gray-600 mb-4">
              <strong>You may opt out at any time</strong> by replying <strong>STOP</strong> to any text message.
              After opting out, you will receive one final confirmation message. You may also opt out by
              visiting our unsubscribe page.
            </p>
            <p className="text-gray-600 mb-4">
              For help, reply <strong>HELP</strong> to any text message
              {church.phone ? (
                <> or contact us at {church.phone}</>
              ) : church.email ? (
                <> or contact us at {church.email}</>
              ) : null}
              .
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> No mobile information will be shared with third parties or affiliates for
                marketing or promotional purposes. All other categories exclude text messaging originator opt-in data
                and consent; this information will not be shared with any third parties.
              </p>
            </div>

            {/* 5. Information Sharing */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              5. Information Sharing
            </h2>
            <p className="text-gray-600 mb-4">
              We use {providerName} as our third-party messaging service provider to deliver text messages on our behalf.
              Your phone number and message content are shared with {providerName} solely for the purpose of message delivery.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>We do not sell, rent, or trade your personal information to third parties.</strong>
            </p>
            <p className="text-gray-600 mb-4">
              We may disclose your information only when:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Required by law, court order, or government regulation</li>
              <li>Necessary to protect the rights, safety, or property of {church.name}</li>
              <li>You have provided explicit consent</li>
            </ul>

            {/* 6. Data Security */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              6. Data Security
            </h2>
            <p className="text-gray-600 mb-4">
              We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure.
              Security measures include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure storage of contact information in encrypted databases</li>
              <li>Access controls limiting who can view your information</li>
              <li>Regular security reviews and monitoring</li>
            </ul>
            <p className="text-gray-600 mb-4">
              While we strive to protect your data, no method of electronic transmission or storage is completely secure.
              We cannot guarantee absolute security.
            </p>

            {/* 7. Your Rights */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              7. Your Rights
            </h2>
            <p className="text-gray-600 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li><strong>Access</strong> the personal information we hold about you</li>
              <li><strong>Correct</strong> inaccurate or incomplete information</li>
              <li><strong>Delete</strong> your personal data from our records</li>
              <li><strong>Opt out</strong> of text messages at any time by replying STOP</li>
              <li><strong>Withdraw consent</strong> for specific message categories</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise any of these rights, contact us using the information provided below.
            </p>

            {/* 8. Data Retention */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              8. Data Retention
            </h2>
            <p className="text-gray-600 mb-4">
              We retain your personal information for as long as you are opted in to receive text messages from us.
              If you opt out, we will retain your opt-out record for compliance purposes to ensure we do not contact you again.
            </p>
            <p className="text-gray-600 mb-4">
              Opt-in and opt-out records may be retained for up to 5 years to comply with regulatory requirements
              and demonstrate consent history.
            </p>

            {/* 9. Children's Privacy */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              9. Children&apos;s Privacy
            </h2>
            <p className="text-gray-600 mb-4">
              Our text messaging service is not intended for individuals under the age of 13. We do not knowingly collect
              personal information from children under 13. If you believe we have inadvertently collected information from
              a child, please contact us immediately so we can delete it.
            </p>

            {/* 10. Changes to This Policy */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              10. Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. When we make changes, we will update the
              &quot;Last Updated&quot; date at the top of this page. We encourage you to review this policy periodically.
              Your continued participation in our text messaging program after any changes constitutes your acceptance
              of the updated policy.
            </p>

            {/* 11. Contact Us */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              11. Contact Us
            </h2>
            <p className="text-gray-600 mb-4">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 mb-4">
              <p className="text-gray-900 font-semibold mb-3">{church.name}</p>
              <ul className="text-gray-600 space-y-2 text-sm">
                {church.email && (
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${church.email}`} className="text-[#C28C88] hover:underline">{church.email}</a>
                  </li>
                )}
                {church.phone && (
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{church.phone}</span>
                  </li>
                )}
                {fullAddress && (
                  <li className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{fullAddress}</span>
                  </li>
                )}
                {church.website && (
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a href={church.website.startsWith('http') ? church.website : `https://${church.website}`} target="_blank" rel="noopener noreferrer" className="text-[#C28C88] hover:underline">
                      {church.website}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href={`/c/${slug}`} className="hover:text-gray-900 transition-colors">
              Opt In
            </Link>
            <Link href={`/c/${slug}/terms`} className="hover:text-gray-900 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-5 w-5">
              <Image
                src="/church_posting_logo.png"
                alt="Free Church Texting"
                fill
                className="object-contain"
              />
            </div>
            <a
              href="https://freechurchtexting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Powered by Free Church Texting
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
