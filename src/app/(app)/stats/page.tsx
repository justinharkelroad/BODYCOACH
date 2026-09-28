import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightChart } from '@/components/charts/weight-chart';
import { StatsForm } from './stats-form';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Profile } from '@/types/database';
import { getDateStringInTimezone } from '@/lib/date';
import { isNewUI } from '@/lib/feature-flags';
import { StatsV2 } from './stats-v2';
import { WeightHistoryList } from '@/components/weight-history-list';
import { getAllBodyStats } from '@/lib/weight-history';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Resolve user's timezone so "today" matches their clock, not UTC
  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'timezone'> | null };
  const userTimezone = profile?.timezone || 'UTC';

  const stats = await getAllBodyStats(supabase, user.id);
  const weighIns = stats.filter((stat) => stat.weight_lbs !== null);

  // Check if already logged today
  const today = getDateStringInTimezone(userTimezone);
  const todayStat = stats?.find((s) => s.recorded_at === today);

  // Calculate statistics
  const latestWeight = weighIns[0]?.weight_lbs ?? null;
  const startWeight = weighIns[weighIns.length - 1]?.weight_lbs ?? null;
  const totalChange = latestWeight !== null && startWeight !== null ? latestWeight - startWeight : null;

  // Weekly average
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyStats = weighIns.filter(
    (s) => new Date(s.recorded_at) >= weekAgo && s.weight_lbs
  );
  const weeklyAvg = weeklyStats?.length
    ? weeklyStats.reduce((sum, s) => sum + (s.weight_lbs || 0), 0) / weeklyStats.length
    : null;

  if (isNewUI()) {
    return (
      <StatsV2
        userId={user.id}
        stats={stats}
        todayStat={todayStat}
        latestWeight={latestWeight ?? null}
        startWeight={startWeight ?? null}
        totalChange={totalChange}
        weeklyAvg={weeklyAvg}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">Body Stats</h1>
        <p className="text-[var(--neutral-gray)] mt-1">Track your weight and measurements over time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Form */}
        <div className="lg:col-span-1">
          <StatsForm
            userId={user.id}
            existingStatId={todayStat?.id}
            defaultValues={todayStat}
          />
        </div>

        {/* Right column - Chart and History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[var(--neutral-gray)]">Current</p>
                <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                  {latestWeight ? `${latestWeight} lbs` : '—'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[var(--neutral-gray)]">7-Day Avg</p>
                <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                  {weeklyAvg ? `${weeklyAvg.toFixed(1)} lbs` : '—'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-[var(--neutral-gray)]">Total Change</p>
                <div className="flex items-center">
                  <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
                    {totalChange !== null ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} lbs` : '—'}
                  </p>
                  {totalChange !== null && (
                    <span className={`ml-2 ${totalChange > 0 ? 'text-[var(--success)]' : totalChange < 0 ? 'text-[var(--accent-coral)]' : 'text-[var(--neutral-gray)]'}`}>
                      {totalChange > 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : totalChange < 0 ? (
                        <TrendingDown className="h-5 w-5" />
                      ) : (
                        <Minus className="h-5 w-5" />
                      )}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weight Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--neutral-dark)]">Weight Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <WeightChart data={weighIns} />
            </CardContent>
          </Card>

          <WeightHistoryList stats={stats} />
        </div>
      </div>
    </div>
  );
}
