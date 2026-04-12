'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

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
            background: '#FAFAFA',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <p
            style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#7C8B9A',
              marginBottom: '0.5rem',
            }}
          >
            Oops
          </p>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2D3436',
              marginBottom: '0.75rem',
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: '#636E72',
              marginBottom: '2rem',
              maxWidth: '400px',
              lineHeight: '1.5',
            }}
          >
            We hit an unexpected error. Our team has been notified and is looking
            into it.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #7C8B9A 0%, #D4A853 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#FFFFFF',
                color: '#2D3436',
                border: '1px solid #E8E4E0',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
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
