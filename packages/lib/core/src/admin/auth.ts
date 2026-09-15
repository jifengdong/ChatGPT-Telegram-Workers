import { ENV } from '@chatgpt-telegram-workers/config';

const encoder = new TextEncoder();
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h
const MAX_AUTH_AGE_SECONDS = 60 * 60 * 24; // initData 24h 内有效

function base64UrlEncode(bytes: Uint8Array): string {
    let binary = '';
    for (const b of bytes) {
        binary += String.fromCharCode(b);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** initData 的 hash 为小写 hex 编码(见 Telegram 官方算法与 tma.js arrayBufferToHex) */
function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (const b of bytes) {
        hex += b.toString(16).padStart(2, '0');
    }
    return hex;
}

function base64UrlDecode(input: string): Uint8Array {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key as Uint8Array<ArrayBuffer>,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data as Uint8Array<ArrayBuffer>);
    return new Uint8Array(signature);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
        return false;
    }
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a[i] ^ b[i];
    }
    return diff === 0;
}

export interface TelegramUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
}

/**
 * 校验 Telegram Mini App initData。
 * 算法:hash = HMAC_SHA256(key=HMAC_SHA256("WebAppData", botToken), dataCheckString)
 * 参考 https://docs.telegram-mini-apps.com/platform/init-data
 */
export async function validateInitData(
    initData: string,
    botToken: string,
): Promise<{ ok: boolean; user?: TelegramUser; reason?: string }> {
    if (!initData || !botToken) {
        return { ok: false, reason: 'missing initData or token' };
    }
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
        return { ok: false, reason: 'missing hash' };
    }
    params.delete('hash');
    const dataCheckString = [...params.entries()]
        .map(([k, v]) => `${k}=${v}`)
        .sort()
        .join('\n');

    const secretKey = await hmac(encoder.encode('WebAppData'), encoder.encode(botToken));
    const computed = bytesToHex(await hmac(secretKey, encoder.encode(dataCheckString)));
    if (!timingSafeEqual(encoder.encode(computed), encoder.encode(hash.toLowerCase()))) {
        return { ok: false, reason: 'invalid hash' };
    }

    const authDate = Number(params.get('auth_date') || '0');
    if (!authDate || Math.floor(Date.now() / 1000) - authDate > MAX_AUTH_AGE_SECONDS) {
        return { ok: false, reason: 'expired' };
    }

    const userRaw = params.get('user');
    if (!userRaw) {
        return { ok: false, reason: 'missing user' };
    }
    try {
        const user = JSON.parse(userRaw) as TelegramUser;
        if (!user?.id) {
            return { ok: false, reason: 'invalid user' };
        }
        return { ok: true, user };
    } catch {
        return { ok: false, reason: 'invalid user json' };
    }
}

/**
 * 用 bot token 派生会话签名密钥。
 * TELEGRAM_TOKEN 缺失时不签发/校验会话:绝不能回退到可预测的常量密钥,
 * 否则攻击者可以离线伪造管理员会话。
 */
const SESSION_KEY_LABEL = 'ctw-admin-session';

export async function createSession(userId: string, ttlSeconds = SESSION_TTL_SECONDS): Promise<string> {
    if (!ENV.TELEGRAM_TOKEN) {
        throw new Error('Cannot create admin session: TELEGRAM_TOKEN is not set');
    }
    const payload = JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + ttlSeconds });
    const payloadB64 = base64UrlEncode(encoder.encode(payload));
    const key = await hmac(encoder.encode(SESSION_KEY_LABEL), encoder.encode(ENV.TELEGRAM_TOKEN));
    const sig = base64UrlEncode(await hmac(key, encoder.encode(payloadB64)));
    return `${payloadB64}.${sig}`;
}

export async function verifySession(token: string | null | undefined): Promise<string | null> {
    if (!token || !ENV.TELEGRAM_TOKEN) {
        return null;
    }
    const [payloadB64, sig] = token.split('.');
    if (!payloadB64 || !sig) {
        return null;
    }
    const key = await hmac(encoder.encode(SESSION_KEY_LABEL), encoder.encode(ENV.TELEGRAM_TOKEN));
    const expected = base64UrlEncode(await hmac(key, encoder.encode(payloadB64)));
    if (!timingSafeEqual(encoder.encode(expected), encoder.encode(sig))) {
        return null;
    }
    try {
        const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64))) as {
            sub: string;
            exp: number;
        };
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload.sub;
    } catch {
        return null;
    }
}

/** 密码登录(常量时间比较) */
export function checkPassword(password: string): boolean {
    const expected = ENV.ADMIN_PASSWORD;
    if (!expected) {
        return false;
    }
    const a = encoder.encode(password || '');
    const b = encoder.encode(expected);
    if (a.length !== b.length) {
        return false;
    }
    return timingSafeEqual(a, b);
}

/** 判断某个 Telegram 用户是否为管理员 */
export function isAdmin(userId: string | number): boolean {
    return !!ENV.ADMIN_ID && `${userId}` === ENV.ADMIN_ID;
}

export function extractBearer(header: string | null | undefined): string | null {
    if (!header) {
        return null;
    }
    const [scheme, token] = header.split(' ');
    if (!token || scheme.toLowerCase() !== 'bearer') {
        return null;
    }
    return token;
}
