'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAdmin } from '@/lib/admin-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Layers,
  MessageSquare,
  MessagesSquare,
  FileText,
  Shield,
  Settings,
  ShieldAlert,
} from 'lucide-react';

const getNavItems = (isBlue: boolean) => {
  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/contacts', label: 'Contacts', icon: Users },
    { href: '/groups', label: 'Groups', icon: Layers },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/conversations', label: 'Conversations', icon: MessagesSquare },
    { href: '/templates', label: 'Templates', icon: FileText },
  ];
  
  // Only show compliance for non-Blue tier users (SMS users need A2P compliance)
  if (!isBlue) {
    items.push({ href: '/compliance', label: 'Compliance', icon: Shield });
  }
  
  items.push({ href: '/settings', label: 'Settings', icon: Settings });
  
  return items;
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession() || {};
  const { isImpersonating } = useAdmin();
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin;
  const subscriptionTier = (session?.user as any)?.subscriptionTier || 'free';
  const isBlue = subscriptionTier === 'blue_shared' || subscriptionTier === 'blue_dedicated';
  
  const navItems = getNavItems(isBlue);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-30 transition-transform duration-300',
          'top-16',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="p-4 space-y-1">
          {navItems?.map((item) => {
            const Icon = item?.icon;
            const isActive = pathname === item?.href || pathname?.startsWith?.(`${item?.href}/`);

            return (
              <Link
                key={item?.href}
                href={item?.href || '#'}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-brand-50/50 hover:text-gray-900'
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
                {item?.label}
              </Link>
            );
          })}

          {/* Admin Link - Only for Super Admins when NOT impersonating */}
          {isSuperAdmin && !isImpersonating && (
            <>
              <div className="my-4 border-t border-gray-200" />
              <Link
                href="/admin"
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === '/admin'
                    ? 'bg-red-50 text-red-600'
                    : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                )}
              >
                <ShieldAlert className="h-5 w-5" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
