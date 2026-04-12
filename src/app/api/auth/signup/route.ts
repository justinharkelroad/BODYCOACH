import { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import { sendEmail, newSignupNotificationEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

const ADMIN_NOTIFICATION_EMAIL = 'corinahark@gmail.com';

type PurchaseCode = { id: string; code: string };

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(`signup:${identifier}`, RATE_LIMITS.auth);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  const sharedCode = process.env.SIGNUP_ACCESS_CODE?.trim() || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const { fullName, email, password, accessCode } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const submittedCode = typeof accessCode === 'string' ? accessCode.trim() : '';
  if (!submittedCode) {
    return Response.json({ error: 'Access code is required' }, { status: 400 });
  }

  // Two accepted forms: the shared SIGNUP_ACCESS_CODE (for direct invites) or a
  // per-purchase code from the access_codes table.
  let purchaseCode: PurchaseCode | null = null;
  const matchesShared = sharedCode.length > 0 && submittedCode.toLowerCase() === sharedCode.toLowerCase();

  if (!matchesShared) {
    if (!serviceRoleKey || !supabaseUrl) {
      console.error('[Signup] Service role key not configured; cannot validate purchase codes');
      return Response.json({ error: 'Invalid access code' }, { status: 403 });
    }
    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data } = await admin
      .from('access_codes')
      .select('id, code, used_at')
      .eq('code', submittedCode.toUpperCase())
      .maybeSingle();
    if (!data) {
      return Response.json({ error: 'Invalid access code' }, { status: 403 });
    }
    if (data.used_at) {
      return Response.json({ error: 'This access code has already been used.' }, { status: 409 });
    }
    purchaseCode = { id: data.id, code: data.code };
  }

  if (!matchesShared && !purchaseCode) {
    return Response.json({ error: 'Invalid access code' }, { status: 403 });
  }

  const supabase = await createClient();

  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
  const emailRedirectTo = `${origin}/api/auth/callback?redirectTo=/onboarding/welcome`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo,
    },
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Supabase returns a stub user with an empty identities array when the email
  // already exists (anti-enumeration). Reject so we don't silently upsert old data.
  const identities = data.user?.identities;
  if (!data.user || !identities || identities.length === 0) {
    return Response.json(
      { error: 'An account with this email already exists. Try signing in instead.' },
      { status: 409 }
    );
  }

  if (fullName) {
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id);
  }

  if (purchaseCode && serviceRoleKey && supabaseUrl) {
    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await admin
      .from('access_codes')
      .update({ used_at: new Date().toISOString(), used_by: data.user.id })
      .eq('id', purchaseCode.id)
      .is('used_at', null);
  }

  const template = newSignupNotificationEmail({
    fullName: fullName || '',
    email,
    signedUpAt: new Date(),
  });
  sendEmail({ to: ADMIN_NOTIFICATION_EMAIL, ...template }).catch((err) => {
    console.error('[Signup] Admin notification failed:', err);
  });

  return Response.json({ success: true, hasSession: Boolean(data.session) });
}
