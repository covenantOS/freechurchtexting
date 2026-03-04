import React from 'react';
import Link from 'next/link';
import { MessageSquareText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-[#111827] to-[#1f2937] p-1.5 shadow-md">
            <MessageSquareText className="h-4 w-4 text-[#C28C88]" />
          </div>
          <span className="text-sm text-gray-600">
            Free Church Texting by{' '}
            <a
              href="https://churchposting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C28C88] hover:underline font-medium"
            >
              Church Posting
            </a>
          </span>
        </div>
        
        {/* Links */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/contact" className="hover:text-gray-900 transition-colors">
            Contact
          </Link>
          <Link href="/blue" className="hover:text-gray-900 transition-colors">
            Blue Tier
          </Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy
          </Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-4 text-center text-xs text-gray-400">
        © 2026{' '}
        <a href="https://churchposting.com" target="_blank" rel="noopener noreferrer" className="text-[#C28C88] hover:underline">
          Church Posting
        </a>
        . All rights reserved.
      </div>
    </footer>
  );
}
