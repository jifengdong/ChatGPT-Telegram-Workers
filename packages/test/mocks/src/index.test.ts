import { describe, expect, it } from 'vitest';
import {
    buildTestConfig,
    callbackQuery,
    groupCommand,
    mentionMessage,
    photoMessage,
    serviceMessage,
    TelegramMock,
    textMessage,
} from './index';
import { startMockServer } from './node';
import { DEFAULT_BOT_USERNAME } from './telegram/fixtures';

describe('fixtures', () => {
    it('builds a private text update', () => {
        const update = textMessage({ chatId: 1, userId: 1, text: 'hi' });
        expect(update.message?.text).toBe('hi');
        expect(update.message?.chat.type).toBe('private');
    });

    it('builds a group mention update with a matching entity', () => {
        const update = mentionMessage({ chatId: -100, chatType: 'group', userId: 5, text: 'hello' });
        const text = update.message!.text!;
        const entity = update.message!.entities![0];
        expect(text.slice(entity.offset, entity.offset + entity.length)).toBe(`@${DEFAULT_BOT_USERNAME}`);
    });

    it('builds a group command with a bot_command entity', () => {
        const update = groupCommand({ chatId: -100, chatType: 'group', userId: 5, command: '/new' });
        expect(update.message?.text).toBe(`/new@${DEFAULT_BOT_USERNAME}`);
        expect(update.message?.entities?.[0].type).toBe('bot_command');
    });

    it('builds a photo update and a callback query', () => {
        const photo = photoMessage({ chatId: 1, userId: 1, caption: 'look', fileId: 'f9' });
        expect(photo.message?.photo?.[0].file_id).toBe('f9');
        const cb = callbackQuery({ data: 'm:0:1', userId: 1, chatId: 1, messageId: 2 });
        expect(cb.callback_query?.data).toBe('m:0:1');
        expect(cb.callback_query?.message?.message_id).toBe(2);
    });

    it('builds a service message update', () => {
        const update = serviceMessage({ chatId: -100, chatType: 'supergroup', userId: 5 });
        expect(update.message?.new_chat_members).toHaveLength(1);
    });
});

describe('buildTestConfig', () => {
    it('produces a config with a default chat provider and settings', () => {
        const config = buildTestConfig({ chatProviders: [{ id: 'mock', baseUrl: 'http://x/v1' }] });
        expect(config.defaultChatProvider).toBe('mock');
        expect(config.chatProviders[0].protocol).toBe('chat-completions');
        expect(config.settings.streamMode).toBe(false);
    });

    it('merges settings overrides', () => {
        const config = buildTestConfig({ settings: { allowAllUsers: true, language: 'zh-cn' } });
        expect(config.settings.allowAllUsers).toBe(true);
        expect(config.settings.language).toBe('zh-cn');
    });
});

describe('startMockServer', () => {
    it('serves a mock over a real http port', async () => {
        const mock = new TelegramMock({ token: 't' });
        const server = await startMockServer(mock);
        try {
            const response = await fetch(`${server.url}/bot${'t'}/getMe`);
            const data = await response.json();
            expect(data.ok).toBe(true);
            expect(data.result.is_bot).toBe(true);
        } finally {
            await server.close();
        }
    });
});
