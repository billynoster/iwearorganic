import type { CartItem } from '@/context/cart-context';

export function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function isFixtureProductId(id: string | number | undefined) {
  return String(id || '').startsWith('fixture-');
}

/** Parse Printify-style "Color / Size" titles into readable parts. */
export function parseVariantSummary(title: string | undefined): {
  color?: string;
  size?: string;
  label: string;
} {
  const raw = (title || '').trim();
  if (!raw) return { label: '' };
  const parts = raw.split('/').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      color: parts[0],
      size: parts[parts.length - 1],
      label: `${parts[0]} / ${parts[parts.length - 1]}`,
    };
  }
  // Single token — treat as size when short, otherwise as color.
  if (parts[0].length <= 4) {
    return { size: parts[0], label: `Size ${parts[0]}` };
  }
  return { color: parts[0], label: parts[0] };
}

export function lineImageSrc(item: CartItem): string | null {
  const images = item.product.images || [];
  const matched = images.find((img) =>
    Array.isArray(img.variant_ids) && img.variant_ids.includes(item.variant.id)
  );
  const src = matched?.src || images[0]?.src;
  if (!src || src.startsWith('data:')) return null;
  // Fixture cart adapter swaps data: URIs for placehold.co — prefer Coastal gradient.
  if (/placehold\.co/i.test(src)) return null;
  return src;
}

export function cartHasCheckoutableLines(items: CartItem[]) {
  return items.some((item) => !isFixtureProductId(item.product.id));
}

export function cartHasFixtureLines(items: CartItem[]) {
  return items.some((item) => isFixtureProductId(item.product.id));
}
