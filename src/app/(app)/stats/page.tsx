import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightChart } from '@/components/charts/weight-chart';
import { StatsForm } from './stats-form';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import type { BodyStat, Profile } from '@/types/database';
import { getDateStringInTimezone } from '@/lib/date';
import { isNewUI } from '@/lib/feature-flags';
import { StatsV2 } from './stats-v2';

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

  // Fetch all stats for this user (last 90 days)
  const ninetyDaysAgo = getDateStringInTimezone(
    userTimezone,
    new Date(Date.now() - 90 * 86400000),
  );

  const { data: stats } = await supabase
    .from('body_stats')
    .select('*')
    .eq('user_id', user.id)
    .gte('recorded_at', ninetyDaysAgo)
    .order('recorded_at', { ascending: false }) as { data: BodyStat[] | null };

  // Check if already logged today
  const today = getDateStringInTimezone(userTimezone);
  const todayStat = stats?.find((s) => s.recorded_at === today);

  // Calculate statistics
  const latestWeight = stats?.[0]?.weight_lbs;
  const startWeight = stats?.[stats.length - 1]?.weight_lbs;
  const totalChange = latestWeight && startWeight ? latestWeight - startWeight : null;

  // Weekly average
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyStats = stats?.filter(
    (s) => new Date(s.recorded_at) >= weekAgo && s.weight_lbs
  );
  const weeklyAvg = weeklyStats?.length
    ? weeklyStats.reduce((sum, s) => sum + (s.weight_lbs || 0), 0) / weeklyStats.length
    : null;

  if (isNewUI()) {
    return (
      <StatsV2
        userId={user.id}
        stats={stats || []}
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
              <WeightChart data={stats || []} />
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[var(--neutral-dark)]">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && stats.length > 0 ? (
                <div className="space-y-3">
                  {stats.slice(0, 10).map((stat) => (
                    <div
                      key={stat.id}
                      className="flex items-center justify-between py-3 border-b border-[rgba(184,169,232,0.1)] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--primary-light)] rounded-[12px]">
                          <Calendar className="h-4 w-4 text-[var(--primary-deep)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--neutral-dark)]">
                            {new Date(stat.recorded_at).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          {stat.notes && (
                            <p className="text-sm text-[var(--neutral-gray)] truncate max-w-xs">
                              {stat.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--neutral-dark)]">
                          {stat.weight_lbs ? `${stat.weight_lbs} lbs` : '—'}
                        </p>
                        {stat.body_fat_pct && (
                          <p className="text-sm text-[var(--neutral-gray)]">
                            {stat.body_fat_pct}% BF
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--neutral-gray)] text-center py-8">
                  No stats logged yet. Start tracking today!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
