'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCart } from '@/context/cart-context';
import {
  cartHasCheckoutableLines,
  cartHasFixtureLines,
  formatMoney,
  isFixtureProductId,
  lineImageSrc,
  parseVariantSummary,
} from '@/lib/bag-line';
import { cn } from '@/lib/utils';

export function CartSheet() {
  const {
    cartItems,
    cartCount,
    subtotal,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    isGuestCart,
  } = useCart();

  const checkoutable = cartHasCheckoutableLines(cartItems);
  const hasFixtures = cartHasFixtureLines(cartItems);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className={cn(
          'flex w-full flex-col gap-0 border-l border-oat bg-white p-0 text-mineral-ink shadow-none sm:max-w-md',
          '[&>button]:hidden'
        )}
        aria-describedby={undefined}
      >
        <SheetHeader className="ca-panel-header space-y-0 text-left">
          <div className="flex w-full items-center justify-between gap-4">
            <SheetTitle className="font-body text-base font-semibold tracking-tight text-mineral-ink">
              Your bag
              {cartCount > 0 ? (
                <span className="ml-2 font-body text-sm font-normal text-mineral-ink/55">
                  ({cartCount})
                </span>
              ) : null}
            </SheetTitle>
            <SheetClose
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-mineral-ink/70 transition-colors hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Close bag"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </SheetClose>
          </div>
          <p className="mt-2 w-full font-body text-xs text-mineral-ink/50">
            {isGuestCart
              ? 'Guest bag — saved in this browser until you sign in.'
              : 'Signed-in bag — synced to your account.'}
          </p>
        </SheetHeader>

        {cartCount > 0 ? (
          <>
            <div className="ca-panel-body">
              <ul className="space-y-0 divide-y divide-oat">
                {cartItems.map((item) => {
                  const summary = parseVariantSummary(item.variant.title);
                  const imgSrc = lineImageSrc(item);
                  const fixture = isFixtureProductId(item.product.id);
                  const unit = item.variant.price / 100;

                  return (
                    <li key={item.variant.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <Link
                        href={`/shopping/${item.product.id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                      >
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <span
                            className="absolute inset-0 bg-[linear-gradient(150deg,#e8e2d8,#d5cec4)]"
                            aria-hidden="true"
                          />
                        )}
                      </Link>

                      <div className="ca-stack-tight min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              href={`/shopping/${item.product.id}`}
                              onClick={() => setIsCartOpen(false)}
                              className="font-body text-sm font-semibold text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                            >
                              {item.product.title}
                            </Link>
                            {summary.label ? (
                              <p className="mt-1 font-body text-xs text-mineral-ink/55">
                                {summary.color ? (
                                  <span>{summary.color}</span>
                                ) : null}
                                {summary.color && summary.size ? (
                                  <span aria-hidden="true"> · </span>
                                ) : null}
                                {summary.size ? <span>Size {summary.size}</span> : null}
                                {!summary.color && !summary.size ? summary.label : null}
                              </p>
                            ) : null}
                            {fixture ? (
                              <p className="mt-2 font-body text-xs text-mineral-ink/70">
                                Sample item — remove to checkout.
                              </p>
                            ) : null}
                          </div>
                          <p className="shrink-0 font-body text-sm tabular-nums text-mineral-ink">
                            {formatMoney(unit * item.quantity)}
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
                              <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
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
                              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.variant.id)}
                            className="min-h-11 font-body text-sm text-mineral-ink/55 underline-offset-2 hover:text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
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

            <div className="ca-panel-footer mt-auto space-y-4 bg-surface">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="font-body text-sm font-semibold text-mineral-ink">
                    Subtotal
                  </p>
                  <p className="mt-1 font-body text-xs text-mineral-ink/50">
                    Shipping &amp; taxes calculated at checkout.
                  </p>
                </div>
                <p className="font-body text-base tabular-nums text-mineral-ink">
                  {formatMoney(subtotal)}
                </p>
              </div>

              {hasFixtures ? (
                <p
                  className="rounded-[var(--radius-sm)] border border-oat bg-white px-3 py-2 font-body text-xs text-mineral-ink"
                  role="status"
                >
                  Sample items can&apos;t be purchased. Remove them to continue.
                </p>
              ) : null}

              <div className="ca-stack-tight">
                {checkoutable && !hasFixtures ? (
                  <SheetClose asChild>
                    <Link href="/checkout" className="ca-btn-primary w-full justify-center">
                      Checkout
                    </Link>
                  </SheetClose>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="ca-btn-primary w-full justify-center opacity-50"
                    aria-disabled="true"
                  >
                    {hasFixtures ? 'Remove sample items to checkout' : 'Checkout'}
                  </button>
                )}
                <SheetClose asChild>
                  <Link
                    href="/cart"
                    className="ca-text-link min-h-11 justify-center py-3"
                  >
                    View full bag
                    <span aria-hidden="true">→</span>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </>
        ) : (
          <div className="ca-stack flex flex-1 items-start justify-center bg-cotton/40 px-6 py-12">
            <p className="ca-display text-h3">Your bag is empty.</p>
            <p className="ca-lede max-w-sm">
              Find something you&apos;ll want to wear often.
            </p>
            <div className="flex flex-wrap gap-4">
              <SheetClose asChild>
                <Link href="/new-arrivals" className="ca-btn-primary">
                  Shop New Arrivals
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/shopping" className="ca-text-link min-h-11 py-3">
                  Shop all
                  <span aria-hidden="true">→</span>
                </Link>
              </SheetClose>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
