function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[var(--theme-border)] ${className}`} />
  );
}

export default function ClientDetailLoading() {
  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Skeleton className="h-4 w-20 mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-6"
            style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
          >
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Weight chart */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>

      {/* Photos */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <Skeleton className="h-5 w-36 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </div>

      {/* Check-ins */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
