# Configuration

Configuration is split into two parts:

1. **Environment variables / bindings** — the minimum required to start the bot.
2. **Admin panel** — everything else (AI providers, prompts, permissions, plugins, …), stored as a single JSON document in KV.

## 1. Environment variables

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_TOKEN` | yes | Bot token from [@BotFather](https://t.me/BotFather). A single token. |
| `ADMIN_ID` | recommended | Your Telegram user id. Authorizes the admin panel (via Telegram Mini App `initData`) and restricts private-chat commands to you. |
| `ADMIN_PASSWORD` | no | Fallback password for the admin panel when opened outside Telegram. If unset, password login is disabled (Mini App only). |
| `PUBLIC_BASE_URL` | no | Public HTTPS base URL of the deployment. Takes precedence over the value saved in the admin panel; when unset, the first `/init` saves the detected domain into the admin panel config automatically. |
| `TELEGRAM_SECRET_TOKEN` | no | Optional webhook secret. When set, it is passed to `setWebhook` as `secret_token` and every incoming update must carry the matching `X-Telegram-Bot-Api-Secret-Token` header, blocking forged updates. |

Bindings (Cloudflare / runtime):

| Binding | Required | Description |
|---|---|---|
| `DATABASE` | yes | KV namespace used for bot history, caches and the global config JSON. |
| `AI` | no | Workers AI binding, declared in the shipped `wrangler.jsonc`. Needed only if you use the `workers` provider *and* want to skip the account id + token. |
| `API_GUARD` | no | Optional Worker used to protect the webhook (`/telegram/:token/safehook`). |

> All previously supported environment variables (`OPENAI_API_KEY`, `TELEGRAM_AVAILABLE_TOKENS`, `LOCK_USER_CONFIG_KEYS`, `CUSTOM_COMMAND_*`, `PLUGIN_COMMAND_*`, …) are **removed**. Configure providers and options in the admin panel instead.

## 2. Admin panel

Open `https://<your-domain>/admin`.

- Inside Telegram, open it from the `/admin` command (Mini App). The bot validates Telegram `initData` and matches `ADMIN_ID`, so no password is needed.
- Outside Telegram, log in with `ADMIN_PASSWORD` if it is set.

### Tabs

- **Chat Providers** — add AI chat providers. Each provider has a Name, Base URL, API key, an **API format** (protocol) and an allowed **model list**. Use **Fetch models** to pull the list from the endpoint (ends with `/models`), then click to add models; if the endpoint has no model list, use **+ Add model** to type names manually. Pick one model as active and mark one provider as default.
- **Image Providers** — same, for image generation. Generation parameters differ per protocol and model (`size`/`quality`/`style` for OpenAI, `negative_prompt`/`width`/`height`/`num_steps`/`guidance` for Workers AI models), so each provider has its own **Extra Params** JSON merged into the request body; `prompt` stays authoritative.
- **Settings** — global options that used to be environment variables: public base URL, system prompt, permissions, history limits, streaming, …
- **Plugins** — request-template commands (JSON template or URL) with their own env map.
- **Custom Commands** — shortcuts. When the value starts with `/setenv`, `/setenvs`, `/delenv`, or JSON, it is applied as a config patch to the global config; otherwise it expands to another command as a text alias.

Saving writes the whole config as JSON to the KV key `config:global`.

### Shortcuts (config patches)

Custom Commands can modify the global config directly, which is how you quickly switch the default provider or model — the equivalent of the old `CUSTOM_COMMAND_*` variables:

| Command | Value | Purpose |
|---|---|---|
| `/gpt4` | `/setenvs {"defaultChatProvider":"openai"}` | Switch the default chat provider |
| `/fast` | `/setenv settings.systemInitMessage=You are a concise assistant` | Change one setting via a dot path |
| `/img-openai` | `/setenvs {"defaultImageProvider":"openai"}` | Switch the default image provider |
| `/reset-prompt` | `/delenv settings.systemInitMessage` | Reset one setting to its default |

Supported forms:

- `/setenv KEY=VALUE` — `KEY` is a dot path, e.g. `settings.systemInitMessage` or `defaultChatProvider`.
- `/setenvs {json}` — a JSON object patch: the top-level `settings` key is merged per field, `chatProviders`/`imageProviders`/`plugins`/`customCommands` are merged by element `id`, anything else overwrites. Unknown keys are rejected instead of silently ignored.
- `/delenv KEY` — resets `settings.xxx` to its default; clears `defaultChatProvider`/`defaultImageProvider`.
- A bare JSON object starting with `{`, equivalent to `/setenvs`.

`/setenv`, `/setenvs` and `/delenv` are also available directly in chat (no custom command needed). Shortcuts write to the global config, so only `ADMIN_ID` itself or group administrators may trigger them; anyone else gets a permission error. They change the global default and do not provide per-chat config.

### API formats

Providers are no longer tied to a vendor list. Choose the API format that matches the endpoint:

| API format | Protocol | Notes |
|---|---|---|
| `chat-completions` | OpenAI Chat Completions | `/v1/chat/completions`, default for OpenAI-compatible endpoints |
| `anthropic-messages` | Anthropic Messages | `/v1/messages` |
| `responses` | OpenAI Responses | `/v1/responses` |
| `workers` | Cloudflare Workers AI | uses the `AI` binding, or account id + token when the binding is absent |

For images, the API formats are `images` (OpenAI `/v1/images/generations`) and `workers`.

The `workers` format ignores the **Base URL** and **API Key** fields — its endpoint and credentials come from the `AI` binding (or the `Account ID` / `API Token` options when no binding is deployed), so the form hides both fields for that format. When an `AI` binding is present you can leave `Account ID` and `API Token` empty and the provider still works. Without a binding, an `Account ID` + `API Token` pair is required; a provider missing both is skipped instead of failing on first use.

**Fetch models** lists models through the binding when one is present, otherwise through the account-level Cloudflare API. Either way the results are split by task type, so the chat tab offers text-generation models and the image tab offers text-to-image models.

Some newer image models — the `@cf/black-forest-labs/flux-2-*` family — accept only a `multipart/form-data` body, not JSON, so a plain JSON request fails with `5006: required properties at '/' are 'multipart'`. The bot detects those models and encodes the request as multipart automatically; if you hit that error on a model not yet covered, it retries as multipart once and remembers the model.

Name your provider anything (e.g. `DeepSeek`, `Groq`, `Mistral`); any OpenAI-compatible endpoint works with `chat-completions`. Existing vendor-named configs (including `azure` and `gemini`) are migrated automatically on load.

Azure OpenAI expects the key in an `api-key` header rather than `Authorization: Bearer`. Set the provider's **API Key Header** option to `api-key`; leave it empty for every other provider.

## 3. `/init`

After configuring `publicBaseUrl` in the admin panel, click **Bind Webhook** on the home page (or visit `/init` once) to register the webhook and command menu:

```
https://<your-domain>/init
```

The web pages are served by the `@chatgpt-telegram-workers/web` package: `/` (home + usage guide), `/admin` (admin panel) and `/interpolate` (interpolation template tester).

## Local / Docker

See [DEPLOY_OTHERS.md](./DEPLOY_OTHERS.md) — the runtime `config.json` only configures the database, server and proxy; all bot configuration still lives in the admin panel.
