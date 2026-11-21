'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PrintifyProduct } from '@/ai/flows/printify-products';
import { getProductByIdAction } from '@/app/actions/printify';

export function EmbeddedProduct({ productId }: { productId: string }) {
  const [product, setProduct] = useState<PrintifyProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const fetchedProduct = await getProductByIdAction(productId);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error('Failed to fetch product for embed:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="my-8 p-4 border rounded-lg flex gap-4 items-center bg-card">
        <Skeleton className="w-24 h-24 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-10 w-28 shrink-0" />
      </div>
    );
  }

  if (!product) return null;

  const defaultImage = product.images.find(img => img.is_default) || product.images[0];
  const activeVariant = product.variants.find(v => v.is_enabled !== false && v.is_available !== false) || product.variants[0];
  const price = activeVariant?.price ? (activeVariant.price / 100).toFixed(2) : '0.00';

  return (
    <div className="my-8 p-4 sm:p-6 border rounded-lg bg-card/50 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
      {defaultImage && (
        <div className="relative w-full sm:w-32 aspect-square rounded-lg overflow-hidden bg-muted shrink-0">
          <Image
            src={defaultImage.src}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="flex-1 text-center sm:text-left space-y-1">
        <h4 className="font-bold text-lg leading-tight line-clamp-2">{product.title}</h4>
        <p className="text-muted-foreground font-medium">${price}</p>
      </div>
      <Button asChild className="w-full sm:w-auto shrink-0">
        <Link href={`/shopping/${product.id}`}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Shop Now
        </Link>
      </Button>
    </div>
  );
}
