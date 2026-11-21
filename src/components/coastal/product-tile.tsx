import Link from 'next/link';
import type { Product } from '@/services/types';
import { findColorOption, variantColor } from '@/lib/variant-options';
import { materialBadgeFromProduct } from '@/lib/material-badge';

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
      hex: value.colors?.[0] || '#E7E8E4',
    }));
  }

  const fromVariants = new Set<string>();
  for (const variant of product.variants) {
    const color = variantColor(variant);
    if (color) fromVariants.add(color);
  }
  if (fromVariants.size > 0) {
    const palette = ['#242724', '#294936', '#93A88E', '#F6F2E8', '#453B32'];
    return Array.from(fromVariants)
      .slice(0, 5)
      .map((title, index) => ({ title, hex: palette[index % palette.length] }));
  }

  const palette = ['#242724', '#294936', '#93A88E', '#F6F2E8'];
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
  const material = materialBadgeFromProduct(product);
  const href = `/shopping/${product.id}`;
  const colorCount = colors.length;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] bg-surface">
        {primary && isRenderable(primary.src) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.src}
            alt={primary.alt || product.title}
            className={[
              'h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none',
              alternate
                ? '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-0'
                : '[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-90',
            ].join(' ')}
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 bg-surface"
            aria-hidden="true"
          />
        )}
        {alternate && isRenderable(alternate.src) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alternate.src}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100"
            loading="lazy"
            aria-hidden="true"
          />
        ) : null}
        {showNewBadge ? (
          <span className="ca-caption absolute left-2 top-2 bg-white/95 px-2 py-1 text-mineral-ink/70">
            New
          </span>
        ) : null}
        {(usingFixtures || primary?.isPlaceholder) && (
          <span className="ca-caption absolute bottom-2 left-2 right-2">
            Placeholder
          </span>
        )}
      </div>
      <div className="mt-4 space-y-1.5">
        <h3 className="ca-product-title">{product.title}</h3>
        {typeof price === 'number' ? (
          <p className="ca-meta">
            {formatPrice(price)}
            {usingFixtures ? <span className="sr-only"> (fixture price)</span> : null}
          </p>
        ) : null}
        {colorCount > 0 ? (
          <p className="ca-meta">
            {colorCount} {colorCount === 1 ? 'color' : 'colors'}
          </p>
        ) : null}
        {material ? <p className="ca-material-badge">{material}</p> : null}
        <ul className="flex gap-1.5 pt-1" aria-label="Available colors">
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
