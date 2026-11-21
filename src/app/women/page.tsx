import type { Metadata } from 'next';
import { CollectionLanding } from '@/components/coastal/collection-landing';
import { collectionsService } from '@/services';

export const metadata: Metadata = {
  title: 'Women',
  description: 'Womenswear essentials for The Art of Everyday — i wear organic.',
};

export default async function WomenPage() {
  const { products, meta } = await collectionsService.getCollectionProducts('womenswear');

  return (
    <CollectionLanding
      eyebrow="Shop / Women"
      title="Womenswear."
      editorialTitle
      description="Soft lines, lasting presence — pieces meant for wherever the day takes you."
      products={products}
      usingFixtures={meta.usingFixtures}
      catalogUnavailable={Boolean(meta.catalogUnavailable)}
      activeCollection="women"
      discoveryMode
      bannerImage="/editorial/collections/banner-women.webp"
      bannerAlt="i wear organic womenswear collection photography — coastal cliff group in BLEND sweatshirts."
      bannerObjectPositionClassName="object-[50%_36%] sm:object-[50%_42%]"
    />
  );
}
