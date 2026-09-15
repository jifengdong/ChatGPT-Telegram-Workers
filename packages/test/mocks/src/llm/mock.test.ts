import { describe, expect, it } from 'vitest';
import { LLMMock } from './mock';

const base = 'https://llm.test/v1';

function post(mock: LLMMock, path: string, body: unknown): Promise<Response> {
    return mock.fetch(new Request(`${base}${path}`, { method: 'POST', body: JSON.stringify(body) }));
}

describe('LLMMock chat completions', () => {
    it('returns a non-streaming completion and records the request', async () => {
        const mock = new LLMMock({ reply: 'pong' });
        const response = await post(mock, '/chat/completions', {
            model: 'm',
            messages: [{ role: 'user', content: 'ping' }],
        });
        const data = await response.json();
        expect(data.choices[0].message.content).toBe('pong');
        expect(mock.lastChatRequest().model).toBe('m');
        expect(mock.lastChatRequest().messages[0].content).toBe('ping');
    });

    it('streams chunks then [DONE] when stream is set', async () => {
        const mock = new LLMMock({ reply: 'streamed answer' });
        mock.setStream({ delayMs: 0 });
        const response = await post(mock, '/chat/completions', { model: 'm', stream: true });
        const text = await response.text();
        expect(text).toContain('chat.completion.chunk');
        expect(text.trimEnd().endsWith('data: [DONE]')).toBe(true);
        // 分块应拼接回完整回复
        const deltas = [...text.matchAll(/data: (\{.*?\})\n/g)]
            .map(m => JSON.parse(m[1]))
            .filter(p => p.choices?.[0]?.delta?.content)
            .map(p => p.choices[0].delta.content)
            .join('');
        expect(deltas).toBe('streamed answer');
    });

    it('omits [DONE] when configured, to test the close path', async () => {
        const mock = new LLMMock({ reply: 'no sentinel' });
        mock.setStream({ done: false });
        const response = await post(mock, '/chat/completions', { model: 'm', stream: true });
        expect(await response.text()).not.toContain('[DONE]');
    });
});

describe('LLMMock models & images', () => {
    it('lists models', async () => {
        const mock = new LLMMock({ models: ['a', 'b'] });
        const response = await mock.fetch(new Request(`${base}/models`));
        const data = await response.json();
        expect(data.data.map((m: any) => m.id)).toEqual(['a', 'b']);
    });

    it('returns an image url and records the prompt', async () => {
        const mock = new LLMMock({ imageUrl: 'https://img.test/x.png' });
        const response = await post(mock, '/images/generations', { prompt: 'a cat', model: 'dall-e-3' });
        const data = await response.json();
        expect(data.data[0].url).toBe('https://img.test/x.png');
        expect(mock.lastImageRequest().prompt).toBe('a cat');
    });
});

describe('LLMMock failure injection', () => {
    it('returns a configured error once', async () => {
        const mock = new LLMMock();
        mock.failNext(429, { error: { message: 'rate limited' } });
        const failed = await post(mock, '/chat/completions', { model: 'm', messages: [] });
        expect(failed.status).toBe(429);
        expect((await failed.json()).error.message).toBe('rate limited');
        const ok = await post(mock, '/chat/completions', { model: 'm', messages: [] });
        expect(ok.status).toBe(200);
    });
});
