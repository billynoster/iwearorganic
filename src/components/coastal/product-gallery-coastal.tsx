'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { ProductImage, ProductVideo } from '@/services/types';
import { cn } from '@/lib/utils';

export type GalleryItem =
  | { kind: 'image'; key: string; image: ProductImage; index: number }
  | { kind: 'video'; key: string; video: ProductVideo; index: number };

interface ProductGalleryCoastalProps {
  title: string;
  images: ProductImage[];
  videos?: ProductVideo[];
  usingFixtures?: boolean;
  /** Prefer images matching these variant ids when color changes. */
  preferredVariantIds?: string[];
}

const GALLERY_TONES = [
  'linear-gradient(150deg,#e8e2d8,#d5cec4_55%,#c8bdb4)',
  'linear-gradient(200deg,#d5cec4,#c8bdb4_50%,#b7c4c8)',
  'linear-gradient(165deg,#c8bdb4,#b7c4c8_60%,#ddd4c9)',
];

function isRenderableSrc(src?: string) {
  return Boolean(src && (src.startsWith('http') || src.startsWith('data:')));
}

function buildItems(images: ProductImage[], videos: ProductVideo[] = []): GalleryItem[] {
  const imageItems: GalleryItem[] = (images.length > 0 ? images : [{ src: '', alt: '', isPlaceholder: true }]).map(
    (image, index) => ({
      kind: 'image' as const,
      key: `img-${index}-${image.src.slice(0, 24)}`,
      image,
      index,
    })
  );
  const videoItems: GalleryItem[] = videos.map((video, index) => ({
    kind: 'video' as const,
    key: `vid-${index}-${video.src.slice(0, 24)}`,
    video,
    index,
  }));
  return [...imageItems, ...videoItems];
}

export function ProductGalleryCoastal({
  title,
  images,
  videos,
  usingFixtures,
  preferredVariantIds,
}: ProductGalleryCoastalProps) {
  const labelId = useId();
  const videoList = videos ?? [];
  const items = buildItems(images, videoList);

  const initialIndex = (() => {
    if (!preferredVariantIds?.length) return 0;
    const match = items.findIndex(
      (item) =>
        item.kind === 'image' &&
        item.image.variantIds?.some((id) => preferredVariantIds.includes(id))
    );
    return match >= 0 ? match : 0;
  })();

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    skipSnaps: false,
  });

  // Sync active slide when preferred color/variant images change.
  useEffect(() => {
    if (!preferredVariantIds?.length) return;
    const match = items.findIndex(
      (item) =>
        item.kind === 'image' &&
        item.image.variantIds?.some((id) => preferredVariantIds.includes(id))
    );
    if (match >= 0) {
      setSelectedIndex(match);
      emblaApi?.scrollTo(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- items identity changes with images
  }, [preferredVariantIds?.join('|'), emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const selectIndex = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const goRelative = useCallback(
    (delta: number) => {
      const next = (selectedIndex + delta + items.length) % items.length;
      selectIndex(next);
    },
    [items.length, selectIndex, selectedIndex]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    lightboxCloseRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goRelative(1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goRelative(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, goRelative]);

  const active = items[selectedIndex] ?? items[0];

  return (
    <div className="min-w-0 space-y-4" aria-labelledby={labelId}>
      <p id={labelId} className="sr-only">
        Product media gallery for {title}
      </p>

      {/* Main stage — swipeable on touch; min-w-0 keeps Embla inside the grid track */}
      <div className="relative min-w-0">
        <div className="min-w-0 overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {items.map((item, index) => (
              <div key={item.key} className="min-w-0 shrink-0 grow-0 basis-full">
                <figure className="relative aspect-[3/4] overflow-hidden bg-[#ebe6df]">
                  {item.kind === 'image' ? (
                    isRenderableSrc(item.image.src) && !item.image.isPlaceholder ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image.src}
                        alt={item.image.alt || `${title} view ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : isRenderableSrc(item.image.src) && item.image.src.startsWith('data:') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image.src}
                        alt={item.image.alt || `${title} view ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: GALLERY_TONES[index % GALLERY_TONES.length] }}
                        aria-hidden="true"
                      />
                    )
                  ) : (
                    <video
                      key={item.video.src}
                      controls
                      playsInline
                      muted
                      loop
                      poster={item.video.poster}
                      className="h-full w-full object-cover"
                      aria-label={item.video.title || `${title} video ${index + 1}`}
                    >
                      <source src={item.video.src} type="video/mp4" />
                    </video>
                  )}

                  {(usingFixtures || (item.kind === 'image' && item.image.isPlaceholder)) && (
                    <figcaption className="ca-caption absolute bottom-3 left-3">
                      Placeholder — not production inventory
                      {items.length > 1 ? ` · ${index + 1}/${items.length}` : ''}
                    </figcaption>
                  )}
                </figure>
              </div>
            ))}
          </div>
        </div>

        {active?.kind === 'image' ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute bottom-3 right-3 min-h-11 rounded-full border border-oat bg-linen/95 px-4 font-body text-xs font-medium tracking-wide text-mineral-ink transition-colors hover:bg-oat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
          >
            Zoom
          </button>
        ) : null}

        {items.length > 1 ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 sm:flex">
            <button
              type="button"
              onClick={() => goRelative(-1)}
              disabled={selectedIndex === 0}
              className="pointer-events-auto min-h-11 min-w-11 rounded-full border border-oat bg-linen/95 font-body text-mineral-ink transition-opacity disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              aria-label="Previous media"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goRelative(1)}
              disabled={selectedIndex === items.length - 1}
              className="pointer-events-auto min-h-11 min-w-11 rounded-full border border-oat bg-linen/95 font-body text-mineral-ink transition-opacity disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              aria-label="Next media"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      {/* Thumbnails */}
      {items.length > 1 ? (
        <ul
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Gallery thumbnails"
        >
          {items.map((item, index) => {
            const selected = index === selectedIndex;
            return (
              <li key={`thumb-${item.key}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => selectIndex(index)}
                  aria-label={
                    item.kind === 'video'
                      ? `Play video ${item.index + 1}`
                      : `Show image ${item.index + 1}`
                  }
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    'relative block h-20 w-16 overflow-hidden border bg-[#ebe6df] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
                    selected ? 'border-mineral-ink' : 'border-transparent hover:border-oat'
                  )}
                >
                  {item.kind === 'image' && isRenderableSrc(item.image.src) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image.src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : item.kind === 'video' ? (
                    <span className="flex h-full w-full items-center justify-center bg-mineral-ink/90 font-body text-[0.65rem] uppercase tracking-[0.14em] text-linen">
                      Film
                    </span>
                  ) : (
                    <span
                      className="absolute inset-0"
                      style={{ background: GALLERY_TONES[index % GALLERY_TONES.length] }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {/* Graceful empty state when catalog provides an explicit empty videos list */}
      {videos !== undefined && videos.length === 0 ? (
        <p className="font-body text-xs text-mineral-ink/50" role="status">
          No product video for this piece yet.
        </p>
      ) : null}

      {lightboxOpen && active?.kind === 'image' ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} zoomed image`}
          className="fixed inset-0 z-[80] flex flex-col bg-mineral-ink/92"
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="font-body text-sm text-linen/80">
              {selectedIndex + 1} / {items.filter((i) => i.kind === 'image').length}
            </p>
            <button
              ref={lightboxCloseRef}
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="min-h-11 rounded-full border border-linen/30 px-4 font-body text-sm text-linen focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            >
              Close
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => goRelative(-1)}
                  className="absolute left-3 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-full border border-linen/30 font-body text-linen sm:left-6"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goRelative(1)}
                  className="absolute right-3 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-full border border-linen/30 font-body text-linen sm:right-6"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
            {isRenderableSrc(active.image.src) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.image.src}
                alt={active.image.alt || title}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div
                className="aspect-[3/4] w-full max-w-lg"
                style={{ background: GALLERY_TONES[selectedIndex % GALLERY_TONES.length] }}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
