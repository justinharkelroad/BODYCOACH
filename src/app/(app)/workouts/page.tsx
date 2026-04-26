import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus, Calendar, Clock, Sparkles, ClipboardList } from 'lucide-react';
import type { WorkoutLog } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function WorkoutsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch workouts
  const { data: workouts } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('workout_date', { ascending: false })
    .limit(50) as { data: WorkoutLog[] | null };

  // Group workouts by month
  const workoutsByMonth = workouts?.reduce((acc, workout) => {
    const date = new Date(workout.workout_date);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(workout);
    return acc;
  }, {} as Record<string, WorkoutLog[]>) || {};

  // Calculate stats
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);
  const workoutsThisWeek = workouts?.filter(w => new Date(w.workout_date) >= thisWeek).length || 0;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  const workoutsThisMonth = workouts?.filter(w => new Date(w.workout_date) >= thisMonth).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-6 w-6 text-[var(--primary-lavender)]" />
            <h1 className="text-2xl font-semibold text-[var(--neutral-dark)]">Workouts</h1>
          </div>
          <p className="text-[var(--neutral-gray)]">
            Track your training sessions and monitor your progress
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/workouts/templates">
            <Button variant="secondary">
              <ClipboardList className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Link href="/workouts/generate">
            <Button variant="secondary">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
          </Link>
          <Link href="/workouts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--neutral-gray)]">This Week</p>
            <p className="text-2xl font-semibold text-[var(--neutral-dark)]">{workoutsThisWeek}</p>
            <p className="text-xs text-[var(--neutral-gray)]">workouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--neutral-gray)]">This Month</p>
            <p className="text-2xl font-semibold text-[var(--neutral-dark)]">{workoutsThisMonth}</p>
            <p className="text-xs text-[var(--neutral-gray)]">workouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--neutral-gray)]">Total</p>
            <p className="text-2xl font-semibold text-[var(--neutral-dark)]">{workouts?.length || 0}</p>
            <p className="text-xs text-[var(--neutral-gray)]">workouts logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[var(--neutral-gray)]">Avg/Week</p>
            <p className="text-2xl font-semibold text-[var(--neutral-dark)]">
              {workouts && workouts.length > 0
                ? Math.round((workouts.length / Math.max(1, Math.ceil((Date.now() - new Date(workouts[workouts.length - 1].workout_date).getTime()) / (7 * 24 * 60 * 60 * 1000)))) * 10) / 10
                : 0}
            </p>
            <p className="text-xs text-[var(--neutral-gray)]">sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Workout History */}
      {workouts && workouts.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(workoutsByMonth).map(([month, monthWorkouts]) => (
            <div key={month}>
              <h2 className="text-lg font-semibold text-[var(--neutral-dark)] mb-4">{month}</h2>
              <div className="space-y-3">
                {monthWorkouts.map((workout) => (
                  <Link key={workout.id} href={`/workouts/${workout.id}`}>
                    <Card hover className="cursor-pointer">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-[var(--primary-light)] rounded-[12px]">
                              <Dumbbell className="h-5 w-5 text-[var(--primary-deep)]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-[var(--neutral-dark)]">
                                  {workout.name || 'Workout'}
                                </h3>
                                {workout.ai_generated && (
                                  <span className="text-xs bg-[var(--primary-light)] text-[var(--primary-deep)] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    AI
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-[var(--neutral-gray)]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(workout.workout_date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                                {workout.duration_minutes && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {workout.duration_minutes} min
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="p-4 bg-[var(--primary-light)] rounded-full inline-block mb-4">
              <Dumbbell className="h-8 w-8 text-[var(--primary-lavender)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--neutral-dark)] mb-2">No workouts yet</h3>
            <p className="text-[var(--neutral-gray)] mb-6">
              Start logging your workouts to track your progress
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/workouts/generate">
                <Button variant="secondary">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </Link>
              <Link href="/workouts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
