/**
 * Just dropped — homepage strip selection + NA “New” badge eligibility.
 * Prefer release-date metadata; else explicit merchandising — never guess from titles.
 */

import type { Product } from '@/services/types';
import {
  JUST_DROPPED_MERCHANDISING_IDS,
  JUST_DROPPED_TAG,
  NEW_BADGE_MAX_AGE_DAYS,
} from '@/content/just-dropped';

const DAY_MS = 24 * 60 * 60 * 1000;

function hasJustDroppedTag(product: Product): boolean {
  return (product.tags || []).some((tag) => {
    const t = tag.trim().toLowerCase();
    return t === JUST_DROPPED_TAG || t === `ca-merch:${JUST_DROPPED_TAG}`;
  });
}

function releasedAtMs(product: Product): number | null {
  if (!product.releasedAt) return null;
  const ms = Date.parse(product.releasedAt);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Homepage strip: 3–4 products.
 * 1) Any products with valid `releasedAt` → newest first
 * 2) Else products with explicit `just-dropped` tag
 * 3) Else explicit merchandising ID list (fixtures / curated)
 */
export function selectJustDroppedProducts(
  products: Product[],
  limit = 4
): Product[] {
  const max = Math.min(4, Math.max(1, limit));

  const dated = products
    .map((product) => ({ product, ms: releasedAtMs(product) }))
    .filter((row): row is { product: Product; ms: number } => row.ms != null)
    .sort((a, b) => b.ms - a.ms)
    .map((row) => row.product);

  if (dated.length > 0) {
    return dated.slice(0, max);
  }

  const tagged = products.filter(hasJustDroppedTag);
  if (tagged.length > 0) {
    return tagged.slice(0, max);
  }

  const merch: Product[] = [];
  for (const id of JUST_DROPPED_MERCHANDISING_IDS) {
    const match = products.find((product) => product.id === id);
    if (match) merch.push(match);
    if (merch.length >= max) break;
  }
  return merch;
}

/** Subtle NA “New” badge — data-driven only (date window, tag, or merch list). */
export function productHasNewBadge(product: Product): boolean {
  if (hasJustDroppedTag(product)) return true;

  const ms = releasedAtMs(product);
  if (ms != null) {
    const age = Date.now() - ms;
    return age >= 0 && age <= NEW_BADGE_MAX_AGE_DAYS * DAY_MS;
  }

  return (JUST_DROPPED_MERCHANDISING_IDS as readonly string[]).includes(
    product.id
  );
}
