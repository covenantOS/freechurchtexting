'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function AdminBar() {
  const router = useRouter();
  const { isImpersonating, impersonatedUser, clearImpersonation } = useAdmin();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-600/85 backdrop-blur-sm text-white py-1 px-4 z-[100] shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-medium text-xs hidden sm:inline">Admin View:</span>
          <Badge className="bg-white/20 text-white border-0 text-xs py-0">
            {impersonatedUser.churchName}
          </Badge>
          <span className="text-amber-100 text-xs hidden md:inline">({impersonatedUser.email})</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-6 text-xs px-2">
              <ArrowLeft className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Back to Admin</span>
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 h-6 text-xs px-2"
            onClick={() => { clearImpersonation(); router.push('/admin'); }}
          >
            <X className="h-3 w-3 mr-1" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
