import type { Metadata } from 'next';
import { PageHero } from '@/components/coastal/page-hero';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of service for i wear organic made-to-order apparel.',
};

export default function TermsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Policies"
        title="Terms"
        description="Made-to-order apparel — what you agree to when you shop."
      />
      <div className="ca-container max-w-3xl space-y-6 py-12 sm:py-16">
        <p className="ca-lede">
          i wear organic sells made-to-order apparel. When you place an order you are asking us to
          produce that piece for you.
        </p>
        <p className="ca-lede">
          Prices, shipping, and estimated tax are shown at checkout. Payment is collected by Stripe.
        </p>
        <p className="ca-lede">
          Because pieces are made to order, they cannot always be returned. If an item arrives
          damaged or incorrect, contact us through iwearorganic.com and we will make it right.
        </p>
        <p className="ca-lede">
          Accounts are for your own use. You may delete your account at any time in the iPhone app
          under Settings, or by contacting us.
        </p>
        <p className="ca-lede">
          The collection, names, and brand belong to i wear organic.
        </p>
      </div>
    </main>
  );
}
