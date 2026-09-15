import type { MaskedConfig, MaskedProvider } from '@chatgpt-telegram-workers/config';
import {
    CHAT_PROTOCOLS,
    fetchModels,
    IMAGE_PROTOCOLS,
    loadChatLLM,
    loadImageGen,
} from '@chatgpt-telegram-workers/agent';
import { ENV, MASKED_API_KEY, maskConfig, unmaskConfig, unmaskKey } from '@chatgpt-telegram-workers/config';
import { RpcError, type RpcMethods } from '../rpc';
import { checkPassword, createSession, extractBearer, isAdmin, validateInitData, verifySession } from './auth';

/** 校验管理员会话;未授权时抛 RpcError(401)。 */
export async function requireAuth(request: Request): Promise<string> {
    const userId = await verifySession(extractBearer(request.headers.get('Authorization')));
    if (!userId || !isAdmin(userId)) {
        throw new RpcError(401, 'unauthorized');
    }
    return userId;
}

/** 管理后台方法:`admin.login` / `admin.authInfo` / `admin.meta` / `admin.config.*` / ... */
export function createAdminMethods(): RpcMethods {
    return {
        // 登录:优先 TMA initData,回退密码
        'admin.login': async params => {
            const body = (params ?? {}) as { initData?: string; password?: string };
            if (body.initData) {
                const result = await validateInitData(body.initData, ENV.TELEGRAM_TOKEN);
                if (!result.ok) {
                    throw new RpcError(401, `initData ${result.reason}`);
                }
                if (!isAdmin(result.user!.id)) {
                    throw new RpcError(403, 'not admin');
                }
                return { token: await createSession(`${result.user!.id}`) };
            }
            if (body.password !== undefined) {
                if (!ENV.ADMIN_PASSWORD) {
                    throw new RpcError(400, 'password login disabled');
                }
                // 会话主体必须是 ADMIN_ID,否则 requireAuth 的 isAdmin 校验永远失败
                if (!ENV.ADMIN_ID) {
                    throw new RpcError(400, 'ADMIN_ID must be set to use password login');
                }
                if (!checkPassword(body.password)) {
                    throw new RpcError(401, 'invalid password');
                }
                return { token: await createSession(ENV.ADMIN_ID) };
            }
            throw new RpcError(400, 'missing credentials');
        },

        // 登录方式提示(前端据此决定展示):密码登录需要同时配置 ADMIN_PASSWORD 与 ADMIN_ID
        'admin.authInfo': () => ({
            passwordEnabled: !!ENV.ADMIN_PASSWORD && !!ENV.ADMIN_ID,
            hasAdminId: !!ENV.ADMIN_ID,
            hasToken: !!ENV.TELEGRAM_TOKEN,
        }),

        // API 格式与字段描述(动态表单用)
        'admin.meta': async (_params, ctx) => {
            await requireAuth(ctx.request);
            return {
                chatProtocols: CHAT_PROTOCOLS,
                imageProtocols: IMAGE_PROTOCOLS,
                // 有 AI 绑定时 workers 提供商无需 accountId/token,表单据此调整提示
                workersBinding: !!ENV.AI_BINDING,
            };
        },

        // 读取配置(脱敏)
        'admin.config.get': async (_params, ctx) => {
            await requireAuth(ctx.request);
            await ENV.loadConfig(true);
            return maskConfig(ENV.CONFIG);
        },

        // 保存配置(掩码 Key 保留原值)
        'admin.config.save': async (params, ctx) => {
            await requireAuth(ctx.request);
            const incoming = params as MaskedConfig;
            const current = await ENV.loadConfig(true);
            const next = unmaskConfig(incoming, current);
            await ENV.getConfigStore().save(next);
            await ENV.loadConfig(true);
            return { ok: true };
        },

        // 当前生效的 agent 摘要
        'admin.agents': async (_params, ctx) => {
            await requireAuth(ctx.request);
            await ENV.loadConfig(true);
            const chat = loadChatLLM(ENV.CONFIG);
            const image = loadImageGen(ENV.CONFIG);
            return {
                chat: chat ? { name: chat.name, label: chat.label, model: chat.model } : null,
                image: image ? { name: image.name, label: image.label, model: image.model } : null,
            };
        },

        // 按草稿 provider 拉取模型列表(草稿里没有明文 Key,需按 id 还原成已保存的真实值)
        'admin.models': async (params, ctx) => {
            await requireAuth(ctx.request);
            const body = (params ?? {}) as { kind?: 'chat' | 'image'; provider?: MaskedProvider };
            if (!body.provider) {
                return { models: [] };
            }
            await ENV.loadConfig(true);
            try {
                const kind = body.kind === 'image' ? 'image' : 'chat';
                const provider = unmaskProviderFromStore(body.provider, kind);
                // workers 有 AI 绑定时不需要 accountId/token,把绑定透传给 fetchModels
                const models = await fetchModels(
                    provider.protocol,
                    { ...provider, binding: ENV.AI_BINDING ?? undefined },
                    kind,
                );
                return { models };
            } catch (e) {
                throw new RpcError(400, (e as Error).message);
            }
        },
    };
}

/**
 * 把草稿 provider 的密钥还原成已保存配置里的真实值(按 id),供服务端拉取模型列表。
 * 规则与保存路径一致:空值/占位符沿用已存 Key,显式 clearApiKey 则视为没有 Key。
 */
function unmaskProviderFromStore(provider: MaskedProvider, kind: 'chat' | 'image') {
    const stored = (kind === 'image' ? ENV.CONFIG.imageProviders : ENV.CONFIG.chatProviders).find(
        p => p.id === provider.id,
    );
    const options: Record<string, unknown> = { ...provider.options };
    for (const [key, value] of Object.entries(options)) {
        if (value === MASKED_API_KEY) {
            options[key] = stored?.options?.[key] ?? '';
        }
    }
    return {
        protocol: provider.protocol,
        baseUrl: provider.baseUrl,
        apiKey: unmaskKey(provider.apiKey, stored?.apiKey, provider.clearApiKey),
        options,
    };
}
