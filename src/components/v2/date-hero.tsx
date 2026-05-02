interface DateHeroProps {
  date: Date;
}

export function DateHero({ date }: DateHeroProps) {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const neighbors: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const n = day + i;
    if (n <= lastDay) neighbors.push(n);
  }

  return (
    <div className="px-5 pt-6">
      <div className="text-[13px] font-medium text-[#6e6e73]">Today</div>
      <div className="mt-1 flex items-baseline gap-3 overflow-hidden">
        <span className="text-[34px] font-bold tracking-tight text-[#1d1d1f]">
          {String(day).padStart(2, '0')} {month}
        </span>
        <span className="ml-2 flex gap-3 text-[15px] font-medium text-white/70">
          {neighbors.map((n) => (
            <span key={n}>{String(n).padStart(2, '0')}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
