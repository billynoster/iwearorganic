import Link from 'next/link';

const HERO_DESKTOP = '/editorial/heroes/home-hero-desktop.webp';
const HERO_DESKTOP_1920 = '/editorial/heroes/home-hero-desktop-1920.webp';
const HERO_MOBILE = '/editorial/heroes/home-hero-mobile.webp';

/**
 * Option B — Cinematic Hero (Phase 4 polish)
 * Full-bleed campaign photography. Instrument Serif editorial headline.
 * Text-safe left/bottom region + localized linen wash only (no full-bleed overlay).
 *
 * LCP: one art-directed plate via <picture> (not two priority Next Images),
 * plus media-scoped preloads so desktop never downloads the mobile crop and vice versa.
 * Public WebP served as-is (no /_next/image re-encode) with a 1920w desktop candidate
 * for 1x viewports while retaining the 2880 plate for retina.
 */
export function CinematicHero() {
  return (
    <section aria-label="Campaign hero" className="relative">
      {/*
        md+: lock 16/9 so object-cover matches the plate (no tall-svh zoom).
        Mobile keeps svh height for stacked type.
      */}
      <div className="relative min-h-[78svh] overflow-hidden md:aspect-[16/9] md:min-h-0">
        {/* Media-scoped preloads hoist to <head> (React 19) — LCP without dual-hero waste. */}
        <link
          rel="preload"
          as="image"
          href={HERO_DESKTOP_1920}
          imageSrcSet={`${HERO_DESKTOP_1920} 1920w, ${HERO_DESKTOP} 2880w`}
          imageSizes="100vw"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href={HERO_MOBILE}
          media="(max-width: 767.98px)"
          fetchPriority="high"
        />

        <div className="absolute inset-0" aria-hidden="true">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet={`${HERO_DESKTOP_1920} 1920w, ${HERO_DESKTOP} 2880w`}
              sizes="100vw"
              type="image/webp"
            />
            <img
              src={HERO_MOBILE}
              alt=""
              width={1200}
              height={1500}
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[42%_36%] md:object-[30%_40%]"
            />
          </picture>
          {/*
            Phase 6C: denser localized linen wash for mineral-ink copy AA contrast
            on bright studio heroes — still not a full-bleed dark overlay.
          */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-linen/88 via-linen/42 to-transparent md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[min(30rem,38%)] bg-gradient-to-r from-linen/92 via-linen/55 to-transparent md:block lg:w-[min(28rem,34%)]"
            aria-hidden="true"
          />
        </div>

        <div className="ca-container relative z-10 flex min-h-[78svh] items-end pb-12 pt-24 md:min-h-0 md:h-full md:items-center md:pb-20 md:pt-16">
          <div className="max-w-[17.5rem] animate-ca-fade-up motion-reduce:animate-none sm:max-w-[20rem] md:max-w-[22rem] lg:max-w-[23.5rem]">
            <p className="ca-eyebrow mb-3 text-mineral-ink/75 sm:mb-4">
              The Everyday Collection — Vol. 001
            </p>
            <h1 className="ca-editorial-display text-hero text-mineral-ink">
              Made for the Moment.
            </h1>
            <p className="ca-lede mt-5 max-w-[20rem] text-mineral-ink/85">
              Considered essentials for wherever the day takes you.
            </p>
            <div className="mt-8">
              <Link
                href="/shopping"
                className="ca-btn-primary !rounded-full"
                aria-label="Shop the Collection"
              >
                Shop the Collection
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
