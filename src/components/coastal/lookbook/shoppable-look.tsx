import Image from 'next/image';
import Link from 'next/link';
import type { EditorialLook } from '@/content/lookbook-edits';
import type { Product } from '@/services/types';
import { cn } from '@/lib/utils';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function resolveProducts(look: EditorialLook, products: Product[]): Product[] {
  const resolved: Product[] = [];
  for (const id of look.productIds) {
    const match = products.find((p) => p.id === id);
    if (match) resolved.push(match);
  }
  return resolved;
}

function unitPriceCents(product: Product): number | null {
  const enabled =
    product.variants.find((v) => v.isEnabled && v.isAvailable) ||
    product.variants.find((v) => v.isEnabled) ||
    product.variants[0];
  return typeof enabled?.priceCents === 'number' ? enabled.priceCents : null;
}

function isRenderable(src?: string) {
  return Boolean(src && (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')));
}

interface ShoppableLookProps {
  look: EditorialLook;
  products: Product[];
  usingFixtures?: boolean;
  reverse?: boolean;
  priority?: boolean;
}

/**
 * Editorial look with inline shoppable products from the verified catalog.
 * Prices come from catalog variants — never from Lookbook content.
 */
export function ShoppableLook({
  look,
  products,
  usingFixtures,
  reverse = false,
  priority = false,
}: ShoppableLookProps) {
  const associated = resolveProducts(look, products);
  const shopHref =
    associated[0] != null
      ? `/shopping/${associated[0].id}`
      : '/shopping';

  return (
    <article className="border-b border-oat/70 last:border-b-0">
      <div className="ca-container py-12 sm:py-16 md:py-20">
        <div
          className={cn(
            'grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-10',
            reverse && 'md:[&>*:first-child]:order-2'
          )}
        >
          <figure className="md:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-oat sm:aspect-[5/6] md:aspect-[4/5]">
              {look.mobileImage ? (
                <>
                  <Image
                    src={look.mobileImage}
                    alt={look.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 58vw"
                    priority={priority}
                    className="object-cover object-center md:hidden"
                  />
                  <Image
                    src={look.image}
                    alt={look.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 58vw"
                    priority={priority}
                    className="hidden object-cover object-center md:block"
                  />
                </>
              ) : (
                <Image
                  src={look.image}
                  alt={look.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  priority={priority}
                  className="object-cover object-center"
                />
              )}
            </div>
          </figure>

          <div className="flex flex-col md:col-span-5 md:pt-4">
            <p className="ca-eyebrow mb-3">Look</p>
            <h3 className="ca-display text-h3">
              {look.title}
            </h3>
            {look.description ? (
              <p className="mt-4 ca-lede max-w-sm">{look.description}</p>
            ) : null}

            <div className="mt-8">
              <Link href={shopHref} className="ca-btn-primary !rounded-[6px]">
                Shop This Look
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {associated.length > 0 ? (
              <ul className="mt-10 space-y-0 divide-y divide-oat border-t border-oat">
                {associated.map((product) => {
                  const price = unitPriceCents(product);
                  const primary =
                    product.images.find((i) => i.isDefault) ?? product.images[0];
                  const thumb = primary?.src;
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/shopping/${product.id}`}
                        className="group flex min-h-11 items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                      >
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-oat sm:h-20 sm:w-16">
                          {thumb && isRenderable(thumb) ? (
                            // Catalog / Printify / fixture URLs — img keeps remote flexibility
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="h-full w-full bg-[linear-gradient(150deg,#e8e2d8,#d5cec4)]"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="ca-product-title group-hover:underline">
                            {product.title}
                          </p>
                          {typeof price === 'number' ? (
                            <p className="ca-meta mt-0.5">
                              {formatPrice(price)}
                              {usingFixtures ? (
                                <span className="sr-only"> (fixture price)</span>
                              ) : null}
                            </p>
                          ) : (
                            <p className="mt-0.5 font-body text-sm text-mineral-ink/50">
                              View product
                            </p>
                          )}
                          {usingFixtures ? (
                            <span className="mt-1 inline-block font-body text-[0.65rem] uppercase tracking-[0.12em] text-dusk-rose">
                              Fixture
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="ca-meta mt-8">
                Featured pieces for this look are being confirmed —{' '}
                <Link href="/shopping" className="underline underline-offset-2">
                  browse the collection
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
