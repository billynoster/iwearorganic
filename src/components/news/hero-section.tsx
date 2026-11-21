'use client';

import type { Article } from '@/ai/schemas';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function HeroSection({
  article,
  onReadMore,
}: {
  article: Article;
  onReadMore: () => void;
}) {
  const [timeAgo, setTimeAgo] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // This runs only on the client, after hydration, preventing mismatch
    if (article.publishedAt) {
      setTimeAgo(
        formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
      );
    }
  }, [article.publishedAt]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative w-full h-[80vh] sm:h-[90vh] rounded-lg overflow-hidden shadow-2xl">
      {article.videoUrl ? (
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={article.videoUrl} type="video/mp4" />
          </video>
          <div className="absolute bottom-4 right-4 z-30">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="bg-black/20 hover:bg-black/40 border-white/20 text-white backdrop-blur-sm pointer-events-auto"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover object-top"
          data-ai-hint={article.imageHint}
          priority
        />
      )}
      
      {/* Gradient and text overlays - pointer-events-none ensures button clicks pass through */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white flex flex-col justify-end h-full pointer-events-none z-20">
        <Badge variant="secondary" className="mb-4 w-fit pointer-events-auto">
          {article.category}
        </Badge>
        <h1 className="text-4xl lg:text-6xl font-headline font-bold mb-4 pointer-events-auto">
          {article.title}
        </h1>
        <div className="flex items-center gap-4 text-sm mb-6 pointer-events-auto">
          <span>{article.source}</span>
          {article.id !== 'brand-hero-fixed' && (
            <>
              <span>&bull;</span>
              <span>{timeAgo}</span>
            </>
          )}
        </div>
        <div className="max-w-xs pointer-events-auto">
          <Button size="lg" onClick={onReadMore}>
            Explore Collection
          </Button>
        </div>
      </div>
    </div>
  );
}
