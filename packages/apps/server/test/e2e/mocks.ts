import type { Server } from 'node:http';
import http from 'node:http';

export interface RecordedCall {
    /** Telegram: 方法名; LLM: 请求路径 */
    method: string;
    path: string;
    body: any;
}

export interface MockServer {
    url: string;
    port: number;
    calls: RecordedCall[];
    close: () => Promise<void>;
}

function startMock(handler: (call: RecordedCall, res: http.ServerResponse) => void): Promise<MockServer> {
    const calls: RecordedCall[] = [];
    const server: Server = http.createServer((req, res) => {
        let raw = '';
        req.on('data', chunk => {
            raw += chunk;
        });
        req.on('end', () => {
            const call: RecordedCall = {
                method: req.url!.split('/').pop() || '',
                path: req.url || '',
                body: raw ? safeParse(raw) : null,
            };
            calls.push(call);
            handler(call, res);
        });
    });
    return new Promise(resolve => {
        server.listen(0, '127.0.0.1', () => {
            const port = (server.address() as { port: number }).port;
            resolve({
                url: `http://127.0.0.1:${port}`,
                port,
                calls,
                close: () => new Promise<void>(done => server.close(() => done())),
            });
        });
    });
}

function safeParse(raw: string): any {
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

function json(res: http.ServerResponse, payload: unknown): void {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(payload));
}

/**
 * 假的 Telegram Bot API:记录所有出站调用,并返回可用作 message_id 的结果。
 * 基址通过配置项 settings.telegramApiDomain 指向这里,即可完全离线运行。
 */
export function startTelegramMock(): Promise<MockServer> {
    return startMock((call, res) => {
        json(res, {
            ok: true,
            result: {
                message_id: 1000 + Math.floor(Math.random() * 1000),
                chat: { id: 1, type: 'private' },
                date: 0,
                username: call.method === 'getMe' ? 'e2e_bot' : undefined,
            },
        });
    });
}

/**
 * 假的 OpenAI 兼容聊天端点:校验并回放固定回复。
 */
export function startLLMMock(reply: string): Promise<MockServer> {
    return startMock((_call, res) => {
        json(res, {
            choices: [{ message: { role: 'assistant', content: reply }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        });
    });
}
