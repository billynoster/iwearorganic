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
    'I Wear Organic — made-to-order organic apparel. Shop shell adapted from the Coastal Analog storefront.',
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
    description: 'Made-to-order organic apparel.',
    siteName: 'I Wear Organic',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I Wear Organic',
    description: 'Made-to-order organic apparel.',
    creator: '@iwearorganic',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F1EB' },
    { media: '(prefers-color-scheme: dark)', color: '#303435' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * Phase 8A typography — Outfit 700 (wordmark only), DM Sans 400–700
 * (all functional UI), Instrument Serif + italic (editorial). Archivo removed.
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
        <link rel="icon" href="/favicon.png" />
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
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Outfit:wght@700&display=swap"
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
