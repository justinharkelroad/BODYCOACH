'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface TemplateExerciseEntry {
  id: string;
  exercise_name: string;
  sets: string;
  reps: string;
  target_weight_lbs: string;
  notes: string;
}

interface TemplateFormProps {
  mode: 'create' | 'edit';
  templateId?: string;
  initialName?: string;
  initialNotes?: string;
  initialExercises?: TemplateExerciseEntry[];
}

function emptyExercise(): TemplateExerciseEntry {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Date.now().toString() + Math.random(),
    exercise_name: '',
    sets: '',
    reps: '',
    target_weight_lbs: '',
    notes: '',
  };
}

export function TemplateForm({
  mode,
  templateId,
  initialName = '',
  initialNotes = '',
  initialExercises,
}: TemplateFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initialName);
  const [notes, setNotes] = useState(initialNotes);
  const [exercises, setExercises] = useState<TemplateExerciseEntry[]>(
    initialExercises && initialExercises.length > 0 ? initialExercises : [emptyExercise()],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(id: string) {
    setExercises((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));
  }

  function updateExercise(id: string, field: keyof TemplateExerciseEntry, value: string) {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    if (!name.trim()) {
      setError('Template needs a name.');
      setIsSaving(false);
      return;
    }

    const validExercises = exercises.filter((ex) => ex.exercise_name.trim());
    if (validExercises.length === 0) {
      setError('Add at least one exercise.');
      setIsSaving(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setIsSaving(false);
      return;
    }

    let savedId = templateId;

    if (mode === 'create') {
      const { data: created, error: insertError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: name.trim(),
          notes: notes.trim() || null,
        })
        .select('id')
        .single();

      if (insertError || !created) {
        setError(insertError?.message || 'Failed to save template');
        setIsSaving(false);
        return;
      }
      savedId = created.id;
    } else {
      if (!templateId) {
        setError('Missing template id');
        setIsSaving(false);
        return;
      }
      const { error: updateError } = await supabase
        .from('workout_templates')
        .update({
          name: name.trim(),
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId);

      if (updateError) {
        setError(updateError.message);
        setIsSaving(false);
        return;
      }

      const { error: clearError } = await supabase
        .from('workout_template_exercises')
        .delete()
        .eq('template_id', templateId);

      if (clearError) {
        setError(clearError.message);
        setIsSaving(false);
        return;
      }
    }

    if (!savedId) {
      setError('Missing template id after save');
      setIsSaving(false);
      return;
    }

    const exerciseRows = validExercises.map((ex, index) => ({
      template_id: savedId,
      exercise_name: ex.exercise_name.trim(),
      sets: ex.sets ? parseInt(ex.sets) : null,
      reps: ex.reps ? parseInt(ex.reps) : null,
      target_weight_lbs: ex.target_weight_lbs ? parseFloat(ex.target_weight_lbs) : null,
      notes: ex.notes.trim() || null,
      order_index: index,
    }));

    const { error: exercisesError } = await supabase
      .from('workout_template_exercises')
      .insert(exerciseRows);

    if (exercisesError) {
      setError(exercisesError.message);
      setIsSaving(false);
      return;
    }

    router.push('/workouts/templates');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="template-name"
            label="Template Name"
            placeholder="e.g., Upper Body Push"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <label htmlFor="template-notes" className="block text-[12px] font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wider mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="template-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes on how to run this workout"
              rows={2}
              className="w-full rounded-[12px] border border-[rgba(184,169,232,0.3)] px-4 py-3 text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] bg-[var(--theme-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exercises</CardTitle>
            <Button type="button" variant="secondary" size="sm" onClick={addExercise}>
              <Plus className="h-4 w-4 mr-1" />
              Add Exercise
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {exercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="p-4 bg-[var(--theme-bg-alt)] rounded-[12px] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-[var(--theme-text-muted)]" />
                  <span className="text-sm font-medium text-[var(--theme-text-secondary)]">
                    Exercise {index + 1}
                  </span>
                </div>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.id)}
                    className="text-[var(--theme-text-muted)] hover:text-[var(--theme-error)] transition-colors"
                    aria-label="Remove exercise"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Input
                id={`tx-name-${exercise.id}`}
                placeholder="Exercise name"
                value={exercise.exercise_name}
                onChange={(e) => updateExercise(exercise.id, 'exercise_name', e.target.value)}
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  id={`tx-sets-${exercise.id}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="Sets"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                />
                <Input
                  id={`tx-reps-${exercise.id}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="Reps"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                />
                <Input
                  id={`tx-weight-${exercise.id}`}
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="Target lbs"
                  value={exercise.target_weight_lbs}
                  onChange={(e) => updateExercise(exercise.id, 'target_weight_lbs', e.target.value)}
                />
              </div>

              <Input
                id={`tx-notes-${exercise.id}`}
                placeholder="Notes (optional)"
                value={exercise.notes}
                onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-[var(--theme-error)] text-center">{error}</p>}

      <div className="flex justify-end gap-3">
        <Link href="/workouts/templates">
          <Button type="button" variant="secondary">Cancel</Button>
        </Link>
        <Button type="submit" isLoading={isSaving}>
          {mode === 'create' ? 'Save Template' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
