import type { Metadata } from 'next';
import { AboutHero } from '@/components/coastal/about/about-hero';
import { HeritageChapter } from '@/components/coastal/about/heritage-chapter';
import { HeritageChapterBeginning } from '@/components/coastal/about/heritage-chapter-beginning';
import { HeritageTimeline } from '@/components/coastal/about/heritage-timeline';
import { BrandClosingStatement } from '@/components/coastal/about/brand-closing-statement';

export const metadata: Metadata = {
  title: {
    absolute: 'About i wear organic | Est. 1997 in Chicago',
  },
  description:
    'Discover the story of i wear organic, founded in Chicago in 1997. From selling beanies to building an independent online apparel brand.',
  openGraph: {
    title: 'About i wear organic | Est. 1997 in Chicago',
    description:
      'Discover the story of i wear organic, founded in Chicago in 1997. From selling beanies to building an independent online apparel brand.',
    url: 'https://iwearorganic.com/about',
    type: 'website',
  },
  alternates: {
    canonical: 'https://iwearorganic.com/about',
  },
};

/** Verified Organization facts only — no invented awards, locations, or growth claims. */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'i wear organic',
  url: 'https://iwearorganic.com',
  foundingDate: '1997',
  foundingLocation: {
    '@type': 'Place',
    name: 'Chicago, Illinois',
  },
  description:
    'Independent apparel brand founded in Chicago in 1997. Began with beanies; iwearorganic.com was registered in 1998.',
};

export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <AboutHero />

      <HeritageChapterBeginning />

      <HeritageChapter
        id="chapter-pivot"
        eyebrow="02 / The Pivot"
        headline="Then the internet happened."
        layout="image-right"
        image={{
          src: '/editorial/about/chapter-02-internet.png',
          alt: 'Interpretive early-web desk scene with a CRT monitor — representing the 1998 ecommerce pivot, not an archival photograph.',
          caption: 'Interpretive · 1998 ecommerce pivot',
          objectPosition: 'center',
        }}
        paragraphs={[
          'In 1998, we registered iwearorganic.com and took our first steps into ecommerce.',
          'What began as a vision for a neighborhood storefront found a new home online, opening the door to customers far beyond Chicago.',
          'The storefront we imagined became something entirely different.',
          "And that's where the story really began.",
        ]}
      />

      <HeritageChapter
        id="chapter-evolution"
        eyebrow="03 / The Evolution"
        headline="From Chicago. For everywhere."
        layout="image-wide"
        image={{
          src: '/editorial/about/chapter-03-evolution.png',
          alt: 'Group of friends in i wear organic sweatshirts — Living Lookbook photography from the current collection.',
          caption: 'Living Lookbook · current collection',
          objectPosition: 'center',
        }}
        paragraphs={[
          'Through changing trends, evolving technology, and the many ways people express themselves, one idea has remained at the center of i wear organic: great everyday clothing should feel effortless and personal.',
          'What started with beanies has grown into a broader collection of casual essentials, from T-shirts and sweatshirts to hoodies and everyday layers.',
          "We believe personal style doesn't need to be complicated.",
          "Sometimes it's your favorite sweatshirt, a well-worn tee, or the one piece you reach for without thinking twice.",
        ]}
        closingLines={['Clothes that fit into real life.', 'Clothes that become part of your story.']}
      />

      <HeritageChapter
        id="chapter-today"
        eyebrow="04 / The Art of Everyday"
        headline="Still evolving."
        layout="image-editorial"
        image={{
          src: '/editorial/about/chapter-04-evolving.png',
          alt: 'Contemporary i wear organic campaign portrait in a dusty-rose sweatshirt — studio photography from the current collection.',
          caption: 'Campaign photography · contemporary',
          objectPosition: 'center 20%',
        }}
        paragraphs={[
          'Today, i wear organic continues to evolve, combining its independent roots with a modern approach to fashion, creativity, and commerce.',
          'Our inspiration comes from the everyday moments that make life memorable: city streets, open roads, coastal afternoons, and everything in between.',
          "We're not here to tell you how to dress.",
          "We're here to make pieces you can make your own.",
        ]}
        closingLines={['Easy to wear. Hard to overlook.']}
      />

      <HeritageTimeline />

      <BrandClosingStatement />
    </main>
  );
}
