/**
 * Lookbook × Style Edit — typed editorial content model.
 * Product prices / inventory resolve from catalogService by productIds — never duplicated here.
 * Only `published` edits appear in nav, gallery, sitemap, and related-edit rails.
 */

export type LookbookEditStatus = 'draft' | 'published';

export interface EditorialFilm {
  title: string;
  posterImage: string;
  videoUrl?: string;
  caption?: string;
}

export interface EditorialLook {
  id: string;
  title: string;
  description?: string;
  image: string;
  mobileImage?: string;
  imageAlt: string;
  /** Catalog product ids — resolve at render time; first match is primary shop destination */
  productIds: string[];
  videoUrl?: string;
}

export interface LookbookEdit {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string;
  description: string;
  heroImage: string;
  mobileHeroImage?: string;
  /**
   * Optional Tailwind object-position utilities for the style-edit hero
   * (faces / logos under left copy on cover crop). Falls back to page defaults.
   */
  heroObjectPositionClassName?: string;
  heroAlt: string;
  status: LookbookEditStatus;
  sortOrder: number;
  /** Short gallery blurb on /lookbook */
  galleryDescription: string;
  looks: EditorialLook[];
  film?: EditorialFilm;
  /** Optional prior Journal / story path this edit supersedes */
  legacyPaths?: string[];
}

/**
 * Campaign configuration. Draft edits stay out of public surfaces until
 * approved photography exists (see docs/lookbook-style-edit-status.md).
 */
export const LOOKBOOK_EDITS: LookbookEdit[] = [
  {
    id: 'coastal-hours',
    slug: 'coastal-hours',
    title: 'Coastal Hours.',
    eyebrow: 'Edit 001',
    description: 'Easy layers for the spaces between plans.',
    galleryDescription:
      'Relaxed layers, open landscapes, and the ease of everyday dressing.',
    heroImage: '/editorial/lookbook/coastal-hours.webp',
    mobileHeroImage: '/editorial/lookbook/coastal-hours-mobile.webp',
    heroAlt:
      'blend america Coastal Hours — model in a burgundy BLEND hoodie on a sunlit cliff overlooking the ocean',
    status: 'published',
    sortOrder: 1,
    looks: [
      {
        id: 'open-road',
        title: 'Open Road',
        description: 'Light structure for morning air and unhurried starts.',
        image: '/editorial/lookbook/coastal-hours.webp',
        mobileImage: '/editorial/lookbook/coastal-hours-mobile.webp',
        imageAlt: 'BLEND burgundy hoodie worn on a coastal cliff at golden hour',
        productIds: ['fixture-everyday-crew', 'fixture-classic-tee'],
      },
      {
        id: 'shoreline-knit',
        title: 'Shoreline Knit',
        description: 'A quiet crew for in-between hours.',
        image: '/editorial/collections/tile-men.webp',
        imageAlt: 'Menswear look — BLEND knit layers',
        productIds: ['fixture-heritage-crew', 'fixture-essential-hoodie'],
      },
      {
        id: 'salt-air',
        title: 'Salt Air',
        description: 'Soft volume and easy movement.',
        image: '/editorial/collections/tile-women.webp',
        imageAlt: 'Womenswear look — relaxed BLEND essentials',
        productIds: ['fixture-relaxed-hoodie', 'fixture-everyday-tee'],
      },
    ],
  },
  {
    id: 'city-days',
    slug: 'city-days',
    title: 'City Days.',
    eyebrow: 'Edit 002 · Film 001',
    description: 'Confident streetwear, everyday movement, and the energy of the city.',
    galleryDescription:
      'Confident streetwear, everyday movement, and the energy of the city.',
    // Dedicated 21:9 hero plate — do not reuse for film poster / featured looks
    // (those keep film-still.png until those surfaces are intentionally updated).
    heroImage: '/editorial/lookbook/city-days-hero.webp',
    // Bias right so face + BLEND chest logo stay clear of left copy on cover crop.
    heroObjectPositionClassName: 'object-[58%_40%]',
    heroAlt:
      'Adult model in a black BLEND zip hoodie on a sunlit SoHo street',
    status: 'published',
    sortOrder: 2,
    film: {
      title: 'The Coast Edit / Film 001',
      posterImage: '/editorial/lookbook/film-still.png',
      caption: 'Not just worn. Lived in.',
      // videoUrl omitted until a muted campaign film is supplied
    },
    looks: [
      {
        id: 'street-graphic',
        title: 'Urban Motion Hoodie',
        description:
          'Bold kinetic logo zip-up for cool commutes and city nights.',
        image: '/editorial/lookbook/film-still.png',
        imageAlt: 'BLEND kinetic logo zip hoodie worn on a sunlit city street',
        productIds: ['6ab04629c31ab5a33a01c9d9'],
      },
      {
        id: 'midday-layer',
        title: 'Midday Layer',
        description: 'Structure without stiffness for moving between plans.',
        image: '/editorial/collections/tile-new-arrivals.webp',
        imageAlt: 'New Arrivals look — layered BLEND essentials',
        productIds: ['fixture-essential-hoodie', 'fixture-everyday-crew'],
      },
    ],
    legacyPaths: ['/#lookbook'],
  },
  {
    id: 'everyday-edit',
    slug: 'everyday-edit',
    title: 'The Everyday Edit.',
    eyebrow: 'Edit 003 · Worn Your Way',
    description: 'Effortless pieces and versatile color combinations for everyday wear.',
    galleryDescription:
      'Effortless pieces and versatile color combinations for everyday wear.',
    heroImage: '/editorial/lookbook/everyday-edit.webp',
    mobileHeroImage: '/editorial/lookbook/everyday-edit.webp',
    heroAlt:
      'blend america Everyday Edit — couple in burgundy and cream BLEND sweats on a misty coastal shore',
    status: 'published',
    sortOrder: 3,
    looks: [
      {
        id: 'dusk-court',
        title: 'Structured Ease',
        description: 'Quiet structure for late light and open courts.',
        image: '/editorial/lookbook/everyday-edit.webp',
        mobileImage: '/editorial/lookbook/everyday-edit.webp',
        imageAlt:
          'Couple embracing in burgundy and cream BLEND sweats on a rocky coastal beach',
        productIds: ['fixture-essential-hoodie', 'fixture-heritage-crew'],
      },
      {
        id: 'ash-court',
        title: 'Quiet Focus',
        description: 'Charcoal ease for focused days.',
        image: '/editorial/worn-your-way/ash-court-hoodie.png',
        imageAlt:
          'Adult model smiling in a charcoal BLEND hoodie seated against a beige wall',
        productIds: ['fixture-relaxed-hoodie', 'fixture-everyday-crew'],
      },
      {
        id: 'oat-hour',
        title: 'Soft Afternoon',
        description: 'Cream knit for soft afternoon light.',
        image: '/editorial/worn-your-way/oat-hour-hoodie.png',
        imageAlt:
          'Adult model in a cream oat BLEND hoodie seated against a sunlit beige wall',
        productIds: ['fixture-everyday-crew', 'fixture-essential-hoodie'],
      },
    ],
  },
  {
    id: 'out-of-office',
    slug: 'out-of-office',
    title: 'Out of Office.',
    eyebrow: 'Edit 004',
    description: 'Open roads, ocean air, and the pieces you reach for again and again.',
    galleryDescription:
      'Open roads, ocean air, and the pieces you reach for again and again.',
    // Placeholder paths — edit remains draft until portrait + environmental frames ship
    heroImage: '/editorial/heroes/home-hero-desktop.webp',
    heroAlt: 'Out of Office campaign — assets pending',
    status: 'draft',
    sortOrder: 4,
    looks: [],
    legacyPaths: ['/#out-of-office'],
  },
];

export function getPublishedEdits(): LookbookEdit[] {
  return LOOKBOOK_EDITS.filter((edit) => edit.status === 'published').sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getLookbookEditBySlug(slug: string): LookbookEdit | undefined {
  return LOOKBOOK_EDITS.find((edit) => edit.slug === slug);
}

export function getPublishedEditBySlug(slug: string): LookbookEdit | undefined {
  const edit = getLookbookEditBySlug(slug);
  return edit?.status === 'published' ? edit : undefined;
}

export function getRelatedEdits(slug: string, limit = 2): LookbookEdit[] {
  return getPublishedEdits()
    .filter((edit) => edit.slug !== slug)
    .slice(0, limit);
}
