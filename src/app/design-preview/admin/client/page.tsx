import {
  Apple,
  ArrowLeft,
  Archive,
  Calendar,
  Dumbbell,
  Flame,
  MessageCircle,
  MoreHorizontal,
  Scale,
  StickyNote,
  TrendingDown,
} from 'lucide-react';
import {
  AdminBottomNav,
  AuroraBackground,
  CoachActionRow,
  KPICard,
  StatTriple,
  WeightTrendCard,
} from '@/components/v2';

export const dynamic = 'force-static';

const weightSeries = [
  { label: 'Apr 4', value: 175.6 },
  { label: 'Apr 8', value: 174.2 },
  { label: 'Apr 12', value: 173.0 },
  { label: 'Apr 16', value: 171.8 },
  { label: 'Apr 20', value: 170.6 },
  { label: 'Apr 24', value: 169.8 },
  { label: 'Apr 28', value: 169.0 },
  { label: 'May 2', value: 168.4 },
];

export default function AdminClientDesignPreviewPage() {
  return (
    <AuroraBackground>
      <div className="mx-auto max-w-md pb-32">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5">
          <a
            href="/design-preview/admin"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#1d1d1f] shadow-sm backdrop-blur"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#1d1d1f] shadow-sm backdrop-blur"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Client identity */}
        <div className="mt-4 flex flex-col items-center px-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB8A0] to-[#A8B7FF] text-[24px] font-semibold text-white shadow-md ring-4 ring-white/60">
            SM
          </div>
          <h1 className="mt-3 text-[22px] font-bold text-[#1d1d1f]">Sarah Martinez</h1>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-[#6e6e73]">
            <span className="rounded-full bg-[#DDF6E2] px-2 py-0.5 text-[11px] font-medium text-[#1F8F49]">
              Lose fat
            </span>
            <span>·</span>
            <span>Member since Jan 2026</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[#2EBA62]">
            <span className="h-2 w-2 rounded-full bg-[#2EBA62]" />
            On track this week
          </div>
        </div>

        {/* Quick stat triple */}
        <div className="mt-5 px-5">
          <StatTriple
            stats={[
              { value: '168.4', label: 'Current lbs' },
              { value: '-7.2', label: 'Total change' },
              { value: '160', label: 'Goal lbs' },
            ]}
          />
        </div>

        {/* KPI grid */}
        <div className="mt-3 grid grid-cols-2 gap-3 px-5">
          <KPICard
            label="Streak"
            icon={<Flame className="h-4 w-4" />}
            tone="coral"
            value="22"
            unit="days"
          />
          <KPICard
            label="Workouts (7d)"
            icon={<Dumbbell className="h-4 w-4" />}
            tone="pink"
            value="4"
            unit="logged"
          />
          <KPICard
            label="Check-ins"
            icon={<Calendar className="h-4 w-4" />}
            tone="blue"
            value="6"
            unit="/ 7"
          />
          <KPICard
            label="Week Δ"
            icon={<TrendingDown className="h-4 w-4" />}
            tone="green"
            value="-1.2"
            unit="lbs"
          />
        </div>

        {/* Weight trend */}
        <div className="mt-4 px-5">
          <WeightTrendCard
            current={168.4}
            goal={160}
            data={weightSeries}
            message="Down 7.2 lbs since starting — steady, sustainable rate. Keep current plan."
          />
        </div>

        {/* Coach actions */}
        <div className="mt-5 px-5">
          <h2 className="mb-2 text-[15px] font-semibold text-[#1d1d1f]">Coach Actions</h2>
          <div className="flex flex-col gap-3">
            <CoachActionRow
              icon={<Apple className="h-5 w-5" />}
              title="Nutrition Plan"
              subtitle="2,200 kcal · 165P / 200C / 75F"
              badge="Edit"
              tone="green"
            />
            <CoachActionRow
              icon={<StickyNote className="h-5 w-5" />}
              title="Coach Notes"
              subtitle="3 notes · last updated 2 days ago"
              tone="gold"
            />
            <CoachActionRow
              icon={<MessageCircle className="h-5 w-5" />}
              title="Weekly Check-in"
              subtitle="Sent Mondays · next Apr 6"
              tone="blue"
            />
            <CoachActionRow
              icon={<Scale className="h-5 w-5" />}
              title="Log Weight"
              subtitle="Add a weigh-in for this client"
              tone="coral"
            />
          </div>
        </div>

        {/* Recent activity */}
        <div className="mt-5 px-5">
          <h2 className="mb-2 text-[15px] font-semibold text-[#1d1d1f]">Recent Activity</h2>
          <div className="rounded-3xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
            <ActivityRow
              date="Today"
              title="Logged check-in"
              detail="Sleep 7.5h · Stress 2/5 · Energy 4/4"
            />
            <ActivityRow
              date="Yesterday"
              title="Upper Body Strength"
              detail="45 min · 6 exercises"
            />
            <ActivityRow
              date="May 1"
              title="Logged weight"
              detail="168.4 lbs · −0.4 from last entry"
            />
            <ActivityRow
              date="Apr 30"
              title="HIIT Cardio"
              detail="30 min · 8 rounds"
              last
            />
          </div>
        </div>

        {/* Archive */}
        <div className="mt-4 px-5">
          <button className="flex w-full items-center justify-center gap-2 rounded-3xl bg-white/70 py-3 text-[13px] font-medium text-[#9BA3A9] shadow-sm backdrop-blur transition hover:bg-white/90 hover:text-[#FF6F4D]">
            <Archive className="h-4 w-4" />
            Archive client
          </button>
        </div>

        <AdminBottomNav />
      </div>
    </AuroraBackground>
  );
}

function ActivityRow({
  date,
  title,
  detail,
  last,
}: {
  date: string;
  title: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 py-3 ${last ? '' : 'border-b border-[#F0F4F9]'}`}>
      <div className="w-16 flex-shrink-0 text-[12px] font-medium text-[#6e6e73]">{date}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-[#1d1d1f]">{title}</div>
        <div className="text-[12px] text-[#6e6e73]">{detail}</div>
      </div>
    </div>
  );
}
