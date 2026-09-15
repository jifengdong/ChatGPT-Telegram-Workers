# 配置说明

配置分为两部分:

1. **环境变量 / 绑定** —— 启动 bot 所需的最小信息。
2. **管理后台** —— 其余全部配置(AI 提供商、提示词、权限、插件等),以单个 JSON 文档存于 KV。

## 1. 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `TELEGRAM_TOKEN` | 是 | [@BotFather](https://t.me/BotFather) 获取的 Bot Token,单个。 |
| `ADMIN_ID` | 建议 | 你的 Telegram 用户 id。用于管理后台授权(校验 Mini App `initData`),并限制私聊命令仅你可使用。 |
| `ADMIN_PASSWORD` | 否 | 在 Telegram 之外打开管理页时的备用密码。未设置则禁用密码登录(仅 Mini App)。 |
| `PUBLIC_BASE_URL` | 否 | 部署的公网 HTTPS 地址。优先于管理面板里保存的值;未设置时,第一次 `/init` 会把探测到的域名自动保存到管理面板配置。 |

绑定(Cloudflare / 运行时):

| 绑定 | 必填 | 说明 |
|---|---|---|
| `DATABASE` | 是 | KV 命名空间,用于聊天历史、缓存与全局配置 JSON。 |
| `AI` | 否 | Workers AI 绑定,仓库自带的 `wrangler.jsonc` 已声明。仅在使用 `workers` 提供商、且不想填 account id + token 时需要。 |
| `API_GUARD` | 否 | 可选的 worker,用于保护 webhook(`/telegram/:token/safehook`)。 |

> 原有环境变量(`OPENAI_API_KEY`、`TELEGRAM_AVAILABLE_TOKENS`、`LOCK_USER_CONFIG_KEYS`、`CUSTOM_COMMAND_*`、`PLUGIN_COMMAND_*` 等)**已全部移除**,请在管理后台中配置。

## 2. 管理后台

访问 `https://<你的域名>/admin`。

- 在 Telegram 内,通过 `/admin` 命令以 Mini App 打开。bot 会校验 Telegram `initData` 并匹配 `ADMIN_ID`,无需密码。
- 在 Telegram 外,若设置了 `ADMIN_PASSWORD` 则用密码登录。

### 标签页

- **Chat Providers** —— 添加聊天 AI 提供商。每个提供商填写 Name、Base URL、API Key、**API format**(协议)与**允许使用的模型列表**。点 **Fetch models** 可从端点(以 `/models` 结尾)拉取模型并点选加入;端点不支持模型列表时用 **+ Add model** 手动输入。选中一个模型作为当前使用项,并指定默认提供商。
- **Image Providers** —— 同上,用于图片生成。生成参数因协议和模型而异(OpenAI 的 `size`/`quality`/`style`,Workers AI 各模型的 `negative_prompt`/`width`/`height`/`num_steps`/`guidance` 等),因此每个 provider 有自己的 **Extra Params** JSON,合并进请求体;`prompt` 始终以代码传入值为准。
- **Settings** —— 原环境变量形式的全局选项:公网 Base URL、系统提示词、权限、历史长度、流式等。
- **Plugins** —— 请求模板命令(JSON 模板或 URL),可带独立的环境变量映射。
- **Custom Commands** —— 快捷指令。Value 以 `/setenv`、`/setenvs`、`/delenv` 或 JSON 开头时,作为配置补丁写回全局配置;其余按文本别名展开为另一条命令。

保存时会把整份配置以 JSON 写入 KV 键 `config:global`。

### 快捷指令(修改配置)

Custom Commands 可以直接修改全局配置,用来快速切换默认提供商或模型,效果等同旧版的 `CUSTOM_COMMAND_*`:

| Command | Value | 说明 |
|---|---|---|
| `/gpt4` | `/setenvs {"defaultChatProvider":"openai"}` | 切换默认聊天提供商 |
| `/fast` | `/setenv settings.systemInitMessage=你是简洁的助手` | 用点分路径修改单个配置项 |
| `/img-openai` | `/setenvs {"defaultImageProvider":"openai"}` | 切换默认图片提供商 |
| `/reset-prompt` | `/delenv settings.systemInitMessage` | 将某项恢复为默认值 |

支持的写法:

- `/setenv KEY=VALUE` —— `KEY` 用点分路径,如 `settings.systemInitMessage`、`defaultChatProvider`。
- `/setenvs {json}` —— JSON 对象补丁,顶层键 `settings` 按键合并,`chatProviders`/`imageProviders`/`plugins`/`customCommands` 按数组元素 `id` 合并,其余覆盖。
- `/delenv KEY` —— `settings.xxx` 恢复默认值,`defaultChatProvider`/`defaultImageProvider` 置空。
- 直接以 `{` 开头的裸 JSON 对象,等价于 `/setenvs`。

快捷指令会写入全局配置,因此仅 `ADMIN_ID` 本人或群管理员可以触发;非管理员调用会返回权限错误。它改变的是全局默认值,不提供"每个聊天独立配置"。

### API format

提供商不再绑定厂商列表,选择与端点匹配的 API format 即可:

| API format | 协议 | 说明 |
|---|---|---|
| `chat-completions` | OpenAI Chat Completions | `/v1/chat/completions`,OpenAI 兼容端点默认选它 |
| `anthropic-messages` | Anthropic Messages | `/v1/messages` |
| `responses` | OpenAI Responses | `/v1/responses` |
| `workers` | Cloudflare Workers AI | 使用 `AI` 绑定;无绑定时回退 account id + token |

图片的 API format 为 `images`(OpenAI `/v1/images/generations`)与 `workers`。

`workers` 不读取 **Base URL** 与 **API Key**:端点和凭据来自 `AI` 绑定(无绑定时用 `Account ID` / `API Token` 两个协议字段),因此表单不会展示这两个通用字段。已部署 `AI` 绑定时,`Account ID` 与 `API Token` 均可留空、提供商即可正常工作;无绑定时必须填 `Account ID` + `API Token`,两者都缺的 provider 会被跳过,而不是留到首次调用才报错。

**Fetch models** 在有绑定时通过绑定列模型,否则回退到账号级 Cloudflare API;两种方式都会按任务类型区分,聊天页只给文本生成模型,图片页只给图片生成模型。

部分较新的图片模型(`@cf/black-forest-labs/flux-2-*` 系列)只接受 `multipart/form-data` 请求体、不接受 JSON,用 JSON 会报 `5006: required properties at '/' are 'multipart'`。机器人会自动识别这些模型并按 multipart 编码;如果某个尚未覆盖的模型也报这个错,会自动改用 multipart 重试一次并记住它。

Name 可任意填写(如 `DeepSeek`、`Groq`、`Mistral`),任何 OpenAI 兼容端点都用 `chat-completions`。旧的厂商命名配置在加载时会自动迁移。

## 3. `/init`

在管理后台配置好 `publicBaseUrl` 后,在首页点击 **Bind Webhook**(或访问一次 `/init`)以注册 webhook 与命令菜单:

```
https://<你的域名>/init
```

网页均由 `@chatgpt-telegram-workers/web` 包提供:`/`(首页 + 使用说明)、`/admin`(管理后台)、`/interpolate`(插值模板测试页)。

## 本地 / Docker

见 [DEPLOY_OTHERS.md](./DEPLOY_OTHERS.md) —— 运行时 `config.json` 只配置数据库、服务器与代理;bot 配置仍在管理后台。
