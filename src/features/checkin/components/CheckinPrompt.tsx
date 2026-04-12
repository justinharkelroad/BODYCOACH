'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EnergyMoodSelector } from './EnergyMoodSelector';
import { useSubmitCheckin } from '../hooks/useSubmitCheckin';
import { useShouldShowCheckinPrompt } from '../hooks/useShouldShowCheckinPrompt';
import { ENERGY_OPTIONS, MOOD_OPTIONS, SLEEP_OPTIONS } from '../types';
import type { CheckinLevel } from '../types';

interface CheckinPromptProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

/**
 * Bottom sheet-style modal for daily check-in
 * Shows after first food log of the day if no check-in exists
 */
export function CheckinPrompt({ onComplete, onSkip }: CheckinPromptProps) {
  const { shouldShow, dismiss, refetch } = useShouldShowCheckinPrompt();
  const { submitCheckin, isSubmitting } = useSubmitCheckin();

  // Form state
  const [energyLevel, setEnergyLevel] = useState<CheckinLevel | null>(null);
  const [moodLevel, setMoodLevel] = useState<CheckinLevel | null>(null);
  const [sleepQuality, setSleepQuality] = useState<CheckinLevel | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldShow) {
      // Delay to trigger animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [shouldShow]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      dismiss();
      onSkip?.();
    }, 300);
  }, [dismiss, onSkip]);

  const handleSubmit = useCallback(async () => {
    try {
      await submitCheckin({
        energyLevel,
        moodLevel,
        sleepQuality,
        notes: notes.trim() || null,
      });

      setIsVisible(false);
      setTimeout(() => {
        dismiss();
        refetch();
        onComplete?.();
      }, 300);
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to submit check-in:', error);
    }
  }, [submitCheckin, energyLevel, moodLevel, sleepQuality, notes, dismiss, refetch, onComplete]);

  // Can submit if at least one field is filled
  const canSubmit = energyLevel !== null || moodLevel !== null || sleepQuality !== null;

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-end justify-center
        transition-all duration-300
        ${isVisible ? 'bg-black/50' : 'bg-transparent pointer-events-none'}
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSkip();
      }}
    >
      <div
        className={`
          w-full max-w-lg bg-[var(--theme-background)] rounded-t-3xl p-6
          transform transition-transform duration-300 ease-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--theme-text)]">
              Daily Check-in
            </h2>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">
              How are you feeling today?
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selectors */}
        <div className="space-y-5">
          <EnergyMoodSelector
            label="Energy"
            options={ENERGY_OPTIONS}
            value={energyLevel}
            onChange={setEnergyLevel}
            disabled={isSubmitting}
          />

          <EnergyMoodSelector
            label="Mood"
            options={MOOD_OPTIONS}
            value={moodLevel}
            onChange={setMoodLevel}
            disabled={isSubmitting}
          />

          <EnergyMoodSelector
            label="Sleep Quality"
            options={SLEEP_OPTIONS}
            value={sleepQuality}
            onChange={setSleepQuality}
            disabled={isSubmitting}
          />
        </div>

        {/* Notes toggle */}
        {!showNotes ? (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="mt-4 flex items-center gap-2 text-sm text-[var(--theme-primary)] hover:text-[var(--theme-primary-dark)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a note
          </button>
        ) : (
          <div className="mt-4">
            <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything on your mind..."
              disabled={isSubmitting}
              className="
                w-full px-4 py-3 rounded-xl
                bg-[var(--theme-surface-elevated)]
                border border-[var(--theme-border)]
                text-[var(--theme-text)]
                placeholder:text-[var(--theme-text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]
                resize-none
              "
              rows={3}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1"
            size="md"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            isLoading={isSubmitting}
            className="flex-1"
            size="md"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
