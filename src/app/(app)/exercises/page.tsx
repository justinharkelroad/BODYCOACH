import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dumbbell, Search } from 'lucide-react';
import type { Exercise } from '@/types/database';
import { ExerciseList } from './exercise-list';

export const dynamic = 'force-dynamic';

const bodyParts = [
  { value: 'all', label: 'All' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
];

const difficulties = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default async function ExercisesPage() {
  const supabase = await createClient();

  // Fetch all exercises
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true }) as { data: Exercise[] | null };

  // Group exercises by body part for stats
  const exercisesByBodyPart = exercises?.reduce((acc, ex) => {
    acc[ex.body_part] = (acc[ex.body_part] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="h-6 w-6 text-[var(--primary-lavender)]" />
          <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">Exercise Library</h1>
        </div>
        <p className="text-[var(--neutral-gray)]">
          Browse {exercises?.length || 0} exercises to build your perfect workout
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {bodyParts.slice(1).map((bp) => (
          <Card key={bp.value} className="text-center">
            <CardContent className="py-3 px-2">
              <p className="text-lg font-semibold text-[var(--neutral-dark)]">
                {exercisesByBodyPart[bp.value] || 0}
              </p>
              <p className="text-xs text-[var(--neutral-gray)]">{bp.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exercise List with Client-Side Filtering */}
      <ExerciseList
        exercises={exercises || []}
        bodyParts={bodyParts}
        difficulties={difficulties}
      />
    </div>
  );
}
