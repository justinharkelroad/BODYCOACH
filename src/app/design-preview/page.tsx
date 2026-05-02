import { Apple, Dumbbell, Flame, Moon, Scale } from 'lucide-react';
import {
  AuroraBackground,
  BottomNav,
  DateHero,
  HeaderBar,
  KPICard,
  MacroCard,
  RecoveryRow,
  StatTriple,
  WeightTrendCard,
  WorkoutsCard,
} from '@/components/v2';

export const dynamic = 'force-static';

export default function DashboardPreviewDemoPage() {
  const weightSeries = [
    { label: 'Apr 4', value: 184.2 },
    { label: 'Apr 8', value: 183.5 },
    { label: 'Apr 12', value: 182.9 },
    { label: 'Apr 16', value: 182.4 },
    { label: 'Apr 20', value: 181.8 },
    { label: 'Apr 24', value: 181.2 },
    { label: 'Apr 28', value: 180.6 },
    { label: 'May 2', value: 179.8 },
  ];

  const weekBars = [
    { day: 'M', value: 1 },
    { day: 'T', value: 0 },
    { day: 'W', value: 1 },
    { day: 'T', value: 1 },
    { day: 'F', value: 0 },
    { day: 'S', value: 1 },
    { day: 'S', value: 0 },
  ];

  const recent = [
    {
      id: '1',
      name: 'Upper Body Strength',
      workout_date: '2026-05-01',
      duration_min: 45,
      kcal: null,
    },
    {
      id: '2',
      name: 'HIIT Cardio',
      workout_date: '2026-04-29',
      duration_min: 30,
      kcal: null,
    },
    {
      id: '3',
      name: 'Lower Body + Core',
      workout_date: '2026-04-27',
      duration_min: 50,
      kcal: null,
    },
  ];

  return (
    <AuroraBackground>
      <div className="mx-auto max-w-md pb-32">
        <HeaderBar
          initials="JU"
          notificationCount={3}
          deviceName="BodyCoach"
          deviceStatus="12 day streak"
        />
        <DateHero date={new Date('2026-05-02')} />

        <div className="mt-2 px-5">
          <p className="text-[14px] text-[#6e6e73]">
            Welcome back, <span className="font-semibold text-[#1d1d1f]">Justin</span>
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 px-5">
          <KPICard
            label="Current Weight"
            icon={<Scale className="h-4 w-4" />}
            tone="blue"
            value="179.8"
            unit="lbs"
          />
          <KPICard
            label="Workouts"
            icon={<Dumbbell className="h-4 w-4" />}
            tone="pink"
            value="4"
            unit="this wk"
          />
          <KPICard
            label="Day Streak"
            icon={<Flame className="h-4 w-4" />}
            tone="coral"
            value="12"
            unit="days"
          />
          <KPICard
            label="Sleep Last Night"
            icon={<Moon className="h-4 w-4" />}
            tone="gold"
            value="7.5"
            unit="hrs"
          />
        </div>

        <div className="mt-5 px-5">
          <MacroCard
            calories={2400}
            protein={180}
            carbs={240}
            fat={70}
            caloriesConsumed={1620}
          />
        </div>

        <div className="mt-4 px-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Recovery</h2>
            <a href="#" className="text-[13px] font-medium text-[#3B9DFF]">
              See All
            </a>
          </div>
          <RecoveryRow
            icon={<Apple className="h-5 w-5" />}
            title="Daily Check-in"
            value="Logged"
            progress={100}
            subLabel="Sleep 7.5h · Stress 2/5 · Energy 4/4"
            tone="green"
          />
        </div>

        <div className="mt-4 px-5">
          <WorkoutsCard
            weekCount={4}
            weekTarget={5}
            weekBars={weekBars}
            recent={recent}
          />
        </div>

        <div className="mt-4 px-5">
          <WeightTrendCard
            current={179.8}
            goal={170}
            data={weightSeries}
            message="Down 4.4 lbs over the last month — great consistency."
          />
        </div>

        <div className="mt-4 px-5">
          <StatTriple
            stats={[
              { value: '179.8', label: 'Current lbs' },
              { value: '-1.2', label: 'Week change' },
              { value: '170', label: 'Goal lbs' },
            ]}
          />
        </div>

        <BottomNav />
      </div>
    </AuroraBackground>
  );
}
