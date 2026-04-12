import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// --- Configuration ---

interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  ai: { limit: 20, windowSeconds: 60 },
  standard: { limit: 100, windowSeconds: 60 },
  auth: { limit: 10, windowSeconds: 60 },
  read: { limit: 200, windowSeconds: 60 },
} as const;

// --- Upstash Redis rate limiter (production) ---

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Cache Ratelimit instances per config key so we don't recreate on every call
const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(config: RateLimitConfig): Ratelimit | null {
  if (!redis) return null;

  const cacheKey = `${config.limit}:${config.windowSeconds}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
      analytics: true,
      prefix: 'bodycoach:ratelimit',
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

// --- In-memory fallback (local development only) ---

const memoryStore = new Map<string, { count: number; resetTime: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.resetTime < now) {
      memoryStore.delete(key);
    }
  }
}, 60000);

function checkMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const existing = memoryStore.get(identifier);

  if (!existing || existing.resetTime < now) {
    const resetTime = now + windowMs;
    memoryStore.set(identifier, { count: 1, resetTime });
    return { success: true, remaining: config.limit - 1, resetTime };
  }

  if (existing.count >= config.limit) {
    return { success: false, remaining: 0, resetTime: existing.resetTime };
  }

  existing.count++;
  return {
    success: true,
    remaining: config.limit - existing.count,
    resetTime: existing.resetTime,
  };
}

// --- Public API (unchanged interface) ---

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit for a given identifier.
 * Uses Upstash Redis in production, falls back to in-memory for local dev.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.standard
): Promise<RateLimitResult> {
  const limiter = getUpstashLimiter(config);

  if (limiter) {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: result.reset,
    };
  }

  // Fallback: in-memory (dev only)
  return checkMemoryRateLimit(identifier, config);
}

/**
 * Get client identifier from request.
 * Uses IP address with optional user ID for per-user limits.
 */
export function getClientIdentifier(
  request: Request,
  userId?: string
): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  if (userId) {
    return `${ip}:${userId}`;
  }
  return ip;
}

/**
 * Rate limit exceeded response with standard headers.
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': '0',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.resetTime),
      },
    }
  );
}
