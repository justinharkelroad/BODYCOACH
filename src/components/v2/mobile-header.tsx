'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

interface MobileHeaderProps {
  rightSlot?: React.ReactNode;
  homeHref?: string;
}

export function V2MobileHeader({ rightSlot, homeHref = '/dashboard' }: MobileHeaderProps) {
  return (
    <header
      className="safe-area-top fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-white/70 px-4 backdrop-blur-xl lg:hidden"
      aria-label="Top navigation"
    >
      <Link href={homeHref} className="flex items-center gap-2">
        <Logo className="h-7 w-auto" />
      </Link>
      <div className="flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}
