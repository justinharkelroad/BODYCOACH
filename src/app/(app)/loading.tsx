export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
