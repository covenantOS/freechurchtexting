'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, X, Sparkles, Zap, MessageSquare, Bot } from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';

interface UpsellConfig {
  trigger: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: React.ElementType;
  tier: 'free' | 'blue_shared'; // show to users on this tier or below
}

const UPSELLS: UpsellConfig[] = [
  {
    trigger: 'messages_blast_sent',
    title: 'Make blasts more effective',
    description: 'Random sending mode spaces out your messages so they feel personal, not mass-sent. Available on all plans.',
    cta: 'Try Random Mode',
    href: '/messages?tab=compose&type=group',
    icon: Zap,
    tier: 'free',
  },
  {
    trigger: 'messages_compose',
    title: 'Let AI write your messages',
    description: 'AI Message Writer learns your church\'s voice and drafts messages for any occasion. Upgrade to Blue.',
    cta: 'Learn About Blue',
    href: '/blue',
    icon: Sparkles,
    tier: 'free',
  },
  {
    trigger: 'contacts_growing',
    title: 'Skip A2P with iMessage',
    description: 'Blue plan uses iMessage + RCS — no A2P registration needed, 92% reply rates.',
    cta: 'See Blue Plans',
    href: '/blue',
    icon: MessageSquare,
    tier: 'free',
  },
  {
    trigger: 'conversations_active',
    title: 'Auto-reply to common questions',
    description: 'Set up keyword-based auto-replies for service times, directions, and more. Blue Dedicated only.',
    cta: 'Upgrade to Dedicated',
    href: '/blue',
    icon: Bot,
    tier: 'blue_shared',
  },
];

interface SmartUpsellProps {
  trigger: string;
}

export function SmartUpsell({ trigger }: SmartUpsellProps) {
  const { effectiveSubscriptionTier } = useAdmin();
  const [dismissed, setDismissed] = React.useState(false);

  const tier = effectiveSubscriptionTier || 'free';
  const upsell = UPSELLS.find((u) => u.trigger === trigger);

  if (!upsell || dismissed) return null;

  // Don't show if user is already on the tier that has this feature
  const tierRank: Record<string, number> = { free: 0, blue_shared: 1, blue_dedicated: 2 };
  if ((tierRank[tier] || 0) > (tierRank[upsell.tier] || 0)) return null;

  const Icon = upsell.icon;

  return (
    <div className="relative bg-gradient-to-r from-slate-50 to-brand-50 border border-brand-100 rounded-lg p-4 flex items-start gap-3">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{upsell.title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{upsell.description}</p>
        <Link
          href={upsell.href}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 mt-2"
        >
          {upsell.cta}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
