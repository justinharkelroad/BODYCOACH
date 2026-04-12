import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
        ],
      },
    ];
  },
};

// Only wrap with Sentry if credentials are available
let config = nextConfig;

if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
  try {
    const { withSentryConfig } = require("@sentry/nextjs");
    config = withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      disableLogger: true,
      hideSourceMaps: true,
      reactComponentAnnotation: { enabled: true },
      tunnelRoute: "/monitoring",
    });
  } catch {
    // Sentry not installed or not configured — skip
  }
}

export default config;
