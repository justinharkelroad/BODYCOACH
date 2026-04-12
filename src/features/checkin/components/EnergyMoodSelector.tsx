'use client';

import { useCallback } from 'react';
import type { CheckinLevel, CheckinOption } from '../types';

interface EmojiButtonProps {
  option: CheckinOption;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function EmojiButton({ option, isSelected, onClick, disabled }: EmojiButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
        ${isSelected
          ? 'bg-[var(--theme-primary)] scale-110 shadow-lg'
          : 'bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-surface-hover)]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2
      `}
      aria-label={`${option.label} (${option.value} out of 4)`}
      aria-pressed={isSelected}
    >
      <span className="text-2xl">{option.emoji}</span>
      <span className={`text-xs font-medium ${
        isSelected ? 'text-[var(--theme-text-on-primary)]' : 'text-[var(--theme-text-secondary)]'
      }`}>
        {option.label}
      </span>
    </button>
  );
}

interface EnergyMoodSelectorProps {
  label: string;
  options: CheckinOption[];
  value: CheckinLevel | null;
  onChange: (value: CheckinLevel | null) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A row of emoji buttons for selecting energy, mood, or sleep level
 */
export function EnergyMoodSelector({
  label,
  options,
  value,
  onChange,
  disabled = false,
  className = '',
}: EnergyMoodSelectorProps) {
  const handleSelect = useCallback(
    (optionValue: CheckinLevel) => {
      // If clicking the already selected value, deselect it
      if (value === optionValue) {
        onChange(null);
      } else {
        onChange(optionValue);
      }
    },
    [value, onChange]
  );

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
        {label}
      </label>
      <div className="flex gap-2 justify-between">
        {options.map((option) => (
          <EmojiButton
            key={option.value}
            option={option}
            isSelected={value === option.value}
            onClick={() => handleSelect(option.value)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
