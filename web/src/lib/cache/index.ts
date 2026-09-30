import Redis from 'ioredis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = import.meta.env.REDIS_URL;
  if (!url) return null;

  try {
    redis = new Redis(url, {
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    redis.on('error', () => {
      // Silently fail — app falls back to direct Strapi fetch
      redis = null;
    });

    return redis;
  } catch {
    return null;
  }
}

/**
 * Cache-aside helper.
 * Tries Redis first; falls back to the fetcher if Redis is unavailable.
 */
export async function cache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 600
): Promise<T> {
  const r = getRedis();

  if (r) {
    try {
      const cached = await r.get(`twh:${key}`);
      if (cached) return JSON.parse(cached) as T;

      const data = await fetcher();
      await r.setex(`twh:${key}`, ttlSeconds, JSON.stringify(data));
      return data;
    } catch {
      // Redis error — fall through to direct fetch
    }
  }

  return fetcher();
}

/**
 * Invalidate all keys matching a tag prefix.
 * Called by /api/revalidate when Strapi sends a webhook.
 */
export async function invalidateTag(tag: string): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    const keys = await r.keys(`twh:${tag}*`);
    if (keys.length > 0) await r.del(...keys);
  } catch {
    // ignore
  }
}
