'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

interface ImpersonatedUser {
  id: string;
  email: string;
  name: string;
  churchId: string;
  churchName: string;
  subscriptionTier: string;
  onboardingCompleted: boolean;
}

interface AdminContextType {
  impersonatedUser: ImpersonatedUser | null;
  setImpersonatedUser: (user: ImpersonatedUser | null) => void;
  isImpersonating: boolean;
  clearImpersonation: () => void;
  effectiveChurchId: string | null;
  effectiveUserId: string | null;
  effectiveSubscriptionTier: string;
  effectiveOnboardingCompleted: boolean;
  effectiveChurchName: string;
  effectiveUserName: string;
  isSuperAdmin: boolean;
  // Helper for API calls with impersonation headers
  adminFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() || {};
  const [impersonatedUser, setImpersonatedUserState] = useState<ImpersonatedUser | null>(null);
  
  const isSuperAdmin = !!(session?.user as any)?.isSuperAdmin;
  
  // Load impersonation from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isSuperAdmin) {
      const stored = sessionStorage.getItem('impersonatedUser');
      if (stored) {
        try {
          setImpersonatedUserState(JSON.parse(stored));
        } catch (e) {
          sessionStorage.removeItem('impersonatedUser');
        }
      }
    }
  }, [isSuperAdmin]);
  
  const setImpersonatedUser = useCallback((user: ImpersonatedUser | null) => {
    setImpersonatedUserState(user);
    if (typeof window !== 'undefined') {
      if (user) {
        sessionStorage.setItem('impersonatedUser', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('impersonatedUser');
      }
    }
  }, []);
  
  const clearImpersonation = useCallback(() => {
    setImpersonatedUser(null);
  }, [setImpersonatedUser]);
  
  const isImpersonating = isSuperAdmin && impersonatedUser !== null;
  
  // Get effective values - impersonated user's values if impersonating, otherwise session user's
  const effectiveChurchId = isImpersonating 
    ? impersonatedUser?.churchId || null
    : (session?.user as any)?.churchId || null;
    
  const effectiveUserId = isImpersonating
    ? impersonatedUser?.id || null
    : (session?.user as any)?.id || null;
    
  const effectiveSubscriptionTier = isImpersonating
    ? impersonatedUser?.subscriptionTier || 'free'
    : (session?.user as any)?.subscriptionTier || 'free';
    
  const effectiveOnboardingCompleted = isImpersonating
    ? impersonatedUser?.onboardingCompleted || false
    : (session?.user as any)?.onboardingCompleted || false;
    
  const effectiveChurchName = isImpersonating
    ? impersonatedUser?.churchName || ''
    : (session?.user as any)?.churchName || '';
    
  const effectiveUserName = isImpersonating
    ? impersonatedUser?.name || ''
    : (session?.user as any)?.name || '';

  // Invalidate all React Query caches when the effective church changes
  const queryClient = useQueryClient();
  const prevChurchIdRef = useRef<string | null>(effectiveChurchId);

  useEffect(() => {
    if (prevChurchIdRef.current !== effectiveChurchId && prevChurchIdRef.current !== null) {
      // Church context changed -- invalidate (not remove) cached query data so that
      // stale data remains visible while fresh data loads in the background,
      // preventing blank page flashes during church switches.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
    }
    prevChurchIdRef.current = effectiveChurchId;
  }, [effectiveChurchId, queryClient]);

  // Helper function for API calls that includes impersonation headers
  const adminFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    
    if (isImpersonating && impersonatedUser) {
      headers.set('X-Impersonate-Church-Id', impersonatedUser.churchId);
      headers.set('X-Impersonate-User-Id', impersonatedUser.id);
    }
    
    return fetch(url, {
      ...options,
      headers,
    });
  }, [isImpersonating, impersonatedUser]);
  
  const value = useMemo(() => ({
    impersonatedUser,
    setImpersonatedUser,
    isImpersonating,
    clearImpersonation,
    effectiveChurchId,
    effectiveUserId,
    effectiveSubscriptionTier,
    effectiveOnboardingCompleted,
    effectiveChurchName,
    effectiveUserName,
    isSuperAdmin,
    adminFetch,
  }), [
    impersonatedUser,
    setImpersonatedUser,
    isImpersonating,
    clearImpersonation,
    effectiveChurchId,
    effectiveUserId,
    effectiveSubscriptionTier,
    effectiveOnboardingCompleted,
    effectiveChurchName,
    effectiveUserName,
    isSuperAdmin,
    adminFetch,
  ]);
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    // Return default values if not within provider
    return {
      impersonatedUser: null,
      setImpersonatedUser: () => {},
      isImpersonating: false,
      clearImpersonation: () => {},
      effectiveChurchId: null,
      effectiveUserId: null,
      effectiveSubscriptionTier: 'free',
      effectiveOnboardingCompleted: false,
      effectiveChurchName: '',
      effectiveUserName: '',
      isSuperAdmin: false,
      adminFetch: fetch,
    };
  }
  return context;
}
