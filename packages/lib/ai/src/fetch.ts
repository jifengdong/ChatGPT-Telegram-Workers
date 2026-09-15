export interface PostOptions {
    headers: Record<string, string>;
    body: unknown;
    signal?: AbortSignal;
    fetch?: typeof fetch;
}

export function joinUrl(base: string | undefined, path: string): string {
    const trimmed = (base || '').replace(/\/+$/, '');
    const queryIndex = trimmed.indexOf('?');
    if (queryIndex === -1) {
        return `${trimmed}${path}`;
    }
    return `${trimmed.slice(0, queryIndex)}${path}${trimmed.slice(queryIndex)}`;
}

export async function postJSON(url: string, options: PostOptions): Promise<Response> {
    const doFetch = options.fetch || fetch;
    const response = await doFetch(url, {
        method: 'POST',
        headers: options.headers,
        body: JSON.stringify(options.body),
        signal: options.signal,
    });
    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }
    return response;
}

/**
 * 上游错误响应体:Cloudflare 原生形如 `{ success:false, errors:[{ message }] }`,
 * 其余协议可能是 `{ error: { message } }` 或扁平的 `{ message }`。
 */
export interface ErrorPayload {
    error?: { message?: string };
    errors?: { message?: string }[];
    message?: string;
}

export async function extractErrorMessage(response: Response): Promise<string> {
    const fallback = `${response.status} ${response.statusText}`;
    try {
        const data = (await response.json()) as ErrorPayload;
        return data?.error?.message || data?.errors?.[0]?.message || data?.message || fallback;
    } catch {
        return fallback;
    }
}

export function parseJSONSync(text: string): any | null {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}
