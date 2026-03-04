'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Send,
  Users,
  Apple,
  Smartphone,
  CheckCheck,
  Clock,
  Sparkles,
  MessageCircle,
  Image,
  Smile,
  Info,
  Video,
  Calendar,
  X,
  Loader2,
} from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string | null;
  phone: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
  memberCount?: number;
}

interface Message {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  type: string;
  totalRecipients: number;
  deliveryStats?: {
    imessage: number;
    rcs: number;
  };
}

interface iMessageComposerProps {
  contacts: Contact[];
  groups: Group[];
  optedInCount: number;
  onSend: (data: { 
    body: string; 
    recipientType: string; 
    recipientId?: string;
    isScheduled?: boolean;
    scheduledFor?: string;
    mediaUrl?: string;
  }) => Promise<void>;
  recentMessages: Message[];
  tier: 'blue_shared' | 'blue_dedicated';
}

export function IMessageComposer({
  contacts,
  groups,
  optedInCount,
  onSend,
  recentMessages,
  tier,
}: iMessageComposerProps) {
  const [recipientType, setRecipientType] = React.useState<'individual' | 'group' | 'all'>('all');
  const [selectedContactId, setSelectedContactId] = React.useState('');
  const [selectedGroupId, setSelectedGroupId] = React.useState('');
  const [messageBody, setMessageBody] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [contactSearch, setContactSearch] = React.useState('');
  const [isScheduled, setIsScheduled] = React.useState(false);
  const [scheduledDateTime, setScheduledDateTime] = React.useState('');
  const [attachedMedia, setAttachedMedia] = React.useState<{ type: string; name: string; url?: string } | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!messageBody.trim()) return;
    
    if (isScheduled && !scheduledDateTime) {
      toast.error('Please select a date and time for the scheduled message');
      return;
    }
    
    setSending(true);
    try {
      await onSend({
        body: messageBody,
        recipientType,
        recipientId: recipientType === 'individual' ? selectedContactId : selectedGroupId,
        isScheduled,
        scheduledFor: isScheduled ? scheduledDateTime : undefined,
        mediaUrl: attachedMedia?.url,
      });
      setMessageBody('');
      setAttachedMedia(null);
      setIsScheduled(false);
      setScheduledDateTime('');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Simulate upload for now - in production this would upload to cloud storage
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAttachedMedia({
        type: fileType,
        name: file.name,
        url: URL.createObjectURL(file), // In production, this would be the cloud URL
      });
      toast.success(`${fileType} attached!`);
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
    // Reset input
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
    } else {
      toast.info(`${type} support coming soon! Stay tuned.`);
    }
  };

  const removeMedia = () => {
    setAttachedMedia(null);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.firstName.toLowerCase().includes(contactSearch.toLowerCase()) ||
      (c.lastName || '').toLowerCase().includes(contactSearch.toLowerCase())
  );

  const getRecipientCount = () => {
    if (recipientType === 'individual') return 1;
    if (recipientType === 'all') return optedInCount;
    const group = groups.find((g) => g.id === selectedGroupId);
    return group?.memberCount || 0;
  };

  return (
    <div className="flex flex-col h-full">
      {/* iMessage Style Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">iMessage + RCS</h2>
              <p className="text-xs text-blue-100">Blue Bubble Messaging • 92% Reply Rate</p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            {tier === 'blue_dedicated' ? (
              <><Sparkles className="h-3 w-3 mr-1" />Dedicated</>
            ) : (
              <><Sparkles className="h-3 w-3 mr-1" />Shared Enterprise</>
            )}
          </Badge>
        </div>
      </div>

      {/* Device Type Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 flex items-center justify-center gap-6 border-b border-blue-100">
        <div className="flex items-center gap-2 text-sm">
          <Apple className="h-4 w-4 text-gray-800" />
          <span className="text-gray-600">iPhones receive</span>
          <Badge className="bg-blue-500 text-white">iMessage</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Smartphone className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">Androids receive</span>
          <Badge className="bg-green-500 text-white">RCS</Badge>
        </div>
      </div>

      {/* Recipient Selection */}
      <div className="p-4 border-b border-gray-100 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Send to:</span>
          <div className="flex gap-2">
            {['all', 'group', 'individual'].map((type) => (
              <button
                key={type}
                onClick={() => setRecipientType(type as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  recipientType === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'all' && `All Opted-In (${optedInCount})`}
                {type === 'group' && 'Group'}
                {type === 'individual' && 'Individual'}
              </button>
            ))}
          </div>
        </div>

        {recipientType === 'group' && (
          <Select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full"
            placeholder="Select a group..."
            options={groups.map((group) => ({
              value: group.id,
              label: `${group.name} (${group.memberCount || 0} contacts)`,
            }))}
          />
        )}

        {recipientType === 'individual' && (
          <div className="space-y-2">
            <Input
              placeholder="Search contacts..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
            />
            {contactSearch && (
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                {filteredContacts.slice(0, 5).map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      setContactSearch(`${contact.firstName} ${contact.lastName || ''}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {contact.firstName[0]}
                      </span>
                    </div>
                    <span>{contact.firstName} {contact.lastName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Preview Area (iMessage Style) */}
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto min-h-[200px]">
        {recentMessages.length > 0 ? (
          <div className="space-y-3">
            {recentMessages.slice(0, 5).map((msg) => (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[80%]">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-sm shadow-sm">
                    <p className="text-sm">{msg.body}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.status === 'delivered' ? (
                      <CheckCheck className="h-3 w-3 text-blue-500" />
                    ) : msg.status === 'sent' ? (
                      <CheckCheck className="h-3 w-3 text-gray-400" />
                    ) : (
                      <Clock className="h-3 w-3 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-400">
                      {msg.totalRecipients} recipient{msg.totalRecipients !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">Your messages will appear here</p>
            <p className="text-xs">Blue bubbles = iMessage • Green bubbles = RCS</p>
          </div>
        )}
      </div>

      {/* iMessage Style Composer */}
      <div className="p-4 bg-white border-t border-gray-200">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleFileSelect(e, fileInputRef.current?.accept?.includes('image') ? 'Image' : 'Video')}
        />

        {/* Schedule Toggle */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScheduled(!isScheduled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isScheduled
                  ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Schedule for Later
            </button>
            {isScheduled && (
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
              />
            )}
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          )}
        </div>

        {/* Attached Media Preview */}
        {attachedMedia && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {attachedMedia.type === 'Image' ? (
                <Image className="h-5 w-5 text-blue-600" />
              ) : (
                <Video className="h-5 w-5 text-blue-600" />
              )}
              <span className="text-sm text-blue-700 truncate max-w-[200px]">{attachedMedia.name}</span>
            </div>
            <button
              onClick={removeMedia}
              className="p-1 hover:bg-blue-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-blue-600" />
            </button>
          </div>
        )}

        {/* Media attachment buttons - Only functional buttons */}
        <div className="flex items-center gap-1 mb-3 pb-3 border-b border-gray-100">
          <button 
            onClick={() => handleMediaButton('image')}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Attach Photo"
          >
            <Image className="h-5 w-5" />
          </button>
          <button 
            onClick={() => handleMediaButton('video')}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Attach Video"
          >
            <Video className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="iMessage"
              className="pr-14 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none min-h-[44px] max-h-[120px]"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors" title="Emoji">
                <Smile className="h-5 w-5" />
              </button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!messageBody.trim() || sending || uploading || (recipientType === 'individual' && !selectedContactId) || (recipientType === 'group' && !selectedGroupId)}
            className={`rounded-full h-11 w-11 p-0 ${
              isScheduled 
                ? 'bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300' 
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300'
            }`}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isScheduled ? (
              <Calendar className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Send Info */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''}
            </span>
            {isScheduled ? (
              <span className="flex items-center gap-1 text-purple-600">
                <Calendar className="h-3 w-3" />
                Will send at scheduled time
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                No limits • Images & video
              </span>
            )}
          </div>
          <span className="text-green-600 font-medium">
            $0.00 per message
          </span>
        </div>
      </div>

      {/* Feature Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-b-2xl border-t border-blue-200">
        <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
          <span className="flex items-center gap-1">
            <CheckCheck className="h-3 w-3 text-blue-500" />
            Read receipts
          </span>
          <span className="flex items-center gap-1">
            <Image className="h-3 w-3 text-purple-500" />
            Images & video
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-sky-500" />
            No A2P needed
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3 text-green-500" />
            Unlimited messages
          </span>
        </div>
      </div>
    </div>
  );
}
