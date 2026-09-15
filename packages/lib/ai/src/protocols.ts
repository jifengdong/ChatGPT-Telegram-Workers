/**
 * 协议注册表:描述每种 API 格式的元数据与能力,不预设厂商。
 * 用户填 Name / Base URL / API Key,模型由「允许使用的模型列表」维护。
 */

/** 聊天补全协议 */
export type ChatProtocol = 'chat-completions' | 'anthropic-messages' | 'responses' | 'workers';

/** 图片生成协议 */
export type ImageProtocol = 'images' | 'workers';

/**
 * 图片发送能力:
 * - url:    图片以 URL 直传
 * - inline: 图片总是抓取后内联为 base64(anthropic)
 * - both:   URL 与 base64 皆可,由 ClientConfig.imageTransfer 决定(openai 系)
 * - none:   丢弃图片(workers text generation)
 */
export type ImageSupport = 'url' | 'inline' | 'both' | 'none';

/** 管理页动态表单的字段描述 */
export interface ProviderField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'boolean';
    placeholder?: string;
    required?: boolean;
}

/** 可自动拉取模型列表的方式 */
export type ModelListKind = 'openai' | 'anthropic' | 'workers' | 'none';

/** 协议入口描述(管理页表单与 agent 组装共用) */
export interface ProtocolOption {
    id: string;
    label: string;
    /** 默认 API Base;留空则交由 ai 客户端内置默认值 */
    defaultBaseUrl: string;
    /** 该协议需要额外填写的实例字段(存入 provider.options) */
    optionFields?: ProviderField[];
    /** 模型列表拉取方式 */
    modelList: ModelListKind;
    /**
     * 该协议是否读取 `provider.baseUrl`。
     * workers 为 false:端点由 accountId 拼接或走 AI 绑定,填了也不会被读取。
     */
    usesBaseUrl: boolean;
    /**
     * 该协议是否读取 `provider.apiKey`。
     * workers 为 false:凭据是 options.token(或 AI 绑定),填了也不会被读取。
     */
    usesApiKey: boolean;
}

const WORKERS_FIELDS: ProviderField[] = [
    { key: 'accountId', label: 'Account ID', type: 'text' },
    { key: 'token', label: 'API Token', type: 'password' },
];

/**
 * Workers AI 的凭据与端点都不来自 Base URL / API Key:
 * 有 `AI` 绑定时直接用绑定,否则用 options 里的 accountId + token。
 * 因此这两个通用字段对它恒为无意义,表单不应展示。
 */
const WORKERS_ENDPOINT_FIELDS = { usesBaseUrl: false, usesApiKey: false } as const;

/** 可选的自定义鉴权头:Azure OpenAI 使用 `api-key` 而非 Bearer */
const API_KEY_HEADER_FIELD: ProviderField = {
    key: 'apiKeyHeader',
    label: 'API Key Header',
    type: 'text',
    placeholder: 'api-key (Azure only)',
};

export const CHAT_PROTOCOLS: ProtocolOption[] = [
    {
        id: 'chat-completions',
        label: 'OpenAI Chat Completions',
        defaultBaseUrl: 'https://api.openai.com/v1',
        optionFields: [API_KEY_HEADER_FIELD],
        modelList: 'openai',
        usesBaseUrl: true,
        usesApiKey: true,
    },
    {
        id: 'anthropic-messages',
        label: 'Anthropic Messages',
        defaultBaseUrl: 'https://api.anthropic.com/v1',
        modelList: 'anthropic',
        usesBaseUrl: true,
        usesApiKey: true,
    },
    {
        id: 'responses',
        label: 'OpenAI Responses',
        defaultBaseUrl: 'https://api.openai.com/v1',
        optionFields: [API_KEY_HEADER_FIELD],
        modelList: 'openai',
        usesBaseUrl: true,
        usesApiKey: true,
    },
    {
        id: 'workers',
        label: 'Cloudflare Workers AI',
        defaultBaseUrl: '',
        optionFields: WORKERS_FIELDS,
        modelList: 'workers',
        ...WORKERS_ENDPOINT_FIELDS,
    },
];

export const IMAGE_PROTOCOLS: ProtocolOption[] = [
    {
        id: 'images',
        label: 'OpenAI Images',
        defaultBaseUrl: 'https://api.openai.com/v1',
        modelList: 'openai',
        usesBaseUrl: true,
        usesApiKey: true,
    },
    {
        id: 'workers',
        label: 'Cloudflare Workers AI',
        defaultBaseUrl: '',
        optionFields: WORKERS_FIELDS,
        modelList: 'workers',
        ...WORKERS_ENDPOINT_FIELDS,
    },
];

/** 各协议对图片输入的支持能力(与协议绑定) */
const CHAT_IMAGE_SUPPORT: Record<ChatProtocol, ImageSupport> = {
    'chat-completions': 'both',
    'anthropic-messages': 'inline',
    responses: 'both',
    workers: 'none',
};

export function chatImageSupport(protocol: ChatProtocol): ImageSupport {
    return CHAT_IMAGE_SUPPORT[protocol] ?? 'url';
}

/**
 * 把协议能力换算成发送消息前的图片适配方式:
 * - none:   剥离图片
 * - inline: 抓取远程 URL 内联为 base64
 * - both:   由 ClientConfig.imageTransfer 决定,缺省 URL 直传
 */
export function imageAdaptMode(protocol: ChatProtocol, imageTransfer?: 'url' | 'base64'): 'none' | 'url' | 'base64' {
    switch (chatImageSupport(protocol)) {
        case 'none':
            return 'none';
        case 'inline':
            return 'base64';
        default:
            return imageTransfer === 'base64' ? 'base64' : 'url';
    }
}

export function findChatProtocol(id: string): ProtocolOption | null {
    return CHAT_PROTOCOLS.find(p => p.id === id) ?? null;
}

export function findImageProtocol(id: string): ProtocolOption | null {
    return IMAGE_PROTOCOLS.find(p => p.id === id) ?? null;
}

export function isChatProtocol(id: string): id is ChatProtocol {
    return CHAT_PROTOCOLS.some(p => p.id === id);
}

export function isImageProtocol(id: string): id is ImageProtocol {
    return IMAGE_PROTOCOLS.some(p => p.id === id);
}
