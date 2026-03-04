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

export default function ChurchTermsPage() {
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
          <p className="text-gray-600">This terms page is not available. Please check the link and try again.</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Terms &amp; Conditions</h1>
                <p className="text-gray-500">Last Updated: March 2026</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              These terms apply to text messaging services provided by {church.name}.
            </p>
          </div>

          {/* Terms Content */}
          <div className="prose prose-gray max-w-none">
            {/* 1. Acceptance of Terms */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 mb-4">
              By opting in to receive text messages from {church.name}, you agree to be bound by these Terms &amp; Conditions.
              If you do not agree with any part of these terms, please do not opt in to our text messaging program.
            </p>
            <p className="text-gray-600 mb-4">
              You must be at least 13 years of age to opt in to receive text messages. By providing your phone number,
              you represent that you are the account holder or have the account holder&apos;s permission to receive text messages
              at the number provided.
            </p>

            {/* 2. Text Message Service Description */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              2. Text Message Service Description
            </h2>
            <p className="text-gray-600 mb-4">
              {church.name} provides a text messaging service for church communications. By subscribing, you may
              receive messages including but not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Church service times and schedule updates</li>
              <li>Event reminders and announcements</li>
              <li>Ministry updates and volunteer opportunities</li>
              <li>Prayer requests and spiritual encouragement</li>
              <li>Special promotions, offers, or fundraising campaigns (marketing messages)</li>
              <li>Important church notifications and emergency communications</li>
            </ul>

            {/* 3. Consent to Receive Messages */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              3. Consent to Receive Messages
            </h2>
            <p className="text-gray-600 mb-4">
              By opting in, you expressly consent to receive recurring automated text messages from {church.name} at the
              phone number you provided. You understand that:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Consent is not a condition of any purchase, donation, or church membership</li>
              <li>You may receive two categories of messages: marketing and non-marketing, each requiring separate consent</li>
              <li>Messages may be sent using automated technology</li>
              <li>You may revoke consent at any time</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Dual Consent:</strong> We request separate consent for marketing messages (promotions, offers)
                and non-marketing messages (service times, event reminders). You may consent to one, both, or neither category.
              </p>
            </div>

            {/* 4. Message Frequency */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              4. Message Frequency
            </h2>
            <p className="text-gray-600 mb-4">
              Message frequency varies. Typically, you can expect to receive approximately 2 to 8 text messages per month,
              depending on church activities and your consent preferences. Message frequency may increase during special events,
              holiday seasons, or church campaigns.
            </p>

            {/* 5. Opt-Out Instructions */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              5. Opt-Out Instructions
            </h2>
            <p className="text-gray-600 mb-4">
              You may opt out of receiving text messages at any time by using any of the following methods:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Reply <strong>STOP</strong> to any text message you receive from us</li>
              <li>Visit our unsubscribe page at{' '}
                <Link href={`/opt-out/${church.id}`} className="text-[#C28C88] hover:underline">
                  our opt-out page
                </Link>
              </li>
              {church.email && (
                <li>Email us at{' '}
                  <a href={`mailto:${church.email}`} className="text-[#C28C88] hover:underline">{church.email}</a>
                  {' '}with the subject &quot;Unsubscribe&quot;
                </li>
              )}
            </ul>
            <p className="text-gray-600 mb-4">
              After opting out, you will receive one final confirmation message. Please allow up to 24 hours
              for your request to be fully processed. You may re-subscribe at any time by visiting our opt-in page.
            </p>

            {/* 6. Message and Data Rates */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              6. Message and Data Rates
            </h2>
            <p className="text-gray-600 mb-4">
              Standard message and data rates may apply depending on your mobile carrier and plan.
              {church.name} is not responsible for any charges incurred from your mobile carrier for sending
              or receiving text messages. Please contact your mobile carrier for details about your text messaging plan.
            </p>

            {/* 7. HELP */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              7. HELP
            </h2>
            <p className="text-gray-600 mb-4">
              For support with our text messaging service, you may:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Reply <strong>HELP</strong> to any text message for assistance</li>
              {church.phone && (
                <li>Call us at <strong>{church.phone}</strong></li>
              )}
              {church.email && (
                <li>Email us at{' '}
                  <a href={`mailto:${church.email}`} className="text-[#C28C88] hover:underline">{church.email}</a>
                </li>
              )}
              {church.providerPhoneNumber && (
                <li>Text us at <strong>{church.providerPhoneNumber}</strong></li>
              )}
            </ul>

            {/* 8. Privacy */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              8. Privacy
            </h2>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. For full details on how we collect, use, and protect your information,
              please review our{' '}
              <Link href={`/c/${slug}/privacy`} className="text-[#C28C88] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-gray-600 mb-4">
              We do not sell, rent, or share your personal information or phone number with third parties for marketing purposes.
              Your information is used solely for the purposes described in our Privacy Policy.
            </p>

            {/* 9. Limitation of Liability */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              9. Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-4">
              {church.name} and its representatives shall not be liable for any delays, failures, or interruptions in the
              delivery of text messages. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Messages that are delayed, lost, or not delivered due to carrier or network issues</li>
              <li>Any charges imposed by your mobile carrier</li>
              <li>Actions taken by you based on the content of our text messages</li>
              <li>Technical issues with mobile devices, software, or carriers</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To the maximum extent permitted by law, our total liability for any claims related to the text messaging
              service shall not exceed $100.
            </p>

            {/* 10. Changes to Terms */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              10. Changes to Terms
            </h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these Terms &amp; Conditions at any time. Changes will be effective
              immediately upon posting on this page, and the &quot;Last Updated&quot; date will be revised accordingly.
              Your continued participation in our text messaging program after changes have been posted constitutes
              your acceptance of the revised terms.
            </p>

            {/* 11. Contact */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-[#C28C88] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              11. Contact
            </h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms &amp; Conditions, please contact us:
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
            <Link href={`/c/${slug}/privacy`} className="hover:text-gray-900 transition-colors">
              Privacy Policy
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
