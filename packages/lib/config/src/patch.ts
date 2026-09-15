import type { AppConfig } from './types';
import { DEFAULT_SETTINGS } from './defaults';
import { normalizeConfig } from './store';

/** 补丁中按 id 合并的列表字段 */
const LIST_KEYS = ['chatProviders', 'imageProviders', 'plugins', 'customCommands'];

/** 允许补丁覆盖的顶层字段 */
const TOP_LEVEL_KEYS = new Set(['defaultChatProvider', 'defaultImageProvider', 'settings', ...LIST_KEYS]);

/** 写入者角色:operator 仅 ADMIN_ID;group_admin 为群管理员/群主 */
export type ConfigPatchRole = 'operator' | 'group_admin';

/**
 * 群管理员可写的 settings 白名单:仅限展示/生成类,不影响出站目标、凭据、
 * 访问控制或模型指令。白名单之外(含新增字段)一律视为 operator-only,
 * 避免用「黑名单」漏掉后续新增的危险键(见安全审核 finding 1 / 7)。
 */
export const GROUP_ADMIN_SETTINGS_KEYS = new Set<string>([
    'language',
    'defaultParseMode',
    'streamMode',
    'chatCompleteApiTimeout',
    'maxOutputTokens',
    'telegramMinStreamInterval',
    'telegramPhotoSizeOffset',
    'modelListColumns',
    'autoTrimHistory',
    'maxHistoryLength',
    'maxTokenLength',
    'showReplyButton',
    'extraMessageContext',
    'extraMessageMediaCompatible',
    'hideCommandButtons',
]);

/**
 * 群管理员可改的 provider 字段白名单:仅模型选择与展示名。
 * protocol/enabled/apiKey/baseUrl/options/extraParams 等会改变出站协议、
 * 目标、凭据或请求体的字段一律 operator-only。
 */
export const GROUP_ADMIN_PROVIDER_FIELDS = new Set<string>(['model', 'models', 'label']);

/** 群管理员可写的顶层键:默认 provider/model 切换 + 受限的 settings/provider 字段;
 *  plugins/customCommands 等不在白名单内的顶层键一律拒绝 */
const GROUP_ADMIN_TOP_LEVEL_KEYS = new Set([
    'defaultChatProvider',
    'defaultImageProvider',
    'settings',
    'chatProviders',
    'imageProviders',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** 递归深合并:纯对象逐键合并,数组/标量整体替换 */
function deepMerge(base: unknown, incoming: unknown): unknown {
    if (!isRecord(base) || !isRecord(incoming)) {
        return incoming;
    }
    const result: Record<string, unknown> = { ...base };
    for (const [key, value] of Object.entries(incoming)) {
        result[key] = isRecord(value) && isRecord(result[key]) ? deepMerge(result[key], value) : value;
    }
    return result;
}

function mergeById(base: { id?: string }[], incoming: unknown): { id?: string }[] {
    if (!Array.isArray(incoming)) {
        throw new Error('Expected an array');
    }
    const result = [...base];
    for (const raw of incoming) {
        if (!isRecord(raw)) {
            continue;
        }
        const id = typeof raw.id === 'string' ? raw.id : '';
        const index = id ? result.findIndex(item => item.id === id) : -1;
        if (index >= 0) {
            // 深合并,避免部分 patch 抹掉 provider.options / plugin.env 的其它键
            result[index] = deepMerge(result[index], raw) as { id?: string };
        } else {
            result.push(raw);
        }
    }
    return result;
}

/**
 * 校验补丁是否允许由该角色写入:
 * - operator(ADMIN_ID)不受限;
 * - group_admin 只能改默认 provider/model 与展示类 settings。
 * 不通过时抛错,由调用方转成给用户的提示。
 */
export function assertPatchAllowedFor(role: ConfigPatchRole, patch: Record<string, unknown>, base?: AppConfig): void {
    if (role === 'operator') {
        return;
    }
    for (const [key, value] of Object.entries(patch)) {
        if (key === 'defaultChatProvider' || key === 'defaultImageProvider') {
            continue;
        }
        // 白名单制:未显式允许的顶层键(settings / plugins / customCommands 等)一律拒绝
        if (!GROUP_ADMIN_TOP_LEVEL_KEYS.has(key)) {
            throw new Error(`Config key not permitted for group admins: ${key}`);
        }
        if (key === 'settings') {
            if (!isRecord(value)) {
                throw new Error('settings must be an object');
            }
            for (const settingKey of Object.keys(value)) {
                if (!GROUP_ADMIN_SETTINGS_KEYS.has(settingKey)) {
                    throw new Error(`Setting not permitted for group admins: ${settingKey}`);
                }
            }
        } else if (key === 'chatProviders' || key === 'imageProviders') {
            if (!Array.isArray(value)) {
                throw new Error(`${key} must be an array`);
            }
            const baseList = ((base?.[key] ?? []) as { id?: string }[]).map(p => p.id);
            for (const item of value) {
                if (!isRecord(item)) {
                    throw new Error(`${key} entries must be objects`);
                }
                // 只允许改已有 provider,禁止群管理员新增 provider(可注入无凭据可用/可禁用现有 provider)
                const id = typeof item.id === 'string' ? item.id : '';
                if (!id || !baseList.includes(id)) {
                    throw new Error(`Adding provider entries is not permitted for group admins: ${key}`);
                }
                for (const field of Object.keys(item)) {
                    if (field === 'id') {
                        continue;
                    }
                    if (!GROUP_ADMIN_PROVIDER_FIELDS.has(field)) {
                        throw new Error(`Provider field not permitted for group admins: ${field}`);
                    }
                }
            }
        }
    }
}

/**
 * 把补丁合并进配置,用于管理页快捷指令修改全局配置:
 * - `settings` 按键浅合并;
 * - 提供商/插件/自定义命令列表按 `id` 合并(新 id 追加,嵌套对象深合并);
 * - 其余顶层字段直接覆盖。
 * 未知的顶层/settings 键会抛错,避免“看似成功实则丢弃”。
 */
export function mergeConfigPatch(base: AppConfig, patch: Record<string, unknown>): AppConfig {
    const merged: Record<string, unknown> = { ...structuredClone(base) };
    for (const [key, value] of Object.entries(patch)) {
        if (!TOP_LEVEL_KEYS.has(key)) {
            throw new Error(`Unknown config key: ${key}`);
        }
        if (key === 'settings') {
            if (!isRecord(value)) {
                throw new Error('settings must be an object');
            }
            for (const settingKey of Object.keys(value)) {
                if (!Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, settingKey)) {
                    throw new Error(`Unknown setting: ${settingKey}`);
                }
            }
            merged.settings = { ...(merged.settings as Record<string, unknown>), ...value };
        } else if (LIST_KEYS.includes(key)) {
            merged[key] = mergeById((merged[key] as { id?: string }[]) || [], value);
        } else {
            merged[key] = value;
        }
    }
    return normalizeConfig(merged);
}

/**
 * 把点分路径展开成嵌套补丁,例如:
 * - `settings.systemInitMessage` → `{settings:{systemInitMessage:...}}`
 * - `defaultChatProvider` → `{defaultChatProvider:...}`
 * - `chatProviders.openai.model` → `{chatProviders:[{id:'openai',model:...}]}`
 */
export function patchFromPath(path: string, value: unknown): Record<string, unknown> {
    const parts = path
        .split('.')
        .map(part => part.trim())
        .filter(Boolean);
    if (parts.length === 0) {
        throw new Error('Empty key');
    }

    if (parts[0] === 'chatProviders' || parts[0] === 'imageProviders') {
        if (parts.length < 3) {
            throw new Error(`Provider key needs <list>.<id>.<field>: ${path}`);
        }
        const item: Record<string, unknown> = { id: parts[1] };
        let node = item;
        for (let i = 2; i < parts.length - 1; i++) {
            const next: Record<string, unknown> = {};
            node[parts[i]] = next;
            node = next;
        }
        node[parts[parts.length - 1]] = value;
        return { [parts[0]]: [item] };
    }

    const root: Record<string, unknown> = {};
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
        const next: Record<string, unknown> = {};
        node[parts[i]] = next;
        node = next;
    }
    node[parts[parts.length - 1]] = value;
    return root;
}
