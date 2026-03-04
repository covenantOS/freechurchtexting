import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * Get the effective church ID for API routes, supporting admin impersonation
 */
export async function getEffectiveChurchId(request: NextRequest): Promise<{ churchId: string | null; userId: string | null; error?: string }> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.churchId) {
    return { churchId: null, userId: null, error: 'Unauthorized' };
  }

  const isSuperAdmin = (session.user as any).isSuperAdmin;
  const impersonateChurchId = request.headers.get('X-Impersonate-Church-Id');
  const impersonateUserId = request.headers.get('X-Impersonate-User-Id');
  
  // Use impersonated church ID if admin is impersonating
  const churchId = (isSuperAdmin && impersonateChurchId) 
    ? impersonateChurchId 
    : session.user.churchId;
    
  const userId = (isSuperAdmin && impersonateUserId)
    ? impersonateUserId
    : (session.user as any).id;

  return { churchId, userId };
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!(session?.user as any)?.isSuperAdmin;
}
