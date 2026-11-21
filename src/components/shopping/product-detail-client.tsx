'use client';



import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';

import {
  PrintifyProduct,
  
} from '@/ai/flows/printify-products';

import { Button } from '@/components/ui/button';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Label } from '@/components/ui/label';

import { Separator } from '@/components/ui/separator';

import { Zap, FileVideo, ArrowLeft, Loader2, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getProductGenderEligibility } from '@/lib/gender-utils';

import { useCart } from '@/context/cart-context';

import { useWishlist } from '@/context/wishlist-context';

import { ProductReviews } from './product-reviews';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

import { ProductCard } from './product-card';

import { RecentlyViewed, addToRecentlyViewed } from './recently-viewed';

export function ProductDetailClient({ product }: { product: PrintifyProduct }) {
  const { addToCart, clearCart, openCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();
  const isInitialMount = useRef(true);
  
  const [allProducts, setAllProducts] = useState<PrintifyProduct[]>([]);
  const [isLoadingPairs, setIsLoadingPairs] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    addToRecentlyViewed(product);
  }, [product]);

  const inWishlist = isClient ? isInWishlist(product.id) : false;

  const handleWishlistToggle = async () => {
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setIsLoadingPairs(true);
      try {
          const res = await fetch('/api/products'); const fetched = await res.json();
        setAllProducts(fetched);
      } catch (e: any) {
        console.error("Failed to load products for suggestions", e);
        if (e instanceof Error && (e.message.includes('Failed to find Server Action') || e.message.includes('Failed to fetch'))) {
            console.log('Server Action mismatch detected, reloading...');
            window.location.reload();
            return;
        }
      } finally {
        setIsLoadingPairs(false);
      }
    };
    loadAll();
  }, []);

  // Specific video overrides
  const videoUrls = useMemo(() => {
    const title = product.title.toLowerCase();

    if (product.id === "67b272e6cae4c640ec0ec6e7" || title.includes("vintage swimsuit with retro stripes")) {
      return ["https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fswimwear%2Fwomen%2Fretro%2Fblendamerica_retro_onepiece_07.mp4?alt=media"];
    }
    if (title.includes("solid red pencil skirt")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FRed%2Fblend%20america%20red%20skirt%20video%2001.mp4?alt=media&token=38dfe994-a012-4440-b744-eca00acaf795",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FRed%2Fblend%20america%20red%20skirt%20video%2003.mp4?alt=media&token=c9b309b9-b0bd-47f6-a3d0-c9d5d95eb0d3",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FRed%2Fblend%20america%20red%20skirt%20video%2004.mp4?alt=media&token=186b6a6d-90aa-4033-bd0a-6805fe3e7308",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FRed%2Fblend%20america%20red%20skirt%20video%2005.mp4?alt=media&token=ab26a51c-ac16-4260-b7e9-4d906fa81348",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FRed%2Fblend%20america%20red%20skirt%20video%2006.mp4?alt=media&token=468b459a-d958-4e69-80a5-a19477b329a8"
      ];
    }
    if (title.includes("solid terracotta color pencil skirt")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FTerracotta%2Fblend%20america%20terracotta%20skirt%20video%2005.mp4?alt=media&token=6269e5d4-5d67-4337-a415-db081b8b8d89",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FTerracotta%2Fblend%20america%20terracotta%20skirt%20video%2006.mp4?alt=media&token=5543a568-e2ff-4899-868d-9736c911b117",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FTerracotta%2Fblend%20america%20terracotta%20skirt%20video%2007.mp4?alt=media&token=7745c504-3f4c-4b19-b26d-99b77004823c",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FTerracotta%2Fblend%20america%20terracotta%20skirt%20video%2008.mp4?alt=media&token=362f7b1c-76de-475f-9a8d-cba9e929d603",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FTerracotta%2Fblend%20america%20terracotta%20skirt%20video%2009.mp4?alt=media&token=c7233738-e31f-4ec3-8951-cd8e36c94685",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FTerracotta%2Fblend%20america%20terracotta%20skirt%20video%2010.mp4?alt=media&token=9b07a0cb-f698-4d23-83d1-d54f58c922e0"
      ];
    }
    if (title.includes("stars & stripes bikini")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fswimwear%2Fwomen%2Fusa%2Fblend%20america%20usa%20flag%2002.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fswimwear%2Fwomen%2Fusa%2Fblend%20america%20usa%20flag%2004.mp4?alt=media"
      ];
    }
    if (title.includes("signature seam racerback dress – emerald")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2002%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2002.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2003%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2004%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2005%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2006%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2007%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2008%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2009%20video.mp4?alt=media"
      ];
    }
    if (title.includes("signature seam racerback dress – midnight navy")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2001.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2002.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2003.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2004.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2005.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2006.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2007.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2008.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2010.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2011.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2012.mp4?alt=media"
      ];
    }
    if (title.includes("signature seam racerback dress – sage")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsage%20color%2Fblend%20america%20sage%20video%2001.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsage%20color%2Fblend%20america%20sage%20video%2002.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsage%20color%2Fblend%20america%20sage%20video%2003.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsage%20color%2Fblend%20america%20sage%20video%2004.mp4?alt=media"
      ];
    }
    if (title.includes("signature seam racerback dress – olive stone")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fblend%20america%20sage%2001%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fblend%20america%20sage%2002%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fblend%20america%20sage%2003%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fblend%20america%20sage%2004%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fblend%20america%20sage%2005%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fblend%20america%20sage%2006%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fblend%20america%20sage%2007%20video.mp4?alt=media"
      ];
    }
    if (title.includes("signature seam racerback dress – crimson red")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2FRED%2Fblendamerica_red_racerback_03.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2FRED%2Fblendamerica_red_racerback_04.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2FRED%2Fblendamerica_red_racerback_05.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/studio-4927707357-8adc8.firebasofage.app/o/video%2FWomen%2Fracerback%2FRED%2Fblendamerica_red_racerback_06.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2FRED%2Fblendamerica_red_racerback_07.mp4?alt=media"
      ];
    }
    if (product.id === "6896c3dd10430a23e7107a61" || title.includes("signature seam racerback dress – antique white")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2012%20video%20.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2010%20video%20.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2001%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2002%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2003%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2004%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2005%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2009%20video%201080.mp4?alt=media"
      ];
    }
    if (title.includes("signature seam racerback dress – slate blue")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fslate%20blue%2Fblend%20america%20slate%20blue%2006.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fslate%20blue%2Fblend%20america%20slate%20blue%2007.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fslate%20blue%2Fblend%20america%20slate%20blue%2008.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fslate%20blue%2Fblend%20america%20slate%20blue%2009.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fslate%20blue%2Fblend%20america%20slate%20blue%2010.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fslate%20blue%2Fblend%20america%20slate%20blue%2011.mp4?alt=media"
      ];
    }
    if (title.includes("signature seam racerback dress – sand stone")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2001%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2002%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2003%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2004%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2005%20video.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2006.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2007.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2008.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2009.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2010.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2011.mp4?alt=media"
      ];
    }
    if (title.includes("signature seam racerback dress – terracotta")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fblend%20america%20terracotta%20video%2001.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fblend%20america%20terracotta%20video%2002.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fblend%20america%20terracotta%20video%2003.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fblend%20america%20terracotta%20video%2004.mp4?alt=media"
      ];
    }
    if (title.includes("solid burgundy racerback dress")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fburgundy%2Fblend%20america%20racerback%20dress%20burgundy%2006.mp4?alt=media&token=678b08f8-6db1-4984-b0a0-5faaaaa8c16c",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fburgundy%2Fblend%20america%20racerback%20dress%20burgundy%2005.mp4?alt=media&token=adc15239-9caa-4cd1-ab87-bf39c0338b7a",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fburgundy%2Fblend%20america%20racerback%20dress%20burgundy%2004.mp4?alt=media&token=c124f761-e68d-400a-b6a6-ed8376b5bb06",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fburgundy%2Fblend%20america%20racerback%20dress%20burgundy%2003.mp4?alt=media&token=07c73901-1603-4a12-87f9-b4f241c9222f"
      ];
    }
    if (title.includes("cherry") && title.includes("racerback") && title.includes("dress")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fcherry%2Fblend%20america%20cherry%20red%20racerback%2001.mp4?alt=media&token=ec48b951-7f25-4ba6-9cba-92823634bc1e",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fcherry%2Fblend%20america%20cherry%20red%20racerback%2002.mp4?alt=media&token=3c8d0bb7-9749-4a67-b06e-2b32d624d238",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fcherry%2Fblend%20america%20cherry%20red%20racerback%2003.mp4?alt=media&token=d408782c-bcf6-425f-be5e-edebee1031eb",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fcherry%2Fblend%20america%20cherry%20red%20racerback%2004.mp4?alt=media&token=2cf69016-ff00-47f8-8de5-03f6d0d161d4"
      ];
    }
    if (title.includes("antique") && title.includes("white") && title.includes("racerback")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fsolid%2FModel_walking_in_beach_house_202604292333.mp4?alt=media&token=9d5fa535-2d36-4895-b753-8563a68afd98",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fsolid%2FModel_walking_in_beach_house_202604292334%20(1).mp4?alt=media&token=f69b23cd-39a4-44a5-a201-179bb807a878",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fsolid%2FModel_walking_in_beach_house_202604292334.mp4?alt=media&token=fc6a8be6-1e6f-4e1d-97bf-b068522edc86",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fsolid%2FModel_walking_in_beach_house_202604292336.mp4?alt=media&token=9c3111cb-1330-4ceb-9ec8-93361d7b6804"
      ];
    }
    if (title.includes("solid") && title.includes("terracotta") && title.includes("racerback")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fterracotta%20solid%2Fblend%20america%20racerback%20dress%20terracotta%2001.mp4?alt=media&token=a76bb1fd-6fdc-4948-8167-b912c9a7e047",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fterracotta%20solid%2Fblend%20america%20racerback%20dress%20terracotta%2002.mp4?alt=media&token=50ed3ff2-05c9-4f4f-aa00-fc30f2e6b26c",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fterracotta%20solid%2Fblend%20america%20racerback%20dress%20terracotta%2003.mp4?alt=media&token=7d5d0344-628d-4743-9317-df32bd05aa7c"
      ];
    }
    if (title.includes("sage") && title.includes("racerback") && title.includes("dress")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsolid%20color%2Fblend%20america%20racerback%20dress%20sage%2001.mp4?alt=media&token=44e94f43-ee67-49b1-88fd-5bb5fad7f508",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsolid%20color%2Fblend%20america%20racerback%20dress%20sage%2002.mp4?alt=media&token=5fdd0a94-0366-4006-8517-7718af13d905",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsolid%20color%2Fblend%20america%20racerback%20dress%20sage%2003.mp4?alt=media&token=840bc501-2a72-4556-ae10-9f3a7a562f1d",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsolid%20color%2Fblend%20america%20racerback%20dress%20sage%2004.mp4?alt=media&token=843154f8-17a8-4ece-98d8-11f55dda6893",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsolid%20color%2Fblend%20america%20racerback%20dress%20sage%2005.mp4?alt=media&token=6050dcbc-0a06-4c82-85be-99e6fd3dc012"
      ];
    }
    if (title.includes("burgundy") && (title.includes("yoga") || title.includes("sports bra"))) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Fblend%20yoga%20burgundy%20video%2001.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Fblend%20yoga%20burgundy%20video%2002.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Fblend%20yoga%20burgundy%20video%2003.mp4?alt=media"
      ];
    }
    if (title.includes("oxblood") && (title.includes("yoga") || title.includes("sports bra"))) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2001.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2002.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2003.mp4?alt=media",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2004.mp4?alt=media"
      ];
    }
    if (title.includes("moss") && title.includes("sweatshirt") && title.includes("retro racing stripes")) {
      return [
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FMen%2Fsweatshirt%2Fblend%20america%20sweatshirt%20moss%20green%20video%2001.mp4?alt=media&token=2687a495-3149-42de-a69a-5c1e524c3b9a",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FMen%2Fsweatshirt%2Fblend%20america%20sweatshirt%20moss%20green%20video%2003.mp4?alt=media&token=ed441070-e275-4a21-9451-8d6807bf57a1",
        "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FMen%2Fsweatshirt%2Fblend%20america%20sweatshirt%20moss%20green%20video%2004.mp4?alt=media&token=db7f5dc3-6b7f-4a42-92c5-a94e7890a60c"
      ];
    }
    return [];
  }, [product.id, product.title]);

  const isSwimwear = useMemo(() => {
    return product.id === "67b272e6cae4c640ec0ec6e7" || 
           product.tags.some(tag => {
             const t = tag.toLowerCase();
             return t.includes('swimwear') || t.includes('swimsuit') || t.includes('bikini');
           }) ||
           product.title.toLowerCase().includes("swimsuit") ||
           product.title.toLowerCase().includes("bikini");
  }, [product.id, product.tags, product.title]);

  const isDress = useMemo(() => {
    return product.tags.some(tag => tag.toLowerCase().includes('dress')) ||
           product.title.toLowerCase().includes("dress");
  }, [product.tags, product.title]);

  const isYoga = useMemo(() => {
    // Yoga now includes leggings, sports bras, and capris
    const t = product.tags.map(tag => tag.toLowerCase());
    const title = product.title.toLowerCase();
    return t.some(tag => tag.includes('yoga') || tag.includes('legging') || tag.includes('sports bra') || tag.includes('activewear') || tag.includes('capri')) ||
           title.includes("yoga") ||
           title.includes("legging") ||
           title.includes("sports bra") ||
           title.includes("capri");
  }, [product.tags, product.title]);

  // Determine the best aspect ratio for media display
  const mediaAspectRatio = isYoga ? "aspect-[3/2]" : "aspect-[2/3]";

  const options = useMemo(() => {
    if (!product.options) return [];
    
    const hasEnabledFlags = product.variants?.some((v: any) => v.is_enabled !== undefined);
    const enabledVariants = hasEnabledFlags 
      ? product.variants.filter((v: any) => v.is_enabled === true)
      : product.variants;

    const enabledOptionIds = new Set<number>();
    if (enabledVariants) {
      enabledVariants.forEach((v: any) => {
        if (Array.isArray(v.options)) {
          v.options.forEach((optId: number) => enabledOptionIds.add(optId));
        }
      });
    }
    
    return product.options.map(option => {
        const seen = new Set<string>();
        let values: string[] = [];

        for (const v of option.values) {
          if (hasEnabledFlags && enabledOptionIds.size > 0 && !enabledOptionIds.has(v.id)) {
            continue;
          }
          const norm = v.title.trim();
          if (seen.has(norm)) continue;
          seen.add(norm);
          values.push(v.title);
        }
        
        const optionName = option.name.toLowerCase();

        if (isSwimwear && optionName.includes('size')) {
            values = values.filter(v => ['S', 'M', 'L'].includes(v.trim().toUpperCase()));
        }

        if ((isDress || isYoga) && optionName.includes('size')) {
            values = values.filter(v => ['XS', 'S', 'M', 'L'].includes(v.trim().toUpperCase()));
        }

        if (isSwimwear && optionName.includes('strap color')) {
            values = values.filter(v => v.trim().toLowerCase() === 'white');
        }

        if (isDress && optionName.includes('binding color')) {
            values = values.filter(v => v.trim().toLowerCase() === 'white');
        }

        return {
            name: option.name,
            values: values,
        };
    }).filter(opt => opt.values.length > 0);
  }, [product.options, product.variants, isSwimwear, isDress, isYoga]);
  
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(() => {
    const initialOptions: { [key: string]: string } = {};
    if (options && options.length > 0) {
      options.forEach(option => {
        if (option.values.length > 0) {
          initialOptions[option.name] = option.values[0];
        }
      });
    } else if (product.options) {
      product.options.forEach(option => {
        const values = option.values.map(v => v.title);
        if (values.length > 0) {
          initialOptions[option.name] = values[0];
        }
      });
    }
    return initialOptions;
  });

  // Keep selectedOptions in sync with available options
  useEffect(() => {
    if (options && options.length > 0) {
      setSelectedOptions(prev => {
        let changed = false;
        const next = { ...prev };
        options.forEach(opt => {
          if (!next[opt.name] || !opt.values.includes(next[opt.name])) {
            if (opt.values.length > 0) {
              next[opt.name] = opt.values[0];
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }
  }, [options]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const defaultVariant = useMemo(() => {
    if (!product.variants) return null;
    return product.variants.find(v => v.is_enabled !== false && v.is_available !== false) || product.variants[0] || null;
  }, [product.variants]);

  const selectedVariant = useMemo(() => {
    if (!product.variants || !product.options) return null;

    const hasEnabledFlags = product.variants.some((v: any) => v.is_enabled !== undefined);
    const candidateVariants = hasEnabledFlags 
      ? product.variants.filter((v: any) => v.is_enabled === true)
      : product.variants;

    const optionValueIdMap = new Map<string, number>();
    product.options.forEach(option => {
        option.values.forEach(value => {
            optionValueIdMap.set(value.title, value.id);
        });
    });
    
    const selectedOptionIds = Object.values(selectedOptions)
      .map(title => optionValueIdMap.get(title))
      .filter((id): id is number => id !== undefined);

    if (selectedOptionIds.length !== options.length) {
      return candidateVariants[0] || defaultVariant;
    }

    const findVariant = candidateVariants.find(variant => {
        if (variant.options.length !== selectedOptionIds.length) return false;
        const sortedVariantOptions = [...variant.options].sort();
        const sortedSelectedOptions = [...selectedOptionIds].sort();
        return JSON.stringify(sortedVariantOptions) === JSON.stringify(sortedSelectedOptions);
    }) || product.variants.find(variant => {
        if (variant.options.length !== selectedOptionIds.length) return false;
        const sortedVariantOptions = [...variant.options].sort();
        const sortedSelectedOptions = [...selectedOptionIds].sort();
        return JSON.stringify(sortedVariantOptions) === JSON.stringify(sortedSelectedOptions);
    });

    return findVariant || candidateVariants[0] || defaultVariant;
  }, [product, options, selectedOptions, defaultVariant]);

  const price = selectedVariant ? selectedVariant.price / 100 : (defaultVariant ? defaultVariant.price / 100 : 0);
  
  const [activeImage, setActiveImage] = useState(
    product.images.find(img => img.is_default) || product.images[0]
  );
  
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(videoUrls[0] || null);

  useEffect(() => {
    if (selectedVariant) {
        const variantImage = product.images.find(img => img.variant_ids.includes(selectedVariant.id));
        if (variantImage) {
            setActiveImage(variantImage);
            if (!isInitialMount.current) {
                setActiveVideoUrl(null);
            }
        } else {
            setActiveImage(product.images.find(img => img.is_default) || product.images[0])
        }
    }
    isInitialMount.current = false;
  }, [selectedVariant, product.images]);

  const handleAddToCart = () => {
    if (selectedVariant) {
        addToCart(product, selectedVariant);
        openCart();
    }
  };

  const handleExpressBuy = () => {
    if (selectedVariant) {
        clearCart();
        addToCart(product, selectedVariant);
        router.push('/checkout');
    }
  };

  // Suggestion logic: Filter items by the same color name (e.g., "Burgundy")
  const pairedItems = useMemo(() => {
    if (allProducts.length === 0) return [];
    const color = product.title.split(' ')[0].toLowerCase();
    return allProducts.filter(p => 
      p.id !== product.id && 
      p.title.toLowerCase().includes(color)
    ).slice(0, 4);
  }, [allProducts, product.id, product.title]);

  return (
    <main className="w-full mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8 pb-32 sm:pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Media Gallery Column */}
        <div className="flex flex-col gap-8 min-w-0">
            <div className={cn(
                "relative w-full rounded-lg overflow-hidden border bg-black shadow-2xl transition-all duration-500",
                mediaAspectRatio
            )}>
                {activeVideoUrl ? (
                    <video
                        key={activeVideoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-top"
                    >
                        <source src={activeVideoUrl} type="video/mp4" />
                    </video>
                ) : activeImage ? (
                <Image
                    src={activeImage.src}
                    alt={product.title}
                    fill
                    className="object-cover object-top"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={100}
                    unoptimized
                />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <span className="text-muted-foreground">No Preview Available</span>
                  </div>
                )}
            </div>

            <div className="space-y-8">
                {/* Images Row */}
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">The Gallery</span>
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {product.images.map((image) => (
                            <div
                                key={image.src}
                                onClick={() => {
                                    setActiveImage(image);
                                    setActiveVideoUrl(null);
                                }}
                                className={cn(
                                    "relative flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-300",
                                    isYoga ? "w-36 h-24" : "w-24 h-36",
                                    !activeVideoUrl && activeImage?.src === image.src 
                                      ? 'border-primary scale-95 opacity-100' 
                                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                )}
                            >
                                <Image
                                    src={image.src}
                                    alt={`Thumbnail for ${product.title}`}
                                    fill
                                    className="object-cover object-top"
                                    sizes="10rem"
                                    unoptimized
                                    quality={100}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Videos Row */}
                {videoUrls.length > 0 && (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Watch in Motion</span>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {videoUrls.map((url, idx) => (
                                <div
                                    key={url}
                                    onClick={() => setActiveVideoUrl(url)}
                                    className={cn(
                                        "relative flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 flex items-center justify-center bg-card transition-all duration-300",
                                        isYoga ? "w-36 h-24" : "w-24 h-36",
                                        activeVideoUrl === url 
                                          ? 'border-primary scale-95 opacity-100' 
                                          : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                    )}
                                >
                                    <FileVideo className="h-8 w-8 text-primary/80" />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <span className="absolute bottom-1 right-1 text-[8px] font-bold uppercase bg-black/60 text-white px-1.5 py-0.5 rounded-sm tracking-widest">
                                        Clip {videoUrls.length > 1 ? idx + 1 : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Product Info Column */}
        <div className="flex flex-col gap-6 min-w-0">
            <div className="mb-2 flex justify-between items-center">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                The Shop
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handleWishlistToggle}
              >
                <Heart className={cn("h-6 w-6 transition-colors", inWishlist ? "fill-red-500 text-red-500" : "text-foreground")} />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {getProductGenderEligibility(product.title, product.tags).isUnisex && (
                <Badge variant="secondary" className="w-fit text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 border border-border/60">
                  Unisex Fit
                </Badge>
              )}
              <h1 className="text-3xl lg:text-5xl font-bold font-headline uppercase tracking-tight leading-tight">{product.title}</h1>
            </div>
            <p className="text-3xl font-bold text-primary">{price > 0 ? `$${price.toFixed(2)}` : 'N/A'}</p>
            <Separator className="my-2" />
            
            {options.map(option => (
                <div key={option.name} className="grid gap-3">
                    <Label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{option.name}</Label>
                    <RadioGroup
                        value={selectedOptions[option.name]}
                        onValueChange={(value) => handleOptionChange(option.name, value)}
                        className="flex flex-wrap gap-3 sm:gap-3.5"
                    >
                        {option.values.map((value, idx) => (
                            <div key={`${option.name}-${value}-${idx}`}>
                                <RadioGroupItem value={value} id={`${option.name}-${value}`} className="peer sr-only" />
                                <Label
                                    htmlFor={`${option.name}-${value}`}
                                    className="px-5 py-2.5 border rounded-md cursor-pointer text-sm font-bold uppercase tracking-widest peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover:bg-accent/50 transition-all active:scale-95 inline-flex items-center justify-center text-center select-none"
                                >
                                    {value}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            ))}

            <Separator className="my-2" />

            <div className="flex flex-col gap-3 mt-4">
                <Button size="lg" className="w-full h-14 text-lg font-bold uppercase tracking-[0.2em]" onClick={handleExpressBuy} disabled={!selectedVariant}>
                    <Zap className="mr-2 h-5 w-5 fill-current" /> Buy Now
                </Button>
                <Button size="lg" variant="outline" className="w-full h-14 text-lg font-bold uppercase tracking-[0.2em]" onClick={handleAddToCart} disabled={!selectedVariant}>
                    Add to Bag
                </Button>
            </div>

            <div className="mt-8 prose dark:prose-invert max-w-none text-foreground product-description">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">The Narrative</h3>
                <div 
                    className="text-lg leading-relaxed opacity-90 overflow-x-auto no-scrollbar"
                    dangerouslySetInnerHTML={{ __html: product.description }} 
                />
            </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-24 pt-16 border-t border-border/50">
        <ProductReviews productId={product.id} />
      </section>

      {/* Suggested Pairs Section */}
      {pairedItems.length > 0 && (
        <section className="mt-24 pt-16 border-t border-border/50">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold font-headline uppercase tracking-[0.1em]">Complete the Set</h2>
              <p className="text-muted-foreground">Pair this item with matching pieces in {product.title.split(' ')[0]}.</p>
            </div>
            
            {isLoadingPairs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pairedItems.map(item => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recently Viewed Section */}
      <RecentlyViewed currentProductId={product.id} />

      {/* Mobile Sticky Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t z-50 sm:hidden flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <Button className="flex-1 h-12 font-bold uppercase tracking-widest" onClick={handleExpressBuy} disabled={!selectedVariant}>
          Buy Now
        </Button>
        <Button variant="outline" className="flex-1 h-12 font-bold uppercase tracking-widest" onClick={handleAddToCart} disabled={!selectedVariant}>
          Add to Bag
        </Button>
      </div>
    </main>
  );
}
