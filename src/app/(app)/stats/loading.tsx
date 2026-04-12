function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--theme-border)] ${className}`}
    />
  );
}

export default function StatsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Form skeleton */}
        <div
          className="lg:col-span-1 rounded-2xl p-6"
          style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
        >
          <Skeleton className="h-5 w-28 mb-6" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
              >
                <Skeleton className="h-3 w-16 mb-3" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>

          {/* Chart */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
          >
            <Skeleton className="h-5 w-28 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
