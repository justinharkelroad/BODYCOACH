'use client';

import { useState } from 'react';

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

interface CheckinDayPickerProps {
  clientId: string;
  currentDay: number | null;
}

export function CheckinDayPicker({ clientId, currentDay }: CheckinDayPickerProps) {
  const [selected, setSelected] = useState<number | null>(currentDay);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSelect(day: number | null) {
    const newDay = selected === day ? null : day;
    setSelected(newDay);
    setIsSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/checkin-day`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkin_day: newDay }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to update check-in day:', error);
      setSelected(currentDay);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {DAYS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all ${
              selected === value
                ? 'bg-[var(--theme-primary)] text-white'
                : 'bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover-subtle)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[12px] text-[var(--theme-text-secondary)] mt-2">
        {saved
          ? 'Saved!'
          : selected !== null
            ? `Check-in email will send on ${DAYS[selected].label}s`
            : 'No scheduled day — manual send only'
        }
      </p>
    </div>
  );
}
