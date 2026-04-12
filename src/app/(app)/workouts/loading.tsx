function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--theme-border)] ${className}`}
    />
  );
}

export default function WorkoutsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-36 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-6"
            style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
          >
            <Skeleton className="h-3 w-16 mb-3" />
            <Skeleton className="h-7 w-8" />
          </div>
        ))}
      </div>

      {/* Workout list */}
      <div>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
