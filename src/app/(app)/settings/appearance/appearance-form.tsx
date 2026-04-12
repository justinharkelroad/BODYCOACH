'use client';

import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type ColorSchemePreference } from '@/context/ThemeContext';

const OPTIONS: Array<{
  value: ColorSchemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Always use the light theme.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use the dark theme.',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Match your device setting.',
    icon: Monitor,
  },
];

export function AppearanceForm() {
  const { colorScheme, resolvedColorScheme, setColorScheme } = useTheme();

  return (
    <div className="space-y-3">
      <div className="rounded-[12px] border border-[var(--theme-border)] bg-[var(--theme-surface)] overflow-hidden">
        {OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const isSelected = colorScheme === option.value;
          const isLast = index === OPTIONS.length - 1;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setColorScheme(option.value)}
              aria-pressed={isSelected}
              className={`
                w-full flex items-center gap-4 px-4 py-4 text-left transition-colors
                ${!isLast ? 'border-b border-[var(--theme-divider)]' : ''}
                ${isSelected ? 'bg-[var(--theme-accent-light)]' : 'hover:bg-[var(--theme-bg-alt)]'}
              `}
            >
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-[10px]
                  ${isSelected
                    ? 'bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)]'
                    : 'bg-[var(--theme-bg)] text-[var(--theme-text-secondary)]'
                  }
                `}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-[var(--theme-text)]">
                  {option.label}
                </p>
                <p className="text-[13px] text-[var(--theme-text-secondary)] mt-0.5">
                  {option.description}
                </p>
              </div>
              {isSelected && (
                <Check className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[12px] text-[var(--theme-text-muted)] px-1">
        Currently showing the {resolvedColorScheme} theme.
      </p>
    </div>
  );
}
