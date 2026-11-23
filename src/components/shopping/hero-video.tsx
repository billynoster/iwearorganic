'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroVideoItem {
  id: string;
  title: string;
  caption?: string;
  url: string;
}

// 3 Curated Hero Videos from Firebase Storage
export const DEFAULT_HERO_VIDEOS: HeroVideoItem[] = [
  {
    id: 'hero-mens-hoodie',
    title: 'Mens Hoodie',
    caption: 'Mens Collection',
    url: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2Fhero%2Fblend%20america%20hero%20video%2002.mp4?alt=media&token=decbc7ad-7e38-46f5-9d49-88443d6a5f34',
  },
  {
    id: 'hero-racerback',
    title: 'Racerback Dress',
    caption: 'Racerback Collection',
    url: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2Fhero%2Fblend%20america%20hero%20video%2003.mp4?alt=media&token=b0fff191-5fba-4a0e-a3e1-05c57008a4a7',
  },
  {
    id: 'hero-pencil-skirt',
    title: 'Pencil Skirt',
    caption: 'Skirt Collection',
    url: 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/video%2Fhero%2Fblend%20america%20hero%20video%2005.mp4?alt=media&token=72f81eb7-19a3-46bb-9c90-d02abf3c7237',
  },
];

interface HeroVideoProps {
  videos?: HeroVideoItem[];
}

export function HeroVideo({ videos = DEFAULT_HERO_VIDEOS }: HeroVideoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setProgress(0);
  }, [videos.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setProgress(0);
  }, [videos.length]);

  const selectIndex = (idx: number) => {
    if (idx !== currentIndex) {
      setCurrentIndex(idx);
      setProgress(0);
    }
  };

  // Sync playback on index changes (do not reset currentTime on mute toggle)
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      video.muted = isMuted;

      if (idx === currentIndex) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay policies handled silently
          });
        }
      } else {
        video.pause();
      }
    });
    setProgress(0);
  }, [currentIndex]);

  // Track active video progress for story bar
  const handleTimeUpdate = (idx: number) => {
    if (idx !== currentIndex) return;
    const video = videoRefs.current[idx];
    if (video && video.duration) {
      const pct = (video.currentTime / video.duration) * 100;
      setProgress(pct);
    }
  };

  // When active video finishes, advance seamlessly to next
  const handleEnded = (idx: number) => {
    if (idx === currentIndex) {
      handleNext();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        video.muted = nextMuted;
        if (!nextMuted) {
          video.volume = 1.0;
          if (idx === currentIndex && video.paused) {
            video.play().catch(() => {});
          }
        }
      }
    });
  };

  return (
    <div className="relative h-full w-full bg-black group select-none overflow-hidden">
      {/* Pre-mounted video elements for instantaneous, zero-black-flash crossfades */}
      {videos.map((vid, idx) => {
        const isActive = idx === currentIndex;
        return (
          <video
            key={vid.id}
            ref={(el) => {
              videoRefs.current[idx] = el;
            }}
            src={vid.url}
            muted={isMuted}
            playsInline
            preload="auto"
            onTimeUpdate={() => handleTimeUpdate(idx)}
            onEnded={() => handleEnded(idx)}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          />
        );
      })}

      {/* Top Story Reels Progress Bars (Clean Instagram / Editorial style) */}
      <div className="absolute top-4 left-6 right-6 z-20 flex gap-2 sm:gap-3 max-w-md">
        {videos.map((vid, idx) => {
          const isCurrent = idx === currentIndex;
          const isPassed = idx < currentIndex;
          const fillWidth = isPassed ? '100%' : isCurrent ? `${progress}%` : '0%';

          return (
            <button
              key={vid.id}
              type="button"
              id={`hero-progress-pill-${idx}`}
              onClick={() => selectIndex(idx)}
              className="flex-1 py-2 -my-2 cursor-pointer group/pill text-left transition-opacity hover:opacity-100"
              aria-label={`Switch to video ${idx + 1}: ${vid.title}`}
            >
              <div className="h-1 bg-white/25 group-hover/pill:bg-white/40 rounded-full overflow-hidden backdrop-blur-sm transition-colors">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                  style={{ width: fillWidth }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Editorial Video Mood Switcher Pills (Top right for clean visual balance) */}
      <div className="absolute top-4 right-6 z-20 hidden sm:flex items-center gap-1.5">
        {videos.map((vid, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={vid.id}
              type="button"
              id={`hero-pill-${idx}`}
              onClick={() => selectIndex(idx)}
              className={`px-3 py-1 text-[11px] font-medium tracking-wider uppercase rounded-full transition-all duration-300 backdrop-blur-md ${
                isCurrent
                  ? 'bg-white text-black shadow-md'
                  : 'bg-black/40 text-white/75 hover:bg-black/60 hover:text-white border border-white/10'
              }`}
            >
              <span className="opacity-50 mr-1 text-[9px]">0{idx + 1}</span>
              {vid.title}
            </button>
          );
        })}
      </div>

      {/* Left/Right Navigation Arrows (Subtle desktop hover) */}
      <button
        type="button"
        id="hero-video-prev-btn"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous video"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        id="hero-video-next-btn"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
        aria-label="Next video"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Audio Mute/Unmute Toggle */}
      <div className="absolute bottom-6 right-6 z-40">
        <button
          type="button"
          id="hero-video-mute-toggle"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="h-11 w-11 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/25 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-emerald-400" />}
        </button>
      </div>
    </div>
  );
}

