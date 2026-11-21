/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 */

import {z} from 'zod';

const CategoriesEnum = z.enum(["America", "Fashion & Gear", "Politics", "Business & Builders", "Blend Intelligence", "The American Kitchen", "The B-Side", "Shopping"]);
export type Category = z.infer<typeof CategoriesEnum>;

// Base schema for a single article
export const ArticleSchema = z.object({
  id: z.string().describe('A unique identifier for the article.'),
  title: z.string().describe('The headline of the news article.'),
  content: z.string().describe('The full text content of the news article.'),
  source: z.string().describe('The source of the news article (e.g., a news agency).'),
  category: CategoriesEnum,
  publishedAt: z.string().describe('The ISO 8601 timestamp of when the article was published.'),
  imageUrl: z.string().url().describe('A URL for the article\'s header image.'),
  imageHint: z.string().describe('A hint for the AI to generate an appropriate image.'),
  videoUrl: z.string().url().optional().describe('An optional URL for a video associated with the article.'),
  productId: z.string().optional().describe('Optional ID if this article represents a shop product.'),
  tags: z.array(z.string()).optional().describe('Optional tags for filtering (e.g., from Printify).'),
});
export type Article = z.infer<typeof ArticleSchema>;
