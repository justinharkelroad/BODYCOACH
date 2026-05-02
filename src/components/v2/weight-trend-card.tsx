'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { MoreHorizontal, Sparkles } from 'lucide-react';

interface WeightPoint {
  label: string;
  value: number;
}

interface WeightTrendCardProps {
  current: number | null;
  goal: number | null;
  data: WeightPoint[];
  message?: string;
}

export function WeightTrendCard({
  current,
  goal,
  data,
  message = "You're making progress. Stay consistent and trust the process.",
}: WeightTrendCardProps) {
  return (
    <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
      <div className="flex items-start justify-between">
        <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Weight Trend</h3>
        <button className="text-[#6e6e73]" aria-label="More">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[28px] font-light text-[#3B9DFF]">
          {current ? `${current.toFixed(1)}` : '—'}
        </span>
        <span className="text-[13px] text-[#6e6e73]">
          lbs{goal ? ` / Goal ${goal} lbs` : ''}
        </span>
      </div>
      <div className="mt-1 text-[13px] text-[#6e6e73]">{message}</div>

      <div className="mt-4 h-44">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7CC2FF" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#7CC2FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#6e6e73' }}
                interval="preserveStartEnd"
              />
              <Tooltip
                cursor={{ stroke: '#3B9DFF', strokeOpacity: 0.2 }}
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  fontSize: 12,
                }}
                formatter={(v) => [
                  `${typeof v === 'number' ? v.toFixed(1) : v} lbs`,
                  'Weight',
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B9DFF"
                strokeWidth={2.5}
                fill="url(#weight-fill)"
                dot={{ r: 3, fill: '#3B9DFF', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl bg-[#F7F9FC] text-[13px] text-[#6e6e73]">
            Log a few weigh-ins to see your trend
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 text-[13px] leading-snug text-[#6e6e73]">
        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3B9DFF]" />
        <p>{message}</p>
      </div>
    </div>
  );
}
