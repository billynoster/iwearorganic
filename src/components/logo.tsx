import { cn } from '@/lib/utils';

export type LogoVariant = 'forest' | 'white' | 'charcoal' | 'black';
export type LogoLockup = 'wordmark' | 'stacked';

type LogoProps = {
  variant?: LogoVariant;
  lockup?: LogoLockup;
  className?: string;
  /** Kept for call-site compatibility; unused for the vector/text mark. */
  priority?: boolean;
};

const VARIANT_CLASS: Record<LogoVariant, string> = {
  forest: 'text-forest',
  white: 'text-cotton',
  charcoal: 'text-[color:var(--iwo-text)]',
  black: 'text-black',
};

/**
 * Approved wordmark — Sora Semibold + ™ (Brand Kit v1.3).
 * Rendered as text so it stays crisp at any size; no raster scaling.
 */
export function Logo({
  variant = 'forest',
  lockup = 'wordmark',
  className,
}: LogoProps) {
  const mark = (
    <sup
      className="relative -top-[0.35em] ml-[0.06em] text-[0.42em] font-semibold leading-none tracking-normal"
      aria-hidden="true"
    >
      ™
    </sup>
  );

  if (lockup === 'stacked') {
    return (
      <span
        className={cn(
          'font-brand inline-flex select-none flex-col text-[1.35rem] font-semibold lowercase leading-[1.05] tracking-[-0.02em]',
          VARIANT_CLASS[variant],
          className
        )}
        aria-label="i wear organic"
      >
        <span>i wear</span>
        <span>
          organic
          {mark}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'font-brand inline-block select-none whitespace-nowrap text-[1.125rem] font-semibold lowercase leading-none tracking-[-0.02em] sm:text-[1.25rem] lg:text-[1.375rem]',
        VARIANT_CLASS[variant],
        className
      )}
      aria-label="i wear organic"
    >
      i wear organic
      {mark}
    </span>
  );
}
