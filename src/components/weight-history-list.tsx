'use client';

import { useState } from 'react';
import type { BodyStat } from '@/types/database';

const PAGE_SIZE = 20;

export function WeightHistoryList({ stats }: { stats: BodyStat[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const weighIns = stats.filter((stat) => stat.weight_lbs !== null);
  const visible = stats.slice(0, visibleCount);

  return (
    <section id="weight-history" className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur scroll-mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[17px] font-semibold text-[#1d1d1f]">Full Weight History</h2>
        {stats.length > 0 && (
          <span className="text-[12px] text-[#6e6e73]">
            {weighIns.length} weigh-in{weighIns.length === 1 ? '' : 's'} · all time
          </span>
        )}
      </div>
      {stats.length === 0 ? (
        <p className="mt-4 text-[14px] text-[#6e6e73]">Your weigh-ins will appear here after you log your first one.</p>
      ) : (
        <>
          <div className="mt-3 divide-y divide-[#F0F4F9]">
            {visible.map((stat, index) => {
              const previous = stats.slice(index + 1).find((entry) => entry.weight_lbs !== null)?.weight_lbs;
              const change = previous !== null && previous !== undefined && stat.weight_lbs !== null
                ? stat.weight_lbs - previous
                : null;
              return (
                <div key={stat.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <time dateTime={stat.recorded_at} className="text-[13px] text-[#6e6e73]">
                      {new Date(`${stat.recorded_at}T00:00:00Z`).toLocaleDateString('en-US', {
                        timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </time>
                    {stat.notes && <p className="mt-1 break-words text-[12px] text-[#6e6e73]">{stat.notes}</p>}
                  </div>
                  <div className="flex shrink-0 items-baseline gap-3">
                    <div className="text-right">
                      <div className="text-[14px] font-semibold text-[#1d1d1f]">
                        {stat.weight_lbs !== null ? `${stat.weight_lbs} lbs` : '—'}
                      </div>
                      {stat.body_fat_pct !== null && (
                        <div className="text-[12px] text-[#6e6e73]">{stat.body_fat_pct}% body fat</div>
                      )}
                    </div>
                    {change !== null && (
                      <span className={`min-w-12 text-right text-[12px] ${change > 0 ? 'text-[#BD4B33]' : change < 0 ? 'text-[#1F8F49]' : 'text-[#6e6e73]'}`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {visibleCount < stats.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="mt-4 w-full rounded-xl bg-[#E5F2FF] px-4 py-3 text-[13px] font-semibold text-[#166DB5] transition-colors hover:bg-[#D5EAFE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166DB5]"
            >
              Show older entries ({stats.length - visibleCount} remaining)
            </button>
          )}
        </>
      )}
    </section>
  );
}
