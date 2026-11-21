import Image from 'next/image';
import { cn } from '@/lib/utils';

export type LogoVariant = 'forest' | 'white' | 'charcoal' | 'black';
export type LogoLockup = 'wordmark' | 'stacked';

const WORDMARK_SIZE = { width: 1200, height: 260 } as const;
const STACKED_SIZE = { width: 900, height: 520 } as const;

type LogoProps = {
  variant?: LogoVariant;
  lockup?: LogoLockup;
  className?: string;
  priority?: boolean;
};

/**
 * Approved v1.1 logo system — lowercase “i wear organic” wordmark assets.
 * Prefer horizontal forest wordmark on light headers; white on dark surfaces.
 * Size via className (e.g. w-[148px]); keep at least ~108px wide on mobile.
 */
export function Logo({
  variant = 'forest',
  lockup = 'wordmark',
  className,
  priority = false,
}: LogoProps) {
  const intrinsic = lockup === 'stacked' ? STACKED_SIZE : WORDMARK_SIZE;
  const src = `/brand/logos/iwo-${lockup}-${variant}.png`;

  return (
    <Image
      src={src}
      alt="i wear organic"
      width={intrinsic.width}
      height={intrinsic.height}
      priority={priority}
      sizes="(max-width: 640px) 108px, (max-width: 1024px) 132px, 168px"
      className={cn('h-auto w-[148px] select-none', className)}
    />
  );
}
