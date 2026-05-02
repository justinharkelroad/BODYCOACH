import type { ReactNode } from 'react';

export type AccentTone = 'blue' | 'pink' | 'coral' | 'gold' | 'green';

const accentMap: Record<AccentTone, { bg: string; fg: string }> = {
  blue: { bg: 'bg-[#E5F2FF]', fg: 'text-[#3B9DFF]' },
  pink: { bg: 'bg-[#FCE5F2]', fg: 'text-[#E94BA8]' },
  coral: { bg: 'bg-[#FFE6E0]', fg: 'text-[#FF6F4D]' },
  gold: { bg: 'bg-[#FFF4D6]', fg: 'text-[#E5A92B]' },
  green: { bg: 'bg-[#DDF6E2]', fg: 'text-[#2EBA62]' },
};

interface KPICardProps {
  label: string;
  icon: ReactNode;
  tone: AccentTone;
  value: string;
  unit?: string;
}

export function KPICard({ label, icon, tone, value, unit }: KPICardProps) {
  const { bg, fg } = accentMap[tone];
  return (
    <div className="flex h-32 flex-col justify-between rounded-3xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
      <div className="flex items-start justify-between">
        <div className="text-[13px] font-medium leading-tight text-[#6e6e73]">
          {label}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
          <span className={fg}>{icon}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-light leading-none tracking-tight text-[#1d1d1f]">
          {value}
        </span>
        {unit && (
          <span className="text-[13px] font-medium text-[#6e6e73]">{unit}</span>
        )}
      </div>
    </div>
  );
}
