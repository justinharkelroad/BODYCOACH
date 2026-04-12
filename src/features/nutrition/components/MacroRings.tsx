'use client';

import { useMemo } from 'react';
import type { DailyMacroProgress, MacroStatus } from '../types/nutrition.types';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

function MacroRing({ label, current, target, unit, color, size = 'md' }: MacroRingProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  const dimensions = {
    sm: { size: 64, stroke: 6, fontSize: 'text-xs' },
    md: { size: 80, stroke: 8, fontSize: 'text-sm' },
    lg: { size: 120, stroke: 10, fontSize: 'text-base' },
  }[size];

  const radius = (dimensions.size - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine status color
  const getStatusColor = () => {
    if (percentage < 80) return 'text-yellow-500';
    if (percentage > 120) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dimensions.size, height: dimensions.size }}>
        <svg className="transform -rotate-90" width={dimensions.size} height={dimensions.size}>
          {/* Background circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            className="text-[rgba(184,169,232,0.2)]"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-semibold ${dimensions.fontSize}`}>
            {Math.round(current)}
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-[var(--neutral-gray)]">/ {target}</span>
          )}
        </div>
      </div>
      <span className="mt-1 text-xs font-medium text-[var(--neutral-gray)]">
        {label}
      </span>
    </div>
  );
}

interface MacroRingsProps {
  progress: DailyMacroProgress;
  showLabels?: boolean;
  layout?: 'horizontal' | 'grid';
}

export function MacroRings({ progress, showLabels = true, layout = 'horizontal' }: MacroRingsProps) {
  const layoutClass = layout === 'horizontal'
    ? 'flex items-center justify-around gap-2'
    : 'grid grid-cols-2 gap-4';

  return (
    <div className={layoutClass}>
      {/* Calories - largest and most prominent */}
      <MacroRing
        label="Calories"
        current={progress.calories.current}
        target={progress.calories.target}
        unit="cal"
        color="#f97316" // orange-500
        size="lg"
      />

      <div className="flex gap-4">
        <MacroRing
          label="Protein"
          current={progress.protein.current}
          target={progress.protein.target}
          unit="g"
          color="#ef4444" // red-500
          size="sm"
        />
        <MacroRing
          label="Carbs"
          current={progress.carbs.current}
          target={progress.carbs.target}
          unit="g"
          color="#3b82f6" // blue-500
          size="sm"
        />
        <MacroRing
          label="Fat"
          current={progress.fat.current}
          target={progress.fat.target}
          unit="g"
          color="#eab308" // yellow-500
          size="sm"
        />
      </div>
    </div>
  );
}

interface MacroBarsProps {
  progress: DailyMacroProgress;
}

export function MacroBars({ progress }: MacroBarsProps) {
  const getBarColor = (status: MacroStatus) => {
    switch (status) {
      case 'under': return 'bg-yellow-500';
      case 'over': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  const macros = [
    { key: 'calories', label: 'Calories', data: progress.calories, color: 'bg-orange-500' },
    { key: 'protein', label: 'Protein', data: progress.protein, unit: 'g', color: 'bg-red-500' },
    { key: 'carbs', label: 'Carbs', data: progress.carbs, unit: 'g', color: 'bg-blue-500' },
    { key: 'fat', label: 'Fat', data: progress.fat, unit: 'g', color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-3">
      {macros.map(({ key, label, data, unit, color }) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{label}</span>
            <span className="text-[var(--neutral-gray)]">
              {Math.round(data.current)} / {data.target}{unit && ` ${unit}`}
            </span>
          </div>
          <div className="h-2 bg-[var(--neutral-gray-light)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                data.percentage > 120 ? 'bg-red-500' :
                data.percentage < 80 ? 'bg-yellow-500' : color
              }`}
              style={{ width: `${Math.min(data.percentage, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface CalorieDisplayProps {
  current: number;
  target: number;
  breastfeedingAdd?: number;
}

export function CalorieDisplay({ current, target, breastfeedingAdd }: CalorieDisplayProps) {
  const remaining = target - current;
  const isOver = remaining < 0;

  return (
    <div>
      <div className="text-3xl font-bold text-[var(--neutral-dark)]">
        {Math.round(current)}
        <span className="text-base font-normal text-[var(--neutral-gray)]"> / {target} cal</span>
      </div>
      <div className={`text-sm ${isOver ? 'text-[var(--accent-coral)]' : 'text-[var(--neutral-gray)]'}`}>
        {isOver ? `${Math.abs(Math.round(remaining))} above target` : `${Math.round(remaining)} remaining`}
      </div>
      {breastfeedingAdd && breastfeedingAdd > 0 && (
        <div className="text-xs text-[var(--primary-deep)] mt-1">
          Includes +{breastfeedingAdd} for nursing
        </div>
      )}
    </div>
  );
}
