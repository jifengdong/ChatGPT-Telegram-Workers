import type * as Telegram from 'telegram-bot-api-types';
import { describe, expect, it } from 'vitest';
import { ENV } from '@chatgpt-telegram-workers/config';
import { handleUpdate } from './index';
import { ServiceMessageFilter, isServiceMessage } from './handlers';

const TOKEN = '123:ABC';

function fakeKV(config: unknown) {
    return {
        async get(key: string) {
            return key === 'config:global' ? JSON.stringify(config) : null;
        },
        async put() {},
        async delete() {},
    } as any;
}

function message(extra: Partial<Telegram.Message>): Telegram.Message {
    return {
        message_id: 10,
        date: 1700000000,
        chat: { id: -100123, type: 'supergroup', title: 'g' },
        from: { id: 999, is_bot: false, first_name: 'A' },
        ...extra,
    } as Telegram.Message;
}

function stubFetch(sent: string[]): void {
    globalThis.fetch = (async (input: any, init?: any) => {
        const url = typeof input === 'string' ? input : input.url;
        const body = init?.body ? JSON.parse(init.body) : {};
        sent.push(`${url.split('/').pop()} ${JSON.stringify(body?.text ?? '')}`);
        return new Response(JSON.stringify({ ok: true, result: { message_id: 1 } }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    }) as any;
}

describe('isServiceMessage', () => {
    it.each([
        ['new_chat_members', { new_chat_members: [{ id: 1, is_bot: false, first_name: 'n' }] }],
        ['left_chat_member', { left_chat_member: { id: 1, is_bot: false, first_name: 'n' } }],
        ['new_chat_title', { new_chat_title: 't' }],
        ['pinned_message', { pinned_message: {} }],
        ['forum_topic_created', { forum_topic_created: {} }],
        ['video_chat_started', { video_chat_started: {} }],
        ['group_chat_created', { group_chat_created: true }],
    ])('detects %s', (_name, extra) => {
        expect(isServiceMessage(message(extra as Partial<Telegram.Message>))).toBe(true);
    });

    it('treats a normal text message as not a service message', () => {
        expect(isServiceMessage(message({ text: 'hello' }))).toBe(false);
    });

    it('treats a photo message as not a service message', () => {
        expect(isServiceMessage(message({ photo: [] }))).toBe(false);
    });
});

describe('ServiceMessageFilter', () => {
    it('short-circuits updates carrying a service message', async () => {
        const filter = new ServiceMessageFilter();
        const update = { update_id: 1, message: message({ new_chat_members: [] }) } as Telegram.Update;
        await expect(filter.handle(update, {} as any)).rejects.toThrow('Ignore service message');
    });

    it('passes through normal text and non-message updates', async () => {
        const filter = new ServiceMessageFilter();
        await expect(
            filter.handle({ update_id: 1, message: message({ text: 'hi' }) } as Telegram.Update, {} as any),
        ).resolves.toBeNull();
        await expect(filter.handle({ update_id: 2 } as Telegram.Update, {} as any)).resolves.toBeNull();
    });
});

describe('handleUpdate: service messages are never answered', () => {
    it('does not reply to a join message in a non-whitelisted group', async () => {
        const sent: string[] = [];
        stubFetch(sent);
        ENV.merge({
            TELEGRAM_TOKEN: TOKEN,
            DATABASE: fakeKV({ settings: { allowAllUsers: false, allowedGroupIds: [] }, chatProviders: [] }),
        });
        await handleUpdate(TOKEN, {
            update_id: 1,
            message: message({ new_chat_members: [{ id: 555, is_bot: false, first_name: 'Newbie' }] }),
        } as Telegram.Update);
        expect(sent).toEqual([]);
    });

    it('still replies to a non-whitelisted group for a real text message', async () => {
        const sent: string[] = [];
        stubFetch(sent);
        ENV.merge({
            TELEGRAM_TOKEN: TOKEN,
            DATABASE: fakeKV({ settings: { allowAllUsers: false, allowedGroupIds: [] }, chatProviders: [] }),
        });
        await handleUpdate(TOKEN, { update_id: 2, message: message({ text: 'hello' }) } as Telegram.Update);
        expect(sent.length).toBe(1);
        expect(sent[0]).toContain('white list');
    });
});
