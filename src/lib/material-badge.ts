/**
 * Derive an approved material badge label when catalog data supports it.
 * Brand kit §16 / §20 — only show verified-style material copy; no eco clichés.
 */

const APPROVED: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b100%\s*organic\s*cotton\b/i, label: '100% Organic Cotton' },
  { pattern: /\borganic\s*cotton\s*fleece\b/i, label: 'Organic Cotton Fleece' },
  { pattern: /\borganic\s*cotton\b/i, label: 'Organic Cotton' },
  { pattern: /\b100%\s*organic\b/i, label: '100% Organic' },
];

export function materialBadgeFromText(...parts: Array<string | undefined | null>): string | null {
  const haystack = parts.filter(Boolean).join(' ');
  if (!haystack.trim()) return null;
  for (const entry of APPROVED) {
    if (entry.pattern.test(haystack)) return entry.label;
  }
  return null;
}

export function materialBadgeFromProduct(product: {
  title?: string;
  description?: string;
  tags?: string[];
}): string | null {
  return materialBadgeFromText(
    product.title,
    product.description,
    ...(product.tags ?? [])
  );
}
