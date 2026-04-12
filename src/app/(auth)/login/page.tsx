'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const deactivated = searchParams.get('deactivated') === '1';

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

  return (
    <div className="bg-[var(--theme-surface)] rounded-[12px] p-8 shadow-[var(--theme-shadow-sm)]">
      {deactivated && (
        <div className="mb-5 rounded-[8px] border border-[#FFCC00] bg-[#FFF9E6] px-4 py-3 text-[14px] text-[#8B6F00]">
          This account is no longer active. Please contact your coach if you think this is a mistake.
        </div>
      )}
      <form onSubmit={handleEmailLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[17px] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[17px] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
          />
        </div>

        {error && (
          <p className="text-[14px] text-[var(--theme-error)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[var(--theme-primary)] text-white text-[17px] font-normal py-3 rounded-[8px] hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-[14px] text-[var(--theme-text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[var(--theme-primary-dark)] hover:underline">
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
        <p className="text-[17px] text-[var(--theme-text-secondary)] mt-4">Welcome back</p>
      </div>

      <Suspense fallback={
        <div className="bg-[var(--theme-surface)] rounded-[12px] p-8 shadow-[var(--theme-shadow-sm)]">
          <div className="animate-pulse space-y-5">
            <div className="h-12 bg-[var(--theme-bg)] rounded-[8px]" />
            <div className="h-12 bg-[var(--theme-bg)] rounded-[8px]" />
            <div className="h-12 bg-[var(--theme-bg)] rounded-[8px]" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </>
  );
}
