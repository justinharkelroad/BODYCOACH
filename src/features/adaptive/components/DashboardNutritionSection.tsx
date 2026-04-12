'use client';

/**
 * Phase 3: Dashboard Nutrition Section Wrapper
 * Conditionally renders adaptive or static nutrition section based on feature flag
 * Phase 5: Wrapped with guidance tooltip for first-time users
 */

import { isFeatureEnabled } from '@/lib/featureFlags';
import { AdaptiveNutritionSection } from './AdaptiveNutritionSection';
import { StaticNutritionSection, type StaticNutritionSectionProps } from './StaticNutritionSection';
import { GuidanceTooltipWrapper } from '@/features/guidance';

interface DashboardNutritionSectionProps extends StaticNutritionSectionProps {}

export function DashboardNutritionSection(props: DashboardNutritionSectionProps) {
  // Determine which section to render
  const content = isFeatureEnabled('adaptiveTargets') ? (
    <AdaptiveNutritionSection />
  ) : (
    <StaticNutritionSection {...props} />
  );

  // Phase 5: Wrap with guidance tooltip for first-time users
  if (isFeatureEnabled('guidanceGifs')) {
    return (
      <GuidanceTooltipWrapper
        gifKey="quickLog"
        title="Quick tip: Log your meals"
        description="Tap here to search foods, scan barcodes, or log from your favorites list."
        delay={1000}
      >
        {content}
      </GuidanceTooltipWrapper>
    );
  }

  return content;
}
