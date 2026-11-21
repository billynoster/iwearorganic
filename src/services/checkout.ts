import type { CheckoutSessionRequest, CheckoutSessionResult, ServiceMeta } from './types';

/**
 * Checkout session service.
 * Wraps existing `/api/checkout`. Does not embed Stripe secrets in the browser.
 * IMPORTANT: Production hardening must re-price variants server-side before creating sessions.
 * Payment flow was NOT end-to-end verified in Phase 1.
 */

export interface CheckoutSessionService {
  createSession(
    request: CheckoutSessionRequest
  ): Promise<{ session: CheckoutSessionResult | null; meta: ServiceMeta; error?: string }>;
}

export const checkoutSessionService: CheckoutSessionService = {
  async createSession(request) {
    if (typeof window === 'undefined') {
      return {
        session: null,
        meta: { usingFixtures: false },
        error: 'Checkout session creation must run in the browser against /api/checkout',
      };
    }

    try {
      // Legacy route expects full cart item payloads; Phase 1 interface accepts line ids.
      // Callers integrating with CartProvider should pass enriched items via a dedicated adapter.
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: request.orderId,
          // Placeholder shape — live checkout page still uses CartProvider items directly.
          items: request.lines,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          session: null,
          meta: { usingFixtures: false },
          error: data.error || 'Failed to create checkout session',
        };
      }
      return {
        session: { url: data.url, sessionId: data.id },
        meta: { usingFixtures: false },
      };
    } catch (error: any) {
      return {
        session: null,
        meta: { usingFixtures: false },
        error: error?.message || 'Checkout request failed',
      };
    }
  },
};
