import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckInForm } from './check-in-form';
import { Scale, CheckCircle2, Clock } from 'lucide-react';
import type { CheckIn, BodyStat, DailyCheckin, Profile } from '@/types/database';
import { getDateStringInTimezone } from '@/lib/date';
import { isNewUI } from '@/lib/feature-flags';
import { CheckInV2 } from './check-in-v2';

export const dynamic = 'force-dynamic';

export default async function CheckInPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get pending check-ins
  const { data: pendingCheckIns } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .is('completed_at', null)
    .eq('skipped', false)
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true }) as { data: CheckIn[] | null };

  // Resolve user's timezone so "today" matches their clock, not UTC
  const { data: tzProfile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'timezone'> | null };
  const userTimezone = tzProfile?.timezone || 'UTC';

  // Get today's stats (if already logged)
  const today = getDateStringInTimezone(userTimezone);
  const { data: todayStat } = await supabase
    .from('body_stats')
    .select('*')
    .eq('user_id', user.id)
    .eq('recorded_at', today)
    .single() as { data: BodyStat | null };

  // Get today's daily checkin (sleep, water, stress)
  const { data: todayCheckin } = await supabase
    .from('daily_checkins')
    .select('sleep_hours, water_oz, stress_level')
    .eq('user_id', user.id)
    .eq('date', today)
    .single() as { data: Pick<DailyCheckin, 'sleep_hours' | 'water_oz' | 'stress_level'> | null };

  // Get recent weight for reference
  const { data: recentStats } = await supabase
    .from('body_stats')
    .select('weight_lbs, recorded_at')
    .eq('user_id', user.id)
    .not('weight_lbs', 'is', null)
    .order('recorded_at', { ascending: false })
    .limit(7) as { data: BodyStat[] | null };

  const lastWeight = recentStats?.[0]?.weight_lbs;
  const weekAgoWeight = recentStats?.[recentStats.length - 1]?.weight_lbs;

  if (isNewUI()) {
    return (
      <CheckInV2
        todayStat={todayStat}
        todayCheckin={todayCheckin}
        pendingCount={pendingCheckIns?.length ?? 0}
        pendingCheckInId={pendingCheckIns?.[0]?.id}
        lastWeight={lastWeight ?? null}
        weekAgoWeight={weekAgoWeight ?? null}
        recentStats={(recentStats ?? []).map((s) => ({
          weight_lbs: s.weight_lbs,
          recorded_at: s.recorded_at,
        }))}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[var(--theme-text)]">Daily Check-in</h1>
        <p className="text-sm sm:text-base text-[var(--theme-text-secondary)] mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Already Logged Today */}
      {todayStat?.weight_lbs ? (
        <Card className="border-[var(--theme-success)] bg-[color-mix(in_srgb,var(--theme-success)_5%,transparent)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--theme-success)] rounded-full">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--theme-text)]">
                  Already checked in today!
                </h2>
                <p className="text-[var(--theme-text-secondary)]">
                  You logged {todayStat.weight_lbs} lbs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Check-ins */}
          {pendingCheckIns && pendingCheckIns.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-[var(--theme-warning)]">
              <Clock className="h-4 w-4" />
              <span>You have {pendingCheckIns.length} pending check-in{pendingCheckIns.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </>
      )}

      {/* Check-in Form — always visible so user can update sleep/water/stress */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[color-mix(in_srgb,var(--theme-primary)_15%,transparent)] rounded-xl">
              <Scale className="h-5 w-5 text-[var(--theme-primary)]" />
            </div>
            <CardTitle>Check-in</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CheckInForm
            lastWeight={lastWeight || null}
            weekAgoWeight={weekAgoWeight || null}
            pendingCheckInId={pendingCheckIns?.[0]?.id}
            existingCheckin={todayCheckin}
          />
        </CardContent>
      </Card>

      {/* Recent History */}
      {recentStats && recentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Weigh-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentStats.slice(0, 5).map((stat, index) => {
                const prevWeight = recentStats[index + 1]?.weight_lbs;
                const change = prevWeight && stat.weight_lbs
                  ? stat.weight_lbs - prevWeight
                  : null;

                return (
                  <div
                    key={stat.recorded_at}
                    className="flex items-center justify-between py-2 border-b border-[var(--theme-divider)] last:border-0"
                  >
                    <span className="text-[var(--theme-text-secondary)]">
                      {new Date(stat.recorded_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[var(--theme-text)]">
                        {stat.weight_lbs} lbs
                      </span>
                      {change !== null && (
                        <span className={`text-sm ${change > 0 ? 'text-[var(--theme-error)]' : change < 0 ? 'text-[var(--theme-success)]' : 'text-[var(--theme-text-muted)]'}`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
