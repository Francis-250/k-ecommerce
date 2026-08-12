type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    if (this.cache.size > 500) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(keyPattern: string | RegExp): void {
    if (typeof keyPattern === "string") {
      this.cache.delete(keyPattern);
      for (const key of Array.from(this.cache.keys())) {
        if (key.startsWith(keyPattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      for (const key of Array.from(this.cache.keys())) {
        if (keyPattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
