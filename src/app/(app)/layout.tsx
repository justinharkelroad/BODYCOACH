export const dynamic = 'force-dynamic';

import { Sidebar } from '@/components/layout/sidebar';
import { MilestoneCelebrationWrapper } from '@/features/milestones';
import { CheckinPrompt } from '@/features/checkin';
import { TimezoneSync } from '@/components/timezone-sync';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MilestoneCelebrationWrapper>
      <div className="min-h-screen bg-[var(--neutral-off-white)]">
        <Sidebar />
        {/* Main content - responsive padding for sidebar and mobile nav */}
        <main className="lg:pl-72 pt-[calc(4rem+env(safe-area-inset-top))] pb-20 lg:pt-0 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-10">
            {children}
          </div>
        </main>
      </div>
      {/* Daily mood/energy check-in prompt - shows after first food log */}
      <CheckinPrompt />
      {/* Keep profiles.timezone in sync with browser timezone */}
      <TimezoneSync />
    </MilestoneCelebrationWrapper>
  );
}
