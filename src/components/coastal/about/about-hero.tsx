import { EditorialImage } from '@/components/coastal/about/editorial-image';

const HERO_IMAGE = '/editorial/about/hero.png';

/**
 * About — editorial heritage hero.
 * Asymmetric: headline left, origin beanie product photo right.
 * Not a full-bleed campaign overlay (homepage pattern).
 */
export function AboutHero() {
  return (
    <header className="border-b border-oat/70 bg-linen">
      <div className="ca-container py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
          <div className="max-w-[40rem] animate-ca-fade-up motion-reduce:animate-none md:col-span-6 lg:col-span-6">
            <p className="ca-eyebrow mb-4 text-haze-blue sm:mb-5">
              Est. 1997 — Chicago, Illinois
            </p>
            <h1 className="ca-editorial-display max-w-[20ch] text-[clamp(2.875rem,1.8rem+4.2vw,6.5rem)] leading-[0.98] tracking-[-0.02em] text-mineral-ink">
              It started with a beanie.
            </h1>
            <p className="ca-lede mt-6 max-w-md sm:mt-7">
              A simple idea. An independent spirit. A story that began in Chicago.
            </p>
          </div>

          <div className="md:col-span-6 lg:col-span-5 lg:col-start-8">
            <EditorialImage
              src={HERO_IMAGE}
              alt="Red ribbed BLEND beanie — origin product photography for the brand's beginnings with beanies."
              aspect="aspect-[4/5] md:aspect-[3/4]"
              sizes="(max-width: 768px) 100vw, 42vw"
              priority
              objectPosition="center"
              caption="Origin product · beanie"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
