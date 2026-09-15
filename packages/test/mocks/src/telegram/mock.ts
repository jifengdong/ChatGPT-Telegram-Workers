import type * as Telegram from 'telegram-bot-api-types';
import type { ErrorInjection, MethodHandler, RecordedCall } from '../shared/types';
import type { MockChat, MockFile, MockMember, SentMessage, TelegramMockOptions } from './types';
import { DEFAULT_BOT_ID, DEFAULT_BOT_USERNAME } from './fixtures';

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

interface ConsumedInjection extends ErrorInjection {
    times: number;
}

/**
 * 有状态的 Telegram Bot API mock。
 *
 * - 核心是平台无关的 `fetch(request)`,node / workerd 都能跑;
 * - 按方法分派并维护聊天、成员、文件、消息与 update 队列状态;
 * - 支持错误注入(429 / 400 等)与自定义方法响应,便于覆盖失败分支;
 * - 记录所有出站调用与 bot 发出的消息,便于断言。
 *
 * 基址通过 `settings.telegramApiDomain` 指向本 mock 即可完全离线运行。
 */
export class TelegramMock {
    readonly token: string;
    readonly secretToken: string | null;
    private readonly botId: number;
    private readonly botUsernameValue: string;
    /** getUpdates 空队列时的长轮询等待,避免测试进程忙等 */
    pollDelayMs = 25;

    private readonly chats = new Map<number, MockChat>();
    private readonly members = new Map<string, MockMember>();
    private readonly filesByPath = new Map<string, MockFile>();
    private readonly filesById = new Map<string, MockFile>();
    private readonly outbound: SentMessage[] = [];
    private readonly recorded: RecordedCall[] = [];
    private readonly injections: ConsumedInjection[] = [];
    private readonly handlers = new Map<string, MethodHandler>();
    private pendingUpdates: Telegram.Update[] = [];
    private updateSeq = 1;
    private messageIdSeq = 1;
    private webhookUrl: string | null = null;
    private webhookSecretValue: string | null = null;

    constructor(options: TelegramMockOptions = {}) {
        this.token = options.token ?? '123456:E2E';
        this.secretToken = options.secretToken ?? null;
        this.botId = options.botId ?? DEFAULT_BOT_ID;
        this.botUsernameValue = options.botUsername ?? DEFAULT_BOT_USERNAME;
    }

    // ---------------------------------------------------------------- seeding

    addChat(chat: MockChat): MockChat {
        this.chats.set(chat.id, chat);
        return chat;
    }

    addMember(chatId: number, member: MockMember): MockMember {
        this.members.set(`${chatId}:${member.userId}`, member);
        return member;
    }

    /** 注册一个可下载文件;bot 的 getFile 会返回其 file_path */
    addFile(file: Partial<MockFile> & { content: Uint8Array }): MockFile {
        const created: MockFile = {
            fileId: file.fileId ?? `file-${this.filesByPath.size + 1}`,
            filePath: file.filePath ?? `photos/file-${this.filesByPath.size + 1}.png`,
            contentType: file.contentType ?? 'image/png',
            content: file.content,
        };
        this.filesByPath.set(created.filePath, created);
        this.filesById.set(created.fileId, created);
        return created;
    }

    // ------------------------------------------------------- behavior control

    /** 下一次匹配该方法的调用返回错误 */
    failNext(method: string, error: Omit<ErrorInjection, 'method'> = {}): void {
        this.injections.push({ method, times: 1, ...error });
    }

    /** 该方法的所有后续调用都返回错误(直到 clearInjections) */
    failAlways(method: string, error: Omit<ErrorInjection, 'method'> = {}): void {
        this.injections.push({ method, times: Infinity, ...error });
    }

    /** 条件性错误注入 */
    failWhen(
        method: string,
        when: (call: RecordedCall) => boolean,
        error: Omit<ErrorInjection, 'method' | 'when'> = {},
    ): void {
        this.injections.push({ method, times: Infinity, when, ...error });
    }

    clearInjections(): void {
        this.injections.length = 0;
    }

    /** 覆盖某个方法的默认响应(返回值作为 `result`) */
    on(method: string, handler: MethodHandler): void {
        this.handlers.set(method, handler);
    }

    // ------------------------------------------------------------- update glue

    /** 入队一个 update(供 getUpdates 长轮询拉取) */
    enqueueUpdate(update: Telegram.Update): number {
        const updateId = update.update_id ?? this.updateSeq++;
        this.pendingUpdates.push({ ...update, update_id: updateId });
        return updateId;
    }

    // ------------------------------------------------------------- inspection

    get calls(): RecordedCall[] {
        return [...this.recorded];
    }

    /** getMe 返回的 bot 用户名(web client 生成 @mention 用) */
    get botUsername(): string {
        return this.botUsernameValue;
    }

    /** 所有 bot 出站消息(跨聊天,按时间顺序) */
    sentForAll(): SentMessage[] {
        return [...this.outbound];
    }

    callsFor(method: string): RecordedCall[] {
        return this.recorded.filter(call => call.method === method);
    }

    lastCall(method: string): RecordedCall | undefined {
        return this.callsFor(method).at(-1);
    }

    /** bot 发往某聊天的消息(按时间顺序) */
    sentFor(chatId: number): SentMessage[] {
        return this.outbound.filter(message => message.chatId === chatId);
    }

    lastMessage(chatId: number): SentMessage | undefined {
        return this.sentFor(chatId).at(-1);
    }

    /** 最近一条 bot 消息的文本(含 editMessageText 更新后的文本) */
    lastText(chatId: number): string {
        return this.lastMessage(chatId)?.text ?? '';
    }

    textsFor(chatId: number): string[] {
        return this.sentFor(chatId).map(message => message.text);
    }

    get webhook(): string | null {
        return this.webhookUrl;
    }

    /** 最近一次 setWebhook 携带的 secret_token */
    get webhookSecret(): string | null {
        return this.webhookSecretValue;
    }

    /** 清空调用记录、消息记录、注入与状态,以便复用实例 */
    reset(): void {
        this.recorded.length = 0;
        this.outbound.length = 0;
        this.injections.length = 0;
        this.pendingUpdates = [];
        this.updateSeq = 1;
        this.messageIdSeq = 1;
        this.webhookUrl = null;
        this.webhookSecretValue = null;
    }

    // ------------------------------------------------------------------ fetch

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const fileMatch = url.pathname.match(/^\/file\/bot(.+?)\/(.+)$/);
        if (fileMatch) {
            return this.serveFile(fileMatch[2]);
        }

        const apiMatch = url.pathname.match(/\/bot([^/]+)\/([^/]+)$/);
        if (!apiMatch) {
            return this.json({ ok: false, error_code: 404, description: `Unknown path ${url.pathname}` }, 404);
        }
        const [, pathToken, method] = apiMatch;
        const params = await this.readParams(request);
        const requestHeaders: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            requestHeaders[key.toLowerCase()] = value;
        });

        const call: RecordedCall = {
            method,
            path: url.pathname + url.search,
            body: params,
            token: pathToken,
            headers: requestHeaders,
            status: 200,
        };
        this.recorded.push(call);

        const injected = this.takeInjection(call);
        if (injected) {
            call.status = injected.status ?? 400;
            const headers: Record<string, string> = {};
            if (injected.retryAfter !== undefined) {
                headers['Retry-After'] = `${injected.retryAfter}`;
            }
            return this.json(
                {
                    ok: false,
                    error_code: injected.errorCode ?? call.status,
                    description: injected.description ?? `Mock error for ${method}`,
                },
                call.status,
                headers,
            );
        }

        if (pathToken !== this.token && this.token) {
            call.status = 401;
            return this.json({ ok: false, error_code: 401, description: 'Unauthorized' }, 401);
        }

        const handler = this.handlers.get(method);
        try {
            const result = handler ? await handler(call) : await this.defaultResult(method, params);
            if (result instanceof Response) {
                call.status = result.status;
                return result;
            }
            return this.json({ ok: true, result: result ?? true });
        } catch (e) {
            call.status = 400;
            return this.json({ ok: false, error_code: 400, description: (e as Error).message }, 400);
        }
    }

    // ---------------------------------------------------------------- internals

    private async readParams(request: Request): Promise<any> {
        if (request.method === 'GET') {
            return Object.fromEntries(new URL(request.url).searchParams.entries());
        }
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('multipart/form-data')) {
            const form = await request.formData();
            const out: Record<string, any> = {};
            for (const [key, value] of form.entries()) {
                if (typeof value === 'string') {
                    out[key] = this.tryJSON(value);
                } else {
                    out[key] = {
                        filename: (value as File).name,
                        size: (value as File).size,
                        type: (value as File).type,
                    };
                }
            }
            return out;
        }
        try {
            return await request.json();
        } catch {
            return {};
        }
    }

    private tryJSON(value: string): any {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    private takeInjection(call: RecordedCall): ConsumedInjection | null {
        for (const injection of this.injections) {
            if (injection.method !== '*' && injection.method !== call.method) {
                continue;
            }
            if (injection.when && !injection.when(call)) {
                continue;
            }
            injection.times -= 1;
            if (injection.times <= 0) {
                const index = this.injections.indexOf(injection);
                if (index >= 0) {
                    this.injections.splice(index, 1);
                }
            }
            return injection;
        }
        return null;
    }

    private serveFile(filePath: string): Response {
        const file = this.filesByPath.get(filePath);
        if (!file) {
            return this.json({ ok: false, error_code: 404, description: 'File not found' }, 404);
        }
        return new Response(file.content as unknown as BodyInit, {
            status: 200,
            headers: { 'content-type': file.contentType },
        });
    }

    private json(payload: unknown, status = 200, headers: Record<string, string> = {}): Response {
        return new Response(JSON.stringify(payload), {
            status,
            headers: { 'content-type': 'application/json', ...headers },
        });
    }

    private nextMessageId(): number {
        return 1000 + this.messageIdSeq++;
    }

    private recordSend(via: string, params: any): SentMessage {
        const message: SentMessage = {
            messageId: params.message_id ?? this.nextMessageId(),
            chatId: Number(params.chat_id ?? 0),
            via,
            method: via,
            // 图片消息的可读文本在 caption;统一到 text 便于断言
            text: params.text ?? params.caption ?? '',
            caption: params.caption,
            parseMode: params.parse_mode ?? null,
            keyboard: params.reply_markup,
            photo: params.photo,
            raw: params,
        };
        this.outbound.push(message);
        return message;
    }

    private async defaultResult(method: string, params: any): Promise<unknown> {
        switch (method) {
            case 'getMe':
                return {
                    id: this.botId,
                    is_bot: true,
                    first_name: 'E2E Bot',
                    username: this.botUsername,
                    can_join_groups: true,
                    can_read_all_group_messages: false,
                    supports_inline_queries: false,
                };
            case 'setWebhook': {
                this.webhookUrl = params?.url ?? null;
                this.webhookSecretValue = params?.secret_token ?? null;
                return { description: 'Webhook was set' };
            }
            case 'deleteWebhook':
                this.webhookUrl = null;
                return true;
            case 'getWebhookInfo':
                return {
                    url: this.webhookUrl ?? '',
                    has_custom_certificate: false,
                    pending_update_count: this.pendingUpdates.length,
                    max_connections: 40,
                    allowed_updates: [],
                };
            case 'getUpdates': {
                const offset = Number(params?.offset ?? 0);
                if (!this.pendingUpdates.length) {
                    // 模拟长轮询:稍等再返回,避免测试进程忙等
                    await sleep(this.pollDelayMs);
                }
                const available = this.pendingUpdates.filter(update => !offset || (update.update_id ?? 0) >= offset);
                if (available.length) {
                    const maxId = Math.max(...available.map(update => update.update_id ?? 0));
                    this.pendingUpdates = this.pendingUpdates.filter(update => (update.update_id ?? 0) > maxId);
                }
                return available;
            }
            case 'setMyCommands':
                return true;
            case 'setChatMenuButton':
                return true;
            case 'sendMessage':
            case 'sendPhoto': {
                const message = this.recordSend(method, params);
                const result: any = {
                    message_id: message.messageId,
                    date: Math.floor(Date.now() / 1000),
                    chat: this.chatPayload(params?.chat_id),
                };
                if (method === 'sendMessage') {
                    result.text = params?.text;
                } else {
                    result.caption = params?.caption;
                }
                return result;
            }
            case 'editMessageText': {
                const message = this.recordSend('editMessageText', params);
                return {
                    message_id: message.messageId,
                    date: Math.floor(Date.now() / 1000),
                    chat: this.chatPayload(params?.chat_id),
                    text: params?.text,
                };
            }
            case 'editMessageReplyMarkup':
                return {
                    message_id: params?.message_id,
                    date: Math.floor(Date.now() / 1000),
                    chat: this.chatPayload(params?.chat_id),
                };
            case 'answerCallbackQuery':
                return true;
            case 'sendChatAction':
                return true;
            case 'deleteMessage':
                return true;
            case 'getChat':
                return this.chatPayload(params?.chat_id);
            case 'getChatAdministrators':
                return this.adminsOf(Number(params?.chat_id));
            case 'getChatMember':
                return this.memberPayload(Number(params?.chat_id), Number(params?.user_id));
            case 'getFile': {
                const file = this.filesById.get(params?.file_id);
                if (!file) {
                    throw new Error(`File not found: ${params?.file_id}`);
                }
                return {
                    file_id: file.fileId,
                    file_unique_id: `${file.fileId}-u`,
                    file_size: file.content.byteLength,
                    file_path: file.filePath,
                };
            }
            default:
                return true;
        }
    }

    private chatPayload(chatId: unknown): Telegram.Chat {
        const id = Number(chatId);
        const chat = this.chats.get(id);
        return (chat as Telegram.Chat) ?? ({ id, type: id < 0 ? 'supergroup' : 'private' } as Telegram.Chat);
    }

    private adminsOf(chatId: number): Telegram.ChatMember[] {
        const admins: Telegram.ChatMember[] = [];
        for (const [key, member] of this.members.entries()) {
            const [memberChat] = key.split(':');
            if (Number(memberChat) !== chatId) {
                continue;
            }
            if (member.status === 'administrator' || member.status === 'creator') {
                admins.push(this.memberPayload(chatId, member.userId, member.status));
            }
        }
        return admins;
    }

    private memberPayload(chatId: number, userId: number, override?: string): Telegram.ChatMember {
        const member = this.members.get(`${chatId}:${userId}`);
        const status = (override ?? member?.status ?? 'member') as Telegram.ChatMember['status'];
        return {
            status,
            user: {
                id: userId,
                is_bot: member?.isBot ?? false,
                first_name: member?.firstName ?? 'User',
                username: member?.username,
            },
        } as Telegram.ChatMember;
    }
}
