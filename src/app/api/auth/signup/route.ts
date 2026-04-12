import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import { sendEmail, newSignupNotificationEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

const ADMIN_NOTIFICATION_EMAIL = 'corinahark@gmail.com';

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(`signup:${identifier}`, RATE_LIMITS.auth);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  const expectedCode = process.env.SIGNUP_ACCESS_CODE;
  if (!expectedCode) {
    console.error('[Signup] SIGNUP_ACCESS_CODE is not configured');
    return Response.json({ error: 'Signup is temporarily unavailable' }, { status: 503 });
  }

  const { fullName, email, password, accessCode } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const submittedCode = typeof accessCode === 'string' ? accessCode.trim() : '';
  if (submittedCode !== expectedCode.trim()) {
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
