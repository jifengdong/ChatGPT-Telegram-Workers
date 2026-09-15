export type MessageRender = (parseMode: string | null, message: string) => string;

/**
 * 宿主应用注入的传输层配置。telegram 包不读取任何全局环境,
 * 由 core 在每次处理更新前调用 configureTelegram 同步最新值。
 */
export interface TelegramTransportConfig {
    apiDomain?: string;
    defaultParseMode?: string | null;
    renderMessage?: MessageRender | null;
}

export const DEFAULT_API_DOMAIN = 'https://api.telegram.org';

let transportConfig: TelegramTransportConfig = {};

export function configureTelegram(config: TelegramTransportConfig): void {
    transportConfig = config;
}

export function getTelegramConfig(): TelegramTransportConfig {
    return transportConfig;
}
