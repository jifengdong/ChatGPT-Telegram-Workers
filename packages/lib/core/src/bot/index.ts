// core 的 bot 应用层:Telegram 更新的业务编排 + 中间件/命令实现
export * from './auth';
export * from './chat';
export * from './command';
export * from './context';
export { handleUpdate } from './handler';
export type { MessageHandler, UpdateHandler } from './handler/types';
// 透出传输框架中对宿主管用的符号(telegram 包本身零 workspace 依赖)
export {
    configureTelegram,
    createTelegramBotAPI,
    DEFAULT_API_DOMAIN,
    DEFAULT_PARSE_MODE,
    getTelegramConfig,
    MessageSender,
    Update2MessageHandler,
} from '@chatgpt-telegram-workers/telegram';
export type { MessageRender, TelegramBotAPI, TelegramTransportConfig } from '@chatgpt-telegram-workers/telegram';
