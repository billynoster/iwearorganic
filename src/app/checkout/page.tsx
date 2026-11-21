'use client';

/**
 * Phase 7B — Coastal Analog checkout.
 * - Guest: POST /api/checkout { guest: true } — server Admin + Stripe (no client Auth).
 * - Signed-in: client pending order, then Stripe session with server revalidation.
 * - Fixtures never checkout. Prices revalidated server-side from Printify.
 * Does not modify Stripe webhooks or production config.
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useCart } from '@/context/cart-context';
import { useUser, useFirestore } from '@/firebase';
import { handleFirestoreError, OperationType } from '@/firebase/errors';
import {
  cartHasFixtureLines,
  formatMoney,
  isFixtureProductId,
  lineImageSrc,
  parseVariantSummary,
} from '@/lib/bag-line';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const { cartItems, subtotal, clearCart, isGuestCart, isCartHydrated } = useCart();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const hasRedirectedRef = useRef(false);

  const useGuestServerCheckout = isGuestCart || !user || Boolean(user?.isAnonymous);
  const hasFixtures = cartHasFixtureLines(cartItems);
  const canPay =
    cartItems.length > 0 && !hasFixtures && !isProcessing && !isUserLoading;

  useEffect(() => {
    if (!isCartHydrated || isUserLoading) return;
    if (cartItems.length === 0 && !isProcessing && !hasRedirectedRef.current) {
      router.replace('/cart');
    }
  }, [cartItems.length, router, isProcessing, isCartHydrated, isUserLoading]);

  const redirectToStripe = (url: string) => {
    hasRedirectedRef.current = true;
    setDiagnosticStep('Redirecting to secure payment…');
    clearCart();
    window.location.assign(url);
  };

  const checkoutWithClientOrder = async (uid: string, email: string | null) => {
    if (!firestore) {
      throw new Error('Firestore is not ready. Please refresh and try again.');
    }

    setDiagnosticStep('Preparing your order…');

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const orderDocRef = doc(collection(firestore, 'orders'), orderId);

    await setDoc(orderDocRef, {
      id: orderId,
      userId: uid,
      email: email || 'guest',
      status: 'pending',
      totalAmount: subtotal,
      items: cartItems.map((item) =>
        JSON.stringify({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity,
        })
      ),
      shippingInfo: '{}',
      createdAt: new Date().toISOString(),
      checkoutMode: 'authenticated',
    });

    setDiagnosticStep('Creating secure Stripe session…');
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        orderId,
        guest: false,
        customerEmail: email || undefined,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session');
    }
    if (!data.url) {
      throw new Error('No checkout URL returned');
    }

    redirectToStripe(data.url);
  };

  const handleGuestCheckout = async () => {
    setDiagnosticStep('Creating guest checkout session…');
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems,
        guest: true,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.url) {
      redirectToStripe(data.url);
      return;
    }

    const message =
      data.error ||
      'Checkout is unavailable right now. Please try again shortly.';
    const hint = data.hint ? ` ${data.hint}` : '';
    throw new Error(`${message}${hint}`);
  };

  const handlePlaceOrder = async () => {
    if (!canPay) return;

    setIsProcessing(true);
    setErrorStatus(null);

    try {
      if (!useGuestServerCheckout && user) {
        await checkoutWithClientOrder(user.uid, user.email);
      } else {
        await handleGuestCheckout();
      }
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string };
      console.error('Checkout Exception caught:', e);
      if (err.message?.includes('permission') || err.code?.includes('permission')) {
        handleFirestoreError(e, OperationType.WRITE, 'orders');
      }
      setErrorStatus(err.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isCartHydrated || isUserLoading) {
    return (
      <main className="ca-container flex min-h-[50vh] items-center justify-center py-20">
        <p className="font-body text-sm text-mineral-ink/60">Preparing checkout…</p>
      </main>
    );
  }

  if (cartItems.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <main
      className="bg-linen text-mineral-ink"
      data-guest-checkout="server-admin-only"
      data-checkout-build="guest-admin-v3"
    >
      <header className="border-b border-oat/70">
        <div className="ca-container py-12 sm:py-16">
          <p className="ca-eyebrow mb-3">Checkout</p>
          <h1 className="ca-display text-h2">
            Secure checkout.
          </h1>
          <p className="ca-lede mt-4 max-w-xl">
            {useGuestServerCheckout
              ? 'Guest checkout — no account required. You’ll enter shipping and payment on Stripe’s secure page.'
              : 'You’ll enter shipping and payment on Stripe’s secure page. Bag prices are confirmed server-side before payment.'}
          </p>
        </div>
      </header>

      <div className="ca-container grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12">
        <section className="lg:col-span-7" aria-labelledby="checkout-summary-heading">
          <h2
            id="checkout-summary-heading"
            className="ca-heading text-h3"
          >
            Order summary
          </h2>
          <ul className="mt-6 divide-y divide-oat border-y border-oat">
            {cartItems.map((item) => {
              const imgSrc = lineImageSrc(item);
              const summary = parseVariantSummary(item.variant.title);
              const lineTotal = (item.variant.price / 100) * item.quantity;
              const fixture = isFixtureProductId(item.product.id);

              return (
                <li key={item.variant.id} className="flex gap-4 py-6 sm:gap-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[#ebe6df] sm:h-28 sm:w-24">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <span
                        className="absolute inset-0 bg-[linear-gradient(150deg,#e8e2d8,#d5cec4)]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-base font-semibold text-mineral-ink">
                      {item.product.title}
                    </p>
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
                    <p className="mt-1 font-body text-sm text-mineral-ink/55">
                      Qty {item.quantity}
                    </p>
                    {fixture ? (
                      <p className="mt-2 font-body text-xs text-dusk-rose">
                        Sample item — remove from bag to continue.
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-body text-sm tabular-nums text-mineral-ink">
                    {formatMoney(lineTotal)}
                  </p>
                </li>
              );
            })}
          </ul>

          <dl className="mt-8 space-y-3 font-body text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-mineral-ink/60">Subtotal (bag snapshot)</dt>
              <dd className="tabular-nums text-mineral-ink">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mineral-ink/60">Shipping &amp; taxes</dt>
              <dd className="max-w-[14rem] text-right text-mineral-ink/60">
                Calculated on Stripe, where applicable
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-oat pt-4">
              <dt className="font-semibold text-mineral-ink">Estimated total</dt>
              <dd className="font-semibold tabular-nums text-mineral-ink">
                {formatMoney(subtotal)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 font-body text-xs leading-relaxed text-mineral-ink/50">
            Line prices are revalidated from Printify on the server before Stripe opens. The bag
            subtotal is a snapshot and may adjust if inventory or pricing changed.
          </p>
        </section>

        <aside className="lg:col-span-5" aria-labelledby="checkout-pay-heading">
          <div className="border border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] p-6 sm:sticky sm:top-[calc(4.5rem+1.5rem)] sm:p-8">
            <h2
              id="checkout-pay-heading"
              className="ca-heading text-h3"
            >
              Shipping &amp; payment
            </h2>
            <p className="ca-lede mt-4">
              Shipping address and payment are collected securely on Stripe. Printify fulfillment
              stays on the existing Cloud Run / Firebase path after payment confirms.
            </p>

            <p className="ca-eyebrow mt-6">
              {useGuestServerCheckout ? 'Guest checkout · no account required' : 'Signed-in checkout'}
            </p>
            {useGuestServerCheckout ? (
              <p className="mt-3 font-body text-sm text-mineral-ink/55">
                Want order history later?{' '}
                <Link
                  href="/login?redirect=/checkout"
                  className="underline underline-offset-4 hover:text-mineral-ink"
                >
                  Sign in
                </Link>{' '}
                is optional — guest checkout stays fully available.
              </p>
            ) : (
              <p className="mt-3 font-body text-sm text-mineral-ink/55">
                This order will appear under{' '}
                <Link
                  href="/account/orders"
                  className="underline underline-offset-4 hover:text-mineral-ink"
                >
                  Account → Orders
                </Link>
                . Manage saved shipping addresses anytime for faster checkout.
              </p>
            )}

            {hasFixtures ? (
              <div
                className="mt-6 border border-oat bg-linen px-4 py-3"
                role="status"
              >
                <p className="font-body text-sm text-mineral-ink">
                  Sample items can&apos;t be purchased.
                </p>
                <p className="mt-2 font-body text-sm text-mineral-ink/65">
                  Remove fixtures from your bag, then return here with live catalog pieces.
                </p>
                <Link href="/cart" className="ca-btn-primary mt-5 w-full justify-center">
                  Return to bag
                </Link>
              </div>
            ) : null}

            {isProcessing ? (
              <p
                className="mt-6 border border-oat bg-linen px-4 py-3 font-body text-sm text-mineral-ink"
                role="status"
                aria-live="polite"
              >
                {diagnosticStep || 'Working…'}
              </p>
            ) : null}

            {errorStatus ? (
              <div
                className="mt-6 border border-dusk-rose/40 bg-[color-mix(in_srgb,var(--ca-dusk-rose)_12%,var(--ca-linen))] px-4 py-3"
                role="alert"
              >
                <p className="ca-eyebrow text-mineral-ink">
                  Checkout unavailable
                </p>
                <p className="mt-2 break-words font-body text-sm text-mineral-ink/80">
                  {errorStatus}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorStatus(null);
                      void handlePlaceOrder();
                    }}
                    className="ca-btn-primary justify-center"
                  >
                    Try again
                  </button>
                  <Link href="/cart" className="ca-text-link min-h-11 justify-center py-3">
                    Return to bag
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            ) : null}

            {!hasFixtures && !errorStatus ? (
              <button
                type="button"
                onClick={() => void handlePlaceOrder()}
                disabled={!canPay}
                aria-busy={isProcessing}
                className={cn(
                  'ca-btn-primary mt-8 w-full justify-center min-h-12',
                  (!canPay || isProcessing) && 'opacity-60'
                )}
              >
                {isProcessing ? 'Opening Stripe…' : 'Pay securely'}
              </button>
            ) : null}

            {!hasFixtures && !errorStatus ? (
              <p className="mt-4 font-body text-xs leading-relaxed text-mineral-ink/50">
                You&apos;ll leave this site briefly for Stripe Checkout. Don&apos;t close the browser
                until payment finishes. Cancel returns you here without a charge.
              </p>
            ) : null}

            <p className="mt-6">
              <Link href="/cart" className="ca-text-link min-h-11 py-3">
                ← Back to bag
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
