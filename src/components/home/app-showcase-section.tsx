'use client';

import { useState } from 'react';
import { AppStoreBadge, APP_STORE_URL } from '@/components/ui/app-store-badge';
import { Smartphone, Zap, Bell, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface AppShowcaseSectionProps {
  screenshotUrl?: string;
}

export function AppShowcaseSection({ 
  screenshotUrl = '/ios-app-preview.png' 
}: AppShowcaseSectionProps) {
  const [imageError, setImageError] = useState(false);

  const activeImageSrc = screenshotUrl;
  const showImage = !imageError && Boolean(activeImageSrc);
  return (
    <section
      id="ios-app-showcase"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c152a] via-[#091022] to-[#060b18] text-white border border-blue-950/80 shadow-[0_20px_50px_rgba(3,7,18,0.7)] ring-1 ring-blue-500/10 my-16"
    >
      {/* Subtle ambient lighting: Retro Red & Deep Sapphire */}
      <div className="absolute top-0 right-1/4 -mt-20 h-80 w-80 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.06),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 lg:py-20 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Content Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-medium tracking-wider uppercase text-red-200">
              <Sparkles className="h-3.5 w-3.5 text-red-500" />
              Now on the App Store for iPhone
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium font-headline tracking-tight leading-tight">
              The I Wear Organic experience, now on iOS.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-body leading-relaxed">
              Experience the best of made-to-order American apparel. Browse curated collections, watch community creator fits, and enjoy lightning-fast checkout.
            </p>

            {/* Feature bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Instant Apple Pay</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Secure, 1-tap checkout right from your phone.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Drop Alerts</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Be the first to know when new items and limited collections drop.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] shrink-0">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Full Creator Feed</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Watch high-res try-on videos and shop directly from looks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Order Tracking</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Live updates from print production straight to your door.</p>
                </div>
              </div>
            </div>

            {/* CTA & Official Badge */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <AppStoreBadge size="lg" />
              <span className="text-xs text-slate-400">
                Requires iOS 16.0 or later. Free download.
              </span>
            </div>
          </div>

          {/* Visual Device Showcase Column */}
          <div className="lg:col-span-5 flex justify-center">
            <Link
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block w-full max-w-[280px] sm:max-w-xs transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-[2.75rem]"
            >
              {/* Phone Frame Mockup with Navy/Titanium Bezel */}
              <div className="relative mx-auto border-[3px] border-slate-700/85 bg-[#0a1122] rounded-[2.75rem] p-2.5 sm:p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-blue-500/20">
                {/* Volume & Power Button Accents */}
                <div className="absolute -left-[4px] top-24 w-[2px] h-7 bg-slate-600 rounded-l-sm" />
                <div className="absolute -left-[4px] top-36 w-[2px] h-11 bg-slate-600 rounded-l-sm" />
                <div className="absolute -left-[4px] top-52 w-[2px] h-11 bg-slate-600 rounded-l-sm" />
                <div className="absolute -right-[4px] top-32 w-[2px] h-14 bg-slate-600 rounded-r-sm" />

                {/* Screen Content - Matched to 1320x2868 Native iPhone Ratio */}
                <div className="relative rounded-[2.2rem] overflow-hidden bg-neutral-950 aspect-[1320/2868] flex flex-col border border-neutral-800/80 shadow-inner">
                  {showImage ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={activeImageSrc}
                        alt="I Wear Organic iOS App Screen"
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 280px, 320px"
                        priority
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                      />
                      {/* Gentle glass reflection highlight */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <>
                      {/* Screen Header */}
                      <div className="pt-8 px-4 pb-3 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur">
                        <span className="text-xs font-medium tracking-wider uppercase font-headline text-white">
                          I Wear Organic
                        </span>
                        <span className="text-[10px] text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded-full">
                          iOS App
                        </span>
                      </div>

                      {/* App Mini Preview */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                        <div className="rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 p-3 border border-neutral-800">
                          <div className="text-[11px] font-medium text-white">New Drop: Vintage Racing & Hoodies</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">Explore the Tennessee-crafted catalog.</div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-16 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center gap-2 p-2">
                            <div className="w-12 h-12 rounded bg-neutral-800 shrink-0 flex items-center justify-center text-[10px] font-medium text-neutral-300">
                              HOODIE
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-medium text-white truncate">Organic Essential Hoodie</div>
                              <div className="text-[10px] text-neutral-400">$45.71 · Pullover</div>
                            </div>
                          </div>

                          <div className="h-16 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center gap-2 p-2">
                            <div className="w-12 h-12 rounded bg-neutral-800 shrink-0 flex items-center justify-center text-[10px] font-medium text-neutral-300">
                              CREW
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-medium text-white truncate">Racing Stripe Sweatshirt</div>
                              <div className="text-[10px] text-neutral-400">$45.00 · Vintage</div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom CTA on mock screen */}
                        <div className="pt-2 text-center">
                          <div className="w-full py-2 rounded-xl bg-white text-black text-xs font-medium tracking-wide shadow-md group-hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-red-500" />
                            Open on App Store
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
