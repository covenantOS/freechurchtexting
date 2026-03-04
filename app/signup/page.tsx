'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mail, User, Church, Bell, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    churchName: '',
  });
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session?.user?.onboardingCompleted) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-amber-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" showByline={true} className="mb-4" />
          <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-brand-400 to-brand-600 text-white rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Coming Soon
          </div>
        </div>

        {success ? (
          <Card className="shadow-lg border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re on the list!</h2>
              <p className="text-gray-600 mb-4">
                Thanks for signing up, {formData.name.split(' ')[0]}! We&apos;ll notify you at{' '}
                <span className="font-medium text-brand-600">{formData.email}</span> when Free Church Texting is ready for {formData.churchName || 'your church'}.
              </p>
              <p className="text-sm text-gray-500">
                In the meantime, check out{' '}
                <a href="https://churchposting.com" target="_blank" rel="noopener" className="text-[#C28C88] hover:underline font-medium">
                  Church Posting
                </a>{' '}
                for more church growth tools.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Bell className="h-5 w-5 text-brand-500" />
                Register for Early Access
              </CardTitle>
              <CardDescription>
                Be the first to know when we launch. We&apos;ll send you a personal invite.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                    icon={<User className="h-4 w-4" />}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Church Name</label>
                  <Input
                    type="text"
                    value={formData.churchName}
                    onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                    placeholder="Grace Community Church"
                    icon={<Church className="h-4 w-4" />}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@church.org"
                    icon={<Mail className="h-4 w-4" />}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Joining...' : 'Join the Waitlist'}
                  {!loading && <Bell className="h-4 w-4 ml-2" />}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-brand-600 hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          A free product by{' '}
          <a href="https://churchposting.com" target="_blank" rel="noopener" className="text-[#C28C88] hover:underline">
            Church Posting
          </a>
        </p>
      </div>
    </div>
  );
}
