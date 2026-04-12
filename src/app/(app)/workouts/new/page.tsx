'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react';

interface ExerciseEntry {
  id: string;
  exercise_name: string;
  sets: string;
  reps: string;
  weight_lbs: string;
  notes: string;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    { id: '1', exercise_name: '', sets: '', reps: '', weight_lbs: '', notes: '' },
  ]);

  function addExercise() {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), exercise_name: '', sets: '', reps: '', weight_lbs: '', notes: '' },
    ]);
  }

  function removeExercise(id: string) {
    if (exercises.length > 1) {
      setExercises(exercises.filter((e) => e.id !== id));
    }
  }

  function updateExercise(id: string, field: keyof ExerciseEntry, value: string) {
    setExercises(exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
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

    // Filter out empty exercises
    const validExercises = exercises.filter((ex) => ex.exercise_name.trim());

    if (validExercises.length === 0) {
      setError('Please add at least one exercise');
      setIsLoading(false);
      return;
    }

    // Create workout log
    const { data: workout, error: workoutError } = await supabase
      .from('workout_logs')
      .insert({
        user_id: user.id,
        workout_date: workoutDate,
        name: workoutName || null,
        duration_minutes: duration ? parseInt(duration) : null,
        notes: notes || null,
        ai_generated: false,
      })
      .select('id')
      .single();

    if (workoutError) {
      setError(workoutError.message);
      setIsLoading(false);
      return;
    }

    // Create workout exercises
    const exercisesToInsert = validExercises.map((ex, index) => ({
      workout_log_id: workout.id,
      exercise_name: ex.exercise_name,
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

    router.push('/workouts');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">Log Workout</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--neutral-dark)]">Workout Details</CardTitle>
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

        {/* Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[var(--neutral-dark)]">Exercises</CardTitle>
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
                className="p-4 bg-[var(--neutral-gray-light)] rounded-[12px] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-[var(--neutral-gray)]" />
                    <span className="text-sm font-medium text-[var(--neutral-gray)]">
                      Exercise {index + 1}
                    </span>
                  </div>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="text-[var(--neutral-gray)] hover:text-[var(--error)] transition-colors"
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

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--neutral-dark)]">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations?"
              rows={3}
              className="w-full rounded-[12px] border border-[rgba(184,169,232,0.3)] px-4 py-3 text-[var(--neutral-dark)] placeholder-[var(--neutral-gray)] bg-[var(--theme-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-lavender)] focus:border-transparent"
            />
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-[var(--error)] text-center">{error}</p>
        )}

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
