import Image from 'next/image';
import Link from 'next/link';

const LIFESTYLE_IMAGE = '/editorial/lookbook/film-still.png';

/**
 * Single editorial lifestyle moment — emotional storytelling without
 * competing product grids or multi-card layouts.
 */
export function EditorialLifestyle() {
  return (
    <section
      aria-labelledby="lifestyle-heading"
      className="relative overflow-hidden"
    >
      <div className="relative min-h-[58svh] md:min-h-[64svh] lg:aspect-[16/9] lg:min-h-0">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={LIFESTYLE_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[68%_12%] md:object-[72%_10%]"
            priority={false}
          />
          <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-mineral-ink/78 via-mineral-ink/36 to-transparent md:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[min(36rem,50%)] bg-gradient-to-r from-mineral-ink/82 via-mineral-ink/46 to-transparent md:block lg:w-[min(34rem,46%)]" />
        </div>

        <div className="ca-container relative z-10 flex min-h-[58svh] items-end pb-12 pt-20 md:min-h-[64svh] md:items-center md:pb-16 lg:h-full lg:min-h-0">
          <div className="max-w-[18rem] sm:max-w-sm md:max-w-md">
            <h2
              id="lifestyle-heading"
              className="ca-editorial-display text-editorial text-linen"
            >
              Naturally Your Own.
            </h2>
            <p className="ca-lede mt-4 text-linen/90">
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
