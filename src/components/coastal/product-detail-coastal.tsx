'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Product, ProductVariant } from '@/services/types';
import { useCart } from '@/context/cart-context';
import type { PrintifyProduct, PrintifyVariant } from '@/ai/flows/printify-products';
import { ProductGalleryCoastal } from '@/components/coastal/product-gallery-coastal';
import { ProductTile } from '@/components/coastal/product-tile';
import { cn } from '@/lib/utils';
import {
  findColorOption,
  findSizeOption,
  variantColor,
  variantSize,
} from '@/lib/variant-options';
import { resolveColorSwatchHex } from '@/lib/collection-discovery';
import { formatProductDescription } from '@/lib/product-description';

interface ProductDetailCoastalProps {
  product: Product;
  relatedProducts?: Product[];
  usingFixtures?: boolean;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Adapt domain Product → legacy Printify shapes expected by CartProvider. */
function toCartShapes(product: Product, variant: ProductVariant): {
  product: PrintifyProduct;
  variant: PrintifyVariant;
} {
  return {
    product: {
      id: product.id,
      title: product.title,
      description: product.description,
      tags: product.tags,
      images: product.images.map((img, i) => ({
        src: img.src.startsWith('data:')
          ? 'https://placehold.co/800x1000/EBE6DF/303435?text=BLEND'
          : img.src,
        variant_ids: (img.variantIds || product.variants.map((v) => v.id)).map(
          (id) => Number(id) || Math.abs(hashId(id))
        ),
        position: String(i + 1),
        is_default: Boolean(img.isDefault),
      })),
      variants: product.variants.map((v) => ({
        id: Number(v.id) || Math.abs(hashId(v.id)),
        price: v.priceCents,
        title: v.title,
        options: [],
        is_enabled: v.isEnabled,
        is_available: v.isAvailable,
        sku: v.sku,
      })),
      options: [],
    },
    variant: {
      id: Number(variant.id) || Math.abs(hashId(variant.id)),
      price: variant.priceCents,
      title: variant.title,
      options: [],
      is_enabled: variant.isEnabled,
      is_available: variant.isAvailable,
      sku: variant.sku,
    },
  };
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h === 0 ? 1 : h;
}

function deriveColorNames(product: Product): string[] {
  const colorOption = findColorOption(product);
  if (colorOption?.values.length) {
    return colorOption.values.map((v) => v.title);
  }
  const fromVariants = new Set<string>();
  for (const variant of product.variants) {
    const color = variantColor(variant);
    if (color) fromVariants.add(color);
  }
  return Array.from(fromVariants);
}

function deriveSizeNames(product: Product, color: string | null): string[] {
  const sizeOption = findSizeOption(product);
  if (sizeOption?.values.length && !color) {
    return sizeOption.values.map((v) => v.title);
  }

  const sizes: string[] = [];
  const seen = new Set<string>();
  for (const variant of product.variants) {
    if (color) {
      const vc = variantColor(variant);
      if (vc && vc !== color) continue;
    }
    const size = variantSize(variant);
    if (size && !seen.has(size)) {
      seen.add(size);
      sizes.push(size);
    }
  }

  if (sizes.length > 0) return sizes;
  if (sizeOption?.values.length) return sizeOption.values.map((v) => v.title);
  return product.variants.map((v) => v.title);
}

function findVariant(
  product: Product,
  color: string | null,
  size: string | null
): ProductVariant | null {
  if (!size && product.variants.length === 1) return product.variants[0];
  if (!size) return null;

  return (
    product.variants.find((variant) => {
      const vc = variantColor(variant);
      const vs = variantSize(variant);
      const colorOk = !color || !vc || vc === color;
      const sizeOk = vs === size || variant.title === size;
      return colorOk && sizeOk;
    }) ?? null
  );
}

function catalogColorHex(product: Product, colorName: string): string | undefined {
  const colorOption = findColorOption(product);
  const value = colorOption?.values.find((v) => v.title === colorName);
  return value?.colors?.[0];
}

/** Catalog hex or known name map only — never invent a misleading hue. */
function swatchHexFor(product: Product, colorName: string): string | undefined {
  return resolveColorSwatchHex(colorName, catalogColorHex(product, colorName));
}

function variantIdsForColor(product: Product, color: string | null): string[] {
  if (!color) return product.variants.map((v) => v.id);
  return product.variants
    .filter((variant) => {
      const vc = variantColor(variant);
      return !vc || vc === color;
    })
    .map((v) => v.id);
}

export function ProductDetailCoastal({
  product,
  relatedProducts = [],
  usingFixtures,
}: ProductDetailCoastalProps) {
  const sizeGroupId = useId();
  const colorGroupId = useId();
  const validationId = `${sizeGroupId}-validation`;
  const sizeLegendRef = useRef<HTMLLegendElement>(null);
  const inlineAtcRef = useRef<HTMLButtonElement>(null);

  const colors = useMemo(() => deriveColorNames(product), [product]);
  const hasColorChoice = colors.length > 1;
  const descriptionParagraphs = useMemo(
    () => formatProductDescription(product.description || ''),
    [product.description]
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(
    hasColorChoice ? colors[0] : colors[0] ?? null
  );
  // Start with no size so Add to Bag can validate (brief §2).
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');
  const [inlineFeedback, setInlineFeedback] = useState<'success' | 'error' | null>(null);
  /** Phase 7A: mobile sticky ATC when in-flow button leaves the viewport. */
  const [showMobileStickyAtc, setShowMobileStickyAtc] = useState(false);

  const sizes = useMemo(
    () => deriveSizeNames(product, selectedColor),
    [product, selectedColor]
  );
  const requiresSize = sizes.length > 0;

  const selected = useMemo(
    () => findVariant(product, selectedColor, selectedSize),
    [product, selectedColor, selectedSize]
  );

  const preferredVariantIds = useMemo(
    () => variantIdsForColor(product, selectedColor),
    [product, selectedColor]
  );

  const anyAvailable = product.variants.some((v) => v.isEnabled && v.isAvailable);
  const selectedAvailable = selected
    ? selected.isEnabled && selected.isAvailable
    : anyAvailable;

  const displayPrice =
    selected?.priceCents ??
    product.variants.find((v) => v.isEnabled && v.isAvailable)?.priceCents ??
    product.variants.find((v) => v.isEnabled)?.priceCents ??
    product.variants[0]?.priceCents;

  const { addToCart, openCart } = useCart();

  // Reset size when color changes if the prior size is unavailable in the new color.
  useEffect(() => {
    if (!selectedSize) return;
    const next = findVariant(product, selectedColor, selectedSize);
    if (!next || !next.isEnabled || !next.isAvailable) {
      setSelectedSize(null);
    }
  }, [selectedColor, product, selectedSize]);

  // Mobile sticky Add to Bag — only when the in-flow CTA scrolls out of view (< lg).
  useEffect(() => {
    const target = inlineAtcRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;

    const mq = window.matchMedia('(max-width: 1023px)');
    const update = (inView: boolean) => {
      setShowMobileStickyAtc(mq.matches && !inView);
    };

    const observer = new IntersectionObserver(
      ([entry]) => update(entry.isIntersecting),
      { root: null, threshold: 0, rootMargin: '-64px 0px 0px 0px' }
    );
    observer.observe(target);

    const onMq = () => {
      // Re-evaluate against last known intersection via a sync check.
      const rect = target.getBoundingClientRect();
      const inView = rect.bottom > 64 && rect.top < window.innerHeight;
      update(inView);
    };
    mq.addEventListener('change', onMq);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onMq);
    };
  }, [product.id]);

  const selectSize = (size: string) => {
    setSelectedSize(size);
    if (showSizeError) setShowSizeError(false);
  };

  const selectColor = (color: string) => {
    setSelectedColor(color);
    setInlineFeedback(null);
    // Clear size immediately when it is not eligible for the new color.
    if (selectedSize) {
      const next = findVariant(product, color, selectedSize);
      if (!next || !next.isEnabled || !next.isAvailable) {
        setSelectedSize(null);
        setShowSizeError(false);
      }
    }
  };

  const sizeAvailability = (size: string) => {
    const variant = findVariant(product, selectedColor, size);
    if (!variant) return false;
    return variant.isEnabled && variant.isAvailable;
  };

  const handleAdd = async () => {
    if (!anyAvailable) {
      setLiveMessage('This piece is currently out of stock.');
      setInlineFeedback('error');
      return;
    }
    if (requiresSize && !selectedSize) {
      setShowSizeError(true);
      sizeLegendRef.current?.focus();
      sizeLegendRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }
    if (!selected || isAdding) return;
    if (!selected.isEnabled || !selected.isAvailable) {
      setLiveMessage('That size is unavailable.');
      setInlineFeedback('error');
      return;
    }

    setIsAdding(true);
    setLiveMessage('');
    setInlineFeedback(null);
    try {
      const { product: p, variant: v } = toCartShapes(product, selected);
      addToCart(p, v, quantity);
      const sizeLabel = selectedSize ? `, size ${selectedSize}` : '';
      const colorLabel = selectedColor && hasColorChoice ? `, ${selectedColor}` : '';
      setLiveMessage(
        `${product.title}${colorLabel}${sizeLabel}, quantity ${quantity}, added to bag.`
      );
      setInlineFeedback('success');
      openCart();
    } catch {
      setLiveMessage('Could not add to bag. Please try again.');
      setInlineFeedback('error');
    } finally {
      setIsAdding(false);
    }
  };

  const atcLabel = !anyAvailable
    ? 'Out of stock'
    : isAdding
      ? 'Adding…'
      : 'Add to bag';

  return (
    <div className="ca-container pb-24 sm:pb-20 lg:pb-20">
      <div
        className="grid min-w-0 items-start gap-10 lg:grid-cols-12 lg:gap-12"
        data-pdp-section
      >
        {/* Left: media gallery — min-w-0 so Embla track cannot blow out the grid */}
        <div className="min-w-0 lg:col-span-7">
          <ProductGalleryCoastal
            title={product.title}
            images={product.images}
            videos={product.videos}
            usingFixtures={usingFixtures}
            preferredVariantIds={preferredVariantIds}
          />
        </div>

        {/* Right: sticky purchase panel (desktop ≥1024px only) */}
        <aside
          className="product-info-panel flex min-w-0 flex-col lg:col-span-5"
          aria-label="Product information and purchase"
        >
          {/* Identity group — tight 8–12px rhythm */}
          <p className="ca-eyebrow mb-2">The Everyday Collection</p>
          <h1 className="ca-display text-pdp-title">
            {product.title}
          </h1>

          {typeof displayPrice === 'number' ? (
            <p className="mt-2 font-body text-2xl font-semibold tabular-nums text-mineral-ink sm:text-[1.75rem]">
              {formatPrice(displayPrice)}
              {usingFixtures ? (
                <span className="ml-2 align-middle font-body text-xs font-medium uppercase tracking-wider text-dusk-rose">
                  Fixture
                </span>
              ) : null}
            </p>
          ) : null}

          <p
            className={cn(
              'mt-2 font-body text-sm',
              anyAvailable ? 'text-mineral-ink/55' : 'text-dusk-rose'
            )}
            role="status"
          >
            {!anyAvailable
              ? 'Out of stock'
              : selected && !selectedAvailable
                ? 'Selected size unavailable'
                : 'Made to order · In stock'}
          </p>

          {hasColorChoice ? (
            <fieldset className="mt-8">
              <legend className="font-body text-sm font-medium text-mineral-ink">
                Color
                {selectedColor ? `: ${selectedColor}` : null}
              </legend>
              <div
                className="ca-swatch-row mt-3"
                role="radiogroup"
                aria-label="Color"
              >
                {colors.map((color) => {
                  const checked = selectedColor === color;
                  const hex = swatchHexFor(product, color);
                  const inputId = `${colorGroupId}-${color}`;
                  const colorAvailable = product.variants.some((v) => {
                    const vc = variantColor(v);
                    return vc === color && v.isEnabled && v.isAvailable;
                  });
                  return (
                    <div key={color} className="relative">
                      <input
                        type="radio"
                        id={inputId}
                        name={`${colorGroupId}-color`}
                        value={color}
                        checked={checked}
                        disabled={!colorAvailable}
                        onChange={() => selectColor(color)}
                        className="peer sr-only"
                        aria-label={
                          colorAvailable
                            ? `Color ${color}`
                            : `Color ${color}, unavailable`
                        }
                      />
                      <label
                        htmlFor={inputId}
                        title={
                          colorAvailable
                            ? color
                            : `${color} (unavailable)`
                        }
                        className="ca-swatch"
                      >
                        <span
                          className={cn(
                            'ca-swatch-face',
                            !hex && 'ca-swatch-face--unknown'
                          )}
                          style={hex ? { backgroundColor: hex } : undefined}
                          aria-hidden="true"
                        />
                        <span className="sr-only">
                          {color}
                          {checked ? ', selected' : ''}
                          {!colorAvailable ? ', unavailable' : ''}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {requiresSize ? (
            <fieldset
              className="mt-8"
              aria-describedby={showSizeError ? validationId : undefined}
            >
              <legend
                ref={sizeLegendRef}
                tabIndex={-1}
                className="font-body text-sm font-medium text-mineral-ink outline-none focus-visible:ring-2 focus-visible:ring-mineral-ink focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
              >
                Size
              </legend>

              <div className="ca-control-row mt-3" role="presentation">
                {sizes.map((size) => {
                  const available = sizeAvailability(size);
                  const checked = selectedSize === size;
                  const inputId = `${sizeGroupId}-${size}`;
                  return (
                    <div key={size} className="relative">
                      <input
                        type="radio"
                        id={inputId}
                        name={`${sizeGroupId}-size`}
                        value={size}
                        checked={checked}
                        disabled={!available}
                        onChange={() => selectSize(size)}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={inputId}
                        className={[
                          'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border px-3 font-body text-sm transition-colors duration-150',
                          'border-oat bg-linen text-mineral-ink',
                          'hover:border-mineral-ink/45 hover:bg-oat/40',
                          'peer-checked:border-mineral-ink peer-checked:bg-mineral-ink peer-checked:text-linen',
                          'peer-focus-visible:ring-2 peer-focus-visible:ring-haze-blue peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-linen',
                          'peer-disabled:cursor-not-allowed peer-disabled:opacity-40 peer-disabled:line-through peer-disabled:hover:border-oat peer-disabled:hover:bg-linen',
                        ].join(' ')}
                      >
                        <span className="sr-only">
                          {available ? `Size ${size}` : `Size ${size}, unavailable`}
                        </span>
                        <span aria-hidden="true">{size}</span>
                        {checked ? <span className="sr-only">, selected</span> : null}
                      </label>
                    </div>
                  );
                })}
              </div>

              {showSizeError ? (
                <p
                  id={validationId}
                  role="alert"
                  className="mt-3 font-body text-sm text-mineral-ink"
                >
                  Select a size to continue.
                </p>
              ) : null}

              <p className="mt-3">
                <Link
                  href="/shipping"
                  className="font-body text-sm text-mineral-ink/60 underline-offset-4 hover:text-mineral-ink hover:underline"
                >
                  Size guide & shipping
                </Link>
              </p>
            </fieldset>
          ) : null}

          {/* Quantity — ca-field stacks label above −/qty/+ (16px; never inline). */}
          <div className="ca-field mt-8">
            <label htmlFor={`${sizeGroupId}-qty`} className="ca-field-label">
              Quantity
            </label>
            <div className="ca-qty">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || !anyAvailable}
                className="ca-qty-btn"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                id={`${sizeGroupId}-qty`}
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isFinite(next)) {
                    setQuantity(Math.min(10, Math.max(1, Math.floor(next))));
                  }
                }}
                disabled={!anyAvailable}
                className="ca-qty-input"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10 || !anyAvailable}
                className="ca-qty-btn"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              ref={inlineAtcRef}
              type="button"
              onClick={handleAdd}
              disabled={isAdding || !anyAvailable}
              aria-busy={isAdding}
              aria-label={
                !anyAvailable
                  ? 'Out of stock'
                  : isAdding
                    ? 'Adding to bag'
                    : 'Add to bag'
              }
              className="ca-btn-primary min-h-12 w-full max-w-full sm:min-h-11 sm:w-auto disabled:opacity-60"
            >
              {atcLabel}
            </button>
            <Link
              href="/cart"
              className="ca-text-link min-h-11 justify-center py-3 sm:justify-start"
            >
              View bag
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {inlineFeedback === 'success' ? (
            <p
              className="mt-4 border border-oat bg-oat/30 px-3 py-2 font-body text-sm text-mineral-ink"
              role="status"
            >
              Added to bag.{' '}
              <Link href="/cart" className="underline underline-offset-2">
                View bag
              </Link>
            </p>
          ) : null}
          {inlineFeedback === 'error' ? (
            <p
              className="mt-4 font-body text-sm text-dusk-rose"
              role="alert"
            >
              {liveMessage || 'Could not add to bag.'}
            </p>
          ) : null}

          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {liveMessage}
          </div>

          {descriptionParagraphs.length > 0 ? (
            <div className="ca-section-rule min-w-0">
              <h2 className="font-body text-sm font-medium uppercase tracking-[0.14em] text-mineral-ink">
                Details
              </h2>
              <div className="mt-4 space-y-3">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p
                    key={`desc-${index}`}
                    className="ca-lede break-words text-mineral-ink/80"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="ca-section-rule min-w-0">
            <h2 className="font-body text-sm font-medium uppercase tracking-[0.14em] text-mineral-ink">
              Shipping & returns
            </h2>
            <ul className="mt-4 space-y-2 break-words font-body text-sm leading-relaxed text-mineral-ink/65">
              <li>Made to order — typically ships within production windows listed on{' '}
                <Link href="/shipping" className="underline underline-offset-2">
                  shipping & returns
                </Link>
                .
              </li>
              <li>Duties and taxes calculated at checkout when applicable.</li>
              <li>Easy returns on eligible unworn items within the stated window.</li>
            </ul>
          </div>

          {usingFixtures ? (
            <p className="ca-caption mt-6 break-words text-dusk-rose">
              Development fixture — not production inventory or pricing
            </p>
          ) : null}
        </aside>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="mt-20 border-t border-oat pt-14 sm:mt-24" aria-labelledby="related-heading">
          <p className="ca-eyebrow mb-3">Continue the edit</p>
          <h2
            id="related-heading"
            className="ca-display text-h3"
          >
            You may also like.
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-4">
            {relatedProducts.slice(0, 4).map((related) => (
              <li key={related.id}>
                <ProductTile product={related} usingFixtures={usingFixtures} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Phase 7A — mobile sticky Add to Bag (< lg); mirrors in-flow CTA */}
      {showMobileStickyAtc ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-oat bg-linen px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"
          role="region"
          aria-label="Add to bag"
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            {typeof displayPrice === 'number' ? (
              <p className="min-w-0 shrink font-body text-base font-semibold tabular-nums text-mineral-ink">
                {formatPrice(displayPrice)}
                {selectedSize ? (
                  <span className="ml-2 font-medium text-mineral-ink/55">
                    · {selectedSize}
                  </span>
                ) : null}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleAdd}
              disabled={isAdding || !anyAvailable}
              aria-busy={isAdding}
              aria-label={
                !anyAvailable
                  ? 'Out of stock'
                  : isAdding
                    ? 'Adding to bag'
                    : 'Add to bag'
              }
              className="ca-btn-primary min-h-12 flex-1 disabled:opacity-60"
            >
              {atcLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
