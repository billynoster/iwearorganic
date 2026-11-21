import type { Product } from '@/services/types';
import { matchesSearchQuery, scoreSearchMatch } from '@/lib/search-utils';

/** Map Printify API payloads (or fixtures) into domain Product rows for client search. */
export function mapRawProducts(raw: unknown[]): Product[] {
  return raw.map((entry: any) => ({
    id: String(entry.id),
    title: entry.title,
    description: entry.description || '',
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    images: (entry.images || []).map((img: any, i: number) => ({
      src: img.src,
      alt: `${entry.title} ${i + 1}`,
      isDefault: Boolean(img.is_default ?? img.isDefault),
      isPlaceholder: Boolean(img.isPlaceholder),
      variantIds: Array.isArray(img.variant_ids)
        ? img.variant_ids.map((id: string | number) => String(id))
        : img.variantIds,
    })),
    variants: (entry.variants || []).map((v: any) => ({
      id: String(v.id),
      title: v.title,
      priceCents: Number(v.price ?? v.priceCents),
      isAvailable: v.is_available !== false && v.isAvailable !== false,
      isEnabled: v.is_enabled !== false && v.isEnabled !== false,
      optionValues: v.optionValues || {},
    })),
    options: entry.options,
    collectionIds: entry.collectionIds,
  }));
}

function allowClientCatalogFixtures(): boolean {
  // Inlined at build time for client bundles — production builds never silent-fixture.
  return process.env.NODE_ENV !== 'production';
}

export async function loadSearchCatalog(): Promise<{
  products: Product[];
  usingFixtures: boolean;
  catalogUnavailable?: boolean;
}> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const raw = await res.json();
      if (Array.isArray(raw) && raw.length > 0) {
        return { products: mapRawProducts(raw), usingFixtures: false };
      }
    }
  } catch {
    /* fall through */
  }

  if (!allowClientCatalogFixtures()) {
    return { products: [], usingFixtures: false, catalogUnavailable: true };
  }

  const { FIXTURE_PRODUCTS } = await import('@/services/fixtures');
  return { products: FIXTURE_PRODUCTS, usingFixtures: true };
}

export function rankSearchResults(products: Product[], query: string): Product[] {
  const q = query.trim();
  if (!q) return products;
  return products
    .filter((p) => matchesSearchQuery(p, q))
    .map((p) => ({ product: p, score: scoreSearchMatch(p, q) }))
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title))
    .map((entry) => entry.product);
}
