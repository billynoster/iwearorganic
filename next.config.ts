
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Brand wordmark SVGs via next/image (unoptimized in Logo); allow SVG metadata
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**"
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-api.printify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.printify.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/journal',
        destination: '/lookbook',
        permanent: true,
      },
      {
        source: '/journal/:path*',
        destination: '/lookbook',
        permanent: true,
      },
      {
        source: '/pages/contact-us',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/sitemap_products_1.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/sitemap_pages_1.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/sitemap_collections_1.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/sitemap_blogs_1.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/tag/:path*',
        destination: '/shopping',
        permanent: true,
      },
      {
        source: '/collections/:path*',
        destination: '/shopping',
        permanent: true,
      },
      {
        source: '/blogs/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/.well-known/security.txt',
        destination: '/',
        permanent: true,
      },
      {
        source: '/security.txt',
        destination: '/',
        permanent: true,
      },
      {
        source: '/cdn/shop/files/:path*',
        destination: 'https://picsum.photos/seed/blendamerica/800/800',
        permanent: false,
      }
    ]
  },
};

export default nextConfig;
