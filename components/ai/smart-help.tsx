'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { HelpCircle, Loader2, X, Sparkles, ArrowRight } from 'lucide-react';
import { useAdmin } from '@/lib/admin-context';

// Parse [PageName] references in AI response
const parseNavigationLinks = (text: string) => {
  const pageMap: Record<string, string> = {
    'Dashboard': '/dashboard',
    'Messages': '/messages',
    'Contacts': '/contacts',
    'Groups': '/groups',
    'Templates': '/templates',
    'Conversations': '/conversations',
    'Settings': '/settings',
  };

  const links: Array<{ label: string; path: string }> = [];
  const regex = /\[([A-Za-z]+)\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const pageName = match[1];
    if (pageMap[pageName]) {
      links.push({ label: pageName, path: pageMap[pageName] });
    }
  }
  return links;
};

interface SmartHelpProps {
  context: string; // page name like "messages", "contacts", "settings"
}

export function SmartHelp({ context }: SmartHelpProps) {
  const { adminFetch } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [navLinks, setNavLinks] = React.useState<Array<{ label: string; path: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Derive activeTab from the URL hash if present
  const activeTab = typeof window !== 'undefined' ? window.location.hash?.replace('#', '') : '';

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError('');
    setAnswer('');
    setNavLinks([]);

    try {
      const res = await adminFetch('/api/ai/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context, activeTab: activeTab || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to get help');
      const answerText = data.answer || '';
      setAnswer(answerText);

      // Parse navigation links from the AI response
      const links = parseNavigationLinks(answerText);
      // Filter out links that point to the current page
      const filteredLinks = links.filter(
        (link) => link.path !== pathname
      );
      setNavLinks(filteredLinks);
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
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        title="Need help?"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-3 flex items-center justify-between">
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
          <div className="space-y-2">
            <div className="p-3 bg-brand-50 rounded-lg text-sm text-gray-700 leading-relaxed">
              {answer}
            </div>
            {navLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => {
                      router.push(link.path);
                      setIsOpen(false);
                      setAnswer('');
                      setQuestion('');
                      setNavLinks([]);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-full transition-colors"
                  >
                    Go to {link.label}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
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
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && !loading && askQuestion()}
          />
          <button
            onClick={askQuestion}
            disabled={loading || !question.trim()}
            className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">Powered by AI</p>
      </div>
    </div>
  );
}
