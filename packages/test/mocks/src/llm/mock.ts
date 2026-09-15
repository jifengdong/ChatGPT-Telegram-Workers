import type { RecordedCall } from '../shared/types';

export interface LLMMockOptions {
    /** 固定回复文本;也可用 replyFor 动态决定 */
    reply?: string;
    /** 模型列表(`/models`) */
    models?: string[];
    /** 图片生成返回的 URL */
    imageUrl?: string;
}

/** 单个分块的流式配置 */
export interface StreamPlan {
    /** 文本分块,依次以 delta 形式发出 */
    chunks?: string[];
    /** 每块之间的延迟(毫秒),用于测试节流 */
    delayMs?: number;
    /** 是否在末尾发送 `[DONE]`(默认 true);设为 false 以测试连接关闭路径 */
    done?: boolean;
}

/**
 * 状态无关的 OpenAI 兼容 API mock:
 * - `POST /v1/chat/completions`:按 `stream` 返回 JSON 或 SSE;
 * - `GET /v1/models`:返回模型列表;
 * - `POST /v1/images/generations`:返回图片 URL。
 *
 * 记录所有入站请求,便于断言 bot 构造的请求体(模型、system、messages、参数)。
 */
export class LLMMock {
    private readonly recorded: RecordedCall[] = [];
    private replyText: string;
    private modelList: string[];
    private imageUrlValue: string;
    private streamPlan: StreamPlan = {};
    private failStatus: { status: number; body: unknown; remaining: number } | null = null;

    constructor(options: LLMMockOptions = {}) {
        this.replyText = options.reply ?? 'Hello from the mock LLM!';
        this.modelList = options.models ?? ['mock-model', 'mock-model-2'];
        this.imageUrlValue = options.imageUrl ?? 'https://example.com/mock-image.png';
    }

    setReply(text: string): void {
        this.replyText = text;
    }

    setModels(models: string[]): void {
        this.modelList = models;
    }

    /** 配置下一次流式响应;`chunks` 缺省时按 reply 文本切分 */
    setStream(plan: StreamPlan): void {
        this.streamPlan = plan;
    }

    /** 下一次请求返回指定错误(非 2xx),模拟 429 / 500 / 200+error */
    failNext(status: number, body: unknown): void {
        this.failStatus = { status, body, remaining: 1 };
    }

    get calls(): RecordedCall[] {
        return [...this.recorded];
    }

    callsFor(pathFragment: string): RecordedCall[] {
        return this.recorded.filter(call => call.path.includes(pathFragment));
    }

    lastChatRequest(): any {
        return this.callsFor('/chat/completions').at(-1)?.body;
    }

    lastImageRequest(): any {
        return this.callsFor('/images/generations').at(-1)?.body;
    }

    reset(): void {
        this.recorded.length = 0;
        this.streamPlan = {};
        this.failStatus = null;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const body = await this.readBody(request);
        const call: RecordedCall = {
            method: url.pathname.split('/').filter(Boolean).pop() ?? '',
            path: url.pathname + url.search,
            body,
            token: '',
            status: 200,
        };
        this.recorded.push(call);

        if (this.failStatus && this.failStatus.remaining > 0) {
            const { status, body: payload } = this.failStatus;
            this.failStatus.remaining -= 1;
            call.status = status;
            return json(payload, status);
        }

        if (url.pathname.endsWith('/chat/completions')) {
            if (body?.stream) {
                return this.streamCompletion(body);
            }
            return json({
                id: 'chatcmpl-mock',
                object: 'chat.completion',
                model: body?.model ?? 'mock-model',
                choices: [
                    {
                        index: 0,
                        message: { role: 'assistant', content: this.replyText },
                        finish_reason: 'stop',
                    },
                ],
                usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
            });
        }

        if (url.pathname.endsWith('/models')) {
            return json({
                object: 'list',
                data: this.modelList.map(id => ({ id, object: 'model', created: 0, owned_by: 'mock' })),
            });
        }

        if (url.pathname.endsWith('/images/generations')) {
            return json({ created: 0, data: [{ url: this.imageUrlValue, revised_prompt: body?.prompt }] });
        }

        return json({ error: { message: `Unknown path ${url.pathname}` } }, 404);
    }

    private streamCompletion(body: any): Response {
        const plan = this.streamPlan;
        const chunks = plan.chunks ?? splitChunks(this.replyText);
        const delay = plan.delayMs ?? 0;
        const withDone = plan.done ?? true;
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
                const model = body?.model ?? 'mock-model';
                for (const chunk of chunks) {
                    const payload = {
                        id: 'chatcmpl-mock',
                        object: 'chat.completion.chunk',
                        model,
                        choices: [{ index: 0, delta: { content: chunk }, finish_reason: null }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
                    if (delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
                const stop = { choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(stop)}\n\n`));
                if (withDone) {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
                controller.close();
            },
        });
        return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
    }

    private async readBody(request: Request): Promise<any> {
        if (request.method !== 'POST') {
            return null;
        }
        try {
            return await request.json();
        } catch {
            return null;
        }
    }
}

function json(payload: unknown, status = 200): Response {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

/** 把文本切成小块,确保至少两块以便测试流式累加 */
function splitChunks(text: string): string[] {
    if (text.length <= 4) {
        return [text];
    }
    const mid = Math.floor(text.length / 2);
    return [text.slice(0, mid), text.slice(mid)];
}
