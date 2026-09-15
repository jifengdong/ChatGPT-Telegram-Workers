import { fetchModels } from './models';
import { jsonResponse } from './testing';

function withFetch(mock: ReturnType<typeof vi.fn>) {
    const original = globalThis.fetch;
    globalThis.fetch = mock as any;
    return () => {
        globalThis.fetch = original;
    };
}

describe('fetchModels', () => {
    it('lists openai-compatible models with bearer auth', async () => {
        const mock = vi
            .fn()
            .mockResolvedValue(jsonResponse({ data: [{ id: 'gpt-4o' }, { id: 'gpt-4o-mini' }, { id: 42 }] }));
        const restore = withFetch(mock);
        try {
            const models = await fetchModels(
                'chat-completions',
                { protocol: 'chat-completions', baseUrl: 'https://proxy.example/v1/', apiKey: 'sk', options: {} },
                'chat',
            );
            expect(models).toEqual(['gpt-4o', 'gpt-4o-mini']);
            const [url, init] = mock.mock.calls[0];
            expect(url).toBe('https://proxy.example/v1/models');
            expect(init.headers.Authorization).toBe('Bearer sk');
        } finally {
            restore();
        }
    });

    it('lists anthropic models with api key headers', async () => {
        const mock = vi.fn().mockResolvedValue(jsonResponse({ data: [{ id: 'claude-sonnet-4' }] }));
        const restore = withFetch(mock);
        try {
            const models = await fetchModels(
                'anthropic-messages',
                { protocol: 'anthropic-messages', baseUrl: '', apiKey: 'ak', options: {} },
                'chat',
            );
            expect(models).toEqual(['claude-sonnet-4']);
            const [url, init] = mock.mock.calls[0];
            expect(url).toBe('https://api.anthropic.com/v1/models');
            expect(init.headers['x-api-key']).toBe('ak');
            expect(init.headers['anthropic-version']).toBe('2023-06-01');
        } finally {
            restore();
        }
    });

    it('searches cloudflare models per task type', async () => {
        const mock = vi
            .fn()
            .mockResolvedValue(jsonResponse({ result: [{ name: '@cf/stable-diffusion-xl' }, { name: null }] }));
        const restore = withFetch(mock);
        try {
            const models = await fetchModels(
                'workers',
                { protocol: 'workers', baseUrl: '', apiKey: '', options: { accountId: 'acc', token: 'tok' } },
                'image',
            );
            expect(models).toEqual(['@cf/stable-diffusion-xl']);
            expect(mock.mock.calls[0][0]).toContain('accounts/acc/ai/models/search?task=Text-to-Image');
        } finally {
            restore();
        }
    });

    it('throws for workers without credentials and returns empty for unknown protocols', async () => {
        const restore = withFetch(vi.fn());
        try {
            await expect(
                fetchModels('workers', { protocol: 'workers', baseUrl: '', apiKey: '', options: {} }, 'chat'),
            ).rejects.toThrow('account ID and token');
            await expect(
                fetchModels('unknown', { protocol: 'unknown', baseUrl: '', apiKey: '', options: {} }, 'chat'),
            ).resolves.toEqual([]);
        } finally {
            restore();
        }
    });

    it('lists workers models through the AI binding without credentials', async () => {
        const mock = vi.fn();
        const restore = withFetch(mock);
        const models = vi.fn().mockResolvedValue([{ name: '@cf/meta/llama-3-8b-instruct' }, { name: null }, {}]);
        try {
            const result = await fetchModels(
                'workers',
                { protocol: 'workers', baseUrl: '', apiKey: '', options: {}, binding: { run: vi.fn() as any, models } },
                'chat',
            );
            expect(result).toEqual(['@cf/meta/llama-3-8b-instruct']);
            expect(models).toHaveBeenCalledWith({ task: 'Text Generation', per_page: 100 });
            expect(mock).not.toHaveBeenCalled();
        } finally {
            restore();
        }
    });

    it('asks the binding for image models when kind is image', async () => {
        const models = vi.fn().mockResolvedValue([]);
        await fetchModels(
            'workers',
            { protocol: 'workers', baseUrl: '', apiKey: '', options: {}, binding: { run: vi.fn() as any, models } },
            'image',
        );
        expect(models).toHaveBeenCalledWith({ task: 'Text-to-Image', per_page: 100 });
    });

    it('keeps only chat models when the runtime returns mixed tasks', async () => {
        const models = vi.fn().mockResolvedValue([
            { name: '@cf/meta/llama-3-8b-instruct', task: { name: 'Text Generation' } },
            { name: '@cf/stable-diffusion-xl', task: { name: 'Text-to-Image' } },
            { name: '@cf/baai/bge-large-en-v1.5', task: { name: 'Text Embeddings' } },
        ]);
        const result = await fetchModels(
            'workers',
            { protocol: 'workers', baseUrl: '', apiKey: '', options: {}, binding: { run: vi.fn() as any, models } },
            'chat',
        );
        expect(result).toEqual(['@cf/meta/llama-3-8b-instruct']);
    });

    it('keeps only image models when the runtime returns mixed tasks', async () => {
        const models = vi.fn().mockResolvedValue([
            { name: '@cf/meta/llama-3-8b-instruct', task: { name: 'Text Generation' } },
            { name: '@cf/stable-diffusion-xl', task: { name: 'Text-to-Image' } },
            // 归一化后等价,不能因连字符写法差异被过滤掉
            { name: '@cf/black-forest-labs/flux-1-schnell', task: 'Text to Image' },
        ]);
        const result = await fetchModels(
            'workers',
            { protocol: 'workers', baseUrl: '', apiKey: '', options: {}, binding: { run: vi.fn() as any, models } },
            'image',
        );
        expect(result).toEqual(['@cf/stable-diffusion-xl', '@cf/black-forest-labs/flux-1-schnell']);
    });

    it('keeps entries whose task is unknown rather than dropping them', async () => {
        const models = vi.fn().mockResolvedValue([{ name: '@cf/unknown-model' }]);
        const result = await fetchModels(
            'workers',
            { protocol: 'workers', baseUrl: '', apiKey: '', options: {}, binding: { run: vi.fn() as any, models } },
            'chat',
        );
        expect(result).toEqual(['@cf/unknown-model']);
    });

    it('filters REST search results by task as well', async () => {
        const mock = vi.fn().mockResolvedValue(
            jsonResponse({
                result: [
                    { name: '@cf/stable-diffusion-xl', task: { name: 'Text-to-Image' } },
                    { name: '@cf/meta/llama-3-8b-instruct', task: { name: 'Text Generation' } },
                ],
            }),
        );
        const restore = withFetch(mock);
        try {
            const result = await fetchModels(
                'workers',
                { protocol: 'workers', baseUrl: '', apiKey: '', options: { accountId: 'acc', token: 'tok' } },
                'image',
            );
            expect(result).toEqual(['@cf/stable-diffusion-xl']);
        } finally {
            restore();
        }
    });

    it('falls back to REST credentials when the binding has no models()', async () => {
        const mock = vi.fn().mockResolvedValue(jsonResponse({ result: [{ name: '@cf/meta/llama-3-8b-instruct' }] }));
        const restore = withFetch(mock);
        try {
            const result = await fetchModels(
                'workers',
                {
                    protocol: 'workers',
                    baseUrl: '',
                    apiKey: '',
                    options: { accountId: 'acc', token: 'tok' },
                    binding: { run: vi.fn() as any },
                },
                'chat',
            );
            expect(result).toEqual(['@cf/meta/llama-3-8b-instruct']);
            expect(mock.mock.calls[0][0]).toContain('accounts/acc/ai/models/search?task=Text%20Generation');
        } finally {
            restore();
        }
    });
});
