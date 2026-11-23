import Image from 'next/image';
import { cn } from '@/lib/utils';

export type LogoVariant = 'forest' | 'white' | 'charcoal' | 'black';
export type LogoLockup = 'wordmark' | 'stacked';

/** Soft Minimal wordmark viewBox from approved vector artwork. */
const WORDMARK_SIZE = { width: 2308, height: 352 } as const;
const STACKED_SIZE = { width: 784, height: 414 } as const;

type LogoProps = {
  variant?: LogoVariant;
  lockup?: LogoLockup;
  className?: string;
  priority?: boolean;
};

/**
 * Approved Soft Minimal wordmark (Brand Kit v1.4).
 * Uses supplied SVG artwork — never recreate with Manrope/Sora/Inter live text.
 */
export function Logo({
  variant = 'forest',
  lockup = 'wordmark',
  className,
  priority = false,
}: LogoProps) {
  const intrinsic = lockup === 'stacked' ? STACKED_SIZE : WORDMARK_SIZE;
  const src = `/brand/logos/iwo-${lockup}-${variant}.svg`;

  return (
    <Image
      src={src}
      alt="i wear organic"
      width={intrinsic.width}
      height={intrinsic.height}
      priority={priority}
      unoptimized
      sizes="(max-width: 640px) 128px, (max-width: 1024px) 156px, 180px"
      className={cn('h-auto w-[148px] select-none sm:w-[168px] lg:w-[180px]', className)}
    />
  );
}
