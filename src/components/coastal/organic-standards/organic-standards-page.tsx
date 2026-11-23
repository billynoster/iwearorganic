import Link from 'next/link';

const AVOID_TERMS = [
  'sustainable',
  'eco-friendly',
  'ethical',
  'green',
  'planet-friendly',
] as const;

const PREFER_FACTS = [
  'fiber composition',
  'organic content',
  'recycled content',
  'garment construction',
  'applicable certifications',
  'care information',
] as const;

/**
 * Organic Standards — Brand Kit v1.4.
 * Transparency over vague environmental claims.
 */
export function OrganicStandardsPageContent() {
  return (
    <main>
      <header className="border-b border-oat/70 bg-cotton">
        <div className="ca-container py-14 sm:py-16 md:py-20 lg:py-24">
          <div className="mx-auto max-w-2xl animate-ca-fade-up motion-reduce:animate-none">
            <p className="ca-eyebrow mb-4 text-forest sm:mb-5">
              Organic Standards
            </p>
            <h1 className="ca-editorial-display text-hero text-mineral-ink">
              Clear Standards. Clearer Choices.
            </h1>
            <div className="ca-lede mt-6 max-w-md space-y-4 sm:mt-7">
              <p>The word organic should mean something.</p>
              <p>
                At I Wear Organic, we believe material claims should be
                specific, understandable, and connected to the actual garment
                you&apos;re buying.
              </p>
              <p>
                That means we focus on transparency rather than broad
                environmental promises.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white">
        <section
          id="what-we-mean"
          aria-labelledby="what-we-mean-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="what-we-mean-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                What We Mean by Organic
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>
                  When we describe a fiber or material as organic, that claim
                  should be supported by the specifications and documentation
                  associated with the product or material.
                </p>
                <p>
                  We do not use “organic” as a vague lifestyle term.
                </p>
                <p>We use it to describe actual material content.</p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="every-product"
          aria-labelledby="every-product-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="every-product-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                Every Product Is Different
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>
                  Different garments may use different constructions and fiber
                  blends.
                </p>
                <p>A product might be:</p>
                <p className="font-body text-base font-medium text-mineral-ink">
                  100% Organic Cotton
                </p>
                <p>or</p>
                <p className="font-body text-base font-medium text-mineral-ink">
                  65% Organic Cotton / 35% Recycled Polyester
                </p>
                <p>
                  The important part is that you can see exactly what
                  you&apos;re buying.
                </p>
                <p>
                  Material composition should always be listed clearly on the
                  individual product page.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                <Link href="/materials" className="ca-text-link">
                  Materials
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/shopping" className="ca-text-link">
                  Shop the collection
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="certifications"
          aria-labelledby="certifications-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="certifications-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                Certifications
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>
                  Where a product or supplier carries a recognized
                  certification, we may identify that certification on the
                  relevant product or material page.
                </p>
                <p>
                  Certification information should only be displayed when it
                  applies to that specific product, fabric, supplier, or
                  production process.
                </p>
                <p>
                  We do not apply certification language broadly across products
                  where it cannot be verified.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="no-vague-claims"
          aria-labelledby="no-vague-claims-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="no-vague-claims-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                No Vague Sustainability Claims
              </h2>
              <p className="ca-lede mt-6 sm:mt-8">
                We avoid unsupported language such as:
              </p>
              <ul className="mt-4 space-y-2">
                {AVOID_TERMS.map((term) => (
                  <li
                    key={term}
                    className="font-body text-base font-medium text-mineral-ink"
                  >
                    {term}
                  </li>
                ))}
              </ul>
              <p className="ca-lede mt-6">
                unless there is clear information behind the claim.
              </p>
              <p className="ca-lede mt-6">
                Instead, we prefer to tell you what we actually know:
              </p>
              <ul className="mt-4 space-y-2">
                {PREFER_FACTS.map((fact) => (
                  <li key={fact} className="ca-lede">
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          id="transparency"
          aria-labelledby="transparency-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="transparency-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                Transparency Over Perfection
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>Materials and manufacturing can be complex.</p>
                <p>
                  Our goal is not to hide that complexity behind marketing
                  language.
                </p>
                <p>
                  Our goal is to make the information that matters easier to
                  understand.
                </p>
                <p>
                  As our product range grows, our standards pages and product
                  details should grow with it.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="our-standard"
          aria-labelledby="our-standard-heading"
          className="border-b border-oat/70"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id="our-standard-heading"
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                Our Standard
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                <p>Keep the materials clear.</p>
                <p>Keep the claims specific.</p>
                <p>Keep the clothing worth wearing.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        aria-labelledby="standards-closing-heading"
        className="border-t border-oat/70 bg-cotton"
      >
        <div className="ca-container py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="standards-closing-heading"
              className="ca-editorial-display text-[clamp(2.25rem,1.6rem+2.6vw,4.25rem)] leading-[1.08] tracking-[-0.015em] text-mineral-ink"
            >
              Organic isn&apos;t a collection.
              <br />
              It&apos;s the entire store.
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/materials" className="ca-btn-secondary">
                Materials
              </Link>
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
