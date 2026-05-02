import Link from 'next/link';
import { ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

export type ClientStatus = 'on_track' | 'needs_attention' | 'inactive';

const statusMap: Record<ClientStatus, { dot: string; label: string; chipBg: string; chipFg: string }> = {
  on_track: {
    dot: 'bg-[#2EBA62]',
    label: 'On track',
    chipBg: 'bg-[#DDF6E2]',
    chipFg: 'text-[#1F8F49]',
  },
  needs_attention: {
    dot: 'bg-[#FF9966]',
    label: 'Needs attention',
    chipBg: 'bg-[#FFE6E0]',
    chipFg: 'text-[#C5552F]',
  },
  inactive: {
    dot: 'bg-[#9BA3A9]',
    label: 'Inactive',
    chipBg: 'bg-[#EEF1F5]',
    chipFg: 'text-[#6e6e73]',
  },
};

const goalLabels: Record<string, string> = {
  lose_fat: 'Lose fat',
  maintain: 'Maintain',
  gain_muscle: 'Gain muscle',
  lose_weight: 'Lose weight',
  gain_weight: 'Gain weight',
};

export interface ClientListCardProps {
  href: string;
  initials: string;
  name: string;
  goal: string | null;
  currentWeight: number | null;
  weeklyChange: number | null;
  lastActiveLabel: string | null;
  checkinsThisWeek: number;
  status: ClientStatus;
}

export function ClientListCard({
  href,
  initials,
  name,
  goal,
  currentWeight,
  weeklyChange,
  lastActiveLabel,
  checkinsThisWeek,
  status,
}: ClientListCardProps) {
  const s = statusMap[status];
  const goalLabel = goal ? goalLabels[goal] || goal : null;

  const TrendIcon =
    weeklyChange === null
      ? Minus
      : weeklyChange < 0
        ? TrendingDown
        : weeklyChange > 0
          ? TrendingUp
          : Minus;
  const trendColor =
    weeklyChange === null
      ? 'text-[#9BA3A9]'
      : weeklyChange < 0
        ? 'text-[#2EBA62]'
        : weeklyChange > 0
          ? 'text-[#FF6F4D]'
          : 'text-[#9BA3A9]';

  return (
    <Link
      href={href}
      className="block rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur transition hover:shadow-[0_12px_32px_rgba(120,120,180,0.16)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB8A0] to-[#A8B7FF] text-[15px] font-semibold text-white shadow-md">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-[#1d1d1f]">{name}</h3>
            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${s.dot}`} aria-label={s.label} />
          </div>
          {goalLabel && (
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${s.chipBg} ${s.chipFg}`}>
              {goalLabel}
            </span>
          )}
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-[#9BA3A9]" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#F0F4F9] pt-4">
        <Stat
          label="Weight"
          value={currentWeight ? `${currentWeight}` : '—'}
          unit="lbs"
        />
        <Stat
          label="Week"
          value={
            weeklyChange === null
              ? '—'
              : `${weeklyChange > 0 ? '+' : ''}${weeklyChange.toFixed(1)}`
          }
          unit="lbs"
          icon={<TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />}
        />
        <Stat
          label="Check-ins"
          value={String(checkinsThisWeek)}
          unit="/ 7"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] text-[#6e6e73]">
        <span>{s.label}</span>
        <span>{lastActiveLabel ? `Active ${lastActiveLabel}` : 'No activity'}</span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-1">
        {icon}
        <span className="text-[18px] font-light leading-none text-[#1d1d1f]">{value}</span>
        {unit && <span className="text-[11px] text-[#6e6e73]">{unit}</span>}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-[#6e6e73]">{label}</div>
    </div>
  );
}
