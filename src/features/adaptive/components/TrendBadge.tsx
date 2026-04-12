'use client';

/**
 * Phase 3: Trend Badge Component (Web)
 * Shows trend status as a pill badge
 */

import { Check, ArrowUp, ArrowDown } from 'lucide-react';
import type { TrendStatus } from '../types';

interface TrendBadgeProps {
  status: TrendStatus;
  size?: 'sm' | 'md';
}

const statusConfig = {
  on_track: {
    label: 'On Track',
    icon: Check,
    bgColor: 'bg-[var(--theme-success)]/15',
    textColor: 'text-[var(--theme-success)]',
    borderColor: 'border-[var(--theme-success)]/30',
  },
  above: {
    label: 'Above',
    icon: ArrowUp,
    bgColor: 'bg-[var(--theme-warning)]/15',
    textColor: 'text-[var(--theme-warning)]',
    borderColor: 'border-[var(--theme-warning)]/30',
  },
  below: {
    label: 'Below',
    icon: ArrowDown,
    bgColor: 'bg-[var(--theme-info)]/15',
    textColor: 'text-[var(--theme-info)]',
    borderColor: 'border-[var(--theme-info)]/30',
  },
};

export function TrendBadge({ status, size = 'md' }: TrendBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
  };

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses[size]}
      `}
    >
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
}
