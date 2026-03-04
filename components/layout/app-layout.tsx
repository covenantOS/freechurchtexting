'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Footer } from './footer';
import { AdminBar } from '@/components/admin/admin-bar';
import { useAdmin } from '@/lib/admin-context';
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import { SmartHelp } from '@/components/ai/smart-help';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { isImpersonating } = useAdmin();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Skip onboarding redirect for super admins or when impersonating
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin;
  React.useEffect(() => {
    if (session?.user && !isSuperAdmin && !isImpersonating && !session?.user?.onboardingCompleted && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [session, pathname, router, isSuperAdmin, isImpersonating]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <AdminBar />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isMenuOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={`flex-1 md:pl-64 ${isImpersonating ? 'pt-28' : 'pt-16'}`}>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <div className="md:pl-64">
        <Footer />
      </div>
      <PWAInstallPrompt />
      <SmartHelp context={pathname?.replace('/', '') || 'dashboard'} />
    </div>
  );
}
