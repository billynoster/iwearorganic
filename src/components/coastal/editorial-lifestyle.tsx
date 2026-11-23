import Link from 'next/link';

const LIFESTYLE_DESKTOP = '/editorial/lookbook/lifestyle-desktop.webp';
const LIFESTYLE_DESKTOP_1920 = '/editorial/lookbook/lifestyle-desktop-1920.webp';
const LIFESTYLE_MOBILE = '/editorial/lookbook/lifestyle-mobile.webp';

/**
 * Lifestyle section — Brand Kit §29.
 * Dedicated desktop 16:9 + mobile 4:5 Soft Minimal coastal plates.
 */
export function EditorialLifestyle() {
  return (
    <section
      aria-labelledby="lifestyle-heading"
      className="relative mt-[var(--ca-section-y)] overflow-hidden"
    >
      <div className="relative min-h-[58svh] md:min-h-[64svh] lg:aspect-[16/9] lg:min-h-0">
        <div className="absolute inset-0" aria-hidden="true">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet={`${LIFESTYLE_DESKTOP_1920} 1920w, ${LIFESTYLE_DESKTOP} 2880w`}
              sizes="100vw"
              type="image/webp"
            />
            <img
              src={LIFESTYLE_MOBILE}
              alt=""
              width={1200}
              height={1500}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[50%_36%] md:object-[72%_48%]"
            />
          </picture>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-cotton/90 via-cotton/45 to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[min(26rem,32%)] bg-gradient-to-r from-cotton/70 via-cotton/35 to-transparent md:block lg:w-[min(24rem,28%)]" />
        </div>

        <div className="ca-container relative z-10 flex min-h-[58svh] items-end pb-12 pt-20 md:min-h-[64svh] md:items-center md:pb-16 lg:h-full lg:min-h-0">
          <div className="max-w-[18rem] sm:max-w-sm md:max-w-md">
            <h2
              id="lifestyle-heading"
              className="ca-editorial-display text-editorial text-mineral-ink"
            >
              Naturally Your Own.
            </h2>
            <p className="ca-lede mt-4 text-mineral-ink/85">
              Easy layers. Thoughtful materials. Made to fit the way you live.
            </p>
            <div className="mt-8">
              <Link href="/shopping" className="ca-btn-secondary">
                Explore the Collection
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
