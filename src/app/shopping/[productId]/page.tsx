import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { catalogService } from '@/services';
import { ProductDetailCoastal } from '@/components/coastal/product-detail-coastal';

interface PageProps {
  params: Promise<{ productId: string }> | { productId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await Promise.resolve(params);
  const { product } = await catalogService.getProductById(productId);
  if (!product) return { title: 'Product' };
  return {
    title: product.title,
    description: product.description?.slice(0, 160) || product.title,
  };
}

function relatedFor(product: Awaited<ReturnType<typeof catalogService.getProductById>>['product'], catalog: Awaited<ReturnType<typeof catalogService.listProducts>>['products']) {
  if (!product) return [];
  const collections = new Set(product.collectionIds || []);
  const scored = catalog
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      const shared = (candidate.collectionIds || []).filter((id) =>
        collections.has(id)
      ).length;
      const tagOverlap = candidate.tags.filter((tag) =>
        product.tags.includes(tag)
      ).length;
      return { candidate, score: shared * 2 + tagOverlap };
    })
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title));

  const preferred = scored.filter((entry) => entry.score > 0).map((entry) => entry.candidate);
  if (preferred.length >= 4) return preferred.slice(0, 4);
  const rest = scored
    .filter((entry) => entry.score === 0)
    .map((entry) => entry.candidate);
  return [...preferred, ...rest].slice(0, 4);
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await Promise.resolve(params);
  const [{ product, meta }, catalogResult] = await Promise.all([
    catalogService.getProductById(productId),
    catalogService.listProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = relatedFor(product, catalogResult.products);

  return (
    <main>
      <div className="ca-container py-6">
        <nav className="font-body text-xs text-mineral-ink/50" aria-label="Breadcrumb">
          <Link href="/shopping" className="hover:text-mineral-ink">
            Shop
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-mineral-ink/70">{product.title}</span>
        </nav>
      </div>
      <ProductDetailCoastal
        product={product}
        relatedProducts={relatedProducts}
        usingFixtures={meta.usingFixtures}
      />
    </main>
  );
}
