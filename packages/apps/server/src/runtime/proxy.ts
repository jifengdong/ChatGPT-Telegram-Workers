import * as process from 'node:process';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

/**
 * 把全局 fetch(undici)指向 HTTP 代理,用于本地/容器环境访问 Telegram API。
 */
export function installFetchProxy(proxy: string): void {
    if (proxy) {
        setGlobalDispatcher(new ProxyAgent(proxy));
    }
}

export function systemProxy(): string | null {
    const keys = ['http_proxy', 'HTTP_PROXY', 'https_proxy', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY'];
    for (const key of keys) {
        if (process.env[key]) {
            return process.env[key]!;
        }
    }
    return null;
}
