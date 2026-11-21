import type { Product } from '@/services/types';
import { ProductTile } from '@/components/coastal/product-tile';
import { productHasNewBadge } from '@/lib/just-dropped';

interface ProductGridProps {
  products: Product[];
  usingFixtures?: boolean;
  emptyMessage?: string;
  /** Enable data-driven “New” badges (New Arrivals PLP only). */
  showNewBadges?: boolean;
}

export function ProductGrid({
  products,
  usingFixtures,
  emptyMessage = 'No products in this collection yet.',
  showNewBadges = false,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="font-body text-sm text-mineral-ink/60" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductTile
            product={product}
            usingFixtures={usingFixtures}
            showNewBadge={showNewBadges && productHasNewBadge(product)}
          />
        </li>
      ))}
    </ul>
  );
}
