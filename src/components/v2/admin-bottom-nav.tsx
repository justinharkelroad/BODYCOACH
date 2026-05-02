'use client';

import { ClipboardList, MessageCircle, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavItem {
  key: string;
  href: string;
  icon: ReactNode;
  label: string;
  match: string;
}

const items: NavItem[] = [
  {
    key: 'clients',
    href: '/design-preview/admin',
    icon: <Users className="h-5 w-5" />,
    label: 'CLIENTS',
    match: '/design-preview/admin',
  },
  {
    key: 'messages',
    href: '#',
    icon: <MessageCircle className="h-5 w-5" />,
    label: 'Messages',
    match: '/messages',
  },
  {
    key: 'plans',
    href: '#',
    icon: <ClipboardList className="h-5 w-5" />,
    label: 'Plans',
    match: '/plans',
  },
  {
    key: 'settings',
    href: '#',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
    match: '/settings',
  },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-5 lg:hidden">
      <div className="flex items-center gap-3 rounded-full bg-white/80 p-2 shadow-[0_12px_40px_rgba(120,120,180,0.18)] backdrop-blur-xl">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.match);
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
