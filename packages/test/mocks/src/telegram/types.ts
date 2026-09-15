import type * as Telegram from 'telegram-bot-api-types';

export type ChatType = 'private' | 'group' | 'supergroup' | 'channel';
export type MemberStatus = 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';

/** mock 中注册的一个聊天 */
export interface MockChat {
    id: number;
    type: ChatType;
    title?: string;
    username?: string;
    isForum?: boolean;
}

/** mock 中注册的一个成员 */
export interface MockMember {
    userId: number;
    status: MemberStatus;
    firstName?: string;
    username?: string;
    isBot?: boolean;
}

/** mock 中注册的一个文件(供 getFile + /file/... 下载) */
export interface MockFile {
    fileId: string;
    filePath: string;
    content: Uint8Array;
    contentType: string;
}

/** bot 出站消息的记录(便于断言「bot 对某聊天说了什么」) */
export interface SentMessage {
    messageId: number;
    chatId: number;
    /** sendMessage / sendPhoto / editMessageText ... */
    via: string;
    method: string;
    text: string;
    caption?: string;
    parseMode: string | null;
    keyboard?: unknown;
    photo?: unknown;
    raw: any;
}

export interface TelegramMockOptions {
    /** 期望的 bot token;为空时不校验路径 token */
    token?: string;
    /** 若设置,则要求 webhook 请求携带匹配的 secret header(模拟真实 secret_token) */
    secretToken?: string;
    /** 默认 bot 用户名(getMe 返回) */
    botUsername?: string;
    /** 默认 bot id */
    botId?: number;
}

/** 构造 Update 的公共字段 */
export interface ActorOptions {
    chatId: number;
    chatType?: ChatType;
    userId: number;
    firstName?: string;
    username?: string;
    isBot?: boolean;
}

export interface TextMessageOptions extends ActorOptions {
    text: string;
    /** 覆盖/追加 entities;用于构造 @mention 等 */
    entities?: Telegram.MessageEntity[];
    messageId?: number;
    replyTo?: Telegram.Message;
    messageThreadId?: number;
    isTopicMessage?: boolean;
}

export interface PhotoMessageOptions extends ActorOptions {
    caption?: string;
    fileId?: string;
    messageId?: number;
}
