import type { Metadata } from 'next';
import { EditorialNav } from '@/components/coastal/editorial-nav';
import { CinematicHero } from '@/components/coastal/cinematic-hero';
import { CollectionRail } from '@/components/coastal/collection-rail';
import { EverydayUniformGallery } from '@/components/coastal/everyday-uniform-gallery';
import { LivingLookbook } from '@/components/coastal/living-lookbook';
import { WornYourWay } from '@/components/coastal/worn-your-way';
import { AppStoreSignature } from '@/components/coastal/app-store-signature';
import { EditorialFooter } from '@/components/coastal/editorial-footer';
import { SkipLink } from '@/components/coastal/skip-link';
import { collectionsService, catalogService } from '@/services';
import { selectEverydayUniformProducts } from '@/lib/everyday-uniform';

export const metadata: Metadata = {
  title: 'i wear organic — Made for the Moment',
  description:
    'Easy to wear. Hard to overlook. The Everyday Collection — Coastal Analog editorial commerce by i wear organic.',
};

/**
 * Phase 6C homepage order (locked):
 * Header → Hero → Shop by Collection → Everyday Uniform → In Motion →
 * Worn Your Way → App Store → Footer
 * Just dropped strip removed (duplicated Everyday Uniform).
 */
export default async function CoastalHomePage() {
  const [{ collections, meta: collectionMeta }, { products, meta: catalogMeta }] =
    await Promise.all([
      collectionsService.listCollections(),
      catalogService.listProducts(),
    ]);

  const usingFixtures = collectionMeta.usingFixtures || catalogMeta.usingFixtures;
  const galleryProducts = selectEverydayUniformProducts(products, 4);

  return (
    <div className="bg-linen text-mineral-ink">
      <SkipLink />
      <EditorialNav />
      <main id="main-content">
        <CinematicHero />
        <CollectionRail collections={collections} usingFixtures={usingFixtures} />
        <EverydayUniformGallery
          products={galleryProducts}
          usingFixtures={catalogMeta.usingFixtures}
        />
        <LivingLookbook />
        <WornYourWay
          products={galleryProducts}
          usingFixtures={catalogMeta.usingFixtures}
        />
        <AppStoreSignature />
      </main>
      <EditorialFooter />
    </div>
  );
}
