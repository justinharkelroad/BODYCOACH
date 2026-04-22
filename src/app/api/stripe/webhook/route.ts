import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { sendEmail, purchaseWelcomeEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

// Ambiguity-free alphabet: no 0/O/1/I/L to avoid user confusion over the phone.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateAccessCode(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

function firstNameFrom(full: string | null | undefined): string {
  if (!full) return '';
  return full.trim().split(/\s+/)[0] || '';
}

function parseIdList(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

async function isStandardNutritionCheckout(
  stripe: Stripe,
  sessionId: string,
  allowedPriceIds: Set<string>,
  allowedProductIds: Set<string>
): Promise<boolean> {
  if (allowedPriceIds.size === 0 && allowedProductIds.size === 0) return false;
  const items = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ['data.price.product'],
  });
  for (const item of items.data) {
    const priceId = item.price?.id;
    if (priceId && allowedPriceIds.has(priceId)) return true;
    const product = item.price?.product;
    const productId = typeof product === 'string' ? product : product?.id;
    if (productId && allowedProductIds.has(productId)) return true;
  }
  return false;
}

export async function POST(request: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!stripeSecret || !webhookSecret || !serviceRoleKey || !supabaseUrl) {
    console.error('[Stripe webhook] missing env configuration');
    return new Response('Server not configured', { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(stripeSecret);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('[Stripe webhook] signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    // Acknowledge other events so Stripe doesn't retry them.
    return Response.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const buyerEmail = session.customer_details?.email || session.customer_email;
  const buyerName = session.customer_details?.name || null;

  if (!buyerEmail) {
    console.error('[Stripe webhook] session has no email:', session.id);
    return new Response('Session missing email', { status: 400 });
  }

  const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Idempotency: if this session was already processed, return the existing code.
  const { data: existing } = await admin
    .from('access_codes')
    .select('code')
    .eq('stripe_session_id', session.id)
    .maybeSingle();

  if (existing) {
    return Response.json({ received: true, duplicate: true });
  }

  // Gate on price/product allowlist so non-SN checkouts (e.g. other businesses on the
  // same Stripe account) don't mint SN access codes or trigger the welcome email.
  const allowedPriceIds = parseIdList(process.env.STRIPE_SN_PRICE_IDS);
  const allowedProductIds = parseIdList(process.env.STRIPE_SN_PRODUCT_IDS);
  if (allowedPriceIds.size === 0 && allowedProductIds.size === 0) {
    console.error(
      '[Stripe webhook] STRIPE_SN_PRICE_IDS / STRIPE_SN_PRODUCT_IDS not configured; ignoring session',
      session.id
    );
    return Response.json({ received: true, ignored: 'allowlist-unset' });
  }
  let eligible = false;
  try {
    eligible = await isStandardNutritionCheckout(
      stripe,
      session.id,
      allowedPriceIds,
      allowedProductIds
    );
  } catch (err) {
    console.error('[Stripe webhook] failed to load line items for', session.id, err);
    return Response.json({ received: true, ignored: 'line-items-error' });
  }
  if (!eligible) {
    return Response.json({ received: true, ignored: 'not-standard-nutrition' });
  }

  // Insert — retry up to a few times in the extremely unlikely event of a code collision.
  let insertedCode: string | null = null;
  for (let attempt = 0; attempt < 5 && !insertedCode; attempt++) {
    const candidate = generateAccessCode();
    const { error } = await admin.from('access_codes').insert({
      code: candidate,
      buyer_email: buyerEmail.toLowerCase(),
      buyer_name: buyerName,
      stripe_session_id: session.id,
    });
    if (!error) {
      insertedCode = candidate;
      break;
    }
    if (error.code !== '23505') {
      console.error('[Stripe webhook] insert failed:', error);
      return new Response('Failed to issue access code', { status: 500 });
    }
  }

  if (!insertedCode) {
    return new Response('Failed to generate unique access code', { status: 500 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://standardnutrition.app').replace(/\/$/, '');
  const signupUrl = `${appUrl}/signup?code=${insertedCode}`;

  const template = purchaseWelcomeEmail({
    firstName: firstNameFrom(buyerName),
    accessCode: insertedCode,
    signupUrl,
  });

  const result = await sendEmail({ to: buyerEmail, ...template });
  if (!result.success) {
    console.error('[Stripe webhook] welcome email failed:', result.error);
    // Still return 200 so Stripe doesn't retry — the code is issued, we can resend manually.
  }

  return Response.json({ received: true, code: insertedCode });
}
