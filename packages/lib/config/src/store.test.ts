import type { KVNamespaceBinding } from './binding';
import type { AppConfig } from './types';
import { DEFAULT_CONFIG } from './defaults';
import { ConfigStore, GLOBAL_CONFIG_KEY, maskConfig, normalizeConfig, unmaskConfig } from './store';
import { MASKED_API_KEY } from './types';

function memoryKV(): KVNamespaceBinding & { data: Map<string, string> } {
    const data = new Map<string, string>();
    return {
        data,
        get: async (key: string) => data.get(key) ?? null,
        put: async (key: string, value: string) => {
            data.set(key, value);
        },
        delete: async (key: string) => {
            data.delete(key);
        },
    };
}

describe('normalizeConfig', () => {
    it('returns defaults for empty input', () => {
        const config = normalizeConfig(undefined);
        expect(config.version).toBe(1);
        expect(config.settings.maxHistoryLength).toBe(DEFAULT_CONFIG.settings.maxHistoryLength);
        expect(config.chatProviders).toEqual([]);
    });

    it('coerces types and drops invalid providers', () => {
        const config = normalizeConfig({
            settings: { maxHistoryLength: '42', streamMode: 'true', hideCommandButtons: ['/x'], allowedUserIds: 'a,b' },
            chatProviders: [{ protocol: 'chat-completions', model: 'gpt-4o' }, { model: 'no-protocol' }, null],
        });
        expect(config.settings.maxHistoryLength).toBe(42);
        expect(config.settings.streamMode).toBe(true);
        expect(config.settings.hideCommandButtons).toEqual(['/x']);
        expect(config.settings.allowedUserIds).toEqual(['a', 'b']);
        expect(config.chatProviders).toHaveLength(1);
        expect(config.chatProviders[0].enabled).toBe(true);
        expect(config.chatProviders[0].models).toEqual(['gpt-4o']);
    });

    it('migrates legacy vendor templates to protocols', () => {
        const config = normalizeConfig({
            chatProviders: [
                { id: 'a', template: 'openai', model: 'gpt-4o' },
                { id: 'b', template: 'deepseek', model: 'deepseek-chat' },
                { id: 'c', template: 'anthropic', model: 'claude-3-5-haiku-latest' },
                { id: 'd', template: 'workers', model: '@cf/qwen/qwen1.5-7b-chat-awq' },
            ],
            imageProviders: [{ id: 'e', template: 'openai', model: 'dall-e-3' }],
        });
        expect(config.chatProviders.map(p => p.protocol)).toEqual([
            'chat-completions',
            'chat-completions',
            'anthropic-messages',
            'workers',
        ]);
        expect(config.imageProviders[0].protocol).toBe('images');
    });

    it('keeps per-provider extraParams on image providers', () => {
        const config = normalizeConfig({
            imageProviders: [
                {
                    id: 'flux',
                    protocol: 'workers',
                    model: '@cf/black-forest-labs/flux-1-schnell',
                    extraParams: { num_steps: 4, width: 1024 },
                },
            ],
        });
        expect(config.imageProviders[0].extraParams).toEqual({ num_steps: 4, width: 1024 });
    });

    it('drops per-provider generation params that normalization does not know', () => {
        const config = normalizeConfig({
            imageProviders: [{ id: 'i', protocol: 'images', model: 'dall-e-3', size: '1792x1024' }],
        });
        expect(config.imageProviders[0]).not.toHaveProperty('size');
    });

    it('parses legacy modelsList into the allowed models', () => {
        const config = normalizeConfig({
            chatProviders: [{ id: 'a', protocol: 'chat-completions', model: 'm1', modelsList: '["m1","m2"]' }],
        });
        expect(config.chatProviders[0].models).toEqual(['m1', 'm2']);
    });

    it('falls back to the first allowed model when active model is unknown', () => {
        const config = normalizeConfig({
            chatProviders: [{ id: 'a', protocol: 'chat-completions', model: 'ghost', models: ['m1', 'm2'] }],
        });
        expect(config.chatProviders[0].model).toBe('m1');
    });

    it('treats blank numeric values as unset rather than 0', () => {
        const config = normalizeConfig({ settings: { maxTokenLength: null, maxHistoryLength: '' } });
        expect(config.settings.maxTokenLength).toBe(DEFAULT_CONFIG.settings.maxTokenLength);
        expect(config.settings.maxHistoryLength).toBe(DEFAULT_CONFIG.settings.maxHistoryLength);
    });

    it('migrates legacy azure and gemini templates', () => {
        const config = normalizeConfig({
            chatProviders: [
                { id: 'a', template: 'azure', model: 'gpt-4' },
                { id: 'b', template: 'gemini', model: 'gemini-pro' },
            ],
        });
        expect(config.chatProviders.map(p => p.protocol)).toEqual(['chat-completions', 'chat-completions']);
    });
});

describe('default config isolation', () => {
    it('does not alias the shared defaults across stores', async () => {
        const first = await new ConfigStore(memoryKV()).load();
        first.chatProviders.push({
            id: 'mutated',
            protocol: 'chat-completions',
            label: 'x',
            enabled: true,
            apiKey: '',
            baseUrl: '',
            model: 'm',
            models: ['m'],
            extraParams: {},
            options: {},
        });
        const second = await new ConfigStore(memoryKV()).load();
        expect(second.chatProviders).toEqual([]);
    });
});

describe('mask / unmask', () => {
    const config: AppConfig = normalizeConfig({
        chatProviders: [{ id: 'openai-1', protocol: 'chat-completions', apiKey: 'sk-secret', model: 'gpt-4o' }],
    });

    it('never returns the raw key, only exposes hasApiKey', () => {
        const masked = maskConfig(config);
        expect(masked.chatProviders[0].apiKey).toBe('');
        expect(masked.chatProviders[0].hasApiKey).toBe(true);
        expect(JSON.stringify(masked)).not.toContain('sk-secret');
    });

    it('keeps original key when an empty value comes back (empty means unchanged)', () => {
        const masked = maskConfig(config);
        masked.chatProviders[0].models = ['gpt-4o', 'gpt-4o-mini'];
        masked.chatProviders[0].model = 'gpt-4o-mini';
        expect(masked.chatProviders[0].apiKey).toBe('');
        const restored = unmaskConfig(masked, config);
        expect(restored.chatProviders[0].apiKey).toBe('sk-secret');
        expect(restored.chatProviders[0].model).toBe('gpt-4o-mini');
    });

    it('still accepts the legacy masked placeholder from older clients', () => {
        const masked = maskConfig(config);
        masked.chatProviders[0].apiKey = MASKED_API_KEY;
        const restored = unmaskConfig(masked, config);
        expect(restored.chatProviders[0].apiKey).toBe('sk-secret');
    });

    it('clears the key only when clearApiKey is set', () => {
        const masked = maskConfig(config);
        masked.chatProviders[0].clearApiKey = true;
        const restored = unmaskConfig(masked, config);
        expect(restored.chatProviders[0].apiKey).toBe('');
        // clearApiKey 是请求级标志,不落库
        expect(restored.chatProviders[0]).not.toHaveProperty('clearApiKey');
    });

    it('accepts a new key when provided', () => {
        const masked = maskConfig(config);
        masked.chatProviders[0].apiKey = 'sk-new';
        const restored = unmaskConfig(masked, config);
        expect(restored.chatProviders[0].apiKey).toBe('sk-new');
    });

    it('masks provider options and plugin env secrets, restoring them on save', () => {
        const withSecrets = normalizeConfig({
            chatProviders: [
                { id: 'w', protocol: 'workers', model: 'm', options: { accountId: 'acct', token: 'cf-secret' } },
            ],
            plugins: [{ id: 'p', command: '/p', template: '{}', env: { API_KEY: 'plugin-secret', PUBLIC: 'ok' } }],
        });
        const masked = maskConfig(withSecrets);
        expect(masked.chatProviders[0].options.token).toBe(MASKED_API_KEY);
        expect(masked.chatProviders[0].options.accountId).toBe('acct');
        expect(masked.plugins[0].env.API_KEY).toBe(MASKED_API_KEY);
        expect(masked.plugins[0].env.PUBLIC).toBe('ok');

        const restored = unmaskConfig(masked, withSecrets);
        expect(restored.chatProviders[0].options.token).toBe('cf-secret');
        expect(restored.plugins[0].env.API_KEY).toBe('plugin-secret');
    });
});

describe('configStore', () => {
    it('loads defaults when KV is empty', async () => {
        const store = new ConfigStore(memoryKV());
        const config = await store.load();
        expect(config.chatProviders).toEqual([]);
    });

    it('saves and reloads from KV', async () => {
        const kv = memoryKV();
        const store = new ConfigStore(kv);
        await store.save(
            normalizeConfig({
                defaultChatProvider: 'x',
                chatProviders: [{ id: 'x', protocol: 'chat-completions', model: 'm' }],
            }),
        );
        expect(kv.data.has(GLOBAL_CONFIG_KEY)).toBe(true);

        const fresh = new ConfigStore(kv);
        const loaded = await fresh.load();
        expect(loaded.defaultChatProvider).toBe('x');
        expect(loaded.chatProviders[0].id).toBe('x');
    });

    it('caches until invalidated', async () => {
        const kv = memoryKV();
        let reads = 0;
        const spy = {
            ...kv,
            get: async (k: string) => {
                reads++;
                return kv.get(k);
            },
        };
        const store = new ConfigStore(spy as any);
        await store.load();
        await store.load();
        expect(reads).toBe(1);
        store.invalidate();
        await store.load();
        expect(reads).toBe(2);
    });

    it('tolerates corrupt KV payloads', async () => {
        const kv = memoryKV();
        kv.data.set(GLOBAL_CONFIG_KEY, '{not json');
        const store = new ConfigStore(kv);
        const config = await store.load();
        expect(config.version).toBe(1);
    });
});
