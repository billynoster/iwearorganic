import type { Metadata } from 'next';
import { CollectionLanding } from '@/components/coastal/collection-landing';
import { collectionsService } from '@/services';

export const metadata: Metadata = {
  title: 'New Arrivals',
  description: 'The latest from The Everyday Collection — i wear organic.',
};

export default async function NewArrivalsPage() {
  const { products, meta } =
    await collectionsService.getCollectionProducts('new-arrivals');

  return (
    <CollectionLanding
      eyebrow="Shop / New Arrivals"
      title="New Arrivals."
      editorialTitle
      description="The latest for The Art of Everyday — fresh silhouettes, familiar ease."
      products={products}
      usingFixtures={meta.usingFixtures}
      catalogUnavailable={Boolean(meta.catalogUnavailable)}
      activeCollection="new-arrivals"
      discoveryMode
      bannerImage="/editorial/collections/banner-new-arrivals.png"
      bannerAlt="i wear organic New Arrivals collection photography — contemporary campaign featuring the latest Everyday Collection pieces."
    />
  );
}
