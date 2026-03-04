'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function AdminBar() {
  const router = useRouter();
  const { isImpersonating, impersonatedUser, clearImpersonation } = useAdmin();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-8 bg-gray-900 text-white text-sm z-[100] flex items-center px-4">
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-gray-400 flex-shrink-0">Viewing:</span>
        <span className="font-medium truncate">{impersonatedUser.churchName}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link href="/admin">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-300 hover:text-white hover:bg-white/10 h-6 text-xs px-2"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Admin
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-300 hover:text-white hover:bg-white/10 h-6 text-xs px-2"
          onClick={() => { clearImpersonation(); router.push('/admin'); }}
        >
          Exit
        </Button>
      </div>
    </div>
  );
}
