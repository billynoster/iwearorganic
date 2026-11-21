/**
 * Server-side cart revalidation for Stripe Checkout.
 * Never trust client-supplied unit amounts or availability.
 * Injectable product fetcher enables sandbox E2E without live Printify.
 */

export type ClientCartItem = {
  product?: { id?: string; title?: string; images?: Array<{ src?: string }> };
  variant?: { id?: number | string; price?: number; title?: string };
  quantity?: number;
};

export type RevalidatedLine = {
  productId: string;
  variantId: number;
  title: string;
  image?: string;
  unitAmountCents: number;
  quantity: number;
};

export type PrintifyLikeProduct = {
  id: string | number;
  title: string;
  images?: Array<{ src?: string; variant_ids?: number[] }>;
  variants?: Array<{
    id: number | string;
    title?: string;
    price?: number | string;
    is_enabled?: boolean;
    is_available?: boolean;
  }>;
};

export type ProductFetcher = (
  productId: string
) => Promise<PrintifyLikeProduct | null>;

/**
 * Re-price line items from the catalog source (Printify in production).
 * Rejects fixtures, missing/unavailable variants, and invalid server prices.
 * Client `variant.price` is ignored — only server `unitAmountCents` is used.
 */
export async function revalidateLineItems(
  items: ClientCartItem[],
  fetchProduct: ProductFetcher
): Promise<{ lines: RevalidatedLine[]; errors: string[] }> {
  const lines: RevalidatedLine[] = [];
  const errors: string[] = [];

  for (const item of items) {
    const productId = item.product?.id;
    const variantIdRaw = item.variant?.id;
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 0));

    if (!productId || variantIdRaw === undefined || variantIdRaw === null || quantity < 1) {
      errors.push('Cart contains an incomplete line item.');
      continue;
    }

    if (String(productId).startsWith('fixture-')) {
      errors.push(
        `Development fixture “${item.product?.title || productId}” cannot be checked out.`
      );
      continue;
    }

    const variantId = Number(variantIdRaw);
    if (!Number.isFinite(variantId)) {
      errors.push(`Invalid variant for ${item.product?.title || productId}.`);
      continue;
    }

    try {
      const product = await fetchProduct(String(productId));
      if (!product) {
        errors.push(`Product unavailable: ${item.product?.title || productId}`);
        continue;
      }

      const variant = product.variants?.find((v) => Number(v.id) === variantId);
      if (!variant) {
        errors.push(`Variant unavailable for ${product.title}.`);
        continue;
      }

      const enabled = variant.is_enabled !== false;
      const available = variant.is_available !== false;
      if (!enabled || !available) {
        errors.push(`${product.title} (${variant.title}) is not available.`);
        continue;
      }

      const unitAmountCents = Math.round(Number(variant.price));
      if (!Number.isFinite(unitAmountCents) || unitAmountCents <= 0) {
        errors.push(`Invalid server price for ${product.title}.`);
        continue;
      }

      const image =
        product.images?.find((img) =>
          Array.isArray(img.variant_ids) ? img.variant_ids.includes(variantId) : false
        )?.src || product.images?.[0]?.src;

      lines.push({
        productId: String(product.id),
        variantId,
        title: `${product.title}${variant.title ? ` — ${variant.title}` : ''}`,
        image: image?.startsWith('http') ? image : undefined,
        unitAmountCents,
        quantity,
      });
    } catch (err: unknown) {
      console.error('Checkout revalidation error:', err);
      errors.push(
        `Could not verify price for ${item.product?.title || productId}. Printify credentials may be missing.`
      );
    }
  }

  return { lines, errors };
}
