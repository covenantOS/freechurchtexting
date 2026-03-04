'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquareText } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showByline?: boolean;
  linkToHome?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { iconSize: 'h-6 w-6', textSize: 'text-lg', bylineSize: 'text-xs' },
  md: { iconSize: 'h-8 w-8', textSize: 'text-xl', bylineSize: 'text-xs' },
  lg: { iconSize: 'h-10 w-10', textSize: 'text-2xl', bylineSize: 'text-sm' },
  xl: { iconSize: 'h-12 w-12', textSize: 'text-3xl', bylineSize: 'text-sm' },
};

export function Logo({ size = 'md', showByline = true, linkToHome = true, className = '' }: LogoProps) {
  const config = sizeConfig[size];
  const router = useRouter();

  const handleLogoClick = () => {
    if (linkToHome) {
      router.push('/');
    }
  };

  const handleBylineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`flex items-center gap-3 ${linkToHome ? 'cursor-pointer' : ''} ${className}`}
      onClick={linkToHome ? handleLogoClick : undefined}
      role={linkToHome ? 'button' : undefined}
      tabIndex={linkToHome ? 0 : undefined}
      onKeyDown={linkToHome ? (e) => e.key === 'Enter' && handleLogoClick() : undefined}
    >
      {/* Icon */}
      <div className="relative">
        <div className="rounded-xl bg-gradient-to-br from-[#111827] to-[#1f2937] p-2 shadow-lg">
          <MessageSquareText className={`${config.iconSize} text-[#C28C88]`} />
        </div>
        {/* Small decorative dot */}
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#C28C88] border-2 border-white" />
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <span className={`${config.textSize} font-bold text-gray-900 leading-tight`}>
          Free Church Texting
        </span>
        {showByline && (
          <span className={`${config.bylineSize} text-gray-500`}>
            by{' '}
            <a
              href="https://churchposting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C28C88] hover:underline font-medium"
              onClick={handleBylineClick}
            >
              Church Posting
            </a>
          </span>
        )}
      </div>
    </div>
  );
}

export function LogoCompact({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <div className="rounded-lg bg-gradient-to-br from-[#111827] to-[#1f2937] p-1.5 shadow-md">
        <MessageSquareText className="h-5 w-5 text-[#C28C88]" />
      </div>
      <span className="text-lg font-bold text-gray-900">FCT</span>
    </Link>
  );
}
