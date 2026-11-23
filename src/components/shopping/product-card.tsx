'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PrintifyProduct } from '@/ai/flows/printify-products';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Sparkles } from 'lucide-react';
import { useWishlist } from '@/context/wishlist-context';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { calculateVibeMatch } from '@/lib/vibe-utils';
import { getProductGenderEligibility } from '@/lib/gender-utils';
import { Badge } from '@/components/ui/badge';
import { QuickView } from './quick-view';

export function ProductCard({ product }: { product: PrintifyProduct }) {
  const [isClient, setIsClient] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userDocRef = useMemo(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc(userDocRef);

  const matchScore = useMemo(() => {
    if (!userData?.vibe) return 0;
    return calculateVibeMatch(userData.vibe, product.tags);
  }, [userData?.vibe, product.tags]);

  const inWishlist = isClient ? isInWishlist(product.id) : false;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const isYoga = useMemo(() => {
    const t = product.tags.map(tag => tag.toLowerCase());
    const title = product.title.toLowerCase();
    return t.some(tag => tag.includes('yoga') || tag.includes('legging') || tag.includes('sports bra') || tag.includes('activewear') || tag.includes('capri')) ||
           title.includes("yoga") ||
           title.includes("legging") ||
           title.includes("sports bra") ||
           title.includes("capri");
  }, [product.tags, product.title]);

  const genderEligibility = useMemo(() => {
    return getProductGenderEligibility(product.title, product.tags);
  }, [product.title, product.tags]);

  const defaultImage = product.images.find(img => img.is_default) || product.images[0];
  const defaultVariant = product.variants.find(v => v.is_enabled !== false && v.is_available !== false) || product.variants[0];
  const price = defaultVariant ? defaultVariant.price / 100 : 0; // Price is in cents

  return (
    <>
      <Link href={`/shopping/${product.id}`} className="flex flex-col h-full group">
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-accent cursor-pointer border-border/50 bg-card/50">
          <CardHeader className="p-0 relative">
            <div className={cn(
              "relative w-full overflow-hidden transition-all duration-500",
              isYoga ? "aspect-[3/2]" : "aspect-[2/3]"
            )}>
              {defaultImage ? (
                <Image
                  src={defaultImage.src}
                  alt={product.title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  quality={100}
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted">
                    <span className='text-muted-foreground'>No Image</span>
                </div>
              )}
              <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                {matchScore > 0 && (
                  <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {matchScore}% Vibe Match
                  </Badge>
                )}
                {genderEligibility.isUnisex && (
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 w-fit border border-border/40">
                    Unisex Fit
                  </Badge>
                )}
              </div>
              
              {/* Quick View Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="font-medium tracking-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                  onClick={handleQuickViewClick}
                >
                  Quick View
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-background/80 z-10"
              onClick={handleWishlistClick}
            >
              <Heart className={cn("h-5 w-5 transition-colors", inWishlist ? "fill-red-500 text-red-500" : "text-foreground")} />
            </Button>
          </CardHeader>
          <CardContent className="p-4 flex flex-col flex-1 gap-2">
            <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
              {product.title}
            </CardTitle>
            <div className="flex justify-between items-center mt-auto">
                <span className="text-lg font-medium text-primary">
                    {price ? `$${price.toFixed(2)}` : 'N/A'}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  View Details
                </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      <QuickView 
        product={product} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
      />
    </>
  );
}
