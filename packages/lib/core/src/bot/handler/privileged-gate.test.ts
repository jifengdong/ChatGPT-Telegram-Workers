import type * as Telegram from 'telegram-bot-api-types';
import { describe, expect, it } from 'vitest';
import { ENV } from '@chatgpt-telegram-workers/config';
import { handleUpdate } from './index';

const TOKEN = '123:ABC';
const USER = 1001;

function fakeKV(config: unknown) {
    return {
        async get(key: string) {
            return key === 'config:global' ? JSON.stringify(config) : null;
        },
        async put() {},
        async delete() {},
    } as any;
}

function privateMessage(text: string): Telegram.Update {
    return {
        update_id: 1,
        message: {
            message_id: 10,
            date: 1700000000,
            chat: { id: USER, type: 'private' },
            from: { id: USER, is_bot: false, first_name: 'U' },
            text,
        },
    } as Telegram.Update;
}

function stubFetch(sent: string[]): void {
    globalThis.fetch = (async (input: any, init?: any) => {
        const body = init?.body ? JSON.parse(init.body) : {};
        sent.push(JSON.stringify(body?.text ?? ''));
        return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    }) as any;
}

/** 白名单私聊用户 + 无 chatProviders 的最小配置 */
function seedEnv(): void {
    ENV.merge({
        TELEGRAM_TOKEN: TOKEN,
        DATABASE: fakeKV({
            settings: { allowAllUsers: false, allowedUserIds: [`${USER}`], allowedGroupIds: [] },
            chatProviders: [],
        }),
    });
}

describe('privileged command gate', () => {
    it('denies a privileged command from a whitelisted user when ADMIN_ID is unset', async () => {
        const sent: string[] = [];
        stubFetch(sent);
        seedEnv();
        // 未配置 ADMIN_ID:特权命令必须默认拒绝,不能因缺少配置而放行
        ENV.ADMIN_ID = '';
        await handleUpdate(TOKEN, privateMessage('/system'));
        expect(sent.some(text => text.includes('Permission denied'))).toBe(true);
    });

    it('allows a privileged command from the configured ADMIN_ID', async () => {
        const sent: string[] = [];
        stubFetch(sent);
        seedEnv();
        ENV.ADMIN_ID = `${USER}`;
        await handleUpdate(TOKEN, privateMessage('/system'));
        expect(sent.some(text => text.includes('Permission denied'))).toBe(false);
        expect(sent.length).toBeGreaterThan(0);
    });

    it('denies a privileged command from a whitelisted non-admin user', async () => {
        const sent: string[] = [];
        stubFetch(sent);
        seedEnv();
        ENV.ADMIN_ID = `${USER + 1}`;
        await handleUpdate(TOKEN, privateMessage('/system'));
        expect(sent.some(text => text.includes('Permission denied'))).toBe(true);
    });
});
