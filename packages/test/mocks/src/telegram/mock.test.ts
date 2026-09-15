import { describe, expect, it } from 'vitest';
import { TelegramMock } from './mock';

const TOKEN = '123456:E2E';
const base = `https://api.telegram.test/bot${TOKEN}`;

function call(mock: TelegramMock, method: string, body?: unknown) {
    return mock.fetch(new Request(`${base}/${method}`, { method: 'POST', body: JSON.stringify(body ?? {}) }));
}

async function result(response: Response): Promise<any> {
    return (await response.json()).result;
}

describe('TelegramMock routing', () => {
    it('answers getMe with the configured bot identity', async () => {
        const mock = new TelegramMock({ token: TOKEN, botUsername: 'my_bot', botId: 42 });
        const info = await result(await call(mock, 'getMe'));
        expect(info.username).toBe('my_bot');
        expect(info.id).toBe(42);
    });

    it('rejects an unknown path and a wrong token', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        const unknown = await mock.fetch(new Request('https://api.telegram.test/nope'));
        expect(unknown.status).toBe(404);
        const bad = await mock.fetch(new Request('https://api.telegram.test/bot999:WRONG/getMe'));
        expect(bad.status).toBe(401);
    });

    it('records every call with its token', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        await call(mock, 'getMe');
        await call(mock, 'sendMessage', { chat_id: 1, text: 'hi' });
        expect(mock.calls.map(c => c.method)).toEqual(['getMe', 'sendMessage']);
        expect(mock.calls[0].token).toBe(TOKEN);
    });
});

describe('TelegramMock messages', () => {
    it('records sendMessage / sendPhoto / editMessageText for a chat', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        await call(mock, 'sendMessage', { chat_id: 7, text: 'first' });
        await call(mock, 'sendPhoto', { chat_id: 7, caption: 'pic' });
        await call(mock, 'editMessageText', { chat_id: 7, message_id: 1001, text: 'first (edited)' });
        const sent = mock.sentFor(7);
        expect(sent).toHaveLength(3);
        expect(mock.lastText(7)).toBe('first (edited)');
        expect(mock.textsFor(7)).toEqual(['first', 'pic', 'first (edited)']);
        expect(sent[0].messageId).toBe(1001);
    });

    it('captures parse_mode and reply_markup', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        await call(mock, 'sendMessage', {
            chat_id: 1,
            text: '<b>hi</b>',
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: 'x', callback_data: 'm:0:0' }]] },
        });
        const message = mock.lastMessage(1)!;
        expect(message.parseMode).toBe('HTML');
        expect(message.keyboard).toEqual({ inline_keyboard: [[{ text: 'x', callback_data: 'm:0:0' }]] });
    });
});

describe('TelegramMock webhook + updates', () => {
    it('stores the webhook url and secret on setWebhook', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        await call(mock, 'setWebhook', { url: 'https://bot.example/telegram/x/webhook', secret_token: 's3cret' });
        expect(mock.webhook).toBe('https://bot.example/telegram/x/webhook');
        expect(mock.webhookSecret).toBe('s3cret');
        await call(mock, 'deleteWebhook');
        expect(mock.webhook).toBeNull();
    });

    it('serves queued updates once via getUpdates', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        mock.enqueueUpdate({ update_id: 1, message: { message_id: 1 } } as any);
        mock.enqueueUpdate({ update_id: 2, message: { message_id: 2 } } as any);
        const first = await result(await call(mock, 'getUpdates', { offset: 0 }));
        expect(first.map((u: any) => u.update_id)).toEqual([1, 2]);
        const second = await result(await call(mock, 'getUpdates', { offset: 3 }));
        expect(second).toEqual([]);
    });
});

describe('TelegramMock members & files', () => {
    it('returns seeded administrators for getChatAdministrators', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        mock.addMember(-100, { userId: 1, status: 'creator', firstName: 'Owner' });
        mock.addMember(-100, { userId: 2, status: 'administrator', firstName: 'Admin' });
        mock.addMember(-100, { userId: 3, status: 'member', firstName: 'Member' });
        const admins = await result(await call(mock, 'getChatAdministrators', { chat_id: -100 }));
        expect(admins.map((a: any) => a.user.id).sort()).toEqual([1, 2]);
    });

    it('serves getFile + the file download endpoint', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        const bytes = new Uint8Array([137, 80, 78, 71]);
        const file = mock.addFile({ fileId: 'f1', content: bytes, contentType: 'image/png' });
        const info = await result(await call(mock, 'getFile', { file_id: 'f1' }));
        expect(info.file_path).toBe(file.filePath);
        const download = await mock.fetch(new Request(`https://api.telegram.test/file/bot${TOKEN}/${file.filePath}`));
        expect(download.status).toBe(200);
        expect(new Uint8Array(await download.arrayBuffer())).toEqual(bytes);
    });
});

describe('TelegramMock error injection', () => {
    it('fails the next matching call only', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        mock.failNext('sendMessage', { status: 400, description: "Bad Request: can't parse entities" });
        const failed = await call(mock, 'sendMessage', { chat_id: 1, text: 'x' });
        expect(failed.status).toBe(400);
        expect((await failed.json()).description).toContain("can't parse entities");
        const ok = await call(mock, 'sendMessage', { chat_id: 1, text: 'x' });
        expect(ok.status).toBe(200);
    });

    it('injects 429 with a Retry-After header', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        mock.failNext('sendMessage', { status: 429, retryAfter: 2 });
        const response = await call(mock, 'sendMessage', { chat_id: 1, text: 'x' });
        expect(response.status).toBe(429);
        expect(response.headers.get('Retry-After')).toBe('2');
    });

    it('supports conditional persistent injection', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        mock.failWhen('sendMessage', c => c.body?.text === 'boom', { status: 500 });
        expect((await call(mock, 'sendMessage', { chat_id: 1, text: 'ok' })).status).toBe(200);
        expect((await call(mock, 'sendMessage', { chat_id: 1, text: 'boom' })).status).toBe(500);
        expect((await call(mock, 'sendMessage', { chat_id: 1, text: 'ok' })).status).toBe(200);
    });

    it('lets a custom handler override a method result', async () => {
        const mock = new TelegramMock({ token: TOKEN });
        mock.on('getMe', () => ({ id: 99, is_bot: true, first_name: 'X', username: 'custom' }));
        const info = await result(await call(mock, 'getMe'));
        expect(info.username).toBe('custom');
    });
});
