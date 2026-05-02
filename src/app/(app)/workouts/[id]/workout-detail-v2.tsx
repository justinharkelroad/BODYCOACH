import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Sparkles } from 'lucide-react';
import { PageHeader, StatTriple } from '@/components/v2';
import type { WorkoutExercise, WorkoutLog } from '@/types/database';

interface WorkoutDetailV2Props {
  workout: WorkoutLog;
  exercises: WorkoutExercise[];
}

export function WorkoutDetailV2({ workout, exercises }: WorkoutDetailV2Props) {
  const totalSets = exercises.reduce((sum, e) => sum + (e.sets || 0), 0);
  const totalVolume = exercises.reduce(
    (sum, e) => sum + (e.weight_lbs || 0) * (e.sets || 0) * (e.reps || 0),
    0,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/workouts"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-[#3B9DFF] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All workouts
      </Link>

      <PageHeader
        title={workout.name || 'Workout'}
        subtitle={`${new Date(workout.workout_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}${workout.duration_minutes ? ` · ${workout.duration_minutes} min` : ''}`}
        action={
          workout.ai_generated ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F2FF] px-3 py-1 text-[12px] font-semibold text-[#3B9DFF]">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </span>
          ) : null
        }
      />

      <StatTriple
        stats={[
          { value: String(exercises.length), label: 'Exercises' },
          { value: String(totalSets), label: 'Total Sets' },
          { value: totalVolume.toLocaleString(), label: 'Volume (lbs)' },
        ]}
      />

      <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
        <h2 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">Exercises</h2>
        {exercises.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[#6e6e73]">
            No exercises logged for this workout.
          </p>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise, idx) => (
              <div
                key={exercise.id}
                className="flex items-start gap-3 rounded-2xl bg-[#F7F9FC] p-4"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FCE5F2] text-[12px] font-semibold text-[#E94BA8]">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-semibold text-[#1d1d1f]">
                    {exercise.exercise_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-[13px] text-[#6e6e73]">
                    {exercise.sets && (
                      <span>
                        <strong className="text-[#1d1d1f]">{exercise.sets}</strong> sets
                      </span>
                    )}
                    {exercise.reps && (
                      <span>
                        <strong className="text-[#1d1d1f]">{exercise.reps}</strong> reps
                      </span>
                    )}
                    {exercise.weight_lbs && (
                      <span>
                        <strong className="text-[#1d1d1f]">{exercise.weight_lbs}</strong> lbs
                      </span>
                    )}
                    {exercise.duration_seconds && (
                      <span>
                        <strong className="text-[#1d1d1f]">
                          {exercise.duration_seconds}
                        </strong>{' '}
                        sec
                      </span>
                    )}
                  </div>
                  {exercise.notes && (
                    <p className="mt-1.5 text-[12px] italic text-[#6e6e73]">
                      {exercise.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {workout.notes && (
        <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
          <h2 className="mb-2 text-[15px] font-semibold text-[#1d1d1f]">Notes</h2>
          <p className="whitespace-pre-wrap text-[14px] text-[#6e6e73]">
            {workout.notes}
          </p>
        </div>
      )}
    </div>
  );
}
