import Link from 'next/link';
import { Logo } from '@/components/logo';

/** Closing brand signature + shop CTA. */
export function BrandClosingStatement() {
  return (
    <section
      aria-labelledby="about-closing-heading"
      className="border-t border-oat/70 bg-cotton"
    >
      <div className="ca-container py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="about-closing-heading"
            className="ca-editorial-display text-[clamp(2.25rem,1.6rem+2.6vw,4.25rem)] leading-[1.08] tracking-[-0.015em] text-mineral-ink"
          >
            Wear Better. Naturally.
          </h2>
          <div className="mx-auto mt-8 max-w-xs border-t border-oat pt-8">
            <div className="flex justify-center">
              <Logo variant="forest" className="w-[132px]" />
            </div>
            <p className="ca-meta mt-3">
              Organic isn&apos;t a collection.
              <br />
              It&apos;s the entire store.
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
