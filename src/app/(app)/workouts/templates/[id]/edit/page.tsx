import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TemplateForm, type TemplateExerciseEntry } from '@/components/workouts/template-form';
import type { WorkoutTemplate, WorkoutTemplateExercise } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: template } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: WorkoutTemplate | null };

  if (!template) notFound();

  const { data: exercises } = await supabase
    .from('workout_template_exercises')
    .select('*')
    .eq('template_id', id)
    .order('order_index', { ascending: true }) as { data: WorkoutTemplateExercise[] | null };

  const initialExercises: TemplateExerciseEntry[] = (exercises || []).map((ex) => ({
    id: ex.id,
    exercise_name: ex.exercise_name,
    sets: ex.sets?.toString() ?? '',
    reps: ex.reps?.toString() ?? '',
    target_weight_lbs: ex.target_weight_lbs?.toString() ?? '',
    notes: ex.notes ?? '',
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workouts/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--theme-text)]">Edit Template</h1>
      </div>

      <TemplateForm
        mode="edit"
        templateId={template.id}
        initialName={template.name}
        initialNotes={template.notes ?? ''}
        initialExercises={initialExercises}
      />
    </div>
  );
}
