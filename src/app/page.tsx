import type { Metadata } from 'next';
import { EditorialNav } from '@/components/coastal/editorial-nav';
import { CinematicHero } from '@/components/coastal/cinematic-hero';
import { FeaturedProducts } from '@/components/coastal/featured-products';
import { BrandProposition } from '@/components/coastal/brand-proposition';
import { EditorialLifestyle } from '@/components/coastal/editorial-lifestyle';
import { AppStoreSignature } from '@/components/coastal/app-store-signature';
import { EditorialFooter } from '@/components/coastal/editorial-footer';
import { SkipLink } from '@/components/coastal/skip-link';
import { catalogService } from '@/services';
import { selectEverydayUniformProducts } from '@/lib/everyday-uniform';

export const metadata: Metadata = {
  title: 'I Wear Organic — Wear Better. Naturally.',
  description:
    'Wear Better. Naturally. Organic clothing made for everyday life.',
};

/**
 * Homepage flow:
 * Brand (Hero) → Shop (Featured) → Why Organic → Lifestyle → App → Footer
 */
export default async function CoastalHomePage() {
  const { products, meta: catalogMeta } = await catalogService.listProducts();
  const galleryProducts = selectEverydayUniformProducts(products, 4);

  return (
    <div className="bg-white text-mineral-ink">
      <SkipLink />
      <EditorialNav />
      <main id="main-content">
        <CinematicHero />
        <FeaturedProducts
          products={galleryProducts}
          usingFixtures={catalogMeta.usingFixtures}
        />
        <BrandProposition />
        <EditorialLifestyle />
        <AppStoreSignature />
      </main>
      <EditorialFooter />
    </div>
  );
}
