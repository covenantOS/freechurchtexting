'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, MessageSquare, Shield } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const product = searchParams.get('product');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getProductDetails = () => {
    switch (product) {
      case 'a2p':
        return {
          title: 'A2P 10DLC Registration',
          description: 'Thank you for purchasing our A2P registration service! Our team will reach out within 24-48 hours to begin the registration process.',
          icon: Shield,
          nextSteps: [
            'Our team will email you within 24-48 hours',
            'We\'ll gather your business information',
            'We\'ll handle the complete registration process',
            'You\'ll be notified once approved (typically 1-2 weeks)',
          ],
        };
      case 'blue-shared':
        return {
          title: 'Church Posting Blue - Shared Enterprise',
          description: 'Welcome to Church Posting Blue! Your iMessage + RCS messaging service is being set up.',
          icon: MessageSquare,
          nextSteps: [
            'Our team will contact you within 24 hours',
            'We\'ll set up your dedicated sending infrastructure',
            'You\'ll receive onboarding materials via email',
            'Start reaching contacts with 92%+ reply rates!',
          ],
        };
      case 'blue-dedicated':
        return {
          title: 'Church Posting Blue - Dedicated',
          description: 'Welcome to Church Posting Blue Dedicated! Your personal iMessage + RCS infrastructure is being provisioned.',
          icon: MessageSquare,
          nextSteps: [
            'Our team will contact you within 24 hours',
            'We\'ll provision your dedicated sending infrastructure',
            'Full onboarding call will be scheduled',
            'Unlimited messaging with premium deliverability!',
          ],
        };
      default:
        return {
          title: 'Payment Successful',
          description: 'Thank you for your purchase!',
          icon: CheckCircle,
          nextSteps: ['Our team will be in touch shortly.'],
        };
    }
  };

  const details = getProductDetails();
  const IconComponent = details.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Logo size="md" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {details.title}
          </h1>

          <p className="text-gray-600 mb-8">
            {details.description}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 text-left mb-8">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <IconComponent className="w-5 h-5 text-[#C28C88]" />
              What happens next?
            </h3>
            <ul className="space-y-3">
              {details.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#C28C88] text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#111827] text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blue"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Learn More About Blue
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
