import { Apple } from 'lucide-react';

interface MacroCardProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  caloriesConsumed?: number;
}

export function MacroCard({
  calories,
  protein,
  carbs,
  fat,
  caloriesConsumed = 0,
}: MacroCardProps) {
  const caloriePct = calories > 0 ? Math.min(100, (caloriesConsumed / calories) * 100) : 0;

  return (
    <div className="rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF6E2]">
            <Apple className="h-5 w-5 text-[#2EBA62]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Nutrition Plan</h3>
            <p className="text-[12px] text-[#6e6e73]">Daily Target</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[32px] font-light leading-none tracking-tight text-[#1d1d1f]">
          {caloriesConsumed.toLocaleString()}
        </span>
        <span className="text-[15px] text-[#6e6e73]">/ {calories.toLocaleString()} kcal</span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#F0F4F9]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8FE0A8] to-[#2EBA62]"
          style={{ width: `${caloriePct}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Macro label="Protein" value={protein} unit="g" tone="text-[#3B9DFF]" />
        <Macro label="Carbs" value={carbs} unit="g" tone="text-[#E5A92B]" />
        <Macro label="Fat" value={fat} unit="g" tone="text-[#E94BA8]" />
      </div>
    </div>
  );
}

function Macro({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F9FC] p-3 text-center">
      <div className={`text-[20px] font-light leading-none ${tone}`}>
        {value}
        <span className="ml-0.5 text-[12px] text-[#6e6e73]">{unit}</span>
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-[#6e6e73]">{label}</div>
    </div>
  );
}
