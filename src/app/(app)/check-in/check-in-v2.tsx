import { CheckCircle2, Clock, Scale } from 'lucide-react';
import { PageHeader } from '@/components/v2';
import { CheckInForm } from './check-in-form';
import type { BodyStat, DailyCheckin } from '@/types/database';

interface CheckInV2Props {
  todayStat: BodyStat | null;
  todayCheckin: Pick<DailyCheckin, 'sleep_hours' | 'water_oz' | 'stress_level'> | null;
  pendingCount: number;
  pendingCheckInId: string | undefined;
  lastWeight: number | null;
  weekAgoWeight: number | null;
  recentStats: Array<{ weight_lbs: number | null; recorded_at: string }>;
}

export function CheckInV2({
  todayStat,
  todayCheckin,
  pendingCount,
  pendingCheckInId,
  lastWeight,
  weekAgoWeight,
  recentStats,
}: CheckInV2Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Daily Check-in"
        subtitle={new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      />

      {todayStat?.weight_lbs ? (
        <div className="flex items-center gap-4 rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8FE0A8] to-[#2EBA62]">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">
              Already checked in today
            </h2>
            <p className="text-[13px] text-[#6e6e73]">
              You logged {todayStat.weight_lbs} lbs
            </p>
          </div>
        </div>
      ) : pendingCount > 0 ? (
        <div className="flex items-center gap-2 rounded-2xl bg-[#FFF4D6] px-4 py-3 text-[13px] font-medium text-[#B8923D]">
          <Clock className="h-4 w-4" />
          <span>
            You have {pendingCount} pending check-in{pendingCount > 1 ? 's' : ''}
          </span>
        </div>
      ) : null}

      <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E5F2FF]">
            <Scale className="h-5 w-5 text-[#3B9DFF]" />
          </div>
          <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Check-in</h2>
        </div>
        <CheckInForm
          lastWeight={lastWeight}
          weekAgoWeight={weekAgoWeight}
          pendingCheckInId={pendingCheckInId}
          existingCheckin={todayCheckin}
        />
      </div>

      {recentStats.length > 0 && (
        <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
          <h3 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
            Recent Weigh-ins
          </h3>
          <div className="divide-y divide-[#F0F4F9]">
            {recentStats.slice(0, 5).map((stat, i) => {
              const prevWeight = recentStats[i + 1]?.weight_lbs;
              const change =
                prevWeight && stat.weight_lbs ? stat.weight_lbs - prevWeight : null;
              return (
                <div
                  key={stat.recorded_at}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-[13px] text-[#6e6e73]">
                    {new Date(stat.recorded_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium text-[#1d1d1f]">
                      {stat.weight_lbs} lbs
                    </span>
                    {change !== null && (
                      <span
                        className={`text-[13px] ${
                          change > 0
                            ? 'text-[#FF6F4D]'
                            : change < 0
                              ? 'text-[#2EBA62]'
                              : 'text-[#9BA3A9]'
                        }`}
                      >
                        {change > 0 ? '+' : ''}
                        {change.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
