import type * as Telegram from 'telegram-bot-api-types';
import type { UpdateHandler } from './types';
import { ENV } from '@chatgpt-telegram-workers/config';
import { configureTelegram, Update2MessageHandler } from '@chatgpt-telegram-workers/telegram';
import { WorkerContext } from '../context';
import { GroupMention } from './group';
import {
    AccessFilter,
    CallbackQueryHandler,
    ChatHandler,
    CommandHandler,
    EnvChecker,
    MessageFilter,
    OldMessageFilter,
    SaveLastMessage,
    ServiceMessageFilter,
} from './handlers';

// 消息处理中间件
const SHARE_HANDLER: UpdateHandler[] = [
    // 服务消息(入群/退群/置顶等)不是用户输入,最先忽略,避免被白名单等中间件误回复
    new ServiceMessageFilter(),
    // 检查环境是否准备好: DATABASE
    new EnvChecker(),
    // 过滤非白名单用户, 提前过滤减少KV消耗
    new AccessFilter(),
    // InlineKeyboard 回调(/models 切换模型等),必须在消息转换之前接管
    new CallbackQueryHandler(),
    // 消息处理
    new Update2MessageHandler([
        // 过滤不支持的消息(抛出异常结束消息处理)
        new MessageFilter(),
        // 处理群消息，判断是否需要响应此条消息
        new GroupMention(),
        // 忽略旧消息
        new OldMessageFilter(),
        // DEBUG: 保存最后一条消息,按照需求自行调整此中间件位置
        new SaveLastMessage(),
        // 处理命令消息
        new CommandHandler(),
        // 与llm聊天
        new ChatHandler(),
    ]),
];

export async function handleUpdate(token: string, update: Telegram.Update): Promise<Response | null> {
    // 载入全局配置并把宿主环境注入传输层框架
    await ENV.loadConfig();
    configureTelegram({
        apiDomain: ENV.CONFIG.settings.telegramApiDomain,
        defaultParseMode: ENV.CONFIG.settings.defaultParseMode,
        renderMessage: ENV.CUSTOM_MESSAGE_RENDER,
    });
    const context = WorkerContext.from(token, update);

    for (const handler of SHARE_HANDLER) {
        try {
            const result = await handler.handle(update, context);
            if (result) {
                return result;
            }
        } catch (e) {
            return new Response(
                JSON.stringify({
                    message: (e as Error).message,
                    stack: (e as Error).stack,
                }),
                { status: 500 },
            );
        }
    }
    return null;
}
