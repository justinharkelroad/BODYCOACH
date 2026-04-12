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

export const dynamic = 'force-dynamic';

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

  // Fetch stats for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const today = new Date().toISOString().split('T')[0];

  const [statsRes, workoutsRes, macroPlanRes, checkinsRes] = await Promise.all([
    supabase.from('body_stats').select('*').eq('user_id', user.id)
      .gte('recorded_at', thirtyDaysAgo.toISOString().split('T')[0])
      .order('recorded_at', { ascending: false }),
    supabase.from('workout_logs').select('*', { count: 'exact' }).eq('user_id', user.id)
      .gte('workout_date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
      .order('workout_date', { ascending: false }),
    supabase.from('client_macro_plans').select('*').eq('client_id', user.id).single(),
    supabase.from('daily_checkins').select('*').eq('user_id', user.id)
      .order('date', { ascending: false }).limit(14),
  ]);

  const allStats = (statsRes.data || []) as BodyStat[];
  const recentWorkouts = (workoutsRes.data || []) as WorkoutLog[];
  const workoutCount = (workoutsRes.count || 0) as number;
  const macroPlan = macroPlanRes.data as ClientMacroPlan | null;
  const allCheckins = (checkinsRes.data || []) as DailyCheckin[];

  const todayCheckin = allCheckins.find(c => c.date === today) || null;
  const recentCheckins = allCheckins.slice(0, 10);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[21px] font-semibold text-[#1d1d1f]">
          Welcome back, {profile.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-[14px] text-[#86868b] mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ============ DAILY CHECK-IN (inline) ============ */}
      <DashboardCheckIn
        todayCheckin={todayCheckin}
        recentCheckins={recentCheckins}
        lastWeight={currentWeight}
      />

      {/* ============ YOUR NUTRITION PLAN (Coach-assigned) ============ */}
      {macroPlan && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Apple className="h-5 w-5 text-[var(--theme-success)]" />
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Your Nutrition Plan</h2>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-[8px] bg-[#f5f5f7]">
                  <p className="text-2xl font-bold text-[#1d1d1f]">{macroPlan.calories}</p>
                  <p className="text-[12px] text-[#86868b]">Calories</p>
                </div>
                <div className="text-center p-3 rounded-[8px] bg-[#f5f5f7]">
                  <p className="text-2xl font-bold text-[#1d1d1f]">{macroPlan.protein}g</p>
                  <p className="text-[12px] text-[#86868b]">Protein</p>
                </div>
                <div className="text-center p-3 rounded-[8px] bg-[#f5f5f7]">
                  <p className="text-2xl font-bold text-[#1d1d1f]">{macroPlan.carbs}g</p>
                  <p className="text-[12px] text-[#86868b]">Carbs</p>
                </div>
                <div className="text-center p-3 rounded-[8px] bg-[#f5f5f7]">
                  <p className="text-2xl font-bold text-[#1d1d1f]">{macroPlan.fat}g</p>
                  <p className="text-[12px] text-[#86868b]">Fat</p>
                </div>
              </div>
              {macroPlan.notes && (
                <p className="text-[14px] text-[#86868b] mt-3 italic">{macroPlan.notes}</p>
              )}
              <p className="text-[12px] text-[#aeaeb2] mt-2">
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
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Workouts</h2>
          </div>
          <Link href="/workouts" className="text-[14px] text-[#0066cc] hover:underline flex items-center gap-1">
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
                    <Dumbbell className="h-5 w-5 text-[#34C759]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1d1d1f]">{workoutCount}</p>
                    <p className="text-[12px] text-[#86868b]">This week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/workouts/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-[rgba(0,0,0,0.08)]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#f5f5f7] rounded-[8px]">
                    <ArrowRight className="h-5 w-5 text-[#aeaeb2]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#1d1d1f]">Log Workout</p>
                    <p className="text-[12px] text-[#86868b]">Track progress</p>
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
                    <div className="flex items-center justify-between p-2 rounded-[8px] hover:bg-[#f5f5f7] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[rgba(52,199,89,0.08)] rounded-[8px]">
                          <Dumbbell className="h-3 w-3 text-[#34C759]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[#1d1d1f]">{workout.name || 'Workout'}</p>
                          <p className="text-[12px] text-[#86868b]">
                            {new Date(workout.workout_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#aeaeb2]" />
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
            <Scale className="h-5 w-5 text-[#0071e3]" />
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Stats & Progress</h2>
          </div>
          <Link href="/stats" className="text-[14px] text-[#0066cc] hover:underline flex items-center gap-1">
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
                    <Scale className="h-5 w-5 text-[#0071e3]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1d1d1f]">{currentWeight || '—'}</p>
                    <p className="text-[12px] text-[#86868b]">Current lbs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/stats">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-[8px] ${weeklyChange && weeklyChange < 0 ? 'bg-[rgba(52,199,89,0.08)]' : weeklyChange && weeklyChange > 0 ? 'bg-[rgba(255,59,48,0.08)]' : 'bg-[#f5f5f7]'}`}>
                    {weeklyChange && weeklyChange < 0 ? (
                      <TrendingDown className="h-5 w-5 text-[#34C759]" />
                    ) : weeklyChange && weeklyChange > 0 ? (
                      <TrendingUp className="h-5 w-5 text-[#FF3B30]" />
                    ) : (
                      <Minus className="h-5 w-5 text-[#aeaeb2]" />
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1d1d1f]">
                      {weeklyChange !== null ? `${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(1)}` : '—'}
                    </p>
                    <p className="text-[12px] text-[#86868b]">Week change</p>
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
                    <Flame className="h-5 w-5 text-[#FF9500]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1d1d1f]">{streak}</p>
                    <p className="text-[12px] text-[#86868b]">Day streak</p>
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
                    <Camera className="h-5 w-5 text-[#0071e3]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#1d1d1f]">Photos</p>
                    <p className="text-[12px] text-[#86868b]">Track visually</p>
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
              <Link href="/stats" className="text-[14px] text-[#0066cc] hover:underline">
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
