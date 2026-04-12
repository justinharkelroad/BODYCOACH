function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--theme-border)] ${className}`}
    />
  );
}

export default function NutritionLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-28 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Macro rings */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Food log */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-36 mb-1" />
                  <Skeleton className="h-3 w-20" />
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
