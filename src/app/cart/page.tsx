'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { PageHero } from '@/components/coastal/page-hero';
import { useCart } from '@/context/cart-context';
import { useUser } from '@/firebase';
import {
  cartHasCheckoutableLines,
  cartHasFixtureLines,
  formatMoney,
  isFixtureProductId,
  lineImageSrc,
  parseVariantSummary,
} from '@/lib/bag-line';

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    isGuestCart,
    isCartHydrated,
  } = useCart();
  const { user, isUserLoading } = useUser();

  const checkoutable = cartHasCheckoutableLines(cartItems);
  const hasFixtures = cartHasFixtureLines(cartItems);
  const canCheckout = checkoutable && !hasFixtures;

  if (!isCartHydrated || isUserLoading) {
    return (
      <main className="ca-container py-20">
        <p className="font-body text-sm text-mineral-ink/60">Loading your bag…</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2" aria-hidden="true">
          {[0, 1].map((i) => (
            <li key={i} className="flex gap-4 border border-oat p-4">
              <span className="h-28 w-24 shrink-0 bg-oat/60" />
              <span className="flex flex-1 flex-col gap-3 py-1">
                <span className="h-4 w-2/3 bg-oat/50" />
                <span className="h-3 w-1/3 bg-oat/40" />
                <span className="mt-auto h-11 w-28 bg-oat/40" />
              </span>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        eyebrow="Bag"
        title="Your bag."
        description="Review your pieces before checkout."
      />
      <div className="ca-container py-8 sm:py-12">
        {cartCount === 0 ? (
          <div className="ca-stack max-w-lg">
            <p className="ca-display text-h3">
              Your bag is empty.
            </p>
            <p className="ca-lede">
              Find something you&apos;ll want to wear often.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/new-arrivals" className="ca-btn-primary">
                Shop New Arrivals
              </Link>
              <Link href="/shopping" className="ca-text-link min-h-11 py-3">
                Shop all
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className="font-body text-xs text-mineral-ink/50">
              {isGuestCart
                ? 'Guest bags are saved in this browser until you sign in.'
                : 'Signed-in bags sync to your account.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <p className="mb-8 font-body text-sm text-mineral-ink/60">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
                <span className="mx-2 text-oat">·</span>
                {isGuestCart ? (
                  <>
                    Guest bag (this browser).{' '}
                    <Link
                      href="/login?redirect=/cart"
                      className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                    >
                      Sign in
                    </Link>{' '}
                    to sync across devices.
                  </>
                ) : (
                  <>
                    Signed in{user?.email ? ` as ${user.email}` : ''} — bag synced to your
                    account.
                  </>
                )}
              </p>

              <ul className="space-y-0 divide-y divide-oat border-y border-oat">
                {cartItems.map((item) => {
                  const imgSrc = lineImageSrc(item);
                  const lineTotal = (item.variant.price / 100) * item.quantity;
                  const fixture = isFixtureProductId(item.product.id);
                  const summary = parseVariantSummary(item.variant.title);

                  return (
                    <li key={item.variant.id} className="flex gap-4 py-8 sm:gap-6">
                      <Link
                        href={`/shopping/${item.product.id}`}
                        className="relative h-28 w-24 shrink-0 overflow-hidden bg-[#ebe6df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue sm:h-36 sm:w-28"
                      >
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                        ) : (
                          <span
                            className="absolute inset-0 bg-[linear-gradient(150deg,#e8e2d8,#d5cec4)]"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                      <div className="ca-stack-tight flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/shopping/${item.product.id}`}
                              className="font-body text-base font-semibold text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                            >
                              {item.product.title}
                            </Link>
                            {summary.label ? (
                              <p className="mt-1 font-body text-sm text-mineral-ink/55">
                                {summary.color ? <span>{summary.color}</span> : null}
                                {summary.color && summary.size ? (
                                  <span aria-hidden="true"> · </span>
                                ) : null}
                                {summary.size ? <span>Size {summary.size}</span> : null}
                                {!summary.color && !summary.size ? summary.label : null}
                              </p>
                            ) : null}
                            {fixture ? (
                              <p className="mt-2 font-body text-xs text-mineral-ink/70">
                                Sample item — remove to continue to checkout.
                              </p>
                            ) : null}
                          </div>
                          <p className="font-body text-sm tabular-nums text-mineral-ink">
                            {formatMoney(lineTotal)}
                          </p>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center gap-4">
                          <div
                            className="ca-qty"
                            role="group"
                            aria-label={`Quantity for ${item.product.title}`}
                          >
                            <button
                              type="button"
                              className="ca-qty-btn"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                updateQuantity(item.variant.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                            <span className="flex min-w-10 items-center justify-center font-body text-sm tabular-nums text-mineral-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="ca-qty-btn"
                              aria-label="Increase quantity"
                              onClick={() =>
                                updateQuantity(item.variant.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.variant.id)}
                            className="inline-flex min-h-11 items-center font-body text-sm text-mineral-ink/55 underline-offset-2 hover:text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="lg:col-span-4">
              <div className="border border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] p-6 sm:sticky sm:top-[calc(4.5rem+1.5rem)] sm:p-8">
                <h2 className="ca-heading text-h3">
                  Order summary
                </h2>
                <dl className="mt-8 space-y-4 font-body text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-mineral-ink/60">Subtotal</dt>
                    <dd className="tabular-nums text-mineral-ink">{formatMoney(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-mineral-ink/60">Shipping &amp; taxes</dt>
                    <dd className="text-right text-mineral-ink/60">
                      Calculated at checkout, where applicable
                    </dd>
                  </div>
                </dl>

                {canCheckout ? (
                  <Link href="/checkout" className="ca-btn-primary mt-8 w-full justify-center">
                    Checkout securely
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="ca-btn-primary mt-8 w-full justify-center opacity-50"
                    aria-disabled="true"
                  >
                    {hasFixtures ? 'Remove sample items to checkout' : 'Checkout securely'}
                  </button>
                )}

                <p className="mt-4 font-body text-xs leading-relaxed text-mineral-ink/50">
                  Subtotal is a bag snapshot. Final prices are confirmed server-side from Printify
                  before Stripe opens. Shipping and taxes calculated at checkout, where applicable.
                  {isGuestCart
                    ? ' Guest checkout works without signing in.'
                    : ' Your bag is synced to your account.'}
                </p>
                {hasFixtures ? (
                  <p
                    className="mt-4 border border-oat bg-linen px-3 py-2 font-body text-xs text-mineral-ink"
                    role="status"
                  >
                    Sample items can&apos;t be purchased. Remove them to continue.
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
