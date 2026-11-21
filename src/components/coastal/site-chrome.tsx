'use client';

import { usePathname } from 'next/navigation';
import { ShopShell } from '@/components/coastal/shop-shell';

/**
 * Homepage renders its own masthead/footer.
 * All other routes use Option B shop chrome (Coastal Analog 3.2).
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCoastalHome = pathname === '/';

  if (isCoastalHome) {
    return <>{children}</>;
  }

  return <ShopShell>{children}</ShopShell>;
}
