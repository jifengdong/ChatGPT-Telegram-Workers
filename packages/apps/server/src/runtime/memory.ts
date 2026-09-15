import type { Database, PutCacheInfo, StoredEntry } from './cache';
import { readFileSync, writeFileSync } from 'node:fs';
import { calculateExpiration, isExpired } from './cache';

export class MemoryCache implements Database {
    protected store = new Map<string, StoredEntry>();

    async get(key: string): Promise<string | null> {
        const entry = this.store.get(key);
        if (!entry) {
            return null;
        }
        if (isExpired(entry.expiration)) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    async put(key: string, value: string, info?: PutCacheInfo): Promise<void> {
        this.store.set(key, { value, expiration: calculateExpiration(info) });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    dump(): string {
        return JSON.stringify(Object.fromEntries(this.store));
    }

    restore(raw: string): void {
        const data = JSON.parse(raw) as Record<string, StoredEntry>;
        this.store = new Map(Object.entries(data));
    }
}

/**
 * 纯文件持久化:启动时读入内存,每次写操作落盘。
 */
export class LocalCache extends MemoryCache {
    private readonly path: string;

    constructor(path: string) {
        super();
        this.path = path;
        try {
            this.restore(readFileSync(this.path, 'utf-8'));
            console.log(`Cache loaded from ${this.path}`);
        } catch {
            // 文件不存在时从空缓存开始
        }
    }

    private persist(): void {
        writeFileSync(this.path, this.dump());
    }

    override async put(key: string, value: string, info?: PutCacheInfo): Promise<void> {
        await super.put(key, value, info);
        this.persist();
    }

    override async delete(key: string): Promise<void> {
        await super.delete(key);
        this.persist();
    }
}
