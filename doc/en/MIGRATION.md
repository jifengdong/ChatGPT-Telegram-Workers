# Migrating from v1 to v2

v2 (2.0.0) is a major rewrite. The biggest change: **configuration moved from dozens of environment variables into an admin panel**, stored as one JSON document (`config:global`) in the same `DATABASE` KV namespace as before. Only a few environment variables remain.

Migration is manual but quick — the deployment itself barely changes, you re-enter the provider keys in the admin panel once.

## What stays the same

- The `DATABASE` KV binding and your KV namespace.
- Chat history keys (`history:{chat_id}`) — existing conversations carry over. The history item format was simplified though, so if an old conversation behaves oddly, send `/new` to start a fresh one.
- Webhook URLs (`/telegram/{token}/webhook`), `/init`, `/admin` and the plugin/interpolate pages.
- Commands `/start`, `/new`, `/redo`, `/img`, `/models`, `/help`, `/version`, `/system`.

## Step 1: Record your current settings

Before updating, note down what you had in your v1 wrangler.jsonc / dashboard variables (API keys, models, whitelists, custom commands, plugin templates). There is no automatic migration of this data.

## Step 2: Update the Worker code

Deploy the new build the same way you deployed v1 — `pnpm run deploy` from an updated checkout, GitHub Action / Cloudflare Git builds, or copy-paste the new `dist/index.js` in the dashboard.

## Step 3: Trim the environment variables

Replace your old `vars` with just these (see [wrangler.jsonc](../../wrangler.jsonc)):

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_TOKEN` | yes | A single bot token from BotFather |
| `ADMIN_ID` | recommended | Your Telegram user id; authorizes `/admin` and private-chat commands |
| `ADMIN_PASSWORD` | no | Password login for `/admin` outside Telegram |
| `PUBLIC_BASE_URL` | no | Public HTTPS base URL; auto-detected and saved on the first `/init` when unset |
| `TELEGRAM_SECRET_TOKEN` | no | Optional webhook secret; when set it is sent as `secret_token` and verified on every update |

Keep the `DATABASE` KV binding untouched.

> **Multi-bot note:** v1's `TELEGRAM_AVAILABLE_TOKENS` / `TELEGRAM_BOT_NAME` supported several bots per deployment. v2 serves **one token per deployment** — deploy one Worker per bot if you need more than one.

## Step 4: Re-enter the config in the admin panel

Open `/admin` (send `/admin` to your bot in Telegram, or open it in a browser and log in with `ADMIN_PASSWORD`), then map your old settings across:

### AI providers → *Chat Providers* / *Image Providers* tabs

Add one provider entry per old provider, then pick the default one. Providers are protocol-based now instead of vendor-based: any OpenAI-compatible endpoint uses the `chat-completions` API format.

| v1 variable | Goes to |
|---|---|
| `OPENAI_API_KEY` / `OPENAI_API_BASE` / `OPENAI_CHAT_MODEL` / `OPENAI_API_EXTRA_PARAMS` | Chat provider, API format `chat-completions` |
| `GOOGLE_API_KEY` / `GOOGLE_API_BASE` / `GOOGLE_CHAT_MODEL` | Chat provider, API format `chat-completions` (Gemini's OpenAI-compatible endpoint) |
| `MISTRAL_*`, `COHERE_*`, `GROQ_*`, `DEEPSEEK_*`, `XAI_*` | Chat provider, API format `chat-completions` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_API_BASE` / `ANTHROPIC_CHAT_MODEL` | Chat provider, API format `anthropic-messages` |
| `AZURE_API_KEY` / `AZURE_COMPLETIONS_API` / `AZURE_CHAT_MODEL` | Chat provider, API format `chat-completions`, base URL = your Azure deployment URL, and set the provider's **API Key Header** option to `api-key` |
| `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_TOKEN` + `WORKERS_CHAT_MODEL` | Chat provider, API format `workers` (account id/token in the provider options, or keep the `AI` binding) |
| `DALL_E_MODEL` / `DALL_E_*` | Image provider, API format `images`; size/quality/style go into that provider's **Extra Params** JSON (they are OpenAI-specific, so they are no longer global settings) |
| `WORKERS_IMAGE_MODEL` | Image provider, API format `workers` |
| `AI_PROVIDER` / `AI_IMAGE_PROVIDER` | The default provider selection (`defaultChatProvider` / `defaultImageProvider`) |
| `OPENAI_CHAT_MODELS_LIST` and every other `*_MODELS_LIST` | The provider's model list (the admin panel can also fetch it from the endpoint) |

Use **Fetch models** on a provider to pull the model list from the endpoint instead of pasting `*_MODELS_LIST` by hand.

### General settings → *Settings* tab

| v1 variable | v2 setting |
|---|---|
| `SYSTEM_INIT_MESSAGE` | `systemInitMessage` |
| `LANGUAGE` | `language` |
| `UPDATE_BRANCH` | `updateBranch` |
| `CHAT_COMPLETE_API_TIMEOUT` | `chatCompleteApiTimeout` (**seconds** — v1 interpreted the value as milliseconds, so divide an old value by 1000) |
| `TELEGRAM_API_DOMAIN` | `telegramApiDomain` |
| `DEFAULT_PARSE_MODE` | `defaultParseMode` |
| `STREAM_MODE` | `streamMode` |
| `CHAT_WHITE_LIST` | `allowedUserIds` |
| `CHAT_GROUP_WHITE_LIST` | `allowedGroupIds` |
| `I_AM_A_GENEROUS_PERSON` | `allowAllUsers` |
| `GROUP_CHAT_BOT_ENABLE` | `groupChatBotEnable` |
| `GROUP_CHAT_BOT_SHARE_MODE` | `groupChatBotShareMode` |
| `AUTO_TRIM_HISTORY` | `autoTrimHistory` |
| `MAX_HISTORY_LENGTH` | `maxHistoryLength` |
| `MAX_TOKEN_LENGTH` | `maxTokenLength` |
| `SHOW_REPLY_BUTTON` | `showReplyButton` |
| `EXTRA_MESSAGE_CONTEXT` | `extraMessageContext` |
| `HIDE_COMMAND_BUTTONS` | `hideCommandButtons` |
| `SAFE_MODE` | `safeMode` |
| `DEBUG_MODE` | `debugMode` |
| `DEV_MODE` | `devMode` |

Removed concepts:

- `LOCK_USER_CONFIG_KEYS` — per-user configuration no longer exists; only admins can change anything.
- `SYSTEM_INIT_MESSAGE_ROLE` — deprecated in v1, gone in v2.
- `TELEGRAM_BOT_NAME` — not needed (single token per deployment).

### Custom commands → *Custom Commands* tab

Re-create each `CUSTOM_COMMAND_*` variable as a custom command entry, and `COMMAND_DESCRIPTION_*` as its description. The command value keeps the same `/setenv`-style syntax, but keys are **camelCase dot paths** now:

| v1 value | v2 value |
|---|---|
| `/setenvs {"AI_PROVIDER": "azure"}` | `/setenvs {"defaultChatProvider": "<provider-id>"}` |
| `/setenvs {"OPENAI_CHAT_MODEL": "gpt-4"}` | `/setenvs {"chatProviders": [{"id": "<provider-id>", "model": "gpt-4"}]}` |
| `/setenvs {"SYSTEM_INIT_MESSAGE": "…"}` | `/setenvs {"settings": {"systemInitMessage": "…"}}` |

### Plugins → *Plugins* tab

Re-create each `PLUGIN_COMMAND_*` variable as a plugin entry (command, description, scope, template JSON or URL, env). The template format itself is unchanged — see [Plugin System](PLUGINS.md).

## Step 5: Re-init and test

1. Visit `/init` once to re-register the webhook and the new command menu.
2. `/new`, ask the bot something, then check `/models`, `/img`, a custom command and a plugin.
3. `/admin` should open the Mini App without a password (inside Telegram, when your id matches `ADMIN_ID`).

## v2 command changes

| Command | Change |
|---|---|
| `/admin` | **New** — opens the admin panel as a Telegram Mini App |
| `/setenv`, `/setenvs`, `/delenv` | Changed — apply a patch to the **global** config (not per-user). Admin (`ADMIN_ID`) or group admins only. Keys are camelCase dot paths, e.g. `/setenv settings.streamMode=false`. They work both as direct chat commands and as custom-command values. |
| `/start`, `/new`, `/redo`, `/img`, `/models`, `/help`, `/version`, `/system` | Unchanged |
| `/echo` | Dev-mode only, as before |

## Other behavior changes

- **`MAX_TOKEN_LENGTH` no longer caps model output.** It now only trims history. To limit a reply's length, use the new **Max Output Tokens** setting (`maxOutputTokens`, `0` = protocol default).
- **`/models` and `/img`** are now two-step and paginated: first pick a provider (up to 4 per page, current one marked `✓`), then pick a model (up to 6 per page, with a button to go back to the provider list). Pagination rows only appear when there is more than one page. The previous keyboard prefixes (`al:`, `ca:`, `cm:`, `ial:`, `ica:`, `icm:`) are gone; the current ones are `mp:`/`ip:` (provider page), `ml:`/`il:` (model page) and `m:`/`im:` (select model) — send `/models` again to refresh.
- **Private-chat commands** for whitelisted, non-admin users work as in v1 (only privileged commands such as `/admin`, `/system` and the config shortcuts are restricted to `ADMIN_ID`).
- **Workers single-file build no longer bundles `telegramify-markdown`.** The Workers package keeps zero third-party runtime dependencies, so it does not install a `MarkdownV2` render hook — sending with `MarkdownV2` on Workers falls back to plain text. The Node/server build (`packages/apps/server`) still uses `telegramify-markdown` and keeps full `MarkdownV2` support.

## Rollback

Cloudflare keeps every deployment in the Worker's version history — roll back from the dashboard if needed. The v2 config lives in the KV key `config:global`; deleting it resets v2 to defaults but does not affect your v1-era chat history.
