/**
 * DEVELOPMENT FIXTURES ONLY
 * Not production inventory or pricing. Used when live Printify credentials are unavailable
 * or for visual homepage milestones. Do not hardcode Option B mockup sample prices as live truth.
 */

import type { Collection, Product, ProductImage } from './types';

function placeholder(label: string, tone = '#EBE6DF') {
  return (
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
        <rect width="900" height="1200" fill="${tone}"/>
        <rect x="48" y="48" width="804" height="1104" fill="#DDD4C9" opacity="0.55"/>
        <text x="450" y="580" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#303435">PLACEHOLDER</text>
        <text x="450" y="620" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#303435">${label}</text>
        <text x="450" y="660" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#303435">Not production inventory</text>
      </svg>`
    )
  );
}

const COLOR_TONES: Record<string, string> = {
  Oat: '#DDD4C9',
  Mineral: '#303435',
  Haze: '#91A7AF',
  Dusk: '#BFA4A1',
  Linen: '#F4F1EB',
  Sand: '#C4B5A0',
  Sage: '#8A9A7B',
  Slate: '#6B7C7E',
  Olive: '#6E6B4F',
  Terracotta: '#B56A4E',
  Ivory: '#F3EDE3',
  Charcoal: '#3A3C3D',
  Navy: '#3D4A5C',
  Rose: '#C9A8A6',
  Clay: '#A88878',
  Mist: '#B7C4C8',
  Stone: '#9A938A',
  Fog: '#A8B0B3',
  Ember: '#A85C4A',
  Coastal: '#7E96A0',
  'Faded Cream': '#E8DCC8',
  'Faded Mustard': '#C4A35A',
  'Faded Brown': '#8B6F5C',
  'Faded Army': '#6B7355',
  'Faded Navy': '#4A5568',
  'Faded Black': '#2C2C2C',
};

/** Large palette for womenswear fixtures — exercises collapsed color refine UX. */
const WOMEN_COLOR_FIXTURE_PALETTE = [
  'Oat',
  'Linen',
  'Dusk',
  'Haze',
  'Sand',
  'Sage',
  'Slate',
  'Olive',
  'Terracotta',
  'Ivory',
  'Charcoal',
  'Navy',
  'Rose',
  'Clay',
  'Mist',
  'Stone',
  'Fog',
  'Ember',
  'Coastal',
  'Mineral',
];

function colorImages(
  productId: string,
  title: string,
  colors: string[],
  variantIdsByColor: Record<string, string[]>
): ProductImage[] {
  return colors.map((color, index) => ({
    src: placeholder(`${title} · ${color}`, COLOR_TONES[color] || '#EBE6DF'),
    alt: `Placeholder — ${title} in ${color} (not production inventory)`,
    isDefault: index === 0,
    isPlaceholder: true,
    variantIds: variantIdsByColor[color] || [],
  }));
}

function fixtureProduct(args: {
  id: string;
  title: string;
  priceCents: number;
  tags: string[];
  collectionIds: string[];
  colors?: string[];
  sizes?: string[];
  unavailable?: Array<{ color: string; size: string }>;
  withVideo?: boolean;
  /** ISO release timestamp for Just dropped / NA New badge demos. */
  releasedAt?: string;
  /**
   * Use Printify-style plural option keys ("Colors"/"Sizes") to regression-test
   * Coastal availability matching. Live Printify mapping canonicalizes these;
   * PDP readers must still resolve them if anything slips through.
   */
  printifyOptionKeys?: boolean;
}): Product {
  const colors = args.colors ?? ['Oat'];
  const sizes = args.sizes ?? ['XS', 'S', 'M', 'L', 'XL'];
  const unavailable = new Set(
    (args.unavailable ?? []).map((u) => `${u.color}|${u.size}`)
  );
  const colorKey = args.printifyOptionKeys ? 'Colors' : 'Color';
  const sizeKey = args.printifyOptionKeys ? 'Sizes' : 'Size';
  const colorOptionName = args.printifyOptionKeys ? 'Colors' : 'Color';
  const sizeOptionName = args.printifyOptionKeys ? 'Sizes' : 'Size';

  const variants = colors.flatMap((color) =>
    sizes.map((size) => {
      const id = `${args.id}-${color.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`;
      const isAvailable = !unavailable.has(`${color}|${size}`);
      const optionValues: Record<string, string> =
        colors.length > 1
          ? { [colorKey]: color, [sizeKey]: size }
          : { [sizeKey]: size };
      return {
        id,
        title: colors.length > 1 ? `${color} / ${size}` : size,
        priceCents: args.priceCents,
        isAvailable,
        isEnabled: true,
        optionValues,
      };
    })
  );

  const variantIdsByColor: Record<string, string[]> = {};
  for (const color of colors) {
    variantIdsByColor[color] = variants
      .filter(
        (v) =>
          v.optionValues[colorKey] === color ||
          v.optionValues.Color === color ||
          colors.length === 1
      )
      .map((v) => v.id);
  }

  const images =
    colors.length > 1
      ? [
          ...colorImages(args.id, args.title, colors, variantIdsByColor),
          {
            src: placeholder(`${args.title} detail`, '#d5cec4'),
            alt: `Placeholder — ${args.title} detail (not production inventory)`,
            isPlaceholder: true,
            variantIds: variants.map((v) => v.id),
          },
        ]
      : [
          {
            src: placeholder(args.title),
            alt: `Placeholder — ${args.title} (not production inventory)`,
            isDefault: true,
            isPlaceholder: true,
            variantIds: variants.map((v) => v.id),
          },
          {
            src: placeholder(`${args.title} back`, '#d5cec4'),
            alt: `Placeholder — ${args.title} back (not production inventory)`,
            isPlaceholder: true,
            variantIds: variants.map((v) => v.id),
          },
          {
            src: placeholder(`${args.title} detail`, '#c8bdb4'),
            alt: `Placeholder — ${args.title} detail (not production inventory)`,
            isPlaceholder: true,
            variantIds: variants.map((v) => v.id),
          },
        ];

  return {
    id: args.id,
    title: args.title,
    description:
      '<p>Development fixture — not production inventory.</p><p>Soft hand feel, considered silhouette, made for everyday coastal light. Pair with the rest of The Everyday Collection.</p><p>Made to order. Easy returns on eligible unworn items.</p>',
    tags: args.tags,
    images,
    variants,
    options:
      colors.length > 1
        ? [
            {
              name: colorOptionName,
              type: 'color',
              values: colors.map((color) => ({
                id: color.toLowerCase().replace(/\s+/g, '-'),
                title: color,
                colors: [COLOR_TONES[color] || '#DDD4C9'],
              })),
            },
            {
              name: sizeOptionName,
              type: 'size',
              values: sizes.map((size) => ({
                id: size.toLowerCase(),
                title: size,
              })),
            },
          ]
        : [
            {
              name: sizeOptionName,
              type: 'size',
              values: sizes.map((size) => ({
                id: size.toLowerCase(),
                title: size,
              })),
            },
          ],
    videos: args.withVideo
      ? [
          {
            src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            title: 'Product film (fixture)',
            poster: placeholder(`${args.title} film`, '#91A7AF'),
          },
        ]
      : undefined,
    collectionIds: args.collectionIds,
    releasedAt: args.releasedAt,
  };
}

/** Fixture prices are arbitrary development values — not mockup sample prices or live catalog. */
export const FIXTURE_PRODUCTS: Product[] = [
  fixtureProduct({
    id: 'fixture-everyday-crew',
    title: 'The Everyday Crew',
    priceCents: 7200,
    tags: ['everyday', 'ca-cat:sweatshirts', 'ca-audience:men', 'just-dropped'],
    collectionIds: ['everyday-uniform', 'menswear', 'new-arrivals'],
    colors: ['Oat', 'Mineral', 'Haze'],
    unavailable: [{ color: 'Mineral', size: 'XS' }, { color: 'Haze', size: 'XL' }],
    withVideo: true,
    releasedAt: '2026-11-01T12:00:00.000Z',
  }),
  fixtureProduct({
    id: 'fixture-essential-hoodie',
    title: 'The Essential Hoodie',
    priceCents: 8200,
    tags: ['everyday', 'ca-cat:hoodies', 'ca-audience:men'],
    collectionIds: ['everyday-uniform', 'menswear'],
    colors: ['Mineral', 'Oat'],
  }),
  fixtureProduct({
    id: 'fixture-classic-tee',
    title: 'The Classic Tee',
    priceCents: 4200,
    tags: ['everyday', 'ca-cat:t-shirts', 'ca-audience:women', 'just-dropped'],
    collectionIds: ['everyday-uniform', 'womenswear', 'new-arrivals'],
    // Many colors — mirrors live Printify overload; Refine collapses to top 8 + More.
    colors: WOMEN_COLOR_FIXTURE_PALETTE,
    releasedAt: '2026-11-05T12:00:00.000Z',
  }),
  fixtureProduct({
    id: 'fixture-relaxed-hoodie',
    title: 'The Relaxed Hoodie',
    priceCents: 8200,
    tags: ['everyday', 'ca-cat:hoodies', 'ca-audience:women'],
    collectionIds: ['everyday-uniform', 'womenswear'],
    colors: ['Dusk', 'Oat', 'Sand', 'Sage', 'Rose', 'Mist', 'Navy', 'Ivory', 'Clay'],
  }),
  fixtureProduct({
    id: 'fixture-heritage-crew',
    title: 'The Heritage Crew',
    priceCents: 7200,
    tags: ['everyday', 'ca-cat:sweatshirts', 'ca-audience:men', 'just-dropped'],
    collectionIds: ['everyday-uniform', 'menswear', 'new-arrivals'],
    releasedAt: '2026-10-28T12:00:00.000Z',
  }),
  fixtureProduct({
    id: 'fixture-everyday-tee',
    title: 'The Everyday Tee',
    priceCents: 4200,
    tags: ['everyday', 'ca-cat:t-shirts', 'ca-audience:women'],
    collectionIds: ['everyday-uniform', 'womenswear', 'new-arrivals'],
    // Fully out-of-stock fixture for OOS UX
    unavailable: ['XS', 'S', 'M', 'L', 'XL'].map((size) => ({
      color: 'Oat',
      size,
    })),
  }),
  // Regression: Printify-style Colors/Sizes keys (Billy Muscle Tee / Sweatshirt bug)
  fixtureProduct({
    id: 'fixture-logo-muscle-tee',
    title: 'BLEND Logo Muscle Tee, Tank Top',
    priceCents: 2700,
    tags: ['everyday', 'ca-cat:t-shirts', 'ca-audience:unisex', 'just-dropped'],
    collectionIds: ['everyday-uniform', 'womenswear', 'menswear', 'new-arrivals'],
    releasedAt: '2026-11-06T12:00:00.000Z',
    colors: [
      'Faded Cream',
      'Faded Mustard',
      'Faded Brown',
      'Faded Army',
      'Faded Navy',
      'Faded Black',
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    // One true OOS cell — must stay struck; other sizes selectable
    unavailable: [{ color: 'Faded Cream', size: '2XL' }],
    printifyOptionKeys: true,
  }),
];

export const FIXTURE_COLLECTIONS: Collection[] = [
  {
    id: 'menswear',
    slug: 'menswear',
    title: 'Menswear',
    description: 'Quiet structure for coastal days.',
    // Deep link into menswear PLP (collection context)
    href: '/men',
    image: {
      // WebP (~130KB) — large PNGs (~2.3MB) stalled /_next/image on cold home paint.
      src: '/editorial/collections/tile-men.webp',
      alt: 'Menswear — The Everyday Collection',
      isPlaceholder: false,
    },
  },
  {
    id: 'womenswear',
    slug: 'womenswear',
    title: 'Womenswear',
    description: 'Soft lines, lasting presence.',
    href: '/women',
    image: {
      src: '/editorial/collections/tile-women.webp',
      alt: 'Womenswear — The Everyday Collection',
      isPlaceholder: false,
    },
  },
  {
    id: 'new-arrivals',
    slug: 'new-arrivals',
    title: 'New Arrivals',
    description: 'The latest for The Art of Everyday.',
    // Deep link into New Arrivals PLP with newest sort context
    href: '/new-arrivals?sort=newest',
    image: {
      src: '/editorial/collections/tile-new-arrivals.webp',
      alt: 'New Arrivals — The Everyday Collection',
      isPlaceholder: false,
    },
  },
];

export const FIXTURE_PLACEHOLDER_IMAGE = placeholder('BLEND');
