import type { ImageInput, Message, Part } from './types';

export const DEFAULT_IMAGE_MIME_TYPE = 'image/jpeg';

export function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

export function toDataURI(base64: string, mimeType: string): string {
    return `data:${mimeType};base64,${base64}`;
}

function normalizeBytes(image: Uint8Array): Uint8Array {
    return image instanceof Uint8Array ? image : new Uint8Array(image as unknown as ArrayBuffer);
}

/**
 * data URI 形如 `data:image/png;base64,xxxx`,拆出 mimeType 与 base64
 */
export function parseDataURI(url: string): { mimeType: string; base64: string } | null {
    const match = /^data:([^;,]+);base64,(.+)$/s.exec(url);
    if (!match) {
        return null;
    }
    return { mimeType: match[1], base64: match[2] };
}

export interface ResolvedImage {
    url?: string;
    base64?: string;
    mimeType?: string;
}

/**
 * 把中立 ImageInput 归一化成 {url} 或 {base64, mimeType},不做任何网络请求:
 * - string: data URI 拆解出 base64;http(s)/blob URL 原样保留;其余视为裸 base64
 * - URL: 同 string
 * - Uint8Array: 转 base64
 */
export function resolveImage(image: ImageInput, defaultMimeType: string = DEFAULT_IMAGE_MIME_TYPE): ResolvedImage {
    if (typeof image === 'string' || image instanceof URL) {
        const url = image.toString();
        const dataURI = parseDataURI(url);
        if (dataURI) {
            return { base64: dataURI.base64, mimeType: dataURI.mimeType };
        }
        if (/^(https?|blob):/i.test(url)) {
            return { url };
        }
        // 非 URL 字符串按裸 base64 处理(兼容旧行为)
        return { base64: url, mimeType: defaultMimeType };
    }
    return { base64: bytesToBase64(normalizeBytes(image)), mimeType: defaultMimeType };
}

/** 从 base64 首字符嗅探图片格式 */
function imageFormatFromBase64(base64: string): string {
    switch (base64.charAt(0)) {
        case '/':
            return 'image/jpeg';
        case 'i':
            return 'image/png';
        case 'U':
            return 'image/webp';
        case 'R':
            return 'image/gif';
        default:
            throw new Error('Unsupported image format');
    }
}

/**
 * 远程图片结果缓存:同一 URL 的历史消息每轮对话都会重发,
 * 缓存避免隔离体内重复抓取(条目数与时效对齐 utils 的 Cache)。
 */
const IMAGE_FETCH_CACHE = new Map<string, { time: number; value: Promise<string> }>();
const IMAGE_FETCH_CACHE_MAX_ITEMS = 10;
const IMAGE_FETCH_CACHE_MAX_AGE = 1000 * 60 * 60;

function cachedDataURI(url: string, doFetch: typeof fetch): Promise<string> {
    const hit = IMAGE_FETCH_CACHE.get(url);
    if (hit && Date.now() - hit.time < IMAGE_FETCH_CACHE_MAX_AGE) {
        return hit.value;
    }
    if (IMAGE_FETCH_CACHE.size >= IMAGE_FETCH_CACHE_MAX_ITEMS) {
        const oldest = IMAGE_FETCH_CACHE.keys().next().value;
        if (oldest !== undefined) {
            IMAGE_FETCH_CACHE.delete(oldest);
        }
    }
    const value = fetchImageAsBase64(url, doFetch)
        .then(({ base64, mimeType }) => toDataURI(base64, mimeType))
        // 失败时移除缓存条目,避免一次网络抖动把该 URL 毒化整整一小时
        .catch(e => {
            IMAGE_FETCH_CACHE.delete(url);
            throw e;
        });
    IMAGE_FETCH_CACHE.set(url, { time: Date.now(), value });
    return value;
}

/** 抓取远程图片并转成 { base64, mimeType } */
export async function fetchImageAsBase64(
    url: string,
    doFetch: typeof fetch = fetch,
): Promise<{ base64: string; mimeType: string }> {
    const response = await doFetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image ${url}: ${response.status} ${response.statusText}`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    const base64 = bytesToBase64(bytes);
    return { base64, mimeType: imageFormatFromBase64(base64) };
}

/** 发送消息前的图片适配方式(由 imageAdaptMode 按协议能力换算) */
export type ImageAdaptMode = 'none' | 'url' | 'base64';

/**
 * 按适配方式处理消息里的图片,各协议客户端在构建请求体前调用:
 * - none:   剥离图片(workers 文本生成)
 * - url:    原样保留(URL / data URI / bytes)
 * - base64: 远程 URL 抓取后内联为 data URI(anthropic、telegramImageTransferMode=base64)
 */
export async function adaptMessageImages(
    messages: Message[],
    mode: ImageAdaptMode,
    doFetch: typeof fetch = fetch,
): Promise<Message[]> {
    if (mode === 'url') {
        return messages;
    }
    const rendered: Message[] = [];
    for (const message of messages) {
        if (typeof message.content === 'string') {
            rendered.push(message);
            continue;
        }
        const parts: Part[] = [];
        for (const part of message.content) {
            if (part.type !== 'image') {
                parts.push(part);
                continue;
            }
            if (mode === 'none') {
                continue;
            }
            const url =
                part.image instanceof URL ? part.image.href : typeof part.image === 'string' ? part.image : null;
            if (url === null || url.startsWith('data:')) {
                parts.push(part);
                continue;
            }
            parts.push({ ...part, image: await cachedDataURI(url, doFetch) });
        }
        rendered.push({ role: message.role, content: parts });
    }
    return rendered;
}
