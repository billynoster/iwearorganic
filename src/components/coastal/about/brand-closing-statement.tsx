import Link from 'next/link';

/** Closing brand signature + shop CTA (`/shopping`). */
export function BrandClosingStatement() {
  return (
    <section
      aria-labelledby="about-closing-heading"
      className="border-t border-oat/70 bg-cotton"
    >
      <div className="ca-container py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="ca-eyebrow mb-5 text-sage">I Wear Organic</p>
          <h2
            id="about-closing-heading"
            className="ca-editorial-display text-[clamp(2.25rem,1.6rem+2.6vw,4.25rem)] leading-[1.08] tracking-[-0.015em] text-mineral-ink"
          >
            Organic isn&apos;t a collection.
            <br />
            It&apos;s the entire store.
          </h2>
          <p className="ca-editorial mt-6 text-lg text-mineral-ink/60 sm:text-xl">
            Wear Better. Naturally.
          </p>
          <div className="mx-auto mt-8 max-w-xs border-t border-oat pt-8">
            <p className="font-brand text-base font-semibold tracking-tight text-forest">
              I Wear Organic.
            </p>
            <p className="ca-meta mt-3">
              Made with organic materials.
              <br />
              Made to be worn.
            </p>
          </div>
          <div className="mt-10">
            <Link href="/shopping" className="ca-btn-primary">
              Explore the collection
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
