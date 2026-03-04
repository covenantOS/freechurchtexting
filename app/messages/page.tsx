'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageComposer, SendMessageData } from '@/components/messaging/message-composer';
import { useAdmin } from '@/lib/admin-context';
import {
  Send,
  History,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  CalendarClock,
} from 'lucide-react';

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
  const initialContactId = searchParams?.get('contact') || undefined;

  const subscriptionTier = effectiveSubscriptionTier || 'free';

  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [scheduledMessages, setScheduledMessages] = React.useState<ScheduledMessage[]>([]);
  const [optedInCount, setOptedInCount] = React.useState(0);

  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

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

      const optedIn =
        (contactsData?.contacts || [])?.filter?.((c: Contact) => c?.optInStatus === 'opted_in')?.length ?? 0;
      setOptedInCount(optedIn);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (data: SendMessageData) => {
    setError('');
    setSuccess('');
    setSending(true);

    try {
      if (data.isScheduled) {
        // Create scheduled message
        const res = await adminFetch('/api/scheduled-messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'blast',
            recipientGroupId: data.recipientType === 'all' ? 'all-opted-in' : data.recipientGroupId,
            body: data.body,
            scheduledFor: data.scheduledFor,
          }),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result?.error || 'Failed to schedule');
        }
        setSuccess('Message scheduled successfully!');
      } else {
        // Send immediately (or queue for drip/random)
        const sendPayload: Record<string, unknown> = {
          type: data.recipientType === 'individual' ? 'individual' : 'blast',
          recipientContactId: data.recipientContactId || null,
          recipientGroupId: data.recipientGroupId || null,
          sendToAll: data.sendToAll || false,
          body: data.body,
          sendingMode: data.sendingMode,
        };

        if (data.sendingMode === 'drip') {
          sendPayload.dripIntervalSeconds = data.dripIntervalSeconds;
        }
        if (data.sendingMode === 'random') {
          sendPayload.randomMinSeconds = data.randomMinSeconds;
          sendPayload.randomMaxSeconds = data.randomMaxSeconds;
        }

        const res = await adminFetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sendPayload),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result?.error || 'Failed to send');
        }

        const modeLabel =
          data.sendingMode === 'drip'
            ? 'queued (drip mode)'
            : data.sendingMode === 'random'
              ? 'queued (random mode)'
              : 'sent';
        setSuccess(`Message ${modeLabel} successfully!`);
      }

      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to send message');
      throw err; // re-throw so the composer knows sending failed
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

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Compose and send messages to your congregation</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'compose'
                ? 'border-brand-500 text-brand-600'
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
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CalendarClock className="h-4 w-4 inline mr-2" />
            Scheduled
            {scheduledMessages?.filter?.((m) => m?.status === 'pending')?.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                {scheduledMessages?.filter?.((m) => m?.status === 'pending')?.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="h-4 w-4 inline mr-2" />
            History
          </button>
        </div>

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="max-w-3xl mx-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-600">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <MessageComposer
                  contacts={contacts}
                  groups={groups}
                  templates={templates}
                  subscriptionTier={subscriptionTier}
                  optedInCount={optedInCount}
                  sending={sending}
                  onSend={handleSend}
                  initialRecipientType={initialType as 'individual' | 'group' | 'all'}
                  initialContactId={initialContactId}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scheduled Tab */}
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
                      const groupName =
                        msg?.recipientGroupId === 'all-opted-in'
                          ? 'All Opted-In Contacts'
                          : groups?.find?.((g) => g?.id === msg?.recipientGroupId)?.name || 'Unknown Group';
                      return (
                        <tr key={msg?.id} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">
                              {new Date(msg?.scheduledFor || '').toLocaleDateString?.('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-gray-500">
                              {new Date(msg?.scheduledFor || '').toLocaleTimeString?.('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
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

        {/* History Tab */}
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
                        <td className="text-sm text-gray-600 px-4 py-3">
                          {new Date(msg?.createdAt || '').toLocaleDateString?.()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={msg?.type === 'blast' || msg?.type === 'imessage_blast' ? 'default' : 'secondary'}>
                            {msg?.type === 'blast' || msg?.type === 'imessage_blast' ? 'Blast' : 'Individual'}
                          </Badge>
                        </td>
                        <td className="max-w-xs truncate text-sm px-4 py-3">{msg?.body}</td>
                        <td className="text-sm px-4 py-3">{msg?.totalRecipients || 1}</td>
                        <td className="px-4 py-3">{getStatusBadge(msg?.status || 'queued')}</td>
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
