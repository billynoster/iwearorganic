/**
 * Phase 6B New Arrivals + Men / Women PLPs — audience eligibility.
 *
 * Sources (in order):
 * 1. Explicit `ca-audience:{women|men|unisex}` tags (merchant override)
 * 2. Shared gender field (`getProductGenderEligibility`) — title designation,
 *    inherent categories (e.g. swim trunks), then Printify gender tags
 * 3. `collectionIds` membership (`womenswear` / `menswear`)
 *
 * Printify blanks often stamp both Men's + Women's Clothing + Unisex even when
 * the merchant title says "| Men" / "| Women". The shared gender field prefers
 * that title signal so exclusive merch is not misclassified as unisex.
 */

import type { Product } from '@/services/types';
import { getProductGenderEligibility } from '@/lib/gender-utils';

export type DiscoveryAudience = 'all' | 'women' | 'men';

export const AUDIENCE_TAG_PREFIX = 'ca-audience:';

export type AudienceEligibility = {
  forWomen: boolean;
  forMen: boolean;
  isUnisex: boolean;
  /** How eligibility was resolved — `none` means All-only (no Women/Men match). */
  source: 'tag' | 'collection' | 'none';
};

function normalizeToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/^#/, '');
}

function hasAudienceTag(tags: string[], value: 'women' | 'men' | 'unisex'): boolean {
  const marker = `${AUDIENCE_TAG_PREFIX}${value}`;
  return tags.some((tag) => normalizeToken(tag) === marker);
}

function fromGenderField(product: Product): AudienceEligibility | null {
  const g = getProductGenderEligibility(product.title || '', product.tags || []);
  if (g.isUnisex && g.forMen && g.forWomen) {
    return { forWomen: true, forMen: true, isUnisex: true, source: 'tag' };
  }
  if (g.forWomen && !g.forMen) {
    return { forWomen: true, forMen: false, isUnisex: false, source: 'tag' };
  }
  if (g.forMen && !g.forWomen) {
    return { forWomen: false, forMen: true, isUnisex: false, source: 'tag' };
  }
  return null;
}

/**
 * Resolve Women / Men / Unisex from ca-audience tags, shared gender field,
 * then collectionIds.
 */
export function resolveAudienceEligibility(product: Product): AudienceEligibility {
  const tags = product.tags || [];

  if (hasAudienceTag(tags, 'unisex')) {
    return { forWomen: true, forMen: true, isUnisex: true, source: 'tag' };
  }
  if (hasAudienceTag(tags, 'women') && !hasAudienceTag(tags, 'men')) {
    return { forWomen: true, forMen: false, isUnisex: false, source: 'tag' };
  }
  if (hasAudienceTag(tags, 'men') && !hasAudienceTag(tags, 'women')) {
    return { forWomen: false, forMen: true, isUnisex: false, source: 'tag' };
  }
  if (hasAudienceTag(tags, 'women') && hasAudienceTag(tags, 'men')) {
    return { forWomen: true, forMen: true, isUnisex: true, source: 'tag' };
  }

  // Title / inherent category / Printify gender tags (shared with PDP badges + feed).
  const fromGender = fromGenderField(product);
  if (fromGender) {
    // When gender-utils falls through to neutral unisex (no title/tag signal),
    // prefer exclusive collection membership if present.
    if (fromGender.isUnisex) {
      const ids = new Set((product.collectionIds || []).map((id) => id.toLowerCase()));
      const inWomen = ids.has('womenswear');
      const inMen = ids.has('menswear');
      if (inWomen && inMen) {
        return { forWomen: true, forMen: true, isUnisex: true, source: 'collection' };
      }
      if (inWomen && !inMen) {
        return { forWomen: true, forMen: false, isUnisex: false, source: 'collection' };
      }
      if (inMen && !inWomen) {
        return { forWomen: false, forMen: true, isUnisex: false, source: 'collection' };
      }
    }
    return fromGender;
  }

  const ids = new Set((product.collectionIds || []).map((id) => id.toLowerCase()));
  const inWomen = ids.has('womenswear');
  const inMen = ids.has('menswear');
  if (inWomen && inMen) {
    return { forWomen: true, forMen: true, isUnisex: true, source: 'collection' };
  }
  if (inWomen) {
    return { forWomen: true, forMen: false, isUnisex: false, source: 'collection' };
  }
  if (inMen) {
    return { forWomen: false, forMen: true, isUnisex: false, source: 'collection' };
  }

  return { forWomen: false, forMen: false, isUnisex: false, source: 'none' };
}

/**
 * Soft audience match — includes unisex under Women / Men.
 * Used by New Arrivals chips and Men / Women collection PLPs.
 */
export function productMatchesAudience(
  product: Product,
  audience: DiscoveryAudience
): boolean {
  if (audience === 'all') return true;
  const eligibility = resolveAudienceEligibility(product);
  if (audience === 'women') return eligibility.forWomen;
  if (audience === 'men') return eligibility.forMen;
  return true;
}

/**
 * Exclusive audience only (unisex excluded).
 * Kept for callers that need Men-only / Women-only SKUs without shared fits.
 */
export function productMatchesStrictAudience(
  product: Product,
  audience: 'women' | 'men'
): boolean {
  const eligibility = resolveAudienceEligibility(product);
  if (eligibility.isUnisex || eligibility.source === 'none') return false;
  if (audience === 'women') {
    return eligibility.forWomen && !eligibility.forMen;
  }
  return eligibility.forMen && !eligibility.forWomen;
}

export function audienceTagFor(
  value: 'women' | 'men' | 'unisex'
): string {
  return `${AUDIENCE_TAG_PREFIX}${value}`;
}

/**
 * Ensure an explicit `ca-audience:*` tag from metadata + optional title.
 */
export function ensureAudienceTag(
  tags: string[],
  collectionIds?: string[],
  title?: string
): { tags: string[]; eligibility: AudienceEligibility } {
  const probe: Product = {
    id: 'probe',
    title: title || '',
    description: '',
    tags,
    images: [],
    variants: [],
    collectionIds,
  };
  const eligibility = resolveAudienceEligibility(probe);

  let marker: string | null = null;
  if (eligibility.isUnisex) marker = audienceTagFor('unisex');
  else if (eligibility.forWomen && !eligibility.forMen) marker = audienceTagFor('women');
  else if (eligibility.forMen && !eligibility.forWomen) marker = audienceTagFor('men');

  if (!marker) return { tags, eligibility };

  const hasMarker = tags.some((tag) => normalizeToken(tag) === marker!.toLowerCase());
  if (hasMarker) return { tags, eligibility };
  return { tags: [...tags, marker], eligibility };
}

export function parseAudienceParam(raw: string | null): DiscoveryAudience {
  const value = (raw || '').trim().toLowerCase();
  if (value === 'women' || value === 'men') return value;
  return 'all';
}
