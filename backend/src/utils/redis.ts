import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient: Redis | null = null;

if (url && token) {
  try {
    redisClient = new Redis({
      url,
      token,
    });
    console.log("✓ Upstash Redis client initialized.");
  } catch (error) {
    console.warn("Failed to initialize Upstash Redis:", error);
  }
} else {
  console.log("ℹ Upstash Redis env vars not found. Falling back to in-memory caching.");
}

export const redis = redisClient;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch (error) {
    console.warn(`[Redis GET error] for key '${key}':`, error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 120
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.warn(`[Redis SET error] for key '${key}':`, error);
  }
}

export async function delCache(keyOrPattern: string): Promise<void> {
  if (!redis) return;
  try {
    if (keyOrPattern.endsWith("*")) {
      const keys = await redis.keys(keyOrPattern);
      if (keys && keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(keyOrPattern);
    }
  } catch (error) {
    console.warn(`[Redis DEL error] for '${keyOrPattern}':`, error);
  }
}
