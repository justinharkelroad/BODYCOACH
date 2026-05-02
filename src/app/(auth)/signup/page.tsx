'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCode = (searchParams.get('code') || '').trim().toUpperCase();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessCode, setAccessCode] = useState(prefilledCode);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!accessCode.trim()) {
      setError('Access code is required');
      return;
    }

    setIsLoading(true);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, accessCode: accessCode.trim() }),
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(payload?.error || 'Something went wrong. Please try again.');
      setIsLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    router.push('/onboarding/welcome');
    router.refresh();
  }

  return (
    <>
      <div className="text-center mb-8">
        <Logo className="h-10 w-auto mx-auto" />
        <p className="text-[17px] text-[var(--theme-text-secondary)] mt-4">Create your account</p>
      </div>

      <div className="bg-[var(--theme-surface)] rounded-[12px] p-8 shadow-[var(--theme-shadow-sm)]">
        {prefilledCode && (
          <div className="mb-5 rounded-[8px] border border-[var(--theme-success)] bg-[#EBFBEF] px-4 py-3 text-[14px] text-[#1a7a34]">
            Welcome! Your access code has been filled in — just create your login below.
          </div>
        )}
        <form onSubmit={handleEmailSignup} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[17px] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
            />
          </div>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[17px] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[17px] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
            />
          </div>

          <div>
            <label htmlFor="accessCode" className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              Access code
            </label>
            <input
              id="accessCode"
              type="text"
              autoComplete="off"
              placeholder="Provided by your coach"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
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
            className="v2-cta-btn w-full bg-[var(--theme-primary)] text-white text-[17px] font-normal py-3 rounded-[8px] hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-[var(--theme-text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--theme-primary-dark)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="bg-[var(--theme-surface)] rounded-[12px] p-8 shadow-[var(--theme-shadow-sm)]" />}>
      <SignupForm />
    </Suspense>
  );
}
