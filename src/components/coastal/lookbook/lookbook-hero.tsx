import Image from 'next/image';

const HERO_DESKTOP = '/editorial/heroes/lookbook-hero-desktop.webp';
const HERO_MOBILE = '/editorial/heroes/lookbook-hero-mobile.webp';

/**
 * Lookbook landing cinematic hero — Phase 8A storytelling.
 * Instrument Serif editorial H1; DM Sans eyebrow/lede; italic tagline accent.
 * Copy sits on a near-opaque linen veil (soft right fade — not a dark card) so mineral-ink reads solid.
 */
export function LookbookHero() {
  return (
    <section aria-label="Lookbook hero" className="relative">
      {/*
        md+: lock 16/9 so object-cover matches the plate (no tall-svh zoom).
        Mobile keeps svh height for the stacked veil + type.
        unoptimized: serve public WebP plate as-is — /_next/image was q=75 by default and
        could leave the <img> at a ~1080px decode while CSS cover-scaled it up (soft/pixelated).
      */}
      <div className="relative min-h-[72svh] overflow-hidden md:aspect-[16/9] md:min-h-0">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={HERO_MOBILE}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-[36%_40%] md:hidden"
          />
          <Image
            src={HERO_DESKTOP}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hidden object-cover object-[32%_42%] md:block"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-linen via-linen/80 to-transparent md:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[min(46rem,60%)] bg-gradient-to-r from-linen via-linen/90 via-40% to-transparent md:block lg:w-[min(44rem,54%)]"
            aria-hidden="true"
          />
        </div>

        <div className="ca-container relative z-10 flex min-h-[72svh] items-end pb-12 pt-24 md:min-h-0 md:h-full md:items-center md:pb-20 md:pt-16">
          <div className="relative max-w-xl animate-ca-fade-up motion-reduce:animate-none">
            {/* Near-opaque linen page behind copy; soft right mask keeps Coastal Analog calm */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-5 -inset-y-4 -z-10 bg-linen md:-inset-x-10 md:-inset-y-7"
              style={{
                WebkitMaskImage:
                  'linear-gradient(90deg, #000 0%, #000 58%, rgba(0,0,0,0.55) 78%, transparent 100%)',
                maskImage:
                  'linear-gradient(90deg, #000 0%, #000 58%, rgba(0,0,0,0.55) 78%, transparent 100%)',
              }}
            />
            <p className="ca-eyebrow mb-3 text-mineral-ink sm:mb-4">
              THE LOOKBOOK / VOL. 001
            </p>
            <h1 className="ca-editorial-display text-hero text-mineral-ink">
              Wear the moment.
            </h1>
            <p className="ca-lede mt-5 max-w-md text-mineral-ink">
              A collection of looks, places, and everyday moments. Find your style. Shop the
              pieces.
            </p>
            <p className="ca-editorial mt-6 text-base text-mineral-ink">
              Easy to wear. Hard to overlook.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
