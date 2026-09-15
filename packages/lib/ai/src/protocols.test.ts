import {
    CHAT_PROTOCOLS,
    chatImageSupport,
    findChatProtocol,
    findImageProtocol,
    IMAGE_PROTOCOLS,
    imageAdaptMode,
    isChatProtocol,
    isImageProtocol,
} from './protocols';

describe('protocol registry', () => {
    it('exposes the chat and image API formats', () => {
        expect(CHAT_PROTOCOLS.map(p => p.id)).toEqual(
            expect.arrayContaining(['chat-completions', 'anthropic-messages', 'responses', 'workers']),
        );
        expect(IMAGE_PROTOCOLS.map(p => p.id)).toEqual(['images', 'workers']);
    });

    it('finds a protocol by id', () => {
        expect(findChatProtocol('chat-completions')?.modelList).toBe('openai');
        expect(findChatProtocol('missing')).toBeNull();
        expect(findImageProtocol('images')?.label).toBe('OpenAI Images');
        expect(findImageProtocol('missing')).toBeNull();
    });

    it('checks protocol ids', () => {
        expect(isChatProtocol('workers')).toBe(true);
        expect(isChatProtocol('images')).toBe(false);
        expect(isImageProtocol('images')).toBe(true);
        expect(isImageProtocol('responses')).toBe(false);
    });

    it('marks workers as not using base URL or API key', () => {
        // workers 的端点和凭据来自 accountId/token 或 AI 绑定,通用字段恒为死字段
        for (const protocol of [...CHAT_PROTOCOLS, ...IMAGE_PROTOCOLS].filter(p => p.id === 'workers')) {
            expect(protocol.usesBaseUrl).toBe(false);
            expect(protocol.usesApiKey).toBe(false);
        }
    });

    it('marks HTTP protocols as using base URL and API key', () => {
        for (const id of ['chat-completions', 'anthropic-messages', 'responses']) {
            expect(findChatProtocol(id)?.usesBaseUrl).toBe(true);
            expect(findChatProtocol(id)?.usesApiKey).toBe(true);
        }
        expect(findImageProtocol('images')?.usesBaseUrl).toBe(true);
        expect(findImageProtocol('images')?.usesApiKey).toBe(true);
    });
});

describe('chatImageSupport', () => {
    it('maps image support per protocol', () => {
        expect(chatImageSupport('anthropic-messages')).toBe('inline');
        expect(chatImageSupport('workers')).toBe('none');
        expect(chatImageSupport('chat-completions')).toBe('both');
        expect(chatImageSupport('responses')).toBe('both');
    });
});

describe('imageAdaptMode', () => {
    it('strips images for none protocols', () => {
        expect(imageAdaptMode('workers', 'base64')).toBe('none');
    });

    it('always inlines for inline protocols regardless of config', () => {
        expect(imageAdaptMode('anthropic-messages')).toBe('base64');
        expect(imageAdaptMode('anthropic-messages', 'url')).toBe('base64');
    });

    it('honors imageTransfer for both protocols and defaults to url', () => {
        expect(imageAdaptMode('chat-completions')).toBe('url');
        expect(imageAdaptMode('chat-completions', 'url')).toBe('url');
        expect(imageAdaptMode('responses', 'base64')).toBe('base64');
    });
});
