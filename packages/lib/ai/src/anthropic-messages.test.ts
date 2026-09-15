import type { CompletionOptions } from './types';
import {
    AnthropicMessagesClient,
    buildAnthropicMessagesBody,
    parseAnthropicMessagesResponse,
    parseAnthropicMessagesSSE,
} from './anthropic-messages';
import { collectStream, imageResponse, jsonResponse, sseEvent, sseResponse } from './testing';

/** PNG 魔数,base64 首字符为 'i',可被格式嗅探识别 */
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_BASE64 = 'iVBORw0KGgo=';

const options: CompletionOptions = {
    model: 'claude-3-5-haiku-latest',
    system: 'be nice',
    maxTokens: 100,
    messages: [
        { role: 'system', content: 'legacy system' },
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
        {
            role: 'user',
            content: [
                { type: 'text', text: 'look' },
                { type: 'image', image: new Uint8Array([1, 2, 3]), mimeType: 'image/png' },
            ],
        },
    ],
};

describe('buildAnthropicMessagesBody', () => {
    it('renders messages with base64 image and merges system', () => {
        expect(buildAnthropicMessagesBody(options, true)).toEqual({
            model: 'claude-3-5-haiku-latest',
            max_tokens: 100,
            system: 'be nice\n\nlegacy system',
            stream: true,
            messages: [
                { role: 'user', content: 'hi' },
                { role: 'assistant', content: 'hello' },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'look' },
                        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AQID' } },
                    ],
                },
            ],
        });
    });

    it('defaults max_tokens and drops raw URL images (anthropic always inlines)', () => {
        const body = buildAnthropicMessagesBody(
            {
                model: 'claude',
                messages: [{ role: 'user', content: [{ type: 'image', image: 'https://example.com/cat.png' }] }],
            },
            false,
        );
        expect(body.max_tokens).toBe(4096);
        // 请求构建阶段不抓取远程 URL;由 adaptMessageImages 在发送前内联为 base64
        expect(body.messages[0].content).toEqual([]);
        expect(body.stream).toBeUndefined();
    });

    it('splits data URI into base64 source', () => {
        const body = buildAnthropicMessagesBody(
            {
                model: 'claude',
                messages: [{ role: 'user', content: [{ type: 'image', image: 'data:image/webp;base64,QUJD' }] }],
            },
            false,
        );
        expect(body.messages[0].content).toEqual([
            { type: 'image', source: { type: 'base64', media_type: 'image/webp', data: 'QUJD' } },
        ]);
    });

    it('merges extra params last', () => {
        const body = buildAnthropicMessagesBody({ ...options, extra: { temperature: 0.5 } }, false);
        expect(body.temperature).toBe(0.5);
    });
});

describe('parseAnthropicMessagesResponse', () => {
    it('extracts text usage and stop reason', () => {
        expect(
            parseAnthropicMessagesResponse({
                content: [
                    { type: 'text', text: 'hello ' },
                    { type: 'text', text: 'world' },
                ],
                usage: { input_tokens: 3, output_tokens: 2 },
                stop_reason: 'end_turn',
            }),
        ).toEqual({
            text: 'hello world',
            usage: { inputTokens: 3, outputTokens: 2, totalTokens: 5 },
            stopReason: 'end_turn',
        });
    });
});

describe('parseAnthropicMessagesSSE', () => {
    it('extracts text deltas', () => {
        expect(
            parseAnthropicMessagesSSE({
                event: 'content_block_delta',
                data: '{"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}',
            }),
        ).toEqual({ delta: 'Hi' });
    });

    it('finishes on message_stop', () => {
        expect(parseAnthropicMessagesSSE({ event: 'message_stop', data: '{"type":"message_stop"}' })).toEqual({
            finish: true,
        });
    });

    it('ignores unrelated events', () => {
        expect(parseAnthropicMessagesSSE({ event: 'message_start', data: '{"type":"message_start"}' })).toEqual({});
    });

    it('reports error events', () => {
        expect(
            parseAnthropicMessagesSSE({ event: 'error', data: '{"type":"error","error":{"message":"Overloaded"}}' }),
        ).toEqual({ error: 'Overloaded' });
    });
});

describe('anthropicMessagesClient', () => {
    it('sends anthropic headers and parses completion', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            jsonResponse({
                content: [{ type: 'text', text: 'hey' }],
                usage: { input_tokens: 1, output_tokens: 1 },
            }),
        );
        const client = new AnthropicMessagesClient({
            apiKey: 'sk',
            baseUrl: 'https://proxy.example/v1',
            fetch: fetchMock as any,
        });
        const result = await client.complete({ model: 'claude', messages: [{ role: 'user', content: 'hi' }] });

        expect(result.text).toBe('hey');
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://proxy.example/v1/messages');
        expect(init.method).toBe('POST');
        expect(init.headers['x-api-key']).toBe('sk');
        expect(init.headers['anthropic-version']).toBe('2023-06-01');
        expect(JSON.parse(init.body).max_tokens).toBe(4096);
    });

    it('streams text deltas until message_stop', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(
                sseResponse([
                    sseEvent(
                        'content_block_delta',
                        '{"type":"content_block_delta","delta":{"type":"text_delta","text":"Hel"}}',
                    ),
                    sseEvent(
                        'content_block_delta',
                        '{"type":"content_block_delta","delta":{"type":"text_delta","text":"lo"}}',
                    ),
                    sseEvent('message_stop', '{"type":"message_stop"}'),
                ]),
            );
        const client = new AnthropicMessagesClient({ fetch: fetchMock as any });
        await expect(collectStream(client.stream({ model: 'claude', messages: [] }))).resolves.toEqual(['Hel', 'lo']);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).stream).toBe(true);
    });

    it('throws on error events', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(sseResponse([sseEvent('error', '{"type":"error","error":{"message":"Overloaded"}}')]));
        const client = new AnthropicMessagesClient({ fetch: fetchMock as any });
        await expect(collectStream(client.stream({ model: 'claude', messages: [] }))).rejects.toThrow('Overloaded');
    });

    it('throws API error message on http failure', async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: { message: 'bad key' } }, 401));
        const client = new AnthropicMessagesClient({ fetch: fetchMock as any });
        await expect(client.complete({ model: 'claude', messages: [] })).rejects.toThrow('bad key');
    });

    it('allows per-request header overrides', async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ content: [] }));
        const client = new AnthropicMessagesClient({
            apiKey: 'sk',
            headers: { 'x-custom': 'config' },
            fetch: fetchMock as any,
        });
        await client.complete({ model: 'claude', messages: [], headers: { 'x-custom': 'request' } });
        expect(fetchMock.mock.calls[0][1].headers['x-custom']).toBe('request');
    });

    it('inlines remote images as base64 sources before sending', async () => {
        const fetchMock = vi.fn((url: any, _init: any) => {
            if (String(url).endsWith('.png')) {
                return Promise.resolve(imageResponse(PNG_BYTES));
            }
            return Promise.resolve(jsonResponse({ content: [{ type: 'text', text: 'ok' }] }));
        });
        const client = new AnthropicMessagesClient({ fetch: fetchMock as any });
        await client.complete({
            model: 'claude',
            messages: [{ role: 'user', content: [{ type: 'image', image: 'https://example.com/cat.png' }] }],
        });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const body = JSON.parse(fetchMock.mock.calls[1][1].body);
        expect(body.messages[0].content).toEqual([
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: PNG_BASE64 } },
        ]);
    });
});
