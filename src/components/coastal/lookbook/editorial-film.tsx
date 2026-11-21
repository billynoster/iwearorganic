'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import type { EditorialFilm as EditorialFilmData } from '@/content/lookbook-edits';
import { cn } from '@/lib/utils';

interface EditorialFilmProps {
  film: EditorialFilmData;
  className?: string;
}

/**
 * Campaign film block — poster always; playback only when videoUrl exists.
 * No fake player chrome when film is unavailable. Respects reduced motion.
 */
export function EditorialFilm({ film, className }: EditorialFilmProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const labelId = useId();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const hasVideo = Boolean(film.videoUrl) && !failed;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const togglePlay = () => {
    if (!hasVideo || !videoRef.current) return;
    const video = videoRef.current;
    if (video.paused) {
      void video
        .play()
        .then(() => setPlaying(true))
        .catch(() => setFailed(true));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  const replay = () => {
    if (!hasVideo || !videoRef.current) return;
    const video = videoRef.current;
    video.currentTime = 0;
    void video
      .play()
      .then(() => setPlaying(true))
      .catch(() => setFailed(true));
  };

  return (
    <section
      aria-labelledby={labelId}
      className={cn('border-t border-oat/70 bg-linen', className)}
    >
      <div className="ca-container py-14 sm:py-16 md:py-20">
        <div className="mb-6 max-w-2xl md:mb-8">
          <p className="ca-eyebrow mb-3">Film</p>
          <h2
            id={labelId}
            className="ca-display text-h2"
          >
            {film.title}
          </h2>
          {film.caption ? (
            <p className="ca-editorial mt-3 text-lg text-mineral-ink/65">
              {film.caption}
            </p>
          ) : null}
        </div>

        <figure className="relative overflow-hidden bg-oat">
          <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[16/9]">
            <Image
              src={film.posterImage}
              alt=""
              fill
              sizes="100vw"
              className={cn(
                'object-cover object-[center_12%]',
                playing && hasVideo ? 'opacity-0' : 'opacity-100'
              )}
              aria-hidden={playing && hasVideo}
            />

            {film.videoUrl ? (
              <video
                ref={videoRef}
                className={cn(
                  'absolute inset-0 h-full w-full object-cover',
                  playing ? 'z-[1]' : 'invisible'
                )}
                src={film.videoUrl}
                poster={film.posterImage}
                playsInline
                muted={muted}
                preload="none"
                onEnded={() => setPlaying(false)}
                onError={() => {
                  setFailed(true);
                  setPlaying(false);
                }}
              >
                <track kind="captions" />
              </video>
            ) : null}
          </div>

          <figcaption className="sr-only">
            {film.caption || film.title}
            {!hasVideo ? ' — film still; video coming soon.' : ''}
          </figcaption>

          {hasVideo && !reduceMotion ? (
            <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 sm:bottom-6 sm:left-6">
              <button
                type="button"
                onClick={togglePlay}
                className="ca-btn-secondary min-h-11"
                aria-pressed={playing}
              >
                {playing ? 'Pause' : 'Play'}
                <span className="sr-only"> the film</span>
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="inline-flex min-h-11 items-center border border-linen/40 bg-mineral-ink/55 px-4 font-body text-sm font-medium text-linen backdrop-blur-sm transition-colors hover:bg-mineral-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                aria-pressed={!muted}
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <button
                type="button"
                onClick={replay}
                className="inline-flex min-h-11 items-center border border-linen/40 bg-mineral-ink/55 px-4 font-body text-sm font-medium text-linen backdrop-blur-sm transition-colors hover:bg-mineral-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              >
                Replay
              </button>
            </div>
          ) : null}

          {hasVideo && reduceMotion ? (
            <p className="absolute bottom-4 left-4 z-10 max-w-xs bg-mineral-ink/70 px-3 py-2 font-body text-xs text-linen backdrop-blur-sm sm:bottom-6 sm:left-6">
              Film available — playback paused for reduced motion. Use Play when ready.
              <button
                type="button"
                onClick={togglePlay}
                className="ml-2 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              >
                {playing ? 'Pause' : 'Play'}
              </button>
            </p>
          ) : null}
        </figure>

        {!hasVideo ? (
          <p className="ca-meta mt-4">
            Campaign still — film playback will appear here when the edit ships with video.
          </p>
        ) : null}
      </div>
    </section>
  );
}
