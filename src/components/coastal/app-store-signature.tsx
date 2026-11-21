import { AppStoreBadge } from '@/components/ui/app-store-badge';

/**
 * Compact App Store Signature — between Worn Your Way and footer.
 * Phase 4: Instrument Serif headline; official badge; no device mockup.
 */
export function AppStoreSignature() {
  return (
    <section
      id="app-store"
      aria-labelledby="app-store-heading"
      className="ca-section-y border-t border-oat bg-linen pb-[calc(var(--ca-section-y)*0.75)]"
    >
      <div className="ca-container">
        <div className="flex flex-col gap-6 py-8 sm:gap-7 md:flex-row md:items-center md:justify-between md:gap-10 md:py-10">
          <div className="min-w-0 max-w-2xl flex-1">
            <p className="ca-eyebrow mb-2">
              i wear organic / On the Go
            </p>
            <h2
              id="app-store-heading"
              className="ca-editorial-display text-editorial-promo text-mineral-ink"
            >
              blend goes wherever you go.
            </h2>
            <p className="ca-lede mt-3 max-w-xl">
              Discover and shop i wear organic on your iPhone. Available on the App
              Store.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
            <AppStoreBadge size="lg" className="min-h-11" />
            <p className="ca-caption">
              Available for iPhone
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
