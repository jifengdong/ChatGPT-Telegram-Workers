import type { ChatAgent, ImageAgent } from '@chatgpt-telegram-workers/agent';
import type { ChatProviderConfig, ImageProviderConfig } from '@chatgpt-telegram-workers/config';
import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../context';
import type { MessageHandler, UpdateHandler } from './types';
import { loadChatLLM, loadImageGen } from '@chatgpt-telegram-workers/agent';
import { ENV } from '@chatgpt-telegram-workers/config';
import { createTelegramBotAPI, MessageSender } from '@chatgpt-telegram-workers/telegram';
import { isGroupChat } from '../auth';
import { loadChatRoleWithContext } from '../command/auth';
import { chatWithMessage, extractUserMessageItem } from '../chat';
import { handleCommandMessage } from '../command';

/**
 * Telegram 服务消息字段:入群/退群/改标题/置顶/建群/话题/视频聊天等。
 * 这类消息由系统产生、不含用户输入,必须在任何会回复的中间件之前拦截,
 * 否则非白名单群收到入群消息时会被当成普通消息回复。
 */
const SERVICE_MESSAGE_FIELDS = [
    'new_chat_members',
    'left_chat_member',
    'new_chat_title',
    'new_chat_photo',
    'delete_chat_photo',
    'group_chat_created',
    'supergroup_chat_created',
    'channel_chat_created',
    'message_auto_delete_timer_changed',
    'migrate_to_chat_id',
    'migrate_from_chat_id',
    'pinned_message',
    'connected_website',
    'write_access_allowed',
    'passport_data',
    'proximity_alert_triggered',
    'boost_added',
    'chat_background_set',
    'successful_payment',
    'refunded_payment',
    'users_shared',
    'chat_shared',
    'gift',
    'unique_gift',
    'gift_upgrade_sent',
    'forum_topic_created',
    'forum_topic_edited',
    'forum_topic_closed',
    'forum_topic_reopened',
    'general_forum_topic_hidden',
    'general_forum_topic_unhidden',
    'giveaway',
    'giveaway_created',
    'giveaway_winners',
    'giveaway_completed',
    'video_chat_scheduled',
    'video_chat_started',
    'video_chat_ended',
    'video_chat_participants_invited',
    'web_app_data',
] as const;

export function isServiceMessage(message: Telegram.Message): boolean {
    const record = message as unknown as Record<string, unknown>;
    return SERVICE_MESSAGE_FIELDS.some(field => record[field] !== undefined);
}

/** 忽略服务消息:不回复、不进入命令/聊天流程 */
export class ServiceMessageFilter implements UpdateHandler {
    handle = async (update: Telegram.Update, _context: WorkerContext): Promise<Response | null> => {
        if (update.message && isServiceMessage(update.message)) {
            throw new Error('Ignore service message');
        }
        return null;
    };
}

export class EnvChecker implements UpdateHandler {
    handle = async (update: Telegram.Update, context: WorkerContext): Promise<Response | null> => {
        if (!ENV.DATABASE) {
            return MessageSender.fromUpdate(context.SHARE_CONTEXT.botToken, update).sendPlainText('DATABASE Not Set');
        }
        return null;
    };
}

export class AccessFilter implements UpdateHandler {
    handle = async (update: Telegram.Update, context: WorkerContext): Promise<Response | null> => {
        const settings = ENV.CONFIG.settings;
        if (settings.allowAllUsers) {
            return null;
        }
        const sender = MessageSender.fromUpdate(context.SHARE_CONTEXT.botToken, update);

        let chatType = '';
        let chatID = 0;
        let userID = 0;

        if (update.message) {
            chatType = update.message.chat.type;
            chatID = update.message.chat.id;
            userID = update.message.from?.id || 0;
        } else if (update.callback_query?.message) {
            chatType = update.callback_query.message.chat.type;
            chatID = update.callback_query.message.chat.id;
            userID = update.callback_query.from.id;
        }

        if (!chatType || !chatID) {
            throw new Error('Invalid chat type or chat id');
        }
        const text = `You are not in the white list, please contact the administrator to add you to the white list. Your chat_id: ${chatID}`;
        const allowedUsers = new Set([...settings.allowedUserIds, ...(ENV.ADMIN_ID ? [ENV.ADMIN_ID] : [])]);

        // 私聊
        if (chatType === 'private') {
            if (allowedUsers.has(`${userID}`) || allowedUsers.has(`${chatID}`)) {
                return null;
            }
            return sender.sendPlainText(text);
        }

        // 群组
        if (isGroupChat(chatType)) {
            if (!settings.groupChatBotEnable) {
                throw new Error('Not support');
            }
            if (!settings.allowedGroupIds.includes(`${chatID}`)) {
                return sender.sendPlainText(text);
            }
            return null;
        }

        return sender.sendPlainText(`Not support chat type: ${chatType}`);
    };
}

export class SaveLastMessage implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (!ENV.CONFIG.settings.debugMode) {
            return null;
        }
        const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
        await ENV.DATABASE.put(lastMessageKey, JSON.stringify(message), { expirationTtl: 3600 });
        return null;
    };
}

/**
 * InlineKeyboard 回调处理(两步:先选 provider,再选模型,两步各自分页):
 * - `mp:{page}` / `ip:{page}`          展示聊天/图片 provider 列表第 page 页
 * - `ml:{i}:{page}` / `il:{i}:{page}`  展示 provider i 的模型列表第 page 页
 * - `m:{i}:{j}` / `im:{i}:{j}`         切换聊天/图片模型(default*Provider + provider.model)
 * 必须注册在 Update2MessageHandler 之前,否则 callback_query 会被当作无效消息丢弃。
 * 切换写入全局配置,因此群聊仅限管理员。
 */
export class CallbackQueryHandler implements UpdateHandler {
    handle = async (update: Telegram.Update, context: WorkerContext): Promise<Response | null> => {
        const cb = update.callback_query;
        if (!cb) {
            return null;
        }
        const token = context.SHARE_CONTEXT.botToken;
        const api = createTelegramBotAPI(token);
        const answer = (text?: string): Promise<unknown> =>
            api
                .answerCallbackQuery({ callback_query_id: cb.id, text: text || undefined })
                .then(r => r.json())
                .catch(() => undefined);
        const ok = (): Response => new Response('OK', { status: 200 });

        try {
            const parts = (cb.data || '').split(':');
            if (!['m', 'mp', 'im', 'ip', 'ml', 'il'].includes(parts[0])) {
                await answer();
                return ok();
            }
            const kind: ModelKind = ['m', 'mp', 'ml'].includes(parts[0]) ? 'chat' : 'image';

            // 群组内切换模型是全局变更,仅限管理员;私聊白名单已由 AccessFilter 把关
            if (cb.message && isGroupChat(cb.message.chat.type)) {
                const role = await loadChatRoleWithContext(cb.message.chat.id, cb.from.id, context);
                if (!role || !['administrator', 'creator'].includes(role)) {
                    await answer('No permission');
                    return ok();
                }
            }

            const providers = kind === 'image' ? ENV.CONFIG.imageProviders : ENV.CONFIG.chatProviders;
            const edit = (text: string, keyboard: Telegram.InlineKeyboardMarkup): Promise<unknown> =>
                cb.message
                    ? api
                          .editMessageText({
                              chat_id: cb.message.chat.id,
                              message_id: cb.message.message_id,
                              text,
                              reply_markup: keyboard,
                          })
                          .then(r => r.json())
                          .catch(() => undefined)
                    : Promise.resolve(undefined);

            // 第一步:provider 列表分页,不改默认值
            if (parts[0] === 'mp' || parts[0] === 'ip') {
                const agent = kind === 'image' ? loadImageGen(ENV.CONFIG) : loadChatLLM(ENV.CONFIG);
                await edit(
                    `${agentSummary(agent)}\n${ENV.I18N.callback_query.select_provider}`,
                    providerKeyboard(kind, Number(parts[1]) || 0, currentProvider(kind)?.id ?? null),
                );
                return ok();
            }

            const providerIdx = Number(parts[1]);
            const provider = providers[providerIdx];
            if (!provider) {
                await answer('Model list changed, send the command again');
                return ok();
            }

            // 第二步:该 provider 的模型列表分页,不改默认值
            if (parts[0] === 'ml' || parts[0] === 'il') {
                const entry = enabledProviders(kind).find(p => p.index === providerIdx);
                if (!entry) {
                    await answer('No models for this provider');
                    return ok();
                }
                await edit(
                    `${entry.label}\n${ENV.I18N.callback_query.select_model}`,
                    modelKeyboard(kind, providerIdx, entry.model, entry.models, Number(parts[2]) || 0),
                );
                return ok();
            }

            const modelIdx = Number(parts[2]);
            const model = provider.models[modelIdx];
            if (!model) {
                await answer('Model list changed, send the command again');
                return ok();
            }
            // 派生新配置再保存,避免先原地改 ENV.CONFIG(save 失败会留下脏对象,并发请求也会交错)
            const next = structuredClone(ENV.CONFIG);
            const nextProvider = (kind === 'image' ? next.imageProviders : next.chatProviders)[providerIdx] ?? provider;
            nextProvider.model = model;
            if (kind === 'image') {
                next.defaultImageProvider = nextProvider.id;
            } else {
                next.defaultChatProvider = nextProvider.id;
            }
            ENV.CONFIG = await ENV.getConfigStore().save(next);
            await answer(model);
            await edit(
                `${ENV.I18N.callback_query.change_model} ${provider.label} / ${model}`,
                modelKeyboard(kind, providerIdx, model, provider.models, Math.floor(modelIdx / MODEL_PAGE_SIZE)),
            );
        } catch (e) {
            console.error('callback query error:', e);
            await answer(`ERROR: ${(e as Error).message}`).catch(() => undefined);
        }
        return new Response('OK', { status: 200 });
    };
}

export type ModelKind = 'chat' | 'image';

/** provider 列表每页容量;<= 该值时不显示翻页行 */
export const PROVIDER_PAGE_SIZE = 4;
/** 模型列表每页容量;<= 该值时不显示翻页行 */
export const MODEL_PAGE_SIZE = 6;

/** 可用 provider(已启用且有模型)及其在原数组中的下标 */
export interface ProviderEntry {
    index: number;
    id: string;
    label: string;
    model: string;
    models: string[];
}

export function agentSummary(agent: ChatAgent | ImageAgent | null): string {
    return agent ? `${agent.label} | ${agent.model}` : 'Nan';
}

/** 可用 provider 列表,保留原数组下标以便回调定位 */
export function enabledProviders(kind: ModelKind): ProviderEntry[] {
    const providers: (ChatProviderConfig | ImageProviderConfig)[] =
        kind === 'image' ? ENV.CONFIG.imageProviders : ENV.CONFIG.chatProviders;
    const entries: ProviderEntry[] = [];
    providers.forEach((p, index) => {
        if (p.enabled && p.models.length > 0) {
            entries.push({ index, id: p.id, label: p.label, model: p.model, models: p.models });
        }
    });
    return entries;
}

/** 当前生效的 provider:默认项优先,否则取首个可用项 */
export function currentProvider(kind: ModelKind): ProviderEntry | null {
    const providers = enabledProviders(kind);
    const defaultId = kind === 'image' ? ENV.CONFIG.defaultImageProvider : ENV.CONFIG.defaultChatProvider;
    return providers.find(p => p.id === defaultId) ?? providers[0] ?? null;
}

/** provider 原数组下标 → 它在可用列表中的页号 */
export function providerPage(kind: ModelKind, providerIdx: number): number {
    const pos = enabledProviders(kind).findIndex(p => p.index === providerIdx);
    return pos < 0 ? 0 : Math.floor(pos / PROVIDER_PAGE_SIZE);
}

function clampPage(page: number, total: number, pageSize: number): { page: number; totalPages: number } {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safe = Number.isFinite(page) ? Math.min(Math.max(0, Math.trunc(page)), totalPages - 1) : 0;
    return { page: safe, totalPages };
}

/** 翻页行:页数 <= 1 时不展示,首/末页省略不可用的箭头 */
function pageRow(page: number, totalPages: number, data: (page: number) => string): Telegram.InlineKeyboardButton[][] {
    if (totalPages <= 1) {
        return [];
    }
    const row: Telegram.InlineKeyboardButton[] = [];
    if (page > 0) {
        row.push({ text: '⬅️', callback_data: data(page - 1) });
    }
    // 页码仅作指示:callback_data 不在白名单内,点击会被静默忽略
    row.push({ text: `${page + 1}/${totalPages}`, callback_data: 'page' });
    if (page < totalPages - 1) {
        row.push({ text: '➡️', callback_data: data(page + 1) });
    }
    return [row];
}

/** provider 选择键盘:每行 1 个,每页 PROVIDER_PAGE_SIZE 个,超出才出现翻页行 */
export function providerKeyboard(
    kind: ModelKind,
    page: number,
    currentProviderId: string | null,
): Telegram.InlineKeyboardMarkup {
    const providers = enabledProviders(kind);
    const { page: safePage, totalPages } = clampPage(page, providers.length, PROVIDER_PAGE_SIZE);
    const providerPrefix = kind === 'image' ? 'il' : 'ml';
    const listPrefix = kind === 'image' ? 'ip' : 'mp';
    const start = safePage * PROVIDER_PAGE_SIZE;
    const inline_keyboard: Telegram.InlineKeyboardButton[][] = providers
        .slice(start, start + PROVIDER_PAGE_SIZE)
        .map(p => [
            {
                text: p.id === currentProviderId ? `✓ ${p.label}` : p.label,
                callback_data: `${providerPrefix}:${p.index}:0`,
            },
        ]);
    inline_keyboard.push(...pageRow(safePage, totalPages, p => `${listPrefix}:${p}`));
    return { inline_keyboard };
}

/** 模型选择键盘:每行 1 个,每页 MODEL_PAGE_SIZE 个,末尾附返回 provider 列表的按钮 */
export function modelKeyboard(
    kind: ModelKind,
    providerIdx: number,
    current: string,
    models: string[],
    page = 0,
): Telegram.InlineKeyboardMarkup {
    const prefix = kind === 'image' ? 'im' : 'm';
    const listPrefix = kind === 'image' ? 'il' : 'ml';
    const { page: safePage, totalPages } = clampPage(page, models.length, MODEL_PAGE_SIZE);
    const start = safePage * MODEL_PAGE_SIZE;
    const inline_keyboard: Telegram.InlineKeyboardButton[][] = models
        .slice(start, start + MODEL_PAGE_SIZE)
        .map((m, i) => [
            {
                text: m === current ? `✓ ${m}` : m,
                // 分页只影响展示,callback_data 始终带全局模型下标
                callback_data: `${prefix}:${providerIdx}:${start + i}`,
            },
        ]);
    inline_keyboard.push(...pageRow(safePage, totalPages, p => `${listPrefix}:${providerIdx}:${p}`));
    inline_keyboard.push([
        {
            text: `⬅️ ${ENV.I18N.callback_query.back}`,
            callback_data: `${kind === 'image' ? 'ip' : 'mp'}:${providerPage(kind, providerIdx)}`,
        },
    ]);
    return { inline_keyboard };
}

export class OldMessageFilter implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (!ENV.CONFIG.settings.safeMode) {
            return null;
        }
        let idList = [];
        try {
            idList = JSON.parse(await ENV.DATABASE.get(context.SHARE_CONTEXT.lastMessageKey).catch(() => '[]')) || [];
        } catch (e) {
            console.error(e);
        }
        // 保存最近的100条消息，如果存在则忽略，如果不存在则保存
        if (idList.includes(message.message_id)) {
            throw new Error('Ignore old message');
        } else {
            idList.push(message.message_id);
            if (idList.length > 100) {
                idList.shift();
            }
            await ENV.DATABASE.put(context.SHARE_CONTEXT.lastMessageKey, JSON.stringify(idList));
        }
        return null;
    };
}

export class MessageFilter implements MessageHandler {
    handle = async (message: Telegram.Message, _context: WorkerContext): Promise<Response | null> => {
        if (message.text) {
            return null; // 纯文本消息
        }
        if (message.caption) {
            return null; // 图文消息
        }
        if (message.photo) {
            return null; // 图片消息
        }
        throw new Error('Not supported message type');
    };
}

export class CommandHandler implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        if (message.text || message.caption) {
            return await handleCommandMessage(message, context);
        }
        // 非文本消息不作处理
        return null;
    };
}

export class ChatHandler implements MessageHandler {
    handle = async (message: Telegram.Message, context: WorkerContext): Promise<Response | null> => {
        const params = await extractUserMessageItem(message, context);
        return chatWithMessage(message, params, context, null);
    };
}
