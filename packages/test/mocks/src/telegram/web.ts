import type * as Telegram from 'telegram-bot-api-types';
import type { SendMessageOptions, WebChatSeed, WebMessage, WebState } from './web-types';
import type { TelegramMock } from './mock';

export interface TelegramWebOptions {
    /** 运行中的 bot 基址,例如 http://127.0.0.1:8787 */
    botBaseUrl: string;
    /** bot token(用于拼 webhook 路径) */
    token: string;
    /** 若 bot 校验 secret_token,这里填入相同的值 */
    secretToken?: string;
    /** 预置的会话 */
    chats?: WebChatSeed[];
}

interface WebChat {
    id: number;
    type: 'private' | 'group' | 'supergroup';
    title: string;
    userId: number;
    userName: string;
    isBot?: boolean;
}

/**
 * 模拟的 Telegram Web 客户端(浏览器可用):
 * 一个极简聊天界面,能像真人一样发消息、点按钮,并在浏览器里看到 bot 的回复。
 *
 * 它不是一个独立后端:所有状态都取自 `TelegramMock`(bot 出站消息),
 * 发送的用户操作则被翻译成 Update,投递到 bot 的 webhook —— 与真实 Telegram 的分工一致。
 *
 * 由 `startBotHarness` 挂载到本地服务的 `/web` 路径下。
 */
export class TelegramWebClient {
    private readonly chats: WebChat[] = [];
    private nextMessageId = 1;

    constructor(
        private readonly telegram: TelegramMock,
        private readonly options: TelegramWebOptions,
    ) {
        for (const chat of options.chats ?? []) {
            this.addChat(chat);
        }
    }

    addChat(seed: WebChatSeed): WebChat {
        const existing = this.chats.find(c => c.id === seed.id);
        if (existing) {
            return existing;
        }
        const chat: WebChat = {
            id: seed.id,
            type: seed.type,
            title: seed.title,
            userId: seed.userId,
            userName: seed.userName ?? 'You',
            isBot: seed.isBot,
        };
        this.chats.push(chat);
        return chat;
    }

    /** 代理到 mock 的 fetch:`/web` 与 `/web/api/*` 由本类处理,其余交给调用方路由 */
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        if (url.pathname === '/web' || url.pathname === '/web/') {
            return html(PAGE);
        }
        if (url.pathname === '/web/api/state') {
            return json(this.state());
        }
        if (url.pathname === '/web/api/send' && request.method === 'POST') {
            const body = (await request.json()) as SendMessageOptions;
            return json(await this.send(body));
        }
        if (url.pathname === '/web/api/click' && request.method === 'POST') {
            const body = (await request.json()) as { chatId: number; userId: number; data: string };
            return json(await this.click(body));
        }
        return json({ error: 'not found' }, 404);
    }

    private state(): WebState {
        return {
            chats: this.chats.map(chat => ({ ...chat })),
            messages: this.telegram.sentForAll().map(message => ({
                id: message.messageId,
                chatId: message.chatId,
                text: message.text || message.caption || '(non-text)',
                fromBot: true,
                parseMode: message.parseMode ?? null,
                keyboard: extractKeyboard(message.keyboard),
            })),
        };
    }

    private chatOf(chatId: number): WebChat | undefined {
        return this.chats.find(c => c.id === chatId);
    }

    private async send(options: SendMessageOptions): Promise<{ ok: boolean; chatId: number }> {
        const chat = this.chatOf(options.chatId);
        if (!chat) {
            return { ok: false, chatId: options.chatId };
        }
        const entity = chat.type === 'private' ? undefined : this.mentionEntity(options.text);
        const update: Telegram.Update = {
            update_id: this.nextMessageId++,
            message: {
                message_id: this.nextMessageId++,
                date: Math.floor(Date.now() / 1000),
                chat: chatAsTelegramChat(chat),
                from: { id: options.userId ?? chat.userId, is_bot: false, first_name: chat.userName },
                text: options.text,
                entities: entity,
            },
        };
        await this.deliver(update);
        return { ok: true, chatId: chat.id };
    }

    private async click(options: { chatId: number; userId: number; data: string }): Promise<{ ok: boolean }> {
        const chat = this.chatOf(options.chatId);
        if (!chat) {
            return { ok: false };
        }
        const last = this.telegram
            .sentForAll()
            .filter(m => m.chatId === chat.id)
            .at(-1);
        const update: Telegram.Update = {
            update_id: this.nextMessageId++,
            callback_query: {
                id: `cb-${this.nextMessageId}`,
                from: { id: options.userId, is_bot: false, first_name: chat.userName },
                chat_instance: 'web',
                data: options.data,
                message: {
                    message_id: last?.messageId ?? 1,
                    date: Math.floor(Date.now() / 1000),
                    chat: chatAsTelegramChat(chat),
                    text: last?.text,
                },
            },
        };
        await this.deliver(update);
        return { ok: true };
    }

    /** 把 Update 投递到 bot 的 webhook,与真实 Telegram 服务端行为一致 */
    private async deliver(update: Telegram.Update): Promise<void> {
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        if (this.options.secretToken) {
            headers['X-Telegram-Bot-Api-Secret-Token'] = this.options.secretToken;
        }
        try {
            await fetch(`${this.options.botBaseUrl}/telegram/${this.options.token}/webhook`, {
                method: 'POST',
                headers,
                body: JSON.stringify(update),
            });
        } catch {
            // 测试环境下忽略网络错误,状态查询会反映缺失的回复
        }
    }

    private mentionEntity(text: string): Telegram.MessageEntity[] | undefined {
        const username = this.telegram.botUsername;
        const mention = `@${username}`;
        const index = text.indexOf(mention);
        if (index === -1) {
            return undefined;
        }
        return [{ type: 'mention', offset: index, length: mention.length }];
    }
}

function chatAsTelegramChat(chat: WebChat): Telegram.Chat {
    if (chat.type === 'private') {
        return { id: chat.id, type: 'private', first_name: chat.userName };
    }
    return { id: chat.id, type: chat.type, title: chat.title };
}

function extractKeyboard(keyboard: unknown): WebMessage['keyboard'] {
    const rows = (keyboard as { inline_keyboard?: { text: string; callback_data?: string }[][] })?.inline_keyboard;
    if (!Array.isArray(rows)) {
        return [];
    }
    return rows.map(row => row.map(button => ({ text: button.text, data: button.callback_data ?? '' })));
}

function json(payload: unknown, status = 200): Response {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

function html(body: string): Response {
    return new Response(body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Mock Telegram</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; font: 15px/1.5 -apple-system, system-ui, sans-serif; display: flex; height: 100vh; }
  #sidebar { width: 220px; border-right: 1px solid #8883; overflow-y: auto; }
  #sidebar button { display: block; width: 100%; text-align: left; padding: 12px; border: 0; background: none; cursor: pointer; }
  #sidebar button.active { background: #4a90d922; }
  #sidebar small { opacity: .6; display: block; }
  main { flex: 1; display: flex; flex-direction: column; }
  #log { flex: 1; overflow-y: auto; padding: 12px; }
  .msg { max-width: 70%; margin: 6px 0; padding: 8px 12px; border-radius: 12px; white-space: pre-wrap; word-break: break-word; }
  .bot { background: #4a90d922; }
  .me { background: #8882; margin-left: auto; }
  .meta { font-size: 11px; opacity: .55; margin-bottom: 2px; }
  #keyboard { padding: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
  #keyboard button { padding: 6px 10px; border-radius: 8px; border: 1px solid #8885; background: none; cursor: pointer; }
  form { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #8883; }
  input[name=text] { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #8885; background: none; }
  button[type=submit] { padding: 10px 16px; border-radius: 8px; border: 0; background: #4a90d9; color: #fff; cursor: pointer; }
</style>
</head>
<body>
  <nav id="sidebar" aria-label="Chats"></nav>
  <main>
    <div id="log" role="log" aria-live="polite"></div>
    <div id="keyboard"></div>
    <form id="composer">
      <input name="text" placeholder="Message" autocomplete="off" aria-label="Message" />
      <button type="submit">Send</button>
    </form>
  </main>
<script>
const state = { chats: [], messages: [], active: null };

async function api(path, body) {
  const res = await fetch('/web/api/' + path, body
    ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
    : undefined);
  return res.json();
}

function render() {
  const sidebar = document.getElementById('sidebar');
  sidebar.replaceChildren(...state.chats.map(chat => {
    const btn = document.createElement('button');
    btn.className = state.active === chat.id ? 'active' : '';
    const name = document.createElement('span');
    name.textContent = chat.title;
    const sub = document.createElement('small');
    sub.textContent = chat.type;
    btn.append(name, sub);
    btn.onclick = () => { state.active = chat.id; render(); };
    return btn;
  }));

  const log = document.getElementById('log');
  log.replaceChildren(...state.messages.filter(m => m.chatId === state.active).map(m => {
    const el = document.createElement('div');
    el.className = 'msg ' + (m.fromBot ? 'bot' : 'me');
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = m.fromBot ? 'bot' : 'you';
    const text = document.createElement('div');
    text.textContent = m.text;
    el.append(meta, text);
    return el;
  }));
  log.scrollTop = log.scrollHeight;

  const latest = [...state.messages].reverse().find(m => m.chatId === state.active && m.fromBot && m.keyboard.length);
  const kb = document.getElementById('keyboard');
  kb.replaceChildren(...((latest && latest.keyboard.flat()) || []).map(button => {
    const b = document.createElement('button');
    b.textContent = button.text;
    b.onclick = async () => { await api('click', { chatId: state.active, userId: userId(), data: button.data }); await refresh(); };
    return b;
  }));
}

function userId() {
  const chat = state.chats.find(c => c.id === state.active);
  return chat ? chat.userId : 0;
}

async function refresh() {
  const next = await api('state');
  state.chats = next.chats;
  state.messages = next.messages;
  if (state.active === null && state.chats.length) state.active = state.chats[0].id;
  render();
}

document.getElementById('composer').addEventListener('submit', async e => {
  e.preventDefault();
  const input = e.target.elements.text;
  const text = input.value.trim();
  if (!text || state.active === null) return;
  state.messages.push({ id: Date.now(), chatId: state.active, text, fromBot: false, keyboard: [] });
  input.value = '';
  render();
  await api('send', { chatId: state.active, userId: userId(), text });
  await refresh();
});

refresh();
setInterval(refresh, 700);
window.__mockTelegramReady = true;
</script>
</body>
</html>`;
