'use client';

import { ClipboardList, LayoutGrid, Wand2, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavItem {
  key: string;
  href: string;
  icon: ReactNode;
  label: string;
}

const items: NavItem[] = [
  { key: 'today', href: '/dashboard-preview', icon: <Zap className="h-5 w-5" />, label: 'TODAY' },
  { key: 'plan', href: '/check-in', icon: <ClipboardList className="h-5 w-5" />, label: 'Plan' },
  { key: 'ai', href: '/coach', icon: <Wand2 className="h-5 w-5" />, label: 'AI' },
  { key: 'menu', href: '/settings', icon: <LayoutGrid className="h-5 w-5" />, label: 'Menu' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-5 lg:hidden">
      <div className="flex items-center gap-3 rounded-full bg-white/80 p-2 shadow-[0_12px_40px_rgba(120,120,180,0.18)] backdrop-blur-xl">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.key === 'today' && pathname.startsWith('/dashboard-preview'));
          if (isActive) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-5 py-2.5 text-white shadow-md"
              >
                {item.icon}
                <span className="text-[13px] font-semibold tracking-wide">{item.label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9E7FF] bg-white text-[#3B9DFF] transition hover:bg-[#F5F9FF]"
              aria-label={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
