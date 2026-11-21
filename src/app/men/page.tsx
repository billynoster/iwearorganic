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
      bannerAlt="i wear organic menswear collection photography — coastal villa group in BLEND sweatshirts."
      bannerObjectPositionClassName="object-[54%_38%] sm:object-[52%_42%]"
    />
  );
}
