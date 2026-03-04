'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConversationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/messages?tab=conversations');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Redirecting to Messages...</p>
      </div>
    </div>
  );
}
