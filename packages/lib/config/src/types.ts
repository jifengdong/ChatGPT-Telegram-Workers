/**
 * 全局配置模型。所有配置项(除少数必要环境变量)都存于 KV,由管理页维护。
 */

export type ImageTransferMode = 'url' | 'base64';

/** 全局运行参数(原 EnvironmentConfig,改为 camelCase 并收敛) */
export interface AppSettings {
    language: string;
    updateBranch: string;
    /** 公网 HTTPS 域名,用于 /init 绑定 webhook 与生成管理页链接 */
    publicBaseUrl: string;
    telegramApiDomain: string;
    defaultParseMode: string;
    /** 全局 system 初始化消息 */
    systemInitMessage: string | null;
    streamMode: boolean;
    chatCompleteApiTimeout: number;
    /** 单次回复的最大输出 token 数(0 表示用协议默认值) */
    maxOutputTokens: number;
    telegramMinStreamInterval: number;
    telegramPhotoSizeOffset: number;
    telegramImageTransferMode: ImageTransferMode;
    modelListColumns: number;

    // 权限
    allowAllUsers: boolean;
    allowedUserIds: string[];
    allowedGroupIds: string[];
    groupChatBotEnable: boolean;
    groupChatBotShareMode: boolean;

    // 历史
    autoTrimHistory: boolean;
    maxHistoryLength: number;
    maxTokenLength: number;
    historyImagePlaceholder: string | null;

    // 交互
    showReplyButton: boolean;
    extraMessageContext: boolean;
    extraMessageMediaCompatible: string[];
    hideCommandButtons: string[];
    safeMode: boolean;
    debugMode: boolean;
    devMode: boolean;
}

/** 聊天提供商的 API 格式(协议入口) */
export type ChatProtocol = 'chat-completions' | 'anthropic-messages' | 'responses' | 'workers';

/** 图片提供商的 API 格式 */
export type ImageProtocol = 'images' | 'workers';

/**
 * 聊天提供商实例。`protocol` 决定 API 格式,其余为实例级取值。
 * `models` 是允许使用的模型列表,`model` 为当前使用的模型(models 之一)。
 * `options` 存放协议专属字段(如 workers 的 accountId/token)。
 */
export interface ChatProviderConfig {
    id: string;
    protocol: ChatProtocol;
    label: string;
    enabled: boolean;
    apiKey: string;
    baseUrl: string;
    model: string;
    models: string[];
    extraParams: Record<string, unknown>;
    options: Record<string, unknown>;
}

/**
 * 图片提供商实例。生成参数(`size`/`quality`/`style`/`negative_prompt`/…)
 * 因协议与模型而异,不做全局配置,统一由 `extraParams` 按 provider 合并进请求体。
 */
export interface ImageProviderConfig {
    id: string;
    protocol: ImageProtocol;
    label: string;
    enabled: boolean;
    apiKey: string;
    baseUrl: string;
    model: string;
    models: string[];
    extraParams: Record<string, unknown>;
    options: Record<string, unknown>;
}

/** 插件命令:模板为 JSON 字符串或远程 URL */
export interface PluginConfig {
    id: string;
    command: string;
    description: string;
    scope: string[];
    template: string;
    env: Record<string, string>;
    enabled: boolean;
}

/** 自定义命令:把命令文本替换为另一段命令文本 */
export interface CustomCommandConfig {
    id: string;
    command: string;
    description: string;
    scope: string[];
    value: string;
    enabled: boolean;
}

export interface AppConfig {
    version: 1;
    /** 默认聊天提供商实例 id,null 表示自动选择首个可用 */
    defaultChatProvider: string | null;
    /** 默认图片提供商实例 id,null 表示自动选择首个可用 */
    defaultImageProvider: string | null;
    settings: AppSettings;
    chatProviders: ChatProviderConfig[];
    imageProviders: ImageProviderConfig[];
    plugins: PluginConfig[];
    customCommands: CustomCommandConfig[];
}

/**
 * 脱敏后的配置(管理页读取时返回)。
 *
 * `apiKey` 恒为空字符串,Key 是否存在只由 `hasApiKey` 表达 —— 真实密钥从不离开服务端。
 */
export interface MaskedProvider {
    id: string;
    protocol: string;
    label: string;
    enabled: boolean;
    hasApiKey: boolean;
    apiKey: string;
    baseUrl: string;
    model: string;
    models: string[];
    extraParams: Record<string, unknown>;
    options: Record<string, unknown>;
    /**
     * 仅用于保存请求:置 true 表示显式删除已保存的 Key。
     * 未设置时,`apiKey` 为空视为「保持不变」。不落库(normalizeConfig 会丢弃)。
     */
    clearApiKey?: boolean;
}

export interface MaskedConfig {
    version: 1;
    defaultChatProvider: string | null;
    defaultImageProvider: string | null;
    settings: AppSettings;
    chatProviders: MaskedProvider[];
    imageProviders: MaskedProvider[];
    plugins: PluginConfig[];
    customCommands: CustomCommandConfig[];
}

/** 历史客户端回传的占位符;读取时已不再下发,保存时仍识别以兼容旧前端 */
export const MASKED_API_KEY = '••••••••';
