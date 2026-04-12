'use client';

import { isFeatureEnabled } from '@/lib/featureFlags';
import { useMilestoneCelebration } from '../hooks/useMilestones';
import { MilestoneCelebration } from './MilestoneCelebration';

interface MilestoneCelebrationWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides milestone celebrations app-wide
 * Add this to your app layout to show celebrations when milestones are earned
 */
export function MilestoneCelebrationWrapper({ children }: MilestoneCelebrationWrapperProps) {
  const { currentCelebration, dismissCelebration, isLoading } =
    useMilestoneCelebration();

  if (!isFeatureEnabled('milestones')) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {!isLoading && currentCelebration && (
        <MilestoneCelebration
          milestone={currentCelebration}
          visible={true}
          onDismiss={dismissCelebration}
        />
      )}
    </>
  );
}
