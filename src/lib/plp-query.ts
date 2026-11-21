import type { Product } from '@/services/types';
import { variantColor, variantSize } from '@/lib/variant-options';

export type PlpSort = 'featured' | 'newest' | 'price-asc' | 'price-desc';

export type PriceBand = 'under-50' | '50-80' | '80-plus';

export interface PlpQueryState {
  color: string | null;
  size: string | null;
  price: PriceBand | null;
  sort: PlpSort;
  /** Free-text refine query — matches title, color, size, price keywords. */
  q: string | null;
}

export const PRICE_BANDS: Array<{ id: PriceBand; label: string }> = [
  { id: 'under-50', label: 'Under $50' },
  { id: '50-80', label: '$50–$80' },
  { id: '80-plus', label: '$80+' },
];

export const SORT_OPTIONS: Array<{ id: PlpSort; label: string }> = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price · Low to high' },
  { id: 'price-desc', label: 'Price · High to low' },
];

/** Default visible color chips before “More colors”. */
export const TOP_COLOR_COUNT = 8;

export function parsePlpSearchParams(
  params: URLSearchParams | { get(name: string): string | null }
): PlpQueryState {
  const color = params.get('color');
  const size = params.get('size');
  const priceRaw = params.get('price');
  const sortRaw = params.get('sort');
  const q = params.get('q');

  const price =
    priceRaw === 'under-50' || priceRaw === '50-80' || priceRaw === '80-plus'
      ? priceRaw
      : null;
  const sort: PlpSort =
    sortRaw === 'newest' || sortRaw === 'price-asc' || sortRaw === 'price-desc'
      ? sortRaw
      : 'featured';

  return {
    color: color?.trim() || null,
    size: size?.trim() || null,
    price,
    sort,
    q: q?.trim() || null,
  };
}

export function plpStateToSearchParams(state: PlpQueryState): URLSearchParams {
  const next = new URLSearchParams();
  if (state.q) next.set('q', state.q);
  if (state.color) next.set('color', state.color);
  if (state.size) next.set('size', state.size);
  if (state.price) next.set('price', state.price);
  if (state.sort && state.sort !== 'featured') next.set('sort', state.sort);
  return next;
}

export function productUnitPriceCents(product: Product): number | null {
  const enabled =
    product.variants.find((v) => v.isEnabled && v.isAvailable) ||
    product.variants.find((v) => v.isEnabled) ||
    product.variants[0];
  return typeof enabled?.priceCents === 'number' ? enabled.priceCents : null;
}

export function productColors(product: Product): string[] {
  const fromOptions =
    product.options
      ?.find((o) => /color|colour/i.test(o.name))
      ?.values.map((v) => v.title) || [];
  if (fromOptions.length) return fromOptions;

  const set = new Set<string>();
  for (const variant of product.variants) {
    const color = variantColor(variant);
    if (color) set.add(color);
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
    const size = variantSize(variant);
    if (size) set.add(size);
    else if (!variantColor(variant) && variant.title) set.add(variant.title);
  }
  return Array.from(set);
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];

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

export function collectPlpFacets(products: Product[]) {
  const colors = new Set<string>();
  const sizes = new Set<string>();
  for (const product of products) {
    productColors(product).forEach((c) => colors.add(c));
    productSizes(product).forEach((s) => sizes.add(s));
  }
  return {
    colors: Array.from(colors).sort((a, b) => a.localeCompare(b)),
    sizes: sortSizes(Array.from(sizes)),
  };
}

/** Colors ranked by how many products offer them (most common first). */
export function rankColorsByFrequency(products: Product[]): string[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const color of productColors(product)) {
      counts.set(color, (counts.get(color) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name);
}

/**
 * Visible color chips: top N by frequency, always including the active selection,
 * optionally filtered by a refine search string when not fully expanded.
 */
export function visibleColorFacets(args: {
  products: Product[];
  selected: string | null;
  query: string | null;
  expanded: boolean;
  limit?: number;
}): { visible: string[]; total: number; hiddenCount: number } {
  const limit = args.limit ?? TOP_COLOR_COUNT;
  const ranked = rankColorsByFrequency(args.products);
  const total = ranked.length;
  const needle = args.query?.trim().toLowerCase() || '';

  let pool = ranked;
  if (needle) {
    pool = ranked.filter((c) => c.toLowerCase().includes(needle));
  }

  if (args.expanded || needle) {
    // Search / expand: show matching (or all) without dumping unrelated chips.
    const visible = [...pool];
    if (args.selected && !visible.includes(args.selected)) {
      visible.unshift(args.selected);
    }
    return {
      visible,
      total,
      hiddenCount: Math.max(0, total - visible.length),
    };
  }

  const top = pool.slice(0, limit);
  if (args.selected && !top.includes(args.selected)) {
    top.unshift(args.selected);
    if (top.length > limit + 1) top.pop();
  }
  return {
    visible: top,
    total,
    hiddenCount: Math.max(0, total - top.length),
  };
}

function matchesPriceBand(cents: number | null, band: PriceBand | null) {
  if (!band) return true;
  if (cents == null) return false;
  const dollars = cents / 100;
  if (band === 'under-50') return dollars < 50;
  if (band === '50-80') return dollars >= 50 && dollars <= 80;
  return dollars > 80;
}

function priceBandFromQuery(q: string): PriceBand | null {
  const t = q.toLowerCase();
  if (/under\s*\$?\s*50|below\s*50|less\s*than\s*50|< ?50/.test(t)) return 'under-50';
  if (/80\s*\+|over\s*80|above\s*80|> ?80|\$80\+/.test(t)) return '80-plus';
  if (/50\s*[–\-to]+\s*80|between\s*50|\$50/.test(t) && /80/.test(t)) return '50-80';
  return null;
}

export function productMatchesRefineQuery(product: Product, q: string | null): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;

  const title = product.title.toLowerCase();
  if (title.includes(needle)) return true;

  const tags = product.tags.join(' ').toLowerCase();
  if (tags.includes(needle)) return true;

  const colors = productColors(product).map((c) => c.toLowerCase());
  if (colors.some((c) => c.includes(needle) || needle.includes(c))) return true;

  const sizes = productSizes(product).map((s) => s.toLowerCase());
  if (sizes.some((s) => s === needle || `size ${s}` === needle)) return true;

  const band = priceBandFromQuery(needle);
  if (band && matchesPriceBand(productUnitPriceCents(product), band)) return true;

  // Bare price tokens like "72" / "$42"
  const priceMatch = needle.match(/\$?\s*(\d{2,3})\s*$/);
  if (priceMatch) {
    const dollars = Number(priceMatch[1]);
    const cents = productUnitPriceCents(product);
    if (cents != null && Math.round(cents / 100) === dollars) return true;
  }

  return false;
}

export function filterAndSortProducts(
  products: Product[],
  state: PlpQueryState
): Product[] {
  let next = products.filter((product) => {
    if (state.color) {
      const colors = productColors(product).map((c) => c.toLowerCase());
      if (!colors.includes(state.color.toLowerCase())) return false;
    }
    if (state.size) {
      const sizes = productSizes(product).map((s) => s.toLowerCase());
      if (!sizes.includes(state.size.toLowerCase())) return false;
    }
    if (!matchesPriceBand(productUnitPriceCents(product), state.price)) {
      return false;
    }
    if (!productMatchesRefineQuery(product, state.q)) {
      return false;
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
    // Live Printify ids are not chronological; fixtures use stable ids — reverse catalog order as a labeled proxy.
    next = [...next].reverse();
  }

  return next;
}

export function hasActivePlpFilters(state: PlpQueryState) {
  return Boolean(
    state.q ||
      state.color ||
      state.size ||
      state.price ||
      state.sort !== 'featured'
  );
}

export type RefineSuggestion =
  | { kind: 'color'; value: string; label: string }
  | { kind: 'size'; value: string; label: string }
  | { kind: 'price'; value: PriceBand; label: string };

/** Typeahead suggestions for the Refine search field. */
export function buildRefineSuggestions(
  products: Product[],
  input: string,
  limit = 8
): RefineSuggestion[] {
  const needle = input.trim().toLowerCase();
  if (!needle || needle.length < 1) return [];

  const facets = collectPlpFacets(products);
  const out: RefineSuggestion[] = [];

  for (const color of facets.colors) {
    if (color.toLowerCase().includes(needle)) {
      out.push({ kind: 'color', value: color, label: `Color · ${color}` });
    }
    if (out.length >= limit) return out;
  }

  for (const size of facets.sizes) {
    if (
      size.toLowerCase() === needle ||
      size.toLowerCase().startsWith(needle) ||
      `size ${size}`.toLowerCase().includes(needle)
    ) {
      out.push({ kind: 'size', value: size, label: `Size · ${size}` });
    }
    if (out.length >= limit) return out;
  }

  for (const band of PRICE_BANDS) {
    if (
      band.label.toLowerCase().includes(needle) ||
      band.id.includes(needle.replace(/\s+/g, '-')) ||
      priceBandFromQuery(needle) === band.id
    ) {
      out.push({ kind: 'price', value: band.id, label: `Price · ${band.label}` });
    }
    if (out.length >= limit) return out;
  }

  return out;
}
