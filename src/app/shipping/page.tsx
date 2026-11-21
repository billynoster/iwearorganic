import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/coastal/page-hero';

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description: 'Shipping and returns information for i wear organic.',
};

export default function ShippingPage() {
  return (
    <main>
      <PageHero
        eyebrow="Support"
        title="Shipping & Returns"
        description="Clear policies for The Everyday Collection. Full carrier details follow as fulfillment is verified in staging."
      />
      <div className="ca-container max-w-3xl space-y-10 py-12 sm:py-16">
        <section>
          <h2 className="ca-heading text-h3">Shipping</h2>
          <p className="ca-lede mt-3">
            Orders are fulfilled through our print partner after payment confirmation. Standard
            shipping windows vary by garment and destination (typically US / CA / GB checkout
            countries). Tracking is provided when the shipment leaves production.
          </p>
        </section>
        <section>
          <h2 className="ca-heading text-h3">Returns</h2>
          <p className="ca-lede mt-3">
            Because many pieces are made to order, return eligibility depends on the item and
            print partner policy. Contact us with your order ID and we will guide next steps.
          </p>
        </section>
        <p className="ca-meta">
          This page is a branded support landing for Phase 2 — not a substitute for final legal
          policy copy.
        </p>
        <Link href="/contact" className="ca-text-link">
          Contact support
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
