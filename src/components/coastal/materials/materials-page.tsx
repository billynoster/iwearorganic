import Link from 'next/link';

const PRINCIPLES = [
  {
    title: 'Feel',
    body: 'The fabric should feel comfortable against the skin.',
  },
  {
    title: 'Function',
    body: 'The material should suit the way the garment is actually worn.',
  },
  {
    title: 'Longevity',
    body: 'Clothing should be made for repeated everyday use.',
  },
  {
    title: 'Transparency',
    body: 'You should be able to understand what your clothing is made from without decoding marketing language.',
  },
] as const;

/**
 * Materials page — Brand Kit v1.4.
 * Clear material facts; no vague eco claims.
 */
export function MaterialsPageContent() {
  return (
    <main>
      <header className="border-b border-oat/70 bg-cotton">
        <div className="ca-container py-14 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-2xl animate-ca-fade-up motion-reduce:animate-none">
            <p className="ca-eyebrow mb-4 text-forest sm:mb-5">Materials</p>
            <h1 className="ca-editorial-display text-hero text-mineral-ink">
              Better Starts with the Material.
            </h1>
            <div className="ca-lede mt-6 max-w-md space-y-4 sm:mt-7">
              <p>
                The feel of a garment begins long before it becomes a hoodie,
                sweatshirt, or tee.
              </p>
              <p>It starts with the fibers.</p>
              <p>
                At I Wear Organic, we prioritize organic materials because we
                want the clothing we make to feel soft, natural, comfortable,
                and considered from the beginning.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white">
        <section
          id="organic-cotton"
          aria-labelledby="organic-cotton-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="organic-cotton-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                Organic Cotton
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>Organic cotton is at the center of our material approach.</p>
                <p>
                  We use it across our collection because of its natural feel,
                  breathability, softness, and versatility.
                </p>
                <p>
                  Depending on the garment, organic cotton may be used alone or
                  combined with other carefully selected fibers to support
                  structure, warmth, durability, or performance.
                </p>
                <p>
                  Each product page clearly lists its specific material
                  composition.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="recycled"
          aria-labelledby="recycled-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="recycled-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                Recycled Materials
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>
                  Some garments may include recycled fibers where they help
                  improve warmth, structure, durability, or everyday
                  performance.
                </p>
                <p>
                  For example, a fleece hoodie may combine organic cotton with
                  recycled polyester.
                </p>
                <p>
                  When recycled materials are used, we identify them clearly
                  rather than presenting the garment simply as “organic.”
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-we-think"
          aria-labelledby="how-we-think-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="how-we-think-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                How We Think About Fabric
              </h2>
              <p className="ca-lede mt-6 sm:mt-8">
                We look for materials that support four things:
              </p>
              <ul className="mt-8 space-y-8">
                {PRINCIPLES.map((item) => (
                  <li key={item.title}>
                    <h3 className="font-body text-base font-medium text-mineral-ink sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="ca-lede mt-2">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          id="composition"
          aria-labelledby="composition-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="composition-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                Material Composition
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>Not every garment will use the exact same fiber blend.</p>
                <p>Some products may be:</p>
                <p className="font-body text-base font-medium text-mineral-ink">
                  100% Organic Cotton
                </p>
                <p>Others may use combinations such as:</p>
                <p className="font-body text-base font-medium text-mineral-ink">
                  Organic Cotton + Recycled Polyester
                </p>
                <p>
                  The exact composition for each garment is always listed on its
                  product page.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/shopping" className="ca-text-link">
                  Shop the collection
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="designed-to-be-worn"
          aria-labelledby="designed-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="designed-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                Designed to Be Worn
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>We choose materials with real life in mind.</p>
                <p>Soft enough for slow mornings.</p>
                <p>Comfortable enough for travel.</p>
                <p>Easy enough for everyday wear.</p>
                <p>
                  Refined enough to become part of your regular wardrobe.
                </p>
                <p>
                  Because better materials only matter if you actually want to
                  wear them.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        aria-labelledby="materials-closing-heading"
        className="border-t border-oat/70 bg-cotton"
      >
        <div className="ca-container py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="materials-closing-heading"
              className="ca-editorial-display text-[clamp(2.25rem,1.6rem+2.6vw,4.25rem)] leading-[1.08] tracking-[-0.015em] text-mineral-ink"
            >
              Wear Better. Naturally.
            </h2>
            <div className="mt-10">
              <Link href="/shopping" className="ca-btn-primary">
                Explore the collection
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
