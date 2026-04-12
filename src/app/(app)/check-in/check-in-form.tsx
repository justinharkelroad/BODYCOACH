'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CheckInFormProps {
  lastWeight: number | null;
  weekAgoWeight: number | null;
  pendingCheckInId?: string;
  existingCheckin?: {
    sleep_hours: number | null;
    water_oz: number | null;
    stress_level: number | null;
  } | null;
}

const STRESS_EMOJIS = [
  { value: 1, emoji: '😫', label: 'Very stressed' },
  { value: 2, emoji: '😟', label: 'Stressed' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

const SLEEP_HOURS = Array.from({ length: 10 }, (_, i) => i + 3); // 3 to 12

export function CheckInForm({ lastWeight, weekAgoWeight, pendingCheckInId, existingCheckin }: CheckInFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [weight, setWeight] = useState(lastWeight?.toString() || '');
  const [notes, setNotes] = useState('');
  const [sleepHours, setSleepHours] = useState<number | null>(existingCheckin?.sleep_hours || null);
  const [waterOz, setWaterOz] = useState(existingCheckin?.water_oz?.toString() || '');
  const [stressLevel, setStressLevel] = useState<number | null>(existingCheckin?.stress_level || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWeight = parseFloat(weight) || null;
  const changeFromLast = currentWeight && lastWeight ? currentWeight - lastWeight : null;
  const changeFromWeekAgo = currentWeight && weekAgoWeight ? currentWeight - weekAgoWeight : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // Save weight to body_stats
      if (weight) {
        if (pendingCheckInId) {
          await fetch(`/api/check-ins/${pendingCheckInId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              responses: { weight: parseFloat(weight), notes: notes || null },
            }),
          });
        } else {
          await fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recorded_at: today,
              weight_lbs: parseFloat(weight),
              notes: notes || null,
            }),
          });
        }
      }

      // Save daily check-in data (sleep, water, stress)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
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
      }

      router.refresh();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Weight Input */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Current Weight <span className="font-normal text-[var(--theme-text-muted)]">(optional)</span>
        </label>
        <div className="relative">
          <Input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={lastWeight ? lastWeight.toString() : '0.0'}
            className="text-2xl font-semibold h-14 pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]">
            lbs
          </span>
        </div>
      </div>

      {/* Change Indicators */}
      {currentWeight && (
        <div className="grid grid-cols-2 gap-4">
          {changeFromLast !== null && (
            <div className="p-3 bg-[var(--theme-bg-alt)] rounded-xl">
              <p className="text-xs text-[var(--theme-text-muted)] mb-1">vs. Last</p>
              <div className="flex items-center gap-2">
                {changeFromLast > 0 ? (
                  <TrendingUp className="h-4 w-4 text-[var(--theme-error)]" />
                ) : changeFromLast < 0 ? (
                  <TrendingDown className="h-4 w-4 text-[var(--theme-success)]" />
                ) : (
                  <Minus className="h-4 w-4 text-[var(--theme-text-muted)]" />
                )}
                <span className={`font-medium ${
                  changeFromLast > 0 ? 'text-[var(--theme-error)]' :
                  changeFromLast < 0 ? 'text-[var(--theme-success)]' :
                  'text-[var(--theme-text-muted)]'
                }`}>
                  {changeFromLast > 0 ? '+' : ''}{changeFromLast.toFixed(1)} lbs
                </span>
              </div>
            </div>
          )}
          {changeFromWeekAgo !== null && (
            <div className="p-3 bg-[var(--theme-bg-alt)] rounded-xl">
              <p className="text-xs text-[var(--theme-text-muted)] mb-1">vs. Last Week</p>
              <div className="flex items-center gap-2">
                {changeFromWeekAgo > 0 ? (
                  <TrendingUp className="h-4 w-4 text-[var(--theme-error)]" />
                ) : changeFromWeekAgo < 0 ? (
                  <TrendingDown className="h-4 w-4 text-[var(--theme-success)]" />
                ) : (
                  <Minus className="h-4 w-4 text-[var(--theme-text-muted)]" />
                )}
                <span className={`font-medium ${
                  changeFromWeekAgo > 0 ? 'text-[var(--theme-error)]' :
                  changeFromWeekAgo < 0 ? 'text-[var(--theme-success)]' :
                  'text-[var(--theme-text-muted)]'
                }`}>
                  {changeFromWeekAgo > 0 ? '+' : ''}{changeFromWeekAgo.toFixed(1)} lbs
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sleep Hours */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Hours of Sleep
        </label>
        <div className="flex flex-wrap gap-2">
          {SLEEP_HOURS.map(hours => (
            <button
              key={hours}
              type="button"
              onClick={() => setSleepHours(sleepHours === hours ? null : hours)}
              className={`
                px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${sleepHours === hours
                  ? 'bg-[var(--theme-primary)] text-[var(--theme-text-on-primary)] shadow-md'
                  : 'bg-[var(--theme-bg-alt)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-border)]'
                }
              `}
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>

      {/* Water Intake */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Water Intake
        </label>
        <Input
          type="number"
          value={waterOz}
          onChange={(e) => setWaterOz(e.target.value)}
          placeholder="0"
          suffix="oz"
        />
      </div>

      {/* Stress Level */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          How are you feeling?
        </label>
        <div className="flex justify-between gap-2">
          {STRESS_EMOJIS.map(({ value, emoji, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStressLevel(stressLevel === value ? null : value)}
              aria-label={label}
              aria-pressed={stressLevel === value}
              className={`
                flex-1 py-3 rounded-xl text-2xl transition-all
                ${stressLevel === value
                  ? 'bg-[var(--theme-primary)] shadow-md scale-110'
                  : 'bg-[var(--theme-bg-alt)] hover:bg-[var(--theme-border)]'
                }
              `}
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

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling today?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-[var(--theme-bg-alt)] border-2 border-transparent focus:outline-none focus:border-[var(--theme-primary)] focus:bg-[var(--theme-surface)] transition-all resize-none text-[var(--theme-text)]"
        />
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Check-in'
        )}
      </Button>
    </form>
  );
}
