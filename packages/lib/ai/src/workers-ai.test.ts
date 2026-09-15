import type { CompletionOptions, WorkersAIBinding } from './types';
import { collectStream, chunksToStream, jsonResponse, sseEvent } from './testing';
import {
    generateWorkersImage,
    parseWorkersSSE,
    WorkersAIClient,
    workersChatBaseUrl,
    workersImageRunUrl,
} from './workers-ai';

const options: CompletionOptions = {
    model: '@cf/qwen/qwen1.5-7b-chat-awq',
    system: 'be nice',
    messages: [{ role: 'user', content: 'hi' }],
    maxTokens: 256,
};

function bindingWith(impl: (model: string, body: any) => Promise<any>): WorkersAIBinding {
    return { run: impl as any };
}

describe('workers urls', () => {
    it('builds chat and image endpoints from the account id', () => {
        expect(workersChatBaseUrl('acct')).toBe('https://api.cloudflare.com/client/v4/accounts/acct/ai/v1');
        expect(workersImageRunUrl('acct', '@cf/flux')).toBe(
            'https://api.cloudflare.com/client/v4/accounts/acct/ai/run/@cf/flux',
        );
    });
});

describe('parseWorkersSSE', () => {
    it('reads the response delta', () => {
        expect(parseWorkersSSE({ event: null, data: '{"response":"he"}' })).toEqual({ delta: 'he' });
    });

    it('finishes on [DONE]', () => {
        expect(parseWorkersSSE({ event: null, data: '[DONE]' })).toEqual({ finish: true });
    });

    it('ignores non-text payloads', () => {
        expect(parseWorkersSSE({ event: null, data: '{"usage":1}' })).toEqual({});
    });
});

describe('WorkersAIClient with a binding', () => {
    it('calls the binding with model, messages and stream flag', async () => {
        const calls: any[] = [];
        const client = new WorkersAIClient({
            binding: bindingWith(async (model, body) => {
                calls.push({ model, body });
                return { response: 'hello' };
            }),
        });
        const result = await client.complete(options);
        expect(result.text).toBe('hello');
        expect(calls[0].model).toBe('@cf/qwen/qwen1.5-7b-chat-awq');
        expect(calls[0].body.stream).toBe(false);
        expect(calls[0].body.messages).toEqual([
            { role: 'system', content: 'be nice' },
            { role: 'user', content: 'hi' },
        ]);
        expect(calls[0].body.model).toBeUndefined();
    });

    it('strips image parts from messages before calling the binding', async () => {
        const calls: any[] = [];
        const client = new WorkersAIClient({
            binding: bindingWith(async (_model, body) => {
                calls.push(body);
                return { response: 'hello' };
            }),
        });
        await client.complete({
            model: '@cf/qwen/qwen1.5-7b-chat-awq',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'look' },
                        { type: 'image', image: 'https://example.com/cat.png' },
                        { type: 'image', image: new Uint8Array([1, 2, 3]) },
                    ],
                },
            ],
        });
        expect(calls[0].messages).toEqual([{ role: 'user', content: [{ type: 'text', text: 'look' }] }]);
    });

    it('streams binding SSE deltas', async () => {
        const client = new WorkersAIClient({
            binding: bindingWith(async () =>
                chunksToStream([sseEvent(null, '{"response":"he"}'), sseEvent(null, '{"response":"llo"}')]),
            ),
        });
        expect(await collectStream(client.stream(options))).toEqual(['he', 'llo']);
    });

    it('stops at [DONE]', async () => {
        const client = new WorkersAIClient({
            binding: bindingWith(async () =>
                chunksToStream([
                    sseEvent(null, '{"response":"ok"}'),
                    sseEvent(null, '[DONE]'),
                    sseEvent(null, '{"response":"nope"}'),
                ]),
            ),
        });
        expect(await collectStream(client.stream(options))).toEqual(['ok']);
    });
});

describe('WorkersAIClient REST fallback', () => {
    it('posts to the OpenAI-compatible endpoint without a binding', async () => {
        let url = '';
        const client = new WorkersAIClient({
            accountId: 'acct',
            apiKey: 'tok',
            fetch: (async (input: any) => {
                url = String(input);
                return jsonResponse({ choices: [{ message: { content: 'rest' }, finish_reason: 'stop' }] });
            }) as typeof fetch,
        });
        const result = await client.complete(options);
        expect(result.text).toBe('rest');
        expect(url).toBe('https://api.cloudflare.com/client/v4/accounts/acct/ai/v1/chat/completions');
    });

    it('throws without binding or account id', async () => {
        const client = new WorkersAIClient({});
        await expect(client.complete(options)).rejects.toThrow(/account ID/i);
    });
});

describe('generateWorkersImage', () => {
    it('uses the binding and decodes a base64 image', async () => {
        const blob = await generateWorkersImage({
            model: '@cf/flux',
            prompt: 'a cat',
            binding: bindingWith(async () => ({ image: 'QUJD' })),
        });
        expect(blob.type).toBe('image/png');
        expect(await blob.text()).toBe('ABC');
    });

    it('passes a binary binding stream through', async () => {
        const blob = await generateWorkersImage({
            model: '@cf/flux',
            prompt: 'a cat',
            binding: bindingWith(async () => chunksToStream(['abc'])),
        });
        expect(blob.type).toBe('image/jpeg');
        expect(await blob.text()).toBe('abc');
    });

    it('merges extraParams into the binding body without overriding the prompt', async () => {
        const bodies: any[] = [];
        await generateWorkersImage({
            model: '@cf/flux',
            prompt: 'a cat',
            extraParams: { prompt: 'hijacked', num_steps: 6, negative_prompt: 'blurry' },
            binding: bindingWith(async (_model, body) => {
                bodies.push(body);
                return { image: 'QUJD' };
            }),
        });
        expect(bodies[0]).toEqual({ prompt: 'a cat', num_steps: 6, negative_prompt: 'blurry' });
    });

    it('falls back to the REST run endpoint', async () => {
        let url = '';
        let body: any = null;
        const blob = await generateWorkersImage({
            model: '@cf/flux',
            prompt: 'a cat',
            extraParams: { guidance: 7.5 },
            accountId: 'acct',
            apiKey: 'tok',
            fetch: (async (input: any, init: any) => {
                url = String(input);
                body = JSON.parse(init.body);
                return new Response('imagebytes', { headers: { 'content-type': 'image/png' } });
            }) as typeof fetch,
        });
        expect(url).toBe('https://api.cloudflare.com/client/v4/accounts/acct/ai/run/@cf/flux');
        expect(body).toEqual({ prompt: 'a cat', guidance: 7.5 });
        expect(await blob.text()).toBe('imagebytes');
    });

    it('throws without binding or account id', async () => {
        await expect(generateWorkersImage({ model: 'm', prompt: 'p' })).rejects.toThrow(/account ID/i);
    });

    /** flux-2 系列只接受 multipart;JSON 会被 Cloudflare 以 5006 拒绝 */
    const MULTIPART_ERROR = new Error("5006: Error: required properties at '/' are 'multipart'");
    const FLUX2 = '@cf/black-forest-labs/flux-2-klein-4b';

    it('sends multipart directly for known multipart models', async () => {
        const bodies: any[] = [];
        const blob = await generateWorkersImage({
            model: FLUX2,
            prompt: 'a fat dog',
            extraParams: { width: 1024, height: 1024 },
            binding: bindingWith(async (_model, body) => {
                bodies.push(body);
                return { image: 'QUJD' };
            }),
        });
        expect(bodies).toHaveLength(1);
        // 已知模型直接走信封,不再先发一次必然失败的扁平请求
        expect(bodies[0].multipart).toBeDefined();
        expect(bodies[0].multipart.contentType).toContain('multipart/form-data');
        const form = await new Response(bodies[0].multipart.body, {
            headers: { 'content-type': bodies[0].multipart.contentType },
        }).formData();
        expect(form.get('prompt')).toBe('a fat dog');
        expect(form.get('width')).toBe('1024');
        expect(await blob.text()).toBe('ABC');
    });

    it('retries with multipart when the binding rejects a flat body', async () => {
        const bodies: any[] = [];
        const model = '@cf/some/future-multipart-model';
        const blob = await generateWorkersImage({
            model,
            prompt: 'a fat dog',
            binding: bindingWith(async (_model, body) => {
                bodies.push(body);
                if (!body.multipart) {
                    throw MULTIPART_ERROR;
                }
                return { image: 'QUJD' };
            }),
        });
        expect(bodies).toHaveLength(2);
        expect(bodies[0]).toEqual({ prompt: 'a fat dog' });
        expect(bodies[1].multipart).toBeDefined();
        expect(await blob.text()).toBe('ABC');

        // 记入缓存后,同一模型不再重复那次失败的尝试
        const again: any[] = [];
        await generateWorkersImage({
            model,
            prompt: 'another',
            binding: bindingWith(async (_model, body) => {
                again.push(body);
                return { image: 'QUJD' };
            }),
        });
        expect(again).toHaveLength(1);
        expect(again[0].multipart).toBeDefined();
    });

    it('does not retry on unrelated binding errors', async () => {
        const bodies: any[] = [];
        await expect(
            generateWorkersImage({
                model: FLUX2,
                prompt: 'x',
                binding: bindingWith(async (_model, body) => {
                    bodies.push(body);
                    throw new Error('3043: Internal server error');
                }),
            }),
        ).rejects.toThrow('3043');
        expect(bodies).toHaveLength(1);
    });

    it('sends multipart form-data over REST for multipart models', async () => {
        let contentType: string | undefined;
        let sent: FormData | null = null;
        const blob = await generateWorkersImage({
            model: FLUX2,
            prompt: 'a fat dog',
            extraParams: { width: 1024 },
            accountId: 'acct',
            apiKey: 'tok',
            fetch: (async (_input: any, init: any) => {
                sent = init.body as FormData;
                contentType = init.headers['Content-Type'];
                return new Response(JSON.stringify({ result: { image: 'QUJD' } }), {
                    headers: { 'content-type': 'application/json' },
                });
            }) as typeof fetch,
        });
        expect(sent).toBeInstanceOf(FormData);
        expect((sent as unknown as FormData).get('prompt')).toBe('a fat dog');
        // 不能显式设 Content-Type,否则会丢掉 FormData 的 boundary
        expect(contentType).toBeUndefined();
        expect(await blob.text()).toBe('ABC');
    });

    it('surfaces the Cloudflare error message for a failed REST call', async () => {
        await expect(
            generateWorkersImage({
                model: '@cf/bytedance/stable-diffusion-xl-lightning',
                prompt: 'x',
                accountId: 'acct',
                apiKey: 'tok',
                fetch: (async () =>
                    new Response(
                        JSON.stringify({ success: false, errors: [{ code: 7000, message: 'Invalid request body' }] }),
                        { status: 400, headers: { 'content-type': 'application/json' } },
                    )) as typeof fetch,
            }),
        ).rejects.toThrow('7000: Invalid request body');
    });
});
