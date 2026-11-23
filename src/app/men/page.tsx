import type { Metadata } from 'next';
import { CollectionLanding } from '@/components/coastal/collection-landing';
import { collectionsService } from '@/services';

export const metadata: Metadata = {
  title: 'Men',
  description: 'Menswear essentials — organic clothing made for everyday life.',
};

export default async function MenPage() {
  const { products, meta } = await collectionsService.getCollectionProducts('menswear');

  return (
    <CollectionLanding
      eyebrow="Shop / Men"
      title="Menswear."
      editorialTitle
      description="Quiet structure for coastal days — considered essentials, easy to wear."
      products={products}
      usingFixtures={meta.usingFixtures}
      catalogUnavailable={Boolean(meta.catalogUnavailable)}
      activeCollection="men"
      discoveryMode
      bannerImage="/editorial/collections/banner-men.webp"
      bannerAlt="I Wear Organic menswear — Soft Minimal coastal portrait in organic hoodie."
      bannerObjectPositionClassName="object-[28%_45%] sm:object-[24%_42%]"
      bannerOverlay={{
        side: 'right',
        headline: 'Clean silhouettes. Organic materials.',
        support: 'Essentials built for everyday life.',
      }}
    />
  );
}
