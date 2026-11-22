import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';
import { resolvePrintifyShopId } from '@/lib/printify-shop';
import { shouldSkipWebhookFulfillment } from '@/lib/webhook-order-guard';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia',
    });
  }
  return stripeClient;
}

const printifyAPI = 'https://api.printify.com/v1';

async function getPrintifyShopId(token: string) {
  return resolvePrintifyShopId(token);
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable.');
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const orderId = session.metadata?.orderId;
    if (!orderId) {
        console.error('No orderId found in session metadata');
        return NextResponse.json({ error: 'No orderId in metadata' }, { status: 400 });
    }

    try {
        // Same Admin + named Firestore DB as guest checkout writes to.
        const adminDb = getAdminDb();
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();
        
        if (!orderSnap.exists) {
            console.error(`Order ${orderId} not found in database`);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        
        const orderData = orderSnap.data();

        // Prevent duplicate processing / Stripe retries (idempotent).
        const skip = shouldSkipWebhookFulfillment(orderData, event.id);
        if (skip.skip) {
            console.log(
              `Order ${orderId} already processed (${skip.reason}); skipping Printify re-send.`
            );
            return NextResponse.json({ received: true, skipped: skip.reason });
        }

        const customer = session.customer_details;
        if (!customer || !customer.address || !customer.name) {
             throw new Error('Missing customer address details from Stripe session');
        }

        const printifyToken = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_API_KEY;
        if (!printifyToken) {
             throw new Error('PRINTIFY_API_TOKEN not configured');
        }

        const shopId = await getPrintifyShopId(printifyToken);

        const nameParts = customer.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Prepare Line Items
        const lineItems = orderData?.items?.map((itemStr: string) => {
             const item = typeof itemStr === 'string' ? JSON.parse(itemStr) : itemStr;
             return {
                 product_id: item.product.id,
                 variant_id: item.variant.id,
                 quantity: item.quantity,
             };
        }) || [];

        // Create Printify Order Payload
        const printifyPayload = {
             external_id: orderId,
             label: `Order ${orderId}`,
             line_items: lineItems,
             shipping_method: 1, // 1 for Standard, 2 for Express
             send_shipping_notification: false,
             address_to: {
                 first_name: firstName || 'Customer',
                 last_name: lastName || 'Name',
                 email: customer.email || orderData?.email || 'guest@example.com',
                 phone: customer.phone || '0000000000',
                 country: customer.address.country,
                 region: customer.address.state || '',
                 address1: customer.address.line1,
                 address2: customer.address.line2 || '',
                 city: customer.address.city,
                 zip: customer.address.postal_code,
             }
        };

        // Send to Printify
        const printifyRes = await fetch(`${printifyAPI}/shops/${shopId}/orders.json`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 Authorization: `Bearer ${printifyToken}`,
             },
             body: JSON.stringify(printifyPayload),
        });

        if (!printifyRes.ok) {
             const errorText = await printifyRes.text();
             console.error("Printify order submission failed:", errorText);
             throw new Error(`Printify Error: ${errorText}`);
        }

        const printifyOrderData = await printifyRes.json();
        
        // Update Firestore order (record Stripe event id for replay defense).
        const priorEventIds = Array.isArray(orderData?.stripeEventIds)
          ? orderData.stripeEventIds.filter((id: unknown) => typeof id === 'string')
          : [];
        await orderRef.update({
            status: 'paid',
            printifyOrderId: printifyOrderData.id,
            shippingInfo: JSON.stringify(customer),
            completedAt: new Date().toISOString(),
            stripeEventIds: [...priorEventIds, event.id].slice(-32),
        });
        
        console.log(`Successfully processed webhook for order ${orderId} and sent to Printify (${printifyOrderData.id})`);

    } catch (error: any) {
        console.error('Webhook processing error:', error);
        // We still return 200 to Stripe so it doesn't keep retrying if it's an internal Printify error that needs manual fixing
        // But for network errors retrieving the DB, returning a 500 might be appropriate for retries
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
