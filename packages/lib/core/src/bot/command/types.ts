import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../context';

export interface CommandHandler {
    command: string;
    scopes?: string[];
    handle: (message: Telegram.Message, subcommand: string, context: WorkerContext) => Promise<Response>;
    needAuth?: (chatType: string) => string[] | null;
    /** 特权命令:私聊中仅 ADMIN_ID 可用(默认所有系统命令对白名单用户开放) */
    privileged?: boolean;
}
