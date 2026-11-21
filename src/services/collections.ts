import type { Collection, Product, ServiceMeta } from './types';
import { FIXTURE_COLLECTIONS } from './fixtures';
import { catalogService } from './catalog';
import { productMatchesAudience } from '@/lib/audience-taxonomy';

export interface CollectionsService {
  listCollections(): Promise<{ collections: Collection[]; meta: ServiceMeta }>;
  getCollectionProducts(
    slug: string
  ): Promise<{ products: Product[]; meta: ServiceMeta }>;
}

function filterByCollection(products: Product[], slug: string, usingFixtures: boolean): Product[] {
  if (slug === 'new-arrivals') {
    // Prefer explicit collection membership when present (fixtures + future live taxonomy).
    const withCollectionIds = products.filter((p) =>
      p.collectionIds?.includes('new-arrivals')
    );
    if (usingFixtures || withCollectionIds.length > 0) {
      if (usingFixtures) return withCollectionIds;
      if (withCollectionIds.length > 0) return withCollectionIds;
    }
    // Live catalog without taxonomy: surface full shop until Printify collection IDs exist.
    return products;
  }

  /**
   * Men / Women PLPs: same soft audience as New Arrivals Women/Men chips.
   * Includes unisex / shared fits (e.g. zip hoodie titled Unisex). Exclusive
   * "| Men" / "| Women" titles win over Printify blank dual gender tags via
   * `getProductGenderEligibility` inside audience taxonomy.
   */
  if (slug === 'menswear') {
    return products.filter((p) => productMatchesAudience(p, 'men'));
  }

  if (slug === 'womenswear') {
    return products.filter((p) => productMatchesAudience(p, 'women'));
  }

  // Prefer explicit collection membership for other editorial slugs.
  const withCollectionIds = products.filter((p) => p.collectionIds?.includes(slug));
  if (usingFixtures || withCollectionIds.length > 0) {
    if (usingFixtures) {
      return products.filter((p) => p.collectionIds?.includes(slug));
    }
    if (withCollectionIds.length > 0) {
      return withCollectionIds;
    }
  }

  const needle = slug.replace(/-/g, ' ');
  return products.filter((p) =>
    `${p.title} ${p.tags.join(' ')}`.toLowerCase().includes(needle)
  );
}

export const collectionsService: CollectionsService = {
  async listCollections() {
    // Editorial taxonomy entries; product membership comes from live catalog when available.
    const { meta } = await catalogService.listProducts();
    return {
      // Editorial collection tiles (Men / Women / New Arrivals) ship with Billy photography.
      collections: FIXTURE_COLLECTIONS,
      meta: {
        usingFixtures: meta.usingFixtures,
        catalogUnavailable: meta.catalogUnavailable,
      },
    };
  },

  async getCollectionProducts(slug) {
    const { products, meta } = await catalogService.listProducts();
    const filtered = filterByCollection(products, slug, meta.usingFixtures);
    return { products: filtered, meta };
  },
};
