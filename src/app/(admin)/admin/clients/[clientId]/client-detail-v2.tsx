import Link from 'next/link';
import {
  ArrowLeft,
  Apple,
  Brain,
  Camera,
  Calendar,
  Clock,
  Droplets,
  Dumbbell,
  Flame,
  Mail,
  Moon,
  Scale,
  StickyNote,
  TrendingDown,
} from 'lucide-react';
import {
  KPICard,
  StatTriple,
  WeightTrendCard,
} from '@/components/v2';
import { ArchiveButton } from '@/components/admin/archive-button';
import { CoachNotesSection } from '@/components/admin/coach-notes-section';
import { MacroPlanForm } from '@/components/admin/macro-plan-form';
import { CheckinDayPicker } from '@/components/admin/checkin-day-picker';
import { CoachWeightForm } from '@/components/admin/coach-weight-form';
import { CoachWeightHistory } from '@/components/admin/coach-weight-history';
import { AdminPhotoGrid } from './photo-grid';
import type {
  BodyStat,
  ClientMacroPlan,
  CoachNote,
  DailyCheckin,
  ProgressPhoto,
  UserStreak,
  WorkoutExercise,
  WorkoutLog,
} from '@/types/database';

interface PhotoWithUrl extends ProgressPhoto {
  signedUrl: string | null;
}

const stressEmojis: Record<number, string> = {
  1: '😫',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '😄',
};

const goalLabels: Record<string, string> = {
  lose_fat: 'Lose fat',
  maintain: 'Maintain',
  gain_muscle: 'Gain muscle',
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
};

interface ClientDetailV2Props {
  clientId: string;
  profile: {
    id: string;
    full_name: string | null;
    email: string;
    goal: string | null;
    activity_level: string;
    created_at: string;
  };
  stats: BodyStat[];
  photosWithUrls: PhotoWithUrl[];
  checkins: DailyCheckin[];
  coachNotes: CoachNote[];
  macroPlan: ClientMacroPlan | null;
  workouts: WorkoutLog[];
  exercisesByWorkout: Record<string, WorkoutExercise[]>;
  workoutsThisWeek: number;
  streak: UserStreak | null;
  checkinDay: number | null;
}

export function ClientDetailV2({
  clientId,
  profile,
  stats,
  photosWithUrls,
  checkins,
  coachNotes,
  macroPlan,
  workouts,
  exercisesByWorkout,
  workoutsThisWeek,
  streak,
  checkinDay,
}: ClientDetailV2Props) {
  const displayName = profile.full_name || profile.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const latestWeight = stats[0]?.weight_lbs ?? null;
  const startWeight =
    stats.length > 0 ? (stats[stats.length - 1]?.weight_lbs ?? null) : null;
  const totalChange =
    latestWeight !== null && startWeight !== null
      ? latestWeight - startWeight
      : null;

  const weightSeries = [...stats]
    .filter((s) => s.weight_lbs !== null)
    .sort(
      (a, b) =>
        new Date(a.recorded_at).getTime() -
        new Date(b.recorded_at).getTime(),
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
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#3B9DFF] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          All clients
        </Link>
        <ArchiveButton clientId={clientId} clientName={displayName} />
      </div>

      {/* Identity card */}
      <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB8A0] to-[#A8B7FF] text-[20px] font-semibold text-white shadow-md">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] font-bold text-[#1d1d1f]">
              {displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[#6e6e73]">
              {profile.goal && (
                <span className="rounded-full bg-[#DDF6E2] px-2 py-0.5 text-[11px] font-medium text-[#1F8F49]">
                  {goalLabels[profile.goal] || profile.goal}
                </span>
              )}
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stat triple */}
      <StatTriple
        stats={[
          {
            value: latestWeight !== null ? `${latestWeight}` : '—',
            label: 'Current lbs',
          },
          {
            value:
              totalChange !== null
                ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}`
                : '—',
            label: 'Total change',
          },
          {
            value: String(streak?.current_streak ?? 0),
            label: 'Day streak',
          },
        ]}
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPICard
          label="Streak"
          icon={<Flame className="h-4 w-4" />}
          tone="coral"
          value={String(streak?.current_streak ?? 0)}
          unit="days"
        />
        <KPICard
          label="Workouts (7d)"
          icon={<Dumbbell className="h-4 w-4" />}
          tone="pink"
          value={String(workoutsThisWeek)}
          unit="logged"
        />
        <KPICard
          label="Photos"
          icon={<Camera className="h-4 w-4" />}
          tone="blue"
          value={String(photosWithUrls.length)}
        />
        <KPICard
          label="Check-ins (30d)"
          icon={<Calendar className="h-4 w-4" />}
          tone="gold"
          value={String(checkins.length)}
        />
      </div>

      {/* Macro plan */}
      <Section title="Nutrition Plan" icon={<Apple className="h-5 w-5" />} tone="green">
        <MacroPlanForm clientId={clientId} existingPlan={macroPlan} />
      </Section>

      {/* Weekly check-in email */}
      <Section
        title="Weekly Check-in Email"
        icon={<Mail className="h-5 w-5" />}
        tone="blue"
      >
        <p className="mb-3 text-[13px] text-[#6e6e73]">
          Set which day this client receives their weekly check-in email.
        </p>
        <CheckinDayPicker clientId={clientId} currentDay={checkinDay} />
      </Section>

      {/* Coach Notes */}
      <Section
        title="Coach Notes"
        icon={<StickyNote className="h-5 w-5" />}
        tone="gold"
      >
        <CoachNotesSection clientId={clientId} initialNotes={coachNotes} />
      </Section>

      {/* Workouts */}
      <Section
        title="Workouts"
        icon={<Dumbbell className="h-5 w-5" />}
        tone="pink"
      >
        {workouts.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[#9BA3A9]">
            No workouts logged yet.
          </p>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => {
              const wEx = exercisesByWorkout[w.id] || [];
              return (
                <div
                  key={w.id}
                  className="rounded-2xl bg-[#F7F9FC] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#1d1d1f]">
                        {w.name || 'Workout'}
                      </h4>
                      <p className="text-[12px] text-[#6e6e73]">
                        {new Date(w.workout_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[#6e6e73]">
                      {w.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {w.duration_minutes}m
                        </span>
                      )}
                      <span>{wEx.length} exercises</span>
                    </div>
                  </div>
                  {wEx.length > 0 && (
                    <div className="mt-3 divide-y divide-[#E8EDF5]">
                      {wEx.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between py-1.5 text-[13px]"
                        >
                          <span className="text-[#1d1d1f]">{ex.exercise_name}</span>
                          <div className="flex gap-3 text-[12px] text-[#6e6e73]">
                            {ex.sets && <span>{ex.sets} sets</span>}
                            {ex.reps && <span>{ex.reps} reps</span>}
                            {ex.weight_lbs && <span>{ex.weight_lbs} lbs</span>}
                            {ex.duration_seconds && <span>{ex.duration_seconds}s</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {w.notes && (
                    <p className="mt-2 text-[12px] italic text-[#6e6e73]">
                      {w.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Weight history */}
      <WeightTrendCard
        current={latestWeight}
        goal={null}
        data={weightSeries}
        message={
          totalChange === null
            ? 'No weigh-ins logged yet.'
            : totalChange < 0
              ? `Down ${Math.abs(totalChange).toFixed(1)} lbs since starting.`
              : totalChange > 0
                ? `Up ${totalChange.toFixed(1)} lbs since starting.`
                : 'Holding steady.'
        }
      />

      <Section
        title="Log a weigh-in for this client"
        icon={<Scale className="h-5 w-5" />}
        tone="blue"
      >
        <CoachWeightForm clientId={clientId} />
        <div className="mt-4 border-t border-[#F0F4F9] pt-4">
          <CoachWeightHistory clientId={clientId} initialStats={stats} />
        </div>
      </Section>

      {/* Photos */}
      <Section
        title="Progress Photos"
        icon={<Camera className="h-5 w-5" />}
        tone="blue"
      >
        {photosWithUrls.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[#9BA3A9]">
            No photos uploaded yet.
          </p>
        ) : (
          <AdminPhotoGrid photos={photosWithUrls} />
        )}
      </Section>

      {/* Check-in history */}
      <Section
        title="Check-in History (Last 30 Days)"
        icon={<Brain className="h-5 w-5" />}
        tone="gold"
      >
        {checkins.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[#9BA3A9]">
            No check-ins yet.
          </p>
        ) : (
          <div className="divide-y divide-[#F0F4F9]">
            {checkins.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-4 py-3"
              >
                <div className="min-w-[80px] text-[13px] font-medium text-[#1d1d1f]">
                  {new Date(c.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex min-w-[160px] gap-4 text-[13px] text-[#6e6e73]">
                  {c.sleep_hours && (
                    <span className="flex items-center gap-1" title="Sleep">
                      <Moon className="h-3.5 w-3.5" />
                      {c.sleep_hours}h
                    </span>
                  )}
                  {c.water_oz && (
                    <span className="flex items-center gap-1" title="Water">
                      <Droplets className="h-3.5 w-3.5" />
                      {c.water_oz}oz
                    </span>
                  )}
                  {c.stress_level && (
                    <span title="Stress">{stressEmojis[c.stress_level]}</span>
                  )}
                </div>
                <p className="flex-1 text-[13px] text-[#6e6e73]">
                  {c.notes || (
                    <span className="italic text-[#9BA3A9]">No notes</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone: 'blue' | 'pink' | 'coral' | 'gold' | 'green';
  children: React.ReactNode;
}) {
  const map: Record<string, { bg: string; fg: string }> = {
    blue: { bg: 'bg-[#E5F2FF]', fg: 'text-[#3B9DFF]' },
    pink: { bg: 'bg-[#FCE5F2]', fg: 'text-[#E94BA8]' },
    coral: { bg: 'bg-[#FFE6E0]', fg: 'text-[#FF6F4D]' },
    gold: { bg: 'bg-[#FFF4D6]', fg: 'text-[#E5A92B]' },
    green: { bg: 'bg-[#DDF6E2]', fg: 'text-[#2EBA62]' },
  };
  const { bg, fg } = map[tone];
  return (
    <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bg}`}>
          <span className={fg}>{icon}</span>
        </div>
        <h2 className="text-[15px] font-semibold text-[#1d1d1f]">{title}</h2>
      </div>
      {children}
    </div>
  );
}
