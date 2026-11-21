import type { AuthUser, ServiceMeta } from './types';

export interface AuthService {
  /**
   * Resolve current user from the Firebase client layer when available.
   * Presentation components should prefer existing `useUser()` hooks;
   * this interface isolates auth for future non-UI callers.
   */
  getCurrentUser(): Promise<{ user: AuthUser; meta: ServiceMeta }>;
}

export const authService: AuthService = {
  async getCurrentUser() {
    // Browser-only; server callers receive null without privileged credentials.
    if (typeof window === 'undefined') {
      return { user: null, meta: { usingFixtures: false } };
    }
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const u = auth.currentUser;
      if (!u) return { user: null, meta: { usingFixtures: false } };
      return {
        user: {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          isAnonymous: u.isAnonymous,
        },
        meta: { usingFixtures: false },
      };
    } catch {
      return { user: null, meta: { usingFixtures: false } };
    }
  },
};
