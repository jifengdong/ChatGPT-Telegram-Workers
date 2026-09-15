import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    callbackQuery,
    groupCommand,
    mentionMessage,
    photoMessage,
    serviceMessage,
    startBotHarness,
    textMessage,
    type BotHarness,
} from '@chatgpt-telegram-workers/test-mocks';

/**
 * 本地端到端测试(不需要 Telegram,也不需要任何外部网络):
 *
 *   1. 启动 mock Telegram Bot API 与 mock OpenAI 兼容服务(纯 node:http,随机端口)
 *   2. 用真实构建产物 dist/node.js 以 webhook 模式启动 bot
 *   3. 通过 JSON-RPC 管理接口登录并写入配置(telegramApiDomain / provider baseUrl 指向 mock)
 *   4. 以「Telegram 服务器」的身份把各种 Update 投递到 webhook,断言 bot 行为
 *
 * 覆盖:页面路由、管理 API 与鉴权、访问控制、私聊/群聊、命令、回调按钮、
 * 插件与自定义命令、图片下载、错误注入(429 / Markdown 解析失败)、secret_token。
 *
 * 运行: pnpm run test:e2e
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const appEntry = path.resolve(here, '../../dist/node.js');

const BOT_TOKEN = '123456:E2E';
const SECRET_TOKEN = 'e2e-secret';
const ADMIN_ID = 42;
const ADMIN_PASSWORD = 'e2e-pass';
const WHITELIST_USER = 1001;
const GROUP_ID = -100999;
/** 与 startBotHarness 的默认 LLM 回复保持一致 */
const LLM_REPLY = 'Hello from the mock LLM!';
const OVERALL_TIMEOUT_MS = 60_000;

// ------------------------------------------------------------------ harness

const passed: string[] = [];
const failed: string[] = [];

function check(name: string, ok: boolean, detail = ''): void {
    (ok ? passed : failed).push(name);
    console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

/** 断言记录器:把一组相关检查收进一个分组,失败时集中打印 */
class Scenario {
    constructor(private readonly name: string) {}

    private readonly results: { label: string; ok: boolean; detail: string }[] = [];

    expect(label: string, ok: boolean, detail = ''): void {
        this.results.push({ label, ok, detail });
    }

    expectEq<T>(label: string, actual: T, expected: T): void {
        const ok = JSON.stringify(actual) === JSON.stringify(expected);
        this.results.push({
            label,
            ok,
            detail: ok ? '' : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        });
    }

    expectIncludes(label: string, haystack: string, needle: string): void {
        this.results.push({
            label,
            ok: haystack.includes(needle),
            detail: haystack.includes(needle) ? '' : `"${needle}" not in "${haystack.slice(0, 200)}"`,
        });
    }

    finish(): void {
        for (const result of this.results) {
            check(`${this.name}: ${result.label}`, result.ok, result.detail);
        }
    }
}

function startHarness(): Promise<BotHarness> {
    return startBotHarness({
        entry: appEntry,
        token: BOT_TOKEN,
        secretToken: SECRET_TOKEN,
        adminId: ADMIN_ID,
        adminPassword: ADMIN_PASSWORD,
    });
}

// ------------------------------------------------------------------- runner

async function run(): Promise<void> {
    const harness = await startHarness();
    const { botClient, telegram, llm, llmUrl } = harness;

    try {
        await botClient.login(ADMIN_PASSWORD);
        await harness.applyConfig();

        // ---------------------------------------------------------- 1. 页面
        {
            const s = new Scenario('pages');
            const home = await botClient.getText('/');
            s.expect('home served', home.status === 200);
            s.expectIncludes('home has usage guide', home.text, 'Bind the webhook');
            const admin = await botClient.getText('/admin');
            s.expectIncludes('admin app served', admin.text, 'admin-app');
            const init = await botClient.getText('/init');
            s.expect('init page served', init.status === 200 && init.text.includes('page-init'));
            const interpolate = await botClient.getText('/interpolate');
            s.expectIncludes('interpolate page served', interpolate.text, 'id="preview"');
            const help = await botClient.getText('/help');
            s.expect('help served', help.status === 200);
            const missing = await botClient.getText('/does-not-exist');
            s.expectEq('unknown path is 404', missing.status, 404);
            s.finish();
        }

        // -------------------------------------------------- 2. 管理 API + 鉴权
        {
            const s = new Scenario('admin api');
            const authInfo = (await botClient.rpc<any>('admin.authInfo')).result;
            s.expectEq('password login enabled', authInfo.passwordEnabled, true);
            s.expectEq('has admin id', authInfo.hasAdminId, true);
            s.expectEq('has token', authInfo.hasToken, true);

            const meta = (await botClient.rpc<any>('admin.meta')).result;
            s.expect('meta lists chat protocols', Array.isArray(meta.chatProtocols) && meta.chatProtocols.length > 0);

            const agents = (await botClient.rpc<any>('admin.agents')).result;
            s.expectEq('active chat agent', agents.chat?.model, 'mock-model');

            // 未带令牌的受保护方法应 401
            const savedAuth = (botClient as any).authToken;
            botClient.setAuthToken(null);
            const unauth = await botClient.rpc('admin.config.get');
            s.expectEq('config.get without token is 401', unauth.error?.code, 401);
            const unauthBind = await botClient.rpc('init.bind');
            s.expectEq('init.bind without token is 401', unauthBind.error?.code, 401);
            botClient.setAuthToken(savedAuth);

            // 未知方法
            const unknown = await botClient.rpc('does.not.exist');
            s.expectEq('unknown rpc method', unknown.error?.code, -32601);
            // 原型链键不应被当作方法
            const proto = await botClient.rpc('toString');
            s.expectEq('prototype key rejected', proto.error?.code, -32601);

            // 模型列表(带掩码 key 应还原)
            const models = (
                await botClient.rpc<any>('admin.models', {
                    kind: 'chat',
                    provider: (await botClient.getConfig()).chatProviders[0],
                })
            ).result;
            s.expectEq('fetch models works with masked key', models.models, ['mock-model', 'mock-model-2']);

            s.finish();
        }

        // ------------------------------------------------------- 3. 绑定 webhook
        {
            const s = new Scenario('init.bind');
            const bind = await botClient.bindWebhook();
            s.expectEq('bind outcome ok', bind?.outcome, 'ok');
            s.expectEq('webhook url registered', telegram.webhook, `${harness.baseUrl}/telegram/${BOT_TOKEN}/webhook`);
            s.expectEq('secret_token forwarded', telegram.webhookSecret, SECRET_TOKEN);
            s.expect('commands registered', telegram.callsFor('setMyCommands').length >= 3);
            s.expect('menu button set', telegram.callsFor('setChatMenuButton').length === 1);
            s.finish();
        }

        // -------------------------------------------------- 4. 访问控制与不可达
        {
            const s = new Scenario('access control');
            // 非白名单私聊用户 → 拒绝
            telegram.reset();
            await botClient.sendUpdate(textMessage({ chatId: 999, userId: 999, text: 'hello' }), SECRET_TOKEN);
            s.expectIncludes('non-whitelisted private user rejected', telegram.lastText(999), 'white list');

            // 错误的 secret_token → 403、无出站
            telegram.reset();
            const forbidden = await botClient.sendUpdate(
                textMessage({ chatId: 999, userId: 999, text: 'hi' }),
                'wrong-secret',
            );
            s.expectEq('bad secret token is 403', forbidden.status, 403);
            s.expectEq('no outbound for bad secret', telegram.sentFor(999).length, 0);

            // 服务消息(入群)→ 静默忽略;错误响应经 makeResponse200 改写为 200,
            // 且必须保留原始响应头(不能因对象展开 Headers 而丢失 content-type)
            telegram.reset();
            const svc = await botClient.sendUpdate(
                serviceMessage({ chatId: GROUP_ID, chatType: 'supergroup', userId: 5 }),
                SECRET_TOKEN,
            );
            s.expectEq('service message ignored', telegram.sentFor(GROUP_ID).length, 0);
            s.expectEq('webhook error rewritten to 200', svc.status, 200);
            s.expectEq('original status preserved', svc.headers.get('Original-Status'), '500');
            s.expect('rewritten response keeps content-type', !!svc.headers.get('content-type'));

            // 未开启的群(不在白名单)→ 拒绝
            telegram.reset();
            await botClient.sendUpdate(
                mentionMessage({ chatId: GROUP_ID, chatType: 'supergroup', userId: 5, text: 'hey' }),
                SECRET_TOKEN,
            );
            s.expectIncludes('non-whitelisted group rejected', telegram.lastText(GROUP_ID), 'white list');
            s.finish();
        }

        // ---------------------------------------------------- 5. 私聊会话与 LLM
        {
            const s = new Scenario('private chat');
            await harness.applyConfig({
                settings: { allowedUserIds: [`${WHITELIST_USER}`], systemInitMessage: 'You are a test bot.' },
            });
            telegram.reset();
            llm.reset();
            const chatId = WHITELIST_USER;
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: 'hi there' }), SECRET_TOKEN);

            const request = llm.lastChatRequest();
            s.expect('LLM called', !!request);
            s.expect(
                'system prompt sent',
                (request?.messages ?? []).some(
                    (m: any) => m.role === 'system' && String(m.content).includes('test bot'),
                ),
            );
            s.expect(
                'user text sent',
                (request?.messages ?? []).some((m: any) => m.role === 'user' && String(m.content).includes('hi there')),
            );
            s.expectEq('configured model used', request?.model, 'mock-model');
            s.expectIncludes('reply delivered', telegram.lastText(chatId), LLM_REPLY);
            s.expect('typing action sent', telegram.callsFor('sendChatAction').length >= 1);
            s.finish();
        }

        // ------------------------------------------------------- 6. 命令
        {
            const s = new Scenario('commands');
            const chatId = WHITELIST_USER;

            // /new 清空历史
            telegram.reset();
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: '/new' }), SECRET_TOKEN);
            s.expect('new replies', telegram.sentFor(chatId).length >= 1);

            // /version 拉取 buildinfo(离线失败 → 返回 ERROR,但仍是有响应的命令)
            telegram.reset();
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: '/version' }), SECRET_TOKEN);
            s.expect('version responds', telegram.sentFor(chatId).length >= 1);

            // /help 列出命令
            telegram.reset();
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: '/help' }), SECRET_TOKEN);
            const helpText = telegram.lastText(chatId);
            s.expectIncludes('help lists /new', helpText, '/new');
            s.expectIncludes('help lists /img', helpText, '/img');

            // /system(特权命令,ADMIN_ID 私聊可用)
            telegram.reset();
            await botClient.sendUpdate(
                textMessage({ chatId: ADMIN_ID, userId: ADMIN_ID, text: '/system' }),
                SECRET_TOKEN,
            );
            s.expectIncludes('system shows agent', telegram.lastText(ADMIN_ID), 'AGENT');

            // /models 先返回 provider 列表键盘
            telegram.reset();
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: '/models' }), SECRET_TOKEN);
            const keyboard = telegram.lastMessage(chatId)?.keyboard as any;
            s.expect('models keyboard present', !!keyboard?.inline_keyboard);
            s.expect(
                'models keyboard lists providers',
                (keyboard?.inline_keyboard ?? []).flat().some((b: any) => String(b.callback_data).startsWith('ml:')),
            );
            s.finish();
        }

        // ------------------------------------------------- 7. 回调按钮(切换模型)
        {
            const s = new Scenario('callbacks');
            const chatId = ADMIN_ID;

            const providerIdx = (await botClient.getConfig()).chatProviders.findIndex((p: any) => p.id === 'mock-chat');

            // 第一步 → 第二步:点 provider 展示它的模型列表(不改配置)
            telegram.reset();
            await botClient.sendUpdate(
                callbackQuery({ data: `ml:${providerIdx}:0`, userId: ADMIN_ID, chatId, messageId: 4999 }),
                SECRET_TOKEN,
            );
            const modelKeyboard = telegram.lastMessage(chatId)?.keyboard as any;
            s.expect(
                'provider click lists models',
                (modelKeyboard?.inline_keyboard ?? [])
                    .flat()
                    .some((b: any) => String(b.callback_data).startsWith('m:')),
            );
            s.expectIncludes('provider click shows label', telegram.lastText(chatId), 'mock-chat');
            s.expectEq(
                'provider click does not switch model',
                (await botClient.getConfig()).chatProviders[providerIdx].model,
                'mock-model',
            );

            // 返回按钮回到 provider 列表
            telegram.reset();
            await botClient.sendUpdate(
                callbackQuery({ data: `mp:0`, userId: ADMIN_ID, chatId, messageId: 4999 }),
                SECRET_TOKEN,
            );
            s.expect(
                'back button returns to provider list',
                ((telegram.lastMessage(chatId)?.keyboard as any)?.inline_keyboard ?? [])
                    .flat()
                    .some((b: any) => String(b.callback_data).startsWith('ml:')),
            );

            // 切到第二个模型: m:{providerIdx}:{modelIdx}
            telegram.reset();
            await botClient.sendUpdate(
                callbackQuery({ data: `m:${providerIdx}:1`, userId: ADMIN_ID, chatId, messageId: 5000 }),
                SECRET_TOKEN,
            );
            s.expect('callback answered', telegram.callsFor('answerCallbackQuery').length >= 1);
            s.expect('message edited', telegram.callsFor('editMessageText').length >= 1);
            const updated = await botClient.getConfig();
            s.expectEq('default provider switched', updated.chatProviders[providerIdx].model, 'mock-model-2');
            s.expectEq('defaultChatProvider set', updated.defaultChatProvider, 'mock-chat');

            // 在群组里普通成员点击 → 无权
            await harness.applyConfig({ settings: { allowedGroupIds: [`${GROUP_ID}`] } });
            telegram.addMember(GROUP_ID, { userId: 7, status: 'member' });
            telegram.reset();
            await botClient.sendUpdate(
                callbackQuery({
                    data: `m:${providerIdx}:0`,
                    userId: 7,
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    messageId: 5001,
                }),
                SECRET_TOKEN,
            );
            const answered = telegram.callsFor('answerCallbackQuery').at(-1);
            s.expectIncludes('non-admin group callback denied', JSON.stringify(answered?.body ?? {}), 'No permission');
            s.finish();
        }

        // --------------------------------------------- 8. 群聊提及与权限路由
        {
            const s = new Scenario('group chat');
            await harness.applyConfig({
                settings: {
                    allowedGroupIds: [`${GROUP_ID}`],
                    groupChatBotShareMode: false,
                    allowedUserIds: [`${WHITELIST_USER}`],
                },
            });
            telegram.addMember(GROUP_ID, { userId: ADMIN_ID, status: 'administrator' });

            // 不带 @bot 的群消息 → 忽略
            telegram.reset();
            await botClient.sendUpdate(
                textMessage({ chatId: GROUP_ID, chatType: 'supergroup', userId: ADMIN_ID, text: 'just talking' }),
                SECRET_TOKEN,
            );
            s.expectEq('group message without mention ignored', telegram.sentFor(GROUP_ID).length, 0);

            // 带 @bot 的群消息 → 响应,且去除 @mention
            telegram.reset();
            llm.reset();
            await botClient.sendUpdate(
                mentionMessage({ chatId: GROUP_ID, chatType: 'supergroup', userId: ADMIN_ID, text: 'what is up' }),
                SECRET_TOKEN,
            );
            s.expect('group message with mention answered', telegram.sentFor(GROUP_ID).length >= 1);
            const requested = JSON.stringify(llm.lastChatRequest()?.messages ?? []);
            s.expect(
                'mention stripped from prompt',
                requested.includes('what is up') && !requested.includes('@e2e_bot'),
            );

            // 群组内的 @bot 命令(如 /new@e2e_bot)→ 按命令处理
            telegram.reset();
            await botClient.sendUpdate(
                groupCommand({ chatId: GROUP_ID, chatType: 'supergroup', userId: ADMIN_ID, command: '/new' }),
                SECRET_TOKEN,
            );
            s.expect('group /new@bot answered', telegram.sentFor(GROUP_ID).length >= 1);

            // 回复 bot 的消息 → 即使没有 @ 也响应(bot id 来自 token 前缀)
            telegram.reset();
            const botId = Number.parseInt(BOT_TOKEN.split(':')[0]);
            await botClient.sendUpdate(
                textMessage({
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    userId: ADMIN_ID,
                    text: 'follow up',
                    replyTo: {
                        message_id: 1,
                        date: 0,
                        chat: { id: GROUP_ID, type: 'supergroup' },
                        from: { id: botId, is_bot: true, first_name: 'Bot' },
                        text: 'earlier',
                    } as any,
                }),
                SECRET_TOKEN,
            );
            s.expect('reply-to-bot answered', telegram.sentFor(GROUP_ID).length >= 1);
            s.finish();
        }

        // ------------------------------------------------ 9. 插件与自定义命令
        {
            const s = new Scenario('plugins & custom commands');
            const chatId = WHITELIST_USER;
            await harness.applyConfig({
                settings: { allowedUserIds: [`${WHITELIST_USER}`], streamMode: false },
                // 插件把 /ping 转发到 mock LLM 的 /models,并把响应文本发回
                plugins: [
                    {
                        id: 'ping',
                        command: '/ping',
                        description: 'ping plugin',
                        scope: ['all_private_chats'],
                        template: JSON.stringify({
                            url: `${llmUrl}/v1/models`,
                            method: 'GET',
                            headers: {},
                            input: { type: 'text', required: false },
                            query: {},
                            body: { type: 'json', content: {} },
                            response: {
                                content: { input_type: 'json', output_type: 'text', output: 'model ${DATA}' },
                                error: { input_type: 'text', output_type: 'text', output: 'error' },
                            },
                        }),
                        env: {},
                        enabled: true,
                    },
                ],
                customCommands: [
                    {
                        id: 'alias',
                        command: '/pingme',
                        description: 'alias to /help',
                        scope: [],
                        value: '/help',
                        enabled: true,
                    },
                    {
                        id: 'setenv',
                        command: '/setu',
                        description: 'set language',
                        scope: [],
                        value: '/setenv settings.language=en',
                        enabled: true,
                    },
                ],
            });

            // 插件命令
            telegram.reset();
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: '/ping' }), SECRET_TOKEN);
            s.expect('plugin produced a reply', telegram.sentFor(chatId).length >= 1);

            // 自定义命令别名 → /help
            telegram.reset();
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: '/pingme' }), SECRET_TOKEN);
            s.expectIncludes('custom alias ran /help', telegram.lastText(chatId), '/new');

            // 自定义命令作为配置快捷指令(管理员)
            telegram.reset();
            await botClient.sendUpdate(
                textMessage({ chatId: ADMIN_ID, userId: ADMIN_ID, text: '/setu' }),
                SECRET_TOKEN,
            );
            s.expectIncludes('custom shortcut applied', telegram.lastText(ADMIN_ID), 'Update config success');
            s.expectEq('shortcut persisted', (await botClient.getConfig()).settings.language, 'en');

            // 非管理员在私聊用配置快捷指令 → 拒绝
            telegram.reset();
            await botClient.sendUpdate(
                textMessage({ chatId, userId: WHITELIST_USER, text: '/setenv settings.language=zh-cn' }),
                SECRET_TOKEN,
            );
            s.expectIncludes('non-admin shortcut denied', telegram.lastText(chatId), 'Permission denied');

            // 管理员直接使用 /setenv
            telegram.reset();
            await botClient.sendUpdate(
                textMessage({
                    chatId: ADMIN_ID,
                    userId: ADMIN_ID,
                    text: '/setenv settings.systemInitMessage=from-shortcut',
                }),
                SECRET_TOKEN,
            );
            s.expectIncludes('admin /setenv applied', telegram.lastText(ADMIN_ID), 'Update config success');
            s.expectEq('setenv persisted', (await botClient.getConfig()).settings.systemInitMessage, 'from-shortcut');

            // /delenv 还原默认
            telegram.reset();
            await botClient.sendUpdate(
                textMessage({ chatId: ADMIN_ID, userId: ADMIN_ID, text: '/delenv settings.systemInitMessage' }),
                SECRET_TOKEN,
            );
            s.expectEq('delenv reset to default', (await botClient.getConfig()).settings.systemInitMessage, null);
            s.finish();
        }

        // ------------------------------------- 9b. 群管理员配置写入权限边界(安全回归)
        {
            const s = new Scenario('group admin config authority');
            const GROUP_ADMIN = 2002;
            await harness.applyConfig({
                settings: {
                    allowedUserIds: [`${WHITELIST_USER}`],
                    allowedGroupIds: [`${GROUP_ID}`],
                    groupChatBotShareMode: false,
                },
                customCommands: [
                    {
                        id: 'setenv',
                        command: '/setu',
                        description: 'set language',
                        scope: [],
                        value: '/setenv settings.language=en',
                        enabled: true,
                    },
                ],
            });
            telegram.addMember(GROUP_ID, { userId: GROUP_ADMIN, status: 'administrator' });
            const apiDomainBefore = (await botClient.getConfig()).settings.telegramApiDomain;

            // 群管理员:凭据/传输/访问控制/指令类键必须被拒(安全审核 finding 1 / 7)
            for (const key of [
                'telegramApiDomain',
                'publicBaseUrl',
                'systemInitMessage',
                'allowAllUsers',
                'safeMode',
            ]) {
                telegram.reset();
                await botClient.sendUpdate(
                    groupCommand({
                        chatId: GROUP_ID,
                        chatType: 'supergroup',
                        userId: GROUP_ADMIN,
                        command: `/setenv settings.${key}=1`,
                    }),
                    SECRET_TOKEN,
                );
                s.expectIncludes(
                    `group admin denied settings.${key}`,
                    telegram.lastText(GROUP_ID),
                    'not permitted for group admins',
                );
            }
            telegram.reset();
            await botClient.sendUpdate(
                groupCommand({
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    userId: GROUP_ADMIN,
                    command: `/setenvs {"plugins":[{"id":"pwn","command":"/pwn","template":"{}"}]}`,
                }),
                SECRET_TOKEN,
            );
            s.expectIncludes(
                'group admin denied plugin injection',
                telegram.lastText(GROUP_ID),
                'not permitted for group admins',
            );
            telegram.reset();
            await botClient.sendUpdate(
                groupCommand({
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    userId: GROUP_ADMIN,
                    command: `/setenv chatProviders.mock-chat.baseUrl=https://evil.example/v1`,
                }),
                SECRET_TOKEN,
            );
            s.expectIncludes(
                'group admin denied provider baseUrl',
                telegram.lastText(GROUP_ID),
                'not permitted for group admins',
            );
            // 复核补强:改协议(confused-deputy,会把已存凭据发往别的默认主机)同样被拒
            telegram.reset();
            await botClient.sendUpdate(
                groupCommand({
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    userId: GROUP_ADMIN,
                    command: `/setenv chatProviders.mock-chat.protocol=anthropic-messages`,
                }),
                SECRET_TOKEN,
            );
            s.expectIncludes(
                'group admin denied provider protocol',
                telegram.lastText(GROUP_ID),
                'not permitted for group admins',
            );
            // 复核补强:updateBranch 会拼进 GitHub 出站 fetch(可被目录穿越),必须被拒
            telegram.reset();
            await botClient.sendUpdate(
                groupCommand({
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    userId: GROUP_ADMIN,
                    command: `/setenv settings.updateBranch=evil`,
                }),
                SECRET_TOKEN,
            );
            s.expectIncludes(
                'group admin denied settings.updateBranch',
                telegram.lastText(GROUP_ID),
                'not permitted for group admins',
            );
            // 复核补强:historyImagePlaceholder 会进入所有会话的模型上下文
            telegram.reset();
            await botClient.sendUpdate(
                groupCommand({
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    userId: GROUP_ADMIN,
                    command: `/setenv settings.historyImagePlaceholder=inject`,
                }),
                SECRET_TOKEN,
            );
            s.expectIncludes(
                'group admin denied historyImagePlaceholder',
                telegram.lastText(GROUP_ID),
                'not permitted for group admins',
            );
            s.expectEq(
                'rejected patch did not persist',
                (await botClient.getConfig()).settings.telegramApiDomain,
                apiDomainBefore,
            );

            // 合法委派必须保留:切换默认 provider 仍成功
            telegram.reset();
            await botClient.sendUpdate(
                groupCommand({
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    userId: GROUP_ADMIN,
                    command: `/setenv defaultChatProvider=mock-chat`,
                }),
                SECRET_TOKEN,
            );
            s.expectIncludes(
                'group admin default switch applied',
                telegram.lastText(GROUP_ID),
                'Update config success',
            );
            s.expectEq('default switch persisted', (await botClient.getConfig()).defaultChatProvider, 'mock-chat');

            // 合法委派必须保留:切换已有 provider 的 model 仍成功
            telegram.reset();
            await botClient.sendUpdate(
                groupCommand({
                    chatId: GROUP_ID,
                    chatType: 'supergroup',
                    userId: GROUP_ADMIN,
                    command: `/setenv chatProviders.mock-chat.model=mock-model-2`,
                }),
                SECRET_TOKEN,
            );
            s.expectIncludes('group admin model switch applied', telegram.lastText(GROUP_ID), 'Update config success');

            // 非管理员触发的自定义配置快捷指令按调用者身份被拒
            telegram.reset();
            await botClient.sendUpdate(
                textMessage({ chatId: WHITELIST_USER, userId: WHITELIST_USER, text: '/setu' }),
                SECRET_TOKEN,
            );
            s.expectIncludes(
                'custom shortcut by non-admin denied',
                telegram.lastText(WHITELIST_USER),
                'Permission denied',
            );
            s.finish();
        }

        // --------------------------------------------------- 10. 图片消息下载
        {
            const s = new Scenario('image message');
            const chatId = WHITELIST_USER;
            // 注册一个可被 getFile 下载的图片
            const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
            const file = telegram.addFile({ fileId: 'photo-1', content: pngBytes, contentType: 'image/png' });
            s.expect('file registered for download', file.filePath.length > 0);
            await harness.applyConfig({
                settings: { allowedUserIds: [`${WHITELIST_USER}`], telegramImageTransferMode: 'base64' },
            });
            telegram.reset();
            llm.reset();
            await botClient.sendUpdate(
                photoMessage({ chatId, userId: WHITELIST_USER, caption: 'what is this', fileId: 'photo-1' }),
                SECRET_TOKEN,
            );
            s.expect('getFile called', telegram.callsFor('getFile').length >= 1);
            s.expectEq('file path requested', telegram.callsFor('getFile')[0]?.body?.file_id, 'photo-1');
            const messages = llm.lastChatRequest()?.messages ?? [];
            const content = JSON.stringify(messages);
            s.expect('image inlined as data URI', content.includes('data:image'));
            s.expectIncludes('caption preserved', content, 'what is this');
            s.finish();
        }

        // --------------------------------------------------- 10b. 图片生成 /img
        {
            const s = new Scenario('image generation');
            const chatId = ADMIN_ID;
            await harness.applyConfig({
                settings: { allowedUserIds: [`${ADMIN_ID}`], streamMode: false },
                imageProviders: [
                    {
                        id: 'mock-image',
                        protocol: 'images',
                        baseUrl: `${llmUrl}/v1`,
                        model: 'mock-image-model',
                        extraParams: { size: '1792x1024', quality: 'hd' },
                    },
                ],
            });
            telegram.reset();
            llm.reset();
            await botClient.sendUpdate(
                textMessage({ chatId, userId: ADMIN_ID, text: '/img a cat wearing a hat' }),
                SECRET_TOKEN,
            );
            const imageRequest = llm.lastImageRequest();
            s.expect('image endpoint called', !!imageRequest);
            s.expectEq('prompt forwarded', imageRequest?.prompt, 'a cat wearing a hat');
            s.expectEq('configured image model used', imageRequest?.model, 'mock-image-model');
            s.expectEq('provider extraParams merged into the request', imageRequest?.size, '1792x1024');
            s.expectEq('provider extraParams merged into the request', imageRequest?.quality, 'hd');
            s.expect('photo sent back', telegram.callsFor('sendPhoto').length >= 1);
            s.finish();
        }

        // ------------------------------------------------------- 11. 错误注入
        {
            const s = new Scenario('error injection');
            const chatId = WHITELIST_USER;
            await harness.applyConfig({ settings: { allowedUserIds: [`${WHITELIST_USER}`], streamMode: false } });

            // 429 on send:bot 记录 Retry-After,但仍会继续(首个 '...' 占位消息被限流)
            telegram.reset();
            telegram.failNext('sendMessage', { status: 429, retryAfter: 1 });
            llm.reset();
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: 'ping' }), SECRET_TOKEN);
            s.expect('429 did not crash the pipeline', llm.lastChatRequest() !== undefined);
            s.expect('some outbound after 429', telegram.sentFor(chatId).length >= 1);
            telegram.clearInjections();

            // MarkdownV2 解析失败 → sender 回退纯文本分片
            await harness.applyConfig({
                settings: { allowedUserIds: [`${WHITELIST_USER}`], defaultParseMode: 'MarkdownV2' },
                chatProviders: [
                    { id: 'mock-chat', baseUrl: `${llmUrl}/v1`, model: 'mock-model', models: ['mock-model'] },
                ],
            });
            telegram.reset();
            telegram.failWhen('sendMessage', c => c.body?.parse_mode === 'MarkdownV2', {
                status: 400,
                description: "Bad Request: can't parse entities",
            });
            await botClient.sendUpdate(textMessage({ chatId, userId: WHITELIST_USER, text: 'hello' }), SECRET_TOKEN);
            const plainFallback = telegram.sentFor(chatId).some(m => m.parseMode === null && m.text.length > 0);
            s.expect('falls back to plain text', plainFallback, JSON.stringify(telegram.textsFor(chatId)));
            telegram.clearInjections();
            s.finish();
        }

        // ------------------------------------------------------- 12. streaming
        {
            const s = new Scenario('streaming');
            const chatId = WHITELIST_USER;
            await harness.applyConfig({
                settings: { allowedUserIds: [`${WHITELIST_USER}`], streamMode: true, telegramMinStreamInterval: 0 },
                chatProviders: [
                    { id: 'mock-chat', baseUrl: `${llmUrl}/v1`, model: 'mock-model', models: ['mock-model'] },
                ],
            });
            llm.setStream({ chunks: ['Hello ', 'from ', 'the ', 'stream!'], delayMs: 0 });
            telegram.reset();
            await botClient.sendUpdate(
                textMessage({ chatId, userId: WHITELIST_USER, text: 'stream please' }),
                SECRET_TOKEN,
            );
            const texts = telegram.textsFor(chatId);
            s.expect(
                'streaming produced edits',
                telegram.callsFor('editMessageText').length >= 1,
                JSON.stringify(texts),
            );
            s.expect(
                'final text contains streamed content',
                texts.some(t => t.includes('stream')),
                JSON.stringify(texts),
            );
            s.finish();
        }
    } finally {
        await harness.close();
    }
}

// -------------------------------------------------------------------- main

const timer = setTimeout(() => {
    console.error(`E2E timed out after ${OVERALL_TIMEOUT_MS}ms`);
    process.exit(1);
}, OVERALL_TIMEOUT_MS);

run()
    .then(() => {
        clearTimeout(timer);
        if (failed.length) {
            console.error(`\nE2E FAILED: ${failed.length} check(s):\n  - ${failed.join('\n  - ')}`);
            process.exit(1);
        }
        console.log(`\nE2E PASSED: ${passed.length} checks`);
    })
    .catch(e => {
        clearTimeout(timer);
        console.error(e);
        process.exit(1);
    });
