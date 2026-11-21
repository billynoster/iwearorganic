import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/services/types';
import {
  WORN_YOUR_WAY_LOOKS,
  WORN_YOUR_WAY_SHOP_CTA_HREF,
  wornObjectPosition,
  type WornLookConfig,
} from '@/content/worn-your-way-looks';

interface WornYourWayProps {
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

function resolveLookProduct(
  look: WornLookConfig,
  products: Product[]
): Product | null {
  for (const id of look.productIds) {
    const match = products.find((p) => p.id === id);
    if (match) return match;
  }
  return null;
}

function productUnitPriceCents(product: Product): number | null {
  const enabled =
    product.variants.find((v) => v.isEnabled && v.isAvailable) ||
    product.variants.find((v) => v.isEnabled) ||
    product.variants[0];
  return typeof enabled?.priceCents === 'number' ? enabled.priceCents : null;
}

function LookImage({
  look,
  sizes,
  priority,
}: {
  look: WornLookConfig;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={look.imageSrc}
      alt={look.imageAlt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      style={{ objectPosition: wornObjectPosition(look) }}
    />
  );
}

function LookCaption({
  look,
  products,
}: {
  look: WornLookConfig;
  products: Product[];
}) {
  const product = resolveLookProduct(look, products);
  const price = product ? productUnitPriceCents(product) : null;

  if (look.role === 'lead') {
    return (
      <div className="space-y-1">
        <p className="ca-product-title">{look.title}</p>
        {product ? (
          <p className="font-body text-sm text-mineral-ink/70">
            <Link
              href={`/shopping/${product.id}`}
              className="inline-flex min-h-11 items-center text-mineral-ink underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            >
              {product.title}
            </Link>
            {typeof price === 'number' ? (
              <span className="text-mineral-ink/55">
                {' '}
                · {formatPrice(price)}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="font-body text-sm text-mineral-ink/60">
            <Link
              href={look.fallbackHref}
              className="inline-flex min-h-11 items-center underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            >
              Shop the collection
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <p className="ca-product-title">{look.title}</p>
      {product ? (
        <p className="font-body text-xs text-mineral-ink/60">
          {product.title}
          {typeof price === 'number' ? (
            <span className="text-mineral-ink/50">
              {' '}
              · {formatPrice(price)}
            </span>
          ) : null}
        </p>
      ) : typeof price === 'number' ? (
        <p className="font-body text-xs text-mineral-ink/55">
          {formatPrice(price)}
        </p>
      ) : (
        <p className="font-body text-xs text-mineral-ink/50">Shop the look</p>
      )}
    </div>
  );
}

function SupportImageLinks({ looks, products }: { looks: WornLookConfig[]; products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4">
      {looks.map((look) => {
        const product = resolveLookProduct(look, products);
        const href = product ? `/shopping/${product.id}` : look.fallbackHref;
        return (
          <li key={look.id}>
            <Link
              href={href}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            >
              <figure className="relative aspect-[3/4] overflow-hidden bg-oat">
                <LookImage look={look} sizes="(max-width: 768px) 45vw, 22vw" />
              </figure>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SupportCaptionLinks({
  looks,
  products,
}: {
  looks: WornLookConfig[];
  products: Product[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4">
      {looks.map((look) => {
        const product = resolveLookProduct(look, products);
        const href = product ? `/shopping/${product.id}` : look.fallbackHref;
        return (
          <li key={look.id}>
            <Link
              href={href}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            >
              <LookCaption look={look} products={products} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Mobile: image + caption stacked per look. */
function SupportLooksStacked({
  looks,
  products,
}: {
  looks: WornLookConfig[];
  products: Product[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4">
      {looks.map((look) => {
        const product = resolveLookProduct(look, products);
        const href = product ? `/shopping/${product.id}` : look.fallbackHref;
        return (
          <li key={look.id}>
            <Link
              href={href}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            >
              <figure className="relative aspect-[3/4] overflow-hidden bg-oat">
                <LookImage look={look} sizes="(max-width: 768px) 45vw, 22vw" />
              </figure>
              <div className="mt-2">
                <LookCaption look={look} products={products} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Worn Your Way — Phase 3B + desktop photo-bottom alignment.
 *
 * Desktop: lead + support photos share one baseline (flex stretch + mt-auto).
 * Captions sit in a row under that baseline so caption height cannot shift photos.
 * Mobile: copy → lead → supports; stacked image+caption unchanged. No negative margins.
 */
export function WornYourWay({ products }: WornYourWayProps) {
  const lead = WORN_YOUR_WAY_LOOKS.find((l) => l.role === 'lead');
  const supports = WORN_YOUR_WAY_LOOKS.filter((l) => l.role === 'support');

  if (!lead) return null;

  const leadProduct = resolveLookProduct(lead, products);
  const leadHref = leadProduct
    ? `/shopping/${leadProduct.id}`
    : lead.fallbackHref;

  return (
    <section
      id="worn-your-way"
      aria-labelledby="worn-heading"
      className="ca-section-y border-t border-oat/70 bg-linen"
    >
      <div className="ca-container">
        {/*
          Desktop rows: [copy | lead↕] / [supports | lead↕] / [captions].
          Lead spans the photo rows so its aspect box defines height; supports
          self-end on that baseline. Captions are a separate row underneath.
          Mobile: flex column order copy → lead → supports. No negative margins.
          Phase 6C: tighter vertical rhythm between copy / photos / captions.
        */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-12 md:grid-rows-[auto_auto_auto] md:gap-x-8 md:gap-y-0 lg:gap-x-10">
          {/* Copy — desktop row 1 right */}
          <div className="order-1 md:col-span-5 md:col-start-8 md:row-start-1 md:pb-4">
            <p className="ca-eyebrow mb-3">04 / The Style Edit</p>
            <h2
              id="worn-heading"
              className="ca-editorial-display text-editorial text-mineral-ink"
            >
              Worn Your Way.
            </h2>
            <p className="mt-4 max-w-sm ca-lede">
              Different days. Different places. Your own expression.
            </p>
            <div className="mt-6">
              <Link
                href={WORN_YOUR_WAY_SHOP_CTA_HREF}
                className="ca-btn-primary !rounded-[6px]"
              >
                Shop the Looks
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Lead photo — desktop spans rows 1–2; aspect box sets photo baseline */}
          <div className="order-2 md:col-span-7 md:col-start-1 md:row-span-2 md:row-start-1">
            <figure>
              <Link
                href={leadHref}
                className="group relative block aspect-[4/5] min-h-11 overflow-hidden bg-oat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue sm:aspect-[5/6] md:aspect-[4/5]"
                aria-label={`Shop ${lead.title}${leadProduct ? `: ${leadProduct.title}` : ''}`}
              >
                <LookImage
                  look={lead}
                  sizes="(max-width: 768px) 100vw, 58vw"
                />
              </Link>
              <figcaption className="mt-3 md:hidden">
                <LookCaption look={lead} products={products} />
              </figcaption>
            </figure>
          </div>

          {/* Support photos — desktop row 2, self-end → shared photographic bottom */}
          <div className="order-3 hidden md:col-span-5 md:col-start-8 md:row-start-2 md:block md:self-end">
            <SupportImageLinks looks={supports} products={products} />
          </div>

          {/* Mobile supports — stacked image + caption */}
          <div className="order-3 md:hidden">
            <SupportLooksStacked looks={supports} products={products} />
          </div>

          {/* Desktop captions — row 3 under shared photo baseline */}
          <figcaption className="hidden md:col-span-7 md:col-start-1 md:row-start-3 md:mt-3 md:block">
            <LookCaption look={lead} products={products} />
          </figcaption>
          <div className="hidden md:col-span-5 md:col-start-8 md:row-start-3 md:mt-3 md:block">
            <SupportCaptionLinks looks={supports} products={products} />
          </div>
        </div>
      </div>
    </section>
  );
}
