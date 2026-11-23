import { Suspense } from 'react';
import Image from 'next/image';
import { PageHero } from '@/components/coastal/page-hero';
import { CollectionDiscovery } from '@/components/coastal/discovery/collection-discovery';
import { PlpView } from '@/components/coastal/plp-view';
import { ProductGridSkeleton } from '@/components/coastal/product-grid-skeleton';
import { cn } from '@/lib/utils';
import type { Product } from '@/services/types';

interface CollectionLandingProps {
  eyebrow: string;
  title: string;
  description: string;
  editorialTitle?: boolean;
  products: Product[];
  usingFixtures: boolean;
  /** Live catalog failed and fixtures were withheld — show unavailable state. */
  catalogUnavailable?: boolean;
  activeCollection?: 'all' | 'men' | 'women' | 'new-arrivals';
  /**
   * Product Discovery UX (toolbar + filter drawer, Phase 1 + 2B polish).
   * Enabled on collection PLPs (`/women`, `/men`, `/new-arrivals`, `/shopping`).
   */
  discoveryMode?: boolean;
  /** Optional atmospheric collection banner (Men / Women photography). */
  bannerImage?: string;
  bannerAlt?: string;
  /** object-position utilities for faces / logos under cover crop. */
  bannerObjectPositionClassName?: string;
  /**
   * Soft Minimal copy overlaid on the banner empty side
   * (opposite the model / couple).
   */
  bannerOverlay?: {
    headline: string;
    support?: string;
    /** Empty side of the plate — left for Women/New, right for Men. */
    side: 'left' | 'right';
  };
}

export function CollectionLanding({
  eyebrow,
  title,
  description,
  editorialTitle = false,
  products,
  usingFixtures,
  catalogUnavailable = false,
  activeCollection,
  discoveryMode = false,
  bannerImage,
  bannerAlt,
  bannerObjectPositionClassName = 'object-center',
  bannerOverlay,
}: CollectionLandingProps) {
  const collectionLinks = [
    { href: '/shopping', label: 'All', active: activeCollection === 'all' },
    { href: '/men', label: 'Men', active: activeCollection === 'men' },
    { href: '/women', label: 'Women', active: activeCollection === 'women' },
    {
      href: '/new-arrivals',
      label: 'New Arrivals',
      active: activeCollection === 'new-arrivals',
    },
  ];

  const overlayOnLeft = bannerOverlay?.side !== 'right';

  return (
    <main>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        editorial={editorialTitle}
      />
      <div
        className={
          discoveryMode
            ? 'ca-container py-8 sm:py-12'
            : 'ca-container py-12 sm:py-16'
        }
      >
        {catalogUnavailable ? (
          <div
            role="alert"
            className={
              discoveryMode
                ? 'mb-4 border border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] px-4 py-4'
                : 'mb-8 border border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] px-4 py-4'
            }
          >
            <p className="font-body text-sm font-medium text-mineral-ink">
              Catalog temporarily unavailable.
            </p>
            <p className="mt-2 font-body text-sm text-mineral-ink/70">
              We couldn&apos;t load the live collection right now. Please refresh or try again
              shortly.
            </p>
          </div>
        ) : usingFixtures ? (
          <div
            role="status"
            className={
              discoveryMode
                ? 'mb-4 border border-dusk-rose/40 bg-[color-mix(in_srgb,var(--ca-dusk-rose)_12%,var(--ca-linen))] px-4 py-3'
                : 'mb-8 border border-dusk-rose/40 bg-[color-mix(in_srgb,var(--ca-dusk-rose)_12%,var(--ca-linen))] px-4 py-3'
            }
          >
            <p className="ca-eyebrow text-mineral-ink">
              Development fixtures only
            </p>
            <p className="mt-2 font-body text-sm text-mineral-ink/70">
              The live catalog is unavailable in this environment. These items are{' '}
              <strong className="font-medium">not production inventory or pricing</strong> and
              cannot be checked out.
            </p>
          </div>
        ) : (
          <p className="ca-eyebrow mb-8 text-haze-blue">
            Live catalog
          </p>
        )}

        {/* Atmospheric category band — Soft Minimal overlay on empty plate side */}
        {bannerImage ? (
          <figure
            className={
              discoveryMode
                ? 'relative mb-8 aspect-[24/7] w-full overflow-hidden bg-oat sm:mb-12 sm:aspect-[21/7]'
                : 'relative mb-8 aspect-[21/9] w-full overflow-hidden bg-oat md:mb-16'
            }
          >
            <Image
              src={bannerImage}
              alt={bannerAlt || ''}
              fill
              sizes="(max-width: 1360px) 100vw, 1360px"
              className={`object-cover ${bannerObjectPositionClassName}`}
              priority
            />

            {bannerOverlay ? (
              <>
                <div
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute inset-y-0 w-[min(22rem,48%)] sm:w-[min(26rem,42%)]',
                    overlayOnLeft
                      ? 'left-0 bg-gradient-to-r from-cotton/75 via-cotton/40 to-transparent'
                      : 'right-0 bg-gradient-to-l from-cotton/75 via-cotton/40 to-transparent'
                  )}
                />
                <figcaption
                  className={cn(
                    'absolute inset-y-0 z-10 flex w-[min(20rem,55%)] items-center px-4 sm:w-[min(22rem,40%)] sm:px-6 md:px-8',
                    overlayOnLeft ? 'left-0' : 'right-0 justify-end text-right'
                  )}
                >
                  <div className="max-w-[16rem] sm:max-w-[18rem]">
                    <p className="ca-editorial-display text-[clamp(1.15rem,0.95rem+0.7vw,1.65rem)] font-medium leading-snug tracking-[-0.015em] text-mineral-ink">
                      {bannerOverlay.headline}
                    </p>
                    {bannerOverlay.support ? (
                      <p className="ca-lede mt-2 text-sm text-mineral-ink/80 sm:mt-3 sm:text-base">
                        {bannerOverlay.support}
                      </p>
                    ) : null}
                  </div>
                </figcaption>
              </>
            ) : null}
          </figure>
        ) : (
          <div
            className={
              discoveryMode
                ? 'mb-8 aspect-[24/7] w-full overflow-hidden bg-oat sm:mb-12 sm:aspect-[21/7]'
                : 'mb-8 aspect-[21/9] w-full overflow-hidden bg-oat md:mb-16'
            }
            aria-hidden="true"
          >
            <div className="h-full w-full bg-[linear-gradient(120deg,#91a7af,#ddd4c9_50%,#bfa4a1)] ca-grain opacity-90" />
          </div>
        )}

        <Suspense fallback={<ProductGridSkeleton />}>
          {discoveryMode ? (
            <CollectionDiscovery
              products={products}
              usingFixtures={usingFixtures}
              activeCollection={activeCollection || 'all'}
            />
          ) : (
            <PlpView
              products={products}
              usingFixtures={usingFixtures}
              collectionLinks={collectionLinks}
            />
          )}
        </Suspense>
      </div>
    </main>
  );
}
