import Image from 'next/image';

const LOGO_1997 = '/editorial/about/logo-1997.png';

/**
 * Sampled from About hero beanie (`public/editorial/about/hero.png`):
 * vivid knit ~#C11521; Billy target ~#C41E2A. Local panel only (no brand token).
 */
const BEANIE_RED = '#C41E2A';

/**
 * Chapter 01 visual — original 1997 white BLEND wordmark on beanie-red panel.
 * Beanie product lives on the About hero; Ch.01 keeps logo primary.
 */
export function HeritageLogoPanel() {
  return (
    <figure className="min-w-0">
      <div
        className="flex items-center justify-center px-8 py-10 sm:px-10 sm:py-12 md:aspect-[3/4] md:px-10 md:py-20 lg:px-12"
        style={{ backgroundColor: BEANIE_RED }}
      >
        <Image
          src={LOGO_1997}
          alt="Original BLEND logo designed by the founder in 1997 — white wordmark on a beanie-red panel."
          width={6894}
          height={1134}
          sizes="(max-width: 768px) 100vw, 42vw"
          className="h-auto w-full max-w-full animate-ca-fade-up motion-reduce:animate-none"
          priority
        />
      </div>
      <figcaption className="ca-caption mt-3">
        Original logo design · 1997
      </figcaption>
    </figure>
  );
}
