import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Skip if Supabase env vars aren't set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/coach', '/stats', '/photos', '/workouts', '/settings', '/check-in', '/nutrition', '/admin'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Authoritative role + active-relationship check for every authenticated
  // request. We used to cache role in a `user_role` cookie keyed only on value,
  // which let a stale cookie from a previous coach session grant /admin access
  // to a different user signing in on the same browser. Always hit the DB.
  let isCoach = false;
  if (user) {
    const [profileRes, relationshipsRes] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase.from('coach_clients').select('status').eq('client_id', user.id),
    ]);

    isCoach = profileRes.data?.role === 'coach';
    const hasActive = relationshipsRes.data?.some((r) => r.status === 'active') ?? false;

    if (!isCoach && !hasActive) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.search = '';
      url.searchParams.set('deactivated', '1');
      const redirectResponse = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value);
      });
      redirectResponse.cookies.delete('user_role');
      redirectResponse.cookies.delete('welcome_completed');
      return redirectResponse;
    }
  }

  // Auth routes - redirect to dashboard if already authenticated
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = isCoach ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Coach role check for /admin routes
  if (user && request.nextUrl.pathname.startsWith('/admin') && !isCoach) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Welcome walkthrough check — new clients must complete the info slides
  if (user && isProtectedPath && !request.nextUrl.pathname.startsWith('/onboarding') && !request.nextUrl.pathname.startsWith('/admin')) {
    const welcomeCookie = request.cookies.get('welcome_completed')?.value === '1';

    if (!welcomeCookie) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('welcome_completed')
        .eq('id', user.id)
        .single();

      if (profile && !profile.welcome_completed) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding/welcome';
        return NextResponse.redirect(url);
      }

      if (profile?.welcome_completed) {
        supabaseResponse.cookies.set('welcome_completed', '1', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365,
        });
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
