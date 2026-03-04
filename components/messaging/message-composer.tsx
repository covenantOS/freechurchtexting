'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  // Sending mode state
  const [sendingMode, setSendingMode] = React.useState<'instant' | 'drip' | 'random'>('instant');
  const [dripIntervalSeconds, setDripIntervalSeconds] = React.useState(30);
  const [dripIntervalUnit, setDripIntervalUnit] = React.useState<'seconds' | 'minutes'>('seconds');
  const [randomMinSeconds, setRandomMinSeconds] = React.useState(10);
  const [randomMaxSeconds, setRandomMaxSeconds] = React.useState(60);

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

  // Update contact id from URL params
  React.useEffect(() => {
    if (initialContactId) {
      setSelectedContactId(initialContactId);
      setRecipientType('individual');
      // Pre-fill search with contact name
      const contact = contacts.find((c) => c.id === initialContactId);
      if (contact) {
        setContactSearch(`${contact.firstName} ${contact.lastName || ''}`);
      }
    }
  }, [initialContactId, contacts]);

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
    const template = templates?.find?.((t) => t?.id === templateId);
    if (template) {
      setMessageBody(template?.body || '');
      setSelectedTemplate(templateId);
    }
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
    }

    await onSend(data);

    // Reset form on success
    setMessageBody('');
    setSelectedContactId('');
    setSelectedGroupId('');
    setSelectedTemplate('');
    setIsScheduled(false);
    setScheduledDateTime('');
    setSendingMode('instant');
    setShowSpintaxPreview(false);
    setSpintaxPreviews([]);
    setAttachedMedia(null);
    setContactSearch('');
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

  return (
    <div className="space-y-5">
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

      {/* Section 1: Recipients */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 block">Send to</label>
        <div className="flex gap-2">
          <button
            onClick={() => setRecipientType('individual')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${
              recipientType === 'individual'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User className="h-5 w-5 mx-auto mb-1 text-brand-600" />
            <p className="text-sm font-medium">Individual</p>
          </button>
          <button
            onClick={() => setRecipientType('group')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${
              recipientType === 'group'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className="h-5 w-5 mx-auto mb-1 text-brand-600" />
            <p className="text-sm font-medium">Group</p>
          </button>
          <button
            onClick={() => setRecipientType('all')}
            className={`flex-1 p-3 rounded-lg border-2 transition-all text-center ${
              recipientType === 'all'
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="h-5 w-5 mx-auto mb-1 text-brand-600" />
            <p className="text-sm font-medium">All Opted-In</p>
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
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedContactId === contact?.id
                      ? 'bg-brand-100 border-brand-500'
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
          <div className="p-4 bg-brand-50 rounded-lg">
            <p className="text-brand-800">
              This will send to all <strong>{optedInCount}</strong> opted-in contacts.
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Template Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Message</label>
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
      </div>

      {/* Section 3: AI Writer (Blue only) / Upsell (Free only) */}
      {isBlue ? (
        <AIComposer
          onInsert={(text) => setMessageBody(text)}
          groupName={groups?.find?.((g) => g?.id === selectedGroupId)?.name}
        />
      ) : (
        <SmartUpsell trigger="messages_compose" />
      )}

      {/* Section 4: Message Body */}
      <div className="space-y-3">
        <Textarea
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder={isBlue ? 'Type your message...' : 'Type your message here...'}
          rows={5}
          maxLength={1600}
        />

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
          <div className="text-sm text-gray-500">
            {segmentInfo?.charCount || 0} / {(segmentInfo?.segments || 1) * (segmentInfo?.maxChars || 160)} chars
            <span className="mx-2">|</span>
            {segmentInfo?.segments || 0} segment{(segmentInfo?.segments || 0) !== 1 ? 's' : ''}
            <span className="mx-2">|</span>
            {segmentInfo?.encoding || 'GSM-7'}
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

      {/* Section 5: Sending Options (for blast messages) */}
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
              {recipientCount > 1 && randomMaxSeconds >= randomMinSeconds && (
                <p className="text-xs text-gray-500">
                  Estimated completion: ~
                  {Math.ceil(((recipientCount - 1) * ((randomMinSeconds + randomMaxSeconds) / 2)) / 60)} min for{' '}
                  {recipientCount} recipients
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section 6: Schedule */}
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

      {/* Section 7: Cost Calculator (Free only) or Info (Blue) */}
      {!isBlue ? (
        <div className="bg-gradient-to-br from-brand-50 to-white rounded-lg border border-brand-100 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-medium text-gray-700">Cost Estimate</span>
            <InfoTooltip content="Twilio's standard rate for SMS" />
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-gray-900">{recipientCount}</p>
              <p className="text-xs text-gray-500">Recipients</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{segmentInfo?.segments || 0}</p>
              <p className="text-xs text-gray-500">Segments</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">$0.0079</p>
              <p className="text-xs text-gray-500">Per Segment</p>
            </div>
            <div>
              <p className="text-xl font-bold text-brand-600">{formatCost(estimatedCost)}</p>
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
      )}

      {/* Section 8: Send Button */}
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

      {/* Tips */}
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
    </div>
  );
}
