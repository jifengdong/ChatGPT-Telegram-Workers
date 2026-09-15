import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';

/** core 应用暴露的最小 fetch 接口(与 Workers 的 fetch 签名一致)。 */
export interface FetchApp {
    fetch(request: Request, env?: unknown): Promise<Response>;
}

function toRequest(req: IncomingMessage): Request {
    const host = req.headers.host ?? 'localhost';
    const url = new URL(req.url ?? '/', `http://${host}`);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
        if (value === undefined) {
            continue;
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                headers.append(key, item);
            }
        } else {
            headers.set(key, value);
        }
    }
    const method = req.method ?? 'GET';
    const hasBody = method !== 'GET' && method !== 'HEAD';
    return new Request(url, {
        method,
        headers,
        body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
        duplex: 'half',
    } as RequestInit);
}

async function writeResponse(res: ServerResponse, response: Response): Promise<void> {
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (!response.body) {
        res.end();
        return;
    }
    Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
}

/** Node http 请求处理函数,可直接交给 http.createServer 或 Vercel。 */
export function createNodeHandler(app: FetchApp): (req: IncomingMessage, res: ServerResponse) => void {
    return (req, res) => {
        app.fetch(toRequest(req))
            .then(response => writeResponse(res, response))
            .catch((e: unknown) => {
                res.statusCode = 500;
                res.end(`Internal Server Error: ${(e as Error).message}`);
            });
    };
}

export interface ServeOptions {
    port: number;
    hostname: string;
}

/** 启动 Node http 服务。 */
export function serve(
    app: FetchApp,
    options: ServeOptions,
    onListen?: (info: { address: string; port: number }) => void,
) {
    const server = createServer(createNodeHandler(app));
    server.listen(options.port, options.hostname, () => {
        onListen?.({ address: options.hostname, port: options.port });
    });
    return server;
}
