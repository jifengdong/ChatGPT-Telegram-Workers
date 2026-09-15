import type { RequestTemplate } from '@chatgpt-telegram-workers/plugins';
import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../context';
import type { CommandHandler } from './types';
import { ENV, type ConfigPatchRole, assertPatchAllowedFor } from '@chatgpt-telegram-workers/config';
import { executeRequest, formatInput } from '@chatgpt-telegram-workers/plugins';
import { MessageSender } from '@chatgpt-telegram-workers/telegram';
import { isGroupChat } from '../auth';
import { loadChatRoleWithContext } from './auth';
import { applyConfigShortcut, isConfigShortcutValue, parseConfigShortcut } from './env-shortcut';
import { MENU_COMMANDS } from './menu-commands';
import {
    AdminCommandHandler,
    EchoCommandHandler,
    HelpCommandHandler,
    ImgCommandHandler,
    ModelsCommandHandler,
    NewCommandHandler,
    RedoCommandHandler,
    StartCommandHandler,
    SystemCommandHandler,
    VersionCommandHandler,
} from './system';

/**
 * `/setenv` / `/setenvs` / `/delenv`:把 subcommand 还原成完整表达式交给 handleConfigShortcut。
 * 这三个命令会写全局配置,权限由 resolveConfigShortcutRole 判定(ADMIN_ID 或群管理员);
 * 群管理员仅能修改默认 provider/model 等展示类键,其余键由 assertPatchAllowedFor 拦截。
 */
class ConfigShortcutCommandHandler implements CommandHandler {
    command: string;
    scopes = ['all_chat_administrators'];
    privileged = true;
    constructor(command: string) {
        this.command = command;
    }
    handle = (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        return handleConfigShortcut(message, `${this.command} ${subcommand}`.trim(), context);
    };
}

export class SetEnvCommandHandler extends ConfigShortcutCommandHandler {
    constructor() {
        super('/setenv');
    }
}

export class SetEnvsCommandHandler extends ConfigShortcutCommandHandler {
    constructor() {
        super('/setenvs');
    }
}

export class DelEnvCommandHandler extends ConfigShortcutCommandHandler {
    constructor() {
        super('/delenv');
    }
}

const SYSTEM_COMMANDS: CommandHandler[] = [
    new StartCommandHandler(),
    new NewCommandHandler(),
    new RedoCommandHandler(),
    new ImgCommandHandler(),
    new AdminCommandHandler(),
    new VersionCommandHandler(),
    new SystemCommandHandler(),
    new ModelsCommandHandler(),
    new HelpCommandHandler(),
    new SetEnvCommandHandler(),
    new SetEnvsCommandHandler(),
    new DelEnvCommandHandler(),
];

async function handleSystemCommand(
    message: Telegram.Message,
    raw: string,
    command: CommandHandler,
    context: WorkerContext,
): Promise<Response> {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    try {
        const chatId = message.chat.id;
        const speakerId = message.from?.id || chatId;
        const chatType = message.chat.type;
        // 私聊时只有特权命令(如 /admin、配置快捷指令)限制为 ADMIN_ID,
        // 普通命令(白名单用户可用)不在此拦截
        const isPrivate = chatType === 'private';
        if (command.privileged && isPrivate && (!ENV.ADMIN_ID || `${speakerId}` !== ENV.ADMIN_ID)) {
            return sender.sendPlainText('ERROR: Permission denied');
        }
        if (command.needAuth) {
            const roleList = command.needAuth(chatType);
            if (roleList) {
                const chatRole = await loadChatRoleWithContext(chatId, speakerId, context);
                if (chatRole === null) {
                    return sender.sendPlainText('ERROR: Get chat role failed');
                }
                if (!roleList.includes(chatRole)) {
                    return sender.sendPlainText(`ERROR: Permission denied, need ${roleList.join(' or ')}`);
                }
            }
        }
    } catch (e) {
        return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
    }
    const subcommand = raw.substring(command.command.length).trim();
    try {
        return await command.handle(message, subcommand, context);
    } catch (e) {
        return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
    }
}

async function handlePluginCommand(
    message: Telegram.Message,
    command: string,
    description: string,
    raw: string,
    template: RequestTemplate,
    env: Record<string, string>,
    context: WorkerContext,
): Promise<Response> {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    try {
        const subcommand = raw.substring(command.length).trim();
        if (template.input?.required && !subcommand) {
            throw new Error('Missing required input');
        }
        const DATA = formatInput(subcommand, template.input?.type);
        const { type, content } = await executeRequest(template, {
            DATA,
            ENV: env,
        });
        switch (type) {
            case 'image':
                return sender.sendPhoto(content);
            case 'html':
                return sender.sendRichText(content, 'HTML');
            case 'markdown':
                return sender.sendRichText(content, 'Markdown');
            case 'text':
            default:
                return sender.sendPlainText(content);
        }
    } catch (e) {
        return sender.sendPlainText(`ERROR: ${(e as Error).message}${description ? `\n${description}` : ''}`);
    }
}

/**
 * 解析快捷指令写入者角色:
 * - ADMIN_ID 本人 → operator(可写全部键)
 * - 群管理员/群主 → group_admin(仅可写默认 provider/model 等展示类键)
 * - 其它 → null(拒绝)
 */
async function resolveConfigShortcutRole(
    message: Telegram.Message,
    speakerId: number,
    context: WorkerContext,
): Promise<ConfigPatchRole | null> {
    if (ENV.ADMIN_ID && `${speakerId}` === ENV.ADMIN_ID) {
        return 'operator';
    }
    if (!isGroupChat(message.chat.type)) {
        return null;
    }
    const role = await loadChatRoleWithContext(message.chat.id, speakerId, context);
    return role === 'administrator' || role === 'creator' ? 'group_admin' : null;
}

async function handleConfigShortcut(
    message: Telegram.Message,
    value: string,
    context: WorkerContext,
): Promise<Response> {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    const speakerId = message.from?.id || message.chat.id;
    let shortcut;
    try {
        shortcut = parseConfigShortcut(value);
    } catch (e) {
        return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
    }
    if (shortcut === null) {
        return sender.sendPlainText(`ERROR: Invalid config shortcut: ${value}`);
    }
    const role = await resolveConfigShortcutRole(message, speakerId, context);
    if (role === null) {
        return sender.sendPlainText('ERROR: Permission denied');
    }
    try {
        const current = await ENV.loadConfig(true);
        // 群管理员只能改默认 provider/model 等展示类键;凭据/传输/访问控制/指令键仅 operator 可写
        assertPatchAllowedFor(role, shortcut.patch, current);
        const next = applyConfigShortcut(current, shortcut);
        await ENV.getConfigStore().save(next);
        await ENV.loadConfig(true);
        return sender.sendPlainText(`Update config success: ${shortcut.summary}`);
    } catch (e) {
        return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
    }
}

/**
 * `/setenv` / `/setenvs` / `/delenv`:把 subcommand 还原成完整表达式交给 handleConfigShortcut。
 * 这三个命令会写全局配置,权限由 resolveConfigShortcutRole 判定(ADMIN_ID 或群管理员);
 * 群管理员仅能修改默认 provider/model 等展示类键,其余键由 assertPatchAllowedFor 拦截。
 */
export async function handleCommandMessage(
    message: Telegram.Message,
    context: WorkerContext,
): Promise<Response | null> {
    let text = (message.text || message.caption || '').trim();

    // 自定义命令:修改全局配置(快捷指令)或替换为另一段命令文本
    for (const custom of ENV.CONFIG.customCommands) {
        if (custom.enabled && text === custom.command) {
            if (isConfigShortcutValue(custom.value)) {
                return await handleConfigShortcut(message, custom.value, context);
            }
            text = custom.value;
            break;
        }
    }

    if (ENV.CONFIG.settings.devMode) {
        // 插入调试命令(仅在请求内,避免污染全局注册表)
        for (const cmd of [...SYSTEM_COMMANDS, new EchoCommandHandler()]) {
            if (text === cmd.command || text.startsWith(`${cmd.command} `)) {
                return await handleSystemCommand(message, text, cmd, context);
            }
        }
    }

    // 插件命令
    for (const plugin of ENV.CONFIG.plugins) {
        if (!plugin.enabled) {
            continue;
        }
        const key = plugin.command;
        if (text === key || text.startsWith(`${key} `)) {
            try {
                let template = (plugin.template || '').trim();
                if (template.startsWith('http')) {
                    template = await fetch(template).then(r => r.text());
                }
                return await handlePluginCommand(
                    message,
                    key,
                    plugin.description,
                    text,
                    JSON.parse(template),
                    plugin.env,
                    context,
                );
            } catch (e) {
                return MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message).sendPlainText(
                    `ERROR: invalid plugin template: ${(e as Error).message}`,
                );
            }
        }
    }

    // 系统命令
    for (const cmd of SYSTEM_COMMANDS) {
        if (text === cmd.command || text.startsWith(`${cmd.command} `)) {
            return await handleSystemCommand(message, text, cmd, context);
        }
    }
    return null;
}

export function commandsBindScope(): Record<string, Telegram.SetMyCommandsParams> {
    const scopeCommandMap: Record<string, Telegram.BotCommand[]> = {
        all_private_chats: [],
        all_group_chats: [],
        all_chat_administrators: [],
    };
    for (const cmd of SYSTEM_COMMANDS) {
        // 菜单只保留白名单内的系统命令,其余命令仍可输入触发(/start、/version 等)
        if (!MENU_COMMANDS.includes(cmd.command)) {
            continue;
        }
        if (ENV.CONFIG.settings.hideCommandButtons.includes(cmd.command)) {
            continue;
        }
        if (cmd.scopes) {
            for (const scope of cmd.scopes) {
                if (!scopeCommandMap[scope]) {
                    scopeCommandMap[scope] = [];
                }
                const desc = ENV.I18N.command.help[cmd.command.substring(1)] || '';
                if (desc) {
                    scopeCommandMap[scope].push({
                        command: cmd.command,
                        description: desc,
                    });
                }
            }
        }
    }
    const extras = [
        ...ENV.CONFIG.customCommands
            .filter(c => c.enabled)
            .map(c => ({ command: c.command, description: c.description, scope: c.scope })),
        ...ENV.CONFIG.plugins
            .filter(p => p.enabled)
            .map(p => ({ command: p.command, description: p.description, scope: p.scope })),
    ];
    for (const config of extras) {
        if (!config.scope?.length) {
            continue;
        }
        for (const scope of config.scope) {
            if (!scopeCommandMap[scope]) {
                scopeCommandMap[scope] = [];
            }
            scopeCommandMap[scope].push({
                command: config.command,
                description: config.description || '',
            });
        }
    }
    const result: Record<string, Telegram.SetMyCommandsParams> = {};
    for (const scope in scopeCommandMap) {
        result[scope] = {
            commands: scopeCommandMap[scope],
            scope: {
                type: scope,
            },
        };
    }
    return result;
}

export function commandsDocument(): { description: string; command: string }[] {
    return SYSTEM_COMMANDS.map(command => {
        return {
            command: command.command,
            description: ENV.I18N.command.help[command.command.substring(1)] || '',
        };
    }).filter(item => item.description !== '' && MENU_COMMANDS.includes(item.command));
}
