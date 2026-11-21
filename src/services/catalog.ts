import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Product, ServiceMeta } from './types';
import { FIXTURE_PRODUCTS } from './fixtures';
import { mapPrintifyProduct } from './map-printify-product';

export interface CatalogService {
  listProducts(): Promise<{ products: Product[]; meta: ServiceMeta }>;
  getProductById(id: string): Promise<{ product: Product | null; meta: ServiceMeta }>;
}

export { mapPrintifyProduct } from './map-printify-product';

/** Shared across /men, /women, /shopping, /new-arrivals — short TTL keeps PLP nav soft. */
const CATALOG_LIST_REVALIDATE_SECONDS = 120;

function hasPrintifyCredentials(): boolean {
  return Boolean(process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_API_KEY);
}

/**
 * Fixtures are for local/dev only unless explicitly opted in.
 * Production storefronts must never silently merchandise fixture SKUs.
 */
function allowCatalogFixtures(): boolean {
  if (process.env.ALLOW_CATALOG_FIXTURES === 'true') return true;
  if (process.env.ALLOW_CATALOG_FIXTURES === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

function fixtureCatalogResult() {
  return {
    products: FIXTURE_PRODUCTS,
    meta: { usingFixtures: true as const, catalogUnavailable: false as const },
  };
}

function unavailableCatalogResult() {
  console.warn(
    '[catalogService] Live catalog unavailable — fixtures withheld (not a production catalog).'
  );
  return {
    products: [] as Product[],
    meta: { usingFixtures: false as const, catalogUnavailable: true as const },
  };
}

/**
 * Live Printify shop listing — cached so Men ↔ Women (and other PLPs) share one
 * catalog fetch instead of re-paging Printify on every soft navigation.
 *
 * Root layout uses `force-dynamic`, which disables the default fetch Data Cache;
 * `unstable_cache` still works in that mode. Empty/error results are thrown so
 * they are not memoized as a successful empty shop.
 */
const getCachedLiveCatalog = unstable_cache(
  async (): Promise<{ products: Product[]; meta: ServiceMeta }> => {
    const { fetchPrintifyProducts } = await import('@/ai/flows/printify-products');
    const raw = await fetchPrintifyProducts();
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new Error('Printify returned empty catalog');
    }
    return {
      products: raw.map(mapPrintifyProduct),
      meta: { usingFixtures: false, catalogUnavailable: false },
    };
  },
  ['catalog-service-list-products'],
  {
    revalidate: CATALOG_LIST_REVALIDATE_SECONDS,
    tags: ['catalog'],
  }
);

async function listProductsImpl(): Promise<{ products: Product[]; meta: ServiceMeta }> {
  if (!hasPrintifyCredentials()) {
    console.warn(
      '[catalogService] PRINTIFY_API_TOKEN/KEY missing — development fixtures only (not production inventory).'
    );
    return allowCatalogFixtures() ? fixtureCatalogResult() : unavailableCatalogResult();
  }

  try {
    return await getCachedLiveCatalog();
  } catch (error) {
    console.warn('[catalogService] Live catalog unavailable.', error);
  }

  return allowCatalogFixtures() ? fixtureCatalogResult() : unavailableCatalogResult();
}

/**
 * Catalog service — live Printify is primary when credentials/API succeed.
 * Fixture fallback is labeled via meta.usingFixtures and must never be presented as production inventory.
 * Production (or ALLOW_CATALOG_FIXTURES=false) returns an empty unavailable catalog instead of fixtures.
 *
 * `listProducts` is React-cached per request so homepage / collections share one call,
 * and Data-cached across requests (see getCachedLiveCatalog) for PLP audience switches.
 */
export const catalogService: CatalogService = {
  listProducts: cache(listProductsImpl),

  async getProductById(id: string) {
    // Fixture IDs never hit Printify — only resolve when fixtures are allowed.
    if (id.startsWith('fixture-')) {
      if (!allowCatalogFixtures()) {
        return {
          product: null,
          meta: { usingFixtures: false, catalogUnavailable: true },
        };
      }
      const fixture = FIXTURE_PRODUCTS.find((p) => p.id === id) ?? null;
      return { product: fixture, meta: { usingFixtures: true, catalogUnavailable: false } };
    }

    if (!hasPrintifyCredentials()) {
      if (!allowCatalogFixtures()) {
        return {
          product: null,
          meta: { usingFixtures: false, catalogUnavailable: true },
        };
      }
      const fixture = FIXTURE_PRODUCTS.find((p) => p.id === id) ?? null;
      return { product: fixture, meta: { usingFixtures: true, catalogUnavailable: false } };
    }

    try {
      const { fetchPrintifyProductById } = await import('@/ai/flows/printify-products');
      const raw = await fetchPrintifyProductById(id);
      if (raw) {
        return {
          product: mapPrintifyProduct(raw),
          meta: { usingFixtures: false, catalogUnavailable: false },
        };
      }
    } catch (error) {
      console.warn('[catalogService] Live product fetch failed.', error);
    }

    if (!allowCatalogFixtures()) {
      return {
        product: null,
        meta: { usingFixtures: false, catalogUnavailable: true },
      };
    }

    const fixture = FIXTURE_PRODUCTS.find((p) => p.id === id) ?? null;
    return {
      product: fixture,
      meta: { usingFixtures: Boolean(fixture), catalogUnavailable: false },
    };
  },
};
