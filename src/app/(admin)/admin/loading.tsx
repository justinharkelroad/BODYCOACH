function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[var(--theme-border)] ${className}`} />
  );
}

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-6"
            style={{ background: 'var(--theme-surface)', boxShadow: 'var(--theme-shadow-sm)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-full mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="text-center">
                  <Skeleton className="h-4 w-4 mx-auto mb-1 rounded-full" />
                  <Skeleton className="h-4 w-8 mx-auto mb-1" />
                  <Skeleton className="h-2 w-6 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
