'use client';

import { EditorialNav } from '@/components/coastal/editorial-nav';
import { EditorialFooter } from '@/components/coastal/editorial-footer';
import { SkipLink } from '@/components/coastal/skip-link';

/** Shared Option B chrome for shop + support surfaces. */
export function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linen text-mineral-ink">
      <SkipLink />
      <EditorialNav />
      <div id="main-content" className="min-h-[70vh]">
        {children}
      </div>
      <EditorialFooter />
    </div>
  );
}
