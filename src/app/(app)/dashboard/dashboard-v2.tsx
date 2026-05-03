import { Apple, Droplet, Dumbbell, Flame, Moon, Scale } from 'lucide-react';
import {
  DateHero,
  HeaderBar,
  KPICard,
  MacroCard,
  RecoveryRow,
  StatTriple,
  WeightTrendCard,
  WorkoutsCard,
} from '@/components/v2';
import type {
  BodyStat,
  ClientMacroPlan,
  DailyCheckin,
  Profile,
  WorkoutLog,
} from '@/types/database';

interface DashboardV2Props {
  profile: Pick<Profile, 'full_name' | 'email' | 'target_weight_lbs'>;
  allStats: BodyStat[];
  recentWorkouts: WorkoutLog[];
  workoutCount: number;
  macroPlan: ClientMacroPlan | null;
  todayCheckin: DailyCheckin | null;
  caloriesConsumedToday: number;
  streak: number;
  weekBars: { day: string; value: number }[];
}

export function DashboardV2({
  profile,
  allStats,
  recentWorkouts,
  workoutCount,
  macroPlan,
  todayCheckin,
  caloriesConsumedToday,
  streak,
  weekBars,
}: DashboardV2Props) {
  const weightSeries = allStats
    .filter((s) => s.weight_lbs !== null)
    .map((s) => ({
      label: new Date(s.recorded_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: s.weight_lbs as number,
    }));

  const sortedDesc = [...allStats].sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
  );
  const currentWeight =
    sortedDesc.find((s) => s.weight_lbs !== null)?.weight_lbs ?? null;
  const weekAgoTime = Date.now() - 7 * 86400000;
  const weekAgoStat = sortedDesc.find(
    (s) => s.weight_lbs !== null && new Date(s.recorded_at).getTime() <= weekAgoTime,
  );
  const weekAgoWeight = weekAgoStat?.weight_lbs ?? null;
  const weeklyChange =
    currentWeight && weekAgoWeight ? currentWeight - weekAgoWeight : null;

  const sleepHours = todayCheckin?.sleep_hours ?? null;
  const waterOz = todayCheckin?.water_oz ?? null;

  const firstName =
    profile.full_name?.split(' ')[0] ||
    profile.email?.split('@')[0] ||
    'there';
  const targetWeight = profile.target_weight_lbs;

  return (
    <div className="space-y-4">
      <HeaderBar
        initials={firstName.slice(0, 2).toUpperCase()}
        notificationCount={0}
        deviceName="BodyCoach"
        deviceStatus={`${streak} day streak`}
      />
      <DateHero date={new Date()} />

      <div className="px-1">
        <p className="text-[14px] text-[#6e6e73]">
          Welcome back,{' '}
          <span className="font-semibold text-[#1d1d1f]">{firstName}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard
          href="/stats"
          label="Current Weight"
          icon={<Scale className="h-4 w-4" />}
          tone="blue"
          value={currentWeight ? currentWeight.toFixed(1) : '—'}
          unit="lbs"
        />
        <KPICard
          href="/workouts"
          label="Workouts"
          icon={<Dumbbell className="h-4 w-4" />}
          tone="pink"
          value={String(workoutCount)}
          unit="this wk"
        />
        <KPICard
          href="/check-in"
          label="Day Streak"
          icon={<Flame className="h-4 w-4" />}
          tone="coral"
          value={String(streak)}
          unit="days"
        />
        {sleepHours !== null ? (
          <KPICard
            href="/check-in"
            label="Sleep Last Night"
            icon={<Moon className="h-4 w-4" />}
            tone="gold"
            value={String(sleepHours)}
            unit="hrs"
          />
        ) : waterOz !== null ? (
          <KPICard
            href="/check-in"
            label="Water Today"
            icon={<Droplet className="h-4 w-4" />}
            tone="gold"
            value={String(waterOz)}
            unit="oz"
          />
        ) : (
          <KPICard
            href="/check-in"
            label="Sleep Last Night"
            icon={<Moon className="h-4 w-4" />}
            tone="gold"
            value="—"
            unit="hrs"
          />
        )}
      </div>

      {macroPlan && (
        <MacroCard
          calories={macroPlan.calories}
          protein={macroPlan.protein}
          carbs={macroPlan.carbs}
          fat={macroPlan.fat}
          caloriesConsumed={caloriesConsumedToday}
        />
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Recovery</h2>
          <a
            href="/check-in"
            className="text-[13px] font-medium text-[#3B9DFF]"
          >
            See All
          </a>
        </div>
        <RecoveryRow
          href="/check-in"
          icon={<Apple className="h-5 w-5" />}
          title="Daily Check-in"
          value={todayCheckin ? 'Logged' : 'Pending'}
          progress={todayCheckin ? 100 : 0}
          subLabel={
            todayCheckin
              ? [
                  todayCheckin.sleep_hours !== null
                    ? `Sleep ${todayCheckin.sleep_hours}h`
                    : null,
                  todayCheckin.stress_level !== null
                    ? `Stress ${todayCheckin.stress_level}/5`
                    : null,
                  todayCheckin.energy_level !== null
                    ? `Energy ${todayCheckin.energy_level}/4`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Logged'
              : 'Log how you slept and how you feel today'
          }
          tone={todayCheckin ? 'green' : 'gold'}
        />
      </div>

      <WorkoutsCard
        weekCount={workoutCount}
        weekTarget={5}
        weekBars={weekBars}
        recent={recentWorkouts.map((w) => ({
          id: w.id,
          name: w.name,
          workout_date: w.workout_date,
          duration_min: w.duration_minutes,
          kcal: null,
        }))}
      />

      <WeightTrendCard
        current={currentWeight}
        goal={targetWeight}
        data={weightSeries}
        message={
          weeklyChange === null
            ? 'Log a few weigh-ins to start tracking your trend.'
            : weeklyChange < 0
              ? `Down ${Math.abs(weeklyChange).toFixed(1)} lbs this week — keep it up.`
              : weeklyChange > 0
                ? `Up ${weeklyChange.toFixed(1)} lbs this week — stay consistent.`
                : 'Holding steady this week.'
        }
      />

      <StatTriple
        stats={[
          {
            value: currentWeight ? `${currentWeight.toFixed(1)}` : '—',
            label: 'Current lbs',
          },
          {
            value:
              weeklyChange !== null
                ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(1)}`
                : '—',
            label: 'Week change',
          },
          {
            value: targetWeight ? `${targetWeight}` : '—',
            label: 'Goal lbs',
          },
        ]}
      />
    </div>
  );
}
