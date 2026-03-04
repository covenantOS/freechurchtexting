'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InfoTooltip } from '@/components/ui/tooltip';
import { useAdmin } from '@/lib/admin-context';
import { toast } from 'sonner';
import {
  Building2,
  User,
  Palette,
  MessageSquare,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const steps = [
  { id: 1, title: 'Business Info', icon: Building2 },
  { id: 2, title: 'Representative', icon: User },
  { id: 3, title: 'Opt-In Page', icon: Palette },
  { id: 4, title: 'Sample Messages', icon: MessageSquare },
  { id: 5, title: 'Review', icon: CheckCircle2 },
];

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
];

const BUSINESS_TYPES = [
  'Non-profit Corporation',
  'Non-profit LLC',
  'Sole Proprietorship',
  '501(c)(3)',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  } catch {
    toast.error('Failed to copy');
  }
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ComplianceSetupPage() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const { adminFetch, effectiveChurchId } = useAdmin();

  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [completed, setCompleted] = React.useState(false);

  // Step 1: Business Details
  const [churchName, setChurchName] = React.useState('');
  const [businessType, setBusinessType] = React.useState('Non-profit Corporation');
  const [ein, setEin] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [zip, setZip] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [provider, setProvider] = React.useState('twilio');

  // Step 2: Authorized Representative
  const [repName, setRepName] = React.useState('');
  const [repTitle, setRepTitle] = React.useState('');
  const [repPhone, setRepPhone] = React.useState('');
  const [repEmail, setRepEmail] = React.useState('');

  // Step 3: Branding & Opt-In Page
  const [slug, setSlug] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [heroImageUrl, setHeroImageUrl] = React.useState('');

  // Step 4: Sample Messages
  const [sampleMsg1, setSampleMsg1] = React.useState('');
  const [sampleMsg2, setSampleMsg2] = React.useState('');
  const [sampleMsg3, setSampleMsg3] = React.useState('');
  const [optInMsg, setOptInMsg] = React.useState('');
  const [optOutMsg, setOptOutMsg] = React.useState('');
  const [helpMsg, setHelpMsg] = React.useState('');

  // ─── Fetch initial data ─────────────────────────────────────────────────

  React.useEffect(() => {
    const fetchChurchData = async () => {
      try {
        const res = await adminFetch('/api/church');
        if (!res.ok) throw new Error('Failed to load church data');
        const data = await res.json();
        const church = data?.church;
        if (!church) return;

        setChurchName(church.name || '');
        setBusinessType(church.businessType || 'Non-profit Corporation');
        setEin(church.ein || '');
        setAddress(church.address || '');
        setCity(church.city || '');
        setState(church.state || '');
        setZip(church.zip || '');
        setWebsite(church.website || '');
        setPhone(church.phone || '');
        setProvider(church.provider || 'twilio');

        // Authorized rep
        setRepName(church.authorizedRepName || church.leaderName || '');
        setRepTitle(church.authorizedRepTitle || '');
        setRepPhone(church.authorizedRepPhone || '');
        setRepEmail(church.authorizedRepEmail || church.email || '');

        // Branding
        const existingSlug = church.slug || generateSlug(church.name || '');
        setSlug(existingSlug);
        setLogoUrl(church.logoUrl || '');
        setHeroImageUrl(church.heroImageUrl || '');

        // Sample messages
        const sm = church.sampleMessages;
        const name = church.name || 'Our Church';
        const contactInfo = church.phone || church.email || 'our office';

        if (sm?.samples?.length) {
          setSampleMsg1(sm.samples[0] || '');
          setSampleMsg2(sm.samples[1] || '');
          setSampleMsg3(sm.samples[2] || '');
          setOptInMsg(sm.optIn || '');
          setOptOutMsg(sm.optOut || '');
          setHelpMsg(sm.help || '');
        } else {
          // Generate defaults
          setSampleMsg1(
            `Welcome to ${name} text updates! Reply STOP to opt out. Msg&Data rates may apply.`
          );
          setSampleMsg2(
            `Hi {firstName}! Reminder: Sunday service at ${name} starts at 10am. See you there! Reply STOP to unsubscribe.`
          );
          setSampleMsg3(
            `${name} Update: Our community prayer meeting is this Wednesday at 7pm. All welcome! Reply STOP to opt out.`
          );
          setOptInMsg(
            `You've been subscribed to text updates from ${name}. Reply STOP to unsubscribe. Msg&Data rates may apply.`
          );
          setOptOutMsg(
            `You've been unsubscribed from ${name} texts. Reply START to re-subscribe.`
          );
          setHelpMsg(
            `${name} messaging service. For help, contact us at ${contactInfo}. Reply STOP to unsubscribe.`
          );
        }

        // If compliance already completed, jump to review
        if (church.complianceCompletedAt) {
          setCurrentStep(5);
        }
      } catch (err: any) {
        console.error('Failed to load church data:', err);
        setError('Failed to load church data. Please refresh the page.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChurchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveChurchId]);

  // ─── Save helpers ───────────────────────────────────────────────────────

  const saveData = async (data: Record<string, any>): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/church/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Failed to save');
      }
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to save. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Step Handlers ──────────────────────────────────────────────────────

  const handleStep1Next = async () => {
    if (!ein) {
      setError('EIN is required for A2P registration.');
      return;
    }
    if (!address || !city || !state || !zip) {
      setError('Please fill in all address fields.');
      return;
    }
    const success = await saveData({
      businessType,
      ein,
      address,
      city,
      state,
      zip,
      website,
      phone,
    });
    if (success) setCurrentStep(2);
  };

  const handleStep2Next = async () => {
    if (!repName || !repEmail) {
      setError('Name and email are required.');
      return;
    }
    const success = await saveData({
      authorizedRepName: repName,
      authorizedRepTitle: repTitle,
      authorizedRepPhone: repPhone,
      authorizedRepEmail: repEmail,
    });
    if (success) setCurrentStep(3);
  };

  const handleStep3Next = async () => {
    if (!slug) {
      setError('Page URL slug is required.');
      return;
    }
    const success = await saveData({
      slug,
      logoUrl,
      heroImageUrl,
    });
    if (success) setCurrentStep(4);
  };

  const handleStep4Next = async () => {
    if (!sampleMsg1 || !sampleMsg2) {
      setError('Please provide at least 2 sample messages.');
      return;
    }
    const success = await saveData({
      sampleMessages: {
        samples: [sampleMsg1, sampleMsg2, sampleMsg3].filter(Boolean),
        optIn: optInMsg,
        optOut: optOutMsg,
        help: helpMsg,
      },
    });
    if (success) setCurrentStep(5);
  };

  const handleComplete = async () => {
    const success = await saveData({
      complianceCompletedAt: new Date().toISOString(),
    });
    if (success) {
      setCompleted(true);
      toast.success('10DLC compliance setup complete!');
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-brand-600" />
            10DLC Compliance Setup
          </h1>
          <p className="text-gray-500 mt-1">
            Complete this wizard to prepare your church for A2P registration.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            {steps?.map((step, idx) => {
              const Icon = step?.icon;
              const isActive = currentStep === step?.id;
              const isComplete = currentStep > step?.id;
              return (
                <React.Fragment key={step?.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-[#C28C88] text-white shadow-md shadow-[#C28C88]/25'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        Icon && <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block ${
                        isActive
                          ? 'text-[#C28C88] font-medium'
                          : isComplete
                          ? 'text-green-600 font-medium'
                          : 'text-gray-500'
                      }`}
                    >
                      {step?.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                        currentStep > step?.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
              &times;
            </button>
          </div>
        )}

        {/* ─── Step 1: Business Details ─────────────────────────────────── */}
        {currentStep === 1 && (
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Business Information for 10DLC
              </h2>
              <p className="text-gray-500 mb-6">
                This information is required by carriers for A2P registration.
              </p>

              <div className="grid gap-4">
                {/* Church Name (read-only) */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Church Name
                  </label>
                  <Input value={churchName} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-400 mt-1">
                    This is your registered church name. To change it, go to Settings.
                  </p>
                </div>

                {/* Business Type */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Business Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* EIN */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    EIN (Employer Identification Number) *
                    <InfoTooltip content="Your 9-digit federal tax ID. Format: XX-XXXXXXX" />
                  </label>
                  <Input
                    value={ein}
                    onChange={(e) => setEin(e.target.value)}
                    placeholder="12-3456789"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Street Address *
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Church St"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">City *</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Nashville"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select state...</option>
                      {US_STATES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      ZIP Code *
                    </label>
                    <Input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="37201"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Website URL
                    </label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourchurch.org"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Church Phone Number
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={handleStep1Next} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 2: Authorized Representative ────────────────────────── */}
        {currentStep === 2 && (
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Authorized Contact Person
              </h2>
              <p className="text-gray-500 mb-6">
                Carriers require a real person who can verify this registration.
              </p>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Full Name *
                    </label>
                    <Input
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      placeholder="Pastor John Smith"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Title / Role
                    </label>
                    <Input
                      value={repTitle}
                      onChange={(e) => setRepTitle(e.target.value)}
                      placeholder="Pastor, Admin, Communications Director"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Phone Number
                    </label>
                    <Input
                      value={repPhone}
                      onChange={(e) => setRepPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={repEmail}
                      onChange={(e) => setRepEmail(e.target.value)}
                      placeholder="pastor@yourchurch.org"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setError('');
                    setCurrentStep(1);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleStep2Next} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 3: Branding & Opt-In Page ───────────────────────────── */}
        {currentStep === 3 && (
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Customize Your Opt-In Page
              </h2>
              <p className="text-gray-500 mb-6">
                We&apos;ll generate a compliant opt-in page for your church. This URL goes in your
                A2P registration.
              </p>

              <div className="grid gap-4">
                {/* Slug */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Page URL Slug *
                    <InfoTooltip content="This is the unique URL for your church's opt-in page. Auto-generated from your church name." />
                  </label>
                  <Input
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    placeholder="your-church-name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Preview:{' '}
                    <span className="font-mono text-[#C28C88]">
                      freechurchtexting.com/c/{slug || 'your-slug'}
                    </span>
                  </p>
                </div>

                {/* Logo URL */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Logo URL
                    <InfoTooltip content="URL to your church logo image. Most church websites have this." />
                  </label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://yourchurch.org/logo.png"
                  />
                </div>

                {/* Hero Image URL */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Hero Image URL (optional)
                  </label>
                  <Input
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    placeholder="https://yourchurch.org/hero.jpg"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#C28C88]" />
                  Live Preview
                </h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  {/* Mini mockup of opt-in page */}
                  <div className="bg-gradient-to-br from-[#C28C88]/10 to-[#C28C88]/5 p-6">
                    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4">
                      {/* Logo preview */}
                      <div className="flex justify-center">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt="Church logo"
                            className="h-16 w-16 object-contain rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 bg-[#C28C88]/10 rounded-lg flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-[#C28C88]" />
                          </div>
                        )}
                      </div>

                      <h4 className="text-center font-semibold text-gray-900">
                        {churchName || 'Your Church Name'}
                      </h4>
                      <p className="text-center text-xs text-gray-500">
                        Subscribe to receive text updates
                      </p>

                      {/* Mock form fields */}
                      <div className="space-y-2">
                        <div className="h-8 bg-gray-100 rounded border border-gray-200 px-2 flex items-center">
                          <span className="text-xs text-gray-400">First Name</span>
                        </div>
                        <div className="h-8 bg-gray-100 rounded border border-gray-200 px-2 flex items-center">
                          <span className="text-xs text-gray-400">Phone Number</span>
                        </div>
                      </div>

                      {/* Mock consent checkboxes */}
                      <div className="space-y-1.5">
                        <label className="flex items-start gap-1.5">
                          <div className="h-3.5 w-3.5 mt-0.5 rounded border border-gray-300 flex-shrink-0" />
                          <span className="text-[10px] text-gray-500 leading-tight">
                            I agree to receive text messages from {churchName || 'this church'}. Msg&amp;Data rates may apply.
                          </span>
                        </label>
                        <label className="flex items-start gap-1.5">
                          <div className="h-3.5 w-3.5 mt-0.5 rounded border border-gray-300 flex-shrink-0" />
                          <span className="text-[10px] text-gray-500 leading-tight">
                            I agree to the Privacy Policy and Terms of Service.
                          </span>
                        </label>
                      </div>

                      <div className="h-8 bg-[#C28C88] rounded-lg flex items-center justify-center">
                        <span className="text-xs text-white font-medium">Subscribe</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated URLs */}
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Generated Compliance Pages
                </h3>
                {[
                  {
                    label: 'Opt-in Page',
                    url: `freechurchtexting.com/c/${slug || 'your-slug'}`,
                  },
                  {
                    label: 'Privacy Policy',
                    url: `freechurchtexting.com/c/${slug || 'your-slug'}/privacy`,
                  },
                  {
                    label: 'Terms of Service',
                    url: `freechurchtexting.com/c/${slug || 'your-slug'}/terms`,
                  },
                ].map((page) => (
                  <div
                    key={page.label}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">{page.label}</p>
                      <p className="text-xs text-gray-500 font-mono">{page.url}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`https://${page.url}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setError('');
                    setCurrentStep(2);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleStep3Next} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 4: Sample Messages ──────────────────────────────────── */}
        {currentStep === 4 && (
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Sample Messages for A2P Registration
              </h2>
              <p className="text-gray-500 mb-6">
                Carriers require 2-3 sample messages. We&apos;ve generated these based on your
                church name.
              </p>

              {/* Sample Messages */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#C28C88]" />
                  Sample Messages (editable)
                </h3>

                {[
                  {
                    label: 'Welcome / Opt-in Confirmation',
                    value: sampleMsg1,
                    setter: setSampleMsg1,
                  },
                  {
                    label: 'Event Reminder',
                    value: sampleMsg2,
                    setter: setSampleMsg2,
                  },
                  {
                    label: 'General Update',
                    value: sampleMsg3,
                    setter: setSampleMsg3,
                  },
                ].map((msg, idx) => (
                  <div key={idx}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {idx + 1}. {msg.label} {idx < 2 && '*'}
                    </label>
                    <textarea
                      value={msg.value}
                      onChange={(e) => msg.setter(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {msg.value.length} characters
                    </p>
                  </div>
                ))}
              </div>

              {/* Auto-generated compliance messages */}
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Compliance Messages (auto-generated, editable)
                </h3>

                {[
                  { label: 'Opt-in Message', value: optInMsg, setter: setOptInMsg },
                  { label: 'Opt-out Message', value: optOutMsg, setter: setOptOutMsg },
                  { label: 'Help Message', value: helpMsg, setter: setHelpMsg },
                ].map((msg, idx) => (
                  <div key={idx}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {msg.label}
                    </label>
                    <textarea
                      value={msg.value}
                      onChange={(e) => msg.setter(e.target.value)}
                      rows={2}
                      className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {msg.value.length} characters
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setError('');
                    setCurrentStep(3);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={handleStep4Next} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 5: Review & Complete ─────────────────────────────────── */}
        {currentStep === 5 && !completed && (
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Review Your 10DLC Setup
              </h2>
              <p className="text-gray-500 mb-6">
                Everything looks great! Here&apos;s a summary of your compliance setup.
              </p>

              <div className="space-y-6">
                {/* Business Info */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#C28C88]" />
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Church Name:</span>{' '}
                      <span className="font-medium text-gray-900">{churchName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Business Type:</span>{' '}
                      <span className="font-medium text-gray-900">{businessType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">EIN:</span>{' '}
                      <span className="font-medium text-gray-900">{ein}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>{' '}
                      <span className="font-medium text-gray-900">{phone || 'Not set'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">Address:</span>{' '}
                      <span className="font-medium text-gray-900">
                        {address}, {city}, {state} {zip}
                      </span>
                    </div>
                    {website && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">Website:</span>{' '}
                        <span className="font-medium text-gray-900">{website}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Authorized Rep */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#C28C88]" />
                    Authorized Representative
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>{' '}
                      <span className="font-medium text-gray-900">{repName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Title:</span>{' '}
                      <span className="font-medium text-gray-900">{repTitle || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>{' '}
                      <span className="font-medium text-gray-900">{repPhone || 'Not set'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <span className="font-medium text-gray-900">{repEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Generated Pages */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[#C28C88]" />
                    Generated Compliance Pages
                  </h3>
                  <div className="space-y-2 text-sm">
                    {[
                      {
                        label: 'Opt-in Page',
                        url: `https://freechurchtexting.com/c/${slug}`,
                      },
                      {
                        label: 'Privacy Policy',
                        url: `https://freechurchtexting.com/c/${slug}/privacy`,
                      },
                      {
                        label: 'Terms',
                        url: `https://freechurchtexting.com/c/${slug}/terms`,
                      },
                    ].map((page) => (
                      <div key={page.label} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-500">{page.label}:</span>
                        <span className="font-mono text-xs text-[#C28C88] truncate">
                          {page.url}
                        </span>
                        <button
                          onClick={() => copyToClipboard(page.url)}
                          className="ml-auto text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Messages */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#C28C88]" />
                    Sample Messages
                  </h3>
                  <div className="space-y-2">
                    {[sampleMsg1, sampleMsg2, sampleMsg3].filter(Boolean).map((msg, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-400 mb-1">Sample {idx + 1}</p>
                        <p className="text-sm text-gray-700">{msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setError('');
                    setCurrentStep(4);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Completion State ──────────────────────────────────────────── */}
        {currentStep === 5 && completed && (
          <Card>
            <CardContent className="p-8 text-center">
              {/* Celebration */}
              <div className="relative inline-flex mb-6">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-green-600" />
                </div>
                {/* Confetti dots */}
                <div className="absolute -top-2 -left-2 h-3 w-3 bg-[#C28C88] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="absolute -top-1 right-0 h-2 w-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="absolute bottom-0 -left-3 h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <div className="absolute -bottom-1 -right-2 h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                <div className="absolute top-1 -right-3 h-3 w-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="absolute bottom-2 left-0 h-1.5 w-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '350ms' }} />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                10DLC Compliance Setup Complete!
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Your church&apos;s compliance information has been saved. Now you can proceed with
                A2P registration through your SMS provider.
              </p>

              {/* Next Steps */}
              <div className="max-w-md mx-auto text-left space-y-3 mb-8">
                <h3 className="text-sm font-semibold text-gray-700 text-center mb-4">
                  Next Steps
                </h3>
                {provider === 'twilio' ? (
                  <>
                    <a
                      href="https://www.twilio.com/console/trust-hub"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#C28C88] hover:bg-[#C28C88]/5 transition-all"
                    >
                      <div>
                        <p className="font-medium text-gray-900">Register Brand on Twilio Trust Hub</p>
                        <p className="text-sm text-gray-500">Submit your business details for verification</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                    </a>
                    <a
                      href="https://www.twilio.com/console/messaging/campaigns"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#C28C88] hover:bg-[#C28C88]/5 transition-all"
                    >
                      <div>
                        <p className="font-medium text-gray-900">Create Messaging Campaign</p>
                        <p className="text-sm text-gray-500">Register your use case with sample messages</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="https://portal.telnyx.com/#/app/messaging/campaigns"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#C28C88] hover:bg-[#C28C88]/5 transition-all"
                    >
                      <div>
                        <p className="font-medium text-gray-900">Register Brand on Telnyx</p>
                        <p className="text-sm text-gray-500">Submit your business details for 10DLC</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                    </a>
                    <a
                      href="https://portal.telnyx.com/#/app/messaging/campaigns/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#C28C88] hover:bg-[#C28C88]/5 transition-all"
                    >
                      <div>
                        <p className="font-medium text-gray-900">Create Messaging Campaign</p>
                        <p className="text-sm text-gray-500">Register your use case on Telnyx portal</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                    </a>
                  </>
                )}
              </div>

              <Button size="lg" onClick={() => router.push('/compliance')}>
                Go to Compliance Dashboard
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
