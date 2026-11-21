import type { Product, ProductOption, ProductVariant } from '@/services/types';

/**
 * Printify option names are often plural ("Colors", "Sizes") while Coastal UI
 * historically read singular Color/Size. Canonicalize + fuzzy-read so purchasable
 * variants are not marked unavailable by a key mismatch.
 */

export function canonicalOptionName(name: string, type?: string): string {
  const t = String(type || '').toLowerCase();
  const n = String(name || '').toLowerCase();
  if (t === 'color' || /colou?rs?/.test(n)) return 'Color';
  if (t === 'size' || /\bsizes?\b/.test(n)) return 'Size';
  return String(name || '');
}

function valueByKind(
  optionValues: Record<string, string> | undefined,
  kind: 'color' | 'size'
): string | null {
  if (!optionValues) return null;
  // Prefer canonical keys first
  if (kind === 'color') {
    if (optionValues.Color) return optionValues.Color;
    if (optionValues.color) return optionValues.color;
    if (optionValues.Colour) return optionValues.Colour;
  } else {
    if (optionValues.Size) return optionValues.Size;
    if (optionValues.size) return optionValues.size;
  }
  for (const [key, value] of Object.entries(optionValues)) {
    if (!value) continue;
    if (kind === 'color' && /colou?r/i.test(key)) return value;
    if (kind === 'size' && /size/i.test(key)) return value;
  }
  return null;
}

export function variantColor(variant: ProductVariant): string | null {
  return valueByKind(variant.optionValues, 'color');
}

export function variantSize(variant: ProductVariant): string | null {
  const sized = valueByKind(variant.optionValues, 'size');
  if (sized) return sized;
  // Single-dimension variants sometimes encode size as the title alone
  if (Object.keys(variant.optionValues || {}).length === 0) return variant.title;
  return null;
}

export function findColorOption(product: Product): ProductOption | undefined {
  return product.options?.find((o) => /colou?r/i.test(o.name) || o.type === 'color');
}

export function findSizeOption(product: Product): ProductOption | undefined {
  return product.options?.find((o) => /size/i.test(o.name) || o.type === 'size');
}

export function normalizeOptionValues(
  optionValues: Record<string, string>
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(optionValues)) {
    if (!value) continue;
    next[canonicalOptionName(key)] = value;
  }
  return next;
}
