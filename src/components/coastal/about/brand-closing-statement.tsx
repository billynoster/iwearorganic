import Link from 'next/link';

/** Closing brand signature + verified shop CTA (`/shopping`). */
export function BrandClosingStatement() {
  return (
    <section
      aria-labelledby="about-closing-heading"
      className="border-t border-oat/70 bg-linen"
    >
      <div className="ca-container py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="ca-eyebrow mb-5 text-haze-blue">
            blend america / Est. 1997
          </p>
          <h2
            id="about-closing-heading"
            className="ca-editorial-display text-[clamp(2.25rem,1.6rem+2.6vw,4.25rem)] leading-[1.08] tracking-[-0.015em] text-mineral-ink"
          >
            Born in Chicago.
            <br />
            Made for wherever life takes you.
          </h2>
          <p className="ca-editorial mt-6 text-lg text-mineral-ink/60 sm:text-xl">
            Independent since 1997.
          </p>
          <div className="mx-auto mt-8 max-w-xs border-t border-oat pt-8">
            <p className="font-brand text-base font-bold lowercase tracking-tight text-mineral-ink">
              blend america.
            </p>
            <p className="ca-meta mt-3">
              Independent since 1997.
              <br />
              Born in Chicago. Made for wherever life takes you.
            </p>
          </div>
          <div className="mt-10">
            <Link href="/shopping" className="ca-btn-primary !rounded-[6px]">
              Explore the Collection
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
