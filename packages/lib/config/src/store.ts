import type { KVNamespaceBinding } from './binding';
import type {
    AppConfig,
    AppSettings,
    ChatProtocol,
    ChatProviderConfig,
    CustomCommandConfig,
    ImageProtocol,
    ImageProviderConfig,
    MaskedConfig,
    MaskedProvider,
    PluginConfig,
} from './types';
import { cloneDefaultConfig, DEFAULT_SETTINGS } from './defaults';
import { MASKED_API_KEY } from './types';

export const GLOBAL_CONFIG_KEY = 'config:global';

function asString(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : value === null || value === undefined ? fallback : String(value);
}

function asStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((v): v is string => typeof v === 'string');
    }
    if (typeof value === 'string' && value.trim()) {
        return value
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    }
    return [];
}

function asRecord<T extends Record<string, unknown>>(value: unknown): T {
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...(value as T) } : ({} as T);
}

function normalizeSettings(raw: unknown): AppSettings {
    const input = asRecord<Record<string, unknown>>(raw);
    const settings = { ...DEFAULT_SETTINGS };
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]) {
        const value = input[key];
        if (value === undefined) {
            continue;
        }
        const fallback = DEFAULT_SETTINGS[key];
        if (typeof fallback === 'boolean') {
            (settings as any)[key] = value === true || value === 'true';
        } else if (typeof fallback === 'number') {
            // 空值(null/''/undefined)视为“未设置”,回退默认值,而不是被 Number() 变成 0
            const blank = value === null || value === undefined || value === '';
            const n = blank ? Number.NaN : Number(value);
            (settings as any)[key] = Number.isFinite(n) ? n : fallback;
        } else if (Array.isArray(fallback)) {
            (settings as any)[key] = asStringArray(value);
        } else if (fallback === null) {
            (settings as any)[key] = value === null || value === undefined || value === '' ? null : String(value);
        } else {
            (settings as any)[key] = asString(value, fallback);
        }
    }
    if (settings.telegramImageTransferMode !== 'url' && settings.telegramImageTransferMode !== 'base64') {
        settings.telegramImageTransferMode = DEFAULT_SETTINGS.telegramImageTransferMode;
    }
    return settings;
}

/** 旧版按厂商命名的模板 → 统一的 API 协议,用于迁移 KV 中的历史配置 */
const LEGACY_CHAT_PROTOCOL: Record<string, ChatProtocol> = {
    openai: 'chat-completions',
    mistral: 'chat-completions',
    deepseek: 'chat-completions',
    groq: 'chat-completions',
    xai: 'chat-completions',
    cohere: 'chat-completions',
    azure: 'chat-completions',
    gemini: 'chat-completions',
    google: 'chat-completions',
    'openai-compatible': 'chat-completions',
    anthropic: 'anthropic-messages',
    workers: 'workers',
};

const LEGACY_IMAGE_PROTOCOL: Record<string, ImageProtocol> = {
    openai: 'images',
    workers: 'workers',
};

const CHAT_PROTOCOLS: ChatProtocol[] = ['chat-completions', 'anthropic-messages', 'responses', 'workers'];
const IMAGE_PROTOCOLS: ImageProtocol[] = ['images', 'workers'];

function resolveChatProtocol(raw: any): ChatProtocol | null {
    const value = asString(raw.protocol) || asString(raw.template);
    if (!value) {
        return null;
    }
    const protocol = (CHAT_PROTOCOLS as string[]).includes(value)
        ? (value as ChatProtocol)
        : LEGACY_CHAT_PROTOCOL[value];
    return protocol ?? null;
}

function resolveImageProtocol(raw: any): ImageProtocol | null {
    const value = asString(raw.protocol) || asString(raw.template);
    if (!value) {
        return null;
    }
    const protocol = (IMAGE_PROTOCOLS as string[]).includes(value)
        ? (value as ImageProtocol)
        : LEGACY_IMAGE_PROTOCOL[value];
    return protocol ?? null;
}

/** 允许使用的模型列表:优先 `models` 数组,兼容旧的 `modelsList`/`model` */
function normalizeModels(raw: any): string[] {
    const fromArray = (value: unknown): string[] =>
        Array.isArray(value)
            ? value
                  .filter((v): v is string => typeof v === 'string')
                  .map(v => v.trim())
                  .filter(Boolean)
            : [];
    const explicit = fromArray(raw.models);
    if (explicit.length) {
        return [...new Set(explicit)];
    }
    const legacy = asString(raw.modelsList).trim();
    if (legacy.startsWith('[')) {
        try {
            const parsed = fromArray(JSON.parse(legacy));
            if (parsed.length) {
                return [...new Set(parsed)];
            }
        } catch {
            // 忽略非法 JSON,继续回退
        }
    } else if (legacy && !legacy.startsWith('http')) {
        return [legacy];
    }
    const single = asString(raw.model).trim();
    return single ? [single] : [];
}

/** 当前使用的模型必须属于允许列表,否则回退到首个模型 */
function activeModel(raw: any, models: string[]): string {
    const model = asString(raw.model).trim();
    return model && models.includes(model) ? model : (models[0] ?? '');
}

function normalizeChatProvider(raw: any, index: number): ChatProviderConfig | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const protocol = resolveChatProtocol(raw);
    if (!protocol) {
        return null;
    }
    const models = normalizeModels(raw);
    return {
        id: asString(raw.id) || `chat-${index + 1}`,
        protocol,
        label: asString(raw.label) || protocol,
        enabled: raw.enabled !== false,
        apiKey: asString(raw.apiKey),
        baseUrl: asString(raw.baseUrl),
        model: activeModel(raw, models),
        models,
        extraParams: asRecord(raw.extraParams),
        options: asRecord(raw.options),
    };
}

function normalizeImageProvider(raw: any, index: number): ImageProviderConfig | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const protocol = resolveImageProtocol(raw);
    if (!protocol) {
        return null;
    }
    const models = normalizeModels(raw);
    return {
        id: asString(raw.id) || `image-${index + 1}`,
        protocol,
        label: asString(raw.label) || protocol,
        enabled: raw.enabled !== false,
        apiKey: asString(raw.apiKey),
        baseUrl: asString(raw.baseUrl),
        model: activeModel(raw, models),
        models,
        extraParams: asRecord(raw.extraParams),
        options: asRecord(raw.options),
    };
}

function normalizePlugin(raw: any, index: number): PluginConfig | null {
    if (!raw || typeof raw !== 'object' || !raw.command) {
        return null;
    }
    return {
        id: asString(raw.id) || `plugin-${index + 1}`,
        command: asString(raw.command),
        description: asString(raw.description),
        scope: asStringArray(raw.scope),
        template: typeof raw.template === 'string' ? raw.template : JSON.stringify(raw.template ?? ''),
        env: Object.fromEntries(Object.entries(asRecord(raw.env)).map(([k, v]) => [k, asString(v)])),
        enabled: raw.enabled !== false,
    };
}

function normalizeCustomCommand(raw: any, index: number): CustomCommandConfig | null {
    if (!raw || typeof raw !== 'object' || !raw.command) {
        return null;
    }
    return {
        id: asString(raw.id) || `custom-${index + 1}`,
        command: asString(raw.command),
        description: asString(raw.description),
        scope: asStringArray(raw.scope),
        value: asString(raw.value),
        enabled: raw.enabled !== false,
    };
}

function normalizeList<T>(raw: unknown, fn: (item: any, index: number) => T | null): T[] {
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw.map(fn).filter((item): item is T => item !== null);
}

/** 与默认值深合并,容忍 KV 中的缺省/脏数据 */
export function normalizeConfig(raw: unknown): AppConfig {
    const input = asRecord<Record<string, unknown>>(raw);
    return {
        version: 1,
        defaultChatProvider: input.defaultChatProvider ? asString(input.defaultChatProvider) : null,
        defaultImageProvider: input.defaultImageProvider ? asString(input.defaultImageProvider) : null,
        settings: normalizeSettings(input.settings),
        chatProviders: normalizeList(input.chatProviders, normalizeChatProvider),
        imageProviders: normalizeList(input.imageProviders, normalizeImageProvider),
        plugins: normalizeList(input.plugins, normalizePlugin),
        customCommands: normalizeList(input.customCommands, normalizeCustomCommand),
    };
}

/** 形如 token/key/secret/password 的字段视为敏感值,读取时脱敏 */
const SECRET_KEY_PATTERN = /token|key|secret|password|credential/i;

/** 名字含敏感词但实际不是密钥的选项(如 Azure 的自定义请求头名) */
const NON_SECRET_OPTION_KEYS = new Set(['apiKeyHeader']);

function isSecretKey(key: string): boolean {
    return !NON_SECRET_OPTION_KEYS.has(key) && SECRET_KEY_PATTERN.test(key);
}

/** 脱敏对象中的敏感字段(仅在值非空时替换),返回新对象 */
function maskSecrets(record: Record<string, unknown>): Record<string, unknown> {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
        masked[key] = isSecretKey(key) && typeof value === 'string' && value ? MASKED_API_KEY : value;
    }
    return masked;
}

/** 保存时把仍是掩码的敏感字段还原为原值(按 key 匹配) */
function unmaskSecrets(
    incoming: Record<string, unknown>,
    existing: Record<string, unknown> | undefined,
): Record<string, unknown> {
    const restored: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(incoming)) {
        restored[key] = value === MASKED_API_KEY ? (existing?.[key] ?? '') : value;
    }
    return restored;
}

function maskProvider(provider: ChatProviderConfig | ImageProviderConfig): MaskedProvider {
    return {
        id: provider.id,
        protocol: provider.protocol,
        label: provider.label,
        enabled: provider.enabled,
        hasApiKey: !!provider.apiKey,
        // 不下发任何密钥形态的字符串(含占位符),是否存在由 hasApiKey 表达
        apiKey: '',
        baseUrl: provider.baseUrl,
        model: provider.model,
        models: provider.models,
        extraParams: provider.extraParams,
        options: maskSecrets(provider.options),
    };
}

/** 读取用:隐藏 API Key 与 options/env 中的敏感值明文 */
export function maskConfig(config: AppConfig): MaskedConfig {
    return {
        version: 1,
        defaultChatProvider: config.defaultChatProvider,
        defaultImageProvider: config.defaultImageProvider,
        settings: config.settings,
        chatProviders: config.chatProviders.map(maskProvider),
        imageProviders: config.imageProviders.map(maskProvider),
        plugins: config.plugins.map(plugin => ({ ...plugin, env: maskSecrets(plugin.env) as Record<string, string> })),
        customCommands: config.customCommands,
    };
}

/**
 * 保存时解析 apiKey 的三态规则:
 * - `clear` 为 true → 显式删除,置空;
 * - 传入空串/未传 → 保持不变(沿用已存值);
 * - 传入历史占位符 → 保持不变(兼容旧前端);
 * - 其他非空值 → 覆盖为新值。
 */
export function unmaskKey(incoming: string | undefined, existing?: string, clear?: boolean): string {
    if (clear) {
        return '';
    }
    if (!incoming || incoming === MASKED_API_KEY) {
        return existing ?? '';
    }
    return incoming;
}

/** 保存用:空值/占位符保留原 Key,显式 clearApiKey 时删除(含 options 与 plugin env) */
export function unmaskConfig(incoming: MaskedConfig, existing: AppConfig): AppConfig {
    const chatExisting = new Map(existing.chatProviders.map(p => [p.id, p]));
    const imageExisting = new Map(existing.imageProviders.map(p => [p.id, p]));
    const pluginExisting = new Map(existing.plugins.map(p => [p.id, p]));
    const unmaskProviderOptions = (
        provider: MaskedProvider,
        existingProvider: ChatProviderConfig | ImageProviderConfig | undefined,
    ) => ({
        ...provider,
        apiKey: unmaskKey(provider.apiKey, existingProvider?.apiKey, provider.clearApiKey),
        options: unmaskSecrets(provider.options, existingProvider?.options),
    });
    return normalizeConfig({
        ...incoming,
        version: 1,
        chatProviders: incoming.chatProviders.map(p => unmaskProviderOptions(p, chatExisting.get(p.id))),
        imageProviders: incoming.imageProviders.map(p => unmaskProviderOptions(p, imageExisting.get(p.id))),
        plugins: incoming.plugins.map(p => ({
            ...p,
            env: unmaskSecrets(p.env, pluginExisting.get(p.id)?.env) as Record<string, string>,
        })),
    });
}

/**
 * KV 配置存储:全局唯一,读取带短 TTL 缓存(同一次请求/短时间内的多次读取只打一次 KV)。
 */
export class ConfigStore {
    private cache: { config: AppConfig; at: number } | null = null;

    constructor(
        private database: KVNamespaceBinding,
        private readonly ttlMs: number = 5000,
    ) {}

    /** 宿主每次请求可能注入新的绑定对象,这里就地替换以保住 TTL 缓存 */
    setDatabase(database: KVNamespaceBinding): void {
        this.database = database;
    }

    async load(force = false): Promise<AppConfig> {
        if (!this.database) {
            return cloneDefaultConfig();
        }
        if (!force && this.cache && Date.now() - this.cache.at < this.ttlMs) {
            return this.cache.config;
        }
        let config = cloneDefaultConfig();
        try {
            const raw = await this.database.get(GLOBAL_CONFIG_KEY);
            if (raw) {
                config = normalizeConfig(typeof raw === 'string' ? JSON.parse(raw) : raw);
            }
        } catch (e) {
            console.error('Failed to load config', e);
        }
        this.cache = { config, at: Date.now() };
        return config;
    }

    async save(config: AppConfig): Promise<AppConfig> {
        const normalized = normalizeConfig(config);
        await this.database.put(GLOBAL_CONFIG_KEY, JSON.stringify(normalized));
        this.cache = { config: normalized, at: Date.now() };
        return normalized;
    }

    invalidate(): void {
        this.cache = null;
    }
}
