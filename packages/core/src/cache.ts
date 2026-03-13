import { Middleware } from "./index";

export interface CacheOptions {
  /** Cache name. Default: "simple-api-cache" */
  name?: string;
  /** TTL in milliseconds. Default: never expires. */
  ttl?: number;
  /** Enable Stale-While-Revalidate. Default: true. */
  swr?: boolean;
}

/**
 * PWA-capable Cache Middleware using the Web Cache API.
 * Supports Stale-While-Revalidate strategy.
 */
export function createCacheMiddleware(options: CacheOptions = {}): Middleware {
  const cacheName = options.name ?? "simple-api-cache";
  const ttl = options.ttl;
  const swr = options.swr ?? true;

  return async ({ options: reqOpts, config, service, endpoint }, next) => {
    // Only cache GET requests
    if (config.method !== "GET" || typeof caches === "undefined") {
      return next(reqOpts);
    }

    const url = new URL(config.path, reqOpts.baseUrl || "");
    if (reqOpts.query) {
      Object.entries(reqOpts.query).forEach(([k, v]) =>
        url.searchParams.append(k, String(v)),
      );
    }
    const cacheKey = url.toString();

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      const timestamp = cachedResponse.headers.get("x-simple-api-timestamp");

      const isExpired =
        ttl && timestamp && Date.now() - Number(timestamp) > ttl;

      if (!isExpired) {
        return cachedData;
      }

      if (swr) {
        // Return stale data and revalidate in background
        next(reqOpts)
          .then(async (freshData) => {
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("x-simple-api-timestamp", String(Date.now()));
            await cache.put(
              cacheKey,
              new Response(JSON.stringify(freshData), { headers }),
            );
          })
          .catch(() => {}); // Ignore background errors
        return cachedData;
      }
    }

    // No cache or expired without SWR, fetch fresh
    const freshData = await next(reqOpts);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("x-simple-api-timestamp", String(Date.now()));
    await cache.put(
      cacheKey,
      new Response(JSON.stringify(freshData), { headers }),
    );

    return freshData;
  };
}
