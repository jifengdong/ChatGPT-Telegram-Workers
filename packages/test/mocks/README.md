# @chatgpt-telegram-workers/test-mocks

Reusable, offline test doubles for the ChatGPT-Telegram-Workers bot. Everything has **zero
runtime dependencies** and is transport-agnostic: each mock's core is a plain
`fetch(Request) => Response`, so the exact same logic runs in Node (via the bundled http adapter)
and inside workerd.

```text
src/
  shared/types.ts     RecordedCall / ErrorInjection / MethodHandler
  telegram/           TelegramMock + Update fixtures
  llm/                LLMMock (chat / stream / models / images)
  bot/client.ts       BotClient — drive the bot as "Telegram" + the admin RPC API
  node/server.ts      startLocalServer / startMockServer (node:http adapter)
  harness/            startBotHarness — mock TG + mock LLM + real built bot
  config/builder.ts   buildTestConfig / TEST_SETTINGS
```

## Pieces

### `TelegramMock`

A **stateful** Telegram Bot API mock. Dispatch is per-method and state is kept for chats,
members, files, sent messages and the `getUpdates` queue.

```ts
const mock = new TelegramMock({ token: '123:ABC', botUsername: 'my_bot' });
mock.addMember(-100, { userId: 7, status: 'administrator' });
mock.addFile({ fileId: 'f1', content: pngBytes });
mock.failNext('sendMessage', { status: 429, retryAfter: 2 });
mock.failWhen('sendMessage', c => c.body?.parse_mode === 'MarkdownV2', { status: 400 });

const server = await startMockServer(mock); // node http adapter
// ... point settings.telegramApiDomain at server.url ...

mock.sentFor(chatId);      // messages the bot sent to a chat
mock.lastText(chatId);     // latest text (including edits)
mock.callsFor('getFile');  // recorded inbound calls
mock.webhook;              // URL from the last setWebhook
```

Supported methods: `getMe`, `setWebhook`, `deleteWebhook`, `getWebhookInfo`, `getUpdates`,
`setMyCommands`, `setChatMenuButton`, `sendMessage`, `sendPhoto`, `editMessageText`,
`editMessageReplyMarkup`, `answerCallbackQuery`, `sendChatAction`, `deleteMessage`, `getChat`,
`getChatAdministrators`, `getChatMember`, `getFile` (+ the `/file/bot<token>/<path>` download
endpoint). Any other method returns `true`; override with `mock.on(method, handler)`.

Error injection: `failNext` (one call), `failAlways`, `failWhen(condition)` — with optional
`status`, `errorCode`, `description` and a `Retry-After` header.

### Update fixtures

`textMessage`, `mentionMessage`, `groupCommand`, `photoMessage`, `callbackQuery`,
`serviceMessage`, `botMessage`. Message ids are unique by default so the bot's dedup filter never
swallows a fixture.

### `LLMMock`

OpenAI-compatible `/v1/chat/completions` (JSON or SSE), `/v1/models` and
`/v1/images/generations`. `setStream({ chunks, delayMs, done })` controls streaming, and
`failNext(status, body)` injects errors.

### `BotClient`

Drives the running bot: `sendUpdate` / `sendSafehook` (as Telegram), and
`login` / `rpc` / `getConfig` / `saveConfig` / `bindWebhook` (as the admin UI).

### `TelegramWebClient`

A minimal **mock Telegram Web** chat UI (served at `/web`). Browser automation can act as a real
user: pick a chat, type a message, see the bot's reply, click inline keyboard buttons. Sends are
translated into real `Update`s posted to the bot webhook, so no Telegram login is needed. State is
read back from `TelegramMock`, keeping a single source of truth.

### `startBotHarness`

Boots the whole environment from a built entry point (mock Telegram API + mock LLM + the real built
bot + the web client):

```ts
const harness = await startBotHarness({ entry: 'packages/apps/server/dist/node.js' });
await harness.botClient.login('password');
await harness.applyConfig({ settings: { allowedUserIds: ['1001'] } });
await harness.botClient.sendUpdate(textMessage({ chatId: 1001, userId: 1001, text: 'hi' }));
expect(harness.telegram.lastText(1001)).toContain('Hello');
// 浏览器可打开 `${harness.webUrl}/web`,像真人一样发消息、点按钮
await harness.close();
```

## Tests

```shell
pnpm --filter @chatgpt-telegram-workers/test-mocks test
```
