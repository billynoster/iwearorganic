/**
 * Coastal Analog — Printify shop category taxonomy (Phase 6B).
 *
 * Stable IDs are catalog-derived slugs used in `?category=` and filter state.
 * Membership is resolved from product tags (including `ca-cat:{id}` written at
 * Printify map time). Do not use free-form title strings as filter keys.
 *
 * Taxonomy inspected from the BLEND / Printify shop catalog surface in
 * `src/ai/flows/printify-products.ts` (dresses, swim, yoga/active, sweatshirts,
 * hoodies, tees/tanks) plus Women rail examples (skirts).
 */

export type CategoryId =
  | 'dresses'
  | 'skirts'
  | 'swimwear'
  | 'yoga'
  | 'sweatshirts'
  | 'hoodies'
  | 't-shirts'
  | 'outerwear'
  | 'accessories';

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  /** Normalized tag tokens that map to this category (no spaces; kebab or plain). */
  tagAliases: string[];
  /**
   * Closed keyword patterns used only when normalizing untagged Printify rows
   * onto a stable `ca-cat:{id}` tag at catalog map time — never as a live
   * URL/filter key.
   */
  classifyPatterns: RegExp[];
}

/** Explicit tag written onto products so runtime resolution stays tag-based. */
export const CATEGORY_TAG_PREFIX = 'ca-cat:';

/**
 * Canonical order. Women example rail:
 * All | Dresses | Skirts | Swimwear | Yoga | Sweatshirts | Hoodies | T-Shirts
 */
export const CATEGORY_TAXONOMY: CategoryDefinition[] = [
  {
    id: 'dresses',
    label: 'Dresses',
    tagAliases: ['dresses', 'dress', 'racerback-dress'],
    classifyPatterns: [/\bdresses?\b/i, /\bracerback\s+dress\b/i],
  },
  {
    id: 'skirts',
    label: 'Skirts',
    tagAliases: ['skirts', 'skirt'],
    classifyPatterns: [/\bskirts?\b/i],
  },
  {
    id: 'swimwear',
    label: 'Swimwear',
    tagAliases: [
      'swimwear',
      'swimsuit',
      'swimsuits',
      'bikini',
      'bikinis',
      'swim',
    ],
    classifyPatterns: [/\bswim(suit|wear)?\b/i, /\bbikini\b/i],
  },
  {
    id: 'yoga',
    label: 'Yoga',
    tagAliases: [
      'yoga',
      'leggings',
      'sports-bra',
      'sportsbra',
      'activewear',
      'active',
    ],
    classifyPatterns: [
      /\byoga\b/i,
      /\bleggings?\b/i,
      /\bsports\s*bra\b/i,
      /\bactivewear\b/i,
    ],
  },
  {
    id: 'sweatshirts',
    label: 'Sweatshirts',
    tagAliases: [
      'sweatshirts',
      'sweatshirt',
      'crew',
      'crewneck',
      'crew-neck',
      'fleece',
    ],
    classifyPatterns: [/\bsweatshirts?\b/i, /\bcrew(neck)?\b/i, /\bfleece\b/i],
  },
  {
    id: 'hoodies',
    label: 'Hoodies',
    tagAliases: ['hoodies', 'hoodie', 'pullover-hoodie'],
    classifyPatterns: [/\bhoodies?\b/i],
  },
  {
    id: 't-shirts',
    label: 'T-Shirts',
    tagAliases: [
      't-shirts',
      't-shirt',
      'tshirt',
      'tshirts',
      'tee',
      'tees',
      'tank',
      'tanks',
      'muscle-tee',
      'tank-top',
    ],
    classifyPatterns: [
      /\bt-?shirts?\b/i,
      /\btees?\b/i,
      /\btank(\s*top)?\b/i,
      /\bmuscle\b/i,
    ],
  },
  {
    id: 'outerwear',
    label: 'Outerwear',
    tagAliases: ['outerwear', 'jacket', 'jackets', 'coat', 'coats', 'parka'],
    classifyPatterns: [/\bouterwear\b/i, /\bjackets?\b/i, /\bcoats?\b/i, /\bparka\b/i],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    tagAliases: [
      'accessories',
      'accessory',
      'hat',
      'hats',
      'beanie',
      'cap',
      'bag',
      'bags',
    ],
    classifyPatterns: [
      /\baccessories\b/i,
      /\bbeanie\b/i,
      /\bhats?\b/i,
      /\bcaps?\b/i,
      /\bbags?\b/i,
    ],
  },
];

const BY_ID = new Map(CATEGORY_TAXONOMY.map((entry) => [entry.id, entry]));

export function categoryLabel(id: string): string {
  return BY_ID.get(id as CategoryId)?.label ?? id;
}

export function isCategoryId(value: string): value is CategoryId {
  return BY_ID.has(value as CategoryId);
}

/** Normalize a raw Printify / fixture tag for alias comparison. */
export function normalizeCategoryToken(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(new RegExp(`^${CATEGORY_TAG_PREFIX}`), '')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-');
}

export function categoryTagFor(id: CategoryId): string {
  return `${CATEGORY_TAG_PREFIX}${id}`;
}

/**
 * Resolve category from product tags only (stable IDs).
 * Prefers explicit `ca-cat:{id}` tags, then alias matches in taxonomy order.
 */
export function resolveCategoryIdFromTags(tags: string[]): CategoryId | null {
  if (!tags.length) return null;

  const normalized = tags.map(normalizeCategoryToken).filter(Boolean);

  for (const tag of tags) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed.startsWith(CATEGORY_TAG_PREFIX)) {
      const id = normalizeCategoryToken(trimmed);
      if (isCategoryId(id)) return id;
    }
  }

  for (const entry of CATEGORY_TAXONOMY) {
    for (const token of normalized) {
      if (entry.tagAliases.includes(token)) return entry.id;
      // Allow "women's-hoodie" style compounds
      if (entry.tagAliases.some((alias) => token === alias || token.endsWith(`-${alias}`))) {
        return entry.id;
      }
    }
  }

  return null;
}

/**
 * Closed Printify-shop classifier for untagged catalog rows.
 * Writes a stable category ID — callers should persist `ca-cat:{id}` on the product.
 */
export function classifyPrintifyCategoryId(input: {
  title?: string;
  tags?: string[];
}): CategoryId | null {
  const fromTags = resolveCategoryIdFromTags(input.tags || []);
  if (fromTags) return fromTags;

  const hay = `${input.title || ''} ${(input.tags || []).join(' ')}`.trim();
  if (!hay) return null;

  // Hoodie before sweatshirt/crew (titles may say "Hoodie Pullover")
  // T-shirt dress → dresses (dress pattern earlier in taxonomy wins via order)
  for (const entry of CATEGORY_TAXONOMY) {
    if (entry.classifyPatterns.some((pattern) => pattern.test(hay))) {
      return entry.id;
    }
  }
  return null;
}

/**
 * Ensure tags include an explicit `ca-cat:{id}` when a category can be resolved.
 * Used by Printify → Product mapping so PLP filtering stays tag/ID based.
 */
export function ensureCategoryTag(
  tags: string[],
  title?: string
): { tags: string[]; categoryId: CategoryId | null } {
  const categoryId =
    resolveCategoryIdFromTags(tags) ||
    classifyPrintifyCategoryId({ title, tags });
  if (!categoryId) return { tags, categoryId: null };

  const marker = categoryTagFor(categoryId);
  const hasMarker = tags.some(
    (tag) => tag.trim().toLowerCase() === marker.toLowerCase()
  );
  if (hasMarker) return { tags, categoryId };
  return { tags: [...tags, marker], categoryId };
}

/** Categories present in a product set, taxonomy order, with display labels. */
export function collectCatalogCategories(
  products: Array<{ tags: string[] }>
): Array<{ id: CategoryId; label: string }> {
  const present = new Set<CategoryId>();
  for (const product of products) {
    const id = resolveCategoryIdFromTags(product.tags);
    if (id) present.add(id);
  }
  return CATEGORY_TAXONOMY.filter((entry) => present.has(entry.id)).map(
    (entry) => ({ id: entry.id, label: entry.label })
  );
}
