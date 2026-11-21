/**
 * Worn Your Way — campaign look configuration (editorial, not commerce records).
 * Prices / availability resolve from catalogService products by productIds.
 * Phase 3B: worn-your-way-phase-3b-spec.md
 */

export type WornLookRole = 'lead' | 'support';

export interface WornFocalPoint {
  /** Horizontal focus 0–100 (object-position x%) */
  x: number;
  /** Vertical focus 0–100 (object-position y%) */
  y: number;
}

export interface WornLookConfig {
  id: string;
  title: string;
  /** Public path under /public */
  imageSrc: string;
  imageAlt: string;
  /** Catalog product ids — first resolved product is the primary shop destination */
  productIds: string[];
  /** Used when no associated product is present in the current catalog payload */
  fallbackHref: string;
  description?: string;
  role: WornLookRole;
  /** Deliberate crop focus for object-position */
  focalPoint: WornFocalPoint;
}

/** Shop the Looks → Everyday Edit Style Edit (shoppable looks preserved on page). */
export const WORN_YOUR_WAY_SHOP_CTA_HREF = '/lookbook/everyday-edit';

export function wornObjectPosition(look: WornLookConfig): string {
  const { x, y } = look.focalPoint;
  return `${x}% ${y}%`;
}

/**
 * Looks mapped to Everyday Uniform hoodie/crew fixtures when live catalog
 * ids are unavailable. Swap productIds when Printify inventory is connected.
 *
 * Billy set order: Support 1 charcoal → Support 2 oat → Lead burgundy.
 * Product ids / fallback collection links preserved from prior court set.
 */
export const WORN_YOUR_WAY_LOOKS: WornLookConfig[] = [
  {
    id: 'dusk-court-hoodie',
    title: 'Structured Ease',
    imageSrc: '/editorial/worn-your-way/lead.png',
    imageAlt:
      'Adult model smiling in a burgundy BLEND hoodie, waist-up against a beige studio wall',
    productIds: ['fixture-essential-hoodie', 'fixture-heritage-crew'],
    fallbackHref: '/men',
    description: 'Quiet structure for late light and open courts.',
    role: 'lead',
    // Source ≈4:5 matches lead frame; mild top bias keeps face + BLEND logo optical center
    focalPoint: { x: 50, y: 36 },
  },
  {
    id: 'ash-court-hoodie',
    title: 'Quiet Focus',
    imageSrc: '/editorial/worn-your-way/ash-court-hoodie.png',
    imageAlt:
      'Adult model smiling in a charcoal BLEND hoodie seated against a beige wall',
    productIds: ['fixture-relaxed-hoodie', 'fixture-everyday-crew'],
    fallbackHref: '/women',
    description: 'Charcoal ease for focused days.',
    role: 'support',
    focalPoint: { x: 50, y: 34 },
  },
  {
    id: 'oat-hour-hoodie',
    title: 'Soft Afternoon',
    imageSrc: '/editorial/worn-your-way/oat-hour-hoodie.png',
    imageAlt:
      'Adult model in a cream oat BLEND hoodie seated against a sunlit beige wall',
    productIds: ['fixture-everyday-crew', 'fixture-essential-hoodie'],
    fallbackHref: '/new-arrivals',
    description: 'Cream knit for soft afternoon light.',
    role: 'support',
    // Gaze is up-right; keep face + logo in frame
    focalPoint: { x: 48, y: 30 },
  },
];
