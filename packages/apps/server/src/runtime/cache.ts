export type CacheItem = string | null;

export interface PutCacheInfo {
    /** 绝对过期时间(unix 秒) */
    expiration?: number;
    /** 相对过期时间(秒) */
    expirationTtl?: number;
}

/**
 * 与 Cloudflare KV 对齐的最小接口,core 只用到 get/put/delete。
 */
export interface Database {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, info?: PutCacheInfo) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

export function calculateExpiration(info?: PutCacheInfo): number | null {
    if (info?.expiration) {
        return Math.floor(info.expiration);
    }
    if (info?.expirationTtl) {
        return Math.floor(Date.now() / 1000 + info.expirationTtl);
    }
    return null;
}

export function isExpired(expiration: number | null): boolean {
    if (!expiration || expiration < 0) {
        return false;
    }
    return expiration < Math.floor(Date.now() / 1000);
}

export interface StoredEntry {
    value: string;
    expiration: number | null;
}

export function encodeEntry(value: string, info?: PutCacheInfo): string {
    return JSON.stringify({ value, expiration: calculateExpiration(info) } satisfies StoredEntry);
}

export function decodeEntry(raw: string | null | undefined): string | null {
    if (raw === null || raw === undefined) {
        return null;
    }
    try {
        const entry = JSON.parse(raw) as StoredEntry;
        if (isExpired(entry.expiration)) {
            return null;
        }
        return entry.value;
    } catch {
        // 兼容直接存放原始字符串的历史数据
        return raw;
    }
}
