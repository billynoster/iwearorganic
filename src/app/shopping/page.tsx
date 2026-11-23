import type { Metadata } from 'next';
import { CollectionLanding } from '@/components/coastal/collection-landing';
import { catalogService } from '@/services';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Shop The Everyday Collection — i wear organic.',
};

export default async function ShoppingPage() {
  const { products, meta } = await catalogService.listProducts();

  return (
    <CollectionLanding
      eyebrow="Shop"
      title="The Everyday Collection."
      editorialTitle
      description="Considered essentials for wherever the day takes you."
      products={products}
      usingFixtures={meta.usingFixtures}
      catalogUnavailable={Boolean(meta.catalogUnavailable)}
      activeCollection="all"
      discoveryMode
      bannerImage="/editorial/collections/banner-shopping.webp"
      bannerAlt="I Wear Organic Everyday Collection — Soft Minimal coastal group on driftwood in organic loungewear."
      bannerObjectPositionClassName="object-[50%_42%] sm:object-[50%_40%]"
    />
  );
}
