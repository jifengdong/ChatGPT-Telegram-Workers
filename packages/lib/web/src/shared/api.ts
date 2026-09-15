import type { MaskedConfig, Meta } from './types';
import { rpcCall } from './rpc';

const TOKEN_KEY = 'ctw-admin-token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

function request<T>(method: string, params?: unknown): Promise<T> {
    const token = getToken();
    return rpcCall<T>(method, params, token ? { Authorization: `Bearer ${token}` } : undefined);
}

export interface BindResult {
    outcome?: 'ok' | 'error' | 'no-token';
    tokenMissing?: boolean;
    domain?: string;
    result?: unknown;
}

export const api = {
    authInfo: () => request<{ passwordEnabled: boolean; hasAdminId: boolean; hasToken: boolean }>('admin.authInfo'),
    loginInitData: (initData: string) => request<{ token: string }>('admin.login', { initData }),
    loginPassword: (password: string) => request<{ token: string }>('admin.login', { password }),
    meta: () => request<Meta>('admin.meta'),
    getConfig: () => request<MaskedConfig>('admin.config.get'),
    saveConfig: (config: MaskedConfig) => request<{ ok: boolean }>('admin.config.save', config),
    agents: () => request<{ chat: any; image: any }>('admin.agents'),
    models: (kind: 'chat' | 'image', provider: unknown) =>
        request<{ models: string[]; error?: string }>('admin.models', { kind, provider }),
    /** 绑定 webhook 会写 KV,需要管理员会话令牌 */
    bind: () => request<BindResult>('init.bind'),
    pageInfo: () => request<{ version: string; timestamp: number; hasToken: boolean }>('pages.info'),
};
