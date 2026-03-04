'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAdmin } from '@/lib/admin-context';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Shield,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  FileText,
  MessageSquare,
  Users,
  ArrowRight,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Link2,
  ClipboardCheck,
} from 'lucide-react';

export default function CompliancePage() {
  const { data: session } = useSession() || {};
  const { adminFetch } = useAdmin();
  const [loadingA2P, setLoadingA2P] = React.useState(false);
  const [churchData, setChurchData] = React.useState<any>(null);
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  const [checklist, setChecklist] = React.useState({
    optIn: false,
    optOut: false,
    businessName: false,
    noSensitive: false,
    frequency: false,
    helpResponse: false,
  });

  // Fetch church data for compliance status
  React.useEffect(() => {
    adminFetch('/api/church')
      .then((r) => r.json())
      .then((data) => {
        setChurchData(data);
        // Auto-check items based on church data
        setChecklist((prev) => ({
          ...prev,
          optIn: !!(data?.slug && data?.complianceCompletedAt),
          optOut: true, // System handles STOP automatically
          businessName: !!data?.name,
          helpResponse: true, // System auto-responds to HELP
        }));
      })
      .catch(() => {});
  }, [adminFetch]);

  const completedCount = Object.values(checklist)?.filter?.(Boolean)?.length ?? 0;
  const totalCount = Object.keys(checklist)?.length ?? 0;

  const complianceCompleted = !!(churchData?.slug && churchData?.complianceCompletedAt);

  const complianceUrls = churchData?.slug
    ? [
        {
          label: 'Opt-In Page',
          url: `freechurchtexting.com/c/${churchData.slug}`,
          hint: 'Share this URL in your A2P registration',
        },
        {
          label: 'Privacy Policy',
          url: `freechurchtexting.com/c/${churchData.slug}/privacy`,
          hint: '',
        },
        {
          label: 'Terms & Conditions',
          url: `freechurchtexting.com/c/${churchData.slug}/terms`,
          hint: '',
        },
      ]
    : [];

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopiedUrl(url);
      toast.success('Copied!');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyAllUrls = async () => {
    try {
      const allUrls = complianceUrls.map((u) => `https://${u.url}`).join('\n');
      await navigator.clipboard.writeText(allUrls);
      toast.success('All URLs copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleA2PCheckout = async () => {
    setLoadingA2P(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'a2p',
          email: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout. Please contact hello@churchposting.com');
    } finally {
      setLoadingA2P(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SMS Compliance</h1>
          <p className="text-gray-500 mt-1">Stay compliant with A2P 10DLC and TCPA requirements</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Your Compliance Pages - shown at the top */}
            {complianceCompleted ? (
              <Card className="border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      Your Compliance Pages
                    </CardTitle>
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Compliance Pages Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {complianceUrls.map((item) => (
                    <div
                      key={item.url}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-brand-600 truncate">{item.url}</p>
                        {item.hint && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.hint}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyUrl(item.url)}
                          className="gap-1"
                        >
                          {copiedUrl === item.url ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          Copy
                        </Button>
                        <a
                          href={`https://${item.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" className="gap-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAllUrls}
                    className="mt-2 gap-1"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Copy All URLs
                  </Button>
                </CardContent>
              </Card>
            ) : churchData !== null ? (
              <Card className="border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Set Up Your Compliance Pages</h3>
                        <p className="text-sm text-brand-100 mt-1">
                          Generate your opt-in page, privacy policy, and terms &amp; conditions in minutes. Required for 10DLC registration.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className="bg-white/20 text-white border-0">~5 minutes</Badge>
                      <Button variant="secondary" asChild>
                        <Link href="/compliance/setup">
                          Start Compliance Setup
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            {/* Compliance Checklist */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-600" />
                    SMS Compliance Checklist
                  </CardTitle>
                  <Badge variant={completedCount === totalCount ? 'success' : 'warning'}>
                    {completedCount} / {totalCount} Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'optIn', label: 'Contacts have given explicit opt-in consent', description: 'You have documented proof that contacts agreed to receive texts from your church.' },
                  { key: 'optOut', label: 'STOP/UNSUBSCRIBE instructions included', description: 'Your messages include instructions on how to opt out (e.g., "Reply STOP to unsubscribe").' },
                  { key: 'businessName', label: 'Church name identified in messages', description: 'Your messages clearly identify your church name so recipients know who is texting them.' },
                  { key: 'noSensitive', label: 'No sensitive data in messages', description: 'You don\'t include financial info, health info, or other sensitive data in texts.' },
                  { key: 'frequency', label: 'Appropriate message frequency', description: 'You don\'t send excessive messages that could be considered spam (typically 2-4/week max).' },
                  { key: 'helpResponse', label: 'HELP keyword configured', description: 'Replying HELP provides contact information and opt-out instructions.' },
                ]?.map?.((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.key as keyof typeof checklist]}
                      onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* TCPA Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  TCPA Quick Guide for Churches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p className="font-medium text-gray-900 mb-3">Key requirements under the Telephone Consumer Protection Act:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Prior express consent</strong> - Get written or electronic consent before texting.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Opt-out mechanism</strong> - Honor STOP requests within 10 days (we do it instantly).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>No automated marketing</strong> without explicit consent for marketing texts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Identify yourself</strong> - Include your church name in the first message.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span><strong>Time restrictions</strong> - Only text between 8 AM and 9 PM recipient&apos;s local time.</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* A2P Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                  A2P 10DLC Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  A2P (Application-to-Person) 10DLC is required by carriers for business texting. Without registration,
                  your messages may be filtered or blocked.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/compliance/a2p-guide"
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-brand-200 bg-brand-50 hover:border-brand-300 hover:bg-brand-100 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Complete A2P Registration Guide</p>
                      <p className="text-sm text-gray-600">7-phase walkthrough with templates &amp; checklists</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-brand-600" />
                  </Link>

                  {/* Registration Templates Link */}
                  <Link
                    href="/compliance/a2p-templates"
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <ClipboardCheck className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Ready-to-Copy A2P Templates</p>
                        <p className="text-sm text-gray-600">Pre-filled values for your Twilio or Telnyx 10DLC registration</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-green-600" />
                  </Link>

                  <a
                    href="https://www.twilio.com/docs/messaging/compliance/a2p-10dlc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Twilio A2P 10DLC Documentation</p>
                      <p className="text-sm text-gray-500">Official Twilio guide</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </a>
                  <a
                    href="https://www.twilio.com/console/messaging/bundles"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">Twilio Console - Brand Registration</p>
                      <p className="text-sm text-gray-500">Start your A2P registration here</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Help CTA */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-6">
                <AlertTriangle className="h-10 w-10 text-amber-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">A2P Registration is Complicated</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Let Church Posting handle your A2P registration for you. We&apos;ll submit your brand and campaign
                  and get you approved in 7-14 days.
                </p>
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={handleA2PCheckout}
                  disabled={loadingA2P}
                >
                  {loadingA2P ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Help for $197
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Blue Tier CTA */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Skip A2P Entirely</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Church Posting Blue uses iMessage + RCS which doesn&apos;t require A2P registration. Get 92% reply rates
                  and bypass carrier restrictions.
                </p>
                <div className="text-xs text-slate-400 mb-4">
                  <p>Shared Enterprise: $249/mo</p>
                  <p>Dedicated: $397/mo</p>
                </div>
                <Button variant="gold" className="w-full" asChild>
                  <Link href="/blue">
                    Learn About Blue
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
