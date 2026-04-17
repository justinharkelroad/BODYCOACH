'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Moon, Scale } from 'lucide-react';
import type { DailyCheckin } from '@/types/database';
import { getLocalDateString } from '@/lib/date';

interface HistoryEntry {
  date: string;
  weight_lbs: number | null;
  sleep_hours: number | null;
  water_oz: number | null;
  stress_level: number | null;
  notes: string | null;
}

const STRESS_EMOJIS = [
  { value: 1, emoji: '😫', label: 'Very stressed' },
  { value: 2, emoji: '😟', label: 'Stressed' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

const SLEEP_HOURS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

interface DashboardCheckInProps {
  todayCheckin: DailyCheckin | null;
  recentHistory: HistoryEntry[];
  lastWeight: number | null;
}

export function DashboardCheckIn({ recentHistory, lastWeight }: DashboardCheckInProps) {
  const router = useRouter();
  const supabase = createClient();

  const [weight, setWeight] = useState('');
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [waterOz, setWaterOz] = useState('');
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      const today = getLocalDateString();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save weight to body_stats if provided
      if (weight) {
        await fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recorded_at: today,
            weight_lbs: parseFloat(weight),
          }),
        });
      }

      // Save daily check-in
      await supabase
        .from('daily_checkins')
        .upsert({
          user_id: user.id,
          date: today,
          sleep_hours: sleepHours,
          water_oz: waterOz ? parseInt(waterOz) : null,
          stress_level: stressLevel,
          notes: notes || null,
        }, { onConflict: 'user_id,date' });

      // Clear the form
      setWeight('');
      setSleepHours(null);
      setWaterOz('');
      setStressLevel(null);
      setNotes('');

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
      router.refresh();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const stressEmojis: Record<number, string> = { 1: '😫', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
  const hasInput = weight || sleepHours || waterOz || stressLevel || notes;

  return (
    <section className="space-y-4">
      <h2 className="text-[17px] font-semibold text-[var(--theme-text)]">Daily Check-in</h2>

      <Card>
        <CardContent className="p-5 space-y-5">
          {/* Weight — optional */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              Weight <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={lastWeight ? `${lastWeight}` : '0.0'}
                className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[21px] font-semibold text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)] pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[var(--theme-text-secondary)]">lbs</span>
            </div>
          </div>

          {/* How are you feeling? */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              How are you feeling?
            </label>
            <div className="flex justify-between gap-2">
              {STRESS_EMOJIS.map(({ value, emoji, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStressLevel(stressLevel === value ? null : value)}
                  aria-label={label}
                  className={`flex-1 py-3 rounded-[8px] text-2xl transition-all ${
                    stressLevel === value
                      ? 'bg-[var(--theme-primary)] shadow-md scale-110'
                      : 'bg-[var(--theme-bg)] hover:bg-[var(--theme-hover-subtle)]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 px-1">
              <span className="text-[10px] text-[var(--theme-text-muted)]">Stressed</span>
              <span className="text-[10px] text-[var(--theme-text-muted)]">Great</span>
            </div>
          </div>

          {/* Water */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              Water intake
            </label>
            <div className="relative">
              <input
                type="number"
                value={waterOz}
                onChange={(e) => setWaterOz(e.target.value)}
                placeholder="0"
                className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[17px] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)] pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[var(--theme-text-secondary)]">oz</span>
            </div>
          </div>

          {/* Sleep */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              Hours of sleep
            </label>
            <div className="flex flex-wrap gap-2">
              {SLEEP_HOURS.map(hours => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setSleepHours(sleepHours === hours ? null : hours)}
                  className={`px-3 py-2 rounded-[8px] text-[14px] font-medium transition-all ${
                    sleepHours === hours
                      ? 'bg-[var(--theme-primary)] text-white'
                      : 'bg-[var(--theme-bg)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-hover-subtle)]'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              Notes <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today?"
              rows={2}
              className="block w-full rounded-[8px] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-[17px] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all focus:outline-none focus:border-[var(--theme-primary)] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)] resize-none"
            />
          </div>

          {/* Save feedback */}
          {saved && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-[8px] bg-[rgba(52,199,89,0.08)] text-[var(--theme-success)] text-[14px] font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Check-in saved
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasInput}
            className="w-full py-3 rounded-[8px] text-[17px] font-normal text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Check-in'}
          </button>
        </CardContent>
      </Card>

      {/* History */}
      {recentHistory.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-[14px] font-semibold text-[var(--theme-text)] mb-3">Recent Check-ins</h3>
            <div className="space-y-3">
              {recentHistory.map(entry => (
                <div key={entry.date} className="flex items-start gap-3 py-2.5 border-b border-[var(--theme-divider)] last:border-0">
                  <div className="text-[14px] font-medium text-[var(--theme-text)] min-w-[60px]">
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-3 text-[14px] text-[var(--theme-text-secondary)]">
                      {entry.weight_lbs && (
                        <span className="flex items-center gap-1 font-medium text-[var(--theme-text)]">
                          <Scale className="h-3.5 w-3.5 text-[var(--theme-primary)]" />
                          {entry.weight_lbs} lbs
                        </span>
                      )}
                      {entry.stress_level && (
                        <span>{stressEmojis[entry.stress_level]}</span>
                      )}
                      {entry.water_oz && (
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3.5 w-3.5 text-[var(--theme-info)]" />
                          {entry.water_oz}oz
                        </span>
                      )}
                      {entry.sleep_hours && (
                        <span className="flex items-center gap-1">
                          <Moon className="h-3.5 w-3.5 text-[var(--theme-text-secondary)]" />
                          {entry.sleep_hours}h
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-[12px] text-[var(--theme-text-secondary)] mt-1 italic">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
