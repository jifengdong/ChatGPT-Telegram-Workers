import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type BotHarness, startBotHarness } from '@chatgpt-telegram-workers/test-mocks';

const here = path.dirname(fileURLToPath(import.meta.url));
/** 真实构建产物:packages/apps/server/dist/node.js */
export const APP_ENTRY = path.resolve(here, '../../../apps/server/dist/node.js');

export const BOT_TOKEN = '123456:E2E';
export const SECRET_TOKEN = 'e2e-secret';
export const ADMIN_ID = 42;
export const ADMIN_PASSWORD = 'e2e-pass';

/** 整个测试文件共用一个 bot + mock 环境 */
let shared: BotHarness | null = null;

export async function getHarness(): Promise<BotHarness> {
    if (!shared) {
        shared = await startBotHarness({
            entry: APP_ENTRY,
            token: BOT_TOKEN,
            secretToken: SECRET_TOKEN,
            adminId: ADMIN_ID,
            adminPassword: ADMIN_PASSWORD,
        });
        // 默认配置:开启密码登录所需的 ADMIN_ID 已由 harness 注入
        await shared.botClient.login(ADMIN_PASSWORD);
        await shared.applyConfig();
    }
    return shared;
}

export async function disposeHarness(): Promise<void> {
    if (shared) {
        await shared.close();
        shared = null;
    }
}

function hmac(key: Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
}

/**
 * 用 bot token 为测试签名一份合法的 Telegram Mini App initData。
 * 算法与 packages/lib/core/src/admin/auth.ts 的 validateInitData 一致。
 */
export function signInitData(userId: number, botToken = BOT_TOKEN): string {
    const params: Record<string, string> = {
        user: JSON.stringify({ id: userId, first_name: 'Admin', username: 'admin' }),
        auth_date: `${Math.floor(Date.now() / 1000)}`,
    };
    const dataCheckString = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .sort()
        .join('\n');
    const secret = hmac(Buffer.from('WebAppData'), botToken);
    const hash = hmac(secret, dataCheckString).toString('hex');
    return new URLSearchParams({ ...params, hash }).toString();
}

/**
 * 在页面加载前注入 window.Telegram.WebApp.initData,模拟在 Mini App 内打开。
 * 同时拦截官方 SDK 脚本,避免它覆盖我们注入的 stub(否则 initData 会变空)。
 */
export async function stubTelegramWebApp(page: import('@playwright/test').Page, userId = ADMIN_ID): Promise<void> {
    const initData = signInitData(userId);
    await page.route('**/telegram-web-app.js', route => route.abort());
    await page.addInitScript(
        `window.Telegram = { WebApp: { initData: ${JSON.stringify(initData)}, ready: () => {}, expand: () => {} } };`,
    );
}
