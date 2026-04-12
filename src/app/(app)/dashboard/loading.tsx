function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--theme-border)] ${className}`}
    />
  );
}

function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
    >
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Check-in + Streak row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
        >
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
        >
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition macros */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <Skeleton className="h-5 w-36 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
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
  );
}
