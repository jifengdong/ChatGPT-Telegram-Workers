/**
 * 测试用配置构造器:生成合法的 AppConfig(与 config 包结构一致),
 * 避免每个测试重复粘贴整份 settings。
 */

export interface TestProviderOverrides {
    id: string;
    protocol?: string;
    label?: string;
    enabled?: boolean;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    models?: string[];
    extraParams?: Record<string, unknown>;
    options?: Record<string, unknown>;
}

export interface TestConfigOverrides {
    defaultChatProvider?: string | null;
    defaultImageProvider?: string | null;
    settings?: Record<string, unknown>;
    chatProviders?: TestProviderOverrides[];
    imageProviders?: TestProviderOverrides[];
    plugins?: unknown[];
    customCommands?: unknown[];
}

/** 与 config 包 DEFAULT_SETTINGS 对齐的测试默认值 */
export const TEST_SETTINGS = {
    language: 'en',
    updateBranch: 'master',
    publicBaseUrl: '',
    telegramApiDomain: 'https://api.telegram.org',
    defaultParseMode: 'Markdown',
    systemInitMessage: null,
    streamMode: false,
    chatCompleteApiTimeout: 10,
    maxOutputTokens: 0,
    telegramMinStreamInterval: 0,
    telegramPhotoSizeOffset: 1,
    telegramImageTransferMode: 'base64',
    modelListColumns: 1,
    allowAllUsers: false,
    allowedUserIds: [] as string[],
    allowedGroupIds: [] as string[],
    groupChatBotEnable: true,
    groupChatBotShareMode: true,
    autoTrimHistory: true,
    maxHistoryLength: 20,
    maxTokenLength: -1,
    historyImagePlaceholder: null,
    showReplyButton: false,
    extraMessageContext: false,
    extraMessageMediaCompatible: ['image'],
    hideCommandButtons: [] as string[],
    safeMode: true,
    debugMode: false,
    devMode: false,
};

function provider(input: TestProviderOverrides) {
    // 允许只给 model;此时 models 默认为 [model],避免服务端把它当作未知模型回退掉
    const model = input.model ?? input.models?.[0] ?? 'mock-model';
    return {
        id: input.id,
        protocol: input.protocol ?? 'chat-completions',
        label: input.label ?? input.id,
        enabled: input.enabled ?? true,
        apiKey: input.apiKey ?? 'sk-mock',
        baseUrl: input.baseUrl ?? '',
        model,
        models: input.models ?? [model],
        extraParams: input.extraParams ?? {},
        options: input.options ?? {},
    };
}

function imageProvider(input: TestProviderOverrides) {
    return { ...provider(input), protocol: input.protocol ?? 'images' };
}

/** 构造一份可直接交给 `admin.config.save` 的配置 */
export function buildTestConfig(overrides: TestConfigOverrides = {}) {
    return {
        version: 1 as const,
        defaultChatProvider: overrides.defaultChatProvider ?? overrides.chatProviders?.[0]?.id ?? null,
        defaultImageProvider: overrides.defaultImageProvider ?? overrides.imageProviders?.[0]?.id ?? null,
        settings: { ...TEST_SETTINGS, ...overrides.settings },
        chatProviders: (overrides.chatProviders ?? []).map(provider),
        imageProviders: (overrides.imageProviders ?? []).map(imageProvider),
        plugins: overrides.plugins ?? [],
        customCommands: overrides.customCommands ?? [],
    };
}
