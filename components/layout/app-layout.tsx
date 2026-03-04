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

  // Redirect super admin to /admin when NOT impersonating and on a protected route
  const protectedRoutes = ['/dashboard', '/messages', '/contacts', '/groups', '/templates', '/conversations', '/settings', '/compliance', '/onboarding'];
  React.useEffect(() => {
    if (isSuperAdmin && !isImpersonating && pathname) {
      const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      );
      if (isProtectedRoute) {
        router.replace('/admin');
      }
    }
  }, [isSuperAdmin, isImpersonating, pathname, router]);

  React.useEffect(() => {
    if (session?.user && !isSuperAdmin && !isImpersonating && !session?.user?.onboardingCompleted && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [session, pathname, router, isSuperAdmin, isImpersonating]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-6 border-b border-gray-100">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 md:pl-64">
          {/* Header skeleton */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          {/* Content area skeleton */}
          <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-xl border border-gray-200 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            <div className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    // Show a loading spinner while redirecting to login (useEffect above handles the redirect)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <AdminBar />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isMenuOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 md:pl-64 pt-16">
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
