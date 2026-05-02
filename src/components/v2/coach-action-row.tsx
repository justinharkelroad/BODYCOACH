import type { ReactNode } from 'react';
import type { AccentTone } from './kpi-card';
import { ChevronRight } from 'lucide-react';

const accentMap: Record<AccentTone, { bg: string; fg: string }> = {
  blue: { bg: 'bg-[#E5F2FF]', fg: 'text-[#3B9DFF]' },
  pink: { bg: 'bg-[#FCE5F2]', fg: 'text-[#E94BA8]' },
  coral: { bg: 'bg-[#FFE6E0]', fg: 'text-[#FF6F4D]' },
  gold: { bg: 'bg-[#FFF4D6]', fg: 'text-[#E5A92B]' },
  green: { bg: 'bg-[#DDF6E2]', fg: 'text-[#2EBA62]' },
};

interface CoachActionRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  tone?: AccentTone;
  href?: string;
}

export function CoachActionRow({
  icon,
  title,
  subtitle,
  badge,
  tone = 'blue',
  href,
}: CoachActionRowProps) {
  const { bg, fg } = accentMap[tone];

  const inner = (
    <div className="flex items-center gap-3 rounded-3xl bg-white/95 p-4 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur transition hover:shadow-[0_12px_32px_rgba(120,120,180,0.16)]">
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${bg}`}>
        <span className={fg}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-[#1d1d1f]">{title}</span>
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bg} ${fg}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <div className="mt-0.5 text-[12px] text-[#6e6e73]">{subtitle}</div>}
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-[#9BA3A9]" />
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }
  return inner;
}
