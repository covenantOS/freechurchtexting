'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function OptOutPage() {
  const params = useParams();
  const churchId = params?.churchId as string;

  const [churchName, setChurchName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  const [phone, setPhone] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (churchId) {
      fetchChurchInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churchId]);

  const fetchChurchInfo = async () => {
    try {
      const res = await fetch(`/api/opt-in/${churchId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        throw new Error('Failed to load church information');
      }
      const data = await res.json();
      setChurchName(data.name);
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

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/opt-out/${churchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Church Not Found</h2>
          <p className="text-gray-600">This opt-out page is not available. Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Unsubscribed</h2>
          <p className="text-gray-600 mb-6">
            If your number was on our list, you have been unsubscribed from text messages from{' '}
            <strong>{churchName}</strong>. You will no longer receive messages.
          </p>
          <Link
            href={`/opt-in/${churchId}`}
            className="text-sm text-brand-600 hover:text-brand-800 underline"
          >
            Changed your mind? Subscribe again
          </Link>
        </div>
        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <a
              href="https://freechurchtexting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 underline"
            >
              Free Church Texting
            </a>
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-gray-100 rounded-full mb-4">
            <svg className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Unsubscribe
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Opt out of text messages from <strong>{churchName}</strong>
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
              <p className="mt-1.5 text-xs text-gray-500">
                Enter the phone number you used to subscribe.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 outline-none"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Unsubscribing...
                </span>
              ) : (
                'Unsubscribe'
              )}
            </button>
          </form>
        </div>

        {/* Opt-in link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Want to subscribe instead?{' '}
            <Link
              href={`/opt-in/${churchId}`}
              className="text-brand-600 hover:text-brand-800 underline"
            >
              Sign up here
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
            <span className="text-xs text-gray-400 font-medium">Free Church Texting</span>
          </div>
          <p className="text-xs text-gray-400">
            Secure and compliant church messaging
          </p>
        </footer>
      </div>
    </div>
  );
}
