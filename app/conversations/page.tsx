'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/lib/admin-context';
import { formatDisplay } from '@/lib/phone';
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Phone,
  User,
  Clock,
  ChevronRight,
  Inbox,
  Loader2,
} from 'lucide-react';

interface Conversation {
  contactId: string | null;
  contactName: string;
  phone: string;
  lastMessage: string;
  lastMessageAt: string;
  lastDirection: 'inbound' | 'outbound';
  hasInbound: boolean;
}

interface TimelineMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  timestamp: string;
  status: string;
  mediaUrl?: string | null;
}

interface ContactInfo {
  id: string | null;
  firstName: string;
  lastName: string | null;
  phone: string;
}

export default function ConversationsPage() {
  const { adminFetch, effectiveChurchId } = useAdmin();

  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Selected conversation state
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const [contactInfo, setContactInfo] = React.useState<ContactInfo | null>(null);
  const [messages, setMessages] = React.useState<TimelineMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = React.useState(false);

  // Compose state
  const [composeText, setComposeText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState('');

  // Mobile: track if showing thread view
  const [showThread, setShowThread] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Fetch conversations list
  const fetchConversations = React.useCallback(async () => {
    try {
      const res = await adminFetch('/api/conversations');
      const data = await res.json();
      setConversations(data?.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  // Refetch when church context changes
  React.useEffect(() => {
    setConversations([]);
    setSelectedKey(null);
    setContactInfo(null);
    setMessages([]);
    setLoading(true);
    setShowThread(false);
    fetchConversations();
  }, [effectiveChurchId, fetchConversations]);

  // Auto-refresh conversations every 15 seconds
  React.useEffect(() => {
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Fetch messages for selected conversation
  const fetchThread = React.useCallback(async (key: string) => {
    setMessagesLoading(true);
    try {
      const encodedKey = encodeURIComponent(key);
      const res = await adminFetch(`/api/conversations/${encodedKey}`);
      const data = await res.json();
      setContactInfo(data?.contact || null);
      setMessages(data?.messages || []);
    } catch (err) {
      console.error('Failed to fetch thread:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [adminFetch]);

  // Auto-refresh thread every 10 seconds
  React.useEffect(() => {
    if (!selectedKey) return;
    const interval = setInterval(() => fetchThread(selectedKey), 10000);
    return () => clearInterval(interval);
  }, [selectedKey, fetchThread]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv: Conversation) => {
    const key = conv.contactId || `phone:${conv.phone}`;
    setSelectedKey(key);
    setShowThread(true);
    setSendError('');
    setComposeText('');
    fetchThread(key);
  };

  const handleSend = async () => {
    if (!composeText.trim() || !contactInfo) return;

    // Can only send to known contacts
    if (!contactInfo.id) {
      setSendError('Cannot send messages to unknown contacts. Add them as a contact first.');
      return;
    }

    setSending(true);
    setSendError('');

    try {
      const res = await adminFetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'individual',
          recipientContactId: contactInfo.id,
          body: composeText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send message');
      }

      setComposeText('');
      // Refresh the thread to show the sent message
      if (selectedKey) {
        await fetchThread(selectedKey);
      }
      // Also refresh conversations list to update the last message
      fetchConversations();
    } catch (err: any) {
      setSendError(err?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter conversations by search
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      c.contactName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      formatDisplay(c.phone).includes(q)
    );
  }, [conversations, searchQuery]);

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDateSeparator = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Group messages by date for date separators
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: TimelineMessage[] }[] = [];
    let currentDate = '';

    for (const msg of messages) {
      const msgDate = new Date(msg.timestamp).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msg.timestamp, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }

    return groups;
  }, [messages]);

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Conversations
          </h1>
          <p className="text-gray-500 mt-1">View and reply to text conversations</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* LEFT PANEL: Conversation list */}
            <div
              className={`w-full md:w-96 md:min-w-[320px] border-r border-gray-100 flex flex-col ${
                showThread ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* Search bar */}
              <div className="p-3 border-b border-gray-100">
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Inbox className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No conversations yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Conversations will appear here when messages are sent or received
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv, idx) => {
                    const key = conv.contactId || `phone:${conv.phone}`;
                    const isSelected = key === selectedKey;

                    return (
                      <button
                        key={`${key}-${idx}`}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full p-3 flex items-center gap-3 text-left transition-colors border-b border-gray-50 ${
                          isSelected
                            ? 'bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          conv.contactId ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {conv.contactId ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <Phone className="h-4 w-4" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${
                              isSelected ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {conv.contactName || formatDisplay(conv.phone)}
                            </p>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatTimestamp(conv.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {conv.lastDirection === 'outbound' && (
                              <span className="text-xs text-gray-400">You: </span>
                            )}
                            <p className="text-xs text-gray-500 truncate">
                              {conv.lastMessage}
                            </p>
                          </div>
                          {!conv.contactId && (
                            <Badge variant="warning" className="mt-1 text-[10px] px-1.5 py-0">
                              Unknown
                            </Badge>
                          )}
                        </div>

                        <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 md:hidden" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Message thread */}
            <div
              className={`flex-1 flex flex-col ${
                showThread ? 'flex' : 'hidden md:flex'
              }`}
            >
              {selectedKey && contactInfo ? (
                <>
                  {/* Thread header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                    <button
                      onClick={() => setShowThread(false)}
                      className="md:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </button>

                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                      contactInfo.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <User className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {contactInfo.id
                          ? `${contactInfo.firstName}${contactInfo.lastName ? ' ' + contactInfo.lastName : ''}`
                          : 'Unknown Contact'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDisplay(contactInfo.phone)}
                      </p>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50/50">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No messages yet</p>
                      </div>
                    ) : (
                      groupedMessages.map((group, groupIdx) => (
                        <div key={groupIdx}>
                          {/* Date separator */}
                          <div className="flex items-center justify-center my-4">
                            <span className="px-3 py-1 text-xs text-gray-500 bg-white rounded-full shadow-sm border border-gray-100">
                              {formatDateSeparator(group.date)}
                            </span>
                          </div>

                          {group.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex mb-2 ${
                                msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                                  msg.direction === 'outbound'
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                                <div className={`flex items-center gap-1 mt-1 ${
                                  msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                                }`}>
                                  <Clock className={`h-3 w-3 ${
                                    msg.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'
                                  }`} />
                                  <span className={`text-[10px] ${
                                    msg.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'
                                  }`}>
                                    {formatMessageTime(msg.timestamp)}
                                  </span>
                                  {msg.direction === 'outbound' && msg.status && (
                                    <span className="text-[10px] text-blue-200 capitalize">
                                      {msg.status === 'sent' || msg.status === 'delivered' ? ' \u2713' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Compose bar */}
                  <div className="border-t border-gray-100 bg-white p-3">
                    {sendError && (
                      <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                        {sendError}
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <textarea
                        value={composeText}
                        onChange={(e) => setComposeText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          contactInfo.id
                            ? 'Type a message...'
                            : 'Add contact to send messages'
                        }
                        disabled={!contactInfo.id || sending}
                        rows={1}
                        className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 max-h-32"
                        style={{ minHeight: '40px' }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                        }}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!composeText.trim() || !contactInfo.id || sending}
                        size="icon"
                        className="flex-shrink-0 rounded-xl h-10 w-10"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                // Empty state when no conversation is selected
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Select a conversation</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    Choose a conversation from the list to view messages and reply
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
