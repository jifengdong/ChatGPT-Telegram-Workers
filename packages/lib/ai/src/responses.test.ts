import type { CompletionOptions } from './types';
import { buildResponsesBody, parseResponsesResponse, parseResponsesSSE, ResponsesClient } from './responses';
import { collectStream, jsonResponse, sseEvent, sseResponse } from './testing';

const options: CompletionOptions = {
    model: 'gpt-4o',
    system: 'be nice',
    messages: [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
        {
            role: 'user',
            content: [
                { type: 'text', text: 'look' },
                { type: 'image', image: 'https://example.com/cat.png' },
            ],
        },
    ],
};

describe('buildResponsesBody', () => {
    it('renders instructions and typed input parts', () => {
        expect(buildResponsesBody(options, false)).toEqual({
            model: 'gpt-4o',
            instructions: 'be nice',
            input: [
                { role: 'user', content: [{ type: 'input_text', text: 'hi' }] },
                { role: 'assistant', content: [{ type: 'output_text', text: 'hello' }] },
                {
                    role: 'user',
                    content: [
                        { type: 'input_text', text: 'look' },
                        { type: 'input_image', image_url: 'https://example.com/cat.png' },
                    ],
                },
            ],
        });
    });

    it('maps maxTokens to max_output_tokens and streams', () => {
        const body = buildResponsesBody({ ...options, maxTokens: 256 }, true);
        expect(body.max_output_tokens).toBe(256);
        expect(body.stream).toBe(true);
    });

    it('converts byte images into data URIs', () => {
        const body = buildResponsesBody(
            {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [{ type: 'image', image: new Uint8Array([1, 2, 3]), mimeType: 'image/png' }],
                    },
                ],
            },
            false,
        );
        expect(body.input[0].content).toEqual([{ type: 'input_image', image_url: 'data:image/png;base64,AQID' }]);
    });
});

describe('parseResponsesResponse', () => {
    it('collects output_text parts with usage', () => {
        expect(
            parseResponsesResponse({
                output: [
                    { type: 'reasoning', content: [] },
                    {
                        type: 'message',
                        content: [
                            { type: 'output_text', text: 'hello ' },
                            { type: 'output_text', text: 'world' },
                        ],
                    },
                ],
                usage: { input_tokens: 3, output_tokens: 2, total_tokens: 5 },
            }),
        ).toEqual({
            text: 'hello world',
            usage: { inputTokens: 3, outputTokens: 2, totalTokens: 5 },
            stopReason: null,
        });
    });

    it('exposes incomplete reason as stopReason', () => {
        expect(
            parseResponsesResponse({
                output: [],
                incomplete_details: { reason: 'max_output_tokens' },
            }).stopReason,
        ).toBe('max_output_tokens');
    });
});

describe('parseResponsesSSE', () => {
    it('extracts output text deltas', () => {
        expect(
            parseResponsesSSE({
                event: 'response.output_text.delta',
                data: '{"type":"response.output_text.delta","delta":"Hi"}',
            }),
        ).toEqual({ delta: 'Hi' });
    });

    it('finishes on completed and incomplete', () => {
        expect(parseResponsesSSE({ event: 'response.completed', data: '{"type":"response.completed"}' })).toEqual({
            finish: true,
        });
        expect(parseResponsesSSE({ event: 'response.incomplete', data: '{"type":"response.incomplete"}' })).toEqual({
            finish: true,
        });
    });

    it('reports failures', () => {
        expect(
            parseResponsesSSE({
                event: 'response.failed',
                data: '{"type":"response.failed","response":{"error":{"message":"boom"}}}',
            }),
        ).toEqual({ error: 'boom' });
        expect(parseResponsesSSE({ event: 'error', data: '{"type":"error","message":"expired"}' })).toEqual({
            error: 'expired',
        });
    });
});

describe('responsesClient', () => {
    it('posts to /responses with bearer auth', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            jsonResponse({
                output: [{ type: 'message', content: [{ type: 'output_text', text: 'hey' }] }],
            }),
        );
        const client = new ResponsesClient({
            apiKey: 'sk',
            baseUrl: 'https://proxy.example/v1',
            fetch: fetchMock as any,
        });
        const result = await client.complete({ model: 'gpt-4o', messages: [{ role: 'user', content: 'hi' }] });

        expect(result.text).toBe('hey');
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://proxy.example/v1/responses');
        expect(init.headers.authorization).toBe('Bearer sk');
    });

    it('streams deltas until response.completed', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(
                sseResponse([
                    sseEvent('response.output_text.delta', '{"type":"response.output_text.delta","delta":"Hel"}'),
                    sseEvent('response.output_text.delta', '{"type":"response.output_text.delta","delta":"lo"}'),
                    sseEvent(
                        'response.completed',
                        '{"type":"response.completed","response":{"usage":{"input_tokens":1,"output_tokens":1}}}',
                    ),
                ]),
            );
        const client = new ResponsesClient({ fetch: fetchMock as any });
        await expect(collectStream(client.stream({ model: 'gpt-4o', messages: [] }))).resolves.toEqual(['Hel', 'lo']);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body).stream).toBe(true);
    });

    it('throws on response.failed', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(
                sseResponse([
                    sseEvent('response.failed', '{"type":"response.failed","response":{"error":{"message":"boom"}}}'),
                ]),
            );
        const client = new ResponsesClient({ fetch: fetchMock as any });
        await expect(collectStream(client.stream({ model: 'gpt-4o', messages: [] }))).rejects.toThrow('boom');
    });
});
