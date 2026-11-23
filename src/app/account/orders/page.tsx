'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { AccountShell } from '@/components/account/account-shell';
import { RequireSignedIn } from '@/components/account/require-signed-in';
import { formatMoney } from '@/lib/bag-line';

type OrderItem = {
  product?: { title?: string; images?: Array<{ src?: string }> };
  variant?: { title?: string; price?: number };
  quantity?: number;
};

type OrderRow = {
  id: string;
  createdAt?: string;
  status?: string;
  totalAmount?: number;
  printifyOrderId?: string;
  items?: string[];
  checkoutMode?: string;
};

function parseItems(raw: string[] | undefined): OrderItem[] {
  if (!raw?.length) return [];
  return raw
    .map((entry) => {
      try {
        return JSON.parse(entry) as OrderItem;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as OrderItem[];
}

export default function AccountOrdersPage() {
  return (
    <RequireSignedIn>
      <OrdersContent />
    </RequireSignedIn>
  );
}

function OrdersContent() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !firestore) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const snap = await getDocs(q);
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<OrderRow, 'id'>) }))
          .sort((a, b) => {
            const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bt - at;
          });
        setOrders(rows);
      } catch (err: unknown) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : 'Could not load order history.'
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user, firestore]);

  return (
    <AccountShell
      title="Orders."
      description="Purchases placed while signed in appear here. Guest checkouts are emailed from Stripe and are not attached to this account."
      email={user?.email}
    >
      {loading ? (
        <p className="font-body text-sm text-mineral-ink/60">Loading orders…</p>
      ) : null}

      {error ? (
        <p className="border border-oat bg-linen px-4 py-3 font-body text-sm text-dusk-rose">
          {error}
        </p>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="border border-dashed border-oat px-6 py-12 text-center">
          <p className="ca-heading text-h3">No orders yet</p>
          <p className="ca-lede mx-auto mt-3 max-w-md">
            When you check out while signed in, your purchases and fulfillment
            status show up here.
          </p>
          <Link href="/shopping" className="ca-btn-primary mt-8 inline-flex">
            Shop the collection
          </Link>
        </div>
      ) : null}

      <ul className="space-y-8">
        {orders.map((order) => {
          const items = parseItems(order.items);
          const placed = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '—';
          const total =
            typeof order.totalAmount === 'number'
              ? formatMoney(order.totalAmount)
              : '—';

          return (
            <li key={order.id} className="border border-oat">
              <div className="flex flex-col gap-4 border-b border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
                  <div>
                    <p className="ca-eyebrow">Placed</p>
                    <p className="mt-1 font-body text-sm text-mineral-ink">{placed}</p>
                  </div>
                  <div>
                    <p className="ca-eyebrow">Total</p>
                    <p className="mt-1 font-body text-sm tabular-nums text-mineral-ink">
                      {total}
                    </p>
                  </div>
                  <div>
                    <p className="ca-eyebrow">Status</p>
                    <p className="mt-1 font-body text-sm capitalize text-mineral-ink">
                      {order.status || 'unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="ca-eyebrow">Order</p>
                    <p className="mt-1 font-body text-xs text-mineral-ink/70">
                      {order.id.slice(0, 18)}
                      {order.id.length > 18 ? '…' : ''}
                    </p>
                  </div>
                </div>
                {order.printifyOrderId ? (
                  <p className="font-body text-xs text-mineral-ink/55 sm:text-right">
                    Fulfillment id{' '}
                    <span className="text-mineral-ink">{order.printifyOrderId}</span>
                  </p>
                ) : (
                  <p className="font-body text-xs text-mineral-ink/45 sm:text-right">
                    Tracking appears after Printify fulfillment starts.
                  </p>
                )}
              </div>

              <ul className="divide-y divide-oat">
                {items.length === 0 ? (
                  <li className="px-5 py-4 font-body text-sm text-mineral-ink/55 sm:px-6">
                    Line items unavailable for this order.
                  </li>
                ) : (
                  items.map((item, index) => {
                    const img = item.product?.images?.[0]?.src;
                    const unitCents = item.variant?.price ?? 0;
                    return (
                      <li
                        key={`${order.id}-${index}`}
                        className="flex items-center gap-4 px-5 py-4 sm:px-6"
                      >
                        <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-[#ebe6df]">
                          {img ? (
                            <Image
                              src={img}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body text-sm font-medium text-mineral-ink">
                            {item.product?.title || 'Item'}
                          </p>
                          <p className="mt-0.5 truncate font-body text-xs text-mineral-ink/55">
                            {item.variant?.title || ''}
                            {item.quantity ? ` · Qty ${item.quantity}` : ''}
                          </p>
                        </div>
                        <p className="shrink-0 font-body text-sm tabular-nums text-mineral-ink">
                          {formatMoney((unitCents / 100) * (item.quantity || 1))}
                        </p>
                      </li>
                    );
                  })
                )}
              </ul>
            </li>
          );
        })}
      </ul>
    </AccountShell>
  );
}
