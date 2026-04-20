'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CoachWeightFormProps {
  clientId: string;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CoachWeightForm({ clientId }: CoachWeightFormProps) {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!weight) return;
    setIsSubmitting(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_lbs: weight, recorded_at: date }),
      });

      if (res.ok) {
        setSaved(true);
        setWeight('');
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to save weight');
      }
    } catch (err) {
      console.error('Failed to save weight:', err);
      setError('Network error — try again');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="coach-weight"
          label="Weight"
          type="number"
          inputMode="decimal"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="185.4"
          suffix="lbs"
        />
        <Input
          id="coach-weight-date"
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={todayIsoDate()}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!weight || isSubmitting}
          isLoading={isSubmitting}
        >
          Save Weight
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--theme-success)]">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        {error && (
          <span className="flex items-center gap-1 text-sm text-[var(--theme-error)]">
            <AlertCircle className="h-4 w-4" /> {error}
          </span>
        )}
      </div>
    </div>
  );
}
