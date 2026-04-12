'use client';

/**
 * Phase 3: AI Suggestion Banner Component (Web)
 * Shows contextual tips, encouragement, or warnings
 */

import { X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { AISuggestion } from '../types';

interface AISuggestionBannerProps {
  suggestion: AISuggestion;
  onDismiss?: () => void;
}

const typeStyles = {
  tip: {
    bg: 'bg-[var(--theme-info)]/10',
    border: 'border-[var(--theme-info)]/30',
    iconBg: 'bg-[var(--theme-info)]/20',
  },
  encouragement: {
    bg: 'bg-[var(--theme-success)]/10',
    border: 'border-[var(--theme-success)]/30',
    iconBg: 'bg-[var(--theme-success)]/20',
  },
  warning: {
    bg: 'bg-[var(--theme-warning)]/10',
    border: 'border-[var(--theme-warning)]/30',
    iconBg: 'bg-[var(--theme-warning)]/20',
  },
};

export function AISuggestionBanner({ suggestion, onDismiss }: AISuggestionBannerProps) {
  const styles = typeStyles[suggestion.type];

  return (
    <div
      className={`
        relative rounded-2xl p-4 border
        ${styles.bg} ${styles.border}
      `}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} className="text-[var(--theme-text-muted)]" />
        </button>
      )}

      <div className="flex items-start gap-3 pr-6">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
            ${styles.iconBg}
          `}
        >
          <span className="text-xl">{suggestion.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--theme-text)] leading-relaxed">
            {suggestion.message}
          </p>

          {/* Action button */}
          {suggestion.action && (
            <Link
              href={suggestion.action.href}
              className="
                inline-flex items-center gap-1 mt-2
                text-sm font-medium text-[var(--theme-primary)]
                hover:text-[var(--theme-primary-dark)] transition-colors
              "
            >
              {suggestion.action.label}
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
