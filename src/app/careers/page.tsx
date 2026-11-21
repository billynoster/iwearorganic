import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/coastal/page-hero';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Collaborate with i wear organic.',
};

export default function CareersPage() {
  return (
    <main>
      <PageHero
        eyebrow="House"
        title="Careers."
        editorial
        description="A small house. Occasional collaborators welcome — writers, photographers, and makers who share the coastal calm."
      />
      <div className="ca-container max-w-3xl space-y-8 py-12 sm:py-16">
        <p className="ca-lede">
          This is not a traditional job board. If your work fits The Quiet Editorial × The Living
          Lookbook, introduce yourself with a short note and relevant links.
        </p>
        <ul className="space-y-3 font-body text-sm text-mineral-ink/75">
          <li>Writers & storytellers</li>
          <li>Photographers & filmmakers</li>
          <li>Stylists & art directors</li>
          <li>Makers & textile collaborators</li>
        </ul>
        <Link href="/contact" className="ca-btn-primary inline-flex">
          Get in touch
        </Link>
      </div>
    </main>
  );
}
