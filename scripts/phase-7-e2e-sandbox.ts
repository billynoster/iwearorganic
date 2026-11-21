/**
 * Phase 7 Workstream C — sandbox E2E (no prod charges / no Printify fulfillment).
 *
 * Covers:
 * 1) Unit: checkout revalidation (fixture, invalid variant, unavailable, stale price)
 * 2) Unit: webhook idempotency guards
 * 3) Playwright UI: desktop + mobile PDP / bag / confirmation journeys
 *
 * Usage: npx tsx scripts/phase-7-e2e-sandbox.ts
 * Env: BASE_URL (default http://127.0.0.1:3000)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from 'playwright';
import {
  revalidateLineItems,
  type PrintifyLikeProduct,
} from '../src/lib/checkout-revalidate';
import {
  isOrderAlreadyFulfilled,
  shouldSkipWebhookFulfillment,
  wasStripeEventProcessed,
} from '../src/lib/webhook-order-guard';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const MEDIA = '/cursor/stores/bc-29becd66-313c-42df-8561-3821d9cbfcff/media';
const ART = '/opt/cursor/artifacts';
const REPORT_JSON =
  '/cursor/stores/bc-29becd66-313c-42df-8561-3821d9cbfcff/docs/phase-7-e2e-sandbox-results.json';

type CaseResult = {
  id: string;
  ok: boolean;
  detail?: string;
  implemented: boolean;
  tested: boolean;
  blockedReason?: string;
};

const results: CaseResult[] = [];

function record(r: CaseResult) {
  results.push(r);
  const mark = r.ok ? 'PASS' : r.blockedReason ? 'BLOCKED' : 'FAIL';
  console.log(`[${mark}] ${r.id}${r.detail ? ` — ${r.detail}` : ''}`);
}

async function saveShot(page: Page, name: string) {
  mkdirSync(MEDIA, { recursive: true });
  mkdirSync(ART, { recursive: true });
  const file = `phase-7-e2e-${name}.png`;
  await page.screenshot({ path: path.join(MEDIA, file), fullPage: false });
  await page.screenshot({ path: path.join(ART, file), fullPage: false });
  return file;
}

async function runUnitRevalidation() {
  const catalog: Record<string, PrintifyLikeProduct> = {
    'prod-live': {
      id: 'prod-live',
      title: 'Coastal Crew',
      images: [{ src: 'https://cdn.example/crew.jpg', variant_ids: [10, 11] }],
      variants: [
        { id: 10, title: 'Oat / M', price: 7200, is_enabled: true, is_available: true },
        { id: 11, title: 'Oat / L', price: 7200, is_enabled: true, is_available: false },
      ],
    },
  };

  const fetchProduct = async (id: string) => catalog[id] ?? null;

  // Fixture blocked
  {
    const { lines, errors } = await revalidateLineItems(
      [
        {
          product: { id: 'fixture-everyday-crew', title: 'Fixture Crew' },
          variant: { id: 1, price: 1 },
          quantity: 1,
        },
      ],
      fetchProduct
    );
    record({
      id: 'unit.revalidate.fixture-blocked',
      ok: lines.length === 0 && /fixture/i.test(errors[0] || ''),
      detail: errors[0],
      implemented: true,
      tested: true,
    });
  }

  // Invalid / missing variant
  {
    const { lines, errors } = await revalidateLineItems(
      [
        {
          product: { id: 'prod-live', title: 'Coastal Crew' },
          variant: { id: 999, price: 9999 },
          quantity: 1,
        },
      ],
      fetchProduct
    );
    record({
      id: 'unit.revalidate.invalid-variant',
      ok: lines.length === 0 && /variant unavailable/i.test(errors[0] || ''),
      detail: errors[0],
      implemented: true,
      tested: true,
    });
  }

  // Unavailable variant
  {
    const { lines, errors } = await revalidateLineItems(
      [
        {
          product: { id: 'prod-live', title: 'Coastal Crew' },
          variant: { id: 11, price: 1 },
          quantity: 1,
        },
      ],
      fetchProduct
    );
    record({
      id: 'unit.revalidate.unavailable-variant',
      ok: lines.length === 0 && /not available/i.test(errors[0] || ''),
      detail: errors[0],
      implemented: true,
      tested: true,
    });
  }

  // Stale client price ignored — server price wins
  {
    const { lines, errors } = await revalidateLineItems(
      [
        {
          product: { id: 'prod-live', title: 'Coastal Crew' },
          variant: { id: 10, price: 100 }, // stale $1.00 client
          quantity: 2,
        },
      ],
      fetchProduct
    );
    record({
      id: 'unit.revalidate.stale-price-ignored',
      ok:
        errors.length === 0 &&
        lines.length === 1 &&
        lines[0].unitAmountCents === 7200 &&
        lines[0].quantity === 2,
      detail: lines[0]
        ? `serverCents=${lines[0].unitAmountCents} qty=${lines[0].quantity}`
        : errors[0],
      implemented: true,
      tested: true,
    });
  }
}

function runUnitWebhookIdempotency() {
  record({
    id: 'unit.webhook.already-fulfilled',
    ok: isOrderAlreadyFulfilled({
      status: 'paid',
      printifyOrderId: 'py_123',
    }),
    implemented: true,
    tested: true,
  });

  record({
    id: 'unit.webhook.pending-not-fulfilled',
    ok: !isOrderAlreadyFulfilled({ status: 'pending' }),
    implemented: true,
    tested: true,
  });

  record({
    id: 'unit.webhook.event-replay',
    ok: wasStripeEventProcessed(
      { status: 'pending', stripeEventIds: ['evt_1', 'evt_2'] },
      'evt_2'
    ),
    implemented: true,
    tested: true,
  });

  const skipFulfilled = shouldSkipWebhookFulfillment(
    { status: 'paid', printifyOrderId: 'py_9' },
    'evt_new'
  );
  record({
    id: 'unit.webhook.skip-fulfilled',
    ok: skipFulfilled.skip && skipFulfilled.reason === 'already-fulfilled',
    detail: String(skipFulfilled.reason),
    implemented: true,
    tested: true,
  });

  const skipReplay = shouldSkipWebhookFulfillment(
    { status: 'pending', stripeEventIds: ['evt_dup'] },
    'evt_dup'
  );
  record({
    id: 'unit.webhook.skip-event-replay',
    ok: skipReplay.skip && skipReplay.reason === 'event-replay',
    detail: String(skipReplay.reason),
    implemented: true,
    tested: true,
  });

  // Live Stripe webhook delivery not exercised in this VM (no WHSEC / no charges).
  record({
    id: 'live.webhook.stripe-delivery',
    ok: true,
    implemented: true,
    tested: false,
    blockedReason:
      'No STRIPE_WEBHOOK_SECRET / sandbox charge in this environment — logic unit-tested only',
  });
}

async function runUiJourneys() {
  const browser = await chromium.launch({ headless: true });

  // --- Desktop PDP: size validation + OOS ---
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/shopping/fixture-everyday-crew`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: /add to bag/i }).first().click();
    await page.waitForSelector('text=Select a size to continue.', { timeout: 8000 });
    await saveShot(page, 'pdp-size-validation-1440');
    record({
      id: 'ui.pdp.size-validation.desktop',
      ok: true,
      implemented: true,
      tested: true,
    });

    // Select unavailable Mineral XS if present, else note partial
    const mineral = page.locator('input[type="radio"][value="Mineral"]');
    if (await mineral.count()) {
      await mineral.check({ force: true }).catch(async () => {
        await page.locator('label').filter({ hasText: /Mineral/i }).first().click();
      });
      await page.waitForTimeout(400);
    }
    const xs = page.locator('input[type="radio"][value="XS"]');
    if (await xs.count()) {
      const disabled = await xs.isDisabled();
      record({
        id: 'ui.pdp.unavailable-size.desktop',
        ok: disabled,
        detail: disabled ? 'XS disabled for Mineral' : 'XS unexpectedly enabled',
        implemented: true,
        tested: true,
      });
    }

    await page.goto(`${BASE}/shopping/fixture-everyday-tee`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(1200);
    const oos = await page.getByRole('button', { name: /out of stock/i }).count();
    await saveShot(page, 'pdp-oos-1440');
    record({
      id: 'ui.pdp.unavailable-product.desktop',
      ok: oos > 0,
      detail: `oosButtons=${oos}`,
      implemented: true,
      tested: true,
    });
    await page.close();
  }

  // --- Mobile PDP sticky ATC + size validation ---
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${BASE}/shopping/fixture-everyday-crew`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /add to bag/i.test(b.getAttribute('aria-label') || '')
      );
      if (btn) {
        const y =
          btn.getBoundingClientRect().top + window.scrollY + btn.offsetHeight + 240;
        window.scrollTo(0, y);
      }
    });
    await page.waitForSelector('[role="region"][aria-label="Add to bag"]', {
      timeout: 8000,
    });
    await saveShot(page, 'pdp-sticky-atc-390');
    await page.locator('[role="region"][aria-label="Add to bag"] button').click();
    await page.waitForSelector('text=Select a size to continue.', { timeout: 8000 });
    await saveShot(page, 'pdp-size-validation-390');
    record({
      id: 'ui.pdp.sticky-atc-and-size.mobile',
      ok: true,
      implemented: true,
      tested: true,
    });
    await page.close();
  }

  // --- Bag fixture gate + checkout block ---
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => {
      const guestCart = [
        {
          product: {
            id: 'fixture-everyday-crew',
            title: 'The Everyday Crew',
            description: 'Fixture',
            tags: [],
            images: [
              {
                src: 'https://placehold.co/800x1000/EBE6DF/303435?text=IWO',
                variant_ids: [101],
                position: '1',
                is_default: true,
              },
            ],
            variants: [],
            options: [],
          },
          variant: {
            id: 101,
            price: 7200,
            title: 'Mineral / M',
            options: [],
            is_enabled: true,
            is_available: true,
            sku: 'FIX-M',
          },
          quantity: 1,
        },
      ];
      window.localStorage.setItem('iwearorganic_guest_cart_v1', JSON.stringify(guestCart));
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);
    const gate = await page.getByRole('button', { name: /remove sample items/i }).count();
    await saveShot(page, 'bag-fixture-gate-1440');
    record({
      id: 'ui.bag.fixture-checkout-blocked.desktop',
      ok: gate > 0,
      detail: `gateButtons=${gate}`,
      implemented: true,
      tested: true,
    });

    await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);
    const pay = await page.getByRole('button', { name: /pay securely/i }).count();
    const sample = await page.locator('text=Sample items').count();
    await saveShot(page, 'checkout-fixture-block-1440');
    record({
      id: 'ui.checkout.fixture-blocked.desktop',
      ok: pay === 0 && sample > 0,
      detail: `pay=${pay} sample=${sample}`,
      implemented: true,
      tested: true,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await saveShot(page, 'checkout-fixture-block-390');
    record({
      id: 'ui.checkout.fixture-blocked.mobile',
      ok: (await page.locator('text=Sample items').count()) > 0,
      implemented: true,
      tested: true,
    });
    await context.close();
  }

  // --- Confirmation / cancel (no Stripe charge) ---
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${BASE}/checkout/success?canceled=1`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('text=Checkout canceled', { timeout: 15000 });
    await saveShot(page, 'checkout-canceled-1440');
    record({
      id: 'ui.checkout.cancel-confirmation.desktop',
      ok: true,
      implemented: true,
      tested: true,
    });

    await page.goto(
      `${BASE}/checkout/success?session_id=cs_test_sandbox&order_id=order_phase7_e2e`,
      { waitUntil: 'domcontentloaded' }
    );
    await page.waitForSelector('text=Your order is in', { timeout: 15000 });
    await saveShot(page, 'checkout-confirmed-1440');
    record({
      id: 'ui.checkout.confirmation.desktop',
      ok: true,
      implemented: true,
      tested: true,
      detail:
        'UI confirmation only — webhook fulfillment not asserted without sandbox charge',
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/checkout/success?canceled=1`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('text=Checkout canceled', { timeout: 15000 });
    await saveShot(page, 'checkout-canceled-390');
    record({
      id: 'ui.checkout.cancel-confirmation.mobile',
      ok: true,
      implemented: true,
      tested: true,
    });
    await page.close();
  }

  // Live Stripe checkout session create
  record({
    id: 'live.stripe.checkout-session',
    ok: true,
    implemented: true,
    tested: false,
    blockedReason:
      'STRIPE_SECRET_KEY / PRINTIFY credentials missing in this VM — no sandbox charge attempted',
  });

  await browser.close();
}

async function main() {
  console.log(`Phase 7C sandbox E2E against ${BASE}`);
  await runUnitRevalidation();
  runUnitWebhookIdempotency();
  await runUiJourneys();

  const tested = results.filter((r) => r.tested);
  const failed = tested.filter((r) => !r.ok);
  const blocked = results.filter((r) => r.blockedReason);

  const summary = {
    baseUrl: BASE,
    generatedAt: new Date().toISOString(),
    totals: {
      cases: results.length,
      tested: tested.length,
      passed: tested.filter((r) => r.ok).length,
      failed: failed.length,
      blockedUntested: blocked.filter((r) => !r.tested).length,
    },
    results,
  };

  mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  writeFileSync(REPORT_JSON, JSON.stringify(summary, null, 2));
  console.log('\nSummary', summary.totals);
  console.log('Wrote', REPORT_JSON);

  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
