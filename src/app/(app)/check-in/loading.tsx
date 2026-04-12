function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--theme-border)] ${className}`}
    />
  );
}

export default function CheckInLoading() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <Skeleton className="h-7 w-36 mx-auto mb-2" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Weight form */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <Skeleton className="h-5 w-28 mb-4" />
        <Skeleton className="h-12 w-full rounded-xl mb-4" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      {/* Recent history */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
      >
        <Skeleton className="h-5 w-36 mb-4" />
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
