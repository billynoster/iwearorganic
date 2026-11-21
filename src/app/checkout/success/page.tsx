'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type ConfirmationState =
  | 'processing'
  | 'confirmed'
  | 'canceled'
  | 'failed'
  | 'issue';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const { user } = useUser();
  const [state, setState] = useState<ConfirmationState>('processing');

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const canceled = searchParams.get('canceled') === '1';
  const paymentFailed = searchParams.get('payment') === 'failed';

  useEffect(() => {
    if (canceled) {
      setState('canceled');
      return;
    }
    if (paymentFailed) {
      setState('failed');
      return;
    }
    if (!sessionId || !orderId) {
      setState('issue');
      return;
    }

    // Guest checkouts may not read orders/{id} under Firestore rules.
    // Stripe redirect params are enough for the thank-you UI; webhook remains source of truth.
    // Do not treat navigation alone as payment proof — webhook confirms paid / fulfillment.
    const peekOrder = async () => {
      try {
        if (firestore && user && !user.isAnonymous) {
          const orderRef = doc(firestore, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);
          if (orderSnap.exists()) {
            const status = String(orderSnap.data()?.status || '');
            if (status === 'cancelled' || status === 'canceled') {
              setState('canceled');
              return;
            }
            if (status === 'failed' || status === 'payment_failed') {
              setState('failed');
              return;
            }
          }
        }
        setState('confirmed');
      } catch (e) {
        console.error('Order status peek failed (showing confirmed from Stripe redirect):', e);
        // Stripe returned here with session + order ids; show confirmed UX while webhook settles.
        setState('confirmed');
      }
    };

    void peekOrder();
  }, [sessionId, orderId, firestore, user, canceled, paymentFailed]);

  if (state === 'processing') {
    return (
      <main className="ca-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <p className="ca-eyebrow">Checkout</p>
        <h1 className="mt-3 ca-display text-h3">
          Confirming your order…
        </h1>
        <p className="ca-lede mt-4 max-w-md">
          Hang tight while we finish processing your payment.
        </p>
        <div
          className="mt-8 h-10 w-10 animate-pulse rounded-full bg-oat"
          aria-hidden="true"
        />
      </main>
    );
  }

  if (state === 'canceled') {
    return (
      <main className="ca-container max-w-xl py-16 text-center sm:py-24">
        <p className="ca-eyebrow">Checkout</p>
        <h1 className="mt-3 ca-display text-h3">
          Checkout canceled.
        </h1>
        <p className="ca-lede mt-4">
          No charge was made. Your bag is still here when you&apos;re ready.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/cart" className="ca-btn-primary">
            Return to bag
          </Link>
          <Link href="/shopping" className="ca-text-link min-h-11 py-3">
            Continue shopping
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
    );
  }

  if (state === 'failed') {
    return (
      <main className="ca-container max-w-xl py-16 text-center sm:py-24">
        <p className="ca-eyebrow">Checkout</p>
        <h1 className="mt-3 ca-display text-h3">
          Payment didn&apos;t go through.
        </h1>
        <p className="ca-lede mt-4">
          You were not charged. You can review your bag and try again.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/cart" className="ca-btn-primary">
            Return to bag
          </Link>
          <Link href="/shopping" className="ca-text-link min-h-11 py-3">
            Continue shopping
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
    );
  }

  if (state === 'issue') {
    return (
      <main className="ca-container max-w-xl py-16 text-center sm:py-24">
        <p className="ca-eyebrow">Checkout</p>
        <h1 className="mt-3 ca-display text-h3">
          Temporary service issue.
        </h1>
        <p className="ca-lede mt-4">
          We couldn&apos;t verify this order confirmation. If you believe you were charged,
          contact support with your receipt.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/shopping" className="ca-btn-primary">
            Return to shop
          </Link>
          <Link href="/cart" className="ca-text-link min-h-11 py-3">
            View bag
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ca-container max-w-xl py-16 text-center sm:py-24">
      <p className="ca-eyebrow">Checkout</p>
      <h1 className="mt-3 ca-display text-h3">
        Your order is in.
      </h1>
      <p className="ca-lede mt-4">Thanks for shopping i wear organic.</p>

      {orderId ? (
        <div className="mt-10 border border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] px-6 py-5 text-left">
          <p className="font-body text-xs uppercase tracking-[0.14em] text-mineral-ink/50">
            Order reference
          </p>
          <p className="mt-2 break-all font-body text-base font-semibold text-mineral-ink">
            {orderId}
          </p>
          {sessionId ? (
            <p className="mt-3 break-all font-body text-xs text-mineral-ink/45">
              Payment session {sessionId}
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-8 font-body text-sm text-mineral-ink/60">
        We&apos;ve received your order and are getting it ready. Fulfillment confirms after Stripe
        notifies our servers — keep this reference handy if you need help from support.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/shopping" className="ca-btn-primary">
          Continue shopping
        </Link>
        <Link href="/cart" className="ca-text-link min-h-11 py-3">
          Back to bag
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="ca-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
          <p className="ca-eyebrow">Checkout</p>
          <h1 className="mt-3 ca-display text-h3">
            Confirming your order…
          </h1>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
