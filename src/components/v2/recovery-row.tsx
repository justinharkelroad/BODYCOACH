import type { ReactNode } from 'react';
import type { AccentTone } from './kpi-card';

const accentMap: Record<AccentTone, { bg: string; fg: string; bar: string }> = {
  blue: { bg: 'bg-[#E5F2FF]', fg: 'text-[#3B9DFF]', bar: 'from-[#7CC2FF] to-[#3B9DFF]' },
  pink: { bg: 'bg-[#FCE5F2]', fg: 'text-[#E94BA8]', bar: 'from-[#FFB1D8] to-[#E94BA8]' },
  coral: { bg: 'bg-[#FFE6E0]', fg: 'text-[#FF6F4D]', bar: 'from-[#FFB29B] to-[#FF6F4D]' },
  gold: { bg: 'bg-[#FFF4D6]', fg: 'text-[#E5A92B]', bar: 'from-[#FFD982] to-[#E5A92B]' },
  green: { bg: 'bg-[#DDF6E2]', fg: 'text-[#2EBA62]', bar: 'from-[#8FE0A8] to-[#2EBA62]' },
};

interface RecoveryRowProps {
  icon: ReactNode;
  title: string;
  value: string;
  progress: number;
  subLabel: string;
  tone?: AccentTone;
}

export function RecoveryRow({
  icon,
  title,
  value,
  progress,
  subLabel,
  tone = 'blue',
}: RecoveryRowProps) {
  const { bg, fg, bar } = accentMap[tone];
  const width = Math.max(0, Math.min(100, progress));
  return (
    <div className="rounded-3xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${bg}`}>
          <span className={fg}>{icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold text-[#1d1d1f]">{title}</span>
            <span className={`text-[15px] font-medium ${fg}`}>{value}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E8EFFB]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${bar}`}
              style={{ width: `${width}%` }}
            />
          </div>
          <div className="mt-1.5 text-[12px] text-[#6e6e73]">{subLabel}</div>
        </div>
      </div>
    </div>
  );
}
