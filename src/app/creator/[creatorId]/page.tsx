'use client';

import { useState, useEffect, use } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LinkIcon, Instagram, Youtube, Settings, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function CreatorProfilePage({ params }: { params: any }) {
  const resolvedParams = use(params) as any;
  const creatorId = resolvedParams.creatorId;

  const { user } = useUser();
  const firestore = useFirestore();
  const [creator, setCreator] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isOwner = user?.uid === creatorId;

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const creatorRef = doc(firestore, 'creators', creatorId);
        const creatorSnap = await getDoc(creatorRef);
        
        if (creatorSnap.exists()) {
          setCreator(creatorSnap.data());
        }

        const q = query(
          collection(firestore, 'videos'), 
          where('authorId', '==', creatorId),
          orderBy('createdAt', 'desc')
        );
        const videoSnaps = await getDocs(q);
        const vids = videoSnaps.docs.map(d => ({ id: d.id, ...d.data() }));
        setVideos(vids);
      } catch (err) {
        console.error("Failed to load creator", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCreatorData();
  }, [firestore, creatorId]);

  if (isLoading) {
    return (
      <div className="w-full mx-auto max-w-5xl py-12 px-4 sm:px-6 space-y-8">
        <div className="flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <Skeleton className="aspect-[3/4]" />
          <Skeleton className="aspect-[3/4]" />
          <Skeleton className="aspect-[3/4]" />
        </div>
      </div>
    );
  }

  if (!creator && !isOwner) {
    return <div className="text-center py-20 font-bold">Creator not found.</div>;
  }

  return (
    <div className="w-full mx-auto max-w-4xl py-12 px-4 sm:px-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl md:text-5xl font-black border-4 border-background shadow-xl">
          {creator?.avatar || 'BA'}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-headline">{creator?.name || 'Anonymous Creator'}</h1>
          <p className="text-muted-foreground font-medium">{creator?.handle || '@creator'}</p>
          
          <div className="flex gap-6 mt-4">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{videos.length}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Posts</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">{creator?.followers || 0}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">{creator?.following || 0}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Following</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            {!isOwner ? (
              <Button className="font-bold px-8">Follow</Button>
            ) : (
              <Button variant="outline" className="font-bold gap-2">
                <Settings className="w-4 h-4" /> Edit Profile
              </Button>
            )}
            
            {creator?.socials?.instagram && (
              <Button variant="outline" size="icon">
                <Instagram className="w-4 h-4" />
              </Button>
            )}
            {creator?.socials?.tiktok && (
              <Button variant="outline" size="icon">
                <Youtube className="w-4 h-4" /> {/* Fallback icon */}
              </Button>
            )}
            {isOwner && (
              <Button variant="ghost" className="text-muted-foreground gap-2">
                <LinkIcon className="w-4 h-4" /> Link Socials
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Videos Grid */}
      <div className="border-t pt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Gallery</h2>
        
        {videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {videos.map(video => (
              <div key={video.id} className="aspect-[9/16] relative group rounded-xl overflow-hidden bg-black cursor-pointer">
                <video src={video.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Play className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div className="absolute bottom-2 left-2 text-white text-xs font-bold drop-shadow-md">
                   {video.views || 0} views
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed">
             <h3 className="font-bold text-lg mb-2">No videos yet</h3>
             <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
               Share your first look and tag I Wear Organic products to get featured.
             </p>
             {isOwner && (
               <Button asChild>
                 <Link href="/creator/upload">Upload Video</Link>
               </Button>
             )}
           </div>
        )}
      </div>
    </div>
  );
}
