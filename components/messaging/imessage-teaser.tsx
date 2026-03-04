'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Sparkles,
  Apple,
  Smartphone,
  Lock,
  CheckCircle2,
  MessageCircle,
  Mic,
  Image,
  Video,
  FileText,
  ThumbsUp,
  Heart,
  Zap,
  ArrowRight,
  X,
} from 'lucide-react';

interface IMessageTeaserProps {
  variant?: 'pill' | 'banner' | 'card';
  className?: string;
}

export function IMessageTeaser({ variant = 'pill', className = '' }: IMessageTeaserProps) {
  const [showModal, setShowModal] = useState(false);

  const features = [
    { icon: MessageCircle, label: '92% Reply Rate', description: 'vs 20-30% with SMS' },
    { icon: Apple, label: 'iMessage Blue Bubbles', description: 'Trusted by iPhone users' },
    { icon: Mic, label: 'Voice Messages', description: 'Send audio notes' },
    { icon: Image, label: 'Images & Media', description: 'Rich media support' },
    { icon: Video, label: 'Video Messages', description: 'Up to 100MB videos' },
    { icon: ThumbsUp, label: 'Reactions & Tapbacks', description: 'Like, love, laugh' },
    { icon: FileText, label: 'Read Receipts', description: 'Know when they see it' },
    { icon: Zap, label: 'No A2P Required', description: 'Skip registration' },
  ];

  if (variant === 'pill') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 ${className}`}
        >
          <Apple className="h-4 w-4" />
          iMessage + RCS
          <Lock className="h-3 w-3 opacity-70" />
        </button>
        <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} features={features} />
      </>
    );
  }

  if (variant === 'banner') {
    return (
      <>
        <div
          onClick={() => setShowModal(true)}
          className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <Apple className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Upgrade to iMessage + RCS
                  <Lock className="h-4 w-4 opacity-70" />
                </h3>
                <p className="text-sm text-blue-100">92% reply rates • No A2P needed • Unlimited messages</p>
              </div>
            </div>
            <Sparkles className="h-6 w-6 text-amber-300" />
          </div>
        </div>
        <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} features={features} />
      </>
    );
  }

  // Card variant
  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={`border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-2xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Apple className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">iMessage + RCS Messaging</h3>
              <Badge className="bg-amber-100 text-amber-700">
                <Lock className="h-3 w-3 mr-1" />
                Blue Tier
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Send blue bubble messages with voice notes, images, reactions, and more. 92% reply rates.
            </p>
            <div className="flex flex-wrap gap-2">
              {[Mic, Image, ThumbsUp, Heart].map((Icon, i) => (
                <div key={i} className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
              ))}
              <div className="h-8 px-3 bg-white rounded-lg flex items-center text-xs text-gray-500 shadow-sm">
                +4 more
              </div>
            </div>
          </div>
        </div>
      </div>
      <UpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} features={features} />
    </>
  );
}

function UpgradeModal({ isOpen, onClose, features }: { isOpen: boolean; onClose: () => void; features: any[] }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Apple className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Church Posting Blue</h2>
              <p className="text-blue-100">iMessage + RCS Messaging</p>
            </div>
          </div>
          <p className="text-sm text-blue-100">
            Skip SMS spam filters and reach your congregation with trusted blue bubble messages.
          </p>
        </div>

        {/* Features */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What you&apos;ll get with Blue:</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                <feature.icon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{feature.label}</p>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Starting at</p>
                <p className="text-2xl font-bold">$249<span className="text-sm font-normal text-slate-400">/month</span></p>
              </div>
              <div className="text-right">
                <Badge className="bg-amber-500/20 text-amber-300 mb-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
                <p className="text-xs text-slate-400">No per-message fees</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Link href="/blue">
                Learn About Blue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function IMessageFeaturePreview({ feature, locked = true }: { feature: string; locked?: boolean }) {
  const [showModal, setShowModal] = useState(false);

  const featureIcons: Record<string, any> = {
    voice: Mic,
    image: Image,
    video: Video,
    reactions: ThumbsUp,
    read_receipts: FileText,
  };

  const Icon = featureIcons[feature] || Sparkles;

  return (
    <>
      <button
        onClick={() => locked && setShowModal(true)}
        className={`p-2 rounded-lg transition-all ${locked ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer' : 'text-blue-600'}`}
        title={locked ? 'Blue Tier feature' : feature}
      >
        <div className="relative">
          <Icon className="h-5 w-5" />
          {locked && (
            <Lock className="h-3 w-3 absolute -bottom-1 -right-1 text-amber-500" />
          )}
        </div>
      </button>
      {locked && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Blue Tier Feature</h3>
              <p className="text-gray-600 mb-6">
                This feature is available with Church Posting Blue. Upgrade to unlock iMessage, voice notes, reactions, and more.
              </p>
              <div className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link href="/blue">Learn More</Link>
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
