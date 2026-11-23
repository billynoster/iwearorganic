/**
 * Our Story hero — Brand Kit v1.4.
 * Brand-first: page title + primary tagline, calm lede. No heritage chapter chrome.
 */
export function AboutHero() {
  return (
    <header className="border-b border-oat/70 bg-cotton">
      <div className="ca-container py-14 sm:py-16 md:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl animate-ca-fade-up motion-reduce:animate-none">
          <p className="ca-eyebrow mb-4 text-forest sm:mb-5">Our Story</p>
          <h1 className="ca-editorial-display text-hero text-mineral-ink">
            Wear Better. Naturally.
          </h1>
          <p className="ca-lede mt-6 max-w-md sm:mt-7">
            Organic apparel for everyday life — where organic isn&apos;t a
            collection. It&apos;s the entire store.
          </p>
        </div>
      </div>
    </header>
  );
}
