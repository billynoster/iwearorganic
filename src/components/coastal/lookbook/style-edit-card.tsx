import Image from 'next/image';
import Link from 'next/link';
import type { LookbookEdit } from '@/content/lookbook-edits';
import { cn } from '@/lib/utils';

interface StyleEditCardProps {
  edit: LookbookEdit;
  featured?: boolean;
  priority?: boolean;
}

/**
 * Lookbook gallery card — campaign photography + Explore the Edit CTA.
 * No rounded promo cards; editorial composition only.
 */
export function StyleEditCard({
  edit,
  featured = false,
  priority = false,
}: StyleEditCardProps) {
  const href = `/lookbook/${edit.slug}`;
  const imageSrc = edit.mobileHeroImage && featured ? edit.heroImage : edit.heroImage;

  return (
    <article
      className={cn(
        'group flex flex-col',
        featured ? 'md:col-span-7 lg:col-span-8' : 'md:col-span-5 lg:col-span-4'
      )}
    >
      <Link
        href={href}
        className="relative block overflow-hidden bg-oat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
      >
        <div
          className={cn(
            'relative w-full overflow-hidden',
            featured ? 'aspect-[4/5] sm:aspect-[16/11] md:aspect-[16/10]' : 'aspect-[4/5]'
          )}
        >
          <Image
            src={imageSrc}
            alt={edit.heroAlt}
            fill
            sizes={
              featured
                ? '(max-width: 768px) 100vw, 66vw'
                : '(max-width: 768px) 100vw, 34vw'
            }
            priority={priority}
            className={cn(
              'object-cover transition-transform duration-700 ease-out motion-reduce:transition-none',
              'group-hover:scale-[1.02] motion-reduce:group-hover:scale-100',
              featured ? 'object-[center_20%]' : 'object-cover object-center'
            )}
          />
        </div>
      </Link>

      <div className={cn('mt-5 flex flex-col', featured ? 'md:mt-6' : 'md:mt-5')}>
        {edit.eyebrow ? <p className="ca-eyebrow mb-2">{edit.eyebrow}</p> : null}
        <h2
          className={cn(
            'ca-display',
            featured ? 'text-h2' : 'text-h3'
          )}
        >
          <Link
            href={href}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
          >
            {edit.title}
          </Link>
        </h2>
        <p className="mt-3 max-w-md ca-lede">{edit.galleryDescription}</p>
        <div className="mt-5">
          <Link href={href} className="ca-text-link font-medium underline">
            Explore the Edit
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
