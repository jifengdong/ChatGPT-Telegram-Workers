# Deploy to Vercel, Local, Docker

Besides Cloudflare Workers, the same bot can run anywhere Node.js runs — locally, in Docker, or on Vercel — via the `server` app (`packages/apps/server`).

All platforms share the same configuration model:

- **Bot credentials** — `TELEGRAM_TOKEN`, `ADMIN_ID` (and optional `ADMIN_PASSWORD`), read from `vars` in a [wrangler.jsonc](../../wrangler.jsonc) file (the same file Cloudflare uses; the KV `id` is ignored on these platforms).
- **Everything else** — AI providers, prompts, permissions, plugins — is configured in the admin panel (`/admin`) and stored in the database. See [Configuration](CONFIG.md).
- **Runtime config (`config.json`)** — only how the server runs: which database to use, how to listen, whether to use a proxy. See below.

## Runtime config `config.json`

```json5
{
    "database": {
        "type": "local", // memory | local | sqlite | redis
        "path": "/app/data.json" // memory: none; local/sqlite: file path; redis: redis:// connection URI
    },
    "server": {
        // only used in webhook mode
        "hostname": "0.0.0.0",
        "port": 8787
    },
    "proxy": "http://127.0.0.1:7890", // optional, HTTP proxy for the Telegram API
    "mode": "webhook" // webhook | polling
}
```

- **Polling mode** doesn't need a public URL — the bot connects out to Telegram. Easiest choice for local runs.
- **Webhook mode** needs a public HTTPS URL (reverse proxy, tunnel, Vercel, …). After startup, set the public URL as `publicBaseUrl` in the admin panel, then open `/init` once to bind the webhook.

## Local

Requires Node.js 20+ and pnpm.

```shell
pnpm install
pnpm run start:local
```

`start:local` reads `./config.json` and `./wrangler.jsonc` from the current directory (override with the `CONFIG_PATH` / `WRANGLER_PATH` environment variables) and runs the app with tsx — handy for development.

For a production-style local run, build once and start the bundled output:

```shell
pnpm install
pnpm run build:server
CONFIG_PATH=./config.json WRANGLER_PATH=./wrangler.jsonc node packages/apps/server/dist/node.js
```

## Docker

### 1. Get an image

Build it yourself (multi-arch build via `build:dockerx`):

```shell
docker build -t chatgpt-telegram-workers:latest .
```

…or pull the prebuilt image from GHCR:

```shell
docker pull ghcr.io/tbxark/chatgpt-telegram-workers:latest
```

### 2. Run the container

Mount your two config files and expose port 8787:

```shell
docker run -d -p 8787:8787 \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/wrangler.jsonc:/app/wrangler.jsonc:ro \
  ghcr.io/tbxark/chatgpt-telegram-workers:latest
```

### docker-compose

Edit the volume paths in [docker-compose.yaml](../../docker-compose.yaml) to point at your local config files, then:

```shell
docker compose up -d
```

The compose file sets `network_mode: host` — keep it (or remove it and publish the port yourself) if your `config.json` proxy points at a service on the host, e.g. `127.0.0.1:7890`.

## Vercel (experimental)

The Vercel deployment runs on the Node.js runtime and uses [Upstash Redis](https://upstash.com) (REST API) as its database. Not every environment is exercised in CI, so treat it as best-effort.

### Automatic deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTBXark%2FChatGPT-Telegram-Workers&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,TELEGRAM_TOKEN,ADMIN_ID&project-name=chatgpt-telegram-workers&repository-name=ChatGPT-Telegram-Workers&demo-title=ChatGPT-Telegram-Workers&demo-description=Deploy%20your%20own%20Telegram%20ChatGPT%20bot%20on%20Cloudflare%20Workers%20with%20ease.&demo-url=https%3A%2F%2Fchatgpt-telegram-workers.vercel.app)

The button clones the repo and asks for the required environment variables:

| Variable | Description |
|---|---|
| `TELEGRAM_TOKEN` | Your bot token from BotFather |
| `ADMIN_ID` | Your Telegram user id |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (create a free database on [upstash.com](https://upstash.com), *REST* section) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

### Manual deployment

The Vercel CLI is not a repository dependency — install it globally first:

```shell
npm i -g vercel
```

```shell
pnpm install
pnpm run deploy:vercel
```

1. Log in to your Vercel account when the CLI asks.
2. On the first deployment, add the four environment variables above in the Vercel console (*Project → Settings → Environment Variables*), then redeploy.
3. If you already have a `wrangler.jsonc` (e.g. from a Cloudflare deployment), run `pnpm run vercel:syncenv` to copy its `vars` to Vercel environment variables and redeploy. The script only adds or updates variables — existing Vercel variables are never deleted; remove unneeded ones in the dashboard.

### Initialize

Open your `https://<project>.vercel.app`, set it as `publicBaseUrl` in the admin panel if needed, then visit `/init` once to bind the webhook.

## What's next

Configure AI providers and settings in the admin panel: send `/admin` to your bot, or open `/admin` in a browser and log in with `ADMIN_PASSWORD`. See [Configuration](CONFIG.md).
