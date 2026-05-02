import type { ReactNode } from 'react';
import { AuroraBackground } from './aurora-background';
import { V2AdminSidebar } from './admin-sidebar';
import { V2MobileHeader } from './mobile-header';
import { AdminBottomNav } from './admin-bottom-nav';

interface AdminShellProps {
  children: ReactNode;
}

/**
 * Coach app shell for the v2 design system.
 */
export function V2AdminShell({ children }: AdminShellProps) {
  return (
    <AuroraBackground>
      <V2AdminSidebar />
      <V2MobileHeader homeHref="/admin" />
      <main className="lg:pl-72 pb-28 pt-[calc(4rem+env(safe-area-inset-top))] lg:pb-8 lg:pt-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <AdminBottomNav />
    </AuroraBackground>
  );
}
