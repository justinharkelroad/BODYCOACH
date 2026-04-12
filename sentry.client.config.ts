import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay (optional - remove if not needed)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Environment
  environment: process.env.NODE_ENV,

  // Filter out non-critical errors
  beforeSend(event) {
    // Don't send errors for canceled requests
    if (event.exception?.values?.[0]?.value?.includes('AbortError')) {
      return null;
    }
    return event;
  },

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
