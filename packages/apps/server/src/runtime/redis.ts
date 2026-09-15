import type { Database, PutCacheInfo } from './cache';
import Redis from 'ioredis';
import { calculateExpiration, isExpired } from './cache';

interface RedisStoredEntry {
    value: string;
    expiration: number | null;
}

/**
 * Redis 实现(ioredis)。值以 JSON 信封存储,过期由 Redis 自身 EXPIREAT 保证,
 * 同时冗余 expiration 以兼容从其它实现迁移的数据。
 */
export class RedisCache implements Database {
    private readonly redis: Redis;

    constructor(redis: Redis) {
        this.redis = redis;
    }

    static create(uri: string): RedisCache {
        return new RedisCache(new Redis(uri));
    }

    async get(key: string): Promise<string | null> {
        const raw = await this.redis.get(key);
        if (!raw) {
            return null;
        }
        try {
            const entry = JSON.parse(raw) as RedisStoredEntry;
            if (isExpired(entry.expiration)) {
                return null;
            }
            return entry.value;
        } catch {
            return raw;
        }
    }

    async put(key: string, value: string, info?: PutCacheInfo): Promise<void> {
        const expiration = calculateExpiration(info);
        const payload = JSON.stringify({ value, expiration });
        if (expiration) {
            await this.redis.set(key, payload, 'EXAT', expiration);
        } else {
            await this.redis.set(key, payload);
        }
    }

    async delete(key: string): Promise<void> {
        await this.redis.del(key);
    }

    async close(): Promise<void> {
        await this.redis.quit();
    }
}
