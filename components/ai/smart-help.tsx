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
  const [slowLoading, setSlowLoading] = React.useState<string>('');
  const [error, setError] = React.useState('');

  // Derive activeTab from URL search params (pages use ?tab=, not #hash)
  const getActiveTab = () => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || '';
  };

  // Read DOM data attributes for richer context
  const getPageContext = () => {
    if (typeof window === 'undefined') return {};
    const recipientTypeEl = document.querySelector('[data-recipient-type]');
    const sendingModeEl = document.querySelector('[data-sending-mode]');
    const selectedContactEl = document.querySelector('[data-selected-contact]');
    return {
      recipientType: recipientTypeEl?.getAttribute('data-recipient-type') || undefined,
      sendingMode: sendingModeEl?.getAttribute('data-sending-mode') || undefined,
      selectedContactName: selectedContactEl?.getAttribute('data-selected-contact') || undefined,
      currentPath: window.location.pathname,
    };
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setSlowLoading('');
    setError('');
    setAnswer('');
    setNavLinks([]);

    // Show progressive loading feedback
    const slowTimer = setTimeout(() => {
      setSlowLoading('Taking longer than expected...');
    }, 5000);
    const verySlowTimer = setTimeout(() => {
      setSlowLoading('Try a simpler question or refresh');
    }, 10000);

    try {
      const activeTab = getActiveTab();
      const pageContext = getPageContext();

      const res = await adminFetch('/api/ai/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context,
          activeTab: activeTab || undefined,
          recipientType: pageContext.recipientType,
          sendingMode: pageContext.sendingMode,
          selectedContactName: pageContext.selectedContactName,
        }),
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
      clearTimeout(slowTimer);
      clearTimeout(verySlowTimer);
      setLoading(false);
      setSlowLoading('');
    }
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Auto-focus input when widget opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to let the widget render before focusing
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center pointer-events-auto"
        title="Need help?"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-80 bg-white rounded-xl shadow-2xl border border-gray-200 pointer-events-auto" style={{ isolation: 'isolate' }}>
      <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-3 flex items-center justify-between rounded-t-xl">
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

      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {answer && (
          <div className="space-y-2">
            <div className="p-3 bg-brand-50 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
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

        {loading && slowLoading && (
          <p className="text-xs text-amber-600 text-center animate-pulse">{slowLoading}</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="px-4 pb-4 pt-1 space-y-3">
        <div className="relative flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this page..."
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent pointer-events-auto relative z-[1]"
            onKeyDown={(e) => e.key === 'Enter' && !loading && askQuestion()}
            autoComplete="off"
          />
          <button
            onClick={askQuestion}
            disabled={loading || !question.trim()}
            className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors pointer-events-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">Powered by AI</p>
      </div>
    </div>
  );
}
