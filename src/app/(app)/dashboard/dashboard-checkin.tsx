'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Moon, Scale } from 'lucide-react';
import type { DailyCheckin } from '@/types/database';

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
      const today = new Date().toISOString().split('T')[0];
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
      <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Daily Check-in</h2>

      <Card>
        <CardContent className="p-5 space-y-5">
          {/* Weight — optional */}
          <div>
            <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
              Weight <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={lastWeight ? `${lastWeight}` : '0.0'}
                className="block w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-3 text-[21px] font-semibold text-[#1d1d1f] placeholder-[#aeaeb2] transition-all focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)] pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#86868b]">lbs</span>
            </div>
          </div>

          {/* How are you feeling? */}
          <div>
            <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
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
                      ? 'bg-[#0071e3] shadow-md scale-110'
                      : 'bg-[#f5f5f7] hover:bg-[rgba(0,0,0,0.06)]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 px-1">
              <span className="text-[10px] text-[#aeaeb2]">Stressed</span>
              <span className="text-[10px] text-[#aeaeb2]">Great</span>
            </div>
          </div>

          {/* Water */}
          <div>
            <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
              Water intake
            </label>
            <div className="relative">
              <input
                type="number"
                value={waterOz}
                onChange={(e) => setWaterOz(e.target.value)}
                placeholder="0"
                className="block w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-3 text-[17px] text-[#1d1d1f] placeholder-[#aeaeb2] transition-all focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)] pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#86868b]">oz</span>
            </div>
          </div>

          {/* Sleep */}
          <div>
            <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
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
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-[rgba(0,0,0,0.06)]'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5">
              Notes <span className="font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today?"
              rows={2}
              className="block w-full rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-3 text-[17px] text-[#1d1d1f] placeholder-[#aeaeb2] transition-all focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[rgba(0,113,227,0.2)] resize-none"
            />
          </div>

          {/* Save feedback */}
          {saved && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-[8px] bg-[rgba(52,199,89,0.08)] text-[#34C759] text-[14px] font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Check-in saved
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasInput}
            className="w-full py-3 rounded-[8px] text-[17px] font-normal text-white bg-[#0071e3] hover:bg-[#0077ED] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Check-in'}
          </button>
        </CardContent>
      </Card>

      {/* History */}
      {recentHistory.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-[14px] font-semibold text-[#1d1d1f] mb-3">Recent Check-ins</h3>
            <div className="space-y-3">
              {recentHistory.map(entry => (
                <div key={entry.date} className="flex items-start gap-3 py-2.5 border-b border-[rgba(0,0,0,0.05)] last:border-0">
                  <div className="text-[14px] font-medium text-[#1d1d1f] min-w-[60px]">
                    {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-3 text-[14px] text-[#6e6e73]">
                      {entry.weight_lbs && (
                        <span className="flex items-center gap-1 font-medium text-[#1d1d1f]">
                          <Scale className="h-3.5 w-3.5 text-[#0071e3]" />
                          {entry.weight_lbs} lbs
                        </span>
                      )}
                      {entry.stress_level && (
                        <span>{stressEmojis[entry.stress_level]}</span>
                      )}
                      {entry.water_oz && (
                        <span className="flex items-center gap-1">
                          <Droplets className="h-3.5 w-3.5 text-[#5AC8FA]" />
                          {entry.water_oz}oz
                        </span>
                      )}
                      {entry.sleep_hours && (
                        <span className="flex items-center gap-1">
                          <Moon className="h-3.5 w-3.5 text-[#86868b]" />
                          {entry.sleep_hours}h
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-[12px] text-[#86868b] mt-1 italic">{entry.notes}</p>
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
