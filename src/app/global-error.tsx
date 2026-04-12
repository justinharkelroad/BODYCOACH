'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: '#f5f5f7',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#86868b', marginBottom: '0.5rem' }}>
            Oops
          </p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.75rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6e6e73', marginBottom: '2rem', maxWidth: '400px', lineHeight: '1.5' }}>
            We hit an unexpected error. Please try again.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#0071e3',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#fff',
                color: '#1d1d1f',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
