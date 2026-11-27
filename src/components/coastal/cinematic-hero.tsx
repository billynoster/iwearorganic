import Link from 'next/link';

const HERO_DESKTOP = '/editorial/heroes/home-hero-desktop.webp';
const HERO_DESKTOP_1920 = '/editorial/heroes/home-hero-desktop-1920.webp';
const HERO_MOBILE = '/editorial/heroes/home-hero-mobile.webp';

/**
 * Homepage hero — brand kit §26 / §46
 * Soft Minimal coastal plate: 16:9 (couple right, open sky + coast left for copy).
 * Mobile uses a dedicated 4:5 (1200×1500) plate. Manrope Medium headline.
 * Localized cotton wash only.
 */
export function CinematicHero() {
  return (
    <section aria-label="Campaign hero" className="relative">
      <div className="relative overflow-hidden bg-cotton md:aspect-[16/9] md:bg-transparent">
        <link
          rel="preload"
          as="image"
          href={HERO_DESKTOP_1920}
          imageSrcSet={`${HERO_DESKTOP} 1672w, ${HERO_DESKTOP_1920} 1920w`}
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

        <div
          className="relative aspect-[4/5] md:absolute md:inset-0 md:aspect-auto"
          aria-hidden="true"
        >
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet={`${HERO_DESKTOP} 1672w, ${HERO_DESKTOP_1920} 1920w`}
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
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </picture>
          {/* Soft left wash for copy over coastal negative space */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[min(26rem,32%)] bg-gradient-to-r from-cotton/70 via-cotton/35 to-transparent md:block lg:w-[min(24rem,28%)]"
            aria-hidden="true"
          />
        </div>

        <div className="ca-container relative z-10 pb-12 pt-10 md:flex md:h-full md:items-center md:pb-20 md:pt-16">
          <div className="max-w-[18rem] animate-ca-fade-up motion-reduce:animate-none sm:max-w-[22rem] md:max-w-[26rem] lg:max-w-[28rem]">
            <h1 className="ca-editorial-display text-hero text-mineral-ink">
              Wear Better. Naturally.
            </h1>
            <p className="ca-lede mt-5 max-w-[22rem] text-mineral-ink/85">
              Organic clothing made for everyday life.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/women" className="ca-btn-primary" aria-label="Shop Women">
                Shop Women
              </Link>
              <Link href="/men" className="ca-btn-secondary" aria-label="Shop Men">
                Shop Men
              </Link>
            </div>
            <div className="mt-5">
              <Link href="/about" className="ca-text-link text-mineral-ink/70">
                Why Organic?
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
