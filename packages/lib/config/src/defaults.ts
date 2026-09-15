import type { AppConfig, AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
    language: 'zh-cn',
    updateBranch: 'master',
    publicBaseUrl: '',
    telegramApiDomain: 'https://api.telegram.org',
    defaultParseMode: 'Markdown',
    systemInitMessage: null,
    streamMode: true,
    chatCompleteApiTimeout: 0,
    maxOutputTokens: 0,
    telegramMinStreamInterval: 0,
    telegramPhotoSizeOffset: 1,
    telegramImageTransferMode: 'base64',
    modelListColumns: 1,

    allowAllUsers: false,
    allowedUserIds: [],
    allowedGroupIds: [],
    groupChatBotEnable: true,
    groupChatBotShareMode: true,

    autoTrimHistory: true,
    maxHistoryLength: 20,
    maxTokenLength: -1,
    historyImagePlaceholder: null,

    showReplyButton: false,
    extraMessageContext: false,
    extraMessageMediaCompatible: ['image'],
    hideCommandButtons: [],
    safeMode: true,
    debugMode: false,
    devMode: false,
};

/** 默认没有配置任何 AI 提供商,全部由管理页添加 */
export const DEFAULT_CONFIG: AppConfig = {
    version: 1,
    defaultChatProvider: null,
    defaultImageProvider: null,
    settings: { ...DEFAULT_SETTINGS },
    chatProviders: [],
    imageProviders: [],
    plugins: [],
    customCommands: [],
};

/** 默认配置的独立副本:避免调用方原地修改污染模块级常量 */
export function cloneDefaultConfig(): AppConfig {
    return structuredClone(DEFAULT_CONFIG);
}
