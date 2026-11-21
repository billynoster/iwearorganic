/**
 * Search Utilities for I Wear Organic
 * Provides intelligent, error-tolerant, plural-tolerant product and editorial article searching.
 */

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns singular, plural, and related synonym variations of a search token.
 */
export function getSearchTokenVariations(rawToken: string): string[] {
  const token = rawToken.toLowerCase().trim();
  if (!token) return [];

  const variations = new Set<string>([token]);

  // English plural / singular rules
  if (token.endsWith('sses')) {
    variations.add(token.slice(0, -2)); // dresses -> dress
  } else if (token.endsWith('ies')) {
    variations.add(token.slice(0, -3) + 'y'); // hoodies -> hoody
    variations.add(token.slice(0, -3) + 'ie'); // beanies -> beanie
  } else if (token.endsWith('es')) {
    variations.add(token.slice(0, -2));
    variations.add(token.slice(0, -1));
  } else if (token.endsWith('s') && !token.endsWith('ss')) {
    variations.add(token.slice(0, -1)); // hoodies -> hoodie, shirts -> shirt
  } else {
    variations.add(token + 's'); // hoodie -> hoodies, shirt -> shirts
    if (token.endsWith('ss') || token.endsWith('sh') || token.endsWith('ch') || token.endsWith('x')) {
      variations.add(token + 'es'); // dress -> dresses
    }
  }

  // Domain-specific apparel synonyms
  if (token.includes('hoodie') || token.includes('hoody') || token === 'hood' || token === 'hooded') {
    ['hoodie', 'hoodies', 'hoody', 'hooded'].forEach(v => variations.add(v));
  }
  if (token.includes('sweat') || token === 'pullover') {
    ['sweatshirt', 'sweatshirts', 'pullover', 'crewneck', 'fleece'].forEach(v => variations.add(v));
  }
  if (['tee', 'tees', 't-shirt', 'tshirt', 'shirt', 'shirts', 'tank'].includes(token)) {
    ['tee', 'tees', 't-shirt', 'tshirt', 'shirt', 'shirts', 'tank'].forEach(v => variations.add(v));
  }
  if (token.includes('swim') || token === 'bikini' || token === 'trunk' || token === 'trunks') {
    ['swim', 'swimsuit', 'swimwear', 'bikini', 'trunks'].forEach(v => variations.add(v));
  }
  if (token === 'dress' || token === 'dresses') {
    ['dress', 'dresses', 'racerback', 'tank dress'].forEach(v => variations.add(v));
  }
  if (token === 'skirt' || token === 'skirts') {
    ['skirt', 'skirts', 'pencil skirt'].forEach(v => variations.add(v));
  }
  if (['beanie', 'beanies'].includes(token)) {
    ['beanie', 'beanies', 'knit cap', 'winter hat'].forEach(v => variations.add(v));
  }
  if (['hat', 'hats', 'cap', 'caps'].includes(token)) {
    ['hat', 'hats', 'cap', 'caps', 'headwear', 'beanie'].forEach(v => variations.add(v));
  }
  if (['jacket', 'jackets', 'windbreaker', 'coat', 'outerwear'].includes(token)) {
    ['jacket', 'jackets', 'windbreaker', 'coat', 'outerwear', 'soft shell'].forEach(v => variations.add(v));
  }
  if (['legging', 'leggings', 'yoga'].includes(token)) {
    ['legging', 'leggings', 'yoga', 'sports bra'].forEach(v => variations.add(v));
  }

  return Array.from(variations);
}

export interface SearchableItem {
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
}

/**
 * Checks if a product or item matches the given search query.
 * Multi-token query requires every token to be satisfied (AND logic).
 * Word-boundary checking is enforced for short words (<= 3 chars) to avoid false matches.
 */
export function matchesSearchQuery(item: SearchableItem, query: string): boolean {
  if (!query || !query.trim()) return true;

  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const title = (item.title || '').toLowerCase();
  const desc = ((item.description || item.content) || '').toLowerCase();
  const tags = (item.tags || []).map(t => (t || '').toLowerCase());
  const fullText = `${title} ${tags.join(' ')} ${desc}`;

  return tokens.every(token => {
    const variations = getSearchTokenVariations(token);
    return variations.some(variant => {
      // If searching for dress/dresses, do not count the compound Printify tag "skirts & dresses" if the item is a skirt
      if ((variant === 'dress' || variant === 'dresses') && title.includes('skirt') && !title.includes('dress')) {
        return false;
      }

      // For short keywords (like 'hat', 'tee', 'cap', 'red'), require word boundary
      if (variant.length <= 3) {
        const regex = new RegExp(`(^|[^a-zA-Z0-9])${escapeRegex(variant)}($|[^a-zA-Z0-9])`, 'i');
        return regex.test(fullText);
      }
      // For longer keywords, allow substring matches across title, tags, or description
      const safeTags = tags.filter(t => {
        if ((variant === 'dress' || variant === 'dresses') && t.includes('skirts & dresses')) return false;
        return true;
      });
      return title.includes(variant) || safeTags.some(t => t.includes(variant)) || desc.includes(variant);
    });
  });
}

/**
 * Calculates a relevance score for ordering search results.
 * Products with title matches rank higher than tag or description matches.
 */
export function scoreSearchMatch(item: SearchableItem, query: string): number {
  if (!query || !query.trim()) return 0;

  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;

  const title = (item.title || '').toLowerCase();
  const desc = ((item.description || item.content) || '').toLowerCase();
  const tags = (item.tags || []).map(t => (t || '').toLowerCase());
  const normalizedQuery = query.toLowerCase().trim();

  let score = 0;

  // Exact phrase in title gets huge boost
  if (title.includes(normalizedQuery)) {
    score += 100;
  }

  tokens.forEach(token => {
    const variations = getSearchTokenVariations(token);
    
    // Check title match
    const titleMatch = variations.some(v => title.includes(v));
    if (titleMatch) {
      score += 30;
    }

    // Check tags match
    const tagMatch = variations.some(v => tags.some(t => t.includes(v)));
    if (tagMatch) {
      score += 15;
    }

    // Check description match
    const descMatch = variations.some(v => desc.includes(v));
    if (descMatch) {
      score += 5;
    }
  });

  return score;
}
