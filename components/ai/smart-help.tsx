'use client';

import React from 'react';
import { HelpCircle, Loader2, X, Sparkles } from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';

interface SmartHelpProps {
  context: string; // page name like "messages", "contacts", "settings"
}

export function SmartHelp({ context }: SmartHelpProps) {
  const { adminFetch } = useAdmin();
  const [isOpen, setIsOpen] = React.useState(false);
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const res = await adminFetch('/api/ai/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to get help');
      setAnswer(data.answer || '');
    } catch (err: any) {
      setError(err?.message || 'Failed to get help');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        title="Need help?"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Smart Help</span>
        </div>
        <button
          onClick={() => { setIsOpen(false); setAnswer(''); setQuestion(''); }}
          className="text-white/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {answer && (
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-gray-700 leading-relaxed">
            {answer}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this page..."
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && !loading && askQuestion()}
          />
          <button
            onClick={askQuestion}
            disabled={loading || !question.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">Powered by AI</p>
      </div>
    </div>
  );
}
