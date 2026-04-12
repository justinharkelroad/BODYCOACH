'use client';

/**
 * Phase 3: Adaptive Macro Card Component (Web)
 * Shows macro progress with trend information
 */

import { TrendBadge } from './TrendBadge';
import type { MacroTrend } from '../types';

interface AdaptiveMacroCardProps {
  label: string;
  unit: string;
  trend: MacroTrend;
  color: string;
  onClick?: () => void;
}

export function AdaptiveMacroCard({
  label,
  unit,
  trend,
  color,
  onClick,
}: AdaptiveMacroCardProps) {
  const percentage = Math.min(trend.percentageOfTarget, 100);

  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--theme-gradient-card)] rounded-2xl p-4
        border border-[var(--theme-border)]
        shadow-[var(--theme-shadow-sm)]
        ${onClick ? 'cursor-pointer hover:shadow-[var(--theme-shadow-md)] transition-shadow' : ''}
      `}
    >
      {/* Header: Label + Trend Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--theme-text)]">
          {label}
        </span>
        <TrendBadge status={trend.trend} size="sm" />
      </div>

      {/* Current / Target */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-[var(--theme-text)]">
          {trend.current}
          <span className="text-sm font-normal text-[var(--theme-text-muted)] ml-0.5">
            {unit}
          </span>
        </span>
        <span className="text-sm text-[var(--theme-text-muted)]">
          / {trend.target}{unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[var(--theme-divider)] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Yesterday + Week Average */}
      <div className="flex items-center justify-between text-xs text-[var(--theme-text-secondary)]">
        <span>
          Yesterday:{' '}
          <span className="font-medium">
            {trend.yesterday !== null ? `${trend.yesterday}${unit}` : '--'}
          </span>
          {trend.yesterday !== null && trend.yesterday >= trend.target && (
            <span className="text-[var(--theme-success)] ml-1">✓</span>
          )}
        </span>
        <span className="text-[var(--theme-text-muted)]">|</span>
        <span>
          Week avg:{' '}
          <span className="font-medium">
            {trend.weekAverage !== null ? `${trend.weekAverage}${unit}` : '--'}
          </span>
        </span>
      </div>
    </div>
  );
}
