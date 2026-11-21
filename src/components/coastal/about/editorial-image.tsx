import Image from 'next/image';
import { cn } from '@/lib/utils';

interface EditorialImageProps {
  src: string;
  alt: string;
  /** CSS aspect ratio class, e.g. aspect-[3/4] */
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
  className?: string;
  figureClassName?: string;
  caption?: string;
}

/**
 * Quiet editorial photograph frame — no cards, no overlays on the image.
 * Captions are honest contemporary / interpretive labels (never fake archival).
 */
export function EditorialImage({
  src,
  alt,
  aspect = 'aspect-[3/4]',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  objectPosition = 'center',
  className,
  figureClassName,
  caption,
}: EditorialImageProps) {
  return (
    <figure className={cn('min-w-0', figureClassName)}>
      <div className={cn('relative overflow-hidden bg-oat', aspect, className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover animate-ca-fade-up motion-reduce:animate-none"
          style={{ objectPosition }}
        />
      </div>
      {caption ? (
        <figcaption className="ca-caption mt-3">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
