import { NextResponse } from 'next/server';
import { catalogService } from '@/services';
import {
  buildChatGptFeedRows,
  serializeChatGptFeedCsv,
  validateChatGptFeedCsv,
} from '@/lib/chatgpt-product-feed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Hosted ChatGPT Business Hub product feed (OpenAI Stable CSV).
 * Suggested public URL after deploy: https://iwearorganic.com/feeds/chatgpt-products.csv
 *
 * Uses catalogService (same Printify-backed cache as the storefront).
 * Validates before publish; keeps last-good CSV when a rebuild fails.
 */

type LastGood = {
  csv: string;
  builtAt: string;
  rowCount: number;
  parentCount: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __blendChatGptFeedLastGood: LastGood | undefined;
}

function getLastGood(): LastGood | undefined {
  return globalThis.__blendChatGptFeedLastGood;
}

function setLastGood(value: LastGood) {
  globalThis.__blendChatGptFeedLastGood = value;
}

function csvResponse(csv: string, extraHeaders?: Record<string, string>) {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control':
        'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
      ...extraHeaders,
    },
  });
}

export async function GET() {
  try {
    const { products, meta } = await catalogService.listProducts();

    if (meta.usingFixtures || meta.catalogUnavailable) {
      const lastGood = getLastGood();
      if (lastGood) {
        return csvResponse(lastGood.csv, {
          'X-IWO-Feed-Status': 'stale-last-good',
          'X-IWO-Feed-Built-At': lastGood.builtAt,
          'X-IWO-Feed-Reason': meta.usingFixtures
            ? 'fixtures-withheld'
            : 'catalog-unavailable',
        });
      }
      return NextResponse.json(
        {
          error: 'Live catalog unavailable; refusing fixture export',
          usingFixtures: meta.usingFixtures,
          catalogUnavailable: meta.catalogUnavailable,
        },
        { status: 503 }
      );
    }

    const built = buildChatGptFeedRows(products, meta);
    const csv = serializeChatGptFeedCsv(built.rows);
    const validation = validateChatGptFeedCsv(csv);

    if (!validation.ok) {
      console.error(
        '[chatgpt-product-feed] Validation failed; not publishing new feed',
        validation.issues.filter((i) => i.severity === 'error').slice(0, 10)
      );
      const lastGood = getLastGood();
      if (lastGood) {
        return csvResponse(lastGood.csv, {
          'X-IWO-Feed-Status': 'stale-last-good',
          'X-IWO-Feed-Built-At': lastGood.builtAt,
          'X-IWO-Feed-Reason': 'validation-failed',
        });
      }
      return NextResponse.json(
        {
          error: 'Feed validation failed',
          issueCount: validation.issues.filter((i) => i.severity === 'error')
            .length,
        },
        { status: 503 }
      );
    }

    const builtAt = new Date().toISOString();
    setLastGood({
      csv,
      builtAt,
      rowCount: built.variantCount,
      parentCount: built.parentCount,
    });

    return csvResponse(csv, {
      'X-IWO-Feed-Status': 'fresh',
      'X-IWO-Feed-Built-At': builtAt,
      'X-IWO-Feed-Parents': String(built.parentCount),
      'X-IWO-Feed-Variants': String(built.variantCount),
    });
  } catch (error) {
    console.error('[chatgpt-product-feed] Build failed', error);
    const lastGood = getLastGood();
    if (lastGood) {
      return csvResponse(lastGood.csv, {
        'X-IWO-Feed-Status': 'stale-last-good',
        'X-IWO-Feed-Built-At': lastGood.builtAt,
        'X-IWO-Feed-Reason': 'build-error',
      });
    }
    return NextResponse.json(
      { error: 'Failed to build product feed' },
      { status: 500 }
    );
  }
}
