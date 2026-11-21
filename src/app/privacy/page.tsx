import type { Metadata } from 'next';
import { PageHero } from '@/components/coastal/page-hero';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy policy for i wear organic — iPhone app and iwearorganic.com.',
};

export default function PrivacyPage() {
  return (
    <main>
      <PageHero
        eyebrow="Policies"
        title="Privacy"
        description="How we handle account and order information."
      />
      <div className="ca-container max-w-3xl space-y-6 py-12 sm:py-16">
        <p className="ca-lede">
          i wear organic is a one-person shop based in Tennessee. This policy covers the iPhone app
          and iwearorganic.com.
        </p>
        <p className="ca-lede">
          When you create an account we keep your name and email through Firebase Authentication,
          shared with the website. When you check out we collect a shipping address and email so we
          can fulfill the order.
        </p>
        <p className="ca-lede">
          Payments are processed by Stripe. We do not store your full card number. Pieces are made
          to order and fulfilled by manufacturing partners. We share only what they need to produce
          and ship your order.
        </p>
        <p className="ca-lede">
          The iPhone app also stores cart, wishlist, addresses, and order history on the device.
        </p>
        <p className="ca-lede">
          We do not sell your information. We do not use it for advertising networks.
        </p>
        <p className="ca-lede">
          You can delete your i wear organic account in the iPhone app under Account → Settings. That
          removes the sign-in from Firebase. Local cart and history on that iPhone are cleared at
          the same time. To delete a website-only account, contact us through iwearorganic.com.
        </p>
        <p className="ca-lede">Questions: iwearorganic.com</p>
      </div>
    </main>
  );
}
