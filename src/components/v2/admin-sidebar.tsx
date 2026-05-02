'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Settings, Users } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { SidebarLink } from './sidebar';

const navItems = [
  { href: '/admin', label: 'Clients', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function V2AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside
      className="fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-64 flex-col rounded-3xl bg-white/85 p-4 shadow-[0_12px_40px_rgba(120,120,180,0.14)] backdrop-blur-xl lg:flex"
      aria-label="Coach navigation"
    >
      <div className="px-2 pb-2 pt-2">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo className="h-7 w-auto" />
        </Link>
        <div className="mt-2 inline-block rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          Coach Mode
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1.5" aria-label="Coach main">
        {navItems.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<item.icon className="h-5 w-5" aria-hidden="true" />}
              active={active}
            />
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium text-[#6e6e73] transition hover:bg-white"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Sign out
      </button>
    </aside>
  );
}
