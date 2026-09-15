import type * as Telegram from 'telegram-bot-api-types';
import type { MessageHandler, UpdateHandler } from './types';

/**
 * 通用中间件:从 Update 中取出 Message,依次交给消息中间件处理
 */
export class Update2MessageHandler<Context = unknown> implements UpdateHandler<Context> {
    messageHandlers: MessageHandler<Context>[];

    constructor(messageHandlers: MessageHandler<Context>[]) {
        this.messageHandlers = messageHandlers;
    }

    loadMessage(body: Telegram.Update): Telegram.Message {
        if (body.edited_message) {
            throw new Error('Ignore edited message');
        }
        if (body.message) {
            return body.message;
        }
        throw new Error('Invalid message');
    }

    handle = async (update: Telegram.Update, context: Context): Promise<Response | null> => {
        const message = this.loadMessage(update);
        for (const handler of this.messageHandlers) {
            const result = await handler.handle(message, context);
            if (result) {
                return result;
            }
        }
        return null;
    };
}
