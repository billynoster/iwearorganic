import Link from 'next/link';

const HERO_DESKTOP = '/editorial/heroes/home-hero-desktop.webp';
const HERO_DESKTOP_1920 = '/editorial/heroes/home-hero-desktop-1920.webp';
const HERO_MOBILE = '/editorial/heroes/home-hero-mobile.webp';

/**
 * Homepage hero — brand kit §26 / §46
 * Soft Minimal coastal plates: desktop 16:9 (subject right, copy left),
 * dedicated mobile 4:5. Manrope Medium headline. Localized cotton wash only.
 */
export function CinematicHero() {
  return (
    <section aria-label="Campaign hero" className="relative">
      <div className="relative min-h-[78svh] overflow-hidden md:aspect-[16/9] md:min-h-0">
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
              className="absolute inset-0 h-full w-full object-cover object-[50%_38%] md:object-[78%_46%]"
            />
          </picture>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-cotton/90 via-cotton/45 to-transparent md:hidden"
            aria-hidden="true"
          />
          {/* Soft left wash for copy over coastal negative space */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[min(26rem,32%)] bg-gradient-to-r from-cotton/70 via-cotton/35 to-transparent md:block lg:w-[min(24rem,28%)]"
            aria-hidden="true"
          />
        </div>

        <div className="ca-container relative z-10 flex min-h-[78svh] items-end pb-12 pt-24 md:min-h-0 md:h-full md:items-center md:pb-20 md:pt-16">
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
