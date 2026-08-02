// Simple in-memory cache with TTL
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5 minutes default

  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, { data, timestamp: Date.now() });
    if (ttl !== undefined) {
      setTimeout(() => this.cache.delete(key), ttl);
    } else {
      setTimeout(() => this.cache.delete(key), this.ttl);
    }
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    const age = Date.now() - item.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  setTTL(ttl: number) {
    this.ttl = ttl;
  }
}

export const cache = new CacheManager();

// Cache decorator for API calls
export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return Promise.resolve(cached);
  
  return fn().then((data) => {
    cache.set(key, data, ttl);
    return data;
  });
}
