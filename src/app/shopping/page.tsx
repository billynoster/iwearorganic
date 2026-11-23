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
      bannerAlt="I Wear Organic everyday collection — Soft Minimal coastal lifestyle photography."
      bannerObjectPositionClassName="object-[55%_38%] sm:object-[52%_42%]"
    />
  );
}
