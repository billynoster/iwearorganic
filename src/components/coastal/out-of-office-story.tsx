import Link from 'next/link';

/**
 * Option B — Section 04 Out of Office
 * Asymmetric editorial magazine spread (not a standard two-column marketing block).
 * CTA routes to Coastal Hours Style Edit (OOO-specific assets still draft).
 */
export function OutOfOfficeStory() {
  return (
    <section
      id="out-of-office"
      aria-labelledby="ooo-heading"
      className="border-y border-oat/70 bg-linen"
    >
      <div className="ca-container py-16 sm:py-20 md:py-28">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-6 lg:gap-8">
          {/* Primary lifestyle portrait */}
          <figure className="relative md:col-span-5 lg:col-span-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-oat">
              <div
                className="absolute inset-0 bg-[linear-gradient(165deg,#8a9694_0%,#c9b8a8_45%,#a89890_100%)]"
                aria-hidden="true"
              />
              <div className="absolute inset-0 ca-grain opacity-35" aria-hidden="true" />
              <figcaption className="absolute bottom-3 left-3 font-body text-[0.625rem] uppercase tracking-[0.16em] text-linen/75">
                Placeholder portrait
              </figcaption>
            </div>
          </figure>

          {/* Editorial copy column */}
          <div className="flex flex-col justify-center md:col-span-4 md:px-2 lg:col-span-4 lg:px-6 md:min-h-[28rem]">
            <p className="ca-eyebrow mb-3">02 / The Lookbook</p>
            <h2
              id="ooo-heading"
              className="ca-display text-h2"
            >
              Out of Office.
            </h2>
            <p className="mt-5 max-w-sm ca-lede">
              Open roads, ocean air, and the pieces you reach for again and again.
            </p>
            <div className="mt-8">
              <Link href="/lookbook/coastal-hours" className="ca-text-link font-medium underline">
                Explore the Edit
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Stacked environmental frames */}
          <div className="grid grid-cols-2 gap-3 md:col-span-3 md:grid-cols-1 md:gap-5 lg:col-span-4">
            <figure className="relative aspect-[4/3] overflow-hidden bg-oat md:aspect-[16/10]">
              <div
                className="absolute inset-0 bg-[linear-gradient(120deg,#91a7af,#ddd4c9_70%)]"
                aria-hidden="true"
              />
              <div className="absolute inset-0 ca-grain opacity-30" aria-hidden="true" />
              <figcaption className="sr-only">Placeholder coastal road</figcaption>
            </figure>
            <figure className="relative aspect-[4/3] overflow-hidden bg-oat md:aspect-[16/10] md:mt-2">
              <div
                className="absolute inset-0 bg-[linear-gradient(200deg,#bfa4a1,#91a7af_65%)]"
                aria-hidden="true"
              />
              <div className="absolute inset-0 ca-grain opacity-30" aria-hidden="true" />
              <figcaption className="sr-only">Placeholder ocean air</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
