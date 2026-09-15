import type { Server } from 'node:http';
import http from 'node:http';

/** 平台无关的请求处理器:与 web fetch 语义一致 */
export type FetchHandler = (request: Request) => Promise<Response>;

export interface LocalServer {
    url: string;
    port: number;
    close: () => Promise<void>;
}

/**
 * 把 `fetch(Request) => Response` 的 mock 核心挂到一个本地 http 服务器上。
 * 核心本身不依赖 node,workerd 里可直接调用 `fetch`,node 里用这个适配器暴露为真实端口。
 */
export function startLocalServer(handler: FetchHandler, hostname = '127.0.0.1'): Promise<LocalServer> {
    const server: Server = http.createServer((req, res) => {
        void (async () => {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
                chunks.push(chunk as Buffer);
            }
            const body = chunks.length ? Buffer.concat(chunks) : undefined;
            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        headers.append(key, item);
                    }
                } else if (value !== undefined) {
                    headers.set(key, value);
                }
            }
            const request = new Request(`http://${hostname}:${(server.address() as { port: number }).port}${req.url}`, {
                method: req.method,
                headers,
                body: body && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
            });
            try {
                const response = await handler(request);
                const buffer = Buffer.from(await response.arrayBuffer());
                const responseHeaders: Record<string, string> = {};
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                res.writeHead(response.status, responseHeaders);
                res.end(buffer);
            } catch (e) {
                res.writeHead(500, { 'content-type': 'text/plain' });
                res.end(String(e));
            }
        })();
    });

    return new Promise(resolve => {
        server.listen(0, hostname, () => {
            const address = server.address() as { port: number };
            resolve({
                url: `http://${hostname}:${address.port}`,
                port: address.port,
                close: () => new Promise<void>(done => server.close(() => done())),
            });
        });
    });
}

/** 一个可启动/停止的 mock 服务(带自己的 base URL) */
export interface StartedMock<T> {
    url: string;
    port: number;
    mock: T;
    close: () => Promise<void>;
}

/** 用给定 mock 的 fetch 实现启动本地服务器 */
export async function startMockServer<T extends { fetch: FetchHandler }>(mock: T): Promise<StartedMock<T>> {
    const server = await startLocalServer(request => mock.fetch(request));
    return { url: server.url, port: server.port, mock, close: server.close };
}
