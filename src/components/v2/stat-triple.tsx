interface StatTripleProps {
  stats: { value: string; label: string }[];
}

export function StatTriple({ stats }: StatTripleProps) {
  return (
    <div className="flex justify-between rounded-3xl bg-white/95 p-5 shadow-[0_8px_24px_rgba(120,120,180,0.10)] backdrop-blur">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col">
          <span className="text-[22px] font-light leading-none text-[#1d1d1f]">
            {s.value}
          </span>
          <span className="mt-1 text-[12px] text-[#6e6e73]">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
