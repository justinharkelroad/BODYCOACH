'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Camera,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import type { ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/photos', label: 'Photos', icon: Camera },
  { href: '/stats', label: 'Stats', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function V2Sidebar() {
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
      aria-label="Main navigation"
    >
      <div className="px-2 pb-4 pt-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-7 w-auto" />
        </Link>
      </div>

      <nav className="mt-2 flex-1 space-y-1.5" aria-label="Main">
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={<item.icon className="h-5 w-5" aria-hidden="true" />}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
          />
        ))}
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

export function SidebarLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  if (active) {
    return (
      <Link
        href={href}
        aria-current="page"
        className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-4 py-3 text-[14px] font-semibold text-white shadow-md"
      >
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium text-[#1d1d1f] transition hover:bg-white"
    >
      {icon}
      {label}
    </Link>
  );
}
