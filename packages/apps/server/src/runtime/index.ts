import type { Database } from './cache';
import { LocalCache, MemoryCache } from './memory';
import { RedisCache } from './redis';
import { SQLiteCache } from './sqlite';

export * from './cache';
export * from './env';
export * from './http';
export * from './memory';
export * from './proxy';
export * from './redis';
export * from './sqlite';
export * from './upstash';

export interface CacheOptions {
    uri: string;
}

/**
 * 按类型创建本地部署所用的 DATABASE 实现。
 * memory/local/sqlite/redis 对应 config.json 中的 database.type。
 */
export function createCache(type: string, options: CacheOptions): Database {
    switch (type) {
        case 'local':
            return new LocalCache(options.uri);
        case 'sqlite':
            return new SQLiteCache({ path: options.uri });
        case 'redis':
            return RedisCache.create(options.uri);
        default:
            return new MemoryCache();
    }
}
