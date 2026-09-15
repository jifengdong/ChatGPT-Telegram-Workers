# @chatgpt-telegram-workers/test-web

Browser end-to-end tests for the web UI (admin panel, `/init`, `/interpolate`, home) using
Playwright and the offline mocks from `@chatgpt-telegram-workers/test-mocks`. No Telegram login and
no external network are required — Mini App `initData` is signed locally with the test bot token.

```shell
pnpm run test:e2e:web
```

## Covered

**Admin panel (`/admin`)**

- password login **and** Mini App `initData` login (locally signed)
- Settings tab: toggle a switch + edit a field, Save, assert persisted via RPC
- Chat Providers: add a provider, **Fetch Models** from the endpoint, pick a model, save
- Image Providers: add a provider + model, save
- Plugins & Custom Commands: create with scope/template/value, then delete
- `/init`: binds the webhook from the browser and asserts the registered URL
- `/interpolate`: live preview, template/data editing, invalid-JSON error state
- Home page: deploy status + navigation links

**Mock Telegram Web client (`/web`)**

A minimal chat UI served by the harness (see `TelegramWebClient`). Browser automation acts as a
real user: picks a chat (private / group), types a message, sees the bot's reply, and clicks inline
keyboard buttons. Sending is translated into a real `Update` posted to the bot webhook, exactly
like Telegram — so this exercises the full message path in a browser, with no Telegram login.

- private chat: send → see reply
- inline keyboard: `/models` → click a model button → assert the config changed
- group chat: plain message is ignored, `@mention` gets a reply
- unauthorized user: gets the whitelist message, not an LLM reply

- Uses the system **Chrome** (`channel: 'chrome'`) by default.
- To use Playwright's bundled Chromium instead:

  ```shell
  pnpm --filter @chatgpt-telegram-workers/test-web install:browser
  PW_CHANNEL= pnpm run test:e2e:web
  ```

These tests are intentionally **not** part of `pnpm -r run test` (which must stay browser-free for
CI); they run via the dedicated `test:browser` script, and CI runs them in a separate job.
