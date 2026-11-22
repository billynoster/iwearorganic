/**
 * Resolve which Printify shop this storefront uses.
 *
 * Billy's Printify account can own multiple shops (e.g. Blend + I Wear Organic).
 * Never silently pick shops[0] when more than one shop is visible — that previously
 * served Blend products on iwearorganic.com.
 */

const PRINTIFY_API = 'https://api.printify.com/v1';

export type PrintifyShop = {
  id: number | string;
  title?: string;
  sales_channel?: string;
};

function sanitizeEnv(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export function getPrintifyToken(): string | undefined {
  return (
    sanitizeEnv(process.env.PRINTIFY_API_TOKEN) ||
    sanitizeEnv(process.env.PRINTIFY_API_KEY)
  );
}

export async function fetchPrintifyShops(token: string): Promise<PrintifyShop[]> {
  const response = await fetch(`${PRINTIFY_API}/shops.json`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[printify-shop] Failed to fetch shops:', errorBody);
    throw new Error('Failed to fetch Printify shops.');
  }

  const shops = (await response.json()) as PrintifyShop[];
  return Array.isArray(shops) ? shops : [];
}

/**
 * Returns the configured I Wear Organic shop id, or "" when token/shops are missing
 * (catalog callers treat empty as "no live inventory").
 *
 * Prefers PRINTIFY_SHOP_ID. If unset and exactly one shop exists, uses that shop.
 * If multiple shops exist without PRINTIFY_SHOP_ID, throws so we never mix brands.
 */
export async function resolvePrintifyShopId(token?: string): Promise<string> {
  const auth = token || getPrintifyToken();
  if (!auth) {
    console.warn('[printify-shop] PRINTIFY_API_TOKEN/KEY missing — no shop id.');
    return '';
  }

  const configured = sanitizeEnv(process.env.PRINTIFY_SHOP_ID);
  const shops = await fetchPrintifyShops(auth);

  if (shops.length === 0) {
    console.warn('[printify-shop] No Printify shops for this token.');
    return '';
  }

  if (configured) {
    const match = shops.find((s) => String(s.id) === configured);
    if (!match) {
      const available = shops.map((s) => `${s.id}:${s.title || '?'}`).join(', ');
      throw new Error(
        `PRINTIFY_SHOP_ID=${configured} is not visible to this API token. Available: ${available}`
      );
    }
    console.log(`[printify-shop] Using configured shop ${match.id} (${match.title || 'untitled'})`);
    return String(match.id);
  }

  if (shops.length === 1) {
    console.log(
      `[printify-shop] Single shop ${shops[0].id} (${shops[0].title || 'untitled'}) — set PRINTIFY_SHOP_ID to pin.`
    );
    return String(shops[0].id);
  }

  const available = shops.map((s) => `${s.id}:${s.title || '?'}`).join(', ');
  throw new Error(
    `Multiple Printify shops on this token; set PRINTIFY_SHOP_ID to the I Wear Organic shop. Available: ${available}`
  );
}
