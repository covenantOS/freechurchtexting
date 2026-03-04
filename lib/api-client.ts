import { useAdmin } from './admin-context';
import { useCallback } from 'react';

/**
 * Custom hook for making API calls that respect admin impersonation
 * When an admin is viewing as another user, the churchId of the impersonated user is used
 */
export function useApiClient() {
  const { isImpersonating, impersonatedUser } = useAdmin();
  
  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    
    // If impersonating, add the impersonated church ID to the request
    if (isImpersonating && impersonatedUser?.churchId) {
      headers.set('X-Impersonate-Church-Id', impersonatedUser.churchId);
    }
    
    return fetch(url, {
      ...options,
      headers,
    });
  }, [isImpersonating, impersonatedUser]);
  
  return { apiFetch, isImpersonating, impersonatedUser };
}

/**
 * Server-side utility to get the effective church ID from a request
 * Checks for impersonation header if the user is a super admin
 */
export function getEffectiveChurchId(
  sessionChurchId: string,
  isSuperAdmin: boolean,
  impersonateChurchId: string | null
): string {
  if (isSuperAdmin && impersonateChurchId) {
    return impersonateChurchId;
  }
  return sessionChurchId;
}
