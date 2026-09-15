import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { BotClient } from '../bot/client';
import { buildTestConfig } from '../config/builder';
import { LLMMock } from '../llm/mock';
import { startMockServer, startLocalServer, type StartedMock } from '../node/server';
import { TelegramMock } from '../telegram/mock';
import { TelegramWebClient } from '../telegram/web';
import type { WebChatSeed } from '../telegram/web-types';

export interface BotHarnessOptions {
    /** 构建产物入口,例如 packages/apps/server/dist/node.js */
    entry: string;
    token?: string;
    secretToken?: string;
    adminId?: number;
    adminPassword?: string;
    /** mock LLM 的固定回复 */
    llmReply?: string;
    /** 额外环境变量合并进 bot 进程 */
    env?: Record<string, string>;
    /** 启动等待超时(毫秒) */
    readyTimeoutMs?: number;
    /** 预置的 mock Telegram 会话(同时注册到 API mock 与 web client) */
    chats?: WebChatSeed[];
}

export interface BotHarness {
    baseUrl: string;
    botClient: BotClient;
    telegram: TelegramMock;
    llm: LLMMock;
    telegramUrl: string;
    llmUrl: string;
    /** 模拟的 Telegram Web 客户端(浏览器可访问) */
    web: TelegramWebClient;
    /** Web 客户端的地址(浏览器打开 `${webUrl}/web`) */
    webUrl: string;
    token: string;
    secretToken: string;
    adminId: number;
    /** 用当前 mock 地址重建配置并保存(settings 深合并,始终保留 mock 地址) */
    applyConfig(overrides?: Record<string, unknown>): Promise<void>;
    close(): Promise<void>;
    log(): string;
}

function getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const srv = net.createServer();
        srv.on('error', reject);
        srv.listen(0, '127.0.0.1', () => {
            const port = (srv.address() as { port: number }).port;
            srv.close(() => resolve(port));
        });
    });
}

async function waitForServer(url: string, log: () => string, timeoutMs: number): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(url);
            if (res.status < 500) {
                return true;
            }
        } catch {
            // 尚未监听,继续等待
        }
        await new Promise(r => setTimeout(r, 150));
    }
    process.stderr.write(`server did not start:\n${log()}\n`);
    return false;
}

/**
 * 启动一个完整的离线测试环境:
 * mock Telegram + mock LLM + 真实构建产物(dist/node.js,webhook 模式)。
 * 供 node e2e 与浏览器 e2e 共用。
 */
export async function startBotHarness(options: BotHarnessOptions): Promise<BotHarness> {
    const token = options.token ?? '123456:E2E';
    const secretToken = options.secretToken ?? 'e2e-secret';
    const adminId = options.adminId ?? 42;
    const adminPassword = options.adminPassword ?? 'e2e-pass';
    const readyTimeoutMs = options.readyTimeoutMs ?? 15_000;

    const telegramMock = new TelegramMock({ token, botUsername: 'e2e_bot' });
    const telegram: StartedMock<TelegramMock> = await startMockServer(telegramMock);
    const llmMock = new LLMMock({ reply: options.llmReply, models: ['mock-model', 'mock-model-2'] });
    const llm: StartedMock<LLMMock> = await startMockServer(llmMock);

    const port = await getFreePort();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctw-e2e-'));
    const configPath = path.join(tmpDir, 'config.json');
    const wranglerPath = path.join(tmpDir, 'wrangler.jsonc');
    fs.writeFileSync(
        configPath,
        JSON.stringify({
            database: { type: 'memory' },
            server: { port, hostname: '127.0.0.1', baseURL: `http://127.0.0.1:${port}` },
            mode: 'webhook',
        }),
    );
    fs.writeFileSync(
        wranglerPath,
        JSON.stringify({
            vars: {
                TELEGRAM_TOKEN: token,
                ADMIN_ID: `${adminId}`,
                ADMIN_PASSWORD: adminPassword,
                TELEGRAM_SECRET_TOKEN: secretToken,
                ...options.env,
            },
        }),
    );

    const child: ChildProcess = spawn(process.execPath, [options.entry], {
        env: { ...process.env, CONFIG_PATH: configPath, WRANGLER_PATH: wranglerPath },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let logs = '';
    child.stdout?.on('data', d => (logs += d.toString()));
    child.stderr?.on('data', d => (logs += d.toString()));

    const baseUrl = `http://127.0.0.1:${port}`;
    const ready = await waitForServer(`${baseUrl}/`, () => logs, readyTimeoutMs);
    if (!ready) {
        child.kill('SIGKILL');
        throw new Error('bot server failed to start');
    }

    const botClient = new BotClient(baseUrl, token);
    const llmBase = llm.url;
    const telegramBase = telegram.url;

    // 预置会话:同时注册到 API mock 与 web client
    for (const chat of options.chats ?? []) {
        telegramMock.addChat({
            id: chat.id,
            type: chat.type,
            title: chat.title,
            isForum: false,
        });
        if (chat.type !== 'private') {
            telegramMock.addMember(chat.id, { userId: chat.userId, status: 'member', firstName: chat.userName });
        }
    }

    const web = new TelegramWebClient(telegramMock, {
        botBaseUrl: baseUrl,
        token,
        secretToken,
        chats: options.chats,
    });
    const webServer = await startLocalServer(request => web.fetch(request));

    return {
        baseUrl,
        botClient,
        telegram: telegramMock,
        llm: llmMock,
        telegramUrl: telegramBase,
        llmUrl: llmBase,
        web,
        webUrl: webServer.url,
        token,
        secretToken,
        adminId,
        log: () => logs,
        async applyConfig(overrides = {}) {
            const settingsOverrides = (overrides as { settings?: Record<string, unknown> }).settings ?? {};
            const config = buildTestConfig({
                chatProviders: [
                    {
                        id: 'mock-chat',
                        baseUrl: `${llmBase}/v1`,
                        model: 'mock-model',
                        models: ['mock-model', 'mock-model-2'],
                    },
                ],
                imageProviders: [
                    { id: 'mock-image', protocol: 'images', baseUrl: `${llmBase}/v1`, model: 'mock-image-model' },
                ],
                ...overrides,
                // settings 深合并:场景只覆盖部分字段时仍保留 mock 地址
                settings: { telegramApiDomain: telegramBase, publicBaseUrl: baseUrl, ...settingsOverrides },
            });
            await botClient.saveConfig(config);
        },
        async close() {
            child.kill('SIGKILL');
            await telegram.close();
            await llm.close();
            await webServer.close();
            fs.rmSync(tmpDir, { recursive: true, force: true });
        },
    };
}
