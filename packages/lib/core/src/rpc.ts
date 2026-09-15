/**
 * 最小 JSON-RPC:只有一个端点,请求体 `{ method, params }`,
 * 响应 `{ result }` 或 `{ error: { code, message } }`。
 * 不引入任何路由框架,method 即分发键。
 */

export interface RpcRequest {
    method?: string;
    params?: unknown;
}

export interface RpcContext {
    request: Request;
    env: unknown;
}

export type RpcHandler = (params: any, ctx: RpcContext) => unknown | Promise<unknown>;
export type RpcMethods = Record<string, RpcHandler>;

export class RpcError extends Error {
    readonly code: number;

    constructor(code: number, message: string) {
        super(message);
        this.name = 'RpcError';
        this.code = code;
    }
}

function jsonResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
}

export function createRpcHandler(methods: RpcMethods): (request: Request, env: unknown) => Promise<Response> {
    return async (request, env) => {
        let payload: RpcRequest;
        try {
            payload = (await request.json()) as RpcRequest;
        } catch {
            return jsonResponse({ error: { code: -32700, message: 'parse error' } });
        }
        const method = typeof payload?.method === 'string' ? payload.method : '';
        if (!Object.prototype.hasOwnProperty.call(methods, method)) {
            return jsonResponse({ error: { code: -32601, message: `method not found: ${method}` } });
        }
        const handler = methods[method];
        try {
            const result = await handler(payload.params, { request, env });
            return jsonResponse({ result: result === undefined ? null : result });
        } catch (e) {
            if (e instanceof RpcError) {
                return jsonResponse({ error: { code: e.code, message: e.message } });
            }
            // 非预期异常不向调用方回显内部信息,细节仅记日志
            console.error(e);
            return jsonResponse({ error: { code: -32603, message: 'internal error' } });
        }
    };
}
