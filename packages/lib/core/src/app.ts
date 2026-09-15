import type * as Telegram from 'telegram-bot-api-types';
import { ENV } from '@chatgpt-telegram-workers/config';
import { PAGE_HTML } from '@chatgpt-telegram-workers/web';
import { createAdminMethods, requireAuth } from './admin';
import { commandsBindScope, commandsDocument, configureTelegram, createTelegramBotAPI, handleUpdate } from './bot';
import { createRpcHandler, type RpcMethods } from './rpc';

const DOCS_URL = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master/doc';
const REPO_URL = 'https://github.com/TBXark/ChatGPT-Telegram-Workers';
const ISSUES_URL = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/issues';

/** 唯一的数据端点:POST /rpc,请求体 `{ method, params }` */
export const RPC_PATH = '/rpc';

/** 返回单页 HTML 的路径;具体渲染由前端按 pathname 路由。 */
const PAGE_PATHS = new Set(['/', '/help', '/init', '/admin', '/interpolate']);

export interface AppOptions {
    /**
     * 每次请求进入分发前调用,宿主平台在此把环境变量合并进 ENV。
     * Cloudflare Workers 传 `env => ENV.merge(env ?? {})`,Node/Vercel 传 process.env 等。
     */
    onRequest?: (env: unknown) => void | Promise<void>;
    /** 覆盖内置单页 HTML(默认使用 web 包构建期内联的页面) */
    adminHtml?: string;
}

/** fetch 兼容的应用对象:可直接作为 Workers 默认导出,也可交给 node-server 的 serve。 */
export interface App {
    fetch(request: Request, env?: unknown): Promise<Response>;
}

function errorToString(e: Error | any): string {
    return JSON.stringify({ message: e.message, stack: e.stack });
}

/** Telegram 只会重试 4xx/5xx,webhook 的所有错误统一返回 200。 */
function makeResponse200(resp: Response | null): Response {
    if (resp === null) {
        return new Response('NOT HANDLED', { status: 200 });
    }
    if (resp.status === 200) {
        return resp;
    }
    // Headers 实例没有可枚举自有属性,对象展开复制不到任何头;必须逐项拷贝,
    // 否则会丢掉原来的 Content-Type 等响应头。
    const headers = new Headers(resp.headers);
    headers.set('Original-Status', `${resp.status}`);
    return new Response(resp.body, { status: 200, headers });
}

function html(body: string): Response {
    return new Response(body, {
        status: 200,
        // 单文件页面无版本化资源 URL,必须禁掉 webview 的启发式缓存,
        // 否则 Telegram 客户端会停留在旧版本页面上
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, must-revalidate' },
    });
}

/** 绑定 webhook 与命令:返回 Telegram setWebhook / setMyCommands / setChatMenuButton 的结果。 */
async function bindWebhook(domain: string): Promise<unknown> {
    const token = ENV.TELEGRAM_TOKEN;
    if (!token) {
        return { ok: false, message: 'TELEGRAM_TOKEN is not set' };
    }
    const api = createTelegramBotAPI(token);
    const hookMode = ENV.API_GUARD ? 'safehook' : 'webhook';
    const envBase = ENV.PUBLIC_BASE_URL;
    const kvBase = ENV.CONFIG.settings.publicBaseUrl?.replace(/\/+$/, '');
    const base = envBase || kvBase || `https://${domain}`;
    // 环境变量未指定且 KV 未保存时,把本次探测到的公网地址持久化到 KV,
    // 后续 /admin、菜单按钮等直接使用,无需依赖 getWebhookInfo 推断
    if (!envBase && !kvBase) {
        try {
            const config = { ...ENV.CONFIG, settings: { ...ENV.CONFIG.settings, publicBaseUrl: base } };
            ENV.CONFIG = await ENV.getConfigStore().save(config);
            console.log(`publicBaseUrl saved to KV: ${base}`);
        } catch (e) {
            console.error('save publicBaseUrl to KV failed:', errorToString(e));
        }
    }
    const url = `${base}/telegram/${token.trim()}/${hookMode}`;
    const result: any = {
        webhook: await api
            .setWebhook({
                url,
                ...(ENV.TELEGRAM_SECRET_TOKEN ? { secret_token: ENV.TELEGRAM_SECRET_TOKEN } : {}),
            })
            .then(res => res.json())
            .catch(e => errorToString(e)),
        commands: {},
    };
    for (const [scope, data] of Object.entries(commandsBindScope())) {
        result.commands[scope] = await api
            .setMyCommands(data)
            .then(res => res.json())
            .catch(e => errorToString(e));
    }
    // 把聊天菜单按钮绑定为管理后台 Mini App,点击输入框旁的菜单即可打开
    result.menuButton = await api
        .setChatMenuButton({
            menu_button: {
                type: 'web_app',
                text: 'Settings',
                web_app: { url: `${base}/admin` },
            },
        })
        .then(res => res.json())
        .catch(e => errorToString(e));
    return result;
}

/** `init.bind`:绑定结果(供 /init 页面与首页按钮调用)。 */
async function bindWebHook(domain: string): Promise<unknown> {
    const tokenMissing = !ENV.TELEGRAM_TOKEN;
    const result = await bindWebhook(domain);
    const ok = !!(result as any)?.webhook?.ok;
    return {
        domain,
        tokenMissing,
        outcome: tokenMissing ? 'no-token' : ok ? 'ok' : 'error',
        result,
    };
}

async function telegramWebhook(request: Request, token: string): Promise<Response> {
    try {
        // 配置了 secret_token 时校验请求头,拒绝伪造的更新
        if (ENV.TELEGRAM_SECRET_TOKEN) {
            const provided = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
            if (provided !== ENV.TELEGRAM_SECRET_TOKEN) {
                return new Response('Forbidden', { status: 403 });
            }
        }
        const body = (await request.json()) as Telegram.Update;
        return makeResponse200(await handleUpdate(token, body));
    } catch (e) {
        console.error(e);
        return new Response(errorToString(e), { status: 200 });
    }
}

/** 用 API_GUARD 处理 Telegram 回调 */
async function telegramSafeHook(request: Request, token: string): Promise<Response> {
    try {
        if (ENV.API_GUARD === undefined || ENV.API_GUARD === null) {
            return telegramWebhook(request, token);
        }
        console.log('API_GUARD is enabled');
        const url = new URL(request.url);
        url.pathname = url.pathname.replace('/safehook', '/webhook');
        const newRequest = new Request(url, request);
        return makeResponse200(await ENV.API_GUARD.fetch(newRequest));
    } catch (e) {
        console.error(e);
        return new Response(errorToString(e), { status: 200 });
    }
}

/** 首页数据:由前端 home/main.ts 通过 pages.info 拉取渲染。 */
function pageInfo(domain: string): Record<string, unknown> {
    const base = ENV.publicBaseUrl?.replace(/\/+$/, '');
    return {
        domain,
        version: ENV.BUILD_VERSION,
        timestamp: ENV.BUILD_TIMESTAMP,
        adminUrl: base ? `${base}/admin` : '/admin',
        initUrl: '/init',
        interpolateUrl: base ? `${base}/interpolate` : '/interpolate',
        hasToken: !!ENV.TELEGRAM_TOKEN,
        commands: commandsDocument(),
        docsUrl: DOCS_URL,
        repoUrl: REPO_URL,
        issuesUrl: ISSUES_URL,
    };
}

/** 解析 /telegram/{token}/{webhook|safehook},避免引入路由框架。 */
function matchTelegramHook(pathname: string): { token: string; safe: boolean } | null {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length !== 3 || parts[0] !== 'telegram') {
        return null;
    }
    if (parts[2] !== 'webhook' && parts[2] !== 'safehook') {
        return null;
    }
    return { token: decodeURIComponent(parts[1]), safe: parts[2] === 'safehook' };
}

/**
 * 创建跨平台应用:静态页面走简单路径,所有数据接口聚合到单个 JSON-RPC 端点。
 * 宿主平台只需在 onRequest 里注入 env,即可运行在 Cloudflare Workers / Vercel / Node(Bun/Deno) 上。
 */
export function createApp(options: AppOptions = {}): App {
    const pageHtml = options.adminHtml || PAGE_HTML;
    const rpcMethods: RpcMethods = {
        'pages.info': (_params, ctx) => pageInfo(new URL(ctx.request.url).host),
        // 绑定 webhook 会写 KV 并把 webhook 指向探测到的域名,必须限制为管理员,
        // 否则未鉴权调用者可借伪造 Host 劫持更新(见 /init 页面说明)。
        'init.bind': async (_params, ctx) => {
            await requireAuth(ctx.request);
            return bindWebHook(new URL(ctx.request.url).host);
        },
        ...createAdminMethods(),
    };
    const rpc = createRpcHandler(rpcMethods);

    async function setup(env: unknown): Promise<void> {
        await options.onRequest?.(env);
        // 载入 KV 全局配置,再同步给传输层框架
        await ENV.loadConfig();
        configureTelegram({
            apiDomain: ENV.CONFIG.settings.telegramApiDomain,
            defaultParseMode: ENV.CONFIG.settings.defaultParseMode,
            renderMessage: ENV.CUSTOM_MESSAGE_RENDER,
        });
    }

    return {
        async fetch(request: Request, env?: unknown): Promise<Response> {
            await setup(env);
            const { pathname } = new URL(request.url);

            if (request.method === 'GET') {
                // 同一份单页 HTML 服务所有页面,前端按 pathname 挂载对应 Web Component
                if (PAGE_PATHS.has(pathname.replace(/\/+$/, '') || '/')) {
                    return html(pageHtml);
                }
            }

            if (request.method === 'POST') {
                if (pathname === RPC_PATH) {
                    return rpc(request, env);
                }
                const hook = matchTelegramHook(pathname);
                if (hook) {
                    return hook.safe ? telegramSafeHook(request, hook.token) : telegramWebhook(request, hook.token);
                }
            }

            return new Response('Not Found', { status: 404 });
        },
    };
}
