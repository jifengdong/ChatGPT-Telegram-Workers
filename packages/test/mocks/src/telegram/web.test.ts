import { describe, expect, it } from 'vitest';
import { TelegramMock } from './mock';
import { TelegramWebClient } from './web';

async function makeRig() {
    const telegram = new TelegramMock({ token: '123:ABC', botUsername: 'my_bot' });
    const received: any[] = [];
    // 用一个本地 http server 冒充 bot 的 webhook 端点
    const { startLocalServer } = await import('../node/server');
    const bot = await startLocalServer(async request => {
        received.push(await request.json());
        return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
    });
    const web = new TelegramWebClient(telegram, {
        botBaseUrl: bot.url,
        token: '123:ABC',
        secretToken: 's3cret',
        chats: [
            { id: 1001, type: 'private', title: 'Alice', userId: 1001, userName: 'Alice' },
            { id: -100, type: 'supergroup', title: 'Team', userId: 7, userName: 'Bob' },
        ],
    });
    const webServer = await startLocalServer(request => web.fetch(request));
    return { telegram, received, bot, web, webServer };
}

describe('TelegramWebClient', () => {
    it('serves the chat page and initial state', async () => {
        const rig = await makeRig();
        try {
            const page = await fetch(rig.webServer.url + '/web');
            expect(page.status).toBe(200);
            expect(await page.text()).toContain('Mock Telegram');

            const stateResponse = await fetch(rig.webServer.url + '/web/api/state');
            const state: any = await stateResponse.json();
            expect(state.chats.map((c: any) => c.id).sort()).toEqual([-100, 1001]);
        } finally {
            await rig.webServer.close();
            await rig.bot.close();
        }
    });

    it('sends a private message as an Update to the bot webhook', async () => {
        const rig = await makeRig();
        try {
            const res = await fetch(rig.webServer.url + '/web/api/send', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ chatId: 1001, userId: 1001, text: 'hello bot' }),
            });
            expect((await res.json()).ok).toBe(true);
            expect(rig.received).toHaveLength(1);
            const update = rig.received[0];
            expect(update.message.text).toBe('hello bot');
            expect(update.message.chat.type).toBe('private');
        } finally {
            await rig.webServer.close();
            await rig.bot.close();
        }
    });

    it('adds an @mention entity for group messages', async () => {
        const rig = await makeRig();
        try {
            await fetch(rig.webServer.url + '/web/api/send', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ chatId: -100, userId: 7, text: 'hey @my_bot help' }),
            });
            const update = rig.received[0];
            expect(update.message.chat.type).toBe('supergroup');
            expect(update.message.entities[0]).toMatchObject({ type: 'mention', offset: 4, length: 7 });
        } finally {
            await rig.webServer.close();
            await rig.bot.close();
        }
    });

    it('reflects bot outbound messages in state and sends callback queries on click', async () => {
        const rig = await makeRig();
        try {
            // 模拟 bot 发一条带按钮的消息
            await rig.telegram.fetch(
                new Request('https://api.telegram.test/bot123:ABC/sendMessage', {
                    method: 'POST',
                    body: JSON.stringify({
                        chat_id: 1001,
                        text: 'Pick one',
                        reply_markup: { inline_keyboard: [[{ text: 'A', callback_data: 'm:0:0' }]] },
                    }),
                }),
            );
            const state: any = await (await fetch(rig.webServer.url + '/web/api/state')).json();
            const message = state.messages.find((m: any) => m.chatId === 1001);
            expect(message.text).toBe('Pick one');
            expect(message.keyboard[0][0]).toEqual({ text: 'A', data: 'm:0:0' });

            await fetch(rig.webServer.url + '/web/api/click', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ chatId: 1001, userId: 1001, data: 'm:0:0' }),
            });
            expect(rig.received[0].callback_query.data).toBe('m:0:0');
        } finally {
            await rig.webServer.close();
            await rig.bot.close();
        }
    });
});
