import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const APP_STORE_URL =
  'https://apps.apple.com/us/app/blend-america/id6811465301';

interface AppStoreBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

const sizeClasses = {
  sm: 'h-8 w-auto',
  md: 'h-10 w-auto',
  lg: 'h-12 w-auto',
};

export function AppStoreBadge({
  className,
  size = 'md',
}: AppStoreBadgeProps) {
  return (
    <Link
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download i wear organic on the App Store"
      className={cn(
        'inline-flex min-h-11 items-center transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen rounded-[8px]',
        className
      )}
    >
      <img
        src="/app-store-badge.svg"
        alt="Download on the App Store"
        className={cn(sizeClasses[size], 'drop-shadow-sm select-none')}
        width={120}
        height={40}
        loading="lazy"
      />
    </Link>
  );
}
