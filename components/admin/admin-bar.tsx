'use client';

import React from 'react';
import { useAdmin } from '@/lib/admin-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Eye, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function AdminBar() {
  const { isImpersonating, impersonatedUser, clearImpersonation } = useAdmin();
  
  if (!isImpersonating || !impersonatedUser) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-500 text-white py-2 px-4 z-[100] shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5" />
          <span className="font-medium">Admin View Mode:</span>
          <span className="text-red-100">Viewing as</span>
          <Badge className="bg-white/20 text-white border-0">
            {impersonatedUser.churchName}
          </Badge>
          <span className="text-red-200 text-sm">({impersonatedUser.email})</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Admin
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={clearImpersonation}
          >
            <X className="h-4 w-4 mr-1" />
            Exit View Mode
          </Button>
        </div>
      </div>
    </div>
  );
}
