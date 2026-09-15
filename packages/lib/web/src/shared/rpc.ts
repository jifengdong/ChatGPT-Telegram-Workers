/**
 * 最小 JSON-RPC 客户端:所有数据接口都 POST /rpc,请求体 `{ method, params }`,
 * 响应 `{ result }` 或 `{ error: { code, message } }`。
 */

export const RPC_PATH = '/rpc';

interface RpcEnvelope<T> {
    result?: T;
    error?: { code: number; message: string };
}

export async function rpcCall<T>(method: string, params?: unknown, headers?: Record<string, string>): Promise<T> {
    const res = await fetch(RPC_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ method, params }),
    });
    const data = (await res.json().catch(() => ({}))) as RpcEnvelope<T>;
    if (data.error) {
        throw new Error(data.error.message || `RPC ${method} failed`);
    }
    return data.result as T;
}
