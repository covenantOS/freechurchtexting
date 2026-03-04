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
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-amber-500 text-white py-1.5 px-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-4 w-4" />
          <span className="font-medium text-sm">Admin View:</span>
          <Badge className="bg-white/20 text-white border-0">
            {impersonatedUser.churchName}
          </Badge>
          <span className="text-amber-100 text-sm">({impersonatedUser.email})</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-7 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Admin
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 h-7 text-xs"
            onClick={() => { clearImpersonation(); router.push('/admin'); }}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Exit View Mode
          </Button>
        </div>
      </div>
    </div>
  );
}
