# 部署到 Cloudflare Workers

Cloudflare Workers 是本项目的默认部署方式,也是最简单的方式:免费额度即可运行,无需服务器,无需域名(自动分配 `*.workers.dev` 域名)。

> 需要部署到 Vercel / 本地 / Docker,请查看[部署到 Vercel、本地、Docker](DEPLOY_OTHERS.md)。
>
> 正在运行 **v1** 旧版本?请查看[v1 迁移到 v2 指南](MIGRATION.md)。

## 开始之前

你需要准备三样东西:

1. **Telegram Bot Token**
   1. 打开 Telegram,向 [BotFather](https://t.me/BotFather) 发送 `/start`。
   2. 发送 `/newbot`,给机器人起名字,并取一个以 `_bot` 结尾的唯一用户名。
   3. BotFather 会返回一个 **Token**,复制保存好,这是机器人的密钥,不要泄露!

   <img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/222916992-b393178e-2c41-4a65-a962-96f776f652bd.png">

2. **你的 Telegram 用户 ID** — 用于 `ADMIN_ID`,授权管理面板和私聊命令。向 [@userinfobot](https://t.me/userinfobot) 发送 `/start` 即可获取。

3. **AI 服务商的 API Key**(OpenAI、DeepSeek、Anthropic、Cloudflare Workers AI 等)。Key **不再是环境变量**,部署完成后在管理面板里添加,详见[配置文档](CONFIG.md)。

## 视频教程

<a href="https://youtu.be/BvxrZ3WMrLE"><img style="max-width: 600px;" alt="image" src="https://user-images.githubusercontent.com/9513891/223895059-1ffa48c7-8801-4d7b-b9d3-15c857d03225.png"></a>

感谢 [**科技小白堂**](https://www.youtube.com/@lipeng0820) 提供此视频教程。

## 方式一:一键部署(Deploy to Cloudflare 按钮)

最省事的方式 —— 不需要本地环境,也不用手动创建 KV:

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/TBXark/ChatGPT-Telegram-Workers"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare"></a>

点击按钮,登录 Cloudflare 并按提示操作,Cloudflare 会:

1. 把本仓库克隆到你的 GitHub 账号下;
2. 读取 [wrangler.jsonc](../../wrangler.jsonc),创建 `DATABASE` KV namespace,并把 id 写回克隆出来的仓库;
3. 询问 [`.dev.vars.example`](../../.dev.vars.example) 中声明的值 —— `TELEGRAM_TOKEN` 和 `ADMIN_ID` 必填,`ADMIN_PASSWORD` 可选 —— 并保存为 Worker 的 Secret;
4. 运行 `package.json` 里的 `build`、`deploy` 脚本(`pnpm run build`,再 `pnpm run deploy`)完成构建与部署。

克隆出来的仓库归你所有,可以继续开发;该按钮适用于全新部署,不用于更新已有部署。完成后继续看[初始化](#初始化)。

## 方式二:命令行部署

### 1. 创建 KV namespace

安装依赖,登录 Cloudflare,创建机器人存储数据用的 KV namespace:

```shell
pnpm install
pnpm wrangler login
pnpm wrangler kv namespace create DATABASE
```

命令会输出 KV namespace 的 **id**,复制下来。

### 2. 配置 `wrangler.jsonc`

仓库自带 [wrangler.jsonc](../../wrangler.jsonc)。命令行部署时,把 KV namespace id 填进去,并添加一个 `vars` 块写入机器人凭证:

```jsonc
{
    "name": "chatgpt-telegram-workers",
    "main": "./packages/apps/workers/src/index.ts",
    "compatibility_date": "2026-08-04",
    "ai": { "binding": "AI" },
    "kv_namespaces": [{ "binding": "DATABASE", "id": "<你的KV-namespace-id>" }],
    "vars": {
        "TELEGRAM_TOKEN": "<你的Bot-Token>",
        "ADMIN_ID": "<你的Telegram用户ID>",
        // "ADMIN_PASSWORD": "change-me" // 可选,允许在 Telegram 之外用密码登录 /admin
    },
}
```

`ai` 绑定仓库里已经带上了 —— 保留它,Cloudflare Workers AI 模型就无需再填 account id 和 API token。每次 `wrangler deploy` 都会按这个文件重建绑定,所以只在控制台添加绑定是没用的:下一次命令行部署就会把它删掉。

> 环境变量只有 `TELEGRAM_TOKEN`(必填)、`ADMIN_ID`、`ADMIN_PASSWORD`(可选)三个。其余配置 —— AI 服务商、提示词、权限、插件 —— 全部在管理面板里设置,详见[配置文档](CONFIG.md)。

### 3. 构建并部署

```shell
pnpm run deploy
```

部署完成后 wrangler 会输出 Worker 地址,形如 `https://chatgpt-telegram-workers.<你的子域>.workers.dev`。

## 方式三:连接 Git 仓库(Cloudflare Builds)

Cloudflare 可以在你同步 fork 时自动构建并部署 Worker,全程不需要本地开发环境 —— 而且**不需要修改 fork 里的任何文件**:KV namespace id 通过 build variable 在部署时注入,机器人凭证在控制台设置。这与 [Sink](https://docs.sink.cool/deployment/workers) 项目的部署流程一致。

1. 在 GitHub 上 **Fork 本仓库**。
2. 在 Cloudflare 控制台 **创建 KV namespace**:*Storage & Databases → KV → Create namespace*,复制它的 **id**。
3. **从仓库创建 Worker**:Cloudflare 控制台 → *Compute (Workers)* → *Create* → *Import a repository*,授权 GitHub 并选择你的 fork。
   - 生产分支(Production branch):`master`
   - 构建命令(Build command):留空即可 —— 部署命令会自己完成构建
   - 部署命令(Deploy command):`pnpm run deploy:builds`
   - 非生产分支部署命令(Non-production branch deploy command):`pnpm run deploy:preview` —— 如果你会推送预览分支,这一项必须设置;默认的 `npx wrangler versions upload` 不会注入 KV namespace id,会构建失败
4. **添加 build variable**:在 Worker 的 *Settings → Build variables* 中添加 `DEPLOY_KV_NAMESPACE_ID`,值为你的 KV namespace id。可选变量:
   - `DEPLOY_KV_PREVIEW_NAMESPACE_ID` — 预览构建使用的 KV namespace(默认与生产相同)
   - `DEPLOY_WORKER_NAME` — 覆盖 Worker 名称
5. 完成部署,等待第一次构建结束。

部署命令 `pnpm run deploy:builds` 会从源码构建 Worker,再以仓库内的 [wrangler.jsonc](../../wrangler.jsonc) 为基础、结合 build variables 生成一个 gitignore 的 `wrangler.deploy.jsonc` 并部署 —— 根目录的 `dist/` 完全不参与,仓库里的文件也不会被修改。

### 设置机器人凭证

Worker 部署完成后还不会响应消息,需要告诉它 Bot Token。在 Worker 的 *Settings → Variables and Secrets* 中添加:

| 变量 | 类型 | 说明 |
|---|---|---|
| `TELEGRAM_TOKEN` | Secret | BotFather 发的 Bot Token |
| `ADMIN_ID` | Secret | 你的 Telegram 用户 ID |
| `ADMIN_PASSWORD` | Secret | 可选,在 Telegram 之外用密码登录 `/admin` |

然后 **Retry build**(或随便 push 一个 commit)使新变量生效。仓库里的配置声明了 `keep_vars: true` 且不包含 `vars`,所以每次部署都不会覆盖或删除控制台里的变量。

> `keep_vars` 只保护变量和密钥,**不保护绑定**。绑定每次部署都会按配置文件重建,所以在控制台里加 `AI` 绑定会在下次构建时丢失。仓库的 [wrangler.jsonc](../../wrangler.jsonc) 已经声明了它,Cloudflare Workers AI 开箱可用;想去掉就删掉该文件里的 `ai` 一项。

### 收尾

1. 打开 `https://<worker名>.<子域>.workers.dev/`,点击 **Bind Webhook**(或访问一次 `/init`)。
2. 给机器人发送 `/admin`,添加 AI 服务商 —— 详见[配置文档](CONFIG.md)。

以后想更新,把 fork 与上游仓库同步即可,Cloudflare 会自动重新构建部署。

## 方式四:控制台复制粘贴(无需构建工具)

如果不想在本地运行任何东西 —— 这是唯一使用预构建 [`dist/index.js`](../../dist/index.js) 的部署方式:

1. 打开 [Cloudflare Workers](https://dash.cloudflare.com/?to=/:account/workers),创建一个新 Worker(*Create* → *Start with Hello World* → *Deploy*),然后点击 *Edit code*。
2. 把 [`dist/index.js`](../../dist/index.js) 的完整内容粘贴进编辑器,点击 *Deploy*。
3. 进入 Worker 的 **Settings**:
   - *Compatibility date*:设置为 `2026-08-04` 或更晚 —— 从该日期起 Node.js 兼容默认启用,无需任何兼容性标志。
   - *Bindings* → 添加 **KV Namespace** 绑定,变量名必须是 `DATABASE`。
   - *Bindings* → 添加 **AI** 绑定,变量名必须是 `AI` —— 只有用 Cloudflare Workers AI 模型时才需要;改用 `Account ID` + `API Token` 可以跳过。
   - *Variables and Secrets* → 添加 `TELEGRAM_TOKEN`(以及可选的 `ADMIN_ID`、`ADMIN_PASSWORD`)。
4. 重新部署使新设置生效。

## 初始化

打开你的 Worker 地址 —— `https://<worker名>.<子域>.workers.dev/` —— 在首页点击 **Bind Webhook**(或直接访问一次 `/init`),即可自动绑定 Telegram webhook、注册命令菜单(`/new`、`/redo`、`/img`、`/admin`、`/models`、`/help`),并把聊天菜单按钮(输入框旁边的按钮)绑定为打开管理后台的 Mini App。

> 第一次绑定时会自动把探测到的域名保存进管理面板配置,使用默认的 `*.workers.dev` 域名无需任何额外设置。使用自定义域名时,在管理面板中设置 `publicBaseUrl`,或直接设置 `PUBLIC_BASE_URL` 环境变量。

## 在管理面板中配置机器人

1. 在 Telegram 中给机器人发送 `/admin`(或点击输入框旁边的菜单按钮),会以 Telegram Mini App 的形式打开管理面板(通过 `ADMIN_ID` 自动授权)。
2. 在 **Chat Providers** 标签页添加 AI 服务商:名称、Base URL、API Key、API 格式和模型列表,然后选择默认服务商和模型。
3. 需要的话在 **Settings** 标签页调整其他选项。

详见[配置文档](CONFIG.md)。

## 开始聊天

1. 发送 `/new` 开始新会话,然后直接和机器人对话即可。
2. `/help` 查看所有命令,`/models` 切换模型。

> 群聊使用:需要在 BotFather 中把机器人的隐私模式设为 **Disable**(`/setprivacy`),公开群还需要把机器人设为管理员,否则机器人收不到 `@bot` 消息。

> 想要自动更新?方式三(Workers Builds)会在你每次同步 fork 时自动重新构建部署,无需配置任何 GitHub secrets 或 Actions。
