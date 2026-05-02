import Link from 'next/link';
import {
  Calendar,
  ClipboardList,
  Clock,
  Dumbbell,
  Plus,
  Sparkles,
} from 'lucide-react';
import { KPICard, PageHeader } from '@/components/v2';
import type { WorkoutLog } from '@/types/database';

interface WorkoutsV2Props {
  workouts: WorkoutLog[];
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  avgPerWeek: number;
}

export function WorkoutsV2({
  workouts,
  workoutsThisWeek,
  workoutsThisMonth,
  avgPerWeek,
}: WorkoutsV2Props) {
  const byMonth = workouts.reduce(
    (acc, w) => {
      const key = new Date(w.workout_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      (acc[key] = acc[key] || []).push(w);
      return acc;
    },
    {} as Record<string, WorkoutLog[]>,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workouts"
        subtitle="Track your training sessions and monitor your progress"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/workouts/templates"
              className="flex items-center gap-1.5 rounded-full border border-[#D9E7FF] bg-white px-4 py-2 text-[13px] font-medium text-[#3B9DFF] transition hover:bg-[#F5F9FF]"
            >
              <ClipboardList className="h-4 w-4" />
              Templates
            </Link>
            <Link
              href="/workouts/generate"
              className="flex items-center gap-1.5 rounded-full border border-[#D9E7FF] bg-white px-4 py-2 text-[13px] font-medium text-[#3B9DFF] transition hover:bg-[#F5F9FF]"
            >
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Link>
            <Link
              href="/workouts/new"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-4 py-2 text-[13px] font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Log
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard
          label="This Week"
          icon={<Dumbbell className="h-4 w-4" />}
          tone="pink"
          value={String(workoutsThisWeek)}
          unit="workouts"
        />
        <KPICard
          label="This Month"
          icon={<Calendar className="h-4 w-4" />}
          tone="coral"
          value={String(workoutsThisMonth)}
          unit="workouts"
        />
        <KPICard
          label="Total"
          icon={<Dumbbell className="h-4 w-4" />}
          tone="blue"
          value={String(workouts.length)}
          unit="logged"
        />
        <KPICard
          label="Avg/Week"
          icon={<Clock className="h-4 w-4" />}
          tone="gold"
          value={String(avgPerWeek)}
          unit="sessions"
        />
      </div>

      {workouts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {Object.entries(byMonth).map(([month, list]) => (
            <div key={month}>
              <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#6e6e73]">
                {month}
              </h2>
              <div className="space-y-2.5">
                {list.map((w) => (
                  <Link
                    key={w.id}
                    href={`/workouts/${w.id}`}
                    className="block rounded-2xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur transition hover:shadow-[0_12px_32px_rgba(120,120,180,0.16)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FCE5F2]">
                        <Dumbbell className="h-5 w-5 text-[#E94BA8]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[14px] font-semibold text-[#1d1d1f]">
                            {w.name || 'Workout'}
                          </h3>
                          {w.ai_generated && (
                            <span className="flex items-center gap-1 rounded-full bg-[#E5F2FF] px-2 py-0.5 text-[10px] font-semibold text-[#3B9DFF]">
                              <Sparkles className="h-2.5 w-2.5" />
                              AI
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-[12px] text-[#6e6e73]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(w.workout_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {w.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {w.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl bg-white/95 px-6 py-12 text-center shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCE5F2]">
        <Dumbbell className="h-7 w-7 text-[#E94BA8]" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#1d1d1f]">No workouts yet</h3>
      <p className="mt-1 text-[13px] text-[#6e6e73]">
        Start logging your workouts to track your progress.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Link
          href="/workouts/generate"
          className="flex items-center gap-1.5 rounded-full border border-[#D9E7FF] bg-white px-4 py-2 text-[13px] font-medium text-[#3B9DFF]"
        >
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Link>
        <Link
          href="/workouts/new"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-4 py-2 text-[13px] font-semibold text-white shadow-md"
        >
          <Plus className="h-4 w-4" />
          Log Workout
        </Link>
      </div>
    </div>
  );
}
