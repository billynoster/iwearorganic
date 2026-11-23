import type { Metadata } from 'next';
import { CollectionLanding } from '@/components/coastal/collection-landing';
import { collectionsService } from '@/services';

export const metadata: Metadata = {
  title: 'Women',
  description: 'Womenswear essentials — organic clothing made for everyday life.',
};

export default async function WomenPage() {
  const { products, meta } = await collectionsService.getCollectionProducts('womenswear');

  return (
    <CollectionLanding
      eyebrow="Shop / Women"
      title="Womenswear."
      editorialTitle
      description="Soft lines, lasting presence — pieces meant for wherever the day takes you."
      aside="Organic fibers. Easy layers. Clothing made to feel as good as it looks."
      products={products}
      usingFixtures={meta.usingFixtures}
      catalogUnavailable={Boolean(meta.catalogUnavailable)}
      activeCollection="women"
      discoveryMode
      bannerImage="/editorial/collections/banner-women.webp"
      bannerAlt="I Wear Organic womenswear — Soft Minimal coastal portrait in organic loungewear."
      bannerObjectPositionClassName="object-[72%_42%] sm:object-[68%_40%]"
    />
  );
}
