'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StatsFormProps {
  userId: string;
  existingStatId?: string;
  defaultValues?: {
    weight_lbs?: number | null;
    body_fat_pct?: number | null;
    chest_in?: number | null;
    waist_in?: number | null;
    hips_in?: number | null;
    left_arm_in?: number | null;
    right_arm_in?: number | null;
    left_thigh_in?: number | null;
    right_thigh_in?: number | null;
    notes?: string | null;
  };
}

export function StatsForm({ userId, existingStatId, defaultValues }: StatsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);

  const [weight, setWeight] = useState(defaultValues?.weight_lbs?.toString() || '');
  const [bodyFat, setBodyFat] = useState(defaultValues?.body_fat_pct?.toString() || '');
  const [chest, setChest] = useState(defaultValues?.chest_in?.toString() || '');
  const [waist, setWaist] = useState(defaultValues?.waist_in?.toString() || '');
  const [hips, setHips] = useState(defaultValues?.hips_in?.toString() || '');
  const [leftArm, setLeftArm] = useState(defaultValues?.left_arm_in?.toString() || '');
  const [rightArm, setRightArm] = useState(defaultValues?.right_arm_in?.toString() || '');
  const [leftThigh, setLeftThigh] = useState(defaultValues?.left_thigh_in?.toString() || '');
  const [rightThigh, setRightThigh] = useState(defaultValues?.right_thigh_in?.toString() || '');
  const [notes, setNotes] = useState(defaultValues?.notes || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const data = {
      user_id: userId,
      weight_lbs: weight ? parseFloat(weight) : null,
      body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
      chest_in: chest ? parseFloat(chest) : null,
      waist_in: waist ? parseFloat(waist) : null,
      hips_in: hips ? parseFloat(hips) : null,
      left_arm_in: leftArm ? parseFloat(leftArm) : null,
      right_arm_in: rightArm ? parseFloat(rightArm) : null,
      left_thigh_in: leftThigh ? parseFloat(leftThigh) : null,
      right_thigh_in: rightThigh ? parseFloat(rightThigh) : null,
      notes: notes || null,
    };

    let result;

    if (existingStatId) {
      // Update existing stat
      result = await supabase
        .from('body_stats')
        .update(data)
        .eq('id', existingStatId);
    } else {
      // Insert new stat
      result = await supabase.from('body_stats').insert(data);
    }

    if (result.error) {
      // Handle unique constraint violation (already logged today)
      if (result.error.code === '23505') {
        setError('You already logged stats for today. Edit your existing entry instead.');
      } else {
        setError(result.error.message);
      }
      setIsLoading(false);
      return;
    }

    router.refresh();

    // Reset form if it was an insert
    if (!existingStatId) {
      setWeight('');
      setBodyFat('');
      setChest('');
      setWaist('');
      setHips('');
      setLeftArm('');
      setRightArm('');
      setLeftThigh('');
      setRightThigh('');
      setNotes('');
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[var(--neutral-dark)]">{existingStatId ? 'Edit' : 'Log'} Today&apos;s Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="weight"
              type="number"
              step="0.1"
              label="Weight (lbs)"
              placeholder="175.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Input
              id="bodyFat"
              type="number"
              step="0.1"
              label="Body Fat %"
              placeholder="15.0"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowMeasurements(!showMeasurements)}
            className="flex items-center gap-2 text-sm text-[var(--primary-deep)] hover:text-[var(--primary-lavender)] font-medium transition-colors"
          >
            {showMeasurements ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Body Measurements
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Add Body Measurements
              </>
            )}
          </button>

          {showMeasurements && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  label="Chest (in)"
                  placeholder="42"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                />
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  label="Waist (in)"
                  placeholder="32"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                />
                <Input
                  id="hips"
                  type="number"
                  step="0.1"
                  label="Hips (in)"
                  placeholder="38"
                  value={hips}
                  onChange={(e) => setHips(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="leftArm"
                  type="number"
                  step="0.1"
                  label="Left Arm (in)"
                  placeholder="14"
                  value={leftArm}
                  onChange={(e) => setLeftArm(e.target.value)}
                />
                <Input
                  id="rightArm"
                  type="number"
                  step="0.1"
                  label="Right Arm (in)"
                  placeholder="14"
                  value={rightArm}
                  onChange={(e) => setRightArm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="leftThigh"
                  type="number"
                  step="0.1"
                  label="Left Thigh (in)"
                  placeholder="23"
                  value={leftThigh}
                  onChange={(e) => setLeftThigh(e.target.value)}
                />
                <Input
                  id="rightThigh"
                  type="number"
                  step="0.1"
                  label="Right Thigh (in)"
                  placeholder="23"
                  value={rightThigh}
                  onChange={(e) => setRightThigh(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-[var(--neutral-dark)] mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={2}
              className="block w-full rounded-[12px] border border-[rgba(184,169,232,0.3)] px-4 py-3 text-[var(--neutral-dark)] placeholder-[var(--neutral-gray)] bg-[var(--theme-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-lavender)] focus:border-transparent transition-all"
              placeholder="How are you feeling today?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--error)]">{error}</p>
          )}

          {saved && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-[8px] bg-[rgba(52,199,89,0.08)] text-[var(--theme-success)] text-[14px] font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Saved successfully
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {existingStatId ? 'Update Stats' : 'Log Stats'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
