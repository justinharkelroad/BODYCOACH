import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, ClipboardList, Pencil, PlayCircle } from 'lucide-react';
import { TemplateDeleteButton } from '@/components/workouts/template-delete-button';
import type { WorkoutTemplate, WorkoutTemplateExercise } from '@/types/database';
import { isNewUI } from '@/lib/feature-flags';
import { TemplatesV2 } from './templates-v2';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: templates } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false }) as { data: WorkoutTemplate[] | null };

  const templateIds = (templates || []).map((t) => t.id);
  const { data: exercises } = templateIds.length > 0
    ? await supabase
        .from('workout_template_exercises')
        .select('template_id')
        .in('template_id', templateIds) as { data: Pick<WorkoutTemplateExercise, 'template_id'>[] | null }
    : { data: [] as Pick<WorkoutTemplateExercise, 'template_id'>[] };

  const exerciseCountByTemplate = (exercises || []).reduce<Record<string, number>>((acc, ex) => {
    acc[ex.template_id] = (acc[ex.template_id] || 0) + 1;
    return acc;
  }, {});

  if (isNewUI()) {
    return (
      <TemplatesV2
        templates={templates || []}
        exerciseCountByTemplate={exerciseCountByTemplate}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-[var(--theme-primary)]" />
            <h1 className="text-2xl font-semibold text-[var(--theme-text)]">Workout Templates</h1>
          </div>
          <p className="text-sm text-[var(--theme-text-secondary)] mt-1">
            Save your usual workouts so you can log them in seconds.
          </p>
        </div>
        <Link href="/workouts/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </Link>
      </div>

      {templates && templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((template) => {
            const count = exerciseCountByTemplate[template.id] || 0;
            return (
              <Card key={template.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="font-medium text-[var(--theme-text)]">{template.name}</h3>
                      <p className="text-sm text-[var(--theme-text-secondary)]">
                        {count} {count === 1 ? 'exercise' : 'exercises'}
                        {template.notes ? ` · ${template.notes}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/workouts/new?templateId=${template.id}`}>
                        <Button size="sm">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Use for today
                        </Button>
                      </Link>
                      <Link href={`/workouts/templates/${template.id}/edit`}>
                        <Button size="sm" variant="ghost" aria-label="Edit template">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <TemplateDeleteButton templateId={template.id} templateName={template.name} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="p-4 bg-[var(--theme-bg-alt)] rounded-full inline-block mb-4">
              <ClipboardList className="h-8 w-8 text-[var(--theme-primary)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--theme-text)] mb-2">No templates yet</h3>
            <p className="text-[var(--theme-text-secondary)] mb-6">
              Build a template once, then log it any day with one tap.
            </p>
            <Link href="/workouts/templates/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create your first template
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
