'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, X, Wand2, ChevronDown, RefreshCw } from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';

interface AIComposerProps {
  onInsert: (text: string) => void;
  groupName?: string;
}

const QUICK_OCCASIONS = [
  'Sunday service reminder',
  'Event invitation',
  'Prayer request follow-up',
  'Welcome new member',
  'Volunteer call',
  'Holiday greeting',
  'Bible study reminder',
  'Thank you / appreciation',
];

export function AIComposer({ onInsert, groupName }: AIComposerProps) {
  const { adminFetch } = useAdmin();
  const [isOpen, setIsOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState('');
  const [error, setError] = React.useState('');

  // Read DOM data attributes for recipient context
  const getRecipientContext = () => {
    if (typeof window === 'undefined') return {};
    const recipientTypeEl = document.querySelector('[data-recipient-type]');
    const selectedContactEl = document.querySelector('[data-selected-contact]');
    const sendingModeEl = document.querySelector('[data-sending-mode]');
    return {
      recipientType: recipientTypeEl?.getAttribute('data-recipient-type') || undefined,
      selectedContactName: selectedContactEl?.getAttribute('data-selected-contact') || undefined,
      sendingMode: sendingModeEl?.getAttribute('data-sending-mode') || undefined,
    };
  };

  const generate = async (userPrompt?: string) => {
    const promptToUse = userPrompt || prompt;
    if (!promptToUse.trim()) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const recipientContext = getRecipientContext();
      const recipientCount = recipientContext.recipientType === 'all'
        ? undefined  // the API will use the total contact count
        : undefined;

      const res = await adminFetch('/api/ai/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: userPrompt ? promptToUse : undefined,
          prompt: userPrompt ? undefined : promptToUse,
          groupName,
          recipientType: recipientContext.recipientType,
          selectedContactName: recipientContext.selectedContactName,
          selectedContactCount: recipientCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate');
      setResult(data.message || '');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate message');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (result) {
      onInsert(result);
      setResult('');
      setPrompt('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
      >
        <Wand2 className="h-3.5 w-3.5" />
        Write with AI
      </Button>
    );
  }

  return (
    <div className="border border-purple-200 rounded-lg bg-purple-50/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">AI Message Writer</span>
        </div>
        <button
          onClick={() => { setIsOpen(false); setResult(''); setError(''); }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick occasions */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_OCCASIONS.map((occasion) => (
          <button
            key={occasion}
            onClick={() => generate(occasion)}
            disabled={loading}
            className="px-2.5 py-1 text-xs rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-colors disabled:opacity-50"
          >
            {occasion}
          </button>
        ))}
      </div>

      {/* Custom prompt */}
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Or describe what you want to say..."
          className="flex-1 text-sm bg-white"
          onKeyDown={(e) => e.key === 'Enter' && !loading && generate()}
        />
        <Button
          size="sm"
          onClick={() => generate()}
          disabled={loading || !prompt.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-purple-200 text-sm text-gray-800 whitespace-pre-wrap">
            {result}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInsert} className="bg-purple-600 hover:bg-purple-700">
              Use This Message
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generate(prompt || undefined)}
              className="text-purple-600 border-purple-200"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
