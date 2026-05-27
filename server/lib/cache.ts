/**
 * Redis cache wrapper with transparent in-memory fallback.
 *
 * ── Required env var (optional) ───────────────────────────────────────────────
 *   REDIS_URL   Full Redis connection URL, e.g. redis://default:pass@host:6379
 *               Leave unset to run with an in-process Map (dev / no-Redis mode).
 *
 * ── Railway setup ─────────────────────────────────────────────────────────────
 *   1. Add a Redis service to your Railway project.
 *   2. In the Railway service's Variables tab, add REDIS_URL and set its value
 *      to the connection string that Railway provides for the Redis service.
 *
 * ── Exported surface ─────────────────────────────────────────────────────────
 *   isRedisActive   boolean — true when REDIS_URL is set and ioredis connected
 *   redisClient     the ioredis client (null in fallback mode)
 *   get / set / del / delPattern — async cache helpers
 *   IoRedisSessionStore — express-session compatible store backed by ioredis
 * ─────────────────────────────────────────────────────────────────────────────
 */

import Redis from "ioredis";
import session from "express-session";

// ── In-memory fallback ────────────────────────────────────────────────────────

interface MemEntry {
  value: string;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, MemEntry>();

  get(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: string, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  /** Delete all keys matching a simple glob pattern (only * wildcard supported). */
  delPattern(pattern: string): void {
    const regex = new RegExp(
      "^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"
    );
    const keysToDelete: string[] = [];
    this.store.forEach((_val, key) => {
      if (regex.test(key)) keysToDelete.push(key);
    });
    for (const key of keysToDelete) this.store.delete(key);
  }
}

// ── Client bootstrap ──────────────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL;

/** True when REDIS_URL is configured and the ioredis client has been created. */
export const isRedisActive = Boolean(REDIS_URL);

/**
 * The ioredis client. Null in fallback (no-Redis) mode.
 * Exported so other modules (e.g. the session store) can reuse the connection.
 */
export let redisClient: Redis | null = null;

const memCache = new MemoryCache();

if (REDIS_URL) {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });
  redisClient.on("connect", () =>
    console.log("[cache] ✅ Redis connected — application cache and session store active")
  );
  redisClient.on("error", (err: Error) =>
    console.error("[cache] Redis error:", err.message)
  );
} else {
  console.warn(
    "[cache] ⚠️  REDIS_URL not set — using in-memory cache (not suitable for " +
      "multi-instance production). Set REDIS_URL to enable Redis."
  );
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

/** Return a cached value, or null if absent / expired. */
export async function get(key: string): Promise<string | null> {
  if (redisClient) return redisClient.get(key);
  return memCache.get(key);
}

/** Store a value with an explicit TTL in seconds. */
export async function set(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (redisClient) {
    await redisClient.set(key, value, "EX", ttlSeconds);
  } else {
    memCache.set(key, value, ttlSeconds);
  }
}

/** Delete a single key. */
export async function del(key: string): Promise<void> {
  if (redisClient) {
    await redisClient.del(key);
  } else {
    memCache.del(key);
  }
}

/**
 * Delete all keys matching a glob pattern (e.g. `trainers:list:*`).
 * Uses Redis SCAN + DEL in batches; uses regex matching for the in-memory fallback.
 */
export async function delPattern(pattern: string): Promise<void> {
  if (redisClient) {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor, "MATCH", pattern, "COUNT", 100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } while (cursor !== "0");
  } else {
    memCache.delPattern(pattern);
  }
}

// ── express-session compatible store backed by ioredis ────────────────────────

const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * A minimal express-session Store implementation backed by an ioredis client.
 * Drop-in replacement for connect-pg-simple when Redis is available — no extra
 * package needed.
 */
export class IoRedisSessionStore extends session.Store {
  private readonly client: Redis;
  private readonly prefix: string;
  private readonly defaultTtl: number;

  constructor(
    client: Redis,
    opts: { prefix?: string; ttlSeconds?: number } = {}
  ) {
    super();
    this.client = client;
    this.prefix = opts.prefix ?? "sess:";
    this.defaultTtl = opts.ttlSeconds ?? DEFAULT_SESSION_TTL_SECONDS;
  }

  private key(sid: string): string {
    return `${this.prefix}${sid}`;
  }

  get(
    sid: string,
    callback: (err: unknown, session?: session.SessionData | null) => void
  ): void {
    this.client
      .get(this.key(sid))
      .then((data) => callback(null, data ? (JSON.parse(data) as session.SessionData) : null))
      .catch((err: unknown) => callback(err));
  }

  set(
    sid: string,
    sess: session.SessionData,
    callback?: (err?: unknown) => void
  ): void {
    // Derive TTL from the session cookie maxAge; fall back to the store default.
    const maxAge = (sess.cookie as { maxAge?: number | null }).maxAge;
    const ttl = maxAge != null ? Math.max(1, Math.ceil(maxAge / 1000)) : this.defaultTtl;
    this.client
      .setex(this.key(sid), ttl, JSON.stringify(sess))
      .then(() => callback?.())
      .catch((err: unknown) => callback?.(err));
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    this.client
      .del(this.key(sid))
      .then(() => callback?.())
      .catch((err: unknown) => callback?.(err));
  }

  /** Refresh a session's TTL without changing its data (touch support). */
  touch(
    sid: string,
    sess: session.SessionData,
    callback?: (err?: unknown) => void
  ): void {
    const maxAge = (sess.cookie as { maxAge?: number | null }).maxAge;
    const ttl = maxAge != null ? Math.max(1, Math.ceil(maxAge / 1000)) : this.defaultTtl;
    this.client
      .expire(this.key(sid), ttl)
      .then(() => callback?.())
      .catch((err: unknown) => callback?.(err));
  }
}
