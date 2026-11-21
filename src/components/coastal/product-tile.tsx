import Link from 'next/link';
import type { Product } from '@/services/types';
import { findColorOption, variantColor } from '@/lib/variant-options';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function colorSwatches(product: Product): Array<{ title: string; hex: string }> {
  const colorOption = findColorOption(product);
  if (colorOption?.values.length) {
    return colorOption.values.slice(0, 5).map((value) => ({
      title: value.title,
      hex: value.colors?.[0] || '#DDD4C9',
    }));
  }

  const fromVariants = new Set<string>();
  for (const variant of product.variants) {
    const color = variantColor(variant);
    if (color) fromVariants.add(color);
  }
  if (fromVariants.size > 0) {
    const palette = ['#303435', '#91A7AF', '#BFA4A1', '#DDD4C9', '#6B7C7E'];
    return Array.from(fromVariants)
      .slice(0, 5)
      .map((title, index) => ({ title, hex: palette[index % palette.length] }));
  }

  const palette = ['#303435', '#91A7AF', '#BFA4A1', '#DDD4C9'];
  const count = Math.min(4, Math.max(2, product.variants.length));
  return palette.slice(0, count).map((hex, index) => ({
    title: `Color ${index + 1}`,
    hex,
  }));
}

function isRenderable(src?: string) {
  return Boolean(src && (src.startsWith('http') || src.startsWith('data:')));
}

interface ProductTileProps {
  product: Product;
  usingFixtures?: boolean;
  /** Subtle data-driven “New” badge — New Arrivals PLP only. */
  showNewBadge?: boolean;
}

export function ProductTile({
  product,
  usingFixtures,
  showNewBadge = false,
}: ProductTileProps) {
  const primary = product.images.find((i) => i.isDefault) ?? product.images[0];
  const alternate =
    product.images.find((img) => img !== primary && isRenderable(img.src)) ?? null;
  const price =
    product.variants.find((v) => v.isEnabled)?.priceCents ??
    product.variants[0]?.priceCents;
  const colors = colorSwatches(product);
  const href = `/shopping/${product.id}`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#ebe6df]">
        {primary && isRenderable(primary.src) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.src}
            alt={primary.alt || product.title}
            className={[
              'h-full w-full object-cover transition-opacity duration-300',
              // Hover swap only on fine-pointer hover. On touch, group-hover
              // sticky-activates on the first tap and requires a second tap to navigate.
              alternate
                ? '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-0'
                : '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-90',
            ].join(' ')}
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 bg-[linear-gradient(150deg,#e8e2d8,#d5cec4_55%,#c8bdb4)]"
            aria-hidden="true"
          />
        )}
        {alternate && isRenderable(alternate.src) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alternate.src}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
            loading="lazy"
            aria-hidden="true"
          />
        ) : null}
        {showNewBadge ? (
          <span className="ca-caption absolute left-2 top-2 bg-linen/90 px-2 py-1 text-mineral-ink/70 backdrop-blur-[2px]">
            New
          </span>
        ) : null}
        {(usingFixtures || primary?.isPlaceholder) && (
          <span className="ca-caption absolute bottom-2 left-2 right-2">
            Placeholder
          </span>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="ca-product-title">
          {product.title}
        </h3>
        {typeof price === 'number' ? (
          <p className="ca-meta">
            {formatPrice(price)}
            {usingFixtures ? <span className="sr-only"> (fixture price)</span> : null}
          </p>
        ) : null}
        <ul className="flex gap-1.5 pt-0.5" aria-label="Available colors">
          {colors.map((swatch) => (
            <li
              key={`${swatch.title}-${swatch.hex}`}
              className="h-2.5 w-2.5 rounded-full border border-mineral-ink/15"
              style={{ backgroundColor: swatch.hex }}
              title={swatch.title}
            >
              <span className="sr-only">{swatch.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
