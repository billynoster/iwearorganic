import Link from 'next/link';
import type { Product } from '@/services/types';

interface EverydayUniformGalleryProps {
  products: Product[];
  usingFixtures?: boolean;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Derive simple color dots from variant option titles / tags — decorative only. */
function colorHints(product: Product): string[] {
  const palette = ['#303435', '#91A7AF', '#BFA4A1', '#DDD4C9', '#6B7C7E'];
  const count = Math.min(4, Math.max(2, product.variants.length));
  return palette.slice(0, count);
}

/**
 * The Everyday Uniform — Phase 4 + editorial heading follow-up
 * Instrument Serif section title (subordinate to hero). Prefer 4 featured
 * products at desktop four-column density; product UI stays DM Sans.
 */
export function EverydayUniformGallery({
  products,
}: EverydayUniformGalleryProps) {
  const items = products.slice(0, 4);

  return (
    <section
      aria-labelledby="uniform-heading"
      className="ca-section-y bg-white"
    >
      <div className="ca-container">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="ca-eyebrow mb-3">02 / Shop the Edit</p>
            <h2
              id="uniform-heading"
              className="ca-editorial-display text-editorial-section text-mineral-ink"
            >
              The Everyday Uniform.
            </h2>
          </div>
          <Link href="/shopping" className="ca-text-link shrink-0">
            Shop all
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {items.map((product) => {
            const image = product.images.find((i) => i.isDefault) ?? product.images[0];
            const price = product.variants.find((v) => v.isEnabled)?.priceCents
              ?? product.variants[0]?.priceCents;
            const colors = colorHints(product);

            return (
              <li key={product.id}>
                <Link href={`/shopping/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#ebe6df]">
                    {image && !image.isPlaceholder ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.src}
                        alt={image.alt || product.title}
                        className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 bg-[linear-gradient(150deg,#e8e2d8,#d5cec4_55%,#c8bdb4)]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <h3 className="ca-product-title">
                      {product.title}
                    </h3>
                    {typeof price === 'number' ? (
                      <p className="ca-meta">
                        {formatPrice(price)}
                      </p>
                    ) : null}
                    <ul className="flex gap-1.5 pt-0.5" aria-label="Available colors">
                      {colors.map((hex) => (
                        <li
                          key={hex}
                          className="h-2.5 w-2.5 rounded-full border border-mineral-ink/15"
                          style={{ backgroundColor: hex }}
                        >
                          <span className="sr-only">{hex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {items.length === 0 ? (
          <p className="ca-meta" role="status">
            No products available right now. Browse the full collection to explore
            essentials.
          </p>
        ) : null}

        {items.length > 0 ? (
          <div className="mt-10 flex justify-center sm:mt-12 md:hidden">
            <Link href="/shopping" className="ca-btn-primary !rounded-[6px]">
              Shop all
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
