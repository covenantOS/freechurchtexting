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
}

export default function ChurchOptInPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [church, setChurch] = React.useState<ChurchData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [marketingConsent, setMarketingConsent] = React.useState(false);
  const [nonMarketingConsent, setNonMarketingConsent] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

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
    } catch (err: any) {
      setError(err.message || 'Failed to load church information');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/c/${slug}/opt-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          phone: digits,
          email: email.trim() || undefined,
          marketingConsent,
          nonMarketingConsent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !church) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Church Not Found</h2>
          <p className="text-gray-600">This page is not available. Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          {church.logoUrl && (
            <div className="relative h-16 w-16 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src={church.logoUrl}
                alt={`${church.name} logo`}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">You&apos;re Subscribed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for signing up to receive text messages from <strong>{church.name}</strong>.
            You can opt out at any time by texting STOP or using the link below.
          </p>
          <Link
            href={`/opt-out/${church.id}`}
            className="text-sm text-brand-600 hover:text-brand-800 underline"
          >
            Need to unsubscribe?
          </Link>
        </div>
        <footer className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="relative h-5 w-5">
              <Image
                src="/church_posting_logo.png"
                alt="Free Church Texting"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">Free Church Texting</span>
          </div>
          <p className="text-xs text-gray-400">
            Secure and compliant church messaging
          </p>
        </footer>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50">
      {/* Hero Image */}
      {church.heroImageUrl && (
        <div className="relative w-full h-48 sm:h-64 md:h-72">
          <Image
            src={church.heroImageUrl}
            alt={`${church.name} hero`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-brand-50/80" />
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className={`text-center ${church.heroImageUrl ? '-mt-12 relative z-10' : 'mt-8'} mb-6`}>
            {/* Logo */}
            {church.logoUrl ? (
              <div className="relative h-20 w-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                <Image
                  src={church.logoUrl}
                  alt={`${church.name} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center h-14 w-14 bg-brand-100 rounded-full mb-4">
                <svg className="h-7 w-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Stay Connected with {church.name}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Sign up to receive text messages and stay in the loop with what&apos;s happening.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
                  <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-4 pt-2">
                <p className="text-sm font-medium text-gray-700">Message Preferences</p>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    I consent to receive marketing text messages, about special offers, discounts, and service updates, from{' '}
                    <strong>{church.name}</strong> at the phone number provided. Message frequency may vary. Message &amp; data
                    rates may apply. Text HELP for assistance, reply STOP to opt out.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={nonMarketingConsent}
                    onChange={(e) => setNonMarketingConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    I consent to receive non-marketing text messages from{' '}
                    <strong>{church.name}</strong> about service times, event reminders, and ministry updates. Message frequency
                    may vary, message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 outline-none"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe to Text Messages'
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By submitting this form, you agree to our{' '}
                <Link href={`/c/${slug}/terms`} className="text-brand-600 hover:underline" target="_blank">
                  Terms &amp; Conditions
                </Link>{' '}
                and{' '}
                <Link href={`/c/${slug}/privacy`} className="text-brand-600 hover:underline" target="_blank">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>

          {/* Opt-out link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already subscribed?{' '}
              <Link
                href={`/opt-out/${church.id}`}
                className="text-brand-600 hover:text-brand-800 underline"
              >
                Unsubscribe here
              </Link>
            </p>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
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
                className="text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors"
              >
                Powered by Free Church Texting
              </a>
            </div>
            <p className="text-xs text-gray-400">
              Secure and compliant church messaging
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
