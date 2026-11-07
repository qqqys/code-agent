# 本地凭据存储

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-storage)

> 核对日期：2026-11-07

## 定义

记录 OAuth 登录令牌和静态 Provider Key 在本机的存储后端、路径、文件权限和公开程度。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | macOS Keychain；Linux/Windows credentials 文件 | 官方确认 |
| Codex | `auth.json` · Keyring · Auto | 官方确认 |
| Qwen Code | `settings.json` · `.env` · 进程环境 · Subscription 令牌另存 `~/.qwen/subscription_credentials.json`（0600） | 条件项 |
| Kimi Code | `credentials/` 0600 · `config.toml` 明文 Key | 条件项 |
| Qoder CLI | 登录缓存可复用；具体后端与路径未公开 | 未确认 |

## 比较边界

### 本页包含

- 系统 Keyring/Keychain
- 认证文件与静态配置文件
- 可配置的凭据存储后端

### 本页不包含

- 云端服务保存的账号数据
- 第三方 Secret Manager 的内部实现
- 没有公开证据的路径猜测

## 跨产品事实

1. Claude Code 在 macOS 使用 Keychain；Codex 可显式选择 file、keyring 或 auto。
2. Kimi Code 的 OAuth 凭据文件使用 0600，但静态 Provider Key 可明文写在 `config.toml`。
3. Qwen Code 的 Subscription 令牌自 v0.26.8 起单独存 0600 的 `subscription_credentials.json`，而 Provider Key 仍可明文写在 `settings.json` 或 `.env`。
4. Qoder CLI 公共文档说明登录可复用，但未公开准确存储后端和路径，因此保留边界而不猜测。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | macOS Keychain；Linux/Windows credentials 文件 |
| 入口与配置 | 账号登录流程与平台凭据存储。 |
| 支持范围 | macOS 使用加密 Keychain；Linux 使用 `~/.claude/.credentials.json` 0600；Windows 使用同类文件并依 OS ACL。 |
| 具体行为 | 保存 OAuth 登录状态供后续会话复用。 |
| 会话与作用域 | 本机操作系统用户。 |
| 持久化位置 | 跨会话，直到 `/logout` 或凭据失效。 |
| 自动化用法 | 自动化通常绕过账号凭据库，改用环境 Key 或云身份。 |
| 安全与管理 | macOS 借助 Keychain；文件平台依靠 0600/ACL。 |
| 条件与边界 | API Key 环境变量不等同于账号登录凭据存储。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code authentication and credential management](https://code.claude.com/docs/en/team) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `auth.json` · Keyring · Auto |
| 入口与配置 | `cli_auth_credentials_store = "file"\|"keyring"\|"auto"`。 |
| 支持范围 | `file` 写 `~/.codex/auth.json`；`keyring` 使用系统凭据库；`auto` 优先 Keyring、失败回退文件。 |
| 具体行为 | 保存 ChatGPT OAuth、API Key 或 access token 登录状态。 |
| 会话与作用域 | Codex home 与当前 OS 用户。 |
| 持久化位置 | 跨会话，直到 `codex logout` 或令牌失效。 |
| 自动化用法 | CI 可使用隔离的 Codex home 或只注入短期环境凭据。 |
| 安全与管理 | 高安全环境应显式使用 Keyring，并保护 file fallback。 |
| 条件与边界 | 默认/可用后端依操作系统和 Keyring 可访问性。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `settings.json` · `.env` · 进程环境 · Subscription 令牌另存 `~/.qwen/subscription_credentials.json`（0600） |
| 入口与配置 | Provider Key：Settings、项目 `.env`、系统环境。Qwen Subscription 令牌：`~/.qwen/subscription_credentials.json`（`QWEN_HOME` 优先于默认目录）。 |
| 支持范围 | Key 按优先级 CLI 旗标 > shell 环境 > `.env` > `settings.json` 的 `env` 字段读取；Subscription 凭据由 Core 的原子私有存储写入——文件 0600、目录 0700、`atomicWriteFile` 加 `noFollow`、读取 `O_NOFOLLOW` 拒绝符号链接、`proper-lockfile` 跨进程互斥（stale 60 秒），设计文档逐字为 “Core owns private atomic storage, restoration, cross-process refresh locking and revocation” 与 “Subscription storage is separate from legacy OAuth”。 |
| 具体行为 | Provider Key 按优先级生效；Subscription 会话从凭据文件读令牌对并自动刷新（`expiresAt` 前 30 秒内或 401 触发），模型目录缓存也写回同一文件。 |
| 会话与作用域 | Key：项目、用户、系统设置或当前进程；凭据文件：本机用户的 Qwen home，CLI、Desktop 与 VS Code 仅在相同 `QWEN_HOME` 下共享。 |
| 持久化位置 | Settings 与 `.env` 为明文文件；进程环境不由 Qwen 持久化；凭据文件跨会话保留，直到 `/logout`、刷新被拒（`invalid_grant` 删除凭据）或手工删除。 |
| 自动化用法 | CI 用环境变量注入 Key，不需要写本地认证文件；订阅登录没有非交互入口，自动化改用 API Key。 |
| 安全与管理 | 凭据文件 0600 且拒绝符号链接；令牌与设备码不进入 GUI 响应；文档推荐把向导保存的 Key 从 Settings 移到 `.env`，并避免提交到版本控制。 |
| 条件与边界 | 系统 override Settings 可覆盖项目/用户值；凭据文件的 `baseUrl` 与 `clientId` 必须匹配当前 OAuth 环境配置才被视为已登录，不匹配按未登录处理；遗留 Qwen OAuth 数据与订阅凭据分开存放、互不代表。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code `packages/core/src/qwen/subscription-session.ts`（固定到标签 v0.26.9，15,303 字节）：凭据文件路径为 `path.join(Storage.getGlobalQwenDir(), 'subscription_credentials.json')`，`storage.ts`（29,478 字节）的 `getGlobalQwenDir()` 先读 `QWEN_HOME`、否则 `~/.qwen`；写入用 `atomicWriteFile` 且 `mode: 0o600, forceMode: true, noFollow: true`，目录以 `mode: 0o700` 创建，读取以 `O_RDONLY | O_NOFOLLOW` 打开拒绝符号链接，互斥用 `proper-lockfile`（`stale: 60_000`、`retries: 0`，ELOCKED 时每 100ms 重试至多 350 次）；zod 凭据 schema 字段为 `revision`、可选 `signInAttempt`、`baseUrl`、`clientId`、可选 `models` 缓存、可选 `tokens`（`access_token`、`refresh_token`、`token_type: 'Bearer'`、`scope`、`expires_in`、`expiresAt`）与可选三档 `retryAfter`；`signIn` 先写入本次 `signInAttempt` 再请求设备码（轮询期间既有登录保持可用），换到 token 后按 `expiresAt = Date.now() + expires_in * 1000` 落盘并请求 `userinfo`；`getAccessToken` 在 `expiresAt <= Date.now() + 30_000` 或传入被拒 token 时先刷新，`getUserInfo` 收到 401 只重试一次刷新；刷新遇 `invalid_grant` 时删除 tokens（存在进行中 `signInAttempt`）或删除整个凭据文件；`signOut` 在锁内先 `fs.rm` 本地凭据文件、再对 refresh token 调 `revokeToken`，本地删除失败抛 `cleanup` 阶段错误、远程撤销失败抛 `revoke` 阶段错误；`getModels` 以 Bearer token 请求 `GET https://api.qwen.ai/compatible-mode/v1/models`（5 秒超时、1 MiB 上限、拒绝重定向），成功把去重后的模型列表写回凭据文件缓存，5xx 或网络失败时回退缓存并报 “Provider model list unavailable; using the last successfully loaded models.”；429 按 device/refresh/userinfo 三档把 `Retry-After` 写进文件做跨进程共享冷却；`isSignedIn`/`getIdentity` 只检查本地文件里 `baseUrl` 与 `clientId` 同当前 OAuth 配置匹配的 tokens 是否存在，不发网络请求；`onChange` 以 500ms 间隔 `watchFile` 凭据文件供 UI 订阅外部删除](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/core/src/qwen/subscription-session.ts)、[Qwen Code 官方设计文档 `docs/design/qwen-subscription.md`（固定到标签 v0.26.9，26,196 字节，关联 issue #15180，另有 zh-CN 版）：范围逐字为 “CLI (Ink/OpenTUI), Desktop and VS Code share Core subscription credentials, membership queries and OpenAI Chat inference. Subscription login, activation, model loading, inference, search and account commands are available without `DEV=true`, including packaged clients. Subscription clients use fixed production endpoints.”；授权流程 “Request a device code, display/open its authorization link and poll for tokens. Core enforces the returned `expires_in`; GUI adds no fixed 600-second deadline.”、“Only case-insensitive Plus/Pro qualifies for activation.”、“Purchase waiting checks membership every five seconds, for at most two minutes from its first confirmed unpaid state.”；退出 “Signout deletes local credentials before remote revocation. Remote failure must still synchronize local logout and explain that remote revocation failed; failed local deletion must not announce logout.”；协议端点表为 Device authorization `POST /api/oauth/device/code`、Token exchange/refresh `POST /api/oauth/token`、Identity/membership `GET /api/oauth/userinfo`、Revocation `POST /api/oauth/revoke`，并逐字写 “The subscription auth origin is `https://auth.qwen.ai` and the OAuth client ID is `qwen-code-cli`. Browser links to `chat.qwen.ai` carry `entry=qwen_code` and `paywallScene`.”；推理 “Inference uses the fixed `https://api.qwen.ai/compatible-mode/v1` gateway with OpenAI Chat Completions. Configuration stores the auth selector, model ID, fixed gateway and placeholder credential.”；凭据 “Subscription storage is separate from legacy OAuth.”、“Hosts share sessions only with the same effective `QWEN_HOME`.”、“tokens and device codes never enter GUI responses”；模型目录 “Load all IDs from `GET /compatible-mode/v1/models`, without an allowlist. The recorded preproduction catalog included `qwen3.8-max`, `qwen3.7-flash` and `qwen3.7-plus`. Every explicit subscription sign-in selects returned `qwen3.8-max`, otherwise the first model, ignoring the previous saved selection.”；命令可用性 “Offer built-in `/logout` and `/upgrade` only when local credentials belong to the current OAuth environment and the active model connection uses `qwen-subscription`. API-key connections and signed-out selections do not qualify. Expired access tokens with a refresh token remain signed in until refresh rejects them. Availability checks never start OAuth or call the network.”；退出后 “Interactive logout is restricted to an idle main response. After local logout, cancel background agents/side questions, clear account/plan status while preserving the model, provider and saved settings, without a dialog or automatic provider switch. Preserve other providers’ API keys and settings”；重登录 “Every explicit Qwen sign-in starts fresh device authorization at `/authorize`, even when local credentials remain valid.”；设置保存 “In a trusted project it saves the model, authentication type, and endpoint to that project’s settings regardless of where the provider catalog lives. When the interactive CLI is started in the home directory, it saves the selection to user settings so it survives restart.” 与 “The CLI `/auth` menu initially highlights Qwen Account with Subscription.”；配额 “Only HTTP `402` together with `error.code = insufficient_quota` identifies quota exhaustion”、“Known `lite`/`plus` members receive weekly-credit guidance and `/upgrade`; `pro` receives weekly-credit guidance to wait for reset.”；思考档位 “All models on the Qwen Subscription route default to medium in the controls and on the wire.”；搜索 “Subscription search uses the existing MCP backend with dynamic Bearer tokens, a single rejected-token refresh on HTTP 401 and cancellation tied to the tool request.”](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/design/qwen-subscription.md)、[Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `credentials/` 0600 · `config.toml` 明文 Key |
| 入口与配置 | `~/.kimi-code/credentials/` 与 `~/.kimi-code/config.toml`。 |
| 支持范围 | OAuth 凭据目录 0700、文件 0600；静态 Provider `api_key` 明文位于 config。 |
| 具体行为 | OAuth 账号可切换和退出；静态 Key 随 Provider 配置读取。 |
| 会话与作用域 | 本机用户的 Kimi Code home。 |
| 持久化位置 | 跨会话，直到退出账号或编辑配置。 |
| 自动化用法 | CI 可用临时 home 或 `KIMI_MODEL_*`，避免长期配置落盘。 |
| 安全与管理 | 保护 config 文件和备份；0600 只覆盖 credentials，不会自动加密 config 中的 Key。 |
| 条件与边界 | OAuth 与静态 Key 的安全属性不同，不能合并描述。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 登录缓存可复用；具体后端与路径未公开 |
| 入口与配置 | `qodercli login`、`/login` 与模型设置。 |
| 支持范围 | 登录状态可被后续 CLI 和 SDK 复用；公开文档未说明精确 Keychain/文件后端或路径。 |
| 具体行为 | 本地登录优先于 `QODER_PERSONAL_ACCESS_TOKEN`。 |
| 会话与作用域 | 本机用户。 |
| 持久化位置 | 跨会话，直到 `/logout`；Custom Model Key 由模型设置保存。 |
| 自动化用法 | CI 用 PAT 环境变量，避免依赖交互登录缓存。 |
| 安全与管理 | 因后端未公开，不对加密方式作推断。 |
| 条件与边界 | “可复用登录”不等于已确认具体磁盘路径。 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)、[Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)、[Qoder CLI model configuration](https://docs.qoder.com/en/cli/model) |

## 官方来源

- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code `packages/core/src/qwen/subscription-session.ts`（固定到标签 v0.26.9，15,303 字节）：凭据文件路径为 `path.join(Storage.getGlobalQwenDir(), 'subscription_credentials.json')`，`storage.ts`（29,478 字节）的 `getGlobalQwenDir()` 先读 `QWEN_HOME`、否则 `~/.qwen`；写入用 `atomicWriteFile` 且 `mode: 0o600, forceMode: true, noFollow: true`，目录以 `mode: 0o700` 创建，读取以 `O_RDONLY | O_NOFOLLOW` 打开拒绝符号链接，互斥用 `proper-lockfile`（`stale: 60_000`、`retries: 0`，ELOCKED 时每 100ms 重试至多 350 次）；zod 凭据 schema 字段为 `revision`、可选 `signInAttempt`、`baseUrl`、`clientId`、可选 `models` 缓存、可选 `tokens`（`access_token`、`refresh_token`、`token_type: 'Bearer'`、`scope`、`expires_in`、`expiresAt`）与可选三档 `retryAfter`；`signIn` 先写入本次 `signInAttempt` 再请求设备码（轮询期间既有登录保持可用），换到 token 后按 `expiresAt = Date.now() + expires_in * 1000` 落盘并请求 `userinfo`；`getAccessToken` 在 `expiresAt <= Date.now() + 30_000` 或传入被拒 token 时先刷新，`getUserInfo` 收到 401 只重试一次刷新；刷新遇 `invalid_grant` 时删除 tokens（存在进行中 `signInAttempt`）或删除整个凭据文件；`signOut` 在锁内先 `fs.rm` 本地凭据文件、再对 refresh token 调 `revokeToken`，本地删除失败抛 `cleanup` 阶段错误、远程撤销失败抛 `revoke` 阶段错误；`getModels` 以 Bearer token 请求 `GET https://api.qwen.ai/compatible-mode/v1/models`（5 秒超时、1 MiB 上限、拒绝重定向），成功把去重后的模型列表写回凭据文件缓存，5xx 或网络失败时回退缓存并报 “Provider model list unavailable; using the last successfully loaded models.”；429 按 device/refresh/userinfo 三档把 `Retry-After` 写进文件做跨进程共享冷却；`isSignedIn`/`getIdentity` 只检查本地文件里 `baseUrl` 与 `clientId` 同当前 OAuth 配置匹配的 tokens 是否存在，不发网络请求；`onChange` 以 500ms 间隔 `watchFile` 凭据文件供 UI 订阅外部删除](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/core/src/qwen/subscription-session.ts)
- [Qwen Code 官方设计文档 `docs/design/qwen-subscription.md`（固定到标签 v0.26.9，26,196 字节，关联 issue #15180，另有 zh-CN 版）：范围逐字为 “CLI (Ink/OpenTUI), Desktop and VS Code share Core subscription credentials, membership queries and OpenAI Chat inference. Subscription login, activation, model loading, inference, search and account commands are available without `DEV=true`, including packaged clients. Subscription clients use fixed production endpoints.”；授权流程 “Request a device code, display/open its authorization link and poll for tokens. Core enforces the returned `expires_in`; GUI adds no fixed 600-second deadline.”、“Only case-insensitive Plus/Pro qualifies for activation.”、“Purchase waiting checks membership every five seconds, for at most two minutes from its first confirmed unpaid state.”；退出 “Signout deletes local credentials before remote revocation. Remote failure must still synchronize local logout and explain that remote revocation failed; failed local deletion must not announce logout.”；协议端点表为 Device authorization `POST /api/oauth/device/code`、Token exchange/refresh `POST /api/oauth/token`、Identity/membership `GET /api/oauth/userinfo`、Revocation `POST /api/oauth/revoke`，并逐字写 “The subscription auth origin is `https://auth.qwen.ai` and the OAuth client ID is `qwen-code-cli`. Browser links to `chat.qwen.ai` carry `entry=qwen_code` and `paywallScene`.”；推理 “Inference uses the fixed `https://api.qwen.ai/compatible-mode/v1` gateway with OpenAI Chat Completions. Configuration stores the auth selector, model ID, fixed gateway and placeholder credential.”；凭据 “Subscription storage is separate from legacy OAuth.”、“Hosts share sessions only with the same effective `QWEN_HOME`.”、“tokens and device codes never enter GUI responses”；模型目录 “Load all IDs from `GET /compatible-mode/v1/models`, without an allowlist. The recorded preproduction catalog included `qwen3.8-max`, `qwen3.7-flash` and `qwen3.7-plus`. Every explicit subscription sign-in selects returned `qwen3.8-max`, otherwise the first model, ignoring the previous saved selection.”；命令可用性 “Offer built-in `/logout` and `/upgrade` only when local credentials belong to the current OAuth environment and the active model connection uses `qwen-subscription`. API-key connections and signed-out selections do not qualify. Expired access tokens with a refresh token remain signed in until refresh rejects them. Availability checks never start OAuth or call the network.”；退出后 “Interactive logout is restricted to an idle main response. After local logout, cancel background agents/side questions, clear account/plan status while preserving the model, provider and saved settings, without a dialog or automatic provider switch. Preserve other providers’ API keys and settings”；重登录 “Every explicit Qwen sign-in starts fresh device authorization at `/authorize`, even when local credentials remain valid.”；设置保存 “In a trusted project it saves the model, authentication type, and endpoint to that project’s settings regardless of where the provider catalog lives. When the interactive CLI is started in the home directory, it saves the selection to user settings so it survives restart.” 与 “The CLI `/auth` menu initially highlights Qwen Account with Subscription.”；配额 “Only HTTP `402` together with `error.code = insufficient_quota` identifies quota exhaustion”、“Known `lite`/`plus` members receive weekly-credit guidance and `/upgrade`; `pro` receives weekly-credit guidance to wait for reset.”；思考档位 “All models on the Qwen Subscription route default to medium in the controls and on the wire.”；搜索 “Subscription search uses the existing MCP backend with dynamic Bearer tokens, a single rejected-token refresh on HTTP 401 and cancellation tied to the tool request.”](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/design/qwen-subscription.md)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)
- [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)
- [Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)

## 关联能力

- [环境变量注入](./auth-environment.md)
- [退出与撤销本地凭据](./auth-logout.md)
- [浏览器账号登录](./auth-browser.md)
