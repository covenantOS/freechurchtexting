'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/tooltip';
import {
  Send,
  Users,
  Calculator,
  FileText,
  AlertCircle,
  Sparkles,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { calculateSegments, calculateCost, formatCost } from '@/lib/sms-calculator';

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

interface SMSComposerProps {
  contacts: Contact[];
  groups: Group[];
  templates: Template[];
  optedInCount: number;
  onSend: (data: any) => Promise<void>;
  isScheduling?: boolean;
  onScheduleToggle?: (value: boolean) => void;
  scheduledDateTime?: string;
  onScheduledDateTimeChange?: (value: string) => void;
}

export function SMSComposer({
  contacts,
  groups,
  templates,
  optedInCount,
  onSend,
  isScheduling = false,
  onScheduleToggle,
  scheduledDateTime = '',
  onScheduledDateTimeChange,
}: SMSComposerProps) {
  const [recipientType, setRecipientType] = React.useState<'individual' | 'group' | 'all'>('individual');
  const [selectedContactId, setSelectedContactId] = React.useState('');
  const [selectedGroupId, setSelectedGroupId] = React.useState('');
  const [messageBody, setMessageBody] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const [contactSearch, setContactSearch] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const segmentInfo = calculateSegments(messageBody);
  const recipientCount = recipientType === 'individual' ? 1 : recipientType === 'all' ? optedInCount : (groups.find(g => g.id === selectedGroupId)?.memberCount || 0);
  const estimatedCost = calculateCost(segmentInfo.segments, recipientCount);
  const remainingInSegment = segmentInfo.maxChars - (segmentInfo.charCount % segmentInfo.maxChars || segmentInfo.maxChars);

  const filteredContacts = contacts.filter(
    (c) =>
      c.optInStatus === 'opted_in' &&
      (c.firstName.toLowerCase().includes(contactSearch.toLowerCase()) ||
        (c.lastName || '').toLowerCase().includes(contactSearch.toLowerCase()))
  );

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessageBody(template.body);
    }
  };

  const insertMergeTag = (tag: string) => {
    setMessageBody(prev => prev + `{${tag}}`);
  };

  const handleSend = async () => {
    if (!messageBody.trim()) return;
    setSending(true);
    try {
      await onSend({
        body: messageBody,
        recipientType,
        recipientId: recipientType === 'individual' ? selectedContactId : selectedGroupId,
        isScheduled: isScheduling,
        scheduledDateTime,
      });
      setMessageBody('');
      setSelectedTemplate('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recipient Type */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Send to</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'individual', label: 'Individual', icon: '👤' },
            { value: 'group', label: 'Group', icon: '👥' },
            { value: 'all', label: `All Opted-In (${optedInCount})`, icon: '📢' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setRecipientType(option.value as any)}
              className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                recipientType === option.value
                  ? 'border-[#111827] bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact/Group Selection */}
      {recipientType === 'individual' && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Select Contact</label>
          <Input
            placeholder="Search opted-in contacts..."
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            className="mb-2"
          />
          {contactSearch && (
            <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
              {filteredContacts.slice(0, 5).map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    setSelectedContactId(contact.id);
                    setContactSearch(`${contact.firstName} ${contact.lastName || ''} - ${contact.phone}`);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  {contact.firstName} {contact.lastName} - {contact.phone}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {recipientType === 'group' && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Select Group</label>
          <Select 
            value={selectedGroupId} 
            onChange={(e) => setSelectedGroupId(e.target.value)}
            placeholder="Choose a group..."
            options={groups.map((group) => ({
              value: group.id,
              label: `${group.name} (${group.memberCount || 0} contacts)`,
            }))}
          />
        </div>
      )}

      {/* Template Selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Use Template (Optional)</label>
        <Select 
          value={selectedTemplate} 
          onChange={(e) => handleTemplateSelect(e.target.value)}
          placeholder="Start from scratch..."
          options={templates.map((template) => ({
            value: template.id,
            label: template.name,
          }))}
        />
      </div>

      {/* Message Body */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Message</label>
          <div className="flex gap-2">
            <button
              onClick={() => insertMergeTag('first_name')}
              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              + First Name
            </button>
            <button
              onClick={() => insertMergeTag('last_name')}
              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              + Last Name
            </button>
          </div>
        </div>
        <Textarea
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* SMS Calculator */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Cost Calculator</span>
          <InfoTooltip content="SMS messages over 160 characters are split into multiple segments. Each segment is billed separately." />
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{segmentInfo.charCount}</p>
            <p className="text-xs text-gray-500">Characters</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{segmentInfo.segments}</p>
            <p className="text-xs text-gray-500">Segments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{recipientCount}</p>
            <p className="text-xs text-gray-500">Recipients</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#C28C88]">{formatCost(estimatedCost)}</p>
            <p className="text-xs text-gray-500">Est. Cost</p>
          </div>
        </div>
        {segmentInfo.charCount > 0 && remainingInSegment < 20 && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            {remainingInSegment} characters left in this segment
          </p>
        )}
      </div>

      {/* Schedule Toggle */}
      {onScheduleToggle && recipientType !== 'individual' && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="schedule-toggle"
            checked={isScheduling}
            onChange={(e) => onScheduleToggle(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="schedule-toggle" className="text-sm text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule for later
          </label>
        </div>
      )}

      {isScheduling && onScheduledDateTimeChange && (
        <Input
          type="datetime-local"
          value={scheduledDateTime}
          onChange={(e) => onScheduledDateTimeChange(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
        />
      )}

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={
          !messageBody.trim() ||
          sending ||
          (recipientType === 'individual' && !selectedContactId) ||
          (recipientType === 'group' && !selectedGroupId) ||
          (isScheduling && !scheduledDateTime)
        }
        className="w-full"
        size="lg"
      >
        {sending ? (
          'Sending...'
        ) : isScheduling ? (
          <><Calendar className="h-4 w-4 mr-2" />Schedule Message</>
        ) : (
          <><Send className="h-4 w-4 mr-2" />Send Message</>
        )}
      </Button>

      {/* Blue Upgrade CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Want 92% reply rates?</p>
            <p className="text-sm text-gray-600 mt-1">
              Upgrade to Blue for iMessage + RCS delivery. No per-message fees, no A2P registration.
            </p>
            <Link href="/blue" className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2 inline-block">
              Learn about Blue →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
