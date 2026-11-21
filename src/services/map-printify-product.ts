/**
 * Printify → domain Product mapping (no Next.js cache dependency).
 * Shared by catalogService and offline feed generation scripts.
 */

import type { Product } from './types';
import { canonicalOptionName } from '@/lib/variant-options';
import { ensureCategoryTag } from '@/lib/category-taxonomy';
import { ensureAudienceTag } from '@/lib/audience-taxonomy';

function buildOptionValueLookup(raw: any): Map<string, { optionName: string; title: string }> {
  const lookup = new Map<string, { optionName: string; title: string }>();
  for (const option of raw.options || []) {
    // Printify uses "Colors"/"Sizes" — store canonical Color/Size for Coastal UI matching
    const optionName = canonicalOptionName(
      String(option.name || ''),
      String(option.type || '')
    );
    for (const value of option.values || []) {
      // Always string-key — Printify ids arrive as number or string depending on path
      lookup.set(String(value.id), {
        optionName,
        title: String(value.title || ''),
      });
    }
  }
  return lookup;
}

function variantOptionValues(
  rawVariant: any,
  lookup: Map<string, { optionName: string; title: string }>
): Record<string, string> {
  const values: Record<string, string> = {};
  if (Array.isArray(rawVariant.options)) {
    for (const optId of rawVariant.options) {
      const meta = lookup.get(String(optId));
      if (meta?.optionName) values[meta.optionName] = meta.title;
    }
  }
  // Fallback: Printify titles are often "Color / Size"
  if (Object.keys(values).length === 0 && typeof rawVariant.title === 'string') {
    const parts = rawVariant.title.split('/').map((p: string) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      values.Color = parts[0];
      values.Size = parts[parts.length - 1];
    } else if (parts.length === 1) {
      values.Size = parts[0];
    }
  }
  return values;
}

export function mapPrintifyProduct(raw: any): Product {
  const lookup = buildOptionValueLookup(raw);
  const options =
    Array.isArray(raw.options) && raw.options.length > 0
      ? raw.options.map((option: any) => ({
          name: canonicalOptionName(String(option.name || ''), String(option.type || '')),
          type: String(option.type || option.name || 'option').toLowerCase(),
          values: (option.values || []).map((value: any) => ({
            id: String(value.id),
            title: String(value.title || ''),
            colors: Array.isArray(value.colors) ? value.colors.map(String) : undefined,
          })),
        }))
      : undefined;

  const videos: Product['videos'] = [];
  if (Array.isArray(raw.videos)) {
    for (const video of raw.videos) {
      const src = typeof video === 'string' ? video : video?.src || video?.url;
      if (typeof src === 'string' && /^https?:\/\//i.test(src)) {
        videos.push({
          src,
          title: typeof video === 'object' ? video.title : undefined,
          poster: typeof video === 'object' ? video.poster : undefined,
        });
      }
    }
  }

  const rawTags = Array.isArray(raw.tags) ? raw.tags.map(String) : [];
  // Normalize Printify rows onto stable ca-cat:{id} tags (Phase 6B taxonomy).
  const { tags: categorized } = ensureCategoryTag(rawTags, String(raw.title || ''));
  // Audience: ca-audience / shared gender field (title + tags) / collectionIds.
  const collectionIds = Array.isArray(raw.collection_ids)
    ? raw.collection_ids.map(String)
    : Array.isArray(raw.collectionIds)
    ? raw.collectionIds.map(String)
    : undefined;
  const { tags } = ensureAudienceTag(categorized, collectionIds, String(raw.title || ''));

  // Printify release/create timestamp — Just dropped + NA “New” badges (no title guessing).
  const releasedRaw = raw.created_at || raw.createdAt || raw.released_at;
  const releasedAt =
    typeof releasedRaw === 'string' && Number.isFinite(Date.parse(releasedRaw))
      ? new Date(releasedRaw).toISOString()
      : undefined;

  return {
    id: String(raw.id),
    title: raw.title,
    description: raw.description || '',
    tags,
    collectionIds,
    releasedAt,
    // Preserve Printify channel visibility for feed eligibility (unpublished ≠ fixture).
    sourceVisible: typeof raw.visible === 'boolean' ? raw.visible : undefined,
    images: (raw.images || []).map((img: any, index: number) => ({
      src: img.src,
      alt: `${raw.title} image ${index + 1}`,
      isDefault: Boolean(img.is_default),
      isPlaceholder: false,
      variantIds: Array.isArray(img.variant_ids)
        ? img.variant_ids.map((id: string | number) => String(id))
        : undefined,
    })),
    variants: (raw.variants || []).map((v: any) => ({
      id: String(v.id),
      title: v.title,
      sku: v.sku,
      priceCents: Number(v.price),
      isAvailable: v.is_available !== false,
      isEnabled: v.is_enabled !== false,
      optionValues: variantOptionValues(v, lookup),
    })),
    options,
    videos: videos.length > 0 ? videos : undefined,
  };
}
