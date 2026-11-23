import Image from 'next/image';
import Link from 'next/link';

/** Soft material / lifestyle plate — single visual, no card grid. */
const BRAND_IMAGE = '/editorial/lookbook/everyday-edit.webp';

/**
 * Brand proposition — one calm differentiator beat between shop and lifestyle.
 */
export function BrandProposition() {
  return (
    <section
      aria-labelledby="brand-proposition-heading"
      className="ca-section-y bg-cotton"
    >
      <div className="ca-container">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
            <Image
              src={BRAND_IMAGE}
              alt="Couple in I Wear Organic hoodies on a coastal shore"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-[50%_40%]"
            />
          </div>

          <div className="max-w-md md:justify-self-start">
            <h2
              id="brand-proposition-heading"
              className="ca-editorial-display text-editorial-section text-mineral-ink"
            >
              Organic Isn&apos;t a Collection. It&apos;s the Entire Store.
            </h2>
            <p className="ca-lede mt-5">
              Every piece begins with organic materials, so you never have to
              search for the better option.
            </p>
            <div className="mt-8">
              <Link href="/about" className="ca-text-link">
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
