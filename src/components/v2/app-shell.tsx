import type { ReactNode } from 'react';
import { AuroraBackground } from './aurora-background';
import { V2Sidebar } from './sidebar';
import { V2MobileHeader } from './mobile-header';
import { BottomNav } from './bottom-nav';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Client-side app shell for the v2 design system.
 *  - Aurora gradient background
 *  - Desktop: floating left sidebar
 *  - Mobile: top header + floating bottom nav capsule
 */
export function V2AppShell({ children }: AppShellProps) {
  return (
    <AuroraBackground>
      <V2Sidebar />
      <V2MobileHeader />
      <main className="lg:pl-72 pb-28 pt-[calc(4rem+env(safe-area-inset-top))] lg:pb-8 lg:pt-6">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <BottomNav />
    </AuroraBackground>
  );
}
