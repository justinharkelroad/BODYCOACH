'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isFeatureEnabled } from '@/lib/featureFlags';

interface FoodLogFeedbackProps {
  foodLogId: string;
  initialFeltGood?: boolean | null;
  initialNotes?: string | null;
  onUpdate?: (feltGood: boolean | null, notes: string | null) => void;
  className?: string;
  compact?: boolean;
}

/**
 * Thumbs up/down feedback + optional note for a food log
 */
export function FoodLogFeedback({
  foodLogId,
  initialFeltGood = null,
  initialNotes = null,
  onUpdate,
  className = '',
  compact = false,
}: FoodLogFeedbackProps) {
  const [feltGood, setFeltGood] = useState<boolean | null>(initialFeltGood);
  const [notes, setNotes] = useState(initialNotes || '');
  const [showNotes, setShowNotes] = useState(!!initialNotes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFeedback = useCallback(
    async (newFeltGood: boolean | null, newNotes: string | null) => {
      setIsSubmitting(true);

      try {
        const supabase = createClient();

        const { error } = await supabase
          .from('food_logs')
          .update({
            felt_good: newFeltGood,
            notes: newNotes,
          })
          .eq('id', foodLogId);

        if (error) throw error;

        setFeltGood(newFeltGood);
        if (newNotes !== null) setNotes(newNotes);
        onUpdate?.(newFeltGood, newNotes);
      } catch (err) {
        console.error('Error updating food log feedback:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [foodLogId, onUpdate]
  );

  const handleThumbClick = useCallback(
    (value: boolean) => {
      // Toggle off if clicking the same value
      const newValue = feltGood === value ? null : value;
      updateFeedback(newValue, notes || null);
    },
    [feltGood, notes, updateFeedback]
  );

  const handleNotesBlur = useCallback(() => {
    // Save notes on blur if changed
    const trimmedNotes = notes.trim() || null;
    if (trimmedNotes !== initialNotes) {
      updateFeedback(feltGood, trimmedNotes);
    }
  }, [notes, initialNotes, feltGood, updateFeedback]);

  // Feature flag check - MUST be after all hooks
  if (!isFeatureEnabled('journalNotes')) {
    return null;
  }

  return (
    <div className={className}>
      {/* Thumbs row */}
      <div className={`flex items-center gap-2 ${compact ? '' : 'mb-2'}`}>
        <span className="text-xs text-[var(--theme-text-secondary)] mr-1">
          Feel good?
        </span>
        <button
          type="button"
          onClick={() => handleThumbClick(true)}
          disabled={isSubmitting}
          className={`
            p-1.5 rounded-lg transition-all
            ${feltGood === true
              ? 'bg-green-100 text-green-600 scale-110'
              : 'bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-green-600'
            }
            ${isSubmitting ? 'opacity-50' : ''}
          `}
          aria-label="Felt good"
          aria-pressed={feltGood === true}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleThumbClick(false)}
          disabled={isSubmitting}
          className={`
            p-1.5 rounded-lg transition-all
            ${feltGood === false
              ? 'bg-red-100 text-red-600 scale-110'
              : 'bg-[var(--theme-surface-elevated)] text-[var(--theme-text-muted)] hover:text-red-600'
            }
            ${isSubmitting ? 'opacity-50' : ''}
          `}
          aria-label="Did not feel good"
          aria-pressed={feltGood === false}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
          </svg>
        </button>

        {!compact && !showNotes && (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="ml-auto text-xs text-[var(--theme-primary)] hover:text-[var(--theme-primary-dark)]"
          >
            + Note
          </button>
        )}
      </div>

      {/* Notes input */}
      {showNotes && !compact && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="How did this meal make you feel?"
          disabled={isSubmitting}
          className="
            w-full px-3 py-2 rounded-lg text-sm
            bg-[var(--theme-surface-elevated)]
            border border-[var(--theme-border)]
            text-[var(--theme-text)]
            placeholder:text-[var(--theme-text-muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
            resize-none
          "
          rows={2}
        />
      )}
    </div>
  );
}
