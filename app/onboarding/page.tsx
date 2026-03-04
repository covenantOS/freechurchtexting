'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, ChevronRight, ChevronLeft, Building2, Phone, Upload, Sparkles, AlertCircle, Search, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/tooltip';
import { Footer } from '@/components/layout/footer';

const steps = [
  { id: 1, title: 'Church Info', icon: Building2 },
  { id: 2, title: 'Connect Provider', icon: Phone },
  { id: 3, title: 'Phone Number', icon: Phone },
  { id: 4, title: 'Import Contacts', icon: Upload },
  { id: 5, title: 'All Done!', icon: Sparkles },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession() || {};
  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const [churchData, setChurchData] = React.useState({
    leaderName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    ein: '',
  });

  const [selectedProvider, setSelectedProvider] = React.useState<'twilio' | 'telnyx'>('twilio');
  const [providerData, setProviderData] = React.useState({
    accountSid: '', // Twilio SID or Telnyx API Key
    authToken: '',  // Twilio Auth Token only
  });
  const [providerVerified, setProviderVerified] = React.useState(false);
  const [providerAccountName, setProviderAccountName] = React.useState('');

  const [phoneOption, setPhoneOption] = React.useState<'search' | 'existing'>('search');
  const [areaCode, setAreaCode] = React.useState('');
  const [availableNumbers, setAvailableNumbers] = React.useState<any[]>([]);
  const [selectedNumber, setSelectedNumber] = React.useState('');
  const [existingNumber, setExistingNumber] = React.useState('');

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  React.useEffect(() => {
    if (session?.user?.onboardingCompleted) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  const verifyProvider = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/provider/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, ...providerData }),
      });
      const data = await res.json();
      if (data?.valid) {
        setProviderVerified(true);
        setProviderAccountName(data?.friendlyName || `${selectedProvider === 'twilio' ? 'Twilio' : 'Telnyx'} Account`);
      } else {
        setError(data?.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to verify');
    } finally {
      setLoading(false);
    }
  };

  const searchNumbers = async () => {
    if (!areaCode || areaCode.length !== 3) {
      setError('Please enter a valid 3-digit area code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/provider/search-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, ...providerData, areaCode }),
      });
      const data = await res.json();
      if (data?.numbers?.length > 0) {
        setAvailableNumbers(data.numbers);
      } else {
        setError(data?.error || 'No numbers found for this area code');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  const purchaseNumber = async (phoneNumber: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/provider/purchase-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: selectedProvider, ...providerData, phoneNumber }),
      });
      const data = await res.json();
      if (data?.success) {
        setSelectedNumber(phoneNumber);
      } else {
        setError(data?.error || 'Failed to purchase');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to purchase');
    } finally {
      setLoading(false);
    }
  };

  const saveStep1 = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/church/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(churchData),
      });
      if (!res.ok) throw new Error('Failed to save');
      setCurrentStep(2);
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const saveStep2 = async () => {
    if (!providerVerified) {
      setError('Please verify your credentials first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/church/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          providerAccountSid: providerData.accountSid,
          providerAuthToken: selectedProvider === 'twilio' ? providerData.authToken : '',
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setCurrentStep(3);
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const saveStep3 = async () => {
    const phoneNumber = phoneOption === 'search' ? selectedNumber : existingNumber;
    if (!phoneNumber) {
      setError('Please select or enter a phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/church/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerPhoneNumber: phoneNumber }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setCurrentStep(4);
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/church/complete-onboarding', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to complete');
      await update?.();
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to complete');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#111827] to-[#1f2937] p-2 shadow-lg">
            <MessageSquareText className="h-6 w-6 text-[#C28C88]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 leading-tight">Free Church Texting</span>
            <span className="text-xs text-gray-500">
              by{' '}
              <a href="https://churchposting.com" target="_blank" rel="noopener" className="text-[#C28C88] hover:underline">
                Church Posting
              </a>
            </span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-gray-100 py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps?.map((step, idx) => {
              const Icon = step?.icon;
              const isActive = currentStep === step?.id;
              const isComplete = currentStep > step?.id;
              return (
                <React.Fragment key={step?.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-brand-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : Icon && <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-brand-600 font-medium' : 'text-gray-500'}`}>
                      {step?.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${currentStep > step?.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-8 px-6">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Church Info */}
          {currentStep === 1 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tell us about your church</h2>
                <p className="text-gray-500 mb-6">This information helps with A2P registration compliance.</p>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Leader Name *</label>
                      <Input
                        value={churchData.leaderName}
                        onChange={(e) => setChurchData({ ...churchData, leaderName: e.target.value })}
                        placeholder="Pastor John Smith"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input
                        value={churchData.phone}
                        onChange={(e) => setChurchData({ ...churchData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                    <Input
                      value={churchData.address}
                      onChange={(e) => setChurchData({ ...churchData, address: e.target.value })}
                      placeholder="123 Church St"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                      <Input
                        value={churchData.city}
                        onChange={(e) => setChurchData({ ...churchData, city: e.target.value })}
                        placeholder="Nashville"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                      <Input
                        value={churchData.state}
                        onChange={(e) => setChurchData({ ...churchData, state: e.target.value })}
                        placeholder="TN"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">ZIP</label>
                      <Input
                        value={churchData.zip}
                        onChange={(e) => setChurchData({ ...churchData, zip: e.target.value })}
                        placeholder="37201"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
                      <Input
                        value={churchData.website}
                        onChange={(e) => setChurchData({ ...churchData, website: e.target.value })}
                        placeholder="https://yourchurch.org"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        EIN (Optional)
                        <InfoTooltip content="Your church's Employer Identification Number. Helpful for A2P registration." />
                      </label>
                      <Input
                        value={churchData.ein}
                        onChange={(e) => setChurchData({ ...churchData, ein: e.target.value })}
                        placeholder="12-3456789"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <Button onClick={saveStep1} disabled={loading || !churchData.leaderName}>
                    {loading ? 'Saving...' : 'Continue'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Provider Connection */}
          {currentStep === 2 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connect Your SMS Provider</h2>
                <p className="text-gray-500 mb-6">
                  Choose Twilio or Telnyx — you only pay their per-message cost (~$0.0079/text).
                </p>
                
                {/* Provider Selection */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => {
                      setSelectedProvider('twilio');
                      setProviderVerified(false);
                      setProviderData({ accountSid: '', authToken: '' });
                    }}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      selectedProvider === 'twilio' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-orange-600">T</span>
                    </div>
                    <p className="font-medium">Twilio</p>
                    <p className="text-xs text-gray-500">Industry standard</p>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProvider('telnyx');
                      setProviderVerified(false);
                      setProviderData({ accountSid: '', authToken: '' });
                    }}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      selectedProvider === 'telnyx' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-green-600">T</span>
                    </div>
                    <p className="font-medium">Telnyx</p>
                    <p className="text-xs text-gray-500">Budget-friendly</p>
                  </button>
                </div>

                <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-brand-800">
                    <strong>Don&apos;t have an account?</strong>{' '}
                    {selectedProvider === 'twilio' ? (
                      <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener" className="underline">
                        Sign up for Twilio
                      </a>
                    ) : (
                      <a href="https://telnyx.com/sign-up" target="_blank" rel="noopener" className="underline">
                        Sign up for Telnyx
                      </a>
                    )}{' '}
                    and get started with free credits.
                  </p>
                </div>

                <div className="grid gap-4">
                  {selectedProvider === 'twilio' ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          Account SID
                          <InfoTooltip content="Find this on your Twilio Console dashboard" />
                        </label>
                        <Input
                          value={providerData.accountSid}
                          onChange={(e) => setProviderData({ ...providerData, accountSid: e.target.value })}
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          Auth Token
                          <InfoTooltip content="Keep this secret! Find it below your Account SID on Twilio Console" />
                        </label>
                        <Input
                          type="password"
                          value={providerData.authToken}
                          onChange={(e) => setProviderData({ ...providerData, authToken: e.target.value })}
                          placeholder="Your auth token"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        API Key
                        <InfoTooltip content="Find this in your Telnyx Portal under API Keys" />
                      </label>
                      <Input
                        type="password"
                        value={providerData.accountSid}
                        onChange={(e) => setProviderData({ ...providerData, accountSid: e.target.value })}
                        placeholder="KEY_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                  )}
                </div>

                {providerVerified ? (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">Connected to: {providerAccountName}</span>
                  </div>
                ) : (
                  <Button
                    onClick={verifyProvider}
                    variant="secondary"
                    className="mt-4"
                    disabled={loading || !providerData.accountSid || (selectedProvider === 'twilio' && !providerData.authToken)}
                  >
                    {loading ? 'Verifying...' : 'Verify Connection'}
                  </Button>
                )}

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={saveStep2} disabled={loading || !providerVerified}>
                    {loading ? 'Saving...' : 'Continue'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Phone Number */}
          {currentStep === 3 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Get a Phone Number</h2>
                <p className="text-gray-500 mb-6">Search for a new number or use an existing {selectedProvider === 'twilio' ? 'Twilio' : 'Telnyx'} number.</p>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setPhoneOption('search')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      phoneOption === 'search' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Search className="h-6 w-6 mb-2 mx-auto text-brand-600" />
                    <p className="font-medium">Search New Number</p>
                    <p className="text-sm text-gray-500">$1.15/month per number</p>
                  </button>
                  <button
                    onClick={() => setPhoneOption('existing')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      phoneOption === 'existing' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Phone className="h-6 w-6 mb-2 mx-auto text-brand-600" />
                    <p className="font-medium">Use Existing Number</p>
                    <p className="text-sm text-gray-500">Already have a {selectedProvider === 'twilio' ? 'Twilio' : 'Telnyx'} number</p>
                  </button>
                </div>
                {phoneOption === 'search' ? (
                  <div>
                    <div className="flex gap-3 mb-4">
                      <Input
                        value={areaCode}
                        onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="Area code (e.g. 615)"
                        className="w-40"
                      />
                      <Button onClick={searchNumbers} disabled={loading || areaCode.length !== 3}>
                        {loading ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                    {availableNumbers?.length > 0 && (
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {availableNumbers?.slice(0, 10)?.map((num) => (
                          <button
                            key={num?.phoneNumber}
                            onClick={() => purchaseNumber(num?.phoneNumber)}
                            disabled={loading || selectedNumber === num?.phoneNumber}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              selectedNumber === num?.phoneNumber
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50'
                            }`}
                          >
                            <span className="font-mono font-medium">{num?.friendlyName}</span>
                            {selectedNumber === num?.phoneNumber && (
                              <Check className="h-4 w-4 text-green-600 inline ml-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Your {selectedProvider === 'twilio' ? 'Twilio' : 'Telnyx'} Phone Number</label>
                    <Input
                      value={existingNumber}
                      onChange={(e) => setExistingNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                )}
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button onClick={saveStep3} disabled={loading || (!selectedNumber && !existingNumber)}>
                    {loading ? 'Saving...' : 'Continue'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Import Contacts */}
          {currentStep === 4 && (
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Import Your Contacts</h2>
                <p className="text-gray-500 mb-6">Upload a CSV file with your congregation&apos;s contact list.</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your CSV file here, or click to browse</p>
                  <p className="text-sm text-gray-400 mb-4">Supports CSV files with columns: first_name, last_name, phone, email</p>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="csv-upload"
                    onChange={() => {}}
                  />
                  <label htmlFor="csv-upload">
                    <Button variant="secondary" className="cursor-pointer" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
                <div className="mt-4 text-center">
                  <a href="/templates/contacts-template.csv" className="text-sm text-brand-600 hover:underline">
                    Download CSV Template
                  </a>
                </div>
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setCurrentStep(5)}>
                      Skip for now
                    </Button>
                    <Button onClick={() => setCurrentStep(5)}>
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Done */}
          {currentStep === 5 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">You&apos;re All Set!</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Your church texting platform is ready. Start connecting with your congregation today!
                </p>
                <Button size="lg" onClick={completeOnboarding} disabled={loading}>
                  {loading ? 'Finishing...' : 'Go to Dashboard'}
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
