'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Play, Pause, VolumeX, Volume2, Share2, ShoppingBag, MessageCircle, Music, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { PrintifyProduct } from '@/ai/flows/printify-products';
import { useCart } from '@/context/cart-context';
import { calculateVibeMatch, PersonalizedPreferences } from '@/lib/vibe-utils';
import { useToast } from '@/hooks/use-toast';

export interface MediaItem {
  id: string;
  image?: any;
  videoUrl?: string;
  title: string;
  category: string;
  color: string;
  author: {
    name: string;
    avatar: string;
  };
  caption: string;
  song: string;
  likes: string;
  comments: string;
  vibeTags: string[]; // Added for AI recommendation matching
  productIds?: string[]; // Added for explicit product tagging
}

const BASE_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'media-1',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FMen%2Fblend%20america%20branded%20hoody%20video%2014.mp4?alt=media&token=0346654a-e72f-43a5-83e9-77e89db6907d',
    title: 'Men',
    category: 'Hoodies',
    color: 'White',
    author: { name: '@iwearorganic', avatar: 'BA' },
    caption: 'Fresh off the court. New arrivals for men. #basketball #streetwear',
    song: 'Original Audio - I Wear Organic',
    likes: '12.4K',
    comments: '128',
    vibeTags: ['streetwear', 'basketball', 'urban', 'casual', 'hoodie']
  },
  {
    id: 'media-2',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FMen%2Fblend%20america%20branded%20hoody%20video%2009.mp4?alt=media&token=13e8b864-2b9b-4fe2-9f02-e8c76cf34f39',
    title: 'Women',
    category: 'Hoodies',
    color: 'Royal',
    author: { name: '@iwearorganic', avatar: 'BA' },
    caption: 'Royal blue vibes. Elevate your everyday style. #womensfashion #active',
    song: 'Summer Vibes - Unknown',
    likes: '8.9K',
    comments: '94',
    vibeTags: ['activewear', 'casual', 'women', 'gym', 'everyday']
  },
  {
    id: 'media-7',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fracerback%2Fterracotta%2Fterracotta%20solid%2Fblend%20america%20racerback%20dress%20terracotta%2002.mp4?alt=media&token=50ed3ff2-05c9-4f4f-aa00-fc30f2e6b26c',
    title: 'Terracotta Dress',
    category: 'Dresses',
    color: 'Terracotta',
    author: { name: '@iwearorganic', avatar: 'BA' },
    caption: 'Earthy tones. The terracotta racerback dress. #dresses #summer',
    song: 'Desert Wind - Unknown',
    likes: '18.3K',
    comments: '320',
    vibeTags: ['dress', 'terracotta', 'summer', 'casual', 'earthy']
  },
  {
    id: 'media-6',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FRed%2Fblend%20america%20red%20skirt%20video%2005.mp4?alt=media&token=ab26a51c-ac16-4260-b7e9-4d906fa81348',
    title: 'Solid Terracotta Color Pencil Skirt',
    category: 'Skirts',
    color: 'Terracotta',
    author: { name: '@iwearorganic', avatar: 'BA' },
    caption: 'Earthy terracotta. The perfect pencil skirt for any occasion. #fashion #style',
    song: 'Desert Wind - Unknown',
    likes: '10.5K',
    comments: '150',
    vibeTags: ['fashion', 'skirt', 'terracotta', 'chic', 'style']
  },
  {
    id: 'media-8',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2FSkirts%2FRed%2Fblend%20america%20red%20skirt%20video%2005.mp4?alt=media&token=ab26a51c-ac16-4260-b7e9-4d906fa81348',
    title: 'Solid Red Pencil Skirt',
    category: 'Skirts',
    color: 'Red',
    author: { name: '@iwearorganic', avatar: 'BA' },
    caption: 'Bold in red. A classic staple. Our versatile skirt collection. #fashion #skirts',
    song: 'Night Groove - Unknown',
    likes: '11.2K',
    comments: '180',
    vibeTags: ['fashion', 'skirt', 'red', 'classic', 'style']
  },
  {
    id: 'media-5',
    videoUrl: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2FWomen%2Fswimwear%2Fwomen%2Fusa%2Fblend%20america%20usa%20flag%2004.mp4?alt=media',
    title: 'Chic Polka Dot Racerback Dress for Women - Perfect for Summer Outings and Casual Gatherings',
    category: 'Dresses',
    color: 'Polka Dot',
    author: { name: '@iwearorganic', avatar: 'BA' },
    caption: 'Chic Polka Dot Racerback Dress. Summer ready! ☀️ #summer #dress',
    song: 'Summer Breeze - Unknown',
    likes: '15.2K',
    comments: '210',
    vibeTags: ['summer', 'dress', 'casual', 'chic', 'polka dot']
  }
];

interface MediaSectionProps {
  onMediaClick: (category: string) => void;
  userPrefs?: PersonalizedPreferences | null;
  products?: PrintifyProduct[];
  feedItems?: MediaItem[];
  isLoggedIn?: boolean;
}

function MediaCard({ 
  item, 
  onMediaClick,
  relatedProducts,
  isActive,
  isLoggedIn
}: { 
  item: MediaItem; 
  onMediaClick: (category: string) => void;
  relatedProducts: PrintifyProduct[];
  isActive: boolean;
  isLoggedIn: boolean;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleCardInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const prog = (video.currentTime / (video.duration || 1)) * 100;
      setProgress(prog);
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Play only if active in the vertical scroll
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  return (
    <div 
      ref={cardRef}
      className="relative overflow-hidden w-full h-[calc(100vh-4rem)] snap-start snap-always flex-shrink-0"
      onClick={handleCardInteraction}
    >
      {/* Background Media */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-black">
        {item.videoUrl ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover opacity-90"
          />
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : null}
      </div>
      
      {/* Play/Pause Overlay Cue */}
      <div className={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${!isPlaying ? 'opacity-100 bg-black/20' : 'opacity-0'}`}>
         {!isPlaying && (
            <div className="p-5 rounded-full bg-black/40 backdrop-blur-md">
              <Play className="h-14 w-14 text-white fill-white ml-2" />
            </div>
         )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none z-0" />

      {/* Top Left - Audio Mute Icon */}
      {item.videoUrl && (
        <div className="absolute top-6 left-4 z-20">
          <button 
            className="p-2.5 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 transition-colors"
            onClick={handleMuteToggle}
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
          </button>
        </div>
      )}

      {/* Right Side Interaction Stack */}
      <div className="absolute bottom-28 right-4 z-30 flex flex-col items-center gap-5">
        <button className="flex flex-col items-center gap-1 group/btn" onClick={(e) => { 
          e.stopPropagation(); 
          if (!isLoggedIn) {
            toast({ title: "Sign in required", description: "Please sign in to like videos." });
            return;
          }
          setIsLiked(!isLiked); 
        }}>
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md active:scale-90 transition-transform">
            <Heart className={`h-7 w-7 transition-colors ${isLiked ? 'text-primary fill-primary' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-md">
            {isLiked ? (parseFloat(item.likes) + 0.1).toFixed(1) + 'K' : item.likes}
          </span>
        </button>
        
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 group/btn" onClick={(e) => e.stopPropagation()}>
              <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md active:scale-90 transition-transform">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow-md">{item.comments}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl bg-background border-0">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="text-center font-medium">Comments</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
              <MessageCircle className="h-10 w-10 mb-4 opacity-50" />
              {isLoggedIn ? (
                <p>Comments are coming soon!</p>
              ) : (
                <>
                  <p>Sign in to view and add comments.</p>
                  <Button asChild className="mt-4" variant="default">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <button className="flex flex-col items-center gap-1 group/btn" onClick={(e) => e.stopPropagation()}>
          <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md active:scale-90 transition-transform">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-medium drop-shadow-md">Share</span>
        </button>

        {/* Dynamic Shop The Look */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 animate-in zoom-in duration-500" onClick={(e) => e.stopPropagation()}>
              <div className="p-3 rounded-full bg-primary active:scale-90 transition-transform shadow-lg border-2 border-white/20">
                <ShoppingBag className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-white text-[10px] font-medium uppercase tracking-wider drop-shadow-md mt-1">Shop</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl bg-background border-0 p-0 flex flex-col z-[100]">
            <SheetHeader className="p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <SheetTitle className="text-center font-medium">Products in this video</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {relatedProducts.length > 0 ? relatedProducts.map(product => (
                <div key={product.id} className="flex gap-4 p-3 rounded-xl border bg-card shadow-sm">
                  <div className="h-24 w-24 relative rounded-md overflow-hidden bg-muted shrink-0">
                    <Image src={product.images[0]?.src || "https://placehold.co/400"} alt={product.title} fill className="object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col flex-1 justify-center">
                    <h4 className="font-medium text-sm line-clamp-2">{product.title}</h4>
                    {(() => {
                      const activeVariant = product.variants.find(v => v.is_enabled !== false && v.is_available !== false) || product.variants[0];
                      return (
                        <>
                          <p className="font-medium text-muted-foreground mt-1">${((activeVariant?.price || 0) / 100).toFixed(2)}</p>
                          <div className="mt-3 flex gap-2">
                             <Button size="sm" className="w-full text-xs font-medium" onClick={(e) => { e.stopPropagation(); if (activeVariant) addToCart(product, activeVariant, 1); }}>Add to Bag</Button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground">
                  No matching products found.
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom Profile and Caption Area */}
      <div className="absolute bottom-6 left-4 right-24 z-20 flex flex-col gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm border border-white/50 shadow-lg">
             {item.author.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm drop-shadow-md leading-tight">
              {item.author.name}
            </span>
            <button 
              className={`text-[10px] font-medium w-fit px-2 py-0.5 rounded-sm mt-0.5 transition-colors shadow-sm ${isFollowing ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-primary text-primary-foreground'}`}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!isLoggedIn) {
                  toast({ title: "Sign in required", description: "Please sign in to follow creators." });
                  return;
                }
                setIsFollowing(!isFollowing); 
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
        
        <div className="text-white/95 text-sm font-medium drop-shadow-md leading-snug">
          {item.caption.split(' ').map((word, i) => (
             word.startsWith('#') ? <span key={i} className="font-medium text-white cursor-pointer hover:underline">{word} </span> : word + ' '
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-white/90 text-xs w-fit max-w-[80%] overflow-hidden bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <Music className="h-3.5 w-3.5 shrink-0" />
          <div className="animate-marquee whitespace-nowrap overflow-hidden">
            <span className="drop-shadow-sm font-medium">{item.song}</span>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {item.videoUrl && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div className="h-full bg-white transition-all duration-300 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export function MediaSection({ onMediaClick, userPrefs, products = [], feedItems, isLoggedIn = false }: MediaSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI-Curation: Sort videos based on user vibe match
  const curatedFeed = useMemo(() => {
    let sorted = feedItems ? [...feedItems, ...BASE_MEDIA_ITEMS] : [...BASE_MEDIA_ITEMS];

    // Allow all items
    sorted = sorted.filter(item => true);

    if (userPrefs && (userPrefs.vibe || userPrefs.fit || userPrefs.goal)) {
      sorted = sorted.sort((a, b) => {
        const scoreA = calculateVibeMatch(userPrefs, a.vibeTags, a.title);
        const scoreB = calculateVibeMatch(userPrefs, b.vibeTags, b.title);
        return scoreB - scoreA;
      });
    }

    // Limit feed for unregistered users to 5 videos
    if (!isLoggedIn) {
      return sorted.slice(0, 5);
    }

    return sorted;
  }, [feedItems, userPrefs, isLoggedIn]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    // Calculate which card is currently taking up most of the view
    const scrollPosition = containerRef.current.scrollTop;
    const cardHeight = containerRef.current.clientHeight;
    // Add half a card height to snap when scrolling past 50%
    const index = Math.round(scrollPosition / cardHeight);
    if (index !== activeIndex && index >= 0 && index < curatedFeed.length) {
      setActiveIndex(index);
    }
  }, [activeIndex, curatedFeed.length]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative bg-black sm:bg-transparent flex justify-center">
      
      {/* Top Navigation */}
      <div className="absolute top-6 left-0 right-0 z-50 flex justify-center items-center gap-4 pointer-events-none drop-shadow-md">
         <button className="text-base font-medium text-white/60 transition-colors pointer-events-auto hover:text-white drop-shadow-md">Following</button>
         <div className="h-4 w-px bg-white/40"></div>
         <div className="relative pointer-events-auto">
            <button className="text-base font-medium text-white pb-1 flex items-center gap-1.5">
              For You <SparklesIcon className="w-3.5 h-3.5 text-primary" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
         </div>
      </div>

      {/* The Feed Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-[calc(100vh-4rem)] md:max-w-[480px] overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
      >
        {curatedFeed.map((item, index) => {
          // Dynamic Product Matching: Find products matching explicitly tagged products, or fallback to the media item's category/vibe
          const relatedProducts = products
            .filter(p => {
               if (item.productIds && item.productIds.length > 0) {
                 return item.productIds.includes(p.id);
               }
               return (p.title === item.title) || (p.tags || []).some(tag => (item.vibeTags || []).includes(tag.toLowerCase())) || (p.title || "").toLowerCase().includes(item.category.toLowerCase());
            })
            .slice(0, 3); // Max 3 products for the shoppable drawer

          return (
            <MediaCard 
              key={item.id} 
              item={item} 
              onMediaClick={onMediaClick} 
              relatedProducts={relatedProducts}
              isActive={index === activeIndex}
              isLoggedIn={isLoggedIn}
            />
          );
        })}
        
        {!isLoggedIn && (
          <div className="w-full h-full relative snap-always snap-center flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center shrink-0">
             <div className="p-4 rounded-full bg-primary/20 mb-6">
                <Heart className="h-10 w-10 text-primary" />
             </div>
             <h2 className="text-3xl font-medium mb-4 font-headline tracking-tight">Keep Discovering</h2>
             <p className="text-zinc-400 mb-8 max-w-[280px] leading-relaxed text-sm">Sign in to unlock personalized feeds, shop your favorite looks, and join the community.</p>
             <Button asChild size="lg" className="w-full max-w-[240px] font-medium"><Link href="/login">Sign In</Link></Button>
             <Button asChild variant="ghost" size="lg" className="mt-4 text-xs tracking-wide text-zinc-400 hover:text-white"><Link href="/">Browse Collections</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SparklesIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
