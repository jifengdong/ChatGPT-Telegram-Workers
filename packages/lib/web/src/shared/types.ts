export interface ProtocolField {
    key: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
}

export interface ProtocolOption {
    id: string;
    label: string;
    defaultBaseUrl: string;
    optionFields?: ProtocolField[];
    modelList: string;
    /** 协议是否读取 provider.baseUrl;workers 为 false,表单不展示该行 */
    usesBaseUrl: boolean;
    /** 协议是否读取 provider.apiKey;workers 为 false,表单不展示该行 */
    usesApiKey: boolean;
}

/** 脱敏后的 provider:apiKey 恒为空,是否存在看 hasApiKey */
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
    /** 保存请求专用:true 表示显式删除已保存的 Key */
    clearApiKey?: boolean;
}

export interface AppSettings {
    [key: string]: unknown;
}

export interface PluginConfig {
    id: string;
    command: string;
    description: string;
    scope: string[];
    template: string;
    env: Record<string, string>;
    enabled: boolean;
}

export interface CustomCommandConfig {
    id: string;
    command: string;
    description: string;
    scope: string[];
    value: string;
    enabled: boolean;
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

export interface Meta {
    chatProtocols: ProtocolOption[];
    imageProtocols: ProtocolOption[];
    /** 部署是否已绑定 Workers AI;有绑定时 workers 提供商不需要 accountId/token */
    workersBinding: boolean;
}
