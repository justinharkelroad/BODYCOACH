import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, welcome_completed')
          .eq('id', user.id)
          .single();

        // Coaches go to admin
        if (profile?.role === 'coach') {
          return NextResponse.redirect(`${origin}/admin`);
        }

        // New clients who haven't seen the welcome slides
        if (profile && !profile.welcome_completed) {
          return NextResponse.redirect(`${origin}/onboarding/welcome`);
        }
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
