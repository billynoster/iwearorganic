import type { Metadata } from 'next';
import { AboutHero } from '@/components/coastal/about/about-hero';
import { OurStorySections } from '@/components/coastal/about/our-story-sections';
import { BrandClosingStatement } from '@/components/coastal/about/brand-closing-statement';

export const metadata: Metadata = {
  title: {
    absolute: 'Our Story | I Wear Organic',
  },
  description:
    'Wear Better. Naturally. I Wear Organic is a contemporary apparel brand where organic isn’t a collection — it’s the entire store.',
  openGraph: {
    title: 'Our Story | I Wear Organic',
    description:
      'Wear Better. Naturally. Organic apparel for everyday life — where organic is the standard.',
    url: 'https://iwearorganic.com/about',
    type: 'website',
  },
  alternates: {
    canonical: 'https://iwearorganic.com/about',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'I Wear Organic',
  url: 'https://iwearorganic.com',
  description:
    'Contemporary organic apparel brand. Organic isn’t a collection — it’s the entire store.',
};

export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <AboutHero />
      <OurStorySections />
      <BrandClosingStatement />
    </main>
  );
}
