'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Dumbbell, Clock, Target } from 'lucide-react';

const workoutTypes = [
  { value: 'full_body', label: 'Full Body', description: 'Hit all major muscle groups' },
  { value: 'upper', label: 'Upper Body', description: 'Chest, back, shoulders, arms' },
  { value: 'lower', label: 'Lower Body', description: 'Quads, hamstrings, glutes, calves' },
  { value: 'push', label: 'Push Day', description: 'Chest, shoulders, triceps' },
  { value: 'pull', label: 'Pull Day', description: 'Back, biceps, rear delts' },
  { value: 'legs', label: 'Leg Day', description: 'Complete lower body focus' },
];

const durations = [
  { value: '30', label: '30 min', description: 'Quick session' },
  { value: '45', label: '45 min', description: 'Standard workout' },
  { value: '60', label: '60 min', description: 'Full session' },
  { value: '90', label: '90 min', description: 'Extended training' },
];

const equipmentOptions = [
  { value: 'full_gym', label: 'Full Gym', description: 'All equipment available' },
  { value: 'dumbbells', label: 'Dumbbells Only', description: 'Limited to dumbbells' },
  { value: 'bodyweight', label: 'Bodyweight', description: 'No equipment needed' },
  { value: 'home', label: 'Home Gym', description: 'Basic home setup' },
];

interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface GeneratedWorkout {
  name: string;
  description: string;
  warmup: string[];
  exercises: GeneratedExercise[];
  cooldown: string[];
}

export default function GenerateWorkoutPage() {
  const router = useRouter();

  const [workoutType, setWorkoutType] = useState('full_body');
  const [duration, setDuration] = useState('45');
  const [equipment, setEquipment] = useState('full_gym');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    setError('');
    setGeneratedWorkout(null);

    try {
      const response = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutType,
          duration: parseInt(duration),
          equipment,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate workout');
      }

      const data = await response.json();
      setGeneratedWorkout(data.workout);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!generatedWorkout) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/workouts/generate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout: generatedWorkout,
          duration: parseInt(duration),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save workout');
      }

      router.push('/workouts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setIsSaving(false);
    }
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
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[var(--primary-lavender)]" />
            <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">Generate Workout</h1>
          </div>
          <p className="text-[var(--neutral-gray)]">Let AI create a personalized workout for you</p>
        </div>
      </div>

      {!generatedWorkout ? (
        <>
          {/* Workout Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--neutral-dark)] flex items-center gap-2">
                <Target className="h-5 w-5 text-[var(--primary-lavender)]" />
                Workout Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {workoutTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setWorkoutType(type.value)}
                    className={`p-4 rounded-[12px] border-2 text-left transition-all ${
                      workoutType === type.value
                        ? 'border-[var(--primary-lavender)] bg-[var(--primary-light)]'
                        : 'border-[rgba(184,169,232,0.2)] hover:border-[var(--primary-lavender-soft)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--neutral-dark)]">{type.label}</p>
                    <p className="text-sm text-[var(--neutral-gray)]">{type.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--neutral-dark)] flex items-center gap-2">
                <Clock className="h-5 w-5 text-[var(--primary-lavender)]" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDuration(d.value)}
                    className={`p-4 rounded-[12px] border-2 text-center transition-all ${
                      duration === d.value
                        ? 'border-[var(--primary-lavender)] bg-[var(--primary-light)]'
                        : 'border-[rgba(184,169,232,0.2)] hover:border-[var(--primary-lavender-soft)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--neutral-dark)]">{d.label}</p>
                    <p className="text-sm text-[var(--neutral-gray)]">{d.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--neutral-dark)] flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-[var(--primary-lavender)]" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.map((eq) => (
                  <button
                    key={eq.value}
                    type="button"
                    onClick={() => setEquipment(eq.value)}
                    className={`p-4 rounded-[12px] border-2 text-center transition-all ${
                      equipment === eq.value
                        ? 'border-[var(--primary-lavender)] bg-[var(--primary-light)]'
                        : 'border-[rgba(184,169,232,0.2)] hover:border-[var(--primary-lavender-soft)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--neutral-dark)]">{eq.label}</p>
                    <p className="text-sm text-[var(--neutral-gray)]">{eq.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-[var(--error)] text-center">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            className="w-full"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Workout
          </Button>
        </>
      ) : (
        <>
          {/* Generated Workout */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[var(--neutral-dark)]">{generatedWorkout.name}</CardTitle>
                  <p className="text-sm text-[var(--neutral-gray)] mt-1">{generatedWorkout.description}</p>
                </div>
                <span className="text-xs bg-[var(--primary-light)] text-[var(--primary-deep)] px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Generated
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warmup */}
              {generatedWorkout.warmup.length > 0 && (
                <div>
                  <h3 className="font-medium text-[var(--neutral-dark)] mb-2">Warm-Up</h3>
                  <ul className="space-y-1">
                    {generatedWorkout.warmup.map((item, i) => (
                      <li key={i} className="text-sm text-[var(--neutral-gray)] flex items-start gap-2">
                        <span className="text-[var(--primary-lavender)]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exercises */}
              <div>
                <h3 className="font-medium text-[var(--neutral-dark)] mb-3">Exercises</h3>
                <div className="space-y-3">
                  {generatedWorkout.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-[var(--neutral-gray-light)] rounded-[12px]"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-[var(--primary-light)] rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-[var(--primary-deep)]">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[var(--neutral-dark)]">{exercise.name}</h4>
                        <p className="text-sm text-[var(--neutral-gray)]">
                          {exercise.sets} sets × {exercise.reps} • Rest: {exercise.rest}
                        </p>
                        {exercise.notes && (
                          <p className="text-sm text-[var(--primary-deep)] mt-1 italic">{exercise.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooldown */}
              {generatedWorkout.cooldown.length > 0 && (
                <div>
                  <h3 className="font-medium text-[var(--neutral-dark)] mb-2">Cool-Down</h3>
                  <ul className="space-y-1">
                    {generatedWorkout.cooldown.map((item, i) => (
                      <li key={i} className="text-sm text-[var(--neutral-gray)] flex items-start gap-2">
                        <span className="text-[var(--primary-lavender)]">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-[var(--error)] text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setGeneratedWorkout(null)}
              className="flex-1"
            >
              Generate Another
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="flex-1"
            >
              Save & Log Workout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
