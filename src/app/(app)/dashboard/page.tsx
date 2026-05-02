import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  Scale, Dumbbell, Camera, TrendingUp, TrendingDown,
  Minus, ArrowRight, Flame,
  ChevronRight, Apple
} from 'lucide-react';
import { WeightChart } from '@/components/charts/weight-chart';
import type { Profile, BodyStat, WorkoutLog, ClientMacroPlan, DailyCheckin } from '@/types/database';
import { DashboardCheckIn } from './dashboard-checkin';
import { getDateStringInTimezone } from '@/lib/date';
import { isNewUI } from '@/lib/feature-flags';
import { DashboardV2 } from './dashboard-v2';

export const dynamic = 'force-dynamic';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null };

  if (!profile) {
    redirect('/login');
  }

  // Compute "today" in the user's timezone — server runs in UTC
  const userTimezone = profile.timezone || 'UTC';
  const today = getDateStringInTimezone(userTimezone);
  const thirtyDaysAgo = getDateStringInTimezone(
    userTimezone,
    new Date(Date.now() - 30 * 86400000),
  );
  const sevenDaysAgo = getDateStringInTimezone(
    userTimezone,
    new Date(Date.now() - 7 * 86400000),
  );

  const [statsRes, workoutsRes, macroPlanRes, checkinsRes, foodLogsRes] = await Promise.all([
    supabase.from('body_stats').select('*').eq('user_id', user.id)
      .gte('recorded_at', thirtyDaysAgo)
      .order('recorded_at', { ascending: false }),
    supabase.from('workout_logs').select('*', { count: 'exact' }).eq('user_id', user.id)
      .gte('workout_date', sevenDaysAgo)
      .order('workout_date', { ascending: false }),
    supabase.from('client_macro_plans').select('*').eq('client_id', user.id).single(),
    supabase.from('daily_checkins').select('*').eq('user_id', user.id)
      .order('date', { ascending: false }).limit(14),
    supabase.from('food_logs').select('calories_logged').eq('user_id', user.id).eq('log_date', today),
  ]);

  const allStats = (statsRes.data || []) as BodyStat[];
  const recentWorkouts = (workoutsRes.data || []) as WorkoutLog[];
  const workoutCount = (workoutsRes.count || 0) as number;
  const macroPlan = macroPlanRes.data as ClientMacroPlan | null;
  const allCheckins = (checkinsRes.data || []) as DailyCheckin[];
  const caloriesConsumedToday = (foodLogsRes.data || []).reduce(
    (sum: number, row: { calories_logged: number | null }) => sum + (row.calories_logged ?? 0),
    0,
  );

  const todayCheckin = allCheckins.find(c => c.date === today) || null;
  const todayWeight = allStats.find(s => s.recorded_at === today)?.weight_lbs ?? null;

  // Merge body_stats and daily_checkins by date into a unified history
  const historyMap = new Map<string, {
    date: string;
    weight_lbs: number | null;
    sleep_hours: number | null;
    water_oz: number | null;
    stress_level: number | null;
    notes: string | null;
  }>();

  allCheckins.forEach(c => {
    historyMap.set(c.date, {
      date: c.date,
      weight_lbs: null,
      sleep_hours: c.sleep_hours,
      water_oz: c.water_oz,
      stress_level: c.stress_level,
      notes: c.notes,
    });
  });

  allStats.forEach(s => {
    const date = s.recorded_at;
    const existing = historyMap.get(date);
    if (existing) {
      existing.weight_lbs = s.weight_lbs;
      if (!existing.notes && s.notes) existing.notes = s.notes;
    } else {
      historyMap.set(date, {
        date,
        weight_lbs: s.weight_lbs,
        sleep_hours: null,
        water_oz: null,
        stress_level: null,
        notes: s.notes,
      });
    }
  });

  const recentHistory = Array.from(historyMap.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  // Calculate stats
  const currentWeight = allStats[0]?.weight_lbs || null;
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const weekAgoStats = allStats.filter(s => new Date(s.recorded_at) <= weekAgo);
  const weekAgoWeight = weekAgoStats[0]?.weight_lbs || null;
  const weeklyChange = currentWeight && weekAgoWeight ? currentWeight - weekAgoWeight : null;

  // Streak
  let streak = 0;
  if (allStats.length > 0) {
    const sorted = [...allStats].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    let cur = new Date();
    for (const stat of sorted) {
      const d = new Date(stat.recorded_at);
      if (Math.floor((cur.getTime() - d.getTime()) / 86400000) <= 1 && stat.weight_lbs) {
        streak++;
        cur = d;
      } else break;
    }
  }

  // ── v2 design system branch ─────────────────────────────────────
  if (isNewUI()) {
    const weekBars: { day: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = getDateStringInTimezone(userTimezone, d);
      const count = recentWorkouts.filter((w) => w.workout_date === dateStr).length;
      weekBars.push({ day: DAY_LABELS[d.getDay()], value: count });
    }

    return (
      <DashboardV2
        profile={{
          full_name: profile.full_name,
          email: profile.email,
          target_weight_lbs: profile.target_weight_lbs,
        }}
        allStats={allStats}
        recentWorkouts={recentWorkouts}
        workoutCount={workoutCount}
        macroPlan={macroPlan}
        todayCheckin={todayCheckin}
        caloriesConsumedToday={caloriesConsumedToday}
        streak={streak}
        weekBars={weekBars}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[21px] font-semibold text-[var(--theme-text)]">
          Welcome back, {profile.full_name?.split(' ')[0] || profile.email?.split('@')[0] || 'there'}!
        </h1>
        <p className="text-[14px] text-[var(--theme-text-secondary)] mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ============ DAILY CHECK-IN (inline) ============ */}
      <DashboardCheckIn
        todayCheckin={todayCheckin}
        todayWeight={todayWeight}
        recentHistory={recentHistory}
        lastWeight={currentWeight}
      />

      {/* ============ YOUR NUTRITION PLAN (Coach-assigned) ============ */}
      {macroPlan && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Apple className="h-5 w-5 text-[var(--theme-success)]" />
            <h2 className="text-[17px] font-semibold text-[var(--theme-text)]">Your Nutrition Plan</h2>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-[8px] bg-[var(--theme-bg)]">
                  <p className="text-2xl font-bold text-[var(--theme-text)]">{macroPlan.calories}</p>
                  <p className="text-[12px] text-[var(--theme-text-secondary)]">Calories</p>
                </div>
                <div className="text-center p-3 rounded-[8px] bg-[var(--theme-bg)]">
                  <p className="text-2xl font-bold text-[var(--theme-text)]">{macroPlan.protein}g</p>
                  <p className="text-[12px] text-[var(--theme-text-secondary)]">Protein</p>
                </div>
                <div className="text-center p-3 rounded-[8px] bg-[var(--theme-bg)]">
                  <p className="text-2xl font-bold text-[var(--theme-text)]">{macroPlan.carbs}g</p>
                  <p className="text-[12px] text-[var(--theme-text-secondary)]">Carbs</p>
                </div>
                <div className="text-center p-3 rounded-[8px] bg-[var(--theme-bg)]">
                  <p className="text-2xl font-bold text-[var(--theme-text)]">{macroPlan.fat}g</p>
                  <p className="text-[12px] text-[var(--theme-text-secondary)]">Fat</p>
                </div>
              </div>
              {macroPlan.notes && (
                <p className="text-[14px] text-[var(--theme-text-secondary)] mt-3 italic">{macroPlan.notes}</p>
              )}
              <p className="text-[12px] text-[var(--theme-text-muted)] mt-2">
                Set by your coach &middot; {new Date(macroPlan.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ============ WORKOUTS SECTION ============ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[var(--theme-success)]" />
            <h2 className="text-[17px] font-semibold text-[var(--theme-text)]">Workouts</h2>
          </div>
          <Link href="/workouts" className="text-[14px] text-[var(--theme-primary-dark)] hover:underline flex items-center gap-1">
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/workouts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[rgba(52,199,89,0.08)] rounded-[8px]">
                    <Dumbbell className="h-5 w-5 text-[var(--theme-success)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--theme-text)]">{workoutCount}</p>
                    <p className="text-[12px] text-[var(--theme-text-secondary)]">This week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/workouts/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-[var(--theme-border)]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--theme-bg)] rounded-[8px]">
                    <ArrowRight className="h-5 w-5 text-[var(--theme-text-muted)]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[var(--theme-text)]">Log Workout</p>
                    <p className="text-[12px] text-[var(--theme-text-secondary)]">Track progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {recentWorkouts.length > 0 && (
          <Card className="mt-3">
            <CardContent className="p-4">
              <div className="space-y-2">
                {recentWorkouts.slice(0, 3).map((workout) => (
                  <Link key={workout.id} href={`/workouts/${workout.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-[8px] hover:bg-[var(--theme-bg)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[rgba(52,199,89,0.08)] rounded-[8px]">
                          <Dumbbell className="h-3 w-3 text-[var(--theme-success)]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[var(--theme-text)]">{workout.name || 'Workout'}</p>
                          <p className="text-[12px] text-[var(--theme-text-secondary)]">
                            {new Date(workout.workout_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--theme-text-muted)]" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ============ STATS & PROGRESS SECTION ============ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[var(--theme-primary)]" />
            <h2 className="text-[17px] font-semibold text-[var(--theme-text)]">Stats & Progress</h2>
          </div>
          <Link href="/stats" className="text-[14px] text-[var(--theme-primary-dark)] hover:underline flex items-center gap-1">
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Link href="/stats">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[rgba(0,113,227,0.08)] rounded-[8px]">
                    <Scale className="h-5 w-5 text-[var(--theme-primary)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--theme-text)]">{currentWeight || '—'}</p>
                    <p className="text-[12px] text-[var(--theme-text-secondary)]">Current lbs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/stats">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-[8px] ${weeklyChange && weeklyChange < 0 ? 'bg-[rgba(52,199,89,0.08)]' : weeklyChange && weeklyChange > 0 ? 'bg-[rgba(255,59,48,0.08)]' : 'bg-[var(--theme-bg)]'}`}>
                    {weeklyChange && weeklyChange < 0 ? (
                      <TrendingDown className="h-5 w-5 text-[var(--theme-success)]" />
                    ) : weeklyChange && weeklyChange > 0 ? (
                      <TrendingUp className="h-5 w-5 text-[var(--theme-error)]" />
                    ) : (
                      <Minus className="h-5 w-5 text-[var(--theme-text-muted)]" />
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--theme-text)]">
                      {weeklyChange !== null ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(1)}` : '—'}
                    </p>
                    <p className="text-[12px] text-[var(--theme-text-secondary)]">Week change</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/check-in">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[rgba(255,149,0,0.08)] rounded-[8px]">
                    <Flame className="h-5 w-5 text-[var(--theme-warning)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--theme-text)]">{streak}</p>
                    <p className="text-[12px] text-[var(--theme-text-secondary)]">Day streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/photos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[rgba(0,113,227,0.08)] rounded-[8px]">
                    <Camera className="h-5 w-5 text-[var(--theme-primary)]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[var(--theme-text)]">Photos</p>
                    <p className="text-[12px] text-[var(--theme-text-secondary)]">Track visually</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Weight Trend</CardTitle>
              <Link href="/stats" className="text-[14px] text-[var(--theme-primary-dark)] hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <WeightChart data={allStats} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
