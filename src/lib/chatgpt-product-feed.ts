/**
 * ChatGPT Business Hub — OpenAI Stable product feed (UTF-8 CSV).
 * Spec: https://developers.openai.com/commerce/specs/file-upload/products
 *
 * Read-only export from the same catalogService Product model as the storefront.
 * Never invents prices, GTINs, availability, or fixture SKUs.
 */

import type { Product, ProductVariant, ServiceMeta } from '@/services/types';
import { formatProductDescription } from '@/lib/product-description';
import { variantColor, variantSize } from '@/lib/variant-options';
import { getProductGenderEligibility } from '@/lib/gender-utils';
import {
  CATEGORY_TAG_PREFIX,
  CATEGORY_TAXONOMY,
  type CategoryId,
} from '@/lib/category-taxonomy';

export const FEED_BRAND = 'I Wear Organic';
export const FEED_SELLER_NAME = 'I Wear Organic';
export const FEED_SELLER_URL = 'https://iwearorganic.com';
export const FEED_BASE_URL = 'https://iwearorganic.com';
export const FEED_CURRENCY = 'USD';
/**
 * Destination markets for ChatGPT Business Hub.
 * CSV encoding: comma-separated uppercase ISO 3166-1 alpha-2 codes (no spaces).
 * JSONL equivalent: ["US"]. Spec example uses ["US"]; Ads CSV examples use bare `US`.
 * Hub treats this as required even though Stable docs mark it optional.
 */
export const FEED_TARGET_COUNTRIES = 'US';
/**
 * Seller store country for ChatGPT Business Hub geo tagging.
 * Uppercase ISO 3166-1 alpha-2. Hub market-enabled feeds reject rows when this
 * sibling of target_countries is omitted (Stable docs still mark optional).
 */
export const FEED_STORE_COUNTRY = 'US';

/** Stable CSV column order (required first, then supported optionals). */
export const FEED_CSV_HEADERS = [
  'item_id',
  'title',
  'description',
  'url',
  'brand',
  'seller_name',
  'image_url',
  'availability',
  'price',
  'group_id',
  'listing_has_variations',
  'variant_dict',
  'color',
  'size',
  'gender',
  'age_group',
  'product_category',
  'additional_image_urls',
  'seller_url',
  'condition',
  'is_eligible_search',
  'target_countries',
  'store_country',
] as const;

export type FeedAvailability =
  | 'in_stock'
  | 'out_of_stock'
  | 'pre_order'
  | 'backorder'
  | 'unknown';

export type ChatGptFeedRow = {
  item_id: string;
  title: string;
  description: string;
  url: string;
  brand: string;
  seller_name: string;
  image_url: string;
  availability: FeedAvailability;
  price: string;
  group_id: string;
  listing_has_variations: 'true' | 'false';
  variant_dict: string;
  color: string;
  size: string;
  gender: string;
  age_group: string;
  product_category: string;
  additional_image_urls: string;
  seller_url: string;
  condition: string;
  is_eligible_search: 'true' | 'false';
  /** Comma-separated ISO 3166-1 alpha-2 codes, e.g. `US` or `US,CA`. */
  target_countries: string;
  /** Seller store country — uppercase ISO 3166-1 alpha-2, e.g. `US`. */
  store_country: string;
};

export type FeedExclusion = {
  productId: string;
  variantId?: string;
  reason: string;
};

export type FeedBuildResult = {
  rows: ChatGptFeedRow[];
  parentCount: number;
  variantCount: number;
  exclusions: FeedExclusion[];
  unknownAvailabilityCount: number;
  missingDescriptionCount: number;
  missingImageCount: number;
};

export type FeedValidationIssue = {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  itemId?: string;
};

export type FeedValidationReport = {
  ok: boolean;
  rowCount: number;
  parentCount: number;
  issues: FeedValidationIssue[];
  sampleItemIds: string[];
};

function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isPublicImageUrl(src: string): boolean {
  if (!src || typeof src !== 'string') return false;
  if (src.startsWith('data:')) return false;
  if (!isHttpsUrl(src)) return false;
  // Reject obvious local / signed-expiring patterns we do not want in a public feed
  if (/localhost|127\.0\.0\.1/i.test(src)) return false;
  return true;
}

function plainDescription(raw: string): string {
  const paragraphs = formatProductDescription(raw || '');
  const text = paragraphs.join('\n\n').trim();
  if (!text) return '';
  // OpenAI guidance: aim for ≤ 5000 characters
  return text.length > 5000 ? `${text.slice(0, 4997).trimEnd()}...` : text;
}

function formatMoneyUsd(priceCents: number): string | null {
  if (!Number.isFinite(priceCents) || priceCents <= 0) return null;
  // Preserve exact cent amount — do not round into a different payable price
  const dollars = Math.trunc(priceCents / 100);
  const cents = Math.abs(priceCents % 100);
  return `${dollars}.${String(cents).padStart(2, '0')} ${FEED_CURRENCY}`;
}

function mapAvailability(variant: ProductVariant): FeedAvailability {
  if (variant.isEnabled && variant.isAvailable) return 'in_stock';
  if (variant.isEnabled && !variant.isAvailable) return 'out_of_stock';
  return 'unknown';
}

function resolveGender(product: Product): string {
  const eligibility = getProductGenderEligibility(product.title, product.tags || []);
  if (eligibility.isUnisex || (eligibility.forMen && eligibility.forWomen)) {
    return 'unisex';
  }
  if (eligibility.forMen && !eligibility.forWomen) return 'male';
  if (eligibility.forWomen && !eligibility.forMen) return 'female';
  return '';
}

function resolveProductCategory(product: Product): string {
  const tags = product.tags || [];
  for (const tag of tags) {
    if (!tag.startsWith(CATEGORY_TAG_PREFIX)) continue;
    const id = tag.slice(CATEGORY_TAG_PREFIX.length) as CategoryId;
    const def = CATEGORY_TAXONOMY.find((c) => c.id === id);
    if (def) {
      return `Apparel & Accessories > Clothing > ${def.label}`;
    }
  }
  return 'Apparel & Accessories > Clothing';
}

function imageForVariant(
  product: Product,
  variant: ProductVariant
): { primary: string | null; additional: string[] } {
  const httpsImages = (product.images || []).filter(
    (img) => !img.isPlaceholder && isPublicImageUrl(img.src)
  );
  const variantMatch = httpsImages.find((img) =>
    (img.variantIds || []).map(String).includes(String(variant.id))
  );
  const defaultImg =
    httpsImages.find((img) => img.isDefault) || httpsImages[0] || null;
  const primary = (variantMatch || defaultImg)?.src ?? null;
  const additional = httpsImages
    .map((img) => img.src)
    .filter((src) => src !== primary)
    .slice(0, 10);
  return { primary, additional };
}

function buildVariantTitle(
  product: Product,
  color: string | null,
  size: string | null,
  variant: ProductVariant
): string {
  const parts: string[] = [];
  if (color) parts.push(color);
  if (size) parts.push(`size ${size}`);
  if (parts.length === 0 && variant.title && variant.title !== product.title) {
    return `${product.title} — ${variant.title}`.slice(0, 150);
  }
  if (parts.length === 0) return product.title.slice(0, 150);
  return `${product.title} — ${parts.join(', ')}`.slice(0, 150);
}

function variantDictJson(color: string | null, size: string | null): string {
  const dict: Record<string, string> = {};
  if (color) dict.color = color;
  if (size) dict.size = size;
  return JSON.stringify(dict);
}

function isFixtureProduct(product: Product): boolean {
  if (product.id.startsWith('fixture-')) return true;
  if ((product.images || []).some((img) => img.isPlaceholder)) return true;
  return false;
}

/**
 * Build feed rows from storefront Product models.
 * One CSV row per enabled purchasable variant.
 */
export function buildChatGptFeedRows(
  products: Product[],
  meta?: ServiceMeta
): FeedBuildResult {
  const exclusions: FeedExclusion[] = [];
  const rows: ChatGptFeedRow[] = [];
  let unknownAvailabilityCount = 0;
  let missingDescriptionCount = 0;
  let missingImageCount = 0;
  const includedParents = new Set<string>();

  if (meta?.usingFixtures) {
    return {
      rows: [],
      parentCount: 0,
      variantCount: 0,
      exclusions: [
        {
          productId: '*',
          reason: 'Catalog meta.usingFixtures — development fixtures are not exportable',
        },
      ],
      unknownAvailabilityCount: 0,
      missingDescriptionCount: 0,
      missingImageCount: 0,
    };
  }

  if (meta?.catalogUnavailable) {
    return {
      rows: [],
      parentCount: 0,
      variantCount: 0,
      exclusions: [
        {
          productId: '*',
          reason: 'Catalog unavailable — refusing empty/fixture substitute export',
        },
      ],
      unknownAvailabilityCount: 0,
      missingDescriptionCount: 0,
      missingImageCount: 0,
    };
  }

  for (const product of products) {
    if (isFixtureProduct(product)) {
      exclusions.push({
        productId: product.id,
        reason: 'Fixture / placeholder product excluded',
      });
      continue;
    }

    // Printify unpublished — feed-only filter (storefront may still list today)
    if (product.sourceVisible === false) {
      exclusions.push({
        productId: product.id,
        reason: 'Printify visible=false (unpublished) — excluded from feed',
      });
      continue;
    }

    const description = plainDescription(product.description || '');
    if (!description) {
      missingDescriptionCount += 1;
      exclusions.push({
        productId: product.id,
        reason: 'Missing verified description',
      });
      continue;
    }

    const enabledVariants = (product.variants || []).filter((v) => v.isEnabled);
    if (enabledVariants.length === 0) {
      exclusions.push({
        productId: product.id,
        reason: 'No enabled purchasable variants',
      });
      continue;
    }

    const hasVariations = enabledVariants.length > 1;
    const gender = resolveGender(product);
    const productCategory = resolveProductCategory(product);
    let parentIncluded = false;

    for (const variant of enabledVariants) {
      const price = formatMoneyUsd(variant.priceCents);
      if (!price) {
        exclusions.push({
          productId: product.id,
          variantId: variant.id,
          reason: 'Invalid or non-positive priceCents',
        });
        continue;
      }

      const { primary, additional } = imageForVariant(product, variant);
      if (!primary) {
        missingImageCount += 1;
        exclusions.push({
          productId: product.id,
          variantId: variant.id,
          reason: 'No public HTTPS image URL',
        });
        continue;
      }

      const color = variantColor(variant);
      const size = variantSize(variant);
      const availability = mapAvailability(variant);
      if (availability === 'unknown') unknownAvailabilityCount += 1;

      const itemId = `${product.id}:${variant.id}`;
      // PDP does not hydrate color/size from query params — emit canonical parent URL
      const url = `${FEED_BASE_URL}/shopping/${encodeURIComponent(product.id)}`;

      rows.push({
        item_id: itemId,
        title: buildVariantTitle(product, color, size, variant),
        description,
        url,
        brand: FEED_BRAND,
        seller_name: FEED_SELLER_NAME,
        image_url: primary,
        availability,
        price,
        group_id: product.id,
        listing_has_variations: hasVariations ? 'true' : 'false',
        variant_dict: hasVariations ? variantDictJson(color, size) : '',
        color: color || '',
        size: size || '',
        gender,
        age_group: 'adult',
        product_category: productCategory,
        additional_image_urls: additional.join(','),
        seller_url: FEED_SELLER_URL,
        condition: 'new',
        is_eligible_search: 'true',
        target_countries: FEED_TARGET_COUNTRIES,
        store_country: FEED_STORE_COUNTRY,
      });
      parentIncluded = true;
    }

    if (parentIncluded) includedParents.add(product.id);
  }

  return {
    rows,
    parentCount: includedParents.size,
    variantCount: rows.length,
    exclusions,
    unknownAvailabilityCount,
    missingDescriptionCount,
    missingImageCount,
  };
}

/** RFC 4180-style CSV cell. */
export function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function serializeChatGptFeedCsv(rows: ChatGptFeedRow[]): string {
  const lines: string[] = [FEED_CSV_HEADERS.join(',')];
  for (const row of rows) {
    const cells = FEED_CSV_HEADERS.map((header) =>
      escapeCsvCell(String(row[header] ?? ''))
    );
    lines.push(cells.join(','));
  }
  // UTF-8 BOM helps Excel; Business Hub accepts UTF-8 CSV
  return `\uFEFF${lines.join('\n')}\n`;
}

export function parseChatGptFeedCsv(csv: string): Record<string, string>[] {
  const text = csv.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let cell = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\n') {
      row.push(cell);
      cell = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
      continue;
    }
    if (ch === '\r') continue;
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1).map((values) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? '';
    });
    return obj;
  });
}

const REQUIRED_FIELDS = [
  'item_id',
  'title',
  'description',
  'url',
  'brand',
  'seller_name',
  'image_url',
  'availability',
  'price',
  // Hub-required for market-enabled feeds (Stable docs still mark optional)
  'target_countries',
  'store_country',
] as const;

const AVAILABILITY_VALUES = new Set([
  'in_stock',
  'out_of_stock',
  'pre_order',
  'backorder',
  'unknown',
]);

export function validateChatGptFeedRows(
  rows: Array<Record<string, string>>,
  options?: { expectParents?: number }
): FeedValidationReport {
  const issues: FeedValidationIssue[] = [];
  const ids = new Set<string>();
  const parents = new Set<string>();

  if (rows.length === 0) {
    issues.push({
      severity: 'error',
      code: 'empty_feed',
      message: 'Feed has no product rows',
    });
  }

  for (const row of rows) {
    const itemId = row.item_id || '';
    for (const field of REQUIRED_FIELDS) {
      if (!String(row[field] || '').trim()) {
        issues.push({
          severity: 'error',
          code: 'missing_required',
          message: `Missing required field ${field}`,
          itemId,
        });
      }
    }

    if (itemId) {
      if (ids.has(itemId)) {
        issues.push({
          severity: 'error',
          code: 'duplicate_item_id',
          message: `Duplicate item_id ${itemId}`,
          itemId,
        });
      }
      ids.add(itemId);
      if (itemId.startsWith('fixture-') || itemId.includes('fixture-')) {
        issues.push({
          severity: 'error',
          code: 'fixture_id',
          message: 'Fixture id leaked into feed',
          itemId,
        });
      }
    }

    if (row.group_id) parents.add(row.group_id);

    if (row.url && !isHttpsUrl(row.url)) {
      issues.push({
        severity: 'error',
        code: 'invalid_url',
        message: `url must be HTTPS: ${row.url}`,
        itemId,
      });
    } else if (row.url && !row.url.startsWith(`${FEED_BASE_URL}/shopping/`)) {
      issues.push({
        severity: 'error',
        code: 'non_pdp_url',
        message: `url is not a iwearorganic.com PDP: ${row.url}`,
        itemId,
      });
    }

    if (row.image_url && !isPublicImageUrl(row.image_url)) {
      issues.push({
        severity: 'error',
        code: 'invalid_image_url',
        message: `image_url must be public HTTPS: ${row.image_url}`,
        itemId,
      });
    }

    if (row.availability && !AVAILABILITY_VALUES.has(row.availability)) {
      issues.push({
        severity: 'error',
        code: 'invalid_availability',
        message: `Unrecognized availability ${row.availability}`,
        itemId,
      });
    }

    if (row.price && !/^\d+\.\d{2} USD$/.test(row.price)) {
      issues.push({
        severity: 'error',
        code: 'invalid_price',
        message: `price must look like "12.34 USD": ${row.price}`,
        itemId,
      });
    }

    if (row.brand !== FEED_BRAND || row.seller_name !== FEED_SELLER_NAME) {
      issues.push({
        severity: 'error',
        code: 'brand_seller',
        message: 'brand/seller_name must be I Wear Organic',
        itemId,
      });
    }

    if (row.target_countries) {
      // CSV: comma-separated uppercase ISO 3166-1 alpha-2, no spaces (e.g. US or US,CA)
      if (!/^[A-Z]{2}(,[A-Z]{2})*$/.test(String(row.target_countries))) {
        issues.push({
          severity: 'error',
          code: 'invalid_target_countries',
          message:
            'target_countries must be comma-separated uppercase ISO 3166-1 alpha-2 codes with no spaces',
          itemId,
        });
      } else if (row.target_countries !== FEED_TARGET_COUNTRIES) {
        issues.push({
          severity: 'error',
          code: 'unexpected_target_countries',
          message: `target_countries must be ${FEED_TARGET_COUNTRIES} (US-only seller)`,
          itemId,
        });
      }
    }

    if (row.store_country) {
      if (!/^[A-Z]{2}$/.test(String(row.store_country))) {
        issues.push({
          severity: 'error',
          code: 'invalid_store_country',
          message: 'store_country must be a single uppercase ISO 3166-1 alpha-2 code',
          itemId,
        });
      } else if (row.store_country !== FEED_STORE_COUNTRY) {
        issues.push({
          severity: 'error',
          code: 'unexpected_store_country',
          message: `store_country must be ${FEED_STORE_COUNTRY} (US-only seller)`,
          itemId,
        });
      }
    }

    // Sensitive / private field sniff — token shapes only (not product copy like "racing stripes")
    const blob = JSON.stringify(row);
    const sensitivePatterns: Array<{ code: string; re: RegExp }> = [
      { code: 'sk_live', re: /\bsk_live_[A-Za-z0-9]+/ },
      { code: 'sk_test', re: /\bsk_test_[A-Za-z0-9]+/ },
      { code: 'whsec', re: /\bwhsec_[A-Za-z0-9]+/ },
      { code: 'printify_bearer', re: /Bearer\s+[A-Za-z0-9._-]{20,}/ },
      { code: 'private_key', re: /BEGIN (RSA )?PRIVATE KEY/ },
      { code: 'firebase_sa', re: /firebase_service_account|"private_key"/i },
    ];
    for (const { code, re } of sensitivePatterns) {
      if (re.test(blob)) {
        issues.push({
          severity: 'error',
          code: 'sensitive_data',
          message: `Possible sensitive token pattern: ${code}`,
          itemId,
        });
      }
    }

    if (row.listing_has_variations === 'true') {
      if (!row.group_id || row.group_id === row.item_id) {
        issues.push({
          severity: 'error',
          code: 'variant_group',
          message: 'listing_has_variations requires group_id distinct from item_id',
          itemId,
        });
      }
      if (row.variant_dict) {
        try {
          const parsed = JSON.parse(row.variant_dict);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('not object');
          }
        } catch {
          issues.push({
            severity: 'error',
            code: 'variant_dict',
            message: 'variant_dict must be a JSON object string',
            itemId,
          });
        }
      }
    }
  }

  if (options?.expectParents != null && parents.size !== options.expectParents) {
    issues.push({
      severity: 'warning',
      code: 'parent_count_mismatch',
      message: `Expected ${options.expectParents} parents, found ${parents.size}`,
    });
  }

  const errors = issues.filter((i) => i.severity === 'error');
  return {
    ok: errors.length === 0 && rows.length > 0,
    rowCount: rows.length,
    parentCount: parents.size,
    issues,
    sampleItemIds: [...ids].slice(0, 5),
  };
}

export function validateChatGptFeedCsv(csv: string): FeedValidationReport {
  const rows = parseChatGptFeedCsv(csv);
  return validateChatGptFeedRows(rows);
}
