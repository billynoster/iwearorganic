import type { Cart, CartLine, ServiceMeta } from './types';

/**
 * Cart service interface.
 * Phase 1 homepage does not mutate cart; existing `CartProvider` remains the live UI store.
 * This module defines the contract for future Coastal Analog cart pages.
 */

const memoryCarts = new Map<string, Cart>();

export interface CartService {
  getCart(cartId: string): Promise<{ cart: Cart; meta: ServiceMeta }>;
  upsertLine(
    cartId: string,
    line: CartLine
  ): Promise<{ cart: Cart; meta: ServiceMeta }>;
  removeLine(
    cartId: string,
    variantId: string
  ): Promise<{ cart: Cart; meta: ServiceMeta }>;
  clear(cartId: string): Promise<{ cart: Cart; meta: ServiceMeta }>;
}

function emptyCart(cartId: string): Cart {
  return { id: cartId, lines: [], updatedAt: new Date().toISOString() };
}

export const cartService: CartService = {
  async getCart(cartId) {
    const cart = memoryCarts.get(cartId) ?? emptyCart(cartId);
    return { cart, meta: { usingFixtures: true } };
  },

  async upsertLine(cartId, line) {
    const current = memoryCarts.get(cartId) ?? emptyCart(cartId);
    const others = current.lines.filter((l) => l.variantId !== line.variantId);
    const next: Cart = {
      id: cartId,
      lines: [...others, line],
      updatedAt: new Date().toISOString(),
    };
    memoryCarts.set(cartId, next);
    return { cart: next, meta: { usingFixtures: true } };
  },

  async removeLine(cartId, variantId) {
    const current = memoryCarts.get(cartId) ?? emptyCart(cartId);
    const next: Cart = {
      id: cartId,
      lines: current.lines.filter((l) => l.variantId !== variantId),
      updatedAt: new Date().toISOString(),
    };
    memoryCarts.set(cartId, next);
    return { cart: next, meta: { usingFixtures: true } };
  },

  async clear(cartId) {
    const next = emptyCart(cartId);
    memoryCarts.set(cartId, next);
    return { cart: next, meta: { usingFixtures: true } };
  },
};
