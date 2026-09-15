import type * as Telegram from 'telegram-bot-api-types';

/**
 * 中间件约定 function (payload, context): Promise<Response|null>
 * 1. 抛出异常时结束处理,返回异常信息
 * 2. 返回 Response 时结束处理
 * 3. 返回 null 时交给下一个中间件
 */
export interface UpdateHandler<Context = unknown> {
    handle: (update: Telegram.Update, context: Context) => Promise<Response | null>;
}

export interface MessageHandler<Context = unknown> {
    handle: (message: Telegram.Message, context: Context) => Promise<Response | null>;
}
