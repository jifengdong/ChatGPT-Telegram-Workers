import type { AppConfig } from '@chatgpt-telegram-workers/config';
import { DEFAULT_SETTINGS, mergeConfigPatch, patchFromPath } from '@chatgpt-telegram-workers/config';

/** 自定义命令 value 中携带的配置修改表达式 */
export interface ConfigShortcut {
    patch: Record<string, unknown>;
    summary: string;
}

function parseSetEnv(arg: string): ConfigShortcut {
    const index = arg.indexOf('=');
    if (index <= 0) {
        throw new Error('Format: /setenv KEY=VALUE');
    }
    const key = arg.slice(0, index).trim();
    const value = arg.slice(index + 1);
    return { patch: patchFromPath(key, value), summary: `${key}=${value}` };
}

function parseSetEnvs(arg: string): ConfigShortcut {
    let data: unknown;
    try {
        data = JSON.parse(arg);
    } catch {
        throw new Error('Format: /setenvs {"KEY":"VALUE"}');
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Format: /setenvs {"KEY":"VALUE"}');
    }
    return { patch: data as Record<string, unknown>, summary: JSON.stringify(data) };
}

function parseDelEnv(arg: string): ConfigShortcut {
    const key = arg.trim();
    const parts = key.split('.');
    if (parts[0] === 'settings' && parts.length === 2 && parts[1] in DEFAULT_SETTINGS) {
        const defaults = DEFAULT_SETTINGS as unknown as Record<string, unknown>;
        return {
            patch: { settings: { [parts[1]]: defaults[parts[1]] } },
            summary: `reset ${key}`,
        };
    }
    if (key === 'defaultChatProvider' || key === 'defaultImageProvider') {
        return { patch: { [key]: null }, summary: `reset ${key}` };
    }
    throw new Error(`Unsupported key: ${key}`);
}

/** 判断 value 是否看起来是配置修改表达式(不校验内容是否合法) */
export function isConfigShortcutValue(value: string): boolean {
    const text = value.trim();
    return text.startsWith('/setenv') || text.startsWith('/delenv') || text.startsWith('{');
}

/**
 * 解析自定义命令 value 中的配置修改表达式。
 * 支持 `/setenv KEY=VALUE`、`/setenvs {json}`、`/delenv KEY`,以及裸 JSON 补丁对象;
 * 不是配置表达式时返回 null(按普通文本别名处理)。
 */
export function parseConfigShortcut(value: string): ConfigShortcut | null {
    const text = value.trim();
    if (text.startsWith('/setenvs')) {
        return parseSetEnvs(text.slice('/setenvs'.length).trim());
    }
    if (text.startsWith('/setenv')) {
        return parseSetEnv(text.slice('/setenv'.length).trim());
    }
    if (text.startsWith('/delenv')) {
        return parseDelEnv(text.slice('/delenv'.length).trim());
    }
    if (text.startsWith('{')) {
        return parseSetEnvs(text);
    }
    return null;
}

/** 把补丁合并进当前全局配置 */
export function applyConfigShortcut(current: AppConfig, shortcut: ConfigShortcut): AppConfig {
    return mergeConfigPatch(current, shortcut.patch);
}
