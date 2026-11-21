/**
 * Shared commerce domain types for service interfaces.
 * Prices are integer cents. Never treat client-supplied amounts as authoritative at checkout.
 */

export type MoneyCents = number;

export interface ProductImage {
  src: string;
  alt: string;
  isDefault?: boolean;
  /** When true, asset is a development/visual placeholder — not production inventory. */
  isPlaceholder?: boolean;
  /** Printify / catalog variant ids this image represents (for color swaps). */
  variantIds?: string[];
}

export interface ProductOptionValue {
  id: string;
  title: string;
  /** Optional swatch hex when the catalog provides color data. */
  colors?: string[];
}

export interface ProductOption {
  name: string;
  type: string;
  values: ProductOptionValue[];
}

export interface ProductVideo {
  src: string;
  title?: string;
  poster?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  priceCents: MoneyCents;
  /** Printify / source availability flags when known */
  isAvailable: boolean;
  isEnabled: boolean;
  optionValues: Record<string, string>;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  /** Color / size / etc. when the catalog provides structured options. */
  options?: ProductOption[];
  /** Product videos when Printify/catalog (or fixture) provides URLs. */
  videos?: ProductVideo[];
  collectionIds?: string[];
  /**
   * ISO release / catalog create timestamp when the source provides it
   * (Printify `created_at`). Used for Just dropped + NA “New” badges — never inferred from titles.
   */
  releasedAt?: string;
  /**
   * Printify sales-channel visibility when the source provides it.
   * `false` means unpublished on Printify — feed exporters should exclude.
   * Storefront listing currently does not filter on this flag (Phase 9A note).
   */
  sourceVisible?: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  href: string;
  image: ProductImage;
}

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
  /** Snapshot for UI only — checkout must revalidate server-side */
  unitPriceCentsSnapshot?: MoneyCents;
  titleSnapshot?: string;
  imageSrcSnapshot?: string;
}

export interface Cart {
  id: string;
  lines: CartLine[];
  updatedAt: string;
}

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
} | null;

export interface CheckoutSessionRequest {
  cartId?: string;
  orderId: string;
  /** Preferred: variant ids + qty only. Full line payloads are legacy-compatible. */
  lines: Array<{ productId: string; variantId: string; quantity: number }>;
}

export interface CheckoutSessionResult {
  url: string;
  sessionId?: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'cancelled'
  | 'unknown';

export interface OrderStatusResult {
  orderId: string;
  status: OrderStatus;
  printifyOrderId?: string;
  totalAmountCents?: MoneyCents;
  updatedAt?: string;
}

export interface ServiceMeta {
  /** When true, responses come from development fixtures — not live catalog/pricing. */
  usingFixtures: boolean;
  /**
   * When true, the live catalog could not be loaded and fixtures were intentionally
   * withheld (production / fixtures-disabled environments). Storefront should show
   * an unavailable / retry state — never silent fixture merchandising.
   */
  catalogUnavailable?: boolean;
}
