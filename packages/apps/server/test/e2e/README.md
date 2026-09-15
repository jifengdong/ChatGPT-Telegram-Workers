# Local E2E test

An end-to-end test that exercises the full bot pipeline **without Telegram and without any
external network access**. Run it with:

```shell
pnpm run test:e2e
```

## How it works

Telegram is only ever reached over outbound HTTP to `api.telegram.org`, and that base URL is
configurable through the global config (`settings.telegramApiDomain`). The test therefore:

1. Starts a **stateful mock Telegram Bot API** (`@chatgpt-telegram-workers/test-mocks`) and a
   **mock OpenAI-compatible endpoint** (plain `node:http` servers on random local ports).
2. Boots the real built artifact (`packages/apps/server/dist/node.js`) in webhook mode.
3. Logs in through the JSON-RPC admin API (`admin.login` with `ADMIN_PASSWORD`) and saves a config
   that points `telegramApiDomain` at the Telegram mock and every provider `baseUrl` at the LLM mock.
4. Plays the role of **Telegram itself**, posting many kinds of `Update` to the webhook and
   asserting what the bot sends back through the Telegram mock.

No API keys, tokens, accounts or internet connection are required — every value (`TELEGRAM_TOKEN`,
`ADMIN_ID`, `ADMIN_PASSWORD`, the mock API key) is arbitrary.

The shared harness lives in `packages/test/mocks` (`startBotHarness`), and is reused by the
browser tests in `packages/test/web`.

## What it covers

| Group | Checks |
|---|---|
| `pages` | `/`, `/admin`, `/init`, `/interpolate`, `/help` served; unknown path 404 |
| `admin api` | password login, `authInfo`, `meta`, `agents`, 401 without token, unknown method, prototype-key rejection, **Fetch models with a masked key** |
| `init.bind` | webhook URL registered, `secret_token` forwarded, `setMyCommands` × scopes, `setChatMenuButton` |
| `access control` | non-whitelisted private user rejected, wrong secret token → 403 with no outbound, service message ignored, non-whitelisted group rejected |
| `private chat` | LLM request shape (system prompt, user text, model), reply delivered, `sendChatAction` |
| `commands` | `/new`, `/version`, `/help`, `/system` (privileged), `/models` inline keyboard |
| `callbacks` | `m:{provider}:{model}` switches model + persists; non-admin group callback denied |
| `group chat` | message without `@mention` ignored, mention stripped from prompt, reply-to-bot answered |
| `plugins & custom commands` | request-template plugin, text alias, config shortcut as custom command, non-admin denied, direct `/setenv` + `/delenv` |
| `image message` | `getFile` + file download, image inlined as a data URI, caption preserved |
| `error injection` | 429 + `Retry-After` does not break the pipeline; MarkdownV2 parse failure falls back to plain-text chunking |
| `streaming` | SSE deltas accumulate into the final message via `editMessageText` |

## What it still does not cover

Real Telegram delivery quirks against the live API (actual MarkdownV2 acceptance, live rate
limits) and Cloudflare-specific runtime behaviour (the `vitest-pool-workers` unit tests run inside
workerd instead). The browser-rendered admin panel is covered separately — see
`packages/test/web` and `pnpm run test:e2e:web`.
