'use client';

import { useState, useEffect } from 'react';
import { PrintifyProduct } from '@/ai/flows/printify-products';
import { ProductCard } from './product-card';

const STORAGE_KEY = 'iwearorganic_recently_viewed';
const MAX_ITEMS = 4;

export function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const [recentProducts, setRecentProducts] = useState<PrintifyProduct[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PrintifyProduct[];
        // Filter out the current product if we are on a product page
        const filtered = currentProductId 
          ? parsed.filter(p => p.id !== currentProductId)
          : parsed;
        setRecentProducts(filtered.slice(0, MAX_ITEMS));
      } catch (e) {
        console.error("Failed to parse recently viewed", e);
      }
    }
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section className="mt-24 pt-16 border-t border-border/50">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold font-headline uppercase tracking-[0.1em]">Recently Viewed</h2>
          <p className="text-muted-foreground">Pick up where you left off.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function addToRecentlyViewed(product: PrintifyProduct) {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  let products: PrintifyProduct[] = [];

  if (stored) {
    try {
      products = JSON.parse(stored);
    } catch (e) {
      products = [];
    }
  }

  // Remove if already exists to move to front
  products = products.filter(p => p.id !== product.id);
  
  // Add to front
  products.unshift(product);
  
  // Limit size
  products = products.slice(0, 10);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
