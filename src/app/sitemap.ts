import type { MetadataRoute } from 'next';
import { getPublishedEdits } from '@/content/lookbook-edits';
import { catalogService } from '@/services';

const BASE_URL = 'https://iwearorganic.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/about',
    '/organic-standards',
    '/careers',
    '/contact',
    '/lookbook',
    '/men',
    '/women',
    '/new-arrivals',
    '/rescuing-pets',
    '/shipping',
    '/shopping',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : route === '/lookbook' ? 0.9 : 0.8,
  }));

  const lookbookRoutes = getPublishedEdits().map((edit) => ({
    url: `${BASE_URL}/lookbook/${edit.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { products } = await catalogService.listProducts();
    for (const product of products) {
      productRoutes.push({
        url: `${BASE_URL}/shopping/${product.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticRoutes, ...lookbookRoutes, ...productRoutes];
}
