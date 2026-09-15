import type { AppConfig } from '@chatgpt-telegram-workers/config';
import { ENV, normalizeConfig } from '@chatgpt-telegram-workers/config';
import { CHAT_PROTOCOLS, chatImageSupport, findChatProtocol, IMAGE_PROTOCOLS } from '@chatgpt-telegram-workers/ai';
import { buildChatAgents, buildImageAgents, loadChatLLM, loadImageGen } from './agent';

function config(partial: any): AppConfig {
    return normalizeConfig(partial);
}

describe('protocols', () => {
    it('exposes the chat and image API formats', () => {
        expect(CHAT_PROTOCOLS.map(p => p.id)).toEqual(
            expect.arrayContaining(['chat-completions', 'anthropic-messages', 'responses', 'workers']),
        );
        expect(IMAGE_PROTOCOLS.map(p => p.id)).toEqual(['images', 'workers']);
    });

    it('finds a protocol by id', () => {
        expect(findChatProtocol('chat-completions')?.modelList).toBe('openai');
        expect(findChatProtocol('missing')).toBeNull();
    });

    it('maps image support per protocol', () => {
        expect(chatImageSupport('anthropic-messages')).toBe('inline');
        expect(chatImageSupport('workers')).toBe('none');
        expect(chatImageSupport('chat-completions')).toBe('both');
    });
});

describe('buildChatAgents', () => {
    it('builds agents only for enabled providers', () => {
        const agents = buildChatAgents(
            config({
                chatProviders: [
                    { id: 'a', protocol: 'chat-completions', label: 'A', enabled: true, model: 'gpt-4o', apiKey: 'k' },
                    { id: 'b', protocol: 'chat-completions', label: 'B', enabled: false, model: 'gpt-4o', apiKey: 'k' },
                ],
            }),
        );
        expect(agents.map(a => a.name)).toEqual(['a']);
    });

    it('exposes the allowed model list', async () => {
        const agents = buildChatAgents(
            config({
                chatProviders: [
                    { id: 'a', protocol: 'chat-completions', model: 'm1', models: ['m1', 'm2'], apiKey: 'k' },
                ],
            }),
        );
        expect(await agents[0].modelList()).toEqual(['m1', 'm2']);
        expect(agents[0].model).toBe('m1');
    });
});

describe('loadChatLLM / loadImageGen', () => {
    it('prefers the configured default provider', () => {
        const cfg = config({
            defaultChatProvider: 'second',
            chatProviders: [
                { id: 'first', protocol: 'chat-completions', model: 'm1', apiKey: 'k' },
                { id: 'second', protocol: 'chat-completions', model: 'm2', apiKey: 'k' },
            ],
        });
        expect(loadChatLLM(cfg)?.model).toBe('m2');
    });

    it('falls back to the first enabled provider', () => {
        const cfg = config({
            defaultChatProvider: null,
            chatProviders: [
                { id: 'first', protocol: 'chat-completions', model: 'm1', apiKey: 'k' },
                { id: 'second', protocol: 'chat-completions', model: 'm2', apiKey: 'k' },
            ],
        });
        expect(loadChatLLM(cfg)?.name).toBe('first');
    });

    it('returns null when nothing configured', () => {
        expect(loadChatLLM(config({}))).toBeNull();
        expect(loadImageGen(config({}))).toBeNull();
    });

    it('builds image agents', () => {
        const agents = buildImageAgents(
            config({
                imageProviders: [{ id: 'img', protocol: 'images', model: 'dall-e-3', apiKey: 'k' }],
            }),
        );
        expect(agents.map(a => a.name)).toEqual(['img']);
    });
});

describe('workers providers without credentials', () => {
    const workersChat = config({
        chatProviders: [{ id: 'wc', protocol: 'workers', model: '@cf/meta/llama-3-8b-instruct' }],
    });
    const workersImage = config({
        imageProviders: [{ id: 'wi', protocol: 'workers', model: '@cf/stable-diffusion-xl' }],
    });

    afterEach(() => {
        ENV.AI_BINDING = null as any;
    });

    it('skips chat and image providers when neither binding nor credentials exist', () => {
        ENV.AI_BINDING = null as any;
        // 两侧行为必须一致:都没有可用凭据时跳过,而不是留到调用时才报错
        expect(buildChatAgents(workersChat)).toEqual([]);
        expect(buildImageAgents(workersImage)).toEqual([]);
        expect(loadImageGen(workersImage)).toBeNull();
    });

    it('builds both providers from the AI binding alone', () => {
        ENV.AI_BINDING = { run: vi.fn() } as any;
        expect(buildChatAgents(workersChat).map(a => a.name)).toEqual(['wc']);
        expect(buildImageAgents(workersImage).map(a => a.name)).toEqual(['wi']);
    });

    it('builds both providers from account id and token alone', () => {
        ENV.AI_BINDING = null as any;
        const creds = { accountId: 'acc', token: 'tok' };
        expect(
            buildChatAgents(
                config({
                    chatProviders: [{ id: 'wc', protocol: 'workers', model: 'm', options: creds }],
                }),
            ).map(a => a.name),
        ).toEqual(['wc']);
        expect(
            buildImageAgents(
                config({
                    imageProviders: [{ id: 'wi', protocol: 'workers', model: 'm', options: creds }],
                }),
            ).map(a => a.name),
        ).toEqual(['wi']);
    });
});
