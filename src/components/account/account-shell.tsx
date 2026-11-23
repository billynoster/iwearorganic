'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/account', label: 'Overview', exact: true },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
];

export function AccountShell({
  title,
  description,
  email,
  children,
}: {
  title: string;
  description?: string;
  email?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="bg-cotton text-mineral-ink">
      <header className="border-b border-oat/70">
        <div className="ca-container py-10 sm:py-12">
          <p className="ca-eyebrow mb-3 text-forest">I Wear Organic</p>
          <h1 className="ca-editorial-display text-editorial-section text-mineral-ink">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-xl font-body text-base leading-relaxed text-mineral-ink/70">
              {description}
            </p>
          ) : null}
          {email ? (
            <p className="mt-2 font-body text-sm text-mineral-ink/55">{email}</p>
          ) : null}
        </div>
      </header>

      <div className="ca-container py-6 sm:py-8">
        <nav
          className="flex flex-wrap gap-x-8 gap-y-2 border-b border-oat/70 pb-4"
          aria-label="Account"
        >
          {TABS.map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'relative pb-3 font-body text-sm font-medium tracking-[0.01em] transition-colors',
                  active
                    ? 'text-mineral-ink'
                    : 'text-mineral-ink/55 hover:text-mineral-ink'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {tab.label}
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-px w-full bg-mineral-ink transition-opacity',
                    active ? 'opacity-100' : 'opacity-0'
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 sm:pt-10">{children}</div>
      </div>
    </main>
  );
}
