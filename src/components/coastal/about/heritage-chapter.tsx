import type { ReactNode } from 'react';
import { EditorialImage } from '@/components/coastal/about/editorial-image';
import { cn } from '@/lib/utils';

export type ChapterLayout = 'image-left' | 'image-right' | 'image-wide' | 'image-editorial';

interface HeritageChapterProps {
  id: string;
  eyebrow: string;
  headline: string;
  paragraphs: string[];
  closingLines?: string[];
  /** Standard chapter photograph. Omit when `media` supplies a custom visual. */
  image?: {
    src: string;
    alt: string;
    caption?: string;
    objectPosition?: string;
  };
  /** Custom visual block (e.g. 1997 logo panel). Replaces `image` when set. */
  media?: ReactNode;
  layout: ChapterLayout;
}

export function HeritageChapter({
  id,
  eyebrow,
  headline,
  paragraphs,
  closingLines,
  image,
  media,
  layout,
}: HeritageChapterProps) {
  const headingId = `${id}-heading`;

  if (layout === 'image-wide') {
    return (
      <section
        id={id}
        aria-labelledby={headingId}
        className="border-t border-oat/70 bg-linen"
      >
        <div className="ca-container py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center md:max-w-2xl">
            <p className="ca-eyebrow mb-3 text-haze-blue">{eyebrow}</p>
            <h2
              id={headingId}
              className="ca-editorial-display text-[clamp(2.125rem,1.55rem+2.2vw,4rem)] leading-[1.02] tracking-[-0.015em] text-mineral-ink"
            >
              {headline}
            </h2>
          </div>

          <div className="mt-10 md:mt-14">
            {media ? (
              media
            ) : image ? (
              <EditorialImage
                src={image.src}
                alt={image.alt}
                aspect="aspect-[16/10] md:aspect-[21/9]"
                sizes="(max-width: 1360px) 100vw, 1360px"
                objectPosition={image.objectPosition ?? 'center 30%'}
                caption={image.caption}
              />
            ) : null}
          </div>

          <div className="mx-auto mt-10 max-w-xl space-y-5 md:mt-12">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 32)} className="ca-lede">
                {p}
              </p>
            ))}
            {closingLines?.map((line) => (
              <p
                key={line}
                className="ca-editorial text-lg leading-snug text-mineral-ink/70 sm:text-xl"
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const imageFirst = layout === 'image-left' || layout === 'image-editorial';
  const imageSpan =
    layout === 'image-right'
      ? 'md:col-span-5'
      : layout === 'image-editorial'
        ? 'md:col-span-6 lg:col-span-7'
        : 'md:col-span-6 lg:col-span-5';
  const textSpan =
    layout === 'image-right'
      ? 'md:col-span-6 lg:col-span-6'
      : layout === 'image-editorial'
        ? 'md:col-span-6 lg:col-span-5'
        : 'md:col-span-6 lg:col-span-6 lg:col-start-7';
  const aspect =
    layout === 'image-right'
      ? 'aspect-[4/5] md:aspect-[3/4]'
      : layout === 'image-editorial'
        ? 'aspect-[4/5] md:aspect-[5/6]'
        : 'aspect-[3/4]';

  const textBlock = (
    <div
      className={cn(
        'flex flex-col justify-center md:min-h-[22rem]',
        textSpan,
        layout === 'image-right' && 'md:pr-4 lg:pr-10'
      )}
    >
      <p className="ca-eyebrow mb-3 text-haze-blue">{eyebrow}</p>
      <h2
        id={headingId}
        className="ca-editorial-display max-w-[16ch] text-[clamp(2.125rem,1.55rem+2.2vw,4rem)] leading-[1.02] tracking-[-0.015em] text-mineral-ink"
      >
        {headline}
      </h2>
      <div className="mt-6 max-w-xl space-y-5 sm:mt-7">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)} className="ca-lede">
            {p}
          </p>
        ))}
        {closingLines?.map((line) => (
          <p
            key={line}
            className="ca-editorial text-lg leading-snug text-mineral-ink/70 sm:text-xl"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );

  const imageBlock = (
    <div className={imageSpan}>
      {media ? (
        media
      ) : image ? (
        <EditorialImage
          src={image.src}
          alt={image.alt}
          aspect={aspect}
          sizes={
            layout === 'image-right'
              ? '(max-width: 768px) 100vw, 38vw'
              : '(max-width: 768px) 100vw, 46vw'
          }
          objectPosition={image.objectPosition ?? 'center'}
          caption={image.caption}
        />
      ) : null}
    </div>
  );

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="border-t border-oat/70 bg-linen"
    >
      <div className="ca-container py-16 sm:py-20 md:py-24">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-10 lg:gap-14">
          {imageFirst ? (
            <>
              {imageBlock}
              {textBlock}
            </>
          ) : (
            <>
              {textBlock}
              {imageBlock}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
