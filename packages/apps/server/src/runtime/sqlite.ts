import type { Database, PutCacheInfo } from './cache';
import { calculateExpiration, isExpired } from './cache';

export interface SQLiteCacheOptions {
    /** 数据库文件路径 */
    path: string;
    tableName?: string;
}

interface Row {
    key: string;
    value: string;
    expiration: number | null;
}

/**
 * SQLite 实现:惰性载入 sqlite3 原生模块,避免在不需要 sqlite 的平台上引入构建负担。
 * 表结构按需创建,过期通过读取时判断 expiration 实现。
 */
export class SQLiteCache implements Database {
    private db: any = null;
    private readonly options: SQLiteCacheOptions;
    private readonly table: string;
    private ready: Promise<any> | null = null;

    constructor(options: SQLiteCacheOptions) {
        this.options = options;
        this.table = options.tableName || 'CACHES_v2';
    }

    private async load(): Promise<any> {
        if (this.db) {
            return this.db;
        }
        if (!this.ready) {
            this.ready = (async () => {
                const { default: sqlite3 } = await import('sqlite3');
                const db = new sqlite3.Database(this.options.path);
                await new Promise<void>((resolve, reject) => {
                    db.serialize(() => {
                        db.run(
                            `CREATE TABLE IF NOT EXISTS ${this.table} (key TEXT PRIMARY KEY, value TEXT NOT NULL, expiration INTEGER NOT NULL DEFAULT -1)`,
                        );
                        db.run(
                            `CREATE INDEX IF NOT EXISTS idx_${this.table}_key ON ${this.table}(key)`,
                            (err: Error | null) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            },
                        );
                    });
                });
                this.db = db;
                return db;
            })();
        }
        return this.ready;
    }

    private exec(db: any, sql: string, params: any[]): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err: Error | null) => (err ? reject(err) : resolve()));
        });
    }

    private queryOne(db: any, sql: string, params: any[]): Promise<Row | null> {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err: Error | null, row: Row | null) => (err ? reject(err) : resolve(row ?? null)));
        });
    }

    async get(key: string): Promise<string | null> {
        const db = await this.load();
        const row = await this.queryOne(db, `SELECT key, value, expiration FROM ${this.table} WHERE key = ?`, [key]);
        if (!row) {
            return null;
        }
        if (isExpired(row.expiration)) {
            await this.delete(key);
            return null;
        }
        return row.value;
    }

    async put(key: string, value: string, info?: PutCacheInfo): Promise<void> {
        const db = await this.load();
        const expiration = calculateExpiration(info) ?? -1;
        await this.exec(
            db,
            `INSERT INTO ${this.table} (key, value, expiration) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, expiration = excluded.expiration`,
            [key, value, expiration],
        );
    }

    async delete(key: string): Promise<void> {
        const db = await this.load();
        await this.exec(db, `DELETE FROM ${this.table} WHERE key = ?`, [key]);
    }

    async close(): Promise<void> {
        this.db?.close();
        this.db = null;
    }
}
