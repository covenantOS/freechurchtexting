'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/tooltip';
import { AIComposer } from '@/components/messaging/ai-composer';
import { SmartUpsell } from '@/components/ai/smart-upsell';
import {
  Send,
  User,
  Users,
  MessageSquare,
  Calculator,
  Shuffle,
  Timer,
  Eye,
  Zap,
  Calendar,
  Sparkles,
  CheckCircle2,
  Image,
  Video,
  X,
  Loader2,
  Apple,
  Smartphone,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { calculateSegments, calculateCost, formatCost } from '@/lib/sms-calculator';
import { formatDisplay } from '@/lib/phone';
import { hasSpintax, generateVariations } from '@/lib/spintax';

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
  category?: string;
}

export interface SendMessageData {
  body: string;
  recipientType: 'individual' | 'group' | 'all';
  recipientContactId?: string;
  recipientGroupId?: string;
  sendToAll?: boolean;
  sendingMode: 'instant' | 'drip' | 'random';
  dripIntervalSeconds?: number;
  randomMinSeconds?: number;
  randomMaxSeconds?: number;
  randomBatchSize?: number;
  isScheduled?: boolean;
  scheduledFor?: string;
  mediaUrl?: string;
}

export interface MessageComposerProps {
  contacts: Contact[];
  groups: Group[];
  templates: Template[];
  subscriptionTier: string;
  optedInCount: number;
  sending: boolean;
  onSend: (data: SendMessageData) => Promise<void>;
  initialRecipientType?: 'individual' | 'group' | 'all';
  initialContactId?: string;
  successMessage?: string;
}

export function MessageComposer({
  contacts,
  groups,
  templates,
  subscriptionTier,
  optedInCount,
  sending,
  onSend,
  initialRecipientType = 'individual',
  initialContactId,
  successMessage,
}: MessageComposerProps) {
  const isBlue = subscriptionTier === 'blue_shared' || subscriptionTier === 'blue_dedicated';

  // Recipient state
  const [recipientType, setRecipientType] = React.useState<'individual' | 'group' | 'all'>(initialRecipientType);
  const [selectedContactId, setSelectedContactId] = React.useState(initialContactId || '');
  const [selectedGroupId, setSelectedGroupId] = React.useState('');
  const [contactSearch, setContactSearch] = React.useState('');

  // Message state
  const [messageBody, setMessageBody] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const [templatePreview, setTemplatePreview] = React.useState<Template | null>(null);

  // Sending mode state
  const [sendingMode, setSendingMode] = React.useState<'instant' | 'drip' | 'random'>('instant');
  const [dripIntervalSeconds, setDripIntervalSeconds] = React.useState(30);
  const [dripIntervalUnit, setDripIntervalUnit] = React.useState<'seconds' | 'minutes'>('seconds');
  const [randomMinSeconds, setRandomMinSeconds] = React.useState(10);
  const [randomMaxSeconds, setRandomMaxSeconds] = React.useState(60);
  const [randomBatchSize, setRandomBatchSize] = React.useState(1);

  // Schedule state
  const [isScheduled, setIsScheduled] = React.useState(false);
  const [scheduledDateTime, setScheduledDateTime] = React.useState('');

  // Media state (Blue only)
  const [attachedMedia, setAttachedMedia] = React.useState<{ type: string; name: string; url?: string } | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Spintax preview state
  const [showSpintaxPreview, setShowSpintaxPreview] = React.useState(false);
  const [spintaxPreviews, setSpintaxPreviews] = React.useState<string[]>([]);

  // Mobile accordion state
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);

  // Textarea ref for auto-resize
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Update contact id from URL params
  React.useEffect(() => {
    if (initialContactId) {
      setSelectedContactId(initialContactId);
      setRecipientType('individual');
      const contact = contacts.find((c) => c.id === initialContactId);
      if (contact) {
        setContactSearch(`${contact.firstName} ${contact.lastName || ''}`);
      }
    }
  }, [initialContactId, contacts]);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const minHeight = 96; // ~4 rows
    const maxHeight = 288; // ~12 rows
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  }, [messageBody]);

  // Computed
  const filteredContacts = React.useMemo(() => {
    return (contacts || []).filter((c) => {
      if (!contactSearch) return true;
      const searchTerms = contactSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const contactText = `${c?.firstName || ''} ${c?.lastName || ''} ${c?.phone || ''}`.toLowerCase();
      return searchTerms.every((term) => contactText.includes(term));
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
  const effectiveDripInterval = dripIntervalUnit === 'minutes' ? dripIntervalSeconds * 60 : dripIntervalSeconds;
  const charCount = segmentInfo?.charCount || 0;

  // Character counter color
  const getCharCountColor = () => {
    if (charCount >= 480) return 'text-red-600 font-semibold';
    if (charCount >= 320) return 'text-amber-600 font-medium';
    return 'text-gray-500';
  };

  // Handlers
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

  const loadTemplate = (templateId: string) => {
    if (!templateId) {
      setSelectedTemplate('');
      setTemplatePreview(null);
      return;
    }
    const template = templates?.find?.((t) => t?.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setTemplatePreview(template);
    }
  };

  const applyTemplate = () => {
    if (templatePreview) {
      setMessageBody(templatePreview.body || '');
      setTemplatePreview(null);
    }
  };

  const cancelTemplatePreview = () => {
    setTemplatePreview(null);
    setSelectedTemplate('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    setUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAttachedMedia({
        type: fileType,
        name: file.name,
        url: URL.createObjectURL(file),
      });
    } finally {
      setUploading(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMediaButton = (type: string) => {
    if (type === 'image' || type === 'video') {
      if (fileInputRef.current) {
        fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
        fileInputRef.current.click();
      }
    }
  };

  const removeMedia = () => {
    setAttachedMedia(null);
  };

  const handleSend = async () => {
    if (!messageBody?.trim?.()) return;

    const data: SendMessageData = {
      body: messageBody,
      recipientType,
      recipientContactId: recipientType === 'individual' ? selectedContactId : undefined,
      recipientGroupId: recipientType === 'group' ? selectedGroupId : undefined,
      sendToAll: recipientType === 'all',
      sendingMode: recipientType === 'individual' ? 'instant' : sendingMode,
      isScheduled,
      scheduledFor: isScheduled ? scheduledDateTime : undefined,
      mediaUrl: attachedMedia?.url,
    };

    if (sendingMode === 'drip' && recipientType !== 'individual') {
      data.dripIntervalSeconds = effectiveDripInterval;
    }
    if (sendingMode === 'random' && recipientType !== 'individual') {
      data.randomMinSeconds = randomMinSeconds;
      data.randomMaxSeconds = randomMaxSeconds;
      data.randomBatchSize = randomBatchSize;
    }

    await onSend(data);

    // Reset form on success
    setMessageBody('');
    setSelectedContactId('');
    setSelectedGroupId('');
    setSelectedTemplate('');
    setTemplatePreview(null);
    setIsScheduled(false);
    setScheduledDateTime('');
    setSendingMode('instant');
    setShowSpintaxPreview(false);
    setSpintaxPreviews([]);
    setAttachedMedia(null);
    setContactSearch('');
    setRandomBatchSize(1);
  };

  const canSend =
    messageBody?.trim() &&
    !sending &&
    recipientCount > 0 &&
    !(sendingMode === 'random' && randomMaxSeconds < randomMinSeconds && recipientType !== 'individual') &&
    !(isScheduled && !scheduledDateTime) &&
    !(isScheduled && recipientType === 'individual');

  const getSendButtonLabel = () => {
    if (sending) {
      return isScheduled ? 'Scheduling...' : 'Sending...';
    }
    if (isScheduled) return 'Schedule Message';
    if (sendingMode === 'drip' && recipientType !== 'individual') return 'Start Drip Send';
    if (sendingMode === 'random' && recipientType !== 'individual') return 'Start Random Send';
    return 'Send Now';
  };

  // ---- Reusable sub-sections ----

  const recipientSection = (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 block">Send to</label>
      {/* Desktop: vertical stack; Mobile: horizontal pill row */}
      <div className="flex gap-2 lg:flex-col">
        <button
          onClick={() => setRecipientType('individual')}
          className={`flex-1 lg:flex-none p-2 lg:p-3 rounded-lg border-2 transition-all text-center ${
            recipientType === 'individual'
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <User className="h-4 w-4 lg:h-5 lg:w-5 mx-auto mb-0.5 lg:mb-1 text-brand-600" />
          <p className="text-xs lg:text-sm font-medium">Individual</p>
        </button>
        <button
          onClick={() => setRecipientType('group')}
          className={`flex-1 lg:flex-none p-2 lg:p-3 rounded-lg border-2 transition-all text-center ${
            recipientType === 'group'
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Users className="h-4 w-4 lg:h-5 lg:w-5 mx-auto mb-0.5 lg:mb-1 text-brand-600" />
          <p className="text-xs lg:text-sm font-medium">Group</p>
        </button>
        <button
          onClick={() => setRecipientType('all')}
          className={`flex-1 lg:flex-none p-2 lg:p-3 rounded-lg border-2 transition-all text-center ${
            recipientType === 'all'
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5 mx-auto mb-0.5 lg:mb-1 text-brand-600" />
          <p className="text-xs lg:text-sm font-medium">All Opted-In</p>
          <p className="text-xs text-gray-500">({optedInCount})</p>
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
                onClick={() => {
                  setSelectedContactId(contact?.id || '');
                  setContactSearch(`${contact?.firstName} ${contact?.lastName || ''}`);
                }}
                className={`w-full p-2.5 lg:p-3 rounded-lg text-left transition-all ${
                  selectedContactId === contact?.id
                    ? 'bg-brand-100 border-brand-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">
                  {contact?.firstName} {contact?.lastName}
                </p>
                <p className="text-xs lg:text-sm text-gray-500">{formatDisplay(contact?.phone || '')}</p>
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
        <div className="p-3 bg-brand-50 rounded-lg">
          <p className="text-brand-800 text-sm">
            This will send to all <strong>{optedInCount}</strong> opted-in contacts.
          </p>
        </div>
      )}
    </div>
  );

  const sendingModeSection = recipientType !== 'individual' ? (
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
            sendingMode === 'instant' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Zap className="h-4 w-4 mx-auto mb-1 text-brand-600" />
          <p className="text-xs font-medium">Instant</p>
        </button>
        <button
          onClick={() => setSendingMode('drip')}
          className={`flex-1 p-2.5 rounded-lg border-2 transition-all text-center ${
            sendingMode === 'drip' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Timer className="h-4 w-4 mx-auto mb-1 text-brand-600" />
          <p className="text-xs font-medium">Drip</p>
        </button>
        <button
          onClick={() => setSendingMode('random')}
          className={`flex-1 p-2.5 rounded-lg border-2 transition-all text-center ${
            sendingMode === 'random' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Shuffle className="h-4 w-4 mx-auto mb-1 text-brand-600" />
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
              Estimated completion: ~{Math.ceil(((recipientCount - 1) * effectiveDripInterval) / 60)} min for{' '}
              {recipientCount} recipients
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
          <div className="flex gap-2 items-center mt-2">
            <span className="text-xs text-gray-600">Send</span>
            <Input
              type="number"
              min={1}
              max={50}
              value={randomBatchSize}
              onChange={(e) => setRandomBatchSize(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-16"
            />
            <span className="text-xs text-gray-600">message(s) per burst</span>
          </div>
          {recipientCount > 1 && randomMaxSeconds >= randomMinSeconds && (
            <p className="text-xs text-gray-500">
              Estimated completion: ~
              {Math.ceil(
                ((Math.ceil(recipientCount / randomBatchSize) - 1) * ((randomMinSeconds + randomMaxSeconds) / 2)) / 60
              )}{' '}
              min for {recipientCount} recipients
            </p>
          )}
        </div>
      )}
    </div>
  ) : null;

  const scheduleSection = (
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
          className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
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
  );

  // Group templates by category for the dropdown
  const CATEGORY_LABELS: Record<string, string> = {
    welcome: 'Welcome',
    event: 'Event',
    prayer: 'Prayer',
    volunteer: 'Volunteer',
    general: 'General',
  };

  const templatesByCategory = React.useMemo(() => {
    const grouped: Record<string, Template[]> = {};
    for (const t of templates || []) {
      const cat = t.category || 'general';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(t);
    }
    return grouped;
  }, [templates]);

  const truncate = (text: string, maxLen: number) => {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  };

  const messageSection = (
    <div className="space-y-3">
      {/* Template + label row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-sm font-medium text-gray-700">Message</label>
        <div className="relative">
          <select
            value={selectedTemplate}
            onChange={(e) => loadTemplate(e.target.value)}
            className="flex h-10 w-56 appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent pr-8"
          >
            <option value="">Load template...</option>
            {Object.entries(templatesByCategory).map(([cat, catTemplates]) => (
              <optgroup key={cat} label={CATEGORY_LABELS[cat] || cat}>
                {catTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {truncate(t.body, 50)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Template preview panel */}
      {templatePreview && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-blue-800">{templatePreview.name}</span>
            {templatePreview.category && (
              <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                {CATEGORY_LABELS[templatePreview.category] || templatePreview.category}
              </span>
            )}
          </div>
          <p className="text-sm text-blue-900 bg-white p-2 rounded border border-blue-100">
            {templatePreview.body}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={applyTemplate}>
              Use Template
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelTemplatePreview}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* AI Writer (Blue only) / Upsell (Free only) */}
      {isBlue ? (
        <AIComposer
          onInsert={(text) => setMessageBody(text)}
          groupName={groups?.find?.((g) => g?.id === selectedGroupId)?.name}
        />
      ) : (
        <SmartUpsell trigger="messages_compose" />
      )}

      {/* Auto-resizing textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder={isBlue ? 'Type your message...' : 'Type your message here...'}
          maxLength={1600}
          className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200"
          style={{ minHeight: '96px', overflow: 'auto' }}
        />
      </div>

      {/* Merge tags + spintax + char count */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => insertMergeTag('{first_name}')}>
            {'{'} first_name {'}'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => insertMergeTag('{last_name}')}>
            {'{'} last_name {'}'}
          </Button>
          <Button variant="outline" size="sm" onClick={insertSpintaxTemplate} title="Insert spintax template">
            <Shuffle className="h-3.5 w-3.5 mr-1" />
            Spintax
          </Button>
        </div>
        <div className={`text-sm ${getCharCountColor()}`}>
          {charCount} / {(segmentInfo?.segments || 1) * (segmentInfo?.maxChars || 160)} chars
          <span className="mx-2 text-gray-300">|</span>
          <span className={charCount >= 320 ? '' : 'text-gray-500'}>
            {segmentInfo?.segments || 0} segment{(segmentInfo?.segments || 0) !== 1 ? 's' : ''}
          </span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-500">{segmentInfo?.encoding || 'GSM-7'}</span>
        </div>
      </div>

      {/* Spintax Info & Preview */}
      {hasSpintax(messageBody) && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
          <div className="flex items-start gap-2">
            <Shuffle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <strong>Spintax detected.</strong> Each recipient will receive a randomly selected variation. Use the
              syntax{' '}
              <code className="bg-purple-100 px-1 rounded">
                {'{'}option1|option2|option3{'}'}
              </code>
              .
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

      {/* Media attachment (Blue only) */}
      {isBlue && (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) =>
              handleFileSelect(e, fileInputRef.current?.accept?.includes('image') ? 'Image' : 'Video')
            }
          />

          {attachedMedia && (
            <div className="p-2 bg-brand-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {attachedMedia.type === 'Image' ? (
                  <Image className="h-5 w-5 text-brand-600" />
                ) : (
                  <Video className="h-5 w-5 text-brand-600" />
                )}
                <span className="text-sm text-brand-700 truncate max-w-[200px]">{attachedMedia.name}</span>
              </div>
              <button onClick={removeMedia} className="p-1 hover:bg-brand-100 rounded-full transition-colors">
                <X className="h-4 w-4 text-brand-600" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMediaButton('image')}
              disabled={uploading}
              className="text-brand-600 border-brand-200 hover:bg-brand-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Image className="h-4 w-4 mr-1" />}
              Photo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMediaButton('video')}
              disabled={uploading}
              className="text-brand-600 border-brand-200 hover:bg-brand-50"
            >
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const costSection = !isBlue ? (
    <div className="bg-gradient-to-br from-brand-50 to-white rounded-lg border border-brand-100 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="h-4 w-4 text-brand-600" />
        <span className="text-sm font-medium text-gray-700">Cost Estimate</span>
        <InfoTooltip content="Twilio's standard rate for SMS" />
      </div>
      <div className="grid grid-cols-4 gap-3 text-center">
        <div>
          <p className="text-lg lg:text-xl font-bold text-gray-900">{recipientCount}</p>
          <p className="text-xs text-gray-500">Recipients</p>
        </div>
        <div>
          <p className="text-lg lg:text-xl font-bold text-gray-900">{segmentInfo?.segments || 0}</p>
          <p className="text-xs text-gray-500">Segments</p>
        </div>
        <div>
          <p className="text-lg lg:text-xl font-bold text-gray-900">$0.0079</p>
          <p className="text-xs text-gray-500">Per Segment</p>
        </div>
        <div>
          <p className="text-lg lg:text-xl font-bold text-brand-600">{formatCost(estimatedCost)}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 rounded-lg border border-green-100 text-sm">
      <div className="flex items-center gap-2 text-green-700">
        <CheckCircle2 className="h-4 w-4" />
        <span>
          {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} selected
        </span>
      </div>
      <span className="text-green-600 font-medium">$0.00 per message</span>
    </div>
  );

  const sendButton = (
    <Button
      className="w-full"
      size="lg"
      onClick={handleSend}
      disabled={!canSend}
    >
      {sending ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isScheduled ? (
        <Calendar className="h-4 w-4 mr-2" />
      ) : (
        <Send className="h-4 w-4 mr-2" />
      )}
      {getSendButtonLabel()}
    </Button>
  );

  const tipsSection = (
    <div className="text-xs text-gray-500 space-y-1">
      <p className="flex items-center gap-1.5">
        <CheckCircle2 className="h-3 w-3 text-green-500" />
        Keep messages under 160 chars for 1 segment
      </p>
      <p className="flex items-center gap-1.5">
        <Shuffle className="h-3 w-3 text-purple-500" />
        Use spintax like{' '}
        <code className="bg-gray-100 px-1 rounded">
          {'{'}Hi|Hello|Hey{'}'}
        </code>{' '}
        for unique messages
      </p>
      <p className="flex items-center gap-1.5">
        <Timer className="h-3 w-3 text-brand-500" />
        Drip &amp; random modes stagger delivery to avoid carrier throttling
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Success banner (inline, auto-dismisses from parent) */}
      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      {/* Channel Indicator (Blue only) */}
      {isBlue && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 text-sm">
            <Apple className="h-4 w-4 text-gray-800" />
            <span className="text-gray-600">iPhone</span>
            <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0">iMessage</Badge>
          </div>
          <div className="w-px h-5 bg-blue-200" />
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4 text-green-600" />
            <span className="text-gray-600">Android</span>
            <Badge className="bg-green-500 text-white text-xs px-1.5 py-0">RCS</Badge>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{subscriptionTier === 'blue_dedicated' ? 'Dedicated' : 'Shared Enterprise'}</span>
          </div>
        </div>
      )}

      {/* ===== DESKTOP: 2-column grid (lg and above) ===== */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Left column (1/3): Recipients + Sending Mode */}
        <div className="lg:col-span-1 space-y-4">
          {recipientSection}
          {sendingModeSection}
        </div>

        {/* Right column (2/3): Message + Schedule + Cost + Send */}
        <div className="lg:col-span-2 space-y-4">
          {messageSection}
          {scheduleSection}
          {costSection}
          {sendButton}
          {tipsSection}
        </div>
      </div>

      {/* ===== MOBILE: stacked layout (below lg) ===== */}
      <div className="lg:hidden space-y-4 pb-20">
        {/* Recipients (always visible) */}
        {recipientSection}

        {/* Message body (always visible, gets most space) */}
        {messageSection}

        {/* Advanced options accordion */}
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-gray-500" />
            Advanced Options
            {(sendingMode !== 'instant' || isScheduled) && (
              <span className="px-1.5 py-0.5 text-xs bg-brand-100 text-brand-700 rounded-full">Active</span>
            )}
          </span>
          {showAdvancedOptions ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {showAdvancedOptions && (
          <div className="space-y-4 animate-fade-in">
            {sendingModeSection}
            {scheduleSection}
          </div>
        )}

        {/* Cost section (always visible) */}
        {costSection}

        {/* Sticky send button on mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white px-4 py-3 border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
          {sendButton}
        </div>
      </div>
    </div>
  );
}
