/**
 * Safe internal destinations for “Continue shopping” from auth surfaces.
 * Blocks login/account/onboarding/api and external URLs — no open redirects.
 */

const BLOCKED_PREFIXES = [
  '/login',
  '/account',
  '/onboarding',
  '/api',
  '/profile',
  '/creator',
];

const ALLOWED_PREFIXES = [
  '/',
  '/shopping',
  '/men',
  '/women',
  '/new-arrivals',
  '/lookbook',
  '/cart',
  '/search',
  '/about',
  '/materials',
  '/contact',
  '/shipping',
  '/privacy',
  '/terms',
];

const DEFAULT_CONTINUE = '/shopping';

function normalizePath(raw: string): string | null {
  try {
    // Absolute same-origin or path-only
    const url = raw.startsWith('http')
      ? new URL(raw)
      : new URL(raw, 'https://iwearorganic.invalid');
    if (raw.startsWith('http') && typeof window !== 'undefined') {
      if (url.origin !== window.location.origin) return null;
    }
    const path = url.pathname || '/';
    if (!path.startsWith('/')) return null;
    if (path.includes('//') || path.includes('\\')) return null;
    return path + (url.search || '');
  } catch {
    return null;
  }
}

export function isSafeShoppingPath(pathnameWithSearch: string): boolean {
  const normalized = normalizePath(pathnameWithSearch);
  if (!normalized) return false;
  const path = normalized.split('?')[0] || '/';

  if (BLOCKED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return false;
  }

  if (path === '/') return true;

  return ALLOWED_PREFIXES.some(
    (p) => p !== '/' && (path === p || path.startsWith(`${p}/`))
  );
}

/**
 * Prefer an explicit `from` query, then same-origin referrer, else /shopping.
 */
export function resolveContinueShoppingHref(options?: {
  fromParam?: string | null;
  referrer?: string | null;
}): string {
  const candidates = [options?.fromParam, options?.referrer];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const path = normalizePath(candidate);
    if (path && isSafeShoppingPath(path)) {
      // Avoid landing back on checkout mid-flow from auth guest exit
      const bare = path.split('?')[0] || '/';
      if (bare === '/checkout' || bare.startsWith('/checkout/')) {
        return '/cart';
      }
      return path;
    }
  }
  return DEFAULT_CONTINUE;
}

/** Dev / local only — never fake inbox confirmation in production hosts. */
export function allowAuthInboxPreview(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') return false;
  if (process.env.NEXT_PUBLIC_APP_ENV === 'production') return false;

  const host = window.location.hostname.toLowerCase();
  if (
    host === 'iwearorganic.com' ||
    host === 'www.iwearorganic.com' ||
    host.endsWith('.iwearorganic.com')
  ) {
    return false;
  }

  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.localhost')
  );
}
