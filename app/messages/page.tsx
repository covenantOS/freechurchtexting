'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/tooltip';
import { IMessageComposer } from '@/components/messaging/imessage-composer';
import { AIComposer } from '@/components/messaging/ai-composer';
import { SmartUpsell } from '@/components/ai/smart-upsell';
import { IMessageTeaser } from '@/components/messaging/imessage-teaser';
import { useAdmin } from '@/lib/admin-context';
import {
  Send,
  User,
  Users,
  MessageSquare,
  History,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Trash2,
  CalendarClock,
  Sparkles,
  Apple,
  Shuffle,
  Timer,
  Eye,
  Zap,
} from 'lucide-react';
import { calculateSegments, calculateCost, formatCost } from '@/lib/sms-calculator';
import { formatDisplay } from '@/lib/phone';
import { processSpintax, generateVariations, hasSpintax } from '@/lib/spintax';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string | null;
  phone: string;
  optInStatus: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
  memberCount?: number;
}

interface Template {
  id: string;
  name: string;
  body: string;
}

interface Message {
  id: string;
  type: string;
  body: string;
  status: string;
  segmentsUsed: number;
  totalRecipients: number;
  createdAt: string;
  recipientGroupId?: string | null;
}

interface ScheduledMessage {
  id: string;
  type: string;
  body: string;
  status: string;
  scheduledFor: string;
  recipientGroupId?: string | null;
  sender: { name: string; email: string };
}

export default function MessagesPage() {
  const { data: session } = useSession() || {};
  const { effectiveSubscriptionTier, adminFetch, effectiveChurchId } = useAdmin();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') === 'history' ? 'history' : 'compose';
  const initialType = searchParams?.get('type') || 'individual';

  // Use effective subscription tier (respects admin impersonation)
  const subscriptionTier = effectiveSubscriptionTier || 'free';
  const isBlue = subscriptionTier === 'blue_shared' || subscriptionTier === 'blue_dedicated';

  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [recipientType, setRecipientType] = React.useState<'individual' | 'group' | 'all'>(initialType as any);
  const [selectedContactId, setSelectedContactId] = React.useState('');
  const [selectedGroupId, setSelectedGroupId] = React.useState('');
  const [messageBody, setMessageBody] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState('');

  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [scheduledMessages, setScheduledMessages] = React.useState<ScheduledMessage[]>([]);
  const [optedInCount, setOptedInCount] = React.useState(0);

  const [contactSearch, setContactSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  // Scheduling state
  const [isScheduled, setIsScheduled] = React.useState(false);
  const [scheduledDateTime, setScheduledDateTime] = React.useState('');

  // Sending mode state
  const [sendingMode, setSendingMode] = React.useState<'instant' | 'drip' | 'random'>('instant');
  const [dripIntervalSeconds, setDripIntervalSeconds] = React.useState(30);
  const [dripIntervalUnit, setDripIntervalUnit] = React.useState<'seconds' | 'minutes'>('seconds');
  const [randomMinSeconds, setRandomMinSeconds] = React.useState(10);
  const [randomMaxSeconds, setRandomMaxSeconds] = React.useState(60);

  // Spintax preview state
  const [showSpintaxPreview, setShowSpintaxPreview] = React.useState(false);
  const [spintaxPreviews, setSpintaxPreviews] = React.useState<string[]>([]);

  // Refetch data when church context changes (admin impersonation)
  React.useEffect(() => {
    setContacts([]);
    setGroups([]);
    setTemplates([]);
    setMessages([]);
    setScheduledMessages([]);
    setOptedInCount(0);
    setLoading(true);
    fetchData();
  }, [effectiveChurchId]);

  const fetchData = async () => {
    try {
      const [contactsRes, groupsRes, templatesRes, messagesRes, scheduledRes] = await Promise.all([
        adminFetch('/api/contacts'),
        adminFetch('/api/groups'),
        adminFetch('/api/templates'),
        adminFetch('/api/messages'),
        adminFetch('/api/scheduled-messages'),
      ]);

      const contactsData = await contactsRes.json();
      const groupsData = await groupsRes.json();
      const templatesData = await templatesRes.json();
      const messagesData = await messagesRes.json();
      const scheduledData = await scheduledRes.json();

      setContacts(contactsData?.contacts || []);
      setGroups(groupsData?.groups || []);
      setTemplates(templatesData?.templates || []);
      setMessages(messagesData?.messages || []);
      setScheduledMessages(scheduledData?.scheduledMessages || []);

      const optedIn = (contactsData?.contacts || [])?.filter?.((c: Contact) => c?.optInStatus === 'opted_in')?.length ?? 0;
      setOptedInCount(optedIn);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = React.useMemo(() => {
    return (contacts || [])?.filter((c) => {
      if (!contactSearch) return true;
      const searchTerms = contactSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const contactText = `${c?.firstName || ''} ${c?.lastName || ''} ${c?.phone || ''}`.toLowerCase();
      return searchTerms.every(term => contactText.includes(term));
    });
  }, [contacts, contactSearch]);

  const getRecipientCount = () => {
    if (recipientType === 'individual') return selectedContactId ? 1 : 0;
    if (recipientType === 'group') {
      const group = groups?.find?.((g) => g?.id === selectedGroupId);
      return group?.memberCount || 0;
    }
    return optedInCount;
  };

  const segmentInfo = calculateSegments(messageBody || '');
  const recipientCount = getRecipientCount();
  const estimatedCost = calculateCost(segmentInfo?.segments || 0, recipientCount);

  const insertMergeTag = (tag: string) => {
    setMessageBody((prev) => (prev || '') + tag);
  };

  const insertSpintaxTemplate = () => {
    setMessageBody((prev) => (prev || '') + '{|}');
  };

  const handlePreviewVariations = () => {
    if (!messageBody) return;
    const previews = generateVariations(messageBody, 5);
    setSpintaxPreviews(previews);
    setShowSpintaxPreview(true);
  };

  // Compute the actual drip interval in seconds (accounting for unit)
  const effectiveDripInterval = dripIntervalUnit === 'minutes' ? dripIntervalSeconds * 60 : dripIntervalSeconds;

  const loadTemplate = (templateId: string) => {
    const template = templates?.find?.((t) => t?.id === templateId);
    if (template) {
      setMessageBody(template?.body || '');
      setSelectedTemplate(templateId);
    }
  };

  const handleSend = async () => {
    if (!messageBody?.trim?.()) {
      setError('Please enter a message');
      return;
    }

    if (recipientType === 'individual' && !selectedContactId) {
      setError('Please select a contact');
      return;
    }

    if (recipientType === 'group' && !selectedGroupId) {
      setError('Please select a group');
      return;
    }

    if (isScheduled && !scheduledDateTime) {
      setError('Please select a date and time for the scheduled message');
      return;
    }

    if (isScheduled && recipientType === 'individual') {
      setError('Scheduled messages can only be sent to groups or all opted-in contacts');
      return;
    }

    setError('');
    setSuccess('');
    setSending(true);

    try {
      if (isScheduled) {
        // Create scheduled message
        const res = await adminFetch('/api/scheduled-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'blast',
            recipientGroupId: recipientType === 'all' ? 'all-opted-in' : selectedGroupId,
            body: messageBody,
            scheduledFor: scheduledDateTime,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to schedule');
        }

        setSuccess('Message scheduled successfully!');
      } else {
        // Send immediately (or queue for drip/random)
        const sendPayload: Record<string, unknown> = {
          type: recipientType === 'individual' ? 'individual' : 'blast',
          recipientContactId: recipientType === 'individual' ? selectedContactId : null,
          recipientGroupId: recipientType === 'group' ? selectedGroupId : null,
          sendToAll: recipientType === 'all',
          body: messageBody,
          sendingMode: recipientType === 'individual' ? 'instant' : sendingMode,
        };

        if (sendingMode === 'drip' && recipientType !== 'individual') {
          sendPayload.dripIntervalSeconds = effectiveDripInterval;
        }
        if (sendingMode === 'random' && recipientType !== 'individual') {
          sendPayload.randomMinSeconds = randomMinSeconds;
          sendPayload.randomMaxSeconds = randomMaxSeconds;
        }

        const res = await adminFetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sendPayload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to send');
        }

        const modeLabel = sendingMode === 'drip' ? 'queued (drip mode)' :
                          sendingMode === 'random' ? 'queued (random mode)' :
                          recipientType === 'individual' ? 'sent' : 'sent';
        setSuccess(`Message ${modeLabel} successfully!`);
      }

      setMessageBody('');
      setSelectedContactId('');
      setSelectedGroupId('');
      setSelectedTemplate('');
      setIsScheduled(false);
      setScheduledDateTime('');
      setSendingMode('instant');
      setShowSpintaxPreview(false);
      setSpintaxPreviews([]);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCancelScheduled = async (id: string) => {
    try {
      const res = await adminFetch(`/api/scheduled-messages/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to cancel');
      }

      setSuccess('Scheduled message cancelled');
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel scheduled message');
    }
  };

  const getScheduledStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
      pending: { icon: <Clock className="h-3 w-3" />, variant: 'warning' },
      processing: { icon: <Clock className="h-3 w-3" />, variant: 'default' },
      sent: { icon: <CheckCircle2 className="h-3 w-3" />, variant: 'success' },
      failed: { icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
      cancelled: { icon: <XCircle className="h-3 w-3" />, variant: 'default' },
    };
    const { icon, variant } = config[status] || { icon: null, variant: 'default' as const };
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
      queued: { icon: <Clock className="h-3 w-3" />, variant: 'warning' },
      sending: { icon: <Clock className="h-3 w-3" />, variant: 'default' },
      sent: { icon: <CheckCircle2 className="h-3 w-3" />, variant: 'success' },
      delivered: { icon: <CheckCircle2 className="h-3 w-3" />, variant: 'success' },
      failed: { icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
    };
    const { icon, variant } = config[status] || { icon: null, variant: 'default' as const };
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  // Handler for iMessage composer
  const handleIMessageSend = async (data: { body: string; recipientType: string; recipientId?: string }) => {
    setError('');
    setSuccess('');
    
    try {
      const response = await adminFetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: data.body,
          recipientType: data.recipientType,
          contactId: data.recipientType === 'individual' ? data.recipientId : undefined,
          groupId: data.recipientType === 'group' ? data.recipientId : undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send');
      
      setSuccess(`Message sent via iMessage/RCS!`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              Messages
              {isBlue && (
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <Apple className="h-3 w-3 mr-1" />
                  iMessage + RCS
                </Badge>
              )}
            </h1>
            <p className="text-gray-500 mt-1">
              {isBlue ? 'Send iMessage & RCS to your congregation' : 'Send texts to your congregation'}
            </p>
          </div>
          {isBlue && (
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4 text-amber-500" />
              92% avg. reply rate
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'compose'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="h-4 w-4 inline mr-2" />
            Compose
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'scheduled'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarClock className="h-4 w-4 inline mr-2" />
            Scheduled
            {scheduledMessages?.filter?.(m => m?.status === 'pending')?.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                {scheduledMessages?.filter?.(m => m?.status === 'pending')?.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="h-4 w-4 inline mr-2" />
            History
          </button>
        </div>

        {activeTab === 'compose' && isBlue && (
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>{success}</span>
              </div>
            )}
            <Card className="overflow-hidden">
              <IMessageComposer
                contacts={contacts}
                groups={groups}
                optedInCount={optedInCount}
                onSend={handleIMessageSend}
                recentMessages={messages}
                tier={subscriptionTier as 'blue_shared' | 'blue_dedicated'}
              />
            </Card>
          </div>
        )}

        {activeTab === 'compose' && !isBlue && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* iMessage Teaser Banner */}
            <div className="lg:col-span-3">
              <IMessageTeaser variant="banner" />
            </div>

            {/* Compose Form */}
            <div className="lg:col-span-2 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Recipient Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recipients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRecipientType('individual')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        recipientType === 'individual'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-sm font-medium">Individual</p>
                    </button>
                    <button
                      onClick={() => setRecipientType('group')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        recipientType === 'group'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-sm font-medium">Group</p>
                    </button>
                    <button
                      onClick={() => setRecipientType('all')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        recipientType === 'all'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MessageSquare className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-sm font-medium">All Opted-In</p>
                    </button>
                  </div>

                  {recipientType === 'individual' && (
                    <div>
                      <Input
                        placeholder="Search contacts..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="mb-2"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {filteredContacts?.slice?.(0, 10)?.map?.((contact) => (
                          <button
                            key={contact?.id}
                            onClick={() => setSelectedContactId(contact?.id || '')}
                            className={`w-full p-3 rounded-lg text-left transition-all ${
                              selectedContactId === contact?.id
                                ? 'bg-blue-100 border-blue-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <p className="font-medium text-gray-900">
                              {contact?.firstName} {contact?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{formatDisplay(contact?.phone || '')}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {recipientType === 'group' && (
                    <Select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      options={[
                        { value: '', label: 'Select a group' },
                        ...(groups || [])?.map?.((g) => ({
                          value: g?.id || '',
                          label: `${g?.name} (${g?.memberCount || 0} members)`,
                        })),
                      ]}
                    />
                  )}

                  {recipientType === 'all' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">
                        This will send to all <strong>{optedInCount}</strong> opted-in contacts.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message Composer */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Message</CardTitle>
                    <Select
                      value={selectedTemplate}
                      onChange={(e) => loadTemplate(e.target.value)}
                      options={[
                        { value: '', label: 'Load template...' },
                        ...(templates || [])?.map?.((t) => ({ value: t?.id || '', label: t?.name || '' })),
                      ]}
                      className="w-48"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Composer (Blue tier only) */}
                  {isBlue && (
                    <AIComposer
                      onInsert={(text) => setMessageBody(text)}
                      groupName={groups?.find?.((g) => g?.id === selectedGroupId)?.name}
                    />
                  )}
                  {!isBlue && <SmartUpsell trigger="messages_compose" />}

                  <Textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Type your message here..."
                    rows={6}
                    maxLength={1600}
                  />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertMergeTag('{first_name}')}
                      >
                        {'{'} first_name {'}'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => insertMergeTag('{last_name}')}
                      >
                        {'{'} last_name {'}'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={insertSpintaxTemplate}
                        title="Insert spintax template"
                      >
                        <Shuffle className="h-3.5 w-3.5 mr-1" />
                        Spintax
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500">
                      {segmentInfo?.charCount || 0} / {(segmentInfo?.segments || 1) * (segmentInfo?.maxChars || 160)} chars
                      <span className="mx-2">•</span>
                      {segmentInfo?.segments || 0} segment{(segmentInfo?.segments || 0) !== 1 ? 's' : ''}
                      <span className="mx-2">•</span>
                      {segmentInfo?.encoding || 'GSM-7'}
                    </div>
                  </div>

                  {/* Spintax Info & Preview */}
                  {hasSpintax(messageBody) && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                      <div className="flex items-start gap-2">
                        <Shuffle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-purple-800">
                          <strong>Spintax detected.</strong> Each recipient will receive a randomly selected variation.
                          Use the syntax <code className="bg-purple-100 px-1 rounded">{'{'}option1|option2|option3{'}'}</code>.
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviewVariations}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Preview Variations
                      </Button>
                      {showSpintaxPreview && spintaxPreviews.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-purple-200">
                          <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Sample Variations</p>
                          {spintaxPreviews.map((preview, i) => (
                            <div key={i} className="text-sm text-purple-900 bg-white p-2 rounded border border-purple-100">
                              {preview}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Send Mode Selector (only for blast messages) */}
                  {recipientType !== 'individual' && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Sending Mode</span>
                        <InfoTooltip content="Control how messages are delivered: instantly, at regular intervals (drip), or at random intervals." />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSendingMode('instant')}
                          className={`flex-1 p-2.5 rounded-lg border-2 transition-all text-center ${
                            sendingMode === 'instant'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Zap className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                          <p className="text-xs font-medium">Instant</p>
                        </button>
                        <button
                          onClick={() => setSendingMode('drip')}
                          className={`flex-1 p-2.5 rounded-lg border-2 transition-all text-center ${
                            sendingMode === 'drip'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Timer className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                          <p className="text-xs font-medium">Drip</p>
                        </button>
                        <button
                          onClick={() => setSendingMode('random')}
                          className={`flex-1 p-2.5 rounded-lg border-2 transition-all text-center ${
                            sendingMode === 'random'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Shuffle className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                          <p className="text-xs font-medium">Random</p>
                        </button>
                      </div>

                      {sendingMode === 'drip' && (
                        <div className="space-y-2 pt-2">
                          <p className="text-xs text-gray-600">Send 1 message every:</p>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              min={1}
                              value={dripIntervalSeconds}
                              onChange={(e) => setDripIntervalSeconds(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-24"
                            />
                            <Select
                              value={dripIntervalUnit}
                              onChange={(e) => setDripIntervalUnit(e.target.value as 'seconds' | 'minutes')}
                              options={[
                                { value: 'seconds', label: 'seconds' },
                                { value: 'minutes', label: 'minutes' },
                              ]}
                              className="w-28"
                            />
                          </div>
                          {recipientCount > 1 && (
                            <p className="text-xs text-gray-500">
                              Estimated completion: ~{Math.ceil((recipientCount - 1) * effectiveDripInterval / 60)} min for {recipientCount} recipients
                            </p>
                          )}
                        </div>
                      )}

                      {sendingMode === 'random' && (
                        <div className="space-y-2 pt-2">
                          <p className="text-xs text-gray-600">Wait between sends:</p>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              min={1}
                              value={randomMinSeconds}
                              onChange={(e) => setRandomMinSeconds(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20"
                            />
                            <span className="text-sm text-gray-500">to</span>
                            <Input
                              type="number"
                              min={1}
                              value={randomMaxSeconds}
                              onChange={(e) => setRandomMaxSeconds(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-20"
                            />
                            <span className="text-sm text-gray-500">seconds</span>
                          </div>
                          {randomMaxSeconds < randomMinSeconds && (
                            <p className="text-xs text-red-500">Max must be greater than or equal to min</p>
                          )}
                          {recipientCount > 1 && randomMaxSeconds >= randomMinSeconds && (
                            <p className="text-xs text-gray-500">
                              Estimated completion: ~{Math.ceil((recipientCount - 1) * ((randomMinSeconds + randomMaxSeconds) / 2) / 60)} min for {recipientCount} recipients
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schedule Toggle */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => {
                          setIsScheduled(e.target.checked);
                          if (!e.target.checked) {
                            setScheduledDateTime('');
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={recipientType === 'individual'}
                      />
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Schedule for later</span>
                      </div>
                    </label>
                    {recipientType === 'individual' && (
                      <p className="text-xs text-gray-500">Scheduling is only available for group or all-contact messages</p>
                    )}
                    {isScheduled && recipientType !== 'individual' && (
                      <Input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="mt-2"
                      />
                    )}
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSend}
                    disabled={sending || !messageBody || recipientCount === 0 || (sendingMode === 'random' && randomMaxSeconds < randomMinSeconds && recipientType !== 'individual')}
                  >
                    {sending
                      ? (isScheduled ? 'Scheduling...' : 'Sending...')
                      : (isScheduled
                          ? 'Schedule Message'
                          : (sendingMode === 'drip' && recipientType !== 'individual')
                            ? 'Start Drip Send'
                            : (sendingMode === 'random' && recipientType !== 'individual')
                              ? 'Start Random Send'
                              : 'Send Now'
                        )
                    }
                    {isScheduled ? <Calendar className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Cost Calculator Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Cost Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recipients</span>
                      <span className="font-medium">{recipientCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Segments per message</span>
                      <span className="font-medium">{segmentInfo?.segments || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        Cost per segment
                        <InfoTooltip content="Twilio's standard rate for SMS" />
                      </span>
                      <span className="font-medium">$0.0079</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Estimated Cost</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCost(estimatedCost)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-100 rounded-lg text-xs text-blue-800">
                    <strong>Formula:</strong><br />
                    {segmentInfo?.segments || 0} segments × {recipientCount} recipients × $0.0079 = ~{formatCost(estimatedCost)}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Keep messages under 160 chars for 1 segment</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Use merge tags to personalize messages</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Emojis use more characters (UCS-2 encoding)</span>
                    </li>
                    <li className="flex gap-2">
                      <Shuffle className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>Use spintax like <code className="bg-gray-100 px-1 text-xs rounded">{'{'}Hi|Hello|Hey{'}'}</code> for unique messages per recipient</span>
                    </li>
                    <li className="flex gap-2">
                      <Timer className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Drip &amp; random modes stagger delivery to avoid carrier throttling</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Scheduled For</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Recipients</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Message</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        Loading scheduled messages...
                      </td>
                    </tr>
                  ) : (scheduledMessages?.length || 0) === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No scheduled messages</p>
                        <p className="text-sm text-gray-400 mt-1">Schedule a message from the Compose tab</p>
                      </td>
                    </tr>
                  ) : (
                    scheduledMessages?.map?.((msg) => {
                      const groupName = msg?.recipientGroupId === 'all-opted-in' 
                        ? 'All Opted-In Contacts' 
                        : groups?.find?.(g => g?.id === msg?.recipientGroupId)?.name || 'Unknown Group';
                      return (
                        <tr key={msg?.id} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">
                              {new Date(msg?.scheduledFor || '').toLocaleDateString?.('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-gray-500">
                              {new Date(msg?.scheduledFor || '').toLocaleTimeString?.('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary">{groupName}</Badge>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className="text-sm text-gray-900 truncate">{msg?.body}</p>
                          </td>
                          <td className="px-4 py-3">{getScheduledStatusBadge(msg?.status || 'pending')}</td>
                          <td className="px-4 py-3">
                            {msg?.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleCancelScheduled(msg?.id || '')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Message</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Recipients</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        Loading messages...
                      </td>
                    </tr>
                  ) : (messages?.length || 0) === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        No messages sent yet
                      </td>
                    </tr>
                  ) : (
                    messages?.map?.((msg) => (
                      <tr key={msg?.id}>
                        <td className="text-sm text-gray-600">
                          {new Date(msg?.createdAt || '').toLocaleDateString?.()}
                        </td>
                        <td>
                          <Badge variant={msg?.type === 'blast' ? 'default' : 'secondary'}>
                            {msg?.type === 'blast' ? 'Blast' : 'Individual'}
                          </Badge>
                        </td>
                        <td className="max-w-xs truncate text-sm">{msg?.body}</td>
                        <td className="text-sm">{msg?.totalRecipients || 1}</td>
                        <td>{getStatusBadge(msg?.status || 'queued')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
