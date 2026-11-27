'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { ensureUserProfile } from '@/lib/ensure-user-profile';
import { resolveContinueShoppingHref } from '@/lib/safe-shopping-return';
import { ContinueShoppingLink } from '@/components/account/continue-shopping-link';

/**
 * Soft gate for Account screens only — storefront never uses this.
 * Phase 8B.1: compact invitation; clear Continue shopping text link.
 */
export function RequireSignedIn({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [continueHref, setContinueHref] = useState('/shopping');

  useEffect(() => {
    if (isUserLoading) return;
    if (user && !user.isAnonymous) {
      void ensureUserProfile(firestore, user);
    }
  }, [user, isUserLoading, firestore]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setContinueHref(
      resolveContinueShoppingHref({
        referrer: document.referrer || null,
      })
    );
  }, []);

  if (isUserLoading) {
    return (
      <main className="bg-cotton text-mineral-ink">
        <div className="ca-container flex min-h-[32vh] items-center justify-center px-4 py-12">
          <p className="font-body text-sm text-mineral-ink/60">Loading account…</p>
        </div>
      </main>
    );
  }

  if (!user || user.isAnonymous) {
    const redirect = pathname || '/account';
    return (
      <main className="bg-cotton text-mineral-ink">
        <div className="ca-container flex justify-center px-4 pb-16 pt-10 sm:pb-20 sm:pt-12">
          <div className="w-full max-w-[440px]">
            <h1 className="ca-editorial-display text-editorial-section text-mineral-ink">
              A little more personal.
            </h1>
            <p className="mt-4 font-body text-base leading-relaxed text-mineral-ink/70">
              Sign in to see your orders and saved details. No account needed to
              keep shopping.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <Link
                href={`/login?redirect=${encodeURIComponent(redirect)}`}
                className="ca-btn-primary w-full justify-center"
              >
                Sign in
              </Link>
              <ContinueShoppingLink
                href={continueHref}
                showArrow
                className="w-full justify-center sm:w-auto sm:justify-start"
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
