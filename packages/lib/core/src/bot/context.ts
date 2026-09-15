import type * as Telegram from 'telegram-bot-api-types';
import { ENV } from '@chatgpt-telegram-workers/config';

/**
 * 每个 Telegram update 的会话上下文。只承载 KV key 与 bot 标识,
 * 配置为全局唯一(ENV.CONFIG),不再有 per-chat 配置。
 */
export class ShareContext {
    botId: number;
    botToken: string;
    botName: string | null = null;

    // KV 保存的键
    chatHistoryKey: string;
    lastMessageKey: string;
    groupAdminsKey?: string;

    constructor(token: string, update: UpdateContext) {
        const botId = Number.parseInt(token.split(':')[0]);
        // 默认拒绝:未配置 TELEGRAM_TOKEN 时也不接受任意路径 token
        if (!ENV.TELEGRAM_TOKEN || token !== ENV.TELEGRAM_TOKEN) {
            throw new Error('Token not allowed');
        }

        this.botToken = token;
        this.botId = botId;
        const id = update.chatID;
        if (id === undefined || id === null) {
            throw new Error('Chat id not found');
        }

        let historyKey = `history:${id}`;
        if (botId) {
            historyKey += `:${botId}`;
        }
        // 群组未开启共享模式时,每人独立上下文
        switch (update.chatType) {
            case 'group':
            case 'supergroup':
                if (!ENV.CONFIG.settings.groupChatBotShareMode && update.fromUserID) {
                    historyKey += `:${update.fromUserID}`;
                }
                this.groupAdminsKey = `group_admin:${id}`;
                break;
            default:
                break;
        }

        // 话题模式
        if (update.isForum && update.isTopicMessage && update.messageThreadID) {
            historyKey += `:${update.messageThreadID}`;
        }

        this.chatHistoryKey = historyKey;
        this.lastMessageKey = `last_message_id:${historyKey}`;
    }
}

export class WorkerContext {
    SHARE_CONTEXT: ShareContext;

    constructor(SHARE_CONTEXT: ShareContext) {
        this.SHARE_CONTEXT = SHARE_CONTEXT;
    }

    static from(token: string, update: Telegram.Update): WorkerContext {
        const context = new UpdateContext(update);
        const SHARE_CONTEXT = new ShareContext(token, context);
        return new WorkerContext(SHARE_CONTEXT);
    }
}

class UpdateContext {
    fromUserID?: number;
    chatID?: number;
    chatType?: string;

    isForum?: boolean;
    isTopicMessage?: boolean;
    messageThreadID?: number;

    constructor(update: Telegram.Update) {
        if (update.message) {
            this.fromUserID = update.message.from?.id;
            this.chatID = update.message.chat.id;
            this.chatType = update.message.chat.type;
            this.isForum = update.message.chat.is_forum;
            this.isTopicMessage = update.message.is_topic_message;
            this.messageThreadID = update.message.message_thread_id;
        } else if (update.callback_query) {
            this.fromUserID = update.callback_query.from.id;
            this.chatID = update.callback_query.message?.chat.id;
            this.chatType = update.callback_query.message?.chat.type;
            this.isForum = update.callback_query.message?.chat.is_forum;
        } else {
            console.error('Unknown update type');
        }
    }
}
