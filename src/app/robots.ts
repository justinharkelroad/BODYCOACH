import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://standardnutrition.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/help', '/privacy', '/terms'],
        disallow: [
          '/dashboard',
          '/coach',
          '/stats',
          '/photos',
          '/workouts',
          '/nutrition',
          '/settings',
          '/check-in',
          '/onboarding',
          '/exercises',
          '/api/',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
