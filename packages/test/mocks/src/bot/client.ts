import type * as Telegram from 'telegram-bot-api-types';

export interface RpcEnvelope<T> {
    result?: T;
    error?: { code: number; message: string };
}

/**
 * 运行中的 bot 的测试客户端:
 * - 以「Telegram 服务器」的身份把 Update 投递到 webhook;
 * - 调用 JSON-RPC 管理接口(登录 / 读写配置 / 触发绑定)。
 *
 * 这样测试可以程序化地扮演任意用户、群组或未授权者,无需真实 Telegram。
 */
export class BotClient {
    constructor(
        private readonly baseUrl: string,
        private readonly token: string,
        private authToken: string | null = null,
    ) {}

    get webhookUrl(): string {
        return `${this.baseUrl}/telegram/${this.token}/webhook`;
    }

    get safehookUrl(): string {
        return `${this.baseUrl}/telegram/${this.token}/safehook`;
    }

    /** 投递一个 Update 到 webhook(默认携带 secret header,若配置) */
    async sendUpdate(update: Telegram.Update, secretToken?: string | null): Promise<Response> {
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        if (secretToken) {
            headers['X-Telegram-Bot-Api-Secret-Token'] = secretToken;
        }
        return fetch(this.webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(update),
        });
    }

    /** 投递一个 Update 到 safehook(API_GUARD 路径) */
    async sendSafehook(update: Telegram.Update, secretToken?: string | null): Promise<Response> {
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        if (secretToken) {
            headers['X-Telegram-Bot-Api-Secret-Token'] = secretToken;
        }
        return fetch(this.safehookUrl, { method: 'POST', headers, body: JSON.stringify(update) });
    }

    async rpc<T = unknown>(method: string, params?: unknown): Promise<RpcEnvelope<T>> {
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`;
        }
        const response = await fetch(`${this.baseUrl}/rpc`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ method, params }),
        });
        return (await response.json()) as RpcEnvelope<T>;
    }

    /** 密码登录并保存会话令牌,返回该令牌 */
    async login(password: string): Promise<string> {
        const response = await this.rpc<{ token: string }>('admin.login', { password });
        if (!response.result?.token) {
            throw new Error(`login failed: ${JSON.stringify(response.error)}`);
        }
        this.authToken = response.result.token;
        return this.authToken;
    }

    setAuthToken(token: string | null): void {
        this.authToken = token;
    }

    async getConfig(): Promise<any> {
        return (await this.rpc('admin.config.get')).result;
    }

    async saveConfig(config: unknown): Promise<void> {
        const response = await this.rpc('admin.config.save', config);
        if (response.error) {
            throw new Error(`saveConfig failed: ${response.error.message}`);
        }
    }

    /** 以管理员身份触发 webhook 绑定 */
    async bindWebhook(): Promise<any> {
        const response = await this.rpc('init.bind');
        if (response.error) {
            throw new Error(`init.bind failed: ${response.error.message}`);
        }
        return response.result;
    }

    async getText(path: string): Promise<{ status: number; text: string }> {
        const response = await fetch(`${this.baseUrl}${path}`);
        return { status: response.status, text: await response.text() };
    }
}
