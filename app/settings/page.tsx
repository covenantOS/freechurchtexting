'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import {
  Building2,
  Phone,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Users,
  UserPlus,
  Trash2,
  Mail,
  Crown,
  Bot,
  Plus,
  Circle,
  Loader2,
} from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';

interface Church {
  name: string;
  leaderName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  ein?: string;
  provider: string;
  providerAccountSid?: string;
  providerPhoneNumber?: string;
  a2pStatus: string;
  subscriptionTier: string;
  timezone: string;
}

interface AutoReply {
  id: string;
  keyword: string;
  response: string;
  isActive: boolean;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TeamInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'America/Phoenix', label: 'Arizona Time' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
];

export default function SettingsPage() {
  const { data: session } = useSession() || {};
  const { adminFetch, effectiveChurchId } = useAdmin();
  const [activeTab, setActiveTab] = React.useState('profile');
  const [church, setChurch] = React.useState<Church | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const [showToken, setShowToken] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    leaderName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    ein: '',
    timezone: 'America/New_York',
  });

  const [twilioData, setTwilioData] = React.useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
  });

  // Provider state
  const [selectedProvider, setSelectedProvider] = React.useState<'twilio' | 'telnyx'>('twilio');
  const [providerVerified, setProviderVerified] = React.useState(false);

  // A2P state
  const [a2pSubmitting, setA2pSubmitting] = React.useState(false);

  // Auto-reply state
  const [autoReplies, setAutoReplies] = React.useState<AutoReply[]>([]);
  const [autoReplyLoading, setAutoReplyLoading] = React.useState(false);
  const [newKeyword, setNewKeyword] = React.useState('');
  const [newResponse, setNewResponse] = React.useState('');
  const [autoReplySaving, setAutoReplySaving] = React.useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [teamInvites, setTeamInvites] = React.useState<TeamInvite[]>([]);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('member');
  const [inviting, setInviting] = React.useState(false);

  // Refetch when church context changes (admin impersonation)
  React.useEffect(() => {
    setChurch(null);
    setLoading(true);
    fetchChurch();
  }, [effectiveChurchId]);

  const fetchChurch = async () => {
    try {
      const res = await adminFetch('/api/church');
      const data = await res.json();
      if (data?.church) {
        setChurch(data.church);
        setFormData({
          name: data.church?.name || '',
          leaderName: data.church?.leaderName || '',
          phone: data.church?.phone || '',
          address: data.church?.address || '',
          city: data.church?.city || '',
          state: data.church?.state || '',
          zip: data.church?.zip || '',
          website: data.church?.website || '',
          ein: data.church?.ein || '',
          timezone: data.church?.timezone || 'America/New_York',
        });
        setSelectedProvider(data.church?.provider || 'twilio');
        setTwilioData({
          accountSid: data.church?.providerAccountSid ? '••••••••••••••••' : '',
          authToken: '',
          phoneNumber: data.church?.providerPhoneNumber || '',
        });
        setProviderVerified(!!data.church?.providerAccountSid);
      }
    } catch (error) {
      console.error('Failed to fetch church:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch('/api/church/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Profile saved successfully!');
      fetchChurch();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const testProviderConnection = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch('/api/provider/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          accountSid: twilioData.accountSid?.includes?.('•') ? undefined : twilioData.accountSid,
          authToken: twilioData.authToken || undefined,
        }),
      });

      const data = await res.json();
      if (data?.valid) {
        setSuccess(`${selectedProvider === 'telnyx' ? 'Telnyx' : 'Twilio'} connection verified!`);
        setProviderVerified(true);
      } else {
        setError(data?.error || 'Connection failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Connection failed');
    } finally {
      setSaving(false);
    }
  };

  const saveProviderCredentials = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch('/api/church/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          providerAccountSid: twilioData.accountSid?.includes?.('•') ? undefined : twilioData.accountSid,
          providerAuthToken: selectedProvider === 'twilio' ? (twilioData.authToken || undefined) : '',
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Provider credentials saved successfully!');
      fetchChurch();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchProvider = (provider: 'twilio' | 'telnyx') => {
    setSelectedProvider(provider);
    setTwilioData({ accountSid: '', authToken: '', phoneNumber: twilioData.phoneNumber });
    setProviderVerified(false);
    setError('');
    setSuccess('');
  };

  // A2P actions
  const submitBrand = async () => {
    setA2pSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch('/api/a2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to submit brand');

      setSuccess(data?.message || 'Brand registration submitted!');
      fetchChurch();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit brand');
    } finally {
      setA2pSubmitting(false);
    }
  };

  const submitCampaign = async () => {
    setA2pSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch('/api/a2p', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to submit campaign');

      setSuccess(data?.message || 'Campaign registration submitted!');
      fetchChurch();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit campaign');
    } finally {
      setA2pSubmitting(false);
    }
  };

  // Auto-reply actions
  const fetchAutoReplies = async () => {
    setAutoReplyLoading(true);
    try {
      const res = await adminFetch('/api/auto-replies');
      const data = await res.json();
      if (data?.autoReplies) setAutoReplies(data.autoReplies);
    } catch (error) {
      console.error('Failed to fetch auto-replies:', error);
    } finally {
      setAutoReplyLoading(false);
    }
  };

  const createAutoReply = async () => {
    if (!newKeyword?.trim() || !newResponse?.trim()) {
      setError('Keyword and response are required');
      return;
    }
    setAutoReplySaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch('/api/auto-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword, response: newResponse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create auto-reply');

      setSuccess('Auto-reply created!');
      setNewKeyword('');
      setNewResponse('');
      fetchAutoReplies();
    } catch (err: any) {
      setError(err?.message || 'Failed to create auto-reply');
    } finally {
      setAutoReplySaving(false);
    }
  };

  const toggleAutoReply = async (id: string, isActive: boolean) => {
    try {
      const res = await adminFetch(`/api/auto-replies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to update');
      }
      fetchAutoReplies();
    } catch (err: any) {
      setError(err?.message || 'Failed to update auto-reply');
    }
  };

  const deleteAutoReply = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auto-reply?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch(`/api/auto-replies/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to delete');
      }
      setSuccess('Auto-reply deleted');
      fetchAutoReplies();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete auto-reply');
    }
  };

  const getA2PBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
      not_started: { label: 'Not Started', variant: 'warning' },
      brand_submitted: { label: 'Brand Submitted', variant: 'default' },
      brand_approved: { label: 'Brand Approved', variant: 'default' },
      campaign_submitted: { label: 'Campaign Submitted', variant: 'default' },
      campaign_approved: { label: 'Campaign Approved', variant: 'success' },
      fully_approved: { label: 'Fully Approved', variant: 'success' },
      rejected: { label: 'Rejected', variant: 'destructive' },
    };
    const info = map[status] || { label: 'Unknown', variant: 'default' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const providerName = selectedProvider === 'telnyx' ? 'Telnyx' : 'Twilio';

  const tabs = [
    { id: 'profile', label: 'Church Profile', icon: Building2 },
    { id: 'provider', label: `${providerName} Settings`, icon: Phone },
    { id: 'a2p', label: 'A2P Status', icon: Shield },
    { id: 'team', label: 'Team', icon: Users },
    ...(church?.subscriptionTier === 'blue_dedicated' ? [{ id: 'autoreplies', label: 'Auto-Replies', icon: Bot }] : []),
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const fetchTeam = async () => {
    try {
      const res = await adminFetch('/api/team');
      const data = await res.json();
      if (data?.members) setTeamMembers(data.members);
      if (data?.invites) setTeamInvites(data.invites);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail?.trim()) {
      setError('Please enter an email address');
      return;
    }
    setError('');
    setSuccess('');
    setInviting(true);

    try {
      const res = await adminFetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send invite');

      setSuccess('Invitation sent successfully!');
      setInviteEmail('');
      setInviteRole('member');
      fetchTeam();
    } catch (err: any) {
      setError(err?.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch(`/api/team/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to remove member');
      }
      setSuccess('Team member removed');
      fetchTeam();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove team member');
    }
  };

  const handleRevokeInvite = async (id: string) => {
    setError('');
    setSuccess('');

    try {
      const res = await adminFetch(`/api/team/invite/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to revoke invite');
      }
      setSuccess('Invite revoked');
      fetchTeam();
    } catch (err: any) {
      setError(err?.message || 'Failed to revoke invite');
    }
  };

  React.useEffect(() => {
    if (activeTab === 'team' && session?.user?.role === 'admin') {
      fetchTeam();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session?.user?.role]);

  React.useEffect(() => {
    if (activeTab === 'autoreplies' && church?.subscriptionTier === 'blue_dedicated') {
      fetchAutoReplies();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, church?.subscriptionTier, effectiveChurchId]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your church and account settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {tabs?.map?.((tab) => {
                    const Icon = tab?.icon;
                    return (
                      <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id || '')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          activeTab === tab?.id
                            ? 'bg-brand-50 text-brand-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        {tab?.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Church Profile</CardTitle>
                  <CardDescription>Update your church information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Church Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Leader Name</label>
                      <Input
                        value={formData.leaderName}
                        onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">ZIP</label>
                      <Input
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
                      <Input
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        EIN
                        <InfoTooltip content="Employer Identification Number for A2P registration" />
                      </label>
                      <Input
                        value={formData.ein}
                        onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Timezone</label>
                    <Select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      options={TIMEZONES}
                    />
                  </div>
                  <div className="pt-4">
                    <Button onClick={saveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'provider' && (
              <Card>
                <CardHeader>
                  <CardTitle>{providerName} Settings</CardTitle>
                  <CardDescription>Manage your {providerName} integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Provider Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">SMS Provider</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSwitchProvider('twilio')}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${
                          selectedProvider === 'twilio' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center mx-auto mb-1">
                          <span className="text-sm font-bold text-orange-600">T</span>
                        </div>
                        <p className="text-sm font-medium">Twilio</p>
                        <p className="text-xs text-gray-500">Industry standard</p>
                      </button>
                      <button
                        onClick={() => handleSwitchProvider('telnyx')}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${
                          selectedProvider === 'telnyx' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-1">
                          <span className="text-sm font-bold text-green-600">T</span>
                        </div>
                        <p className="text-sm font-medium">Telnyx</p>
                        <p className="text-xs text-gray-500">Budget-friendly</p>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Credential Fields */}
                  {selectedProvider === 'twilio' ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          Account SID
                          <InfoTooltip content="Found on your Twilio Console dashboard" />
                        </label>
                        <Input
                          value={twilioData.accountSid}
                          onChange={(e) => setTwilioData({ ...twilioData, accountSid: e.target.value })}
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          Auth Token
                          <InfoTooltip content="Keep this secret! Below Account SID on Console" />
                        </label>
                        <div className="relative">
                          <Input
                            type={showToken ? 'text' : 'password'}
                            value={twilioData.authToken}
                            onChange={(e) => setTwilioData({ ...twilioData, authToken: e.target.value })}
                            placeholder="Enter new token to update"
                          />
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        API Key
                        <InfoTooltip content="Find this in your Telnyx Portal under API Keys" />
                      </label>
                      <div className="relative">
                        <Input
                          type={showToken ? 'text' : 'password'}
                          value={twilioData.accountSid}
                          onChange={(e) => setTwilioData({ ...twilioData, accountSid: e.target.value })}
                          placeholder="KEY_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                    <Input value={twilioData.phoneNumber} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">Contact support to change your phone number</p>
                  </div>

                  {providerVerified && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">{providerName} credentials verified</span>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <Button onClick={testProviderConnection} disabled={saving} variant="outline">
                      {saving ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button onClick={saveProviderCredentials} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Credentials'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'a2p' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>A2P 10DLC Registration</CardTitle>
                    <CardDescription>Register your phone number for Application-to-Person messaging</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Current Status Badge */}
                    <div className="p-4 bg-gray-50 rounded-xl mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Current Status</p>
                        {getA2PBadge(church?.a2pStatus || 'not_started')}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.twilio.com/console/messaging/bundles" target="_blank" rel="noopener">
                          View in Twilio Console
                        </a>
                      </Button>
                    </div>

                    {/* Step-by-step A2P Progress */}
                    <div className="space-y-4 mb-6">
                      {[
                        {
                          step: 1,
                          title: 'Brand Registration',
                          description: 'Submit your church business info for carrier verification',
                          completedStatuses: ['brand_submitted', 'brand_approved', 'campaign_submitted', 'campaign_approved', 'fully_approved'],
                          currentStatuses: ['not_started'],
                          action: church?.a2pStatus === 'not_started' ? submitBrand : undefined,
                          actionLabel: 'Submit Brand',
                        },
                        {
                          step: 2,
                          title: 'Brand Review',
                          description: 'Carriers review your brand info (1-5 business days)',
                          completedStatuses: ['brand_approved', 'campaign_submitted', 'campaign_approved', 'fully_approved'],
                          currentStatuses: ['brand_submitted'],
                        },
                        {
                          step: 3,
                          title: 'Campaign Registration',
                          description: 'Register your messaging campaign use case',
                          completedStatuses: ['campaign_submitted', 'campaign_approved', 'fully_approved'],
                          currentStatuses: ['brand_approved'],
                          action: church?.a2pStatus === 'brand_approved' ? submitCampaign : undefined,
                          actionLabel: 'Submit Campaign',
                        },
                        {
                          step: 4,
                          title: 'Campaign Review',
                          description: 'Final review of your messaging campaign (1-3 business days)',
                          completedStatuses: ['campaign_approved', 'fully_approved'],
                          currentStatuses: ['campaign_submitted'],
                        },
                      ].map((item) => {
                        const status = church?.a2pStatus || 'not_started';
                        const isCompleted = item.completedStatuses.includes(status);
                        const isCurrent = item.currentStatuses.includes(status);
                        const isRejected = status === 'rejected';

                        return (
                          <div
                            key={item.step}
                            className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                              isCompleted
                                ? 'border-green-200 bg-green-50'
                                : isCurrent
                                ? 'border-brand-200 bg-brand-50'
                                : isRejected
                                ? 'border-red-200 bg-red-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                              ) : isCurrent ? (
                                <div className="h-6 w-6 rounded-full border-2 border-brand-500 bg-brand-500 flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">{item.step}</span>
                                </div>
                              ) : (
                                <Circle className="h-6 w-6 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isCompleted ? 'text-green-800' : isCurrent ? 'text-brand-800' : 'text-gray-500'}`}>
                                {item.title}
                              </p>
                              <p className={`text-sm ${isCompleted ? 'text-green-600' : isCurrent ? 'text-brand-600' : 'text-gray-400'}`}>
                                {item.description}
                              </p>
                              {isCurrent && item.action && (
                                <Button
                                  className="mt-3"
                                  size="sm"
                                  onClick={item.action}
                                  disabled={a2pSubmitting}
                                >
                                  {a2pSubmitting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Submitting...
                                    </>
                                  ) : (
                                    item.actionLabel
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Rejected Status */}
                    {church?.a2pStatus === 'rejected' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                        <p className="text-red-800 font-medium">Your A2P registration was rejected.</p>
                        <p className="text-sm text-red-600 mt-1">
                          Please check the Twilio Console for details on why your registration was rejected.
                          You may need to update your business information and resubmit.
                        </p>
                      </div>
                    )}

                    {/* A2P Help Section */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800">
                        <strong>Need help with A2P?</strong> Church Posting can handle your A2P registration for $197.
                      </p>
                      <Button variant="gold" className="mt-3" asChild>
                        <a href="https://churchposting.com" target="_blank" rel="noopener">
                          Get A2P Help
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Skip A2P with Blue upsell */}
                {church?.subscriptionTier !== 'blue_shared' && church?.subscriptionTier !== 'blue_dedicated' && (
                  <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">Skip A2P with Church Posting Blue</h3>
                          <p className="text-slate-300 mt-1 text-sm">
                            Blue uses iMessage + RCS and does not require A2P registration. Get 92% reply rates with no carrier fees.
                          </p>
                          <Button variant="gold" className="mt-4" asChild>
                            <Link href="/blue">
                              Learn About Blue
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                {session?.user?.role !== 'admin' ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Only admins can manage team members.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Invite Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <UserPlus className="h-5 w-5" />
                          Invite Team Member
                        </CardTitle>
                        <CardDescription>
                          Send an invitation to add someone to your team
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Input
                            type="email"
                            placeholder="colleague@church.org"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1"
                          />
                          <Select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            options={[
                              { value: 'member', label: 'Member' },
                              { value: 'admin', label: 'Admin' },
                            ]}
                            className="w-full sm:w-32"
                          />
                          <Button onClick={handleInvite} disabled={inviting}>
                            {inviting ? 'Sending...' : 'Send Invite'}
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Members can send messages and manage contacts. Admins can also manage team and settings.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Team Members */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                          {teamMembers?.length || 0} member{(teamMembers?.length || 0) !== 1 ? 's' : ''} on your team
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {teamMembers?.map((member) => (
                            <div
                              key={member?.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-brand-600">
                                    {member?.name?.[0]?.toUpperCase?.() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">{member?.name}</p>
                                    {member?.role === 'admin' && (
                                      <Crown className="h-4 w-4 text-amber-500" />
                                    )}
                                    {member?.id === session?.user?.id && (
                                      <Badge variant="secondary" className="text-xs">You</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">{member?.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={member?.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                  {member?.role}
                                </Badge>
                                {member?.id !== session?.user?.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleRemoveMember(member?.id || '')}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pending Invites */}
                    {(teamInvites?.length || 0) > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Pending Invitations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {teamInvites?.map((invite) => (
                              <div
                                key={invite?.id}
                                className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">{invite?.email}</p>
                                  <p className="text-sm text-gray-500">
                                    Invited as {invite?.role} • Expires {new Date(invite?.expiresAt || '').toLocaleDateString?.()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRevokeInvite(invite?.id || '')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'autoreplies' && church?.subscriptionTier === 'blue_dedicated' && (
              <div className="space-y-6">
                {/* Add New Auto-Reply */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add Auto-Reply
                    </CardTitle>
                    <CardDescription>
                      Create keyword-triggered automatic responses for incoming messages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Keyword</label>
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="e.g., hours, location, events"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          When someone texts this word, the auto-reply will be sent
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Response</label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                          placeholder="The message that will be sent automatically..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={createAutoReply} disabled={autoReplySaving || !newKeyword?.trim() || !newResponse?.trim()}>
                        {autoReplySaving ? 'Saving...' : 'Save Auto-Reply'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Existing Auto-Replies */}
                <Card>
                  <CardHeader>
                    <CardTitle>Auto-Replies</CardTitle>
                    <CardDescription>
                      {autoReplies?.length || 0} auto-repl{(autoReplies?.length || 0) !== 1 ? 'ies' : 'y'} configured
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {autoReplyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : (autoReplies?.length || 0) === 0 ? (
                      <div className="text-center py-8">
                        <Bot className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No auto-replies yet</p>
                        <p className="text-sm text-gray-400">Create your first auto-reply above</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {autoReplies?.map((ar) => (
                          <div
                            key={ar?.id}
                            className={`p-4 rounded-lg border transition-all ${
                              ar?.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge variant={ar?.isActive ? 'default' : 'secondary'} className="font-mono text-xs">
                                  {ar?.keyword}
                                </Badge>
                                <Switch
                                  checked={ar?.isActive}
                                  onCheckedChange={(checked) => toggleAutoReply(ar?.id, checked)}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => deleteAutoReply(ar?.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600">{ar?.response}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>You&apos;re using Free Church Texting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant="secondary" className="mb-2">Free Plan</Badge>
                          <p className="text-2xl font-bold text-gray-900">$0/month</p>
                          <p className="text-sm text-gray-500">+ Twilio per-message costs (~$0.0079/text)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Upgrade to Church Posting Blue</h3>
                        <p className="text-slate-300 mt-1">Unlimited iMessage + RCS, no per-message fees, 92% reply rates</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-slate-400 text-sm">Free Church Texting</p>
                        <ul className="mt-2 space-y-2 text-sm text-white">
                          <li>✓ Unlimited contacts</li>
                          <li>✓ SMS messaging</li>
                          <li>✓ ~$0.0079/text (Twilio)</li>
                          <li>✓ A2P required</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-amber-500/20 rounded-xl border border-amber-500/30">
                        <p className="text-amber-400 text-sm font-medium">Church Posting Blue</p>
                        <ul className="mt-2 space-y-2 text-sm text-white">
                          <li>✓ Unlimited contacts</li>
                          <li>✓ iMessage + RCS + SMS</li>
                          <li>✓ No per-message fees</li>
                          <li>✓ No A2P needed</li>
                          <li>✓ 92% reply rates</li>
                        </ul>
                        <div className="mt-3 pt-3 border-t border-amber-500/30">
                          <p className="text-xs text-slate-400">Shared Enterprise: $249/mo</p>
                          <p className="text-xs text-slate-400">Dedicated: $397/mo</p>
                        </div>
                      </div>
                    </div>

                    <Button variant="gold" size="lg" className="w-full" asChild>
                      <Link href="/blue">
                        Upgrade to Blue — Starting at $249/mo
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
