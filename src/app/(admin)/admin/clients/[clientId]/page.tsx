import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeightChart } from '@/components/charts/weight-chart';
import { AdminPhotoGrid } from './photo-grid';
import { ArchiveButton } from '@/components/admin/archive-button';
import { CoachNotesSection } from '@/components/admin/coach-notes-section';
import { MacroPlanForm } from '@/components/admin/macro-plan-form';
import { CheckinDayPicker } from '@/components/admin/checkin-day-picker';
import {
  ArrowLeft, Scale, Camera, StickyNote, TrendingUp, TrendingDown, Minus,
  Droplets, Moon, Brain, Apple, Dumbbell, Flame, Clock, Mail,
} from 'lucide-react';
import type { BodyStat, ProgressPhoto, DailyCheckin, Profile, CoachNote, ClientMacroPlan, WorkoutLog, WorkoutExercise, UserStreak } from '@/types/database';

export const dynamic = 'force-dynamic';

interface PhotoWithUrl extends ProgressPhoto {
  signedUrl: string | null;
}

const stressEmojis: Record<number, string> = { 1: '😫', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };

const goalLabels: Record<string, string> = {
  lose_fat: 'Lose fat',
  maintain: 'Maintain',
  gain_muscle: 'Gain muscle',
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify coach-client relationship
  const { data: relationship } = await supabase
    .from('coach_clients')
    .select('id, checkin_day')
    .eq('coach_id', user.id)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single();

  if (!relationship) notFound();

  const checkinDay = (relationship as { id: string; checkin_day: number | null }).checkin_day;

  // Fetch all client data in parallel
  const [profileRes, statsRes, photosRes, checkinsRes, notesRes, macroRes, workoutsRes, streakRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, goal, activity_level, created_at').eq('id', clientId).single(),
    supabase.from('body_stats').select('*').eq('user_id', clientId).order('recorded_at', { ascending: false }).limit(90),
    supabase.from('progress_photos').select('*').eq('user_id', clientId).order('taken_at', { ascending: false }),
    supabase.from('daily_checkins').select('*').eq('user_id', clientId).order('date', { ascending: false }).limit(30),
    supabase.from('coach_notes').select('*').eq('coach_id', user.id).eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('client_macro_plans').select('*').eq('client_id', clientId).single(),
    supabase.from('workout_logs').select('*').eq('user_id', clientId).order('workout_date', { ascending: false }).limit(20),
    supabase.from('user_streaks').select('*').eq('user_id', clientId).single(),
  ]);

  const profile = profileRes.data as Pick<Profile, 'id' | 'full_name' | 'email' | 'goal' | 'activity_level' | 'created_at'> | null;
  const stats = (statsRes.data || []) as BodyStat[];
  const photos = (photosRes.data || []) as ProgressPhoto[];
  const checkins = (checkinsRes.data || []) as DailyCheckin[];
  const coachNotes = (notesRes.data || []) as CoachNote[];
  const macroPlan = (macroRes.data || null) as ClientMacroPlan | null;
  const workouts = (workoutsRes.data || []) as WorkoutLog[];
  const streak = (streakRes.data || null) as UserStreak | null;

  // Fetch exercises for all workouts
  const workoutIds = workouts.map(w => w.id);
  const exercises: WorkoutExercise[] = workoutIds.length > 0
    ? ((await supabase
        .from('workout_exercises')
        .select('*')
        .in('workout_log_id', workoutIds)
        .order('order_index', { ascending: true })
      ).data || []) as WorkoutExercise[]
    : [];

  // Group exercises by workout
  const exercisesByWorkout = exercises.reduce<Record<string, WorkoutExercise[]>>((acc, ex) => {
    if (!acc[ex.workout_log_id]) acc[ex.workout_log_id] = [];
    acc[ex.workout_log_id].push(ex);
    return acc;
  }, {});

  // Count workouts this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const workoutsThisWeek = workouts.filter(w => new Date(w.workout_date) >= weekAgo).length;

  if (!profile) notFound();

  // Generate signed URLs for photos
  const photosWithUrls: PhotoWithUrl[] = await Promise.all(
    photos.map(async (photo) => {
      const { data: urlData } = await supabase.storage
        .from('progress-photos')
        .createSignedUrl(photo.photo_url, 3600);
      return { ...photo, signedUrl: urlData?.signedUrl || null };
    })
  );

  const latestWeight = stats[0]?.weight_lbs;
  const startWeight = stats.length > 0 ? stats[stats.length - 1]?.weight_lbs : null;
  const totalChange = latestWeight && startWeight ? latestWeight - startWeight : null;
  const displayName = profile.full_name || profile.email.split('@')[0];
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          All clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--theme-text)]">{displayName}</h1>
            <p className="text-[var(--theme-text-secondary)]">
              {goalLabels[profile.goal] || profile.goal} &middot; Member since {memberSince}
            </p>
          </div>
          <ArchiveButton clientId={clientId} clientName={displayName} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6">
          <p className="text-sm text-[var(--theme-text-muted)]">Current Weight</p>
          <p className="text-2xl font-semibold text-[var(--theme-text)]">{latestWeight ? `${latestWeight} lbs` : '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-[var(--theme-text-muted)]">Total Change</p>
          <div className="flex items-center gap-1">
            {totalChange !== null ? (
              <>
                {totalChange > 0 ? <TrendingUp className="h-4 w-4 text-[var(--theme-success)]" /> : totalChange < 0 ? <TrendingDown className="h-4 w-4 text-[var(--theme-info)]" /> : <Minus className="h-4 w-4 text-[var(--theme-text-muted)]" />}
                <p className="text-2xl font-semibold text-[var(--theme-text)]">{totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} lbs</p>
              </>
            ) : <p className="text-2xl font-semibold text-[var(--theme-text)]">—</p>}
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-[var(--theme-text-muted)]">Streak</p>
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-[var(--theme-warning)]" />
            <p className="text-2xl font-semibold text-[var(--theme-text)]">{streak?.current_streak ?? 0} days</p>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-[var(--theme-text-muted)]">Workouts (7d)</p>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4 text-[var(--theme-success)]" />
            <p className="text-2xl font-semibold text-[var(--theme-text)]">{workoutsThisWeek}</p>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-[var(--theme-text-muted)]">Photos</p>
          <p className="text-2xl font-semibold text-[var(--theme-text)]">{photos.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <p className="text-sm text-[var(--theme-text-muted)]">Check-ins (30d)</p>
          <p className="text-2xl font-semibold text-[var(--theme-text)]">{checkins.length}</p>
        </CardContent></Card>
      </div>

      {/* Macro Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
            Nutrition Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MacroPlanForm clientId={clientId} existingPlan={macroPlan} />
        </CardContent>
      </Card>

      {/* Weekly Check-in Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
            Weekly Check-in Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[14px] text-[var(--theme-text-secondary)] mb-3">Set which day this client receives their weekly check-in email.</p>
          <CheckinDayPicker clientId={clientId} currentDay={checkinDay} />
        </CardContent>
      </Card>

      {/* Coach Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
            Coach Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CoachNotesSection clientId={clientId} initialNotes={coachNotes} />
        </CardContent>
      </Card>

      {/* Workouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
            Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workouts.length === 0 ? (
            <p className="text-[var(--theme-text-muted)] text-sm py-8 text-center">No workouts logged yet.</p>
          ) : (
            <div className="space-y-4">
              {workouts.map(workout => {
                const wExercises = exercisesByWorkout[workout.id] || [];
                return (
                  <div key={workout.id} className="p-4 rounded-xl bg-[var(--theme-bg-alt)] border border-[var(--theme-divider)]">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--theme-text)]">
                          {workout.name || 'Workout'}
                        </h4>
                        <p className="text-xs text-[var(--theme-text-secondary)]">
                          {new Date(workout.workout_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--theme-text-muted)]">
                        {workout.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {workout.duration_minutes}m
                          </span>
                        )}
                        <span>{wExercises.length} exercises</span>
                      </div>
                    </div>
                    {wExercises.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {wExercises.map(ex => (
                          <div key={ex.id} className="flex items-center justify-between text-sm py-1.5 border-b border-[var(--theme-divider)] last:border-0">
                            <span className="text-[var(--theme-text)]">{ex.exercise_name}</span>
                            <div className="flex gap-3 text-xs text-[var(--theme-text-secondary)]">
                              {ex.sets && <span>{ex.sets} sets</span>}
                              {ex.reps && <span>{ex.reps} reps</span>}
                              {ex.weight_lbs && <span>{ex.weight_lbs} lbs</span>}
                              {ex.duration_seconds && <span>{ex.duration_seconds}s</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {workout.notes && (
                      <p className="text-xs text-[var(--theme-text-secondary)] mt-2 italic">{workout.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
            Weight History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart data={stats} />
          {stats.length > 0 && (
            <div className="mt-6 border-t border-[var(--theme-divider)] pt-4">
              <h4 className="text-sm font-medium text-[var(--theme-text-secondary)] mb-3">Recent Entries</h4>
              <div className="space-y-2">
                {stats.slice(0, 10).map(stat => (
                  <div key={stat.id} className="flex items-start justify-between py-2 border-b border-[var(--theme-divider)] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[var(--theme-text)]">
                        {new Date(stat.recorded_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      {stat.notes && <p className="text-xs text-[var(--theme-text-secondary)] mt-0.5 max-w-md">{stat.notes}</p>}
                    </div>
                    <p className="text-sm font-semibold text-[var(--theme-text)]">{stat.weight_lbs ? `${stat.weight_lbs} lbs` : '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
            Progress Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photosWithUrls.length === 0 ? (
            <p className="text-[var(--theme-text-muted)] text-sm py-8 text-center">No photos uploaded yet.</p>
          ) : (
            <AdminPhotoGrid photos={photosWithUrls} />
          )}
        </CardContent>
      </Card>

      {/* Check-in History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[var(--theme-primary)]" aria-hidden="true" />
            Check-in History (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkins.length === 0 ? (
            <p className="text-[var(--theme-text-muted)] text-sm py-8 text-center">No check-ins yet.</p>
          ) : (
            <div className="space-y-3">
              {checkins.map(checkin => (
                <div key={checkin.id} className="flex items-start gap-4 py-3 border-b border-[var(--theme-divider)] last:border-0">
                  <div className="text-sm font-medium text-[var(--theme-text)] min-w-[80px]">
                    {new Date(checkin.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex gap-4 min-w-[160px] text-sm">
                    {checkin.sleep_hours && (
                      <span className="flex items-center gap-1" title="Sleep">
                        <Moon className="h-3.5 w-3.5 text-[var(--theme-text-muted)]" />
                        {checkin.sleep_hours}h
                      </span>
                    )}
                    {checkin.water_oz && (
                      <span className="flex items-center gap-1" title="Water">
                        <Droplets className="h-3.5 w-3.5 text-[var(--theme-text-muted)]" />
                        {checkin.water_oz}oz
                      </span>
                    )}
                    {checkin.stress_level && (
                      <span title="Stress">{stressEmojis[checkin.stress_level]}</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--theme-text-secondary)] flex-1">
                    {checkin.notes || <span className="text-[var(--theme-text-muted)] italic">No notes</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
