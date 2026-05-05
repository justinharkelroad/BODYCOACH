'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    // Send through the standard role-based redirect.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      router.push(profile?.role === 'coach' ? '/admin' : '/dashboard');
    } else {
      router.push('/login');
    }
    router.refresh();
  }

  return (
    <>
      <div className="text-center mb-8">
        <Logo className="h-10 w-auto mx-auto" />
        <p className="text-[17px] text-[var(--theme-text-secondary)] mt-4">
          Choose a new password
        </p>
      </div>

      <div className="bg-[var(--theme-surface)] rounded-[12px] p-8 shadow-[var(--theme-shadow-sm)]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[17px] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)]"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
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
            {isLoading ? 'Saving…' : 'Update password'}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-[var(--theme-text-secondary)]">
          <Link href="/login" className="text-[var(--theme-primary-dark)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  );
}
