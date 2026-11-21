import type { OrderStatusResult, ServiceMeta } from './types';

/**
 * Order status service.
 * Reads are intended via authenticated Firestore client rules for the owning user.
 * Webhook remains the write path for paid/fulfillment transitions — do not alter production webhooks here.
 */

export interface OrderStatusService {
  getOrderStatus(
    orderId: string
  ): Promise<{ order: OrderStatusResult | null; meta: ServiceMeta; error?: string }>;
}

export const orderStatusService: OrderStatusService = {
  async getOrderStatus(orderId) {
    if (typeof window === 'undefined') {
      return {
        order: null,
        meta: { usingFixtures: false },
        error: 'Order status reads require the Firebase client in the browser',
      };
    }

    try {
      const { initializeFirebase } = await import('@/firebase');
      const { doc, getDoc } = await import('firebase/firestore');
      const { firestore } = initializeFirebase();
      const snap = await getDoc(doc(firestore, 'orders', orderId));
      if (!snap.exists()) {
        return { order: null, meta: { usingFixtures: false } };
      }
      const data = snap.data();
      return {
        order: {
          orderId,
          status: (data.status as OrderStatusResult['status']) || 'unknown',
          printifyOrderId: data.printifyOrderId,
          totalAmountCents:
            typeof data.totalAmount === 'number'
              ? Math.round(data.totalAmount * 100)
              : undefined,
          updatedAt: data.completedAt || data.createdAt,
        },
        meta: { usingFixtures: false },
      };
    } catch (error: any) {
      return {
        order: null,
        meta: { usingFixtures: false },
        error: error?.message || 'Failed to load order status',
      };
    }
  },
};
