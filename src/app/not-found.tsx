import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'var(--theme-bg)' }}
    >
      <p
        className="text-7xl font-bold mb-2"
        style={{ color: 'var(--theme-primary)' }}
      >
        404
      </p>
      <h1
        className="text-2xl font-semibold mb-3"
        style={{ color: 'var(--theme-text)' }}
      >
        Page not found
      </h1>
      <p
        className="mb-8 max-w-md"
        style={{ color: 'var(--theme-text-secondary)' }}
      >
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
          style={{
            background: 'var(--theme-gradient-accent)',
            color: 'var(--theme-text-on-primary)',
          }}
        >
          Go home
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90"
          style={{
            background: 'var(--theme-surface)',
            color: 'var(--theme-text)',
            border: '1px solid var(--theme-border)',
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
