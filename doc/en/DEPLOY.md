# Deploy to Cloudflare Workers

Cloudflare Workers is the default and easiest way to run this bot: free plan works, no server, no domain required (you get a free `*.workers.dev` domain).

> For Vercel / local / Docker deployments, see [Deploy to Vercel, Local, Docker](DEPLOY_OTHERS.md).
>
> Already running **v1**? See [Migrating from v1 to v2](MIGRATION.md).

## Before you start

You need three things:

1. **A Telegram bot token**
   1. Open Telegram and send `/start` to [BotFather](https://t.me/BotFather).
   2. Send `/newbot`, pick a display name and a username ending in `_bot`.
   3. BotFather replies with a **Token** — copy it and keep it safe, it is the key to your bot.

   <img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916992-b393178e-2c41-4a65-a962-96f776f652bd.png">

2. **Your Telegram user id** — used as `ADMIN_ID` to authorize the admin panel and private-chat commands. Send `/start` to [@userinfobot](https://t.me/userinfobot) (or any similar bot) to get it.

3. **An AI provider API key** (OpenAI, DeepSeek, Anthropic, Cloudflare Workers AI, …). The key is **not** an environment variable anymore — you will add it later in the admin panel ([Configuration](CONFIG.md)).

## Video tutorial

<a href="https://youtu.be/BvxrZ3WMrLE"><img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223895059-1ffa48c7-8801-4d7b-b9d3-15c857d03225.png"></a>

Thanks to [**科技小白堂**](https://www.youtube.com/@lipeng0820) for the video.

## Option A: One-click deploy (Deploy to Cloudflare button)

The quickest route — no local toolchain and no manual KV setup:

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/TBXark/ChatGPT-Telegram-Workers"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare"></a>

Click the button, sign in to Cloudflare and follow the prompts. Cloudflare will:

1. clone this repository into your GitHub account;
2. read [wrangler.jsonc](../../wrangler.jsonc), create the `DATABASE` KV namespace and write its id back into the cloned repository;
3. ask for the values declared in [`.dev.vars.example`](../../.dev.vars.example) — `TELEGRAM_TOKEN` and `ADMIN_ID` are required, `ADMIN_PASSWORD` is optional — and store them as Worker secrets;
4. run the `build` and `deploy` scripts from `package.json` (`pnpm run build`, then `pnpm run deploy`) to build and deploy the Worker.

The cloned repository is yours to keep developing in; the button is intended for a fresh deployment, not for updating an existing one. Continue with [Initialize](#initialize).

## Option B: Deploy from the command line

### 1. Create a KV namespace

Install dependencies, log in to Cloudflare and create the KV namespace the bot stores its data in:

```shell
pnpm install
pnpm wrangler login
pnpm wrangler kv namespace create DATABASE
```

The command prints a KV namespace **id** — copy it.

### 2. Configure `wrangler.jsonc`

The repository ships a [wrangler.jsonc](../../wrangler.jsonc). For CLI deploys, fill in the KV namespace id and add a `vars` block with your bot credentials:

```jsonc
{
    "name": "chatgpt-telegram-workers",
    "main": "./packages/apps/workers/src/index.ts",
    "compatibility_date": "2026-08-04",
    "ai": { "binding": "AI" },
    "kv_namespaces": [{ "binding": "DATABASE", "id": "<your-kv-namespace-id>" }],
    "vars": {
        "TELEGRAM_TOKEN": "<your-bot-token>",
        "ADMIN_ID": "<your-telegram-user-id>",
        // "ADMIN_PASSWORD": "change-me" // optional, enables password login for /admin outside Telegram
    },
}
```

The `ai` binding is already in the shipped file — keep it if you want to use Cloudflare Workers AI models without an account id and API token. Bindings are reconciled from this file on every `wrangler deploy`, so adding the binding **only** in the dashboard is not enough: the next CLI deploy removes it.

> Only `TELEGRAM_TOKEN` (required), `ADMIN_ID` and `ADMIN_PASSWORD` (optional) exist. Everything else — AI providers, prompts, permissions, plugins — is configured in the admin panel, see [Configuration](CONFIG.md).

### 3. Build and deploy

```shell
pnpm run deploy
```

Wrangler will print your worker URL, something like `https://chatgpt-telegram-workers.<your-subdomain>.workers.dev`.

## Option C: Connect a Git repository (Cloudflare Builds)

Cloudflare builds and deploys the Worker automatically whenever you sync your fork. No local development environment needed — and **no need to edit any file in your fork**: the KV namespace id is injected at deploy time from a build variable, and bot credentials are set in the dashboard. This is the same flow as the [Sink](https://docs.sink.cool/deployment/workers) project.

1. **Fork this repository** on GitHub.
2. **Create the KV namespace** in the Cloudflare dashboard: *Storage & Databases → KV → Create namespace*. Copy its **id**.
3. **Create the Worker from your repo**: Cloudflare dashboard → *Compute (Workers)* → *Create* → *Import a repository*, authorize GitHub and pick your fork.
   - Production branch: `master`
   - Build command: leave it empty — the deploy command builds everything it needs
   - Deploy command: `pnpm run deploy:builds`
   - Non-production branch deploy command: `pnpm run deploy:preview` — required if you push preview branches; the default `npx wrangler versions upload` would skip the KV namespace id injection and fail
4. **Add the build variable**: in the Worker's *Settings → Build variables*, add `DEPLOY_KV_NAMESPACE_ID` with your KV namespace id as the value. Optional variables:
   - `DEPLOY_KV_PREVIEW_NAMESPACE_ID` — KV namespace for preview builds (defaults to the production one)
   - `DEPLOY_WORKER_NAME` — override the Worker name
5. Deploy and wait for the first build to finish.

The deploy command `pnpm run deploy:builds` builds the Worker from source, generates a gitignored `wrangler.deploy.jsonc` from the committed [wrangler.jsonc](../../wrangler.jsonc) plus your build variables, and deploys it — the root `dist/` folder is never used and no file in your repository is modified.

### Set the bot credentials

The Worker is deployed but won't respond until it knows your bot token. In the Worker's *Settings → Variables and Secrets*, add:

| Variable | Type | Description |
|---|---|---|
| `TELEGRAM_TOKEN` | Secret | your bot token from BotFather |
| `ADMIN_ID` | Secret | your Telegram user id |
| `ADMIN_PASSWORD` | Secret | optional, password login for `/admin` outside Telegram |

Then **retry the build** (or push any commit) so the new variables take effect. The committed config declares `keep_vars: true` and contains no `vars`, so dashboard variables survive every deploy.

> `keep_vars` protects variables and secrets only — **not** bindings. Bindings are reconciled from the config file on every deploy, so if you add the `AI` binding in the dashboard it will disappear again on the next build. It is already declared in the committed [wrangler.jsonc](../../wrangler.jsonc), so Cloudflare Workers AI works without any extra step; to remove it, delete the `ai` entry from that file.

### Finish

1. Open `https://<worker-name>.<subdomain>.workers.dev/` and click **Bind Webhook** (or visit `/init` once).
2. Send `/admin` to your bot and add your AI providers — see [Configuration](CONFIG.md).

To ship updates, sync your fork with the upstream repository — Cloudflare rebuilds and redeploys automatically.

## Option D: Copy & paste in the dashboard (no build tools)

If you don't want to run anything locally — this is the only deployment that uses the prebuilt [`dist/index.js`](../../dist/index.js):

1. Open [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers) and create a new Worker (*Create* → *Start with Hello World* → *Deploy*), then click *Edit code*.
2. Paste the full content of [`dist/index.js`](../../dist/index.js) into the editor and *Deploy*.
3. Go to the Worker's **Settings**:
   - *Compatibility date*: set it to `2026-08-04` or later — Node.js compatibility is enabled by default from this date, no flags needed.
   - *Bindings* → add a **KV Namespace** binding, variable name must be `DATABASE`.
   - *Bindings* → add an **AI** binding, variable name must be `AI` — only needed for Cloudflare Workers AI models; skip it if you use `Account ID` + `API Token` instead.
   - *Variables and Secrets* → add `TELEGRAM_TOKEN` (and optionally `ADMIN_ID`, `ADMIN_PASSWORD`).
4. Redeploy so the new settings take effect.

## Initialize

Open your Worker URL — `https://<worker-name>.<subdomain>.workers.dev/` — and click **Bind Webhook** on the home page (or just visit `/init` once). This registers the Telegram webhook, the command menu (`/new`, `/redo`, `/img`, `/admin`, `/models`, `/help`), and the chat menu button (the button next to the message input opens the admin panel as a Mini App).

> The detected domain is saved into the admin panel config on the first bind — no extra setup is needed for the default `*.workers.dev` domain. For a custom domain, set it as `publicBaseUrl` in the admin panel or as the `PUBLIC_BASE_URL` environment variable.

## Configure the bot in the admin panel

1. In Telegram, send `/admin` or tap the menu button next to the message input — it opens the admin panel as a Telegram Mini App (authorized by your `ADMIN_ID`).
2. On the **Chat Providers** tab, add your AI provider: name, base URL, API key, API format and model list. Pick the default provider and model.
3. Adjust other options on the **Settings** tab if needed.

See [Configuration](CONFIG.md) for details.

## Start chatting

1. Send `/new` to start a new conversation, then just talk to the bot.
2. `/help` shows all commands. `/models` switches models.

> Group chats: set the bot's privacy mode to **Disable** in BotFather (`/setprivacy`), and add the bot as an administrator in public groups, otherwise it won't see `@bot` messages.

> Want automatic updates? Option C (Workers Builds) rebuilds and redeploys the Worker every time you sync your fork — no GitHub secrets or Actions needed.
