import type { HistoryModifierResult, Message } from '@chatgpt-telegram-workers/agent';
import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../context';
import type { CommandHandler } from './types';
import { loadChatLLM, loadImageGen } from '@chatgpt-telegram-workers/agent';
import { ENV } from '@chatgpt-telegram-workers/config';
import { createTelegramBotAPI, MessageSender } from '@chatgpt-telegram-workers/telegram';
import { isGroupChat, TELEGRAM_AUTH_CHECKER } from '../auth';
import { chatWithMessage } from '../chat';
import { agentSummary, currentProvider, providerKeyboard, providerPage } from '../handler/handlers';
import { MENU_COMMANDS } from './menu-commands';

/** 把文本中的 HTML 特殊字符转义,避免插入 <pre> 时破坏标记 */
function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export class ImgCommandHandler implements CommandHandler {
    command = '/img';
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        const agent = loadImageGen(ENV.CONFIG);
        if (subcommand === '') {
            // 无参数时:先列出 provider,选中后再展示其模型列表
            const text = `${ENV.I18N.command.help.img}\n\n${agentSummary(agent)}`;
            const current = currentProvider('image');
            if (!current) {
                return sender.sendPlainText(text);
            }
            return sender.sendRawMessage({
                chat_id: message.chat.id,
                text: `${text}\n${ENV.I18N.callback_query.select_provider}`,
                reply_markup: providerKeyboard('image', providerPage('image', current.index), current.id),
            });
        }
        try {
            if (!agent) {
                return sender.sendPlainText('ERROR: Image generator not found');
            }
            const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
            setTimeout(
                () =>
                    api
                        .sendChatAction({
                            chat_id: message.chat.id,
                            action: 'upload_photo',
                        })
                        .catch(console.error),
                0,
            );
            const img = await agent.generate(subcommand);
            const resp = await sender.sendPhoto(img);
            if (!resp.ok) {
                return sender.sendPlainText(`ERROR: ${resp.statusText} ${await resp.text()}`);
            }
            return resp;
        } catch (e) {
            return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class HelpCommandHandler implements CommandHandler {
    command = '/help';
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        let helpMsg = `${ENV.I18N.command.help.summary}\n`;
        for (const cmd of MENU_COMMANDS) {
            const desc = ENV.I18N.command.help[cmd.substring(1)];
            if (desc) {
                helpMsg += `${cmd}：${desc}\n`;
            }
        }
        for (const cmd of ENV.CONFIG.customCommands) {
            if (cmd.enabled && cmd.description) {
                helpMsg += `${cmd.command}：${cmd.description}\n`;
            }
        }
        for (const plugin of ENV.CONFIG.plugins) {
            if (plugin.enabled && plugin.description) {
                helpMsg += `${plugin.command}：${plugin.description}\n`;
            }
        }
        return sender.sendPlainText(helpMsg);
    };
}

class BaseNewCommandHandler {
    static async handle(
        showID: boolean,
        message: Telegram.Message,
        subcommand: string,
        context: WorkerContext,
    ): Promise<Response> {
        await ENV.DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);
        const text = ENV.I18N.command.new.new_chat_start + (showID ? `(${message.chat.id})` : '');
        const params: Telegram.SendMessageParams = {
            chat_id: message.chat.id,
            text,
        };
        if (ENV.CONFIG.settings.showReplyButton && !isGroupChat(message.chat.type)) {
            params.reply_markup = {
                keyboard: [[{ text: '/new' }, { text: '/redo' }]],
                selective: true,
                resize_keyboard: true,
                one_time_keyboard: false,
            };
        } else {
            params.reply_markup = {
                remove_keyboard: true,
                selective: true,
            };
        }
        return createTelegramBotAPI(context.SHARE_CONTEXT.botToken).sendMessage(params);
    }
}

export class NewCommandHandler extends BaseNewCommandHandler implements CommandHandler {
    command = '/new';
    scopes = ['all_private_chats', 'all_group_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        return BaseNewCommandHandler.handle(false, message, subcommand, context);
    };
}

export class StartCommandHandler extends BaseNewCommandHandler implements CommandHandler {
    command = '/start';
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        return BaseNewCommandHandler.handle(true, message, subcommand, context);
    };
}

/**
 * 解析管理后台地址:ENV.publicBaseUrl(环境变量 PUBLIC_BASE_URL 优先于 KV 配置),
 * 都未设置时从已注册的 webhook 地址推断公网域名(/init 绑定过即可用)。
 */
async function adminPanelUrl(context: WorkerContext): Promise<string | null> {
    const base = ENV.publicBaseUrl?.replace(/\/+$/, '');
    if (base) {
        return `${base}/admin`;
    }
    try {
        const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
        const info = (await api.getWebhookInfo().then(r => r.json())) as { result?: { url?: string } };
        const url = info?.result?.url;
        if (url?.startsWith('https://')) {
            return `${new URL(url).origin}/admin`;
        }
    } catch {
        // ignore, fall through to null
    }
    return null;
}

async function sendAdminPanel(command: string, message: Telegram.Message, context: WorkerContext): Promise<Response> {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    const url = await adminPanelUrl(context);
    if (!url) {
        return sender.sendPlainText('ERROR: admin panel url not found, bind the webhook with /init first');
    }
    const params: Telegram.SendMessageParams = {
        chat_id: message.chat.id,
        text: `Open admin panel (${command})`,
        reply_markup: {
            inline_keyboard: [[{ text: '⚙️ Settings', web_app: { url } }]],
        },
    };
    return sender.sendRawMessage(params);
}

/** 打开管理后台(Telegram Mini App) */
export class AdminCommandHandler implements CommandHandler {
    command = '/admin';
    scopes = ['all_private_chats'];
    needAuth = TELEGRAM_AUTH_CHECKER.default;
    privileged = true;
    handle = (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        return sendAdminPanel(this.command, message, context);
    };
}

export class VersionCommandHandler implements CommandHandler {
    command = '/version';
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        const current = {
            ts: ENV.BUILD_TIMESTAMP,
            sha: ENV.BUILD_VERSION,
        };
        try {
            const info = `https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/${ENV.CONFIG.settings.updateBranch}/dist/buildinfo.json`;
            const online = (await fetch(info).then(r => r.json())) as { ts: number; sha: string };
            const timeFormat = (ts: number): string => {
                return new Date(ts * 1000).toLocaleString('en-US', {});
            };
            if (current.ts < online.ts) {
                const text = `New version detected: ${online.sha}(${timeFormat(online.ts)})\nCurrent version: ${current.sha}(${timeFormat(current.ts)})`;
                return sender.sendPlainText(text);
            }
            return sender.sendPlainText(`Current version: ${current.sha}(${timeFormat(current.ts)}) is up to date`);
        } catch (e) {
            return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
        }
    };
}

/** 只读展示当前配置摘要 */
export class SystemCommandHandler implements CommandHandler {
    command = '/system';
    scopes = ['all_private_chats', 'all_chat_administrators'];
    needAuth = TELEGRAM_AUTH_CHECKER.default;
    privileged = true;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        const config = ENV.CONFIG;
        const chatAgent = loadChatLLM(config);
        const imageAgent = loadImageGen(config);
        const agent = {
            chat: agentSummary(chatAgent),
            image: agentSummary(imageAgent),
            chatProviders: config.chatProviders.filter(p => p.enabled).map(p => p.id),
            imageProviders: config.imageProviders.filter(p => p.enabled).map(p => p.id),
        };
        let msg = `<strong>AGENT</strong><pre>${escapeHtml(JSON.stringify(agent, null, 2))}</pre>`;
        if (config.settings.devMode) {
            const baseUrl = config.settings.publicBaseUrl;
            msg += `\n\n<strong>ADMIN</strong><pre>${escapeHtml(JSON.stringify({ publicBaseUrl: baseUrl || '(unset)' }, null, 2))}</pre>`;
        }
        return sender.sendRichText(msg, 'HTML');
    };
}

export class RedoCommandHandler implements CommandHandler {
    command = '/redo';
    scopes = ['all_private_chats', 'all_group_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const mf = (history: Message[], message: Message | null): HistoryModifierResult => {
            let nextMessage = message;
            if (!(history && Array.isArray(history) && history.length > 0)) {
                throw new Error('History not found');
            }
            const historyCopy = structuredClone(history);
            while (true) {
                const data = historyCopy.pop();
                if (data === undefined || data === null) {
                    break;
                } else if (data.role === 'user') {
                    nextMessage = data;
                    break;
                }
            }
            if (subcommand) {
                nextMessage = {
                    role: 'user',
                    content: subcommand,
                };
            }
            if (nextMessage === null) {
                throw new Error('Redo message not found');
            }
            return { history: historyCopy, message: nextMessage };
        };
        return chatWithMessage(message, null, context, mf);
    };
}

/**
 * /models:两步 InlineKeyboard —— 先分页选 provider(`mp:{page}`),
 * 再分页选模型(`ml:{i}:{page}` / `m:{i}:{j}` 切换),由 CallbackQueryHandler 处理。
 */
export class ModelsCommandHandler implements CommandHandler {
    command = '/models';
    scopes = ['all_private_chats', 'all_group_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        const current = currentProvider('chat');
        if (!current) {
            return sender.sendPlainText('ERROR: No models. Add a provider in the admin panel first.');
        }
        return sender.sendRawMessage({
            chat_id: message.chat.id,
            text: `${agentSummary(loadChatLLM(ENV.CONFIG))}\n${ENV.I18N.callback_query.select_provider}`,
            reply_markup: providerKeyboard('chat', providerPage('chat', current.index), current.id),
        });
    };
}

export class EchoCommandHandler implements CommandHandler {
    command = '/echo';
    handle = (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        let msg = '<pre>';
        msg += escapeHtml(JSON.stringify({ message }, null, 2));
        msg += '</pre>';
        return MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message).sendRichText(msg, 'HTML');
    };
}
