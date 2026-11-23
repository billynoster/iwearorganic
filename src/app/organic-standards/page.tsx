import type { Metadata } from 'next';
import { OrganicStandardsPageContent } from '@/components/coastal/organic-standards/organic-standards-page';

export const metadata: Metadata = {
  title: {
    absolute: 'Organic Standards | I Wear Organic',
  },
  description:
    'Clear standards. Clearer choices. How I Wear Organic talks about organic materials, certifications, and product composition — without vague sustainability claims.',
  openGraph: {
    title: 'Organic Standards | I Wear Organic',
    description:
      'Transparency over marketing language. Specific material claims connected to the garment you’re buying.',
    url: 'https://iwearorganic.com/organic-standards',
    type: 'website',
  },
  alternates: {
    canonical: 'https://iwearorganic.com/organic-standards',
  },
};

export default function OrganicStandardsPage() {
  return <OrganicStandardsPageContent />;
}
