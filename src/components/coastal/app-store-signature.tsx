import { AppStoreBadge } from '@/components/ui/app-store-badge';

/**
 * Compact App Store strip — precedes the footer.
 * Reduced vertical padding vs. prior homepage block.
 */
export function AppStoreSignature() {
  return (
    <section
      id="app-store"
      aria-labelledby="app-store-heading"
      className="border-t border-oat bg-cotton py-10 sm:py-12 md:py-14"
    >
      <div className="ca-container">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="min-w-0 max-w-2xl flex-1">
            <p className="ca-eyebrow mb-2">Shop Anywhere</p>
            <h2
              id="app-store-heading"
              className="ca-editorial-display text-editorial-promo text-mineral-ink"
            >
              I Wear Organic. Wherever You Are.
            </h2>
            <p className="ca-lede mt-3 max-w-xl">
              Discover new arrivals, save favorites, and shop I Wear Organic from
              your iPhone.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
            <AppStoreBadge size="lg" className="min-h-11" />
            <p className="ca-caption">Download on the App Store</p>
          </div>
        </div>
      </div>
    </section>
  );
}
