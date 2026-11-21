/**
 * Everyday Uniform homepage curation — Phase 6C.
 * Prefer explicit `everyday-uniform` collection membership, then newest
 * `releasedAt` when present. Never invent ranking from titles.
 */

import type { Product } from '@/services/types';

export function selectEverydayUniformProducts(
  products: Product[],
  limit = 4
): Product[] {
  const tagged = products.filter((p) =>
    p.collectionIds?.includes('everyday-uniform')
  );
  const pool = tagged.length >= limit ? tagged : products;

  const sorted = [...pool].sort((a, b) => {
    const am = a.releasedAt ? Date.parse(a.releasedAt) : 0;
    const bm = b.releasedAt ? Date.parse(b.releasedAt) : 0;
    if (am || bm) return bm - am;
    return 0;
  });

  return sorted.slice(0, limit);
}
