import type { Metadata } from 'next';
import { MaterialsPageContent } from '@/components/coastal/materials/materials-page';

export const metadata: Metadata = {
  title: {
    absolute: 'Materials | I Wear Organic',
  },
  description:
    'Better starts with the material. Learn how I Wear Organic uses organic cotton and carefully selected fibers — with clear composition on every product page.',
  openGraph: {
    title: 'Materials | I Wear Organic',
    description:
      'Organic cotton at the center. Clear material facts on every product. Wear Better. Naturally.',
    url: 'https://iwearorganic.com/materials',
    type: 'website',
  },
  alternates: {
    canonical: 'https://iwearorganic.com/materials',
  },
};

export default function MaterialsPage() {
  return <MaterialsPageContent />;
}
