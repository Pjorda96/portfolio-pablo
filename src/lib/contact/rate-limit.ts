/**
 * Per-key rate limiting behind a small interface, so the in-memory store can
 * be swapped for a durable one (Upstash Redis, Vercel KV…) without touching
 * the form.
 *
 * The in-memory limiter keeps its state in the server process. On serverless
 * hosting (Vercel) each instance has its own memory and instances come and
 * go, so the limit is per instance and best effort: it stops a burst from one
 * client hitting a warm instance, not a distributed attack. Use a shared store
 * when that matters.
 */

export interface RateLimitResult {
  success: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** When the oldest counted request leaves the window (ms epoch). */
  resetAt: number;
}

export interface RateLimiter {
  /** Counts one request for `key` and says whether it is allowed. */
  limit(key: string): Promise<RateLimitResult>;
}

export interface SlidingWindowOptions {
  /** Requests allowed per window. */
  max: number;
  windowMs: number;
  /** Keys kept at most; the stalest are dropped first. Bounds memory. */
  maxKeys?: number;
  now?: () => number;
}

/** Sliding window log: remembers the time of each request inside the window. */
export function createMemoryRateLimiter({
  max,
  windowMs,
  maxKeys = 10_000,
  now = Date.now,
}: SlidingWindowOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    async limit(key) {
      const time = now();
      const recent = (hits.get(key) ?? []).filter((at) => time - at < windowMs);
      const success = recent.length < max;
      if (success) recent.push(time);

      // Re-insert so Map order tracks recency, then trim the stalest keys.
      hits.delete(key);
      hits.set(key, recent);
      while (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest === undefined) break;
        hits.delete(oldest);
      }

      return {
        success,
        remaining: Math.max(0, max - recent.length),
        resetAt: (recent[0] ?? time) + windowMs,
      };
    },
  };
}

/** 5 messages per 10 minutes and IP. */
export const CONTACT_RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const;

/**
 * Client IP from the proxy headers. Vercel sets `x-forwarded-for` (client
 * first) and `x-real-ip`; anything else falls back to one shared bucket.
 */
export function clientIp(headers: Pick<Headers, 'get'>): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
}
