import type { ErrorPayload } from './fetch';
import type { WorkersAIBinding, WorkersAIModelInfo } from './types';
import { workersCredentials } from './workers-ai';

export type ProviderKind = 'chat' | 'image';

/**
 * 拉取模型列表所需的最小字段集。
 * 同时兼容 config 中的 provider 和管理页传入的脱敏 provider。
 */
export interface ModelSource {
    protocol: string;
    baseUrl: string;
    apiKey: string;
    options: Record<string, unknown>;
    /** workers:优先用 AI 绑定列模型,缺省或绑定不支持时回退到 accountId + token */
    binding?: WorkersAIBinding;
}

const OPENAI_DEFAULT_BASE = 'https://api.openai.com/v1';
const ANTHROPIC_DEFAULT_BASE = 'https://api.anthropic.com/v1';

function trimBase(url: string): string {
    return url.trim().replace(/\/+$/, '');
}

async function getJSON(url: string, headers: Record<string, string>): Promise<any> {
    const response = await fetch(url, { headers });
    if (!response.ok) {
        let detail = `${response.status} ${response.statusText}`;
        try {
            const data = (await response.json()) as ErrorPayload;
            detail = data?.error?.message || data?.message || detail;
        } catch {
            // 保留状态文本
        }
        throw new Error(detail);
    }
    return response.json();
}

function idsFrom(data: any): string[] {
    if (!Array.isArray(data?.data)) {
        return [];
    }
    return data.data
        .map((item: any) => item?.id)
        .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);
}

/** 把 workers 绑定 / REST 两种返回统一成 name 列表 */
function namesFrom(items: WorkersAIModelInfo[]): string[] {
    return items.map(item => item?.name).filter((name): name is string => typeof name === 'string' && name.length > 0);
}

/**
 * 聊天与图片各自的 Workers AI 任务类型。
 * `query` 交给服务端粗筛;`allow` 用于对返回结果复核,因此即使运行时忽略 task 参数,
 * 也不会把图片生成模型混进聊天列表(反之亦然)。
 */
const WORKERS_TASK: Record<ProviderKind, { query: string; allow: string[] }> = {
    chat: { query: 'Text Generation', allow: ['textgeneration'] },
    image: { query: 'Text-to-Image', allow: ['texttoimage'] },
};

/** 归一化任务名:"Text-to-Image" 与 "Text to Image" 视为同一任务 */
function normalizeTask(value: unknown): string {
    return typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
}

/** 条目里的任务可能是字符串,也可能是 `{name}` 对象 */
function taskNameOf(item: WorkersAIModelInfo): string {
    const task = item?.task;
    if (typeof task === 'string') {
        return task;
    }
    if (task && typeof task === 'object' && typeof (task as { name?: unknown }).name === 'string') {
        return (task as { name: string }).name;
    }
    return '';
}

/** 复核任务类型:任务名缺失时无法判断,保留;能判断且不匹配的丢弃 */
function filterByTask(items: WorkersAIModelInfo[], allow: string[]): WorkersAIModelInfo[] {
    return items.filter(item => {
        const task = normalizeTask(taskNameOf(item));
        return !task || allow.includes(task);
    });
}

/**
 * 从提供商拉取可选模型列表。
 * - chat-completions / responses / images:GET {base}/models(Bearer)
 * - anthropic-messages:GET {base}/models(x-api-key + anthropic-version)
 * - workers:优先用 AI 绑定的 models(),否则回退到账号级模型搜索接口;
 *   两者都按任务类型区分聊天模型与图片生成模型
 */
export async function fetchModels(protocol: string, provider: ModelSource, kind: ProviderKind): Promise<string[]> {
    switch (protocol) {
        case 'chat-completions':
        case 'responses':
        case 'images': {
            const base = trimBase(provider.baseUrl) || OPENAI_DEFAULT_BASE;
            const data = await getJSON(`${base}/models`, {
                Authorization: `Bearer ${provider.apiKey}`,
            });
            return idsFrom(data);
        }
        case 'anthropic-messages': {
            const base = trimBase(provider.baseUrl) || ANTHROPIC_DEFAULT_BASE;
            const data = await getJSON(`${base}/models`, {
                'x-api-key': provider.apiKey,
                'anthropic-version': '2023-06-01',
            });
            return idsFrom(data);
        }
        case 'workers': {
            const { query, allow } = WORKERS_TASK[kind];
            if (provider.binding?.models) {
                const found = await provider.binding.models({ task: query, per_page: 100 });
                return namesFrom(filterByTask(found ?? [], allow));
            }
            const { accountId, token } = workersCredentials(provider.options);
            if (!accountId || !token) {
                throw new Error('Cloudflare account ID and token are required');
            }
            const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models/search?task=${encodeURIComponent(query)}`;
            const data = await getJSON(url, { Authorization: `Bearer ${token}` });
            if (!Array.isArray(data?.result)) {
                return [];
            }
            return namesFrom(filterByTask(data.result as WorkersAIModelInfo[], allow));
        }
        default:
            return [];
    }
}
