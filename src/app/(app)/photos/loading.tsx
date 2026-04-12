function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--theme-border)] ${className}`}
    />
  );
}

export default function PhotosLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Type counts */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
          >
            <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
            <Skeleton className="h-6 w-6 mx-auto mb-1" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
        ))}
      </div>

      {/* Photo grid */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
