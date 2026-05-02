import Link from 'next/link';
import { ClipboardList, Pencil, PlayCircle, Plus } from 'lucide-react';
import { PageHeader } from '@/components/v2';
import { TemplateDeleteButton } from '@/components/workouts/template-delete-button';
import type { WorkoutTemplate } from '@/types/database';

interface TemplatesV2Props {
  templates: WorkoutTemplate[];
  exerciseCountByTemplate: Record<string, number>;
}

export function TemplatesV2({
  templates,
  exerciseCountByTemplate,
}: TemplatesV2Props) {
  return (
    <div className="space-y-6">
      <Link
        href="/workouts"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-[#3B9DFF] hover:underline"
      >
        ← All workouts
      </Link>

      <PageHeader
        title="Workout Templates"
        subtitle="Save your usual workouts so you can log them in seconds."
        action={
          <Link
            href="/workouts/templates/new"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-4 py-2 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        }
      />

      {templates.length === 0 ? (
        <div className="rounded-3xl bg-white/95 px-6 py-12 text-center shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F2FF]">
            <ClipboardList className="h-7 w-7 text-[#3B9DFF]" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
            No templates yet
          </h3>
          <p className="mt-1 text-[13px] text-[#6e6e73]">
            Build a template once, then log it any day with one tap.
          </p>
          <Link
            href="/workouts/templates/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const count = exerciseCountByTemplate[t.id] || 0;
            return (
              <div
                key={t.id}
                className="rounded-2xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[14px] font-semibold text-[#1d1d1f]">
                      {t.name}
                    </h3>
                    <p className="text-[12px] text-[#6e6e73]">
                      {count} {count === 1 ? 'exercise' : 'exercises'}
                      {t.notes ? ` · ${t.notes}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/workouts/new?templateId=${t.id}`}
                      className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Use today
                    </Link>
                    <Link
                      href={`/workouts/templates/${t.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D9E7FF] bg-white text-[#3B9DFF] transition hover:bg-[#F5F9FF]"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <TemplateDeleteButton templateId={t.id} templateName={t.name} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
