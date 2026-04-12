import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, Dumbbell, Sparkles } from 'lucide-react';
import type { WorkoutLog, WorkoutExercise } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch workout
  const { data: workout } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: WorkoutLog | null };

  if (!workout) {
    notFound();
  }

  // Fetch exercises
  const { data: exercises } = await supabase
    .from('workout_exercises')
    .select('*')
    .eq('workout_log_id', id)
    .order('order_index', { ascending: true }) as { data: WorkoutExercise[] | null };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/workouts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">
                {workout.name || 'Workout'}
              </h1>
              {workout.ai_generated && (
                <span className="text-xs bg-[var(--primary-light)] text-[var(--primary-deep)] px-2 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Generated
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-[var(--neutral-gray)] mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(workout.workout_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {workout.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {workout.duration_minutes} minutes
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--neutral-dark)]">Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          {exercises && exercises.length > 0 ? (
            <div className="space-y-4">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-start gap-4 p-4 bg-[var(--neutral-gray-light)] rounded-[12px]"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[var(--primary-light)] rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-[var(--primary-deep)]">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[var(--neutral-dark)]">
                      {exercise.exercise_name}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      {exercise.sets && (
                        <span className="text-[var(--neutral-gray)]">
                          <strong className="text-[var(--neutral-dark)]">{exercise.sets}</strong> sets
                        </span>
                      )}
                      {exercise.reps && (
                        <span className="text-[var(--neutral-gray)]">
                          <strong className="text-[var(--neutral-dark)]">{exercise.reps}</strong> reps
                        </span>
                      )}
                      {exercise.weight_lbs && (
                        <span className="text-[var(--neutral-gray)]">
                          <strong className="text-[var(--neutral-dark)]">{exercise.weight_lbs}</strong> lbs
                        </span>
                      )}
                      {exercise.duration_seconds && (
                        <span className="text-[var(--neutral-gray)]">
                          <strong className="text-[var(--neutral-dark)]">{exercise.duration_seconds}</strong> seconds
                        </span>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-[var(--neutral-gray)] mt-2 italic">
                        {exercise.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--neutral-gray)] text-center py-8">
              No exercises logged for this workout.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {workout.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[var(--neutral-dark)]">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--neutral-gray)] whitespace-pre-wrap">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[var(--neutral-dark)]">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                {exercises?.length || 0}
              </p>
              <p className="text-sm text-[var(--neutral-gray)]">Exercises</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                {exercises?.reduce((sum, e) => sum + (e.sets || 0), 0) || 0}
              </p>
              <p className="text-sm text-[var(--neutral-gray)]">Total Sets</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                {exercises?.reduce((sum, e) => sum + (e.weight_lbs || 0) * (e.sets || 0) * (e.reps || 0), 0).toLocaleString() || 0}
              </p>
              <p className="text-sm text-[var(--neutral-gray)]">Volume (lbs)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
