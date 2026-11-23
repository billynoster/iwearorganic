import type { Metadata } from 'next';
import { CollectionLanding } from '@/components/coastal/collection-landing';
import { collectionsService } from '@/services';

export const metadata: Metadata = {
  title: 'New Arrivals',
  description: 'New arrivals — organic clothing made for everyday life.',
};

export default async function NewArrivalsPage() {
  const { products, meta } =
    await collectionsService.getCollectionProducts('new-arrivals');

  return (
    <CollectionLanding
      eyebrow="Shop / New Arrivals"
      title="New Arrivals."
      editorialTitle
      description="Fresh silhouettes, familiar ease — made to be worn."
      products={products}
      usingFixtures={meta.usingFixtures}
      catalogUnavailable={Boolean(meta.catalogUnavailable)}
      activeCollection="new-arrivals"
      discoveryMode
      bannerImage="/editorial/collections/banner-new-arrivals.webp"
      bannerAlt="I Wear Organic New Arrivals — Soft Minimal coastal couple in organic loungewear."
      bannerObjectPositionClassName="object-[70%_42%] sm:object-[66%_40%]"
      bannerOverlay={{
        side: 'left',
        headline: 'New pieces. Same standard.',
        support: 'Organic materials from the first stitch.',
      }}
    />
  );
}
