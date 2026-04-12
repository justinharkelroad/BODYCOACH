'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // Check if user is a coach — redirect to admin
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'coach') {
        router.push('/admin');
        router.refresh();
        return;
      }
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-[12px] p-8 shadow-[var(--theme-shadow-sm)]">
      <form onSubmit={handleEmailLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-3 text-[17px] text-[#1d1d1f] placeholder-[#aeaeb2] transition-all focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-3 text-[17px] text-[#1d1d1f] placeholder-[#aeaeb2] transition-all focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
          />
        </div>

        {error && (
          <p className="text-[14px] text-[#FF3B30]">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0071e3] text-white text-[17px] font-normal py-3 rounded-[8px] hover:bg-[#0077ED] transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[rgba(0,0,0,0.06)]" />
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="px-3 bg-white text-[#86868b]">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white text-[#1d1d1f] text-[17px] font-normal py-3 rounded-[8px] border border-[rgba(0,0,0,0.12)] hover:bg-[#f5f5f7] transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-[14px] text-[#86868b]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#0066cc] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-8">
        <img src="/logos/standard-nutrition.png" alt="Standard Nutrition" className="h-10 w-auto mx-auto" />
        <p className="text-[17px] text-[#86868b] mt-4">Welcome back</p>
      </div>

      <Suspense fallback={
        <div className="bg-white rounded-[12px] p-8 shadow-[var(--theme-shadow-sm)]">
          <div className="animate-pulse space-y-5">
            <div className="h-12 bg-[#f5f5f7] rounded-[8px]" />
            <div className="h-12 bg-[#f5f5f7] rounded-[8px]" />
            <div className="h-12 bg-[#f5f5f7] rounded-[8px]" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </>
  );
}
