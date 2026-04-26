'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getLocalDateString } from '@/lib/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2, GripVertical, ClipboardList } from 'lucide-react';
import type { WorkoutTemplate, WorkoutTemplateExercise } from '@/types/database';

interface ExerciseEntry {
  id: string;
  exercise_name: string;
  sets: string;
  reps: string;
  weight_lbs: string;
  notes: string;
}

function emptyExercise(): ExerciseEntry {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Date.now().toString() + Math.random(),
    exercise_name: '',
    sets: '',
    reps: '',
    weight_lbs: '',
    notes: '',
  };
}

function NewWorkoutForm() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialTemplateId = searchParams.get('templateId');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(getLocalDateString());
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([emptyExercise()]);

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Load user's templates for the picker
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('workout_templates')
        .select('*')
        .order('updated_at', { ascending: false }) as { data: WorkoutTemplate[] | null };
      if (!cancelled && data) setTemplates(data);
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  // Pre-fill from a templateId (either from query string on mount, or via picker click)
  async function applyTemplate(templateId: string) {
    const { data: tpl } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('id', templateId)
      .single() as { data: WorkoutTemplate | null };
    if (!tpl) return;

    const { data: tplExercises } = await supabase
      .from('workout_template_exercises')
      .select('*')
      .eq('template_id', templateId)
      .order('order_index', { ascending: true }) as { data: WorkoutTemplateExercise[] | null };

    setWorkoutName(tpl.name);
    if (tpl.notes && !notes) setNotes(tpl.notes);
    setExercises(
      (tplExercises && tplExercises.length > 0
        ? tplExercises.map((ex) => ({
            id: ex.id,
            exercise_name: ex.exercise_name,
            sets: ex.sets?.toString() ?? '',
            reps: ex.reps?.toString() ?? '',
            weight_lbs: ex.target_weight_lbs?.toString() ?? '',
            notes: ex.notes ?? '',
          }))
        : [emptyExercise()]),
    );
    setActiveTemplateId(templateId);
  }

  // Apply ?templateId= on first mount
  useEffect(() => {
    if (initialTemplateId) {
      applyTemplate(initialTemplateId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplateId]);

  function clearTemplate() {
    setActiveTemplateId(null);
    setWorkoutName('');
    setExercises([emptyExercise()]);
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(id: string) {
    setExercises((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));
  }

  function updateExercise(id: string, field: keyof ExerciseEntry, value: string) {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    const validExercises = exercises.filter((ex) => ex.exercise_name.trim());

    if (validExercises.length === 0) {
      setError('Please add at least one exercise');
      setIsLoading(false);
      return;
    }

    if (saveAsTemplate && !workoutName.trim()) {
      setError('Give the workout a name to save it as a template.');
      setIsLoading(false);
      return;
    }

    // Create workout log
    const { data: workout, error: workoutError } = await supabase
      .from('workout_logs')
      .insert({
        user_id: user.id,
        workout_date: workoutDate,
        name: workoutName.trim() || null,
        duration_minutes: duration ? parseInt(duration) : null,
        notes: notes || null,
        ai_generated: false,
      })
      .select('id')
      .single();

    if (workoutError || !workout) {
      setError(workoutError?.message || 'Failed to save workout');
      setIsLoading(false);
      return;
    }

    const exercisesToInsert = validExercises.map((ex, index) => ({
      workout_log_id: workout.id,
      exercise_name: ex.exercise_name.trim(),
      sets: ex.sets ? parseInt(ex.sets) : null,
      reps: ex.reps ? parseInt(ex.reps) : null,
      weight_lbs: ex.weight_lbs ? parseFloat(ex.weight_lbs) : null,
      notes: ex.notes || null,
      order_index: index,
    }));

    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(exercisesToInsert);

    if (exercisesError) {
      setError(exercisesError.message);
      setIsLoading(false);
      return;
    }

    if (saveAsTemplate) {
      const { data: tpl, error: tplError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: workoutName.trim(),
          notes: notes || null,
        })
        .select('id')
        .single();

      if (tplError || !tpl) {
        // Workout already saved — surface but don't block redirect
        setError(`Workout saved, but template failed: ${tplError?.message ?? 'unknown error'}`);
        setIsLoading(false);
        return;
      }

      const tplRows = validExercises.map((ex, index) => ({
        template_id: tpl.id,
        exercise_name: ex.exercise_name.trim(),
        sets: ex.sets ? parseInt(ex.sets) : null,
        reps: ex.reps ? parseInt(ex.reps) : null,
        target_weight_lbs: ex.weight_lbs ? parseFloat(ex.weight_lbs) : null,
        notes: ex.notes || null,
        order_index: index,
      }));

      const { error: tplExError } = await supabase
        .from('workout_template_exercises')
        .insert(tplRows);

      if (tplExError) {
        setError(`Workout saved, but template exercises failed: ${tplExError.message}`);
        setIsLoading(false);
        return;
      }
    }

    router.push('/workouts');
    router.refresh();
  }

  const showPicker = templates.length > 0 && !activeTemplateId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--theme-text)]">Log Workout</h1>
      </div>

      {showPicker && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="h-4 w-4 text-[var(--theme-primary)]" />
              <p className="text-sm font-medium text-[var(--theme-text-secondary)]">
                Start from a template
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl.id)}
                  className="px-3 py-1.5 text-sm rounded-full bg-[var(--theme-bg-alt)] hover:bg-[var(--theme-border)] text-[var(--theme-text)] transition-colors"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTemplateId && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-[12px] bg-[var(--theme-bg-alt)]">
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Pre-filled from template — adjust weights/reps as needed.
          </p>
          <button
            type="button"
            onClick={clearTemplate}
            className="text-sm text-[var(--theme-primary)] hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="workoutName"
                label="Workout Name (optional)"
                placeholder="e.g., Upper Body Push"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
              />
              <Input
                id="workoutDate"
                type="date"
                label="Date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                required
              />
              <Input
                id="duration"
                type="number"
                label="Duration (minutes)"
                placeholder="45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
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
                  id={`exercise-name-${exercise.id}`}
                  placeholder="Exercise name"
                  value={exercise.exercise_name}
                  onChange={(e) => updateExercise(exercise.id, 'exercise_name', e.target.value)}
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    id={`sets-${exercise.id}`}
                    type="number"
                    placeholder="Sets"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                  />
                  <Input
                    id={`reps-${exercise.id}`}
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                  />
                  <Input
                    id={`weight-${exercise.id}`}
                    type="number"
                    placeholder="Weight (lbs)"
                    value={exercise.weight_lbs}
                    onChange={(e) => updateExercise(exercise.id, 'weight_lbs', e.target.value)}
                  />
                </div>

                <Input
                  id={`notes-${exercise.id}`}
                  placeholder="Notes (optional)"
                  value={exercise.notes}
                  onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations?"
              rows={3}
              className="w-full rounded-[12px] border border-[rgba(184,169,232,0.3)] px-4 py-3 text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] bg-[var(--theme-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent"
            />
            {!activeTemplateId && (
              <label className="flex items-start gap-2 text-sm text-[var(--theme-text)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[var(--theme-border)] text-[var(--theme-primary)] focus:ring-[var(--theme-primary)]"
                />
                <span>
                  Also save as a template
                  <span className="block text-xs text-[var(--theme-text-muted)]">
                    Reuse these exercises any day with one tap.
                  </span>
                </span>
              </label>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-[var(--theme-error)] text-center">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/workouts">
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" isLoading={isLoading}>
            Save Workout
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewWorkoutPage() {
  return (
    <Suspense fallback={<div className="space-y-6" />}>
      <NewWorkoutForm />
    </Suspense>
  );
}
