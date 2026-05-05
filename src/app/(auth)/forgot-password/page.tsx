'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?type=recovery`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSent(true);
    setIsLoading(false);
  }

  return (
    <>
      <div className="text-center mb-8">
        <Logo className="h-10 w-auto mx-auto" />
        <p className="text-[17px] text-[var(--theme-text-secondary)] mt-4">
          Reset your password
        </p>
      </div>

      <div className="bg-[var(--theme-surface)] rounded-[12px] p-8 shadow-[var(--theme-shadow-sm)]">
        {sent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-[8px] border border-[#34C759] bg-[rgba(52,199,89,0.08)] px-4 py-3 text-[14px] text-[var(--theme-success)]">
              Check your inbox. If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
            </div>
            <p className="text-[13px] text-[var(--theme-text-secondary)]">
              The link expires shortly — open it on this device to finish resetting your password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-[14px] text-[var(--theme-text-secondary)]">
              Enter the email associated with your account and we&apos;ll send you a link to set a new password.
            </p>

            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5"
              >
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

            {error && (
              <p className="text-[14px] text-[var(--theme-error)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="v2-cta-btn w-full bg-[var(--theme-primary)] text-white text-[17px] font-normal py-3 rounded-[8px] hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[14px] text-[var(--theme-text-secondary)]">
          <Link href="/login" className="text-[var(--theme-primary-dark)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </>
  );
}
