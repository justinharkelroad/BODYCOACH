'use client';

import {
  Camera,
  CheckCheck,
  LayoutGrid,
  Wand2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavItem {
  key: string;
  href: string;
  icon: ReactNode;
  label: string;
  match: (pathname: string) => boolean;
}

const items: NavItem[] = [
  {
    key: 'today',
    href: '/dashboard',
    icon: <Zap className="h-5 w-5" />,
    label: 'Today',
    match: (p) => p === '/dashboard' || p === '/' || p.startsWith('/dashboard'),
  },
  {
    key: 'checkin',
    href: '/check-in',
    icon: <CheckCheck className="h-5 w-5" />,
    label: 'Check-in',
    match: (p) => p.startsWith('/check-in'),
  },
  {
    key: 'photos',
    href: '/photos',
    icon: <Camera className="h-5 w-5" />,
    label: 'Photos',
    match: (p) => p.startsWith('/photos'),
  },
  {
    key: 'ai',
    href: '/coach',
    icon: <Wand2 className="h-5 w-5" />,
    label: 'AI Coach',
    match: (p) => p.startsWith('/coach'),
  },
  {
    key: 'menu',
    href: '/settings',
    icon: <LayoutGrid className="h-5 w-5" />,
    label: 'Menu',
    match: (p) =>
      p.startsWith('/settings') ||
      p.startsWith('/workouts') ||
      p.startsWith('/stats') ||
      p.startsWith('/nutrition'),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-5 lg:hidden">
      <div className="flex items-center gap-2 rounded-full bg-white/80 p-2 shadow-[0_12px_40px_rgba(120,120,180,0.18)] backdrop-blur-xl">
        {items.map((item) => {
          const isActive = item.match(pathname);
          if (isActive) {
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-label={item.label}
                aria-current="page"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] text-white shadow-md"
              >
                {item.icon}
              </Link>
            );
          }
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-label={item.label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9E7FF] bg-white text-[#3B9DFF] transition hover:bg-[#F5F9FF]"
            >
              {item.icon}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
