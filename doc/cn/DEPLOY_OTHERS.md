# 部署到 Vercel、本地、Docker

除了 Cloudflare Workers,同一个机器人也可以在任何能运行 Node.js 的地方使用 —— 本地、Docker 或 Vercel —— 对应的是 `server` 应用(`packages/apps/server`)。

所有平台共用同一套配置模型:

- **机器人凭证** — `TELEGRAM_TOKEN`、`ADMIN_ID`(以及可选的 `ADMIN_PASSWORD`),从 [wrangler.jsonc](../../wrangler.jsonc) 的 `vars` 中读取(与 Cloudflare 用的是同一个文件;KV `id` 在这些平台上被忽略)。
- **其余所有配置** — AI 服务商、提示词、权限、插件 —— 都在管理面板(`/admin`)中设置,保存在数据库里。详见[配置文档](CONFIG.md)。
- **运行时配置(`config.json`)** — 只负责服务器本身的运行:用哪个数据库、如何监听、是否走代理。见下文。

## 运行时配置 `config.json`

```json5
{
    "database": {
        "type": "local", // memory | local | sqlite | redis
        "path": "/app/data.json" // memory: 无; local/sqlite: 文件路径; redis: redis:// 连接地址
    },
    "server": {
        // 仅 webhook 模式使用
        "hostname": "0.0.0.0",
        "port": 8787
    },
    "proxy": "http://127.0.0.1:7890", // 可选,访问 Telegram API 使用的 HTTP 代理
    "mode": "webhook" // webhook | polling
}
```

- **polling 模式**不需要公网地址,机器人主动连接 Telegram,本地运行时最省事。
- **webhook 模式**需要公网 HTTPS 地址(反向代理、隧道、Vercel 等)。启动后,在管理面板把公网地址填到 `publicBaseUrl`,然后访问一次 `/init` 绑定 webhook。

## 本地运行

需要 Node.js 20+ 和 pnpm。

```shell
pnpm install
pnpm run start:local
```

`start:local` 从当前目录读取 `./config.json` 和 `./wrangler.jsonc`(可用环境变量 `CONFIG_PATH` / `WRANGLER_PATH` 覆盖),并用 tsx 运行,适合开发调试。

正式一点的本地运行方式,构建一次后启动打包产物:

```shell
pnpm install
pnpm run build:server
CONFIG_PATH=./config.json WRANGLER_PATH=./wrangler.jsonc node packages/apps/server/dist/node.js
```

## Docker

### 1. 获取镜像

自行构建(多架构构建使用 `build:dockerx`):

```shell
docker build -t chatgpt-telegram-workers:latest .
```

…或者直接拉取 GHCR 上的预构建镜像:

```shell
docker pull ghcr.io/tbxark/chatgpt-telegram-workers:latest
```

### 2. 运行容器

挂载两个配置文件,并暴露 8787 端口:

```shell
docker run -d -p 8787:8787 \
  -v $(pwd)/config.json:/app/config.json:ro \
  -v $(pwd)/wrangler.jsonc:/app/wrangler.jsonc:ro \
  ghcr.io/tbxark/chatgpt-telegram-workers:latest
```

### docker-compose

把 [docker-compose.yaml](../../docker-compose.yaml) 中的卷路径改成本地配置文件的实际路径,然后:

```shell
docker compose up -d
```

compose 文件默认设置了 `network_mode: host` —— 如果你的 `config.json` 里的代理指向宿主机上的服务(比如 `127.0.0.1:7890`),请保留该项(或删掉它并自行发布端口)。

## Vercel(实验性)

Vercel 部署运行在 Node.js runtime 上,使用 [Upstash Redis](https://upstash.com)(REST API)作为数据库。CI 未覆盖所有环境,功能以实际运行为准。

### 自动部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTBXark%2FChatGPT-Telegram-Workers&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,TELEGRAM_TOKEN,ADMIN_ID&project-name=chatgpt-telegram-workers&repository-name=ChatGPT-Telegram-Workers&demo-title=ChatGPT-Telegram-Workers&demo-description=Deploy%20your%20own%20Telegram%20ChatGPT%20bot%20on%20Cloudflare%20Workers%20with%20ease.&demo-url=https%3A%2F%2Fchatgpt-telegram-workers.vercel.app)

按钮会克隆仓库并要求填写以下环境变量:

| 变量 | 说明 |
|---|---|
| `TELEGRAM_TOKEN` | BotFather 发给你的 Bot Token |
| `ADMIN_ID` | 你的 Telegram 用户 ID |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL(在 [upstash.com](https://upstash.com) 创建免费数据库,查看 *REST* 区块) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token |

### 手动部署

Vercel CLI 不是仓库依赖,请先全局安装:

```shell
npm i -g vercel
```

```shell
pnpm install
pnpm run deploy:vercel
```

1. 过程中按提示登录 Vercel 账号。
2. 第一次部署后,在 Vercel 控制台(*Project → Settings → Environment Variables*)添加上面四个环境变量,然后重新部署。
3. 如果你已经有 Cloudflare 的 `wrangler.jsonc`,可以执行 `pnpm run vercel:syncenv`,把其中的 `vars` 同步为 Vercel 环境变量并重新部署。该脚本只会新增或更新变量,不会删除 Vercel 上已有的变量;需要删除时请在控制台手动操作。

### 初始化

打开 `https://<项目名>.vercel.app`,必要时在管理面板把它设为 `publicBaseUrl`,然后访问一次 `/init` 绑定 webhook。

## 下一步

在管理面板中配置 AI 服务商和其他设置:给机器人发送 `/admin`,或在浏览器打开 `/admin` 并使用 `ADMIN_PASSWORD` 登录。详见[配置文档](CONFIG.md)。
