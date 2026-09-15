# 从 v1 迁移到 v2

v2(2.0.0)是一次大版本重写。最大的变化:**配置从几十个环境变量迁移到了管理面板**,以一份 JSON 文档(`config:global`)的形式存在,并且和以前一样存储在 `DATABASE` KV namespace 中。环境变量只剩少数几个。

迁移是手动的,但很快 —— 部署方式几乎不变,只需要在管理面板里重新录入一次服务商的 Key。

## 哪些东西不变

- `DATABASE` KV 绑定和你的 KV namespace。
- 聊天历史的键(`history:{chat_id}`)—— 旧会话可以直接延续。不过历史条目的格式做了简化,如果旧会话表现异常,发送 `/new` 开启新会话即可。
- Webhook 地址(`/telegram/{token}/webhook`)、`/init`、`/admin` 以及插件/插值测试页面。
- 命令 `/start`、`/new`、`/redo`、`/img`、`/models`、`/help`、`/version`、`/system`。

## 第一步:记录当前配置

更新之前,先把 v1 的 wrangler.jsonc / 控制台环境变量里的内容记下来(API Key、模型、白名单、自定义命令、插件模板等)。这部分数据**没有自动迁移**。

## 第二步:更新 Worker 代码

按照 v1 时的部署方式部署新构建即可 —— 更新代码后 `pnpm run deploy`、GitHub Action / Cloudflare Git 构建,或在控制台重新粘贴新的 `dist/index.js`。

## 第三步:精简环境变量

把旧的 `vars` 换成下面这几个(参考 [wrangler.jsonc](../../wrangler.jsonc)):

| 变量 | 必填 | 说明 |
|---|---|---|
| `TELEGRAM_TOKEN` | 是 | BotFather 发的单个 Bot Token |
| `ADMIN_ID` | 建议 | 你的 Telegram 用户 ID,授权 `/admin` 和私聊命令 |
| `ADMIN_PASSWORD` | 否 | 在 Telegram 之外用密码登录 `/admin` |
| `PUBLIC_BASE_URL` | 否 | 公网 HTTPS 地址;未设置时第一次 `/init` 会自动探测并保存 |

`DATABASE` 的 KV 绑定保持原样,不要动。

> **多机器人说明:** v1 的 `TELEGRAM_AVAILABLE_TOKENS` / `TELEGRAM_BOT_NAME` 支持一个部署多个机器人。v2 一个部署只服务**一个 Token** —— 需要多个机器人就部署多个 Worker。

## 第四步:在管理面板重新录入配置

打开 `/admin`(在 Telegram 里给机器人发 `/admin`,或在浏览器打开并用 `ADMIN_PASSWORD` 登录),按下表迁移:

### AI 服务商 → *Chat Providers* / *Image Providers* 标签页

每个旧服务商添加一个 provider,然后选择默认项。v2 的服务商基于 API 协议而不是厂商名单:任何 OpenAI 兼容端点都用 `chat-completions` API 格式。

| v1 变量 | 迁移到 |
|---|---|
| `OPENAI_API_KEY` / `OPENAI_API_BASE` / `OPENAI_CHAT_MODEL` / `OPENAI_API_EXTRA_PARAMS` | 聊天 provider,API 格式 `chat-completions` |
| `GOOGLE_API_KEY` / `GOOGLE_API_BASE` / `GOOGLE_CHAT_MODEL` | 聊天 provider,API 格式 `chat-completions`(Gemini 的 OpenAI 兼容端点) |
| `MISTRAL_*`、`COHERE_*`、`GROQ_*`、`DEEPSEEK_*`、`XAI_*` | 聊天 provider,API 格式 `chat-completions` |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_API_BASE` / `ANTHROPIC_CHAT_MODEL` | 聊天 provider,API 格式 `anthropic-messages` |
| `AZURE_API_KEY` / `AZURE_COMPLETIONS_API` / `AZURE_CHAT_MODEL` | 聊天 provider,API 格式 `chat-completions`,Base URL 填 Azure 部署地址 |
| `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_TOKEN` + `WORKERS_CHAT_MODEL` | 聊天 provider,API 格式 `workers`(account id/token 填在 provider 的 options 里,或继续使用 `AI` 绑定) |
| `DALL_E_MODEL` / `DALL_E_*` | 图片 provider,API 格式 `images`;尺寸/质量/风格填在该 provider 的 **Extra Params** JSON 里(它们是 OpenAI 专有参数,不再作为全局设置) |
| `WORKERS_IMAGE_MODEL` | 图片 provider,API 格式 `workers` |
| `AI_PROVIDER` / `AI_IMAGE_PROVIDER` | 默认服务商选择(`defaultChatProvider` / `defaultImageProvider`) |
| `OPENAI_CHAT_MODELS_LIST` 以及所有 `*_MODELS_LIST` | provider 的模型列表(管理面板也可以直接从端点拉取) |

在 provider 上使用 **Fetch models** 可以直接从端点拉取模型列表,不用再手动填 `*_MODELS_LIST`。

### 通用设置 → *Settings* 标签页

| v1 变量 | v2 设置项 |
|---|---|
| `SYSTEM_INIT_MESSAGE` | `systemInitMessage` |
| `LANGUAGE` | `language` |
| `UPDATE_BRANCH` | `updateBranch` |
| `CHAT_COMPLETE_API_TIMEOUT` | `chatCompleteApiTimeout` |
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

移除的概念:

- `LOCK_USER_CONFIG_KEYS` —— 用户级配置已不存在,只有管理员能改配置。
- `SYSTEM_INIT_MESSAGE_ROLE` —— v1 已废弃,v2 移除。
- `TELEGRAM_BOT_NAME` —— 不再需要(一个部署只有一个 Token)。

### 自定义命令 → *Custom Commands* 标签页

把每个 `CUSTOM_COMMAND_*` 变量重建为一条自定义命令,`COMMAND_DESCRIPTION_*` 填到它的描述里。命令值仍然是 `/setenv` 风格的语法,但键改成了**小驼峰点路径**:

| v1 值 | v2 值 |
|---|---|
| `/setenvs {"AI_PROVIDER": "azure"}` | `/setenvs {"defaultChatProvider": "<provider-id>"}` |
| `/setenvs {"OPENAI_CHAT_MODEL": "gpt-4"}` | `/setenvs {"chatProviders": [{"id": "<provider-id>", "model": "gpt-4"}]}` |
| `/setenvs {"SYSTEM_INIT_MESSAGE": "…"}` | `/setenvs {"settings": {"systemInitMessage": "…"}}` |

### 插件 → *Plugins* 标签页

把每个 `PLUGIN_COMMAND_*` 变量重建为一条插件(命令、描述、scope、模板 JSON 或 URL、env)。模板格式本身没有变化 —— 见[插件系统](PLUGINS.md)。

## 第五步:重新初始化并测试

1. 访问一次 `/init`,重新注册 webhook 和新的命令菜单。
2. `/new`,和机器人聊一句,再检查 `/models`、`/img`、自定义命令和插件。
3. `/admin` 应该能在 Telegram 内免密码打开 Mini App(当你的 ID 与 `ADMIN_ID` 一致时)。

## v2 命令变化

| 命令 | 变化 |
|---|---|
| `/admin` | **新增** — 以 Telegram Mini App 打开管理面板 |
| `/setenv`、`/setenvs`、`/delenv` | 语义变化 —— 修改**全局**配置(不再是用户级配置)。仅限管理员(`ADMIN_ID`)或群管理员使用。键为小驼峰点路径,例如 `/setenv settings.streamMode=false` |
| `/start`、`/new`、`/redo`、`/img`、`/models`、`/help`、`/version`、`/system` | 不变 |
| `/echo` | 和以前一样,仅开发模式可用 |

## 回滚

Cloudflare 会在 Worker 的版本历史中保留每次部署,需要时可以在控制台一键回滚。v2 的配置保存在 KV 的 `config:global` 键中,删除它会让 v2 恢复默认配置,但不影响 v1 时代的聊天历史。
