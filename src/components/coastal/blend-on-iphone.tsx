import Image from 'next/image';
import Link from 'next/link';
import { AppStoreBadge, APP_STORE_URL } from '@/components/ui/app-store-badge';
import { Bell, Heart, ShoppingBag, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: ShoppingBag, label: 'Shop new arrivals' },
  { icon: Heart, label: 'Save your favorites' },
  { icon: Sparkles, label: 'Get style inspiration' },
  { icon: Bell, label: 'Be the first to know' },
];

export function BlendOnIphone() {
  return (
    <section
      id="iphone"
      aria-labelledby="iphone-heading"
      className="border-t border-oat/70 bg-[color-mix(in_srgb,var(--ca-linen)_85%,var(--ca-oat))]"
    >
      <div className="ca-container py-16 sm:py-20 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <p className="ca-eyebrow mb-3">05 / On the Go</p>
            <h2
              id="iphone-heading"
              className="ca-display text-h3"
            >
              blend on iPhone.
            </h2>
            <p className="mt-4 ca-lede">Your style. Anywhere.</p>
            <div className="mt-8">
              <Link
                href={APP_STORE_URL}
                rel="noopener noreferrer"
                target="_blank"
                aria-label="Download on the App Store"
              >
                <AppStoreBadge size="md" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[240px] lg:col-span-4 lg:max-w-[260px]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.75rem] border border-oat bg-oat shadow-[0_24px_60px_rgba(48,52,53,0.14)]">
              <Image
                src="/ios-app-preview.png"
                alt="i wear organic iOS app preview"
                fill
                className="object-cover object-top"
                sizes="260px"
              />
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-10">
            <ul className="space-y-5">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-oat text-mineral-ink">
                    <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <span className="font-body text-sm text-mineral-ink/80">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
