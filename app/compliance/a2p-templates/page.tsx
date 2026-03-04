'use client';

import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAdmin } from '@/lib/admin-context';
import {
  Copy,
  Check,
  ClipboardCheck,
  AlertTriangle,
  ArrowLeft,
  Building2,
  User,
  MessageSquare,
  Phone,
  Globe,
  Shield,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Hash,
  MapPin,
  Mail,
  Link2,
  KeyRound,
} from 'lucide-react';

// ---------- Types ----------

interface ChurchData {
  id: string;
  name: string;
  slug: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  ein: string | null;
  businessType: string | null;
  authorizedRepName: string | null;
  authorizedRepTitle: string | null;
  authorizedRepPhone: string | null;
  authorizedRepEmail: string | null;
  sampleMessages: any;
  provider: 'twilio' | 'telnyx';
  providerPhoneNumber: string | null;
  a2pStatus: string;
}

// ---------- Constants ----------

const A2P_STATUS_MAP: Record<string, { label: string; variant: 'secondary' | 'warning' | 'default' | 'success' | 'destructive' }> = {
  not_started: { label: 'Not Started', variant: 'secondary' },
  brand_submitted: { label: 'Brand Under Review', variant: 'warning' },
  brand_approved: { label: 'Brand Approved -- Submit Campaign', variant: 'default' },
  campaign_submitted: { label: 'Campaign Under Review', variant: 'warning' },
  campaign_approved: { label: 'Fully Approved', variant: 'success' },
  fully_approved: { label: 'Fully Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

// ---------- Helpers ----------

function generateCampaignDescription(churchName: string): string {
  return `${churchName} church communications including event announcements, prayer requests, volunteer coordination, and general updates to congregation members.`;
}

function generateMessageFlow(churchName: string, slug: string | null): string {
  const slugUrl = slug ? `freechurchtexting.com/c/${slug}` : '[your-slug].freechurchtexting.com';
  return `Congregation members opt in to receive text messages from the church through a sign-up form on the church website (${slugUrl}), in-person sign-up at church events, or by texting a keyword to the church phone number. Members can opt out at any time by replying STOP.`;
}

function generateDefaultSampleMessages(churchName: string): string[] {
  return [
    `Hi {firstName}! Just a reminder that our Sunday service at ${churchName} starts at 10am. See you there! Reply STOP to unsubscribe.`,
    `${churchName} Prayer Meeting: Join us this Wednesday at 7pm in the fellowship hall. All welcome! Msg&Data rates may apply. Reply STOP to opt out.`,
    `${churchName} Volunteer Update: We need helpers for our community food drive this Saturday 9am-1pm. Can you make it? Reply YES or NO. Reply STOP to opt out.`,
  ];
}

function getMissingFields(church: ChurchData): string[] {
  const missing: string[] = [];
  if (!church.ein) missing.push('EIN/Tax ID');
  if (!church.address) missing.push('Street Address');
  if (!church.city) missing.push('City');
  if (!church.state) missing.push('State');
  if (!church.zip) missing.push('Zip');
  if (!church.website) missing.push('Website');
  if (!church.slug) missing.push('Church Slug');
  if (!church.authorizedRepName) missing.push('Authorized Rep Name');
  if (!church.authorizedRepTitle) missing.push('Authorized Rep Title');
  if (!church.authorizedRepPhone) missing.push('Authorized Rep Phone');
  if (!church.authorizedRepEmail) missing.push('Authorized Rep Email');
  return missing;
}

// ---------- Sub-components ----------

function CopyField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied "${label}"`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="flex items-start gap-3 group">
      {icon && <div className="mt-3 text-gray-400 flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm text-gray-800 break-words">
            {value || <span className="text-gray-400 italic">Not set</span>}
          </div>
          <button
            onClick={handleCopy}
            disabled={!value}
            className="flex-shrink-0 p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={`Copy ${label}`}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyMultilineField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied "${label}"`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
      </div>
      <div className="relative">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 pr-12 font-mono text-sm text-gray-800 whitespace-pre-wrap break-words">
          {value || <span className="text-gray-400 italic">Not set</span>}
        </div>
        <button
          onClick={handleCopy}
          disabled={!value}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={`Copy ${label}`}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ProviderStep({
  number,
  title,
  children,
  providerColor,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  providerColor: string;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${providerColor}`}
        >
          {number}
        </div>
        <span className="font-medium text-gray-900 flex-1">{title}</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-12 text-sm text-gray-600 space-y-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------- Main Page ----------

export default function A2PTemplatesPage() {
  const { adminFetch, effectiveChurchId } = useAdmin();
  const [church, setChurch] = React.useState<ChurchData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [copyAllDone, setCopyAllDone] = React.useState(false);

  // Fetch church data
  React.useEffect(() => {
    setChurch(null);
    setLoading(true);

    const fetchChurch = async () => {
      try {
        const res = await adminFetch('/api/church');
        const data = await res.json();
        if (data?.church) {
          setChurch(data.church);
        }
      } catch (error) {
        console.error('Failed to fetch church data:', error);
        toast.error('Failed to load church data');
      } finally {
        setLoading(false);
      }
    };

    fetchChurch();
  }, [effectiveChurchId]);

  // Derived values
  const churchName = church?.name || '';
  const slug = church?.slug || null;
  const provider = church?.provider || 'twilio';
  const a2pStatus = church?.a2pStatus || 'not_started';
  const statusInfo = A2P_STATUS_MAP[a2pStatus] || A2P_STATUS_MAP.not_started;
  const missingFields = church ? getMissingFields(church) : [];

  const campaignDescription = generateCampaignDescription(churchName);
  const messageFlow = generateMessageFlow(churchName, slug);

  const sampleMessages: string[] = (() => {
    if (church?.sampleMessages && Array.isArray(church.sampleMessages) && church.sampleMessages.length >= 3) {
      return church.sampleMessages.map(String);
    }
    return generateDefaultSampleMessages(churchName);
  })();

  const optInResponse = `You have been subscribed to text updates from ${churchName}. Reply STOP to unsubscribe. Msg&Data rates may apply.`;
  const optOutResponse = `You have been unsubscribed from ${churchName} text messages. Reply START to re-subscribe.`;
  const helpResponse = `${churchName} messaging service. For help, contact us at ${church?.phone || church?.email || '[phone/email]'}. Reply STOP to unsubscribe.`;

  const optInUrl = slug ? `freechurchtexting.com/c/${slug}` : '';
  const privacyUrl = slug ? `freechurchtexting.com/c/${slug}/privacy` : '';
  const termsUrl = slug ? `freechurchtexting.com/c/${slug}/terms` : '';

  // Build the full "Copy All" text
  const buildCopyAllText = (): string => {
    const lines: string[] = [
      `=== A2P REGISTRATION TEMPLATES FOR ${churchName.toUpperCase()} ===`,
      '',
      '--- BRAND / BUSINESS INFORMATION ---',
      `Business Name: ${churchName}`,
      `Business Type: ${church?.businessType || 'Non-profit Corporation'}`,
      `EIN/Tax ID: ${church?.ein || ''}`,
      `Business Industry: RELIGIOUS`,
      `Business Identity: direct_customer`,
      `Regions of Operation: USA_AND_CANADA`,
      `Street Address: ${church?.address || ''}`,
      `City: ${church?.city || ''}`,
      `State/Province: ${church?.state || ''}`,
      `Postal Code: ${church?.zip || ''}`,
      `Country: US`,
      `Website: ${church?.website || ''}`,
      '',
      '--- AUTHORIZED REPRESENTATIVE ---',
      `Contact Name: ${church?.authorizedRepName || ''}`,
      `Contact Title: ${church?.authorizedRepTitle || ''}`,
      `Contact Phone: ${church?.authorizedRepPhone || ''}`,
      `Contact Email: ${church?.authorizedRepEmail || ''}`,
      '',
      '--- CAMPAIGN INFORMATION ---',
      `Campaign Use Case: MIXED`,
      `Campaign Description: ${campaignDescription}`,
      `Message Flow: ${messageFlow}`,
      `Opt-in URL: ${optInUrl}`,
      `Privacy Policy URL: ${privacyUrl}`,
      `Terms URL: ${termsUrl}`,
      `Has Embedded Links: Yes`,
      `Has Embedded Phone: No`,
      '',
      '--- SAMPLE MESSAGES ---',
      ...sampleMessages.map((msg, i) => `Sample ${i + 1}: ${msg}`),
      '',
      '--- KEYWORD RESPONSES ---',
      `Opt-in Keywords: START, SUBSCRIBE, YES`,
      `Opt-out Keywords: STOP, UNSUBSCRIBE, CANCEL, END, QUIT`,
      `Help Keywords: HELP, INFO`,
      `Opt-in Response: ${optInResponse}`,
      `Opt-out Response: ${optOutResponse}`,
      `Help Response: ${helpResponse}`,
    ];
    return lines.join('\n');
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyAllText());
      setCopyAllDone(true);
      toast.success('All fields copied to clipboard!');
      setTimeout(() => setCopyAllDone(false), 3000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const isTwilio = provider === 'twilio';
  const providerLabel = isTwilio ? 'Twilio' : 'Telnyx';
  const providerBadgeClass = isTwilio
    ? 'bg-orange-100 text-orange-700'
    : 'bg-emerald-100 text-emerald-700';
  const providerStepColor = isTwilio ? 'bg-orange-500' : 'bg-emerald-500';
  const providerBorderAccent = isTwilio
    ? 'border-orange-200'
    : 'border-emerald-200';

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading church data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!church) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">Church data not found</h2>
          <p className="text-gray-500">Please complete onboarding first.</p>
          <Button asChild>
            <Link href="/settings">Go to Settings</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back button */}
        <div className="flex items-center gap-4">
          <Link href="/compliance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back to Compliance
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">A2P Registration Templates</h1>
            <p className="text-gray-500 mt-1">
              Copy these pre-filled values into your{' '}
              <span className={isTwilio ? 'text-orange-600 font-medium' : 'text-emerald-600 font-medium'}>
                {providerLabel}
              </span>{' '}
              console
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={statusInfo.variant === 'secondary' ? 'bg-gray-100 text-gray-700' : undefined} variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
            <Badge className={providerBadgeClass}>{providerLabel}</Badge>
          </div>
        </div>

        {/* Missing data warning */}
        {missingFields.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Some fields are missing</p>
                <p className="text-sm text-amber-700 mt-1">
                  The following fields are empty: {missingFields.join(', ')}. Complete your{' '}
                  <Link href="/settings" className="underline font-medium hover:text-amber-900">
                    Settings page
                  </Link>{' '}
                  first to auto-fill all fields.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Copy All button */}
        <div className="flex justify-end">
          <Button onClick={handleCopyAll} variant="outline" className="gap-2">
            {copyAllDone ? (
              <>
                <ClipboardCheck className="h-4 w-4 text-green-500" />
                Copied All Fields!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy All Fields
              </>
            )}
          </Button>
        </div>

        {/* ===== READY-TO-COPY FIELDS ===== */}

        {/* Brand / Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" />
              Brand / Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <CopyField label="Business Name" value={churchName} icon={<Building2 className="h-4 w-4" />} />
              <CopyField label="Business Type" value={church.businessType || 'Non-profit Corporation'} icon={<FileText className="h-4 w-4" />} />
              <CopyField label="EIN / Tax ID" value={church.ein || ''} icon={<Hash className="h-4 w-4" />} />
              <CopyField label="Business Industry" value="RELIGIOUS" icon={<Shield className="h-4 w-4" />} />
              <CopyField label="Business Identity" value="direct_customer" icon={<User className="h-4 w-4" />} />
              <CopyField label="Regions of Operation" value="USA_AND_CANADA" icon={<Globe className="h-4 w-4" />} />
            </div>

            <hr className="border-gray-100" />

            <div className="grid md:grid-cols-2 gap-4">
              <CopyField label="Street Address" value={church.address || ''} icon={<MapPin className="h-4 w-4" />} />
              <CopyField label="City" value={church.city || ''} icon={<MapPin className="h-4 w-4" />} />
              <CopyField label="State / Province" value={church.state || ''} icon={<MapPin className="h-4 w-4" />} />
              <CopyField label="Postal Code" value={church.zip || ''} icon={<MapPin className="h-4 w-4" />} />
              <CopyField label="Country" value="US" icon={<Globe className="h-4 w-4" />} />
              <CopyField label="Website" value={church.website || ''} icon={<Link2 className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>

        {/* Authorized Representative */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Authorized Representative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <CopyField label="Contact Name" value={church.authorizedRepName || ''} icon={<User className="h-4 w-4" />} />
              <CopyField label="Contact Title" value={church.authorizedRepTitle || ''} icon={<FileText className="h-4 w-4" />} />
              <CopyField label="Contact Phone" value={church.authorizedRepPhone || ''} icon={<Phone className="h-4 w-4" />} />
              <CopyField label="Contact Email" value={church.authorizedRepEmail || ''} icon={<Mail className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>

        {/* Campaign Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Campaign Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <CopyField label="Campaign Use Case" value="MIXED" />
              <CopyField label="Has Embedded Links" value="Yes" />
              <CopyField label="Has Embedded Phone" value="No" />
            </div>

            <CopyMultilineField
              label="Campaign Description"
              value={campaignDescription}
              icon={<FileText className="h-4 w-4" />}
            />

            <CopyMultilineField
              label="Message Flow"
              value={messageFlow}
              icon={<MessageSquare className="h-4 w-4" />}
            />

            <hr className="border-gray-100" />

            <div className="grid md:grid-cols-3 gap-4">
              <CopyField label="Opt-in URL" value={optInUrl} icon={<Link2 className="h-4 w-4" />} />
              <CopyField label="Privacy Policy URL" value={privacyUrl} icon={<Link2 className="h-4 w-4" />} />
              <CopyField label="Terms URL" value={termsUrl} icon={<Link2 className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>

        {/* Sample Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Sample Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleMessages.map((msg, idx) => (
              <CopyMultilineField
                key={idx}
                label={`Sample Message ${idx + 1}`}
                value={msg}
                icon={<MessageSquare className="h-4 w-4" />}
              />
            ))}
          </CardContent>
        </Card>

        {/* Keyword Responses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-600" />
              Keyword Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <CopyField label="Opt-in Keywords" value="START, SUBSCRIBE, YES" />
              <CopyField label="Opt-out Keywords" value="STOP, UNSUBSCRIBE, CANCEL, END, QUIT" />
              <CopyField label="Help Keywords" value="HELP, INFO" />
            </div>

            <hr className="border-gray-100" />

            <CopyMultilineField label="Opt-in Response" value={optInResponse} />
            <CopyMultilineField label="Opt-out Response" value={optOutResponse} />
            <CopyMultilineField label="Help Response" value={helpResponse} />
          </CardContent>
        </Card>

        {/* ===== PROVIDER-SPECIFIC INSTRUCTIONS ===== */}

        {isTwilio ? (
          <Card className={`border-2 ${providerBorderAccent}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Step-by-Step: Twilio A2P 10DLC Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProviderStep number={1} title="Create a Twilio Account" providerColor={providerStepColor}>
                <p>
                  If you haven&apos;t already, sign up at{' '}
                  <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline hover:text-orange-700">
                    twilio.com
                  </a>
                  . Verify your email and phone number to complete account setup.
                </p>
              </ProviderStep>

              <ProviderStep number={2} title="Go to Trust Hub" providerColor={providerStepColor}>
                <p>
                  Navigate to <strong>Console &rarr; Trust Hub &rarr; Customer Profiles</strong>.
                </p>
                <p>
                  This is where you register your business identity with carriers.
                </p>
              </ProviderStep>

              <ProviderStep number={3} title="Create Business Profile" providerColor={providerStepColor}>
                <p>
                  Click <strong>&quot;Create Profile&quot;</strong>, select <strong>&quot;A2P Messaging&quot;</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Copy and paste the business info from the fields above</li>
                  <li>Upload any required documents (EIN letter, etc.)</li>
                  <li>Make sure your business name matches your IRS records exactly</li>
                </ul>
              </ProviderStep>

              <ProviderStep number={4} title="Submit for Review" providerColor={providerStepColor}>
                <p>
                  Click <strong>&quot;Submit for Review&quot;</strong>. Typical approval time: <strong>1-5 business days</strong>.
                </p>
                <p className="text-amber-700 mt-1">
                  You will receive an email notification when your brand is approved or if changes are needed.
                </p>
              </ProviderStep>

              <ProviderStep number={5} title="Create Messaging Service" providerColor={providerStepColor}>
                <p>
                  Navigate to <strong>Console &rarr; Messaging &rarr; Services &rarr; Create</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Name it <strong>&quot;{churchName} Messaging&quot;</strong></li>
                  <li>Add your phone number to the service</li>
                </ul>
              </ProviderStep>

              <ProviderStep number={6} title="Register A2P Campaign" providerColor={providerStepColor}>
                <p>
                  Once your brand is approved:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Go to <strong>Messaging &rarr; Services &rarr; your service &rarr; Compliance</strong></li>
                  <li>Select <strong>&quot;Mixed&quot;</strong> use case</li>
                  <li>Paste the campaign info, sample messages, and URLs from the fields above</li>
                </ul>
              </ProviderStep>

              <ProviderStep number={7} title="Wait for Campaign Approval" providerColor={providerStepColor}>
                <p>
                  Campaign review typically takes <strong>1-3 business days</strong>. You will be notified by email when approved.
                </p>
              </ProviderStep>

              <ProviderStep number={8} title="You're Done!" providerColor={providerStepColor}>
                <p>
                  Once your campaign is approved, you can start sending messages through Free Church Texting with full 10DLC throughput and deliverability.
                </p>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                  <p className="text-green-800 text-sm font-medium">
                    Your messages will now be sent as verified A2P traffic with higher delivery rates and throughput.
                  </p>
                </div>
              </ProviderStep>
            </CardContent>
          </Card>
        ) : (
          <Card className={`border-2 ${providerBorderAccent}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Step-by-Step: Telnyx 10DLC Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProviderStep number={1} title="Create a Telnyx Account" providerColor={providerStepColor}>
                <p>
                  If you haven&apos;t already, sign up at{' '}
                  <a href="https://www.telnyx.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline hover:text-emerald-700">
                    telnyx.com
                  </a>
                  . Complete account verification.
                </p>
              </ProviderStep>

              <ProviderStep number={2} title="Go to 10DLC Portal" providerColor={providerStepColor}>
                <p>
                  Navigate to <strong>Messaging &rarr; 10DLC</strong> in the Telnyx portal.
                </p>
              </ProviderStep>

              <ProviderStep number={3} title="Register Your Brand" providerColor={providerStepColor}>
                <p>
                  Click <strong>&quot;Register Brand&quot;</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Copy and paste the business info from the fields above</li>
                  <li>Business type: <strong>Non-profit</strong></li>
                  <li>Ensure all details match your IRS records exactly</li>
                </ul>
              </ProviderStep>

              <ProviderStep number={4} title="Create Campaign" providerColor={providerStepColor}>
                <p>
                  After brand approval:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Select your brand</li>
                  <li>Use case: <strong>Mixed</strong></li>
                  <li>Paste the campaign description, message flow, and sample messages from above</li>
                  <li>Add the opt-in URL, privacy URL, and terms URL</li>
                </ul>
              </ProviderStep>

              <ProviderStep number={5} title="Associate Number" providerColor={providerStepColor}>
                <p>
                  Link your messaging profile and phone number to the campaign. This ensures messages sent from your number are associated with your approved campaign.
                </p>
              </ProviderStep>

              <ProviderStep number={6} title="Wait for Approval" providerColor={providerStepColor}>
                <p>
                  CSP review: <strong>1-2 days</strong>, then carrier review: <strong>3-7 days</strong>.
                </p>
                <p className="mt-1">
                  You will receive notifications in the Telnyx portal as your registration progresses.
                </p>
              </ProviderStep>

              <ProviderStep number={7} title="You're Done!" providerColor={providerStepColor}>
                <p>
                  Once approved, your messages will be sent with full 10DLC throughput through Free Church Texting.
                </p>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                  <p className="text-green-800 text-sm font-medium">
                    Your messages will now be sent as verified A2P traffic with higher delivery rates and throughput.
                  </p>
                </div>
              </ProviderStep>
            </CardContent>
          </Card>
        )}

        {/* Bottom navigation */}
        <div className="flex justify-between items-center pt-4">
          <Link href="/compliance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back to Compliance
            </Button>
          </Link>
          <Link href="/compliance/a2p-guide">
            <Button variant="outline" size="sm">
              View Full A2P Guide <Globe className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
