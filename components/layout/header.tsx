'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Settings, LogOut, ChevronDown, Menu, X, MessageSquareText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  const { data: session } = useSession() || {};
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              {/* Logo Icon */}
              <div className="relative">
                <div className="rounded-xl bg-gradient-to-br from-[#111827] to-[#1f2937] p-2 shadow-lg">
                  <MessageSquareText className="h-6 w-6 text-[#C28C88]" />
                </div>
                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#C28C88] border-2 border-white" />
              </div>
              {/* Text */}
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">
                  Free Church Texting
                </span>
              </div>
            </Link>
            {/* Byline separate from Link to avoid nested <a> */}
            <span className="hidden sm:block text-xs text-gray-500 -ml-2">
              by{' '}
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
        </div>

        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {session?.user?.name?.[0]?.toUpperCase?.() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{session?.user?.churchName || 'Church'}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
