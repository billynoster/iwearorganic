'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { CartSheet } from '@/components/shopping/cart-sheet';
import { SearchTypeahead } from '@/components/coastal/search-typeahead';
import { AccountMenu } from '@/components/coastal/account-menu';

const NAV_LINKS = [
  { href: '/men', label: 'Men' },
  { href: '/women', label: 'Women' },
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/lookbook', label: 'Lookbook' },
];

function isNavActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function EditorialNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const mobileNavId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc close + focus first link when opening; return focus to menu button on close
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstMobileLinkRef.current?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Opaque sticky masthead — translucent linen + blur let gallery/thumbs show through on scroll.
  return (
    <header className="sticky top-0 z-50 border-b border-oat/70 bg-linen">
      <div className="ca-container relative flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Link
          href="/"
          className="font-brand text-[1.125rem] font-bold lowercase tracking-[-0.01em] text-mineral-ink sm:text-[1.1875rem]"
          aria-label="I Wear Organic home"
        >
          i wear organic.
        </Link>

        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-9 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'relative font-body text-[0.8125rem] font-medium tracking-[0.01em] transition-colors',
                  active
                    ? 'text-mineral-ink'
                    : 'text-mineral-ink/65 hover:text-mineral-ink'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-px w-full bg-mineral-ink transition-opacity',
                    active ? 'opacity-100' : 'opacity-0'
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <p className="ca-editorial hidden text-[0.8125rem] leading-snug text-mineral-ink/50 xl:block">
            Easy to wear. Hard to overlook.
          </p>

          <SearchTypeahead
            onOpenChange={(isOpen) => {
              if (isOpen) setOpen(false);
            }}
          />

          <div
            className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
            aria-hidden="true"
          >
            <CartSheet />
          </div>
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center text-mineral-ink/80 transition-colors hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
            aria-label={`Open shopping bag${cartCount ? `, ${cartCount} items` : ''}`}
          >
            <ShoppingBag className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} />
            {cartCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mineral-ink px-1 font-body text-[0.625rem] text-linen">
                {cartCount}
              </span>
            ) : null}
          </button>
          <Link
            href="/cart"
            className="ca-eyebrow hidden min-h-11 items-center text-mineral-ink/60 hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue sm:inline-flex"
          >
            Bag
          </Link>
          <AccountMenu className="hidden sm:inline-flex" />
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen md:hidden"
            aria-expanded={open}
            aria-controls={mobileNavId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id={mobileNavId}
        className={cn(
          'border-t border-oat bg-linen md:hidden',
          open ? 'block' : 'hidden'
        )}
      >
        <nav className="ca-container flex flex-col py-4" aria-label="Mobile">
          {NAV_LINKS.map((link, index) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.label}
                ref={index === 0 ? firstMobileLinkRef : undefined}
                href={link.href}
                className={cn(
                  'min-h-11 border-l-2 py-3 pl-4 font-body text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue',
                  active
                    ? 'border-mineral-ink text-mineral-ink'
                    : 'border-transparent text-mineral-ink/80'
                )}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
                {active ? <span className="sr-only"> (current)</span> : null}
              </Link>
            );
          })}
          <Link
            href="/search"
            className="min-h-11 py-3 font-body text-sm font-medium text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            onClick={() => setOpen(false)}
          >
            Search
          </Link>
          <button
            type="button"
            className="min-h-11 py-3 text-left font-body text-sm font-medium text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            onClick={() => {
              setOpen(false);
              openCart();
            }}
          >
            Bag{cartCount > 0 ? ` (${cartCount})` : ''}
          </button>
          <Link
            href="/cart"
            className="min-h-11 py-3 font-body text-sm font-medium text-mineral-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            onClick={() => setOpen(false)}
          >
            View full bag
          </Link>
          <AccountMenu variant="mobile" onNavigate={() => setOpen(false)} />
          <p className="ca-editorial pb-4 pt-4 text-sm text-mineral-ink/55">
            Easy to wear. Hard to overlook.
          </p>
        </nav>
      </div>
    </header>
  );
}
