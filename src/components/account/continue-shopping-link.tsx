'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Charcoal text link for guest exit from auth surfaces.
 * Not a second primary CTA — underline + focus ring only.
 */
export function ContinueShoppingLink({
  href,
  className,
  children = 'Continue shopping',
  showArrow = false,
}: {
  href: string;
  className?: string;
  children?: React.ReactNode;
  showArrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-11 items-center font-body text-sm font-medium text-mineral-ink underline underline-offset-4 decoration-mineral-ink/35 transition-colors hover:decoration-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
        className
      )}
    >
      {children}
      {showArrow ? <span aria-hidden="true"> →</span> : null}
    </Link>
  );
}

export function GuestBrowsingFooter({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <div className={cn('border-t border-oat pt-6 pb-2', className)}>
      <p className="font-body text-sm leading-relaxed text-mineral-ink/60">
        Just browsing?{' '}
        <ContinueShoppingLink href={href} className="min-h-0 py-0 align-baseline" />
      </p>
      <p className="mt-3 font-body text-xs leading-relaxed text-mineral-ink/50">
        An account is never required to shop or check out.
      </p>
    </div>
  );
}
