'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/95 p-4 text-[14px] font-semibold text-[#D70015] shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur transition hover:shadow-[0_12px_32px_rgba(120,120,180,0.16)] disabled:opacity-60"
    >
      <LogOut className="h-5 w-5" aria-hidden="true" />
      {isSigningOut ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
