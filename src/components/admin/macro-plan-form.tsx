'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2 } from 'lucide-react';
import type { ClientMacroPlan } from '@/types/database';

interface MacroPlanFormProps {
  clientId: string;
  existingPlan: ClientMacroPlan | null;
}

export function MacroPlanForm({ clientId, existingPlan }: MacroPlanFormProps) {
  const router = useRouter();
  const [calories, setCalories] = useState(existingPlan?.calories?.toString() || '');
  const [protein, setProtein] = useState(existingPlan?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(existingPlan?.carbs?.toString() || '');
  const [fat, setFat] = useState(existingPlan?.fat?.toString() || '');
  const [notes, setNotes] = useState(existingPlan?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!calories || !protein || !carbs || !fat) return;
    setIsSubmitting(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/macros`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calories, protein, carbs, fat, notes: notes || null }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save macro plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="calories"
          label="Calories"
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="2000"
          suffix="kcal"
        />
        <Input
          id="protein"
          label="Protein"
          type="number"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          placeholder="150"
          suffix="g"
        />
        <Input
          id="carbs"
          label="Carbs"
          type="number"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          placeholder="200"
          suffix="g"
        />
        <Input
          id="fat"
          label="Fat"
          type="number"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          placeholder="65"
          suffix="g"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--theme-text)] mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="E.g., higher protein on training days..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-[var(--theme-bg-alt)] border-2 border-transparent focus:outline-none focus:border-[var(--theme-primary)] focus:bg-[var(--theme-surface)] transition-all resize-none text-sm text-[var(--theme-text)]"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!calories || !protein || !carbs || !fat || isSubmitting}
          isLoading={isSubmitting}
        >
          Save Plan
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-[var(--theme-success)]">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
