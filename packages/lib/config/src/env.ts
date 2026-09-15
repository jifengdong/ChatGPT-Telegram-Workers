import type { I18n } from '@chatgpt-telegram-workers/i18n';
import type { APIGuardBinding, KVNamespaceBinding, WorkersAIBinding } from './binding';
import type { AppConfig } from './types';
import { loadI18n } from '@chatgpt-telegram-workers/i18n';
import { cloneDefaultConfig } from './defaults';
import { ConfigStore } from './store';
import { BUILD_TIMESTAMP, BUILD_VERSION } from './version';

export type CustomMessageRender = (mode: string | null, message: string) => string;

/**
 * 运行时环境:只承载必要环境变量与平台绑定。
 * 其余全部配置来自 KV(见 ConfigStore / AppConfig),由管理页维护。
 */
class Environment {
    // -- 版本数据 --
    BUILD_TIMESTAMP = BUILD_TIMESTAMP;
    BUILD_VERSION = BUILD_VERSION;

    // -- 必要环境变量 --
    TELEGRAM_TOKEN = '';
    ADMIN_ID = '';
    ADMIN_PASSWORD = '';
    /** 可选:设置后注册 webhook 时携带 secret_token 并校验其请求头,防伪造更新 */
    TELEGRAM_SECRET_TOKEN = '';
    /** 可选:公网 HTTPS 地址,设置后优先于 KV 配置里的 publicBaseUrl */
    PUBLIC_BASE_URL = '';

    // -- 平台绑定 --
    AI_BINDING: WorkersAIBinding | null = null;
    API_GUARD: APIGuardBinding | null = null;
    DATABASE: KVNamespaceBinding = null as any;

    // -- 运行时 --
    I18N: I18n = loadI18n();
    CONFIG: AppConfig = cloneDefaultConfig();
    CUSTOM_MESSAGE_RENDER: CustomMessageRender | null = null;

    private store: ConfigStore | null = null;

    constructor() {
        this.merge = this.merge.bind(this);
    }

    /** 合并平台注入的环境(CF 的 c.env / Node 的 initEnv 结果) */
    merge(source: any) {
        if (!source) {
            return;
        }
        if (source.AI) {
            this.AI_BINDING = source.AI;
        }
        if (source.DATABASE) {
            this.DATABASE = source.DATABASE;
        }
        if (source.API_GUARD) {
            this.API_GUARD = source.API_GUARD;
        }
        if (source.TELEGRAM_TOKEN) {
            this.TELEGRAM_TOKEN = `${source.TELEGRAM_TOKEN}`.trim();
        }
        if (source.ADMIN_ID !== undefined && source.ADMIN_ID !== null && `${source.ADMIN_ID}` !== '') {
            this.ADMIN_ID = `${source.ADMIN_ID}`.trim();
        }
        if (source.ADMIN_PASSWORD !== undefined && source.ADMIN_PASSWORD !== null) {
            this.ADMIN_PASSWORD = `${source.ADMIN_PASSWORD}`;
        }
        if (
            source.TELEGRAM_SECRET_TOKEN !== undefined &&
            source.TELEGRAM_SECRET_TOKEN !== null &&
            `${source.TELEGRAM_SECRET_TOKEN}`.trim() !== ''
        ) {
            this.TELEGRAM_SECRET_TOKEN = `${source.TELEGRAM_SECRET_TOKEN}`.trim();
        }
        if (
            source.PUBLIC_BASE_URL !== undefined &&
            source.PUBLIC_BASE_URL !== null &&
            `${source.PUBLIC_BASE_URL}`.trim() !== ''
        ) {
            this.PUBLIC_BASE_URL = `${source.PUBLIC_BASE_URL}`.trim().replace(/\/+$/, '');
        }
    }

    /** 生效的公网地址:环境变量 PUBLIC_BASE_URL 优先,其次 KV 配置 */
    get publicBaseUrl(): string {
        return this.PUBLIC_BASE_URL || this.CONFIG.settings.publicBaseUrl || '';
    }

    getConfigStore(): ConfigStore {
        // 宿主可能每次请求注入新的绑定对象(如 Vercel 的 Upstash);就地更新数据库引用,
        // 而不是每次重建 store,否则 TTL 缓存将完全失效。
        if (!this.store) {
            this.store = new ConfigStore(this.DATABASE);
        } else {
            this.store.setDatabase(this.DATABASE);
        }
        return this.store;
    }

    /** 从 KV 载入全局配置(带短 TTL 缓存),并同步 i18n */
    async loadConfig(force = false): Promise<AppConfig> {
        if (!this.DATABASE) {
            return this.CONFIG;
        }
        this.CONFIG = await this.getConfigStore().load(force);
        this.I18N = loadI18n(this.CONFIG.settings.language.toLowerCase());
        return this.CONFIG;
    }
}

export const ENV = new Environment();
