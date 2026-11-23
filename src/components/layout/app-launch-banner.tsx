'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { APP_STORE_URL } from '@/components/ui/app-store-badge';

export function AppLaunchBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user dismissed the banner previously in this session
    const isDismissed = sessionStorage.getItem('dismissed_ios_launch_banner');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('dismissed_ios_launch_banner', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      id="ios-app-launch-banner"
      className="relative z-50 bg-[#080d1a] text-white border-b border-blue-900/30 text-xs sm:text-sm py-2 px-4 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 text-center flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-red-500" />
            New Launch
          </span>
          <span className="text-slate-300 font-medium">
            i wear organic is now live on the iOS App Store!
          </span>
          <Link
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white font-medium underline underline-offset-4 hover:text-red-400 transition-colors"
          >
            Download for iOS
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss announcement"
          className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
