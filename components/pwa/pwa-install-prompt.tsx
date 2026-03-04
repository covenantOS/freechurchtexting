'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Download, X, Smartphone, Share, MoreVertical, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    const wasInstalled = localStorage.getItem('pwa-installed');
    const wasDismissed = localStorage.getItem('pwa-dismissed');
    
    if (wasInstalled || wasDismissed) {
      setDismissed(true);
      return;
    }

    // Check if running as standalone (already installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt (Chrome/Edge/Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show prompt after delay if on mobile
    if (iOS) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', 'true');
    setShowPrompt(false);
    setDismissed(true);
  };

  if (isStandalone || dismissed || !showPrompt) {
    return null;
  }

  return (
    <Modal isOpen={showPrompt} onClose={handleDismiss} title="">
      <div className="text-center p-2">
        <div className="h-16 w-16 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <Smartphone className="h-8 w-8 text-[#C28C88]" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Install Free Church Texting
        </h3>
        
        <p className="text-gray-600 mb-6">
          Add FCT to your home screen for quick access and the best experience.
        </p>

        {isIOS ? (
          // iOS-specific instructions
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-900 mb-3">To install on iOS:</p>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span>Tap the <Share className="h-4 w-4 inline" /> Share button in Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong> <Plus className="h-4 w-4 inline" /></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                <span>Tap <strong>"Add"</strong> to confirm</span>
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          // Android/Chrome install button
          <Button onClick={handleInstall} className="w-full mb-4" size="lg">
            <Download className="h-5 w-5 mr-2" />
            Install App
          </Button>
        ) : (
          // Fallback instructions for other browsers
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-900 mb-3">To install:</p>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span>Tap the <MoreVertical className="h-4 w-4 inline" /> menu button</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
              </li>
            </ol>
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
}
