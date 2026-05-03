import { Dumbbell, Plus } from 'lucide-react';
import Link from 'next/link';

interface WorkoutItem {
  id: string;
  name: string | null;
  workout_date: string;
  duration_min?: number | null;
  kcal?: number | null;
}

interface WorkoutsCardProps {
  weekCount: number;
  weekTarget: number;
  weekBars: { day: string; value: number }[];
  recent: WorkoutItem[];
}

export function WorkoutsCard({
  weekCount,
  weekTarget,
  weekBars,
  recent,
}: WorkoutsCardProps) {
  const max = Math.max(1, ...weekBars.map((b) => b.value));

  return (
    <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <Link href="/workouts" className="flex flex-1 items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FCE5F2]">
            <Dumbbell className="h-5 w-5 text-[#E94BA8]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Exercise Days</h3>
            <p className="text-[12px] text-[#6e6e73]">
              This Week : {weekCount} of {weekTarget} Days
            </p>
          </div>
        </Link>
        <Link
          href="/workouts/new"
          className="flex flex-shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] px-3 py-1.5 text-[12px] font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          <Plus className="h-3.5 w-3.5" />
          Log
        </Link>
      </div>

      <div className="mt-4 flex h-16 items-end gap-2">
        {weekBars.map((b, idx) => {
          const h = (b.value / max) * 100;
          const has = b.value > 0;
          return (
            <div key={idx} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex h-12 w-full items-end">
                <div
                  className={`w-full rounded-t-full ${
                    has
                      ? 'bg-gradient-to-t from-[#FFB1D8] to-[#E94BA8]'
                      : 'bg-[#F0F4F9]'
                  }`}
                  style={{ height: `${has ? Math.max(h, 12) : 6}%` }}
                />
              </div>
              <span className="text-[10px] font-medium uppercase text-[#6e6e73]">
                {b.day}
              </span>
            </div>
          );
        })}
      </div>

      {recent.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-[#F0F4F9] pt-4">
          {recent.slice(0, 3).map((w) => {
            const dateLabel = new Date(w.workout_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            return (
              <Link
                key={w.id}
                href={`/workouts/${w.id}`}
                className="flex items-center justify-between rounded-xl px-1 py-1 transition hover:bg-[#F7F9FC]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FCE5F2]">
                    <Dumbbell className="h-4 w-4 text-[#E94BA8]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#1d1d1f]">
                      {w.name || 'Workout'}
                    </div>
                    <div className="text-[11px] text-[#6e6e73]">{dateLabel}</div>
                  </div>
                </div>
                <div className="text-right">
                  {w.kcal !== null && w.kcal !== undefined && (
                    <div className="text-[13px] font-medium text-[#1d1d1f]">
                      {w.kcal} kcal
                    </div>
                  )}
                  {w.duration_min !== null && w.duration_min !== undefined && (
                    <div className="text-[11px] text-[#6e6e73]">{w.duration_min} Min</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
