'use client';

import { useState, useEffect } from 'react';
import { articles as staticArticles } from '@/lib/data';
import { NewsPageClient } from '@/components/news/news-page-client';
import { getProductsAction } from '@/app/actions/printify';
import type { Article } from '@/ai/schemas';

export default function FashionAndGearPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const products = await getProductsAction();
        
        const productArticles: Article[] = products.map(p => {
          const title = p.title.toLowerCase();
          const art: Article = {
            id: `product-${p.id}`,
            title: p.title,
            content: p.description,
            source: 'BlendAmerica Shop',
            category: 'Fashion & Gear',
            publishedAt: new Date().toISOString(), 
            imageUrl: p.images.find(img => img.is_default)?.src || p.images[0]?.src || 'https://placehold.co/600x400?text=No+Image',
            imageHint: p.title,
            productId: p.id,
            tags: p.tags
          };

          // Specific video mappings for editorial look
          if (p.id === "67b272e6cae4c640ec0ec6e7" || title.includes("vintage swimsuit with retro stripes")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fswimwear%2Fwomen%2Fretro%2Fblendamerica_retro_onepiece_07.mp4?alt=media";
          } else if (title.includes("stars & stripes bikini")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fswimwear%2Fwomen%2Fusa%2Fblend%20america%20usa%20flag%2002.mp4?alt=media";
          } else if (title.includes("signature seam racerback dress – emerald")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Femerald%2Fblend%20america%20emerald%2002%20video.mp4?alt=media";
          } else if (title.includes("signature seam racerback dress – midnight navy")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fmidnight%20navy%2Fblend%20america%20midnight%20navy%2001.mp4?alt=media";
          } else if (title.includes("signature seam racerback dress – sage")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fsage%20color%2Fblend%20america%20sage%20video%2001.mp4?alt=media";
          } else if (title.includes("signature seam racerback dress – olive stone")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsage%2Fblend%20america%20sage%2001%20video.mp4?alt=media";
          } else if (title.includes("signature seam racerback dress – crimson red")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2FRED%2Fblendamerica_red_racerback_03.mp4?alt=media";
          } else if (p.id === "6896c3dd10430a23e7107a61" || title.includes("signature seam racerback dress – antique white")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fantique%2Fblend%20america%20antique%2012%20video%20.mp4?alt=media";
          } else if (title.includes("signature seam racerback dress – slate blue")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fslate%20blue%2Fblend%20america%20slate%20blue%2006.mp4?alt=media";
          } else if (title.includes("signature seam racerback dress – sand stone")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fsand%20stone%2Fblend%20america%20sand%20stone%2001%20video.mp4?alt=media";
          } else if (title.includes("signature seam racerback dress – terracotta")) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fblend%20america%20terracotta%20video%2001.mp4?alt=media";
          } else if (title.includes("burgundy") && (title.includes("yoga") || title.includes("sports bra"))) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Fblend%20yoga%20burgundy%20video%2001.mp4?alt=media";
          } else if (title.includes("oxblood") && (title.includes("yoga") || title.includes("sports bra"))) {
            art.videoUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2001.mp4?alt=media";
          }

          return art;
        });

        const fashionStatic = staticArticles.filter(a => a.category === 'Fashion & Gear');
        setArticles([...fashionStatic, ...productArticles]);
      } catch (error) {
        console.error("Failed to load fashion data:", error);
        setArticles(staticArticles.filter(a => a.category === 'Fashion & Gear'));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <NewsPageClient 
        articles={articles} 
        hideHero={false}
        title="Fashion & Gear"
        description="Style defined by heritage and function, not by trends."
        initialType="Dresses"
      />
    </div>
  );
}
