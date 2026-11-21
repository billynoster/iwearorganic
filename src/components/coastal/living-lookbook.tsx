import Image from 'next/image';
import Link from 'next/link';

const FILM_STILL = '/editorial/lookbook/film-still.png';
/** Published Lookbook edit matching Coast Edit / Film 001 still */
const LOOKBOOK_EDIT_HREF = '/lookbook/city-days';

/**
 * Option B — The Living Lookbook / In Motion (Phase 4)
 * Full-width cinematic banner. Instrument Serif headline.
 * Explore the Edit → published City Days Lookbook. No film playback UI.
 */
export function LivingLookbook() {
  return (
    <section
      id="lookbook"
      aria-labelledby="lookbook-heading"
      className="relative overflow-hidden"
    >
      <div className="relative min-h-[62svh] md:min-h-[70svh] lg:aspect-[16/9] lg:min-h-0">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src={FILM_STILL}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[68%_12%] md:object-[72%_10%]"
            priority={false}
          />
          {/* Localized tonal for linen copy — denser left wash for sunlit street AA */}
          <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-mineral-ink/78 via-mineral-ink/36 to-transparent md:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[min(36rem,50%)] bg-gradient-to-r from-mineral-ink/82 via-mineral-ink/46 to-transparent md:block lg:w-[min(34rem,46%)]" />
        </div>

        <div className="ca-container relative z-10 flex min-h-[62svh] items-end pb-12 pt-20 md:min-h-[70svh] md:items-center md:pb-16 lg:min-h-0 lg:h-full">
          <div className="max-w-[18rem] sm:max-w-sm md:max-w-md">
            <p className="ca-eyebrow mb-4 text-linen/90">
              03 / In Motion
            </p>
            <h2
              id="lookbook-heading"
              className="ca-editorial-display text-editorial text-linen [text-shadow:0_1px_18px_rgba(48,52,53,0.35)]"
            >
              Not just worn.
              <br className="hidden sm:block" /> Lived in.
            </h2>
            <p className="ca-caption mt-4 text-linen/85">
              The Coast Edit / Film 001
            </p>
            <div className="mt-8">
              <Link href={LOOKBOOK_EDIT_HREF} className="ca-btn-secondary">
                Explore the Edit
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
