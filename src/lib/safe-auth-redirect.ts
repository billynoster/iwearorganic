import { isSafeShoppingPath } from '@/lib/safe-shopping-return';

/**
 * Post-sign-in redirect targets. Allows account routes + safe shopping paths.
 * Blocks open redirects and auth/onboarding loops.
 */
export function resolvePostSignInRedirect(raw: string | null | undefined): string {
  if (!raw) return '/';
  let path = raw;
  try {
    if (raw.startsWith('http')) {
      const url = new URL(raw);
      if (typeof window !== 'undefined' && url.origin !== window.location.origin) {
        return '/';
      }
      path = url.pathname + url.search;
    }
  } catch {
    return '/';
  }

  if (!path.startsWith('/')) return '/';
  if (path.startsWith('//')) return '/';

  const bare = path.split('?')[0] || '/';
  if (
    bare === '/login' ||
    bare.startsWith('/login/') ||
    bare === '/onboarding' ||
    bare.startsWith('/onboarding/') ||
    bare.startsWith('/api/')
  ) {
    return '/';
  }

  if (bare === '/account' || bare.startsWith('/account/')) {
    return path;
  }

  if (isSafeShoppingPath(path)) {
    return path;
  }

  return '/';
}
