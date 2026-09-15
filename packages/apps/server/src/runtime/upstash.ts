import type { Database, PutCacheInfo } from './cache';
import { calculateExpiration } from './cache';

/**
 * Upstash Redis REST 实现:直接用 fetch 调 REST 命令数组,不依赖 @upstash/redis。
 * 存储值为 JSON 信封 {value, expiration},expiration 为绝对 unix 秒。
 */
export class UpStashCache implements Database {
    private readonly url: string;
    private readonly token: string;

    constructor(url: string, token: string) {
        this.url = url;
        this.token = token;
    }

    static create(url: string, token: string): UpStashCache {
        return new UpStashCache(url, token);
    }

    private async command(args: (string | number)[]): Promise<any> {
        const res = await fetch(this.url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(args),
        });
        if (!res.ok) {
            throw new Error(`Upstash request failed: ${res.status} ${res.statusText}`);
        }
        const data = (await res.json()) as { result?: any; error?: string };
        if (data.error) {
            throw new Error(`Upstash error: ${data.error}`);
        }
        return data.result;
    }

    async get(key: string): Promise<string | null> {
        const raw = await this.command(['GET', key]);
        if (raw === null || raw === undefined) {
            return null;
        }
        try {
            const entry = JSON.parse(raw) as { value: string; expiration: number | null };
            if (entry.expiration && entry.expiration < Math.floor(Date.now() / 1000)) {
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
            await this.command(['SET', key, payload, 'EXAT', expiration]);
        } else {
            await this.command(['SET', key, payload]);
        }
    }

    async delete(key: string): Promise<void> {
        await this.command(['DEL', key]);
    }
}
