'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BodyStat } from '@/types/database';

interface WeightChartProps {
  data: BodyStat[];
}

export function WeightChart({ data }: WeightChartProps) {
  // Sort by date ascending for the chart
  const chartData = [...data]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((stat) => ({
      date: new Date(stat.recorded_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      weight: stat.weight_lbs,
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center text-[var(--neutral-gray)] text-sm sm:text-base text-center px-4">
        No weight data to display. Start logging your weight!
      </div>
    );
  }

  // Calculate Y-axis domain with some padding
  const weights = chartData.map((d) => d.weight).filter(Boolean) as number[];
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = Math.max((maxWeight - minWeight) * 0.1, 5);

  return (
    <div className="h-48 sm:h-64 lg:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,169,232,0.2)" />
          <XAxis
            dataKey="date"
            stroke="var(--neutral-gray)"
            fontSize={10}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="var(--neutral-gray)"
            fontSize={10}
            tickLine={false}
            width={35}
            domain={[Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)]}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid rgba(184,169,232,0.3)',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(93,73,153,0.1)',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value} lbs`, 'Weight']}
            labelStyle={{ color: 'var(--neutral-dark)', fontWeight: 500 }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="var(--primary-lavender)"
            strokeWidth={2}
            dot={{ fill: 'var(--primary-lavender)', strokeWidth: 2, r: 3, stroke: 'white' }}
            activeDot={{ r: 5, fill: 'var(--primary-deep)', stroke: 'white', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
