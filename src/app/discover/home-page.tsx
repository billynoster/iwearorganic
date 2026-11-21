'use client';

import { useState, useEffect } from 'react';

import type { PrintifyProduct } from '@/ai/flows/printify-products';
import { MediaSection } from '@/components/shopping/media-section';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { type MediaItem } from '@/components/shopping/media-section';

export default function HomePage() {
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [feedItems, setFeedItems] = useState<MediaItem[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useUser();
  const firestore = useFirestore();
  
  // Load user vibe and preferences
  const { data: userPrefsDoc } = useDoc(
    user?.uid && firestore ? doc(firestore, 'users', user.uid, 'preferences', 'current') : null
  );
  
  const [userPrefs, setUserPrefs] = useState<any>(null);

  useEffect(() => {
    const loadUserPrefs = async () => {
      if (!user?.uid || !firestore) return;
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const newPrefs: any = {};
        if (userDoc.exists()) {
          newPrefs.vibe = userDoc.data().vibe;
        }
        if (userPrefsDoc) {
          Object.assign(newPrefs, userPrefsDoc);
        }
        setUserPrefs(newPrefs);
      } catch (e) {
        console.error("Error loading prefs", e);
      }
    };
    loadUserPrefs();
  }, [user, firestore, userPrefsDoc]);

  useEffect(() => {
    const loadProductsAndFeed = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/products'); const fetchedProducts = await res.json();
        if (fetchedProducts.length === 0) { setProducts([{ id: "1", title: "Offline Mock Hoody", tags: ["hoodie", "streetwear"], variants: [{ price: 4500, id: 1, title: "M" }], images: [], description: "Mock product" } as any]); } else { setProducts(fetchedProducts); }

        if (firestore) {
          const videosRef = collection(firestore, 'videos');
          const q = query(videosRef, orderBy('createdAt', 'desc'), limit(10));
          const querySnapshot = await getDocs(q);
          const videos: MediaItem[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            videos.push({
              id: doc.id,
              videoUrl: data.videoUrl,
              title: data.title || '',
              category: data.category || '',
              color: '', // not strictly needed
              author: data.author || { name: 'Creator', avatar: 'C' },
              caption: data.caption || '',
              song: 'Original Audio',
              likes: data.likes || '0',
              comments: data.comments || '0',
              vibeTags: data.vibeTags || [],
              productIds: data.productIds || []
            });
          });
          
          if (videos.length > 0) {
            setFeedItems(videos);
          }
        }
      } catch (e: any) {
        console.error(e); setProducts([{ id: "1", title: "Offline Mock Hoody", tags: ["hoodie", "streetwear"], variants: [{ price: 4500, id: 1, title: "M" }], images: [], description: "Mock product" } as any]);
      } finally {
        setIsLoading(false);
      }
    };
    loadProductsAndFeed();
  }, [firestore]);

  if (isLoading) {
    const loadingText = !!user && !user.isAnonymous ? "Curating your feed..." : "Loading feed...";
    return (
      <main className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-4rem)] bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <p className="mt-4 font-bold text-white/50 animate-pulse">{loadingText}</p>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full bg-black h-[calc(100vh-4rem)] overflow-hidden">
      <MediaSection userPrefs={userPrefs} products={products} feedItems={feedItems} isLoggedIn={!!user && !user.isAnonymous} onMediaClick={() => {}} />
    </main>
  );
}
