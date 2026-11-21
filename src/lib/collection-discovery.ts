/**
 * Collection Discovery — shared filter/search/sort model for collection PLPs.
 * Products first. Controls when needed. (product-discovery-ux-spec.md)
 * Phase 6B: category rail uses stable Printify taxonomy IDs (`?category=`).
 */

import type { Product, ProductVariant } from '@/services/types';
import {
  variantColor,
  variantSize,
} from '@/lib/variant-options';
import {
  categoryLabel,
  collectCatalogCategories,
  resolveCategoryIdFromTags,
  type CategoryId,
} from '@/lib/category-taxonomy';
import {
  parseAudienceParam,
  productMatchesAudience,
  type DiscoveryAudience,
} from '@/lib/audience-taxonomy';

export {
  variantColor,
  variantSize,
} from '@/lib/variant-options';

export type { CategoryId };
export type { DiscoveryAudience };
export { categoryLabel, collectCatalogCategories, productMatchesAudience };

export type DiscoverySort = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export type AvailabilityFilter = 'all' | 'in-stock';

export interface DiscoveryState {
  q: string | null;
  /**
   * New Arrivals Level 1 audience (`?audience=`).
   * Default `all`. Ignored on non–New Arrivals PLPs unless audienceMode is on.
   */
  audience: DiscoveryAudience;
  categories: string[];
  colors: string[];
  sizes: string[];
  /** Dollars — inclusive bounds when set. */
  minPrice: number | null;
  maxPrice: number | null;
  availability: AvailabilityFilter;
  sort: DiscoverySort;
  page: number;
}

export const EMPTY_DISCOVERY_STATE: DiscoveryState = {
  q: null,
  audience: 'all',
  categories: [],
  colors: [],
  sizes: [],
  minPrice: null,
  maxPrice: null,
  availability: 'all',
  sort: 'featured',
  page: 1,
};

export const DISCOVERY_SORT_OPTIONS: Array<{ id: DiscoverySort; label: string }> = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
];

export const PAGE_SIZE = 8;

export type ColorFamily =
  | 'Black'
  | 'White'
  | 'Gray'
  | 'Blue'
  | 'Green'
  | 'Red / Pink'
  | 'Brown'
  | 'Neutral'
  | 'Other';

const FAMILY_ORDER: ColorFamily[] = [
  'Black',
  'White',
  'Gray',
  'Blue',
  'Green',
  'Red / Pink',
  'Brown',
  'Neutral',
  'Other',
];

const FAMILY_RULES: Array<{ family: ColorFamily; pattern: RegExp }> = [
  { family: 'Black', pattern: /\b(black|charcoal|mineral|ink|obsidian|noir)\b/i },
  { family: 'White', pattern: /\b(white|ivory|cream|antique\s*white)\b/i },
  {
    family: 'Gray',
    pattern: /\b(gray|grey|slate|stone|fog|mist|ash|silver|heather)\b/i,
  },
  {
    family: 'Blue',
    pattern: /\b(blue|navy|haze|coastal|indigo|denim|sky|teal|aqua)\b/i,
  },
  {
    family: 'Green',
    pattern: /\b(green|sage|olive|moss|forest|emerald)\b/i,
  },
  {
    family: 'Red / Pink',
    pattern: /\b(red|pink|rose|ember|crimson|cherry|burgundy|blush|coral)\b/i,
  },
  {
    family: 'Brown',
    pattern: /\b(brown|terracotta|clay|sand|tan|taupe|mocha|camel|umber)\b/i,
  },
  {
    family: 'Neutral',
    pattern: /\b(oat|linen|beige|khaki|natural|nude|bone|ecru|wheat)\b/i,
  },
];

const SWATCH_FALLBACKS: Record<string, string> = {
  oat: '#DDD4C9',
  mineral: '#303435',
  haze: '#91A7AF',
  dusk: '#BFA4A1',
  linen: '#F4F1EB',
  black: '#303435',
  white: '#F7F4EF',
  navy: '#3D4A5C',
  sage: '#8A9A7B',
  olive: '#6E6B4F',
  terracotta: '#B56A4E',
  sand: '#C4B5A0',
  rose: '#C9A8A6',
  charcoal: '#3A3C3D',
  ivory: '#F3EDE3',
  clay: '#A88878',
  mist: '#B7C4C8',
  stone: '#9A938A',
  fog: '#A8B0B3',
  ember: '#A85C4A',
  coastal: '#7E96A0',
  slate: '#6B7C7E',
};

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'ONE SIZE'];

export function colorFamilyFor(name: string): ColorFamily {
  for (const rule of FAMILY_RULES) {
    if (rule.pattern.test(name)) return rule.family;
  }
  return 'Other';
}

/**
 * Resolve a display hex for a color name.
 * Prefer catalog hex; otherwise map known brand/fixture color names only.
 * Returns undefined when no trustworthy mapping exists (do not invent a hue).
 */
export function resolveColorSwatchHex(
  name: string,
  catalogHex?: string
): string | undefined {
  if (catalogHex) return catalogHex;
  const key = name.trim().toLowerCase();
  if (SWATCH_FALLBACKS[key]) return SWATCH_FALLBACKS[key];
  for (const [token, hex] of Object.entries(SWATCH_FALLBACKS)) {
    if (key.includes(token)) return hex;
  }
  return undefined;
}

/** Filter/PLP helper — always returns a fill; unknowns fall back to oat. */
export function colorSwatchHex(name: string, catalogHex?: string): string {
  return resolveColorSwatchHex(name, catalogHex) ?? '#DDD4C9';
}

export function productColors(product: Product): string[] {
  const fromOptions =
    product.options
      ?.find((o) => /color|colour/i.test(o.name))
      ?.values.map((v) => v.title) || [];
  if (fromOptions.length) return fromOptions;
  const set = new Set<string>();
  for (const variant of product.variants) {
    const c = variantColor(variant);
    if (c) set.add(c);
  }
  return Array.from(set);
}

export function productSizes(product: Product): string[] {
  const fromOptions =
    product.options
      ?.find((o) => /size/i.test(o.name))
      ?.values.map((v) => v.title) || [];
  if (fromOptions.length) return fromOptions;
  const set = new Set<string>();
  for (const variant of product.variants) {
    const s = variantSize(variant);
    if (s) set.add(s);
  }
  return Array.from(set);
}

/**
 * Stable category ID for a product (tag/taxonomy based — not title matching).
 * Returns null when the catalog row has no resolvable category tag.
 */
export function productCategoryId(product: Product): CategoryId | null {
  return resolveCategoryIdFromTags(product.tags);
}

/** @deprecated Prefer productCategoryId + categoryLabel for display. */
export function productCategory(product: Product): string | null {
  const id = productCategoryId(product);
  return id ? categoryLabel(id) : null;
}

export function productUnitPriceCents(product: Product): number | null {
  const enabled =
    product.variants.find((v) => v.isEnabled && v.isAvailable) ||
    product.variants.find((v) => v.isEnabled) ||
    product.variants[0];
  return typeof enabled?.priceCents === 'number' ? enabled.priceCents : null;
}

function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });
}

export function collectDiscoveryFacets(products: Product[]) {
  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();
  const colorHex = new Map<string, string>();
  let minCents = Number.POSITIVE_INFINITY;
  let maxCents = 0;

  for (const product of products) {
    for (const color of productColors(product)) {
      colorSet.add(color);
      const opt = product.options
        ?.find((o) => /color|colour/i.test(o.name))
        ?.values.find((v) => v.title === color);
      if (opt?.colors?.[0] && !colorHex.has(color)) {
        colorHex.set(color, opt.colors[0]);
      }
    }
    for (const size of productSizes(product)) sizeSet.add(size);
    for (const variant of product.variants) {
      if (typeof variant.priceCents === 'number') {
        minCents = Math.min(minCents, variant.priceCents);
        maxCents = Math.max(maxCents, variant.priceCents);
      }
    }
  }

  const colors = Array.from(colorSet).sort((a, b) => a.localeCompare(b));
  const byFamily = new Map<ColorFamily, string[]>();
  for (const family of FAMILY_ORDER) byFamily.set(family, []);
  for (const color of colors) {
    const family = colorFamilyFor(color);
    byFamily.get(family)!.push(color);
  }

  const pricePresets = buildPricePresets(
    Number.isFinite(minCents) ? minCents : 0,
    maxCents || 0
  );

  const categories = collectCatalogCategories(products);

  return {
    /** Stable category IDs present in this product set (taxonomy order). */
    categories,
    colors,
    colorFamilies: FAMILY_ORDER.map((family) => ({
      family,
      colors: byFamily.get(family) || [],
    })).filter((group) => group.colors.length > 0),
    colorHex,
    sizes: sortSizes(Array.from(sizeSet)),
    pricePresets,
    priceRangeDollars: {
      min: Number.isFinite(minCents) ? Math.floor(minCents / 100) : 0,
      max: maxCents ? Math.ceil(maxCents / 100) : 0,
    },
  };
}

export type PricePreset = {
  id: string;
  label: string;
  minPrice: number | null;
  maxPrice: number | null;
};

function buildPricePresets(minCents: number, maxCents: number): PricePreset[] {
  if (!maxCents || maxCents <= 0) {
    return [
      { id: 'under-50', label: 'Under $50', minPrice: null, maxPrice: 50 },
      { id: '50-80', label: '$50–$80', minPrice: 50, maxPrice: 80 },
      { id: '80-plus', label: '$80+', minPrice: 80, maxPrice: null },
    ];
  }
  const min = Math.floor(minCents / 100);
  const max = Math.ceil(maxCents / 100);
  const mid = Math.round((min + max) / 2);
  const lowCut = Math.max(min + 1, Math.round(min + (max - min) * 0.35));
  const highCut = Math.max(lowCut + 1, Math.round(min + (max - min) * 0.7));
  return [
    {
      id: `under-${lowCut}`,
      label: `Under $${lowCut}`,
      minPrice: null,
      maxPrice: lowCut,
    },
    {
      id: `${lowCut}-${highCut}`,
      label: `$${lowCut}–$${highCut}`,
      minPrice: lowCut,
      maxPrice: highCut,
    },
    {
      id: `${highCut}-plus`,
      label: `$${highCut}+`,
      minPrice: highCut,
      maxPrice: null,
    },
    // Keep mid hint unused but ensure brackets span catalog
    ...(mid > 0 ? [] : []),
  ];
}

function parseListParam(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => decodeURIComponent(part.trim()))
    .filter(Boolean);
}

function serializeList(values: string[]): string | null {
  if (!values.length) return null;
  return values.map((v) => encodeURIComponent(v)).join(',');
}

/**
 * Phase 6B single-select category: one stable ID in `?category=hoodies`.
 * Legacy comma-separated values keep the first entry only.
 * Normalizes common share typos onto canonical taxonomy IDs.
 */
function parseCategoryParam(raw: string | null): string[] {
  const list = parseListParam(raw);
  if (!list.length) return [];
  const id = normalizeShareCategoryId(list[0]);
  return id ? [id] : [];
}

/** Map casual share variants onto stable taxonomy IDs used in URLs. */
export function normalizeShareCategoryId(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/[_\s]+/g, '-');
  const aliases: Record<string, string> = {
    'tshirts': 't-shirts',
    'tshirt': 't-shirts',
    'tees': 't-shirts',
    'tee': 't-shirts',
    't-shirt': 't-shirts',
    'hoodie': 'hoodies',
    'sweatshirt': 'sweatshirts',
    'crew': 'sweatshirts',
    'dress': 'dresses',
    'skirt': 'skirts',
    'swimsuit': 'swimwear',
    'bikini': 'swimwear',
    'leggings': 'yoga',
    'jacket': 'outerwear',
    'hats': 'accessories',
    'beanie': 'accessories',
  };
  return aliases[key] || key;
}

export function parseDiscoverySearchParams(
  params: URLSearchParams | { get(name: string): string | null }
): DiscoveryState {
  const sortRaw = params.get('sort');
  const sort: DiscoverySort =
    sortRaw === 'newest' || sortRaw === 'price-asc' || sortRaw === 'price-desc'
      ? sortRaw
      : 'featured';
  const availabilityRaw = params.get('availability');
  const pageRaw = Number(params.get('page') || '1');
  const minRaw = params.get('minPrice');
  const maxRaw = params.get('maxPrice');

  return {
    q: params.get('q')?.trim() || null,
    audience: parseAudienceParam(params.get('audience')),
    categories: parseCategoryParam(params.get('category')),
    colors: parseListParam(params.get('color')),
    sizes: parseListParam(params.get('size')),
    minPrice: minRaw != null && minRaw !== '' ? Number(minRaw) : null,
    maxPrice: maxRaw != null && maxRaw !== '' ? Number(maxRaw) : null,
    availability: availabilityRaw === 'in-stock' ? 'in-stock' : 'all',
    sort,
    page: Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1,
  };
}

export function discoveryStateToSearchParams(state: DiscoveryState): URLSearchParams {
  const next = new URLSearchParams();
  if (state.q) next.set('q', state.q);
  if (state.audience && state.audience !== 'all') {
    next.set('audience', state.audience);
  }
  // Single-select: emit one stable category ID (no comma lists).
  const categoryId = state.categories[0];
  if (categoryId) next.set('category', categoryId);
  const color = serializeList(state.colors);
  if (color) next.set('color', color);
  const size = serializeList(state.sizes);
  if (size) next.set('size', size);
  if (state.minPrice != null && Number.isFinite(state.minPrice)) {
    next.set('minPrice', String(state.minPrice));
  }
  if (state.maxPrice != null && Number.isFinite(state.maxPrice)) {
    next.set('maxPrice', String(state.maxPrice));
  }
  if (state.availability === 'in-stock') next.set('availability', 'in-stock');
  if (state.sort !== 'featured') next.set('sort', state.sort);
  if (state.page > 1) next.set('page', String(state.page));
  return next;
}

export function hasActiveDiscoveryFilters(state: DiscoveryState) {
  return Boolean(
    state.q ||
      (state.audience && state.audience !== 'all') ||
      state.categories.length ||
      state.colors.length ||
      state.sizes.length ||
      state.minPrice != null ||
      state.maxPrice != null ||
      state.availability === 'in-stock'
  );
}

/**
 * Products visible for the current audience (Level 1), before category/search/facets.
 * All = unique product list (no unisex duplication).
 */
export function productsForAudience(
  products: Product[],
  audience: DiscoveryAudience
): Product[] {
  if (audience === 'all') return products;
  return products.filter((product) => productMatchesAudience(product, audience));
}

/**
 * Filters drawer / badge count — excludes category (owned by the Phase 6B rail).
 */
export function countActiveFilterSelections(state: DiscoveryState) {
  let n = 0;
  n += state.colors.length;
  n += state.sizes.length;
  if (state.minPrice != null || state.maxPrice != null) n += 1;
  if (state.availability === 'in-stock') n += 1;
  return n;
}

function matchesSearch(product: Product, q: string | null) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const catId = productCategoryId(product);
  const hay = [
    product.title,
    product.description,
    product.tags.join(' '),
    catId || '',
    catId ? categoryLabel(catId) : '',
    ...product.variants.map((v) => v.sku || ''),
  ]
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
}

function variantEligible(
  variant: ProductVariant,
  state: DiscoveryState
): boolean {
  if (!variant.isEnabled) return false;
  if (state.availability === 'in-stock' && !variant.isAvailable) return false;

  const color = variantColor(variant);
  const size = variantSize(variant);

  if (state.colors.length) {
    if (!color || !state.colors.some((c) => c.toLowerCase() === color.toLowerCase())) {
      return false;
    }
  }
  if (state.sizes.length) {
    if (!size || !state.sizes.some((s) => s.toLowerCase() === size.toLowerCase())) {
      return false;
    }
  }
  if (state.minPrice != null || state.maxPrice != null) {
    const dollars = variant.priceCents / 100;
    if (state.minPrice != null && dollars < state.minPrice) return false;
    if (state.maxPrice != null && dollars > state.maxPrice) return false;
  }
  return true;
}

/**
 * Variant-accurate filter: a product matches only when at least one variant
 * satisfies all structured constraints together (AND across categories, OR within).
 */
export function filterDiscoveryProducts(
  products: Product[],
  state: DiscoveryState
): Product[] {
  let next = productsForAudience(products, state.audience || 'all').filter(
    (product) => {
    if (!matchesSearch(product, state.q)) return false;

    if (state.categories.length) {
      const cat = productCategoryId(product);
      if (!cat || !state.categories.includes(cat)) return false;
    }

    const needsVariantGate =
      state.colors.length > 0 ||
      state.sizes.length > 0 ||
      state.minPrice != null ||
      state.maxPrice != null ||
      state.availability === 'in-stock';

    if (needsVariantGate) {
      return product.variants.some((variant) => variantEligible(variant, state));
    }
    return true;
  });

  if (state.sort === 'price-asc' || state.sort === 'price-desc') {
    next = [...next].sort((a, b) => {
      const pa = productUnitPriceCents(a) ?? Number.POSITIVE_INFINITY;
      const pb = productUnitPriceCents(b) ?? Number.POSITIVE_INFINITY;
      return state.sort === 'price-asc' ? pa - pb : pb - pa;
    });
  } else if (state.sort === 'newest') {
    next = [...next].reverse();
  }

  return next;
}

export type DiscoveryChip =
  | { kind: 'q'; key: string; label: string }
  | { kind: 'category'; key: string; label: string; value: string }
  | { kind: 'color'; key: string; label: string; value: string }
  | { kind: 'size'; key: string; label: string; value: string }
  | { kind: 'price'; key: string; label: string }
  | { kind: 'availability'; key: string; label: string };

export function discoveryChips(state: DiscoveryState): DiscoveryChip[] {
  const chips: DiscoveryChip[] = [];
  if (state.q) {
    chips.push({ kind: 'q', key: 'q', label: `“${state.q}”` });
  }
  // Category selection lives on the Phase 6B rail — omit from active chip row.
  for (const color of state.colors) {
    chips.push({
      kind: 'color',
      key: `color:${color}`,
      label: color,
      value: color,
    });
  }
  for (const size of state.sizes) {
    chips.push({
      kind: 'size',
      key: `size:${size}`,
      label: size.length <= 4 ? `Size ${size}` : size,
      value: size,
    });
  }
  if (state.minPrice != null || state.maxPrice != null) {
    let label = 'Price';
    if (state.minPrice != null && state.maxPrice != null) {
      label = `$${state.minPrice}–$${state.maxPrice}`;
    } else if (state.maxPrice != null) {
      label = `Under $${state.maxPrice}`;
    } else if (state.minPrice != null) {
      label = `$${state.minPrice}+`;
    }
    chips.push({ kind: 'price', key: 'price', label });
  }
  if (state.availability === 'in-stock') {
    chips.push({
      kind: 'availability',
      key: 'availability',
      label: 'In stock',
    });
  }
  return chips;
}

export function removeDiscoveryChip(
  state: DiscoveryState,
  chip: DiscoveryChip
): DiscoveryState {
  const next = { ...state, page: 1 };
  if (chip.kind === 'q') return { ...next, q: null };
  if (chip.kind === 'category') {
    return {
      ...next,
      categories: state.categories.filter((c) => c !== chip.value),
    };
  }
  if (chip.kind === 'color') {
    return { ...next, colors: state.colors.filter((c) => c !== chip.value) };
  }
  if (chip.kind === 'size') {
    return { ...next, sizes: state.sizes.filter((s) => s !== chip.value) };
  }
  if (chip.kind === 'price') {
    return { ...next, minPrice: null, maxPrice: null };
  }
  return { ...next, availability: 'all' };
}

export function toggleListValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function pricePresetActive(
  state: DiscoveryState,
  preset: PricePreset
): boolean {
  return state.minPrice === preset.minPrice && state.maxPrice === preset.maxPrice;
}
