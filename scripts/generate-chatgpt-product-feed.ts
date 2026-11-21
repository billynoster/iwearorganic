/**
 * Local generate + validate ChatGPT Business Hub product feed (Stable CSV).
 *
 * Prefers live Printify via catalogService when credentials exist.
 * Falls back to production https://iwearorganic.com/api/products (read-only)
 * so samples can be built in CI/dev without local Printify secrets.
 *
 * Usage:
 *   npx tsx scripts/generate-chatgpt-product-feed.ts [--out path] [--report path]
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { mapPrintifyProduct } from '../src/services/map-printify-product';
import type { Product, ServiceMeta } from '../src/services/types';
import {
  buildChatGptFeedRows,
  serializeChatGptFeedCsv,
  validateChatGptFeedCsv,
  type FeedBuildResult,
  type FeedValidationReport,
} from '../src/lib/chatgpt-product-feed';

const LIVE_PRODUCTS_URL = 'https://iwearorganic.com/api/products';

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

/**
 * Prefer production storefront catalog API (same Printify-backed shop as live site).
 * Avoids importing Next.js cache from catalogService in a plain Node script.
 */
async function loadFromLiveApi(): Promise<{
  products: Product[];
  meta: ServiceMeta;
  source: string;
}> {
  const res = await fetch(LIVE_PRODUCTS_URL, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Live API ${LIVE_PRODUCTS_URL} → ${res.status}`);
  }
  const raw = await res.json();
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error('Live API returned empty catalog');
  }
  return {
    products: raw.map(mapPrintifyProduct),
    meta: { usingFixtures: false, catalogUnavailable: false },
    source: LIVE_PRODUCTS_URL,
  };
}

function summarize(
  source: string,
  built: FeedBuildResult,
  validation: FeedValidationReport
) {
  const exclusionReasons = new Map<string, number>();
  for (const ex of built.exclusions) {
    exclusionReasons.set(
      ex.reason,
      (exclusionReasons.get(ex.reason) || 0) + 1
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    source,
    parentCount: built.parentCount,
    variantCount: built.variantCount,
    exclusionCount: built.exclusions.length,
    exclusionReasons: Object.fromEntries(exclusionReasons),
    unknownAvailabilityCount: built.unknownAvailabilityCount,
    missingDescriptionCount: built.missingDescriptionCount,
    missingImageCount: built.missingImageCount,
    validation,
    notes: [
      'PDP variant deep-links (?color=&size=) are not hydrated by ProductDetailCoastal; feed emits parent PDP URLs only.',
      'Printify visible=false products are excluded from the feed only.',
      'Availability maps Printify is_enabled + is_available (MTO orderable → in_stock).',
      'target_countries=US (CSV comma-separated ISO 3166-1 alpha-2; Hub-required for market-enabled feeds).',
      'store_country=US (Hub geo sibling of target_countries; required on market-enabled feeds).',
      'GTIN/MPN omitted — not inventing identifiers.',
    ],
  };
}

async function main() {
  const outPath = resolve(
    argValue('--out') ||
      'tmp/chatgpt-products.sample.csv'
  );
  const reportPath = resolve(
    argValue('--report') ||
      'tmp/chatgpt-product-feed-validation.json'
  );

  const loaded = await loadFromLiveApi();

  const built = buildChatGptFeedRows(loaded.products, loaded.meta);
  const csv = serializeChatGptFeedCsv(built.rows);
  const validation = validateChatGptFeedCsv(csv);
  const report = summarize(loaded.source, built, validation);

  mkdirSync(dirname(outPath), { recursive: true });
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(outPath, csv, 'utf8');
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(
    JSON.stringify(
      {
        outPath,
        reportPath,
        source: loaded.source,
        parentCount: built.parentCount,
        variantCount: built.variantCount,
        exclusionCount: built.exclusions.length,
        validationOk: validation.ok,
        errorCount: validation.issues.filter((i) => i.severity === 'error')
          .length,
      },
      null,
      2
    )
  );

  if (!validation.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
