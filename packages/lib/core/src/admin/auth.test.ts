import { ENV } from '@chatgpt-telegram-workers/config';
import { checkPassword, createSession, extractBearer, isAdmin, validateInitData, verifySession } from './auth';

const encoder = new TextEncoder();

async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key as Uint8Array<ArrayBuffer>,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, data as Uint8Array<ArrayBuffer>));
}

/** Telegram 传入的 hash 为小写 hex 编码 */
function bytesToHex(bytes: Uint8Array): string {
    let hex = '';
    for (const b of bytes) {
        hex += b.toString(16).padStart(2, '0');
    }
    return hex;
}

/** 按官方算法为测试构造合法 initData */
async function makeInitData(botToken: string, user: object, authDate = Math.floor(Date.now() / 1000)): Promise<string> {
    const params = new URLSearchParams();
    params.set('user', JSON.stringify(user));
    params.set('auth_date', `${authDate}`);
    const dataCheckString = [...params.entries()]
        .map(([k, v]) => `${k}=${v}`)
        .sort()
        .join('\n');
    const secret = await hmac(encoder.encode('WebAppData'), encoder.encode(botToken));
    params.set('hash', bytesToHex(await hmac(secret, encoder.encode(dataCheckString))));
    return params.toString();
}

const BOT_TOKEN = '123456:TEST-TOKEN';
const ADMIN = 42;

beforeEach(() => {
    ENV.TELEGRAM_TOKEN = BOT_TOKEN;
    ENV.ADMIN_ID = `${ADMIN}`;
    ENV.ADMIN_PASSWORD = 'secret-pw';
});

describe('validateInitData', () => {
    it('accepts correctly signed data', async () => {
        const initData = await makeInitData(BOT_TOKEN, { id: ADMIN, username: 'admin' });
        const result = await validateInitData(initData, BOT_TOKEN);
        expect(result.ok).toBe(true);
        expect(result.user?.id).toBe(ADMIN);
    });

    it('rejects a tampered hash', async () => {
        const initData = await makeInitData(BOT_TOKEN, { id: ADMIN });
        const tampered = initData.replace(/hash=[^&]+/, 'hash=deadbeef');
        const result = await validateInitData(tampered, BOT_TOKEN);
        expect(result.ok).toBe(false);
    });

    it('rejects a different bot token', async () => {
        const initData = await makeInitData('999:OTHER', { id: ADMIN });
        const result = await validateInitData(initData, BOT_TOKEN);
        expect(result.ok).toBe(false);
    });

    it('rejects stale auth_date', async () => {
        const initData = await makeInitData(BOT_TOKEN, { id: ADMIN }, Math.floor(Date.now() / 1000) - 60 * 60 * 48);
        const result = await validateInitData(initData, BOT_TOKEN);
        expect(result.ok).toBe(false);
        expect(result.reason).toBe('expired');
    });
});

describe('session', () => {
    it('round-trips a signed session', async () => {
        const token = await createSession(`${ADMIN}`);
        await expect(verifySession(token)).resolves.toBe(`${ADMIN}`);
    });

    it('rejects a tampered session', async () => {
        const token = await createSession(`${ADMIN}`);
        await expect(verifySession(`${token}x`)).resolves.toBeNull();
    });

    it('rejects expired sessions', async () => {
        const token = await createSession(`${ADMIN}`, -10);
        await expect(verifySession(token)).resolves.toBeNull();
    });

    it('refuses to create or verify sessions without TELEGRAM_TOKEN', async () => {
        const token = await createSession(`${ADMIN}`);
        ENV.TELEGRAM_TOKEN = '';
        await expect(createSession(`${ADMIN}`)).rejects.toThrow();
        await expect(verifySession(token)).resolves.toBeNull();
    });

    it('rejects a session forged with the old constant fallback key', async () => {
        // 攻击者在无 token 场景下用 'ctw' 常量伪造会话,必须无效
        const payload = btoa(JSON.stringify({ sub: `${ADMIN}`, exp: Math.floor(Date.now() / 1000) + 3600 }))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        const key = await hmac(encoder.encode('ctw-admin-session'), encoder.encode('ctw'));
        const sig = btoa(String.fromCharCode(...(await hmac(key, encoder.encode(payload)))))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        await expect(verifySession(`${payload}.${sig}`)).resolves.toBeNull();
    });
});

describe('password & admin helpers', () => {
    it('checks password', () => {
        expect(checkPassword('secret-pw')).toBe(true);
        expect(checkPassword('wrong')).toBe(false);
    });

    it('matches admin id', () => {
        expect(isAdmin(ADMIN)).toBe(true);
        expect(isAdmin(`${ADMIN}`)).toBe(true);
        expect(isAdmin(1)).toBe(false);
    });

    it('extracts bearer token', () => {
        expect(extractBearer('Bearer abc.def')).toBe('abc.def');
        expect(extractBearer('abc')).toBeNull();
        expect(extractBearer(null)).toBeNull();
    });
});
