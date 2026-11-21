/**
 * Stripe webhook order guard — duplicate-delivery / idempotency helpers.
 * Used by `/api/webhook/stripe` so sandbox E2E can assert behavior without
 * charging cards or calling Printify.
 */

export type WebhookOrderSnapshot = {
  status?: string;
  printifyOrderId?: string | null;
  stripeEventIds?: string[] | null;
};

/**
 * True when checkout.session.completed has already fulfilled this order.
 * Matches production guard: paid + printifyOrderId present → skip re-send.
 */
export function isOrderAlreadyFulfilled(
  orderData: WebhookOrderSnapshot | null | undefined
): boolean {
  if (!orderData) return false;
  return orderData.status === 'paid' && Boolean(orderData.printifyOrderId);
}

/**
 * True when this exact Stripe event id was already recorded on the order.
 * Optional second-line defense; production may not persist event ids yet.
 */
export function wasStripeEventProcessed(
  orderData: WebhookOrderSnapshot | null | undefined,
  eventId: string | null | undefined
): boolean {
  if (!orderData || !eventId) return false;
  const ids = orderData.stripeEventIds;
  return Array.isArray(ids) && ids.includes(eventId);
}

/**
 * Combined skip decision for webhook handlers.
 */
export function shouldSkipWebhookFulfillment(
  orderData: WebhookOrderSnapshot | null | undefined,
  eventId?: string | null
): { skip: boolean; reason: 'already-fulfilled' | 'event-replay' | null } {
  if (isOrderAlreadyFulfilled(orderData)) {
    return { skip: true, reason: 'already-fulfilled' };
  }
  if (wasStripeEventProcessed(orderData, eventId)) {
    return { skip: true, reason: 'event-replay' };
  }
  return { skip: false, reason: null };
}
