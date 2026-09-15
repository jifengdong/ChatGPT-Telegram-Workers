import type * as Telegram from 'telegram-bot-api-types';
import type { ActorOptions, ChatType, PhotoMessageOptions, TextMessageOptions } from './types';

export const DEFAULT_BOT_USERNAME = 'e2e_bot';
export const DEFAULT_BOT_ID = 777000;

/**
 * 每条 fixture 默认分配唯一 message_id。
 * bot 的 OldMessageFilter 会按 message_id 去重,重复 id 会被当成旧消息丢弃,
 * 因此默认唯一能避免测试之间互相干扰。
 */
let messageIdSeq = 1000;

/** 取下一个唯一 message_id;也可显式传入固定值 */
export function nextMessageId(): number {
    return messageIdSeq++;
}

/** 重置 fixture 计数器(测试隔离用) */
export function resetFixtureIds(): void {
    messageIdSeq = 1000;
}

function chatType(type: ChatType | undefined): ChatType {
    return type ?? 'private';
}

function chat(options: ActorOptions): Telegram.Chat {
    const type = chatType(options.chatType);
    const base: Telegram.Chat = { id: options.chatId, type };
    if (type !== 'private') {
        base.title = options.firstName ? `${options.firstName} chat` : 'mock chat';
        base.is_forum = false;
    } else {
        base.first_name = options.firstName ?? 'User';
        base.username = options.username;
    }
    return base;
}

function from(options: ActorOptions): Telegram.User {
    return {
        id: options.userId,
        is_bot: options.isBot ?? false,
        first_name: options.firstName ?? 'User',
        username: options.username,
    };
}

/** 在文本末尾追加 `@mention` 并生成对应 entity */
export function mentionEntity(
    text: string,
    username = DEFAULT_BOT_USERNAME,
): { text: string; entities: Telegram.MessageEntity[] } {
    const next = `${text} @${username}`;
    return {
        text: next,
        entities: [{ type: 'mention', offset: next.length - username.length - 1, length: username.length + 1 }],
    };
}

/** 构造一条私聊/群组文本消息 Update */
export function textMessage(options: TextMessageOptions): Telegram.Update {
    const message: Telegram.Message = {
        message_id: options.messageId ?? nextMessageId(),
        date: Math.floor(Date.now() / 1000),
        chat: chat(options),
        from: from(options),
        text: options.text,
        entities: options.entities,
    };
    if (options.replyTo) {
        message.reply_to_message = options.replyTo;
    }
    if (options.messageThreadId !== undefined) {
        message.message_thread_id = options.messageThreadId;
        message.is_topic_message = options.isTopicMessage ?? true;
        (message.chat as Telegram.Chat).is_forum = true;
    }
    return { update_id: 1, message };
}

/** 一条带 @bot 提及的群组消息 */
export function mentionMessage(
    options: Omit<TextMessageOptions, 'entities'> & { botUsername?: string },
): Telegram.Update {
    const { text, entities } = mentionEntity(options.text, options.botUsername);
    return textMessage({ ...options, text, entities });
}

/** 一条包含 bot 命令的群组消息,例如 `/new@e2e_bot` */
export function groupCommand(
    options: Omit<TextMessageOptions, 'entities' | 'text'> & { command: string; botUsername?: string },
): Telegram.Update {
    const username = options.botUsername ?? DEFAULT_BOT_USERNAME;
    const text = `${options.command}@${username}`;
    return textMessage({
        ...options,
        text,
        entities: [{ type: 'bot_command', offset: 0, length: text.length }],
    });
}

/** 构造一条带图片的消息 Update */
export function photoMessage(options: PhotoMessageOptions): Telegram.Update {
    const fileId = options.fileId ?? 'photo-file-id';
    const message: Telegram.Message = {
        message_id: options.messageId ?? nextMessageId(),
        date: Math.floor(Date.now() / 1000),
        chat: chat(options),
        from: from(options),
        caption: options.caption,
        photo: [{ file_id: fileId, file_unique_id: `${fileId}-u`, width: 100, height: 100, file_size: 4 }],
    };
    return { update_id: 1, message };
}

/** 构造一条 inline 按钮点击 Update(可指向一条已存在的消息) */
export function callbackQuery(options: {
    data: string;
    userId: number;
    chatId: number;
    chatType?: ChatType;
    messageId?: number;
    messageText?: string;
    firstName?: string;
}): Telegram.Update {
    const type = chatType(options.chatType);
    const callbackMessage: Telegram.Message = {
        message_id: options.messageId ?? nextMessageId(),
        date: Math.floor(Date.now() / 1000),
        chat: { id: options.chatId, type, title: type === 'private' ? undefined : 'mock chat' },
        text: options.messageText,
    };
    return {
        update_id: 1,
        callback_query: {
            id: `cb-${Math.random().toString(36).slice(2, 10)}`,
            from: { id: options.userId, is_bot: false, first_name: options.firstName ?? 'User' },
            chat_instance: 'mock-chat-instance',
            data: options.data,
            message: callbackMessage,
        },
    };
}

/** 构造一条服务消息 Update(入群等),bot 应忽略 */
export function serviceMessage(options: ActorOptions & { messageId?: number }): Telegram.Update {
    return {
        update_id: 1,
        message: {
            message_id: options.messageId ?? nextMessageId(),
            date: Math.floor(Date.now() / 1000),
            chat: chat(options),
            from: from(options),
            new_chat_members: [{ id: 424242, is_bot: false, first_name: 'Newbie' }],
        },
    };
}

/** 构造一条「来自 bot 自己」的消息(测试 reply-to-bot 逻辑) */
export function botMessage(options: ActorOptions & { text: string; messageId?: number }): Telegram.Message {
    return {
        message_id: options.messageId ?? nextMessageId(),
        date: Math.floor(Date.now() / 1000),
        chat: chat(options),
        from: { id: options.userId, is_bot: true, first_name: options.firstName ?? 'Bot' },
        text: options.text,
    };
}
