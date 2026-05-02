'use client';

import { useState } from 'react';

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  defaultActive?: string;
  onChange?: (key: string) => void;
}

export function FilterChips({ options, defaultActive, onChange }: FilterChipsProps) {
  const [active, setActive] = useState(defaultActive ?? options[0]?.key);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {options.map((opt) => {
        const isActive = opt.key === active;
        return (
          <button
            key={opt.key}
            onClick={() => {
              setActive(opt.key);
              onChange?.(opt.key);
            }}
            className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition ${
              isActive
                ? 'bg-gradient-to-r from-[#FF6FA8] via-[#FF9966] to-[#FFD36F] text-white shadow-sm'
                : 'bg-white/80 text-[#1d1d1f] backdrop-blur hover:bg-white'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  isActive ? 'bg-white/30 text-white' : 'bg-[#EEF1F5] text-[#6e6e73]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
