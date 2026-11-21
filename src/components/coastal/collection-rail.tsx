import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Collection } from '@/services/types';

interface CollectionRailProps {
  collections: Collection[];
  usingFixtures?: boolean;
}

const FALLBACK_GRADIENTS = [
  'linear-gradient(160deg,#8fa3a8 0%,#c4b5a8 55%,#a89088 100%)',
  'linear-gradient(200deg,#b7a39a 0%,#d4c6b8 50%,#91a7af 100%)',
  'linear-gradient(175deg,#9aaba8 0%,#ddd4c9 60%,#bfa4a1 100%)',
];

/**
 * Shop by Collection — Phase 4
 * Photography-first tiles; consistent bottom-localized label contrast.
 * Secondary descriptive copy trimmed so category names stay primary.
 */
export function CollectionRail({ collections }: CollectionRailProps) {
  return (
    <section
      aria-labelledby="category-heading"
      className="ca-section-y"
    >
      <div className="ca-container">
        <h2 id="category-heading" className="sr-only">
          Shop by category
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {collections.map((collection, index) => {
            const showPhoto =
              Boolean(collection.image?.src) && !collection.image.isPlaceholder;

            return (
              <li key={collection.id}>
                <Link
                  href={collection.href}
                  aria-label={`Shop ${collection.title}`}
                  className="group relative block aspect-[3/4] min-h-11 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
                >
                  {/* Tonal base under photos so linen-on-linen labels never look like a stuck skeleton
                      while /_next/image is cold (large PNGs previously timed out / 502'd). */}
                  <div
                    className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                    style={{ background: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] }}
                    aria-hidden="true"
                  />
                  {showPhoto ? (
                    <Image
                      src={collection.image.src}
                      alt={collection.image.alt || collection.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      // First tile shares the fold with the hero — eager only that one.
                      // Later tiles stay lazy so they don't contend with LCP on constrained links.
                      // Serve public WebP as-is (quality); responsive sizes still gate decode cost.
                      priority={index === 0}
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  ) : (
                    <div className="absolute inset-0 ca-grain opacity-40" aria-hidden="true" />
                  )}
                  {/* Consistent bottom-localized contrast across all tiles */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-t from-mineral-ink/90 via-mineral-ink/48 to-transparent"
                    aria-hidden="true"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                    <h3 className="ca-display text-h3 text-linen [text-shadow:0_1px_10px_rgba(48,52,53,0.35)]">
                      {collection.title}
                    </h3>
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-linen/70 bg-mineral-ink/25 text-linen transition-colors group-hover:bg-linen group-hover:text-mineral-ink"
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
