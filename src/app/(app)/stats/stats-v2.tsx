import { Calendar } from 'lucide-react';
import {
  KPICard,
  PageHeader,
  StatTriple,
  WeightTrendCard,
} from '@/components/v2';
import { Scale, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatsForm } from './stats-form';
import type { BodyStat } from '@/types/database';

interface StatsV2Props {
  userId: string;
  stats: BodyStat[];
  todayStat: BodyStat | undefined;
  latestWeight: number | null;
  startWeight: number | null;
  totalChange: number | null;
  weeklyAvg: number | null;
}

export function StatsV2({
  userId,
  stats,
  todayStat,
  latestWeight,
  startWeight,
  totalChange,
  weeklyAvg,
}: StatsV2Props) {
  const series = stats
    .filter((s) => s.weight_lbs !== null)
    .slice()
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
    )
    .map((s) => ({
      label: new Date(s.recorded_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: s.weight_lbs as number,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Body Stats"
        subtitle="Track your weight and measurements over time"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard
          label="Current"
          icon={<Scale className="h-4 w-4" />}
          tone="blue"
          value={latestWeight ? `${latestWeight}` : '—'}
          unit="lbs"
        />
        <KPICard
          label="7-Day Avg"
          icon={<Calendar className="h-4 w-4" />}
          tone="gold"
          value={weeklyAvg ? weeklyAvg.toFixed(1) : '—'}
          unit="lbs"
        />
        <KPICard
          label="Total Change"
          icon={
            totalChange === null || totalChange === 0 ? (
              <Minus className="h-4 w-4" />
            ) : totalChange < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )
          }
          tone={
            totalChange !== null && totalChange < 0
              ? 'green'
              : totalChange !== null && totalChange > 0
                ? 'coral'
                : 'gold'
          }
          value={
            totalChange !== null
              ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}`
              : '—'
          }
          unit="lbs"
        />
        <KPICard
          label="Start"
          icon={<Scale className="h-4 w-4" />}
          tone="pink"
          value={startWeight ? `${startWeight}` : '—'}
          unit="lbs"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form column */}
        <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur lg:col-span-1">
          <h2 className="mb-3 text-[15px] font-semibold text-[#1d1d1f]">
            {todayStat ? "Update today's entry" : 'Log a new entry'}
          </h2>
          <StatsForm
            userId={userId}
            existingStatId={todayStat?.id}
            defaultValues={todayStat}
          />
        </div>

        {/* Chart + history */}
        <div className="space-y-6 lg:col-span-2">
          <WeightTrendCard
            current={latestWeight}
            goal={null}
            data={series}
            message={
              totalChange === null
                ? 'Log a few weigh-ins to see your trend.'
                : totalChange < 0
                  ? `Down ${Math.abs(totalChange).toFixed(1)} lbs since you started.`
                  : totalChange > 0
                    ? `Up ${totalChange.toFixed(1)} lbs since you started.`
                    : 'Holding steady.'
            }
          />

          <StatTriple
            stats={[
              { value: latestWeight ? `${latestWeight}` : '—', label: 'Current lbs' },
              { value: weeklyAvg ? weeklyAvg.toFixed(1) : '—', label: '7-day avg' },
              {
                value:
                  totalChange !== null
                    ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}`
                    : '—',
                label: 'Total change',
              },
            ]}
          />

          <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">
              Recent Entries
            </h3>
            {stats.length === 0 ? (
              <p className="mt-4 text-center text-[14px] text-[#6e6e73]">
                No stats logged yet. Start tracking today.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-[#F0F4F9]">
                {stats.slice(0, 10).map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5F2FF]">
                        <Calendar className="h-4 w-4 text-[#3B9DFF]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-[#1d1d1f]">
                          {new Date(stat.recorded_at).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            },
                          )}
                        </div>
                        {stat.notes && (
                          <div className="max-w-xs truncate text-[12px] text-[#6e6e73]">
                            {stat.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-semibold text-[#1d1d1f]">
                        {stat.weight_lbs ? `${stat.weight_lbs} lbs` : '—'}
                      </div>
                      {stat.body_fat_pct && (
                        <div className="text-[12px] text-[#6e6e73]">
                          {stat.body_fat_pct}% BF
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
