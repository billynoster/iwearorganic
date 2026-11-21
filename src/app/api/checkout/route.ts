import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { fetchPrintifyProductById } from '@/ai/flows/printify-products';
import {
  describeAdminFirestoreTarget,
  getAdminDb,
  isFirebaseAdminConfigured,
  probeServiceAccountEnv,
} from '@/lib/firebase-admin';
import {
  revalidateLineItems,
  type ClientCartItem,
  type RevalidatedLine,
} from '@/lib/checkout-revalidate';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    // Prefer sk_test locally / in agent environments; live keys are gated below.
    stripeClient = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return stripeClient;
}

function generateOrderId(): string {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Persist a pending guest order for the existing Stripe webhook fulfillment path.
 * Does not modify /api/webhook/stripe — webhook still reads orders/{orderId}.
 */
async function createGuestPendingOrder(params: {
  orderId: string;
  lines: RevalidatedLine[];
  clientItems: ClientCartItem[];
  totalAmountCents: number;
}): Promise<void> {
  const probe = probeServiceAccountEnv();
  const target = describeAdminFirestoreTarget();
  // Safe diagnostics only — never log private_key / full JSON.
  console.info('[checkout] Guest Admin probe', {
    keyDefined: probe.keyDefined,
    keyFileDefined: probe.keyFileDefined,
    gacDefined: probe.gacDefined,
    rawLength: probe.rawLength,
    looksLikePath: probe.looksLikePath,
    cwd: probe.cwd,
    projectRoot: probe.projectRoot,
    existingPaths: probe.existingPaths,
    parseOk: probe.parseOk,
    saProjectId: probe.saProjectId,
    clientProjectId: probe.clientProjectId,
    projectIdMatch: probe.projectIdMatch,
    databaseId: probe.databaseId,
    databaseIdSource: probe.databaseIdSource,
    appletConfigPath: probe.appletConfigPath,
    appletConfigExists: probe.appletConfigExists,
    error: probe.error,
  });

  if (!isFirebaseAdminConfigured() || !probe.parseOk) {
    const err = new Error(
      probe.error ||
        'Guest checkout requires FIREBASE_SERVICE_ACCOUNT_KEY in .env.local (path like ./secrets/firebase-admin.json, or one-line JSON). Also accepted: FIREBASE_SERVICE_ACCOUNT_KEY_FILE. Restart `next dev` after editing env.'
    );
    (err as Error & { code?: string; probe?: typeof probe }).code =
      'MISSING_FIREBASE_SERVICE_ACCOUNT_KEY';
    (err as Error & { probe?: typeof probe }).probe = probe;
    throw err;
  }

  if (probe.databaseIdSource === 'missing' || probe.databaseId === '(default)') {
    console.warn(
      '[checkout] Named Firestore database id not resolved before guest write. Set FIREBASE_FIRESTORE_DATABASE_ID in .env.local to match firebase-applet-config.json firestoreDatabaseId.'
    );
  }

  const adminDb = getAdminDb();
  const items = params.lines.map((line) => {
    const item = params.clientItems.find(
      (candidate) =>
        String(candidate.product?.id) === line.productId &&
        Number(candidate.variant?.id) === line.variantId
    );
    return JSON.stringify({
      product: {
        id: line.productId,
        title: item?.product?.title || line.title,
        images:
          item?.product?.images ||
          (line.image ? [{ src: line.image, variant_ids: [line.variantId] }] : []),
      },
      variant: {
        id: line.variantId,
        title: item?.variant?.title || '',
        // Store revalidated unit amount so webhook/Printify see server prices.
        price: line.unitAmountCents,
      },
      quantity: line.quantity,
    });
  });

  console.info('[checkout] Writing guest order', {
    orderId: params.orderId,
    projectId: target.projectId,
    databaseId: target.databaseId || '(default)',
    databaseIdSource: target.databaseIdSource,
    appletConfigPath: target.appletConfigPath,
  });

  try {
    await adminDb.collection('orders').doc(params.orderId).set({
      id: params.orderId,
      userId: `guest_${params.orderId}`,
      email: 'guest',
      status: 'pending',
      totalAmount: params.totalAmountCents / 100,
      items,
      shippingInfo: '{}',
      createdAt: new Date().toISOString(),
      checkoutMode: 'guest',
    });
  } catch (writeErr: any) {
    const enriched = new Error(
      `${writeErr?.message || writeErr} | target projectId=${target.projectId} databaseId=${
        target.databaseId || '(default)'
      } databaseIdSource=${target.databaseIdSource} appletConfig=${target.appletConfigPath} saProjectId=${
        target.saProjectId
      } clientProjectId=${target.clientProjectId} projectIdMatch=${target.projectIdMatch}`
    );
    (enriched as Error & { code?: unknown; probe?: typeof probe }).code =
      writeErr?.code ?? 'GUEST_ORDER_WRITE_FAILED';
    (enriched as Error & { probe?: typeof probe }).probe = probe;
    throw enriched;
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            'Checkout is unavailable in this environment (STRIPE_SECRET_KEY missing). Use staging/test keys — do not point this agent at production webhooks.',
        },
        { status: 503 }
      );
    }

    if (!process.env.PRINTIFY_API_TOKEN && !process.env.PRINTIFY_API_KEY) {
      return NextResponse.json(
        {
          error:
            'Checkout cannot revalidate prices (PRINTIFY_API_TOKEN/KEY missing). Server-side pricing is required.',
        },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const body = await req.json();
    const { items, orderId: clientOrderId, guest, customerEmail } = body as {
      items?: ClientCartItem[];
      orderId?: string;
      guest?: boolean;
      /** Prefills Stripe Checkout when the shopper is signed in (optional). */
      customerEmail?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const isGuestCheckout = guest === true;
    let orderId =
      typeof clientOrderId === 'string' && clientOrderId.length > 0
        ? clientOrderId
        : undefined;

    if (!isGuestCheckout && !orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const { lines, errors } = await revalidateLineItems(items, fetchPrintifyProductById);
    if (errors.length > 0 || lines.length === 0) {
      return NextResponse.json(
        {
          error: errors[0] || 'Unable to revalidate cart prices',
          details: errors,
        },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const stripeMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test')
      ? 'test'
      : process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')
        ? 'live'
        : 'unknown';

    // Prefer sk_test locally. Live keys are blocked unless explicitly allowed.
    if (stripeMode === 'live' && process.env.ALLOW_LIVE_STRIPE_CHECKOUT !== 'true') {
      console.warn(
        '[checkout] Live Stripe key detected; ALLOW_LIVE_STRIPE_CHECKOUT is not true. Refusing session create from this environment.'
      );
      return NextResponse.json(
        {
          error:
            'Live Stripe checkout is blocked in this environment. Inject sk_test_* keys or set ALLOW_LIVE_STRIPE_CHECKOUT=true only for intentional staging against live (not recommended from agents). Production webhooks must not be altered.',
          stripeMode,
        },
        { status: 403 }
      );
    }

    if (isGuestCheckout) {
      orderId = orderId || generateOrderId();
      const totalAmountCents = lines.reduce(
        (sum, line) => sum + line.unitAmountCents * line.quantity,
        0
      );
      try {
        await createGuestPendingOrder({
          orderId,
          lines,
          clientItems: items,
          totalAmountCents,
        });
      } catch (err: any) {
        console.error('[checkout] Guest order create failed:', err);
        const probe = err?.probe || probeServiceAccountEnv();
        const grpcNotFound =
          err?.code === 5 ||
          err?.code === 'NOT_FOUND' ||
          String(err?.message || '').includes('NOT_FOUND');
        const code =
          err?.code === 'MISSING_FIREBASE_SERVICE_ACCOUNT_KEY'
            ? 'MISSING_FIREBASE_SERVICE_ACCOUNT_KEY'
            : grpcNotFound
              ? 'FIRESTORE_NOT_FOUND'
              : 'GUEST_ORDER_CREATE_FAILED';
        return NextResponse.json(
          {
            error:
              err?.message ||
              'Guest checkout requires FIREBASE_SERVICE_ACCOUNT_KEY in .env.local. Anonymous client auth is disabled for guests.',
            code,
            hint:
              code === 'MISSING_FIREBASE_SERVICE_ACCOUNT_KEY'
                ? 'Sanitize/restart: ensure .env.local has FIREBASE_SERVICE_ACCOUNT_KEY=./secrets/firebase-admin.json (no smart quotes), file exists under repo root, then rm -rf .next && restart next dev.'
                : code === 'FIRESTORE_NOT_FOUND'
                  ? 'Admin credentials loaded but Firestore returned NOT_FOUND. This app uses a named database (firebase-applet-config.json → firestoreDatabaseId). Confirm service-account project_id matches config projectId, and Admin opens that database id (code now does; set FIREBASE_FIRESTORE_DATABASE_ID to override).'
                  : 'See server log “[checkout] Guest Admin probe” and docs/guest-checkout-fix.md.',
            // Safe diagnostics for Network tab (no secret material).
            probe: {
              keyDefined: probe.keyDefined,
              keyFileDefined: probe.keyFileDefined,
              gacDefined: probe.gacDefined,
              rawLength: probe.rawLength,
              looksLikeJson: probe.looksLikeJson,
              looksLikePath: probe.looksLikePath,
              cwd: probe.cwd,
              projectRoot: probe.projectRoot,
              existingPaths: probe.existingPaths,
              triedPaths: probe.triedPaths,
              parseOk: probe.parseOk,
              projectIdPresent: probe.projectIdPresent,
              saProjectId: probe.saProjectId,
              clientProjectId: probe.clientProjectId,
              projectIdMatch: probe.projectIdMatch,
              databaseId: probe.databaseId,
              databaseIdSource: probe.databaseIdSource,
              appletConfigPath: probe.appletConfigPath,
              appletConfigExists: probe.appletConfigExists,
              adminAppName: probe.adminAppName,
              error: probe.error,
            },
          },
          { status: 503 }
        );
      }
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const emailPrefill =
      !isGuestCheckout &&
      typeof customerEmail === 'string' &&
      customerEmail.includes('@')
        ? customerEmail.trim()
        : undefined;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lines.map((line) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: line.title,
            images: line.image ? [line.image] : [],
            metadata: {
              productId: line.productId,
              variantId: String(line.variantId),
            },
          },
          unit_amount: line.unitAmountCents,
        },
        quantity: line.quantity,
      })),
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(orderId)}`,
      // Confirmation UX for cancel lives on success page; bag remains intact (cart cleared only after redirect to Stripe).
      cancel_url: `${baseUrl}/checkout/success?canceled=1`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB'],
      },
      ...(emailPrefill ? { customer_email: emailPrefill } : {}),
      metadata: {
        orderId,
        priceSource: 'printify-server-revalidated',
        stripeMode,
        checkoutMode: isGuestCheckout ? 'guest' : 'authenticated',
      },
    });

    return NextResponse.json({
      url: session.url,
      id: session.id,
      orderId,
      stripeMode,
      revalidated: true,
      checkoutMode: isGuestCheckout ? 'guest' : 'authenticated',
      // Prove to local smoke that guest path never used client Auth.
      guestAuth: isGuestCheckout ? 'server-admin-only' : 'not-applicable',
      checkoutBuild: 'guest-admin-v3',
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
