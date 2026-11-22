import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { CheckOnboarding } from '@/components/layout/check-onboarding';
import { SiteChrome } from '@/components/coastal/site-chrome';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    template: '%s | I Wear Organic',
    default: 'I Wear Organic',
  },
  description:
    'Wear Better. Naturally. Organic clothing made for everyday life.',
  keywords: [
    'fashion',
    'organic',
    'apparel',
    'i wear organic',
    'ecommerce',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://iwearorganic.com',
    title: 'I Wear Organic',
    description: 'Wear Better. Naturally. Organic clothing made for everyday life.',
    siteName: 'I Wear Organic',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I Wear Organic',
    description: 'Wear Better. Naturally.',
    creator: '@iwearorganic',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#294936' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * Brand kit v1.3 typography — Sora 400/500/600 (UI + editorial).
 * Prefer next/font/google when the build can fetch Google Fonts; this Cloud
 * Agent snapshot fails next/font Google downloads (null parse), so we keep
 * preconnect + stylesheet.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/brand/icons/iwo-icon-forest-32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="/brand/icons/iwo-icon-forest-16.png"
          type="image/png"
          sizes="16x16"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          href="/brand/icons/iwo-icon-forest-180.png"
          sizes="180x180"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', (event) => {
                if (event.message.includes('ChunkLoadError') || event.message.includes('Loading chunk')) {
                  window.location.reload();
                }
              });
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-itunes-app" content="app-id=6811465301" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <WishlistProvider>
            <CartProvider>
              <CheckOnboarding>
                <SiteChrome>{children}</SiteChrome>
                <Toaster />
              </CheckOnboarding>
            </CartProvider>
          </WishlistProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
