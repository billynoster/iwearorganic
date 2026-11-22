import Image from 'next/image';
import { cn } from '@/lib/utils';

export type LogoVariant = 'forest' | 'white' | 'charcoal' | 'black';
export type LogoLockup = 'wordmark' | 'stacked';

/** Approved horizontal wordmark intrinsic size (v1.3 locked asset). */
const WORDMARK_SIZE = { width: 2400, height: 439 } as const;
const STACKED_SIZE = { width: 900, height: 520 } as const;

type LogoProps = {
  variant?: LogoVariant;
  lockup?: LogoLockup;
  className?: string;
  priority?: boolean;
};

/**
 * Approved logo system — lowercase “i wear organic” raster wordmark.
 * Header default: horizontal forest wordmark on light chrome.
 * Size via className; keep ≥ ~120px wide on mobile for legibility.
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
      sizes="(max-width: 640px) 128px, (max-width: 1024px) 156px, 180px"
      className={cn('h-auto w-[156px] select-none', className)}
    />
  );
}
