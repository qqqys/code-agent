# 退出与撤销本地凭据

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-logout)

> 核对日期：2026-11-07

## 定义

退出当前产品账号或撤销 CLI 对本地凭据的使用，并区分账号令牌与手工配置的 Provider Key。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/logout` | 官方确认 |
| Codex | `codex logout` | 官方确认 |
| Qwen Code | `/logout`（条件：仅 Qwen Subscription 登录且空闲时出现，先删本地凭据再远程撤销 refresh token）· Provider Key 配置仍无退出命令、需删除 Key | 条件项 |
| Kimi Code | `/logout` | 源码确认 |
| Qoder CLI | `/logout` | 官方确认 |

## 比较边界

### 本页包含

- 退出命令
- 被清理的凭据范围
- 没有独立退出命令时的明确操作

### 本页不包含

- 服务端永久删除账号
- 云厂商 IAM 撤销
- 轮换第三方 API Key 的完整流程

## 跨产品事实

1. 五家都有 `/logout` 或等价的退出命令；Qwen Code 的 `/logout` 自 v0.26.8 起提供，且只在 Qwen Subscription 账号登录下出现。
2. Qwen Code 的 `/logout` 先删本地凭据再远程撤销 refresh token；API Key/Provider 配置仍没有退出命令，撤销本地使用需要重配 Provider 或删除对应 Key。
3. 退出账号通常不会自动删除手工写入配置或环境中的第三方 Provider Key。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/logout` |
| 入口与配置 | `/logout`。 |
| 支持范围 | 清除当前 Claude 账号的本地登录状态。 |
| 具体行为 | 后续会话需要重新登录或改用 API/云 Provider 凭据。 |
| 会话与作用域 | 本机 Claude Code 账号凭据。 |
| 持久化位置 | 立即影响后续会话。 |
| 自动化用法 | 临时环境 Key 的撤销由外部环境/Secret Store 处理。 |
| 安全与管理 | 退出不替代服务端撤销泄露的 API Key。 |
| 条件与边界 | Managed 登录策略仍可能在下次启动要求指定账号。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code authentication and credential management](https://code.claude.com/docs/en/team) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `codex logout` |
| 入口与配置 | `codex logout`。 |
| 支持范围 | 移除本地保存的 Codex 登录凭据。 |
| 具体行为 | `codex login status` 随后应显示未登录。 |
| 会话与作用域 | 当前 Codex home。 |
| 持久化位置 | 跨会话生效。 |
| 自动化用法 | 隔离环境可直接丢弃临时 Codex home。 |
| 安全与管理 | 环境中的 Provider Key 仍需从环境或 Secret Store 移除。 |
| 条件与边界 | 不同 `CODEX_HOME` 各自有独立登录状态。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/logout`（条件：仅 Qwen Subscription 登录且空闲时出现，先删本地凭据再远程撤销 refresh token）· Provider Key 配置仍无退出命令、需删除 Key |
| 入口与配置 | `/logout`（条件：当前认证类型为 `qwen-subscription` 且本地凭据有效时才出现在命令列表，仅交互模式）；Provider Key 配置没有退出命令，用 `/auth` 重选 Provider，并从 Settings、`.env` 或系统环境删除 Key。 |
| 支持范围 | `QwenSubscriptionSession.signOut()`：在凭据锁内先删除 `~/.qwen/subscription_credentials.json`，再向 `POST /api/oauth/revoke` 撤销 refresh token（`token_type_hint=refresh_token`）；官方设计口径为 “Signout deletes local credentials before remote revocation”。 |
| 具体行为 | 非订阅认证下运行只提示 “This connection does not require /logout. Use /auth to switch model providers.”；主响应进行中运行提示 “Wait for the current response to finish before signing out.”。退出成功后取消旁路问题（`cancelBtw`）、中止全部后台任务（持久化状态 cancelled）并清除计划缓存，但保留模型、Provider 选择与已保存设置，不弹对话框、不自动切换 Provider。 |
| 会话与作用域 | 本机 Qwen home 的订阅凭据与账号/计划状态；远程撤销作用于该账号的 refresh token。其他 Provider 的 API Key 与设置不受影响。 |
| 持久化位置 | 跨会话生效；外部直接删除凭据文件同样生效——可见性钩子以 500ms 轮询凭据文件，删除后清掉计划缓存并隐藏 `/logout` 与 `/upgrade`。 |
| 自动化用法 | 远程撤销失败不回滚本地退出，只警告 “You are signed out locally, but the remote session could not be revoked.”；本地文件删除失败报 “Could not remove local Qwen credentials. Check local file permissions.” 且不宣布已退出。CI 临时环境可直接丢弃整个 `QWEN_HOME`。 |
| 安全与管理 | access token 过期但 refresh token 仍在时视为已登录，直到刷新被拒（`invalid_grant` 即删除凭据）；退出不撤销写在 Settings、`.env` 或环境里的任何 API Key，也不替代服务端吊销泄露令牌之外的凭据。 |
| 条件与边界 | 自 v0.26.8（2026-11-05 发布）。旧结论「无独立 logout」只适用于该版本之前或 Provider Key 配置；退出后模型列表隐藏订阅条目、同名 API Key 模型仍可用，重新登录后订阅条目恢复。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code 命令文档 `docs/users/features/commands.md`（固定到标签 v0.26.9，79,647 字节，与 v0.26.8 逐字节相同；v0.26.7 为 79,175 字节）：v0.26.9 相对 v0.26.7 的全部命令集合差异是 `### 1.10 Information, Settings, and Help` 表新增两行——`/logout` 行描述逐字为 “Sign out of the active Qwen Subscription account (available with Qwen Subscription login)”、`/upgrade` 行描述逐字为 “Open Qwen subscription plans (available with Qwen Subscription login)”，两行用法列都只有命令本身、无参数；同表 `/auth` 行逐字为 “Change authentication method”、用法列为 “`/auth`, `/connect`, `/login`”](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/users/features/commands.md)、[Qwen Code `packages/cli/src/ui/commands/subscription-commands.ts`（固定到标签 v0.26.9，4,046 字节）与 `packages/cli/src/ui/hooks/use-subscription-command-visibility.ts`（2,037 字节）：`logoutCommand` 的 `name` 为 `logout`、描述 “Sign out of your Qwen account”、`supportedModes: ['interactive']`、`canCancel: false`，`config.getAuthType() !== AuthType.QWEN_SUBSCRIPTION` 或 `QwenSubscriptionSession().isSignedIn()` 为假时只返回 info “This connection does not require /logout. Use /auth to switch model providers.”，主响应未空闲（`!context.ui.isIdleRef.current`）时返回 warning “Wait for the current response to finish before signing out.”；`signOut()` 抛 `SubscriptionOAuthError` 且 `stage === 'revoke'` 时本地已退出、只追加 warning “You are signed out locally, but the remote session could not be revoked.”，其他错误返回 “Could not remove local Qwen credentials. Check local file permissions.”；成功路径依次执行 `context.ui.cancelBtw()`、`getBackgroundTaskRegistry().abortAll({ notify: false, persistedStatus: 'cancelled' })` 与 `config.setSubscriptionPlan(undefined)`。`upgradeCommand` 的 `name` 为 `upgrade`、描述 “Open Qwen subscription plans”、`supportedModes: ['interactive']`，非订阅登录时返回 info “This command is only available with Qwen Subscription login. Use /auth to sign in to Qwen Subscription.”，否则在 `isBrowserLaunchSuppressed()` 为假时 `openBrowserSecurely(getQwenSubscriptionPlansUrl('cli'))`、打开失败返回 error “Could not open your browser. Visit {{url}}”，两种情况都再给 info “Qwen subscription plans: {{url}}”（保留可复制 URL）。`filterSubscriptionCommands` 只在 `authType === AuthType.QWEN_SUBSCRIPTION && signedIn` 时保留两个命令，否则从命令列表整体过滤；`useSubscriptionCommandVisibility` 用 `useSyncExternalStore` 订阅凭据文件变化与 `onModelChange`，快照即 `config?.getAuthType?.() === AuthType.QWEN_SUBSCRIPTION && session.isSignedIn()`，凭据被外部删除时同时 `setSubscriptionPlan(undefined)`](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/cli/src/ui/commands/subscription-commands.ts)、[Qwen Code `packages/core/src/qwen/subscription-session.ts`（固定到标签 v0.26.9，15,303 字节）：凭据文件路径为 `path.join(Storage.getGlobalQwenDir(), 'subscription_credentials.json')`，`storage.ts`（29,478 字节）的 `getGlobalQwenDir()` 先读 `QWEN_HOME`、否则 `~/.qwen`；写入用 `atomicWriteFile` 且 `mode: 0o600, forceMode: true, noFollow: true`，目录以 `mode: 0o700` 创建，读取以 `O_RDONLY | O_NOFOLLOW` 打开拒绝符号链接，互斥用 `proper-lockfile`（`stale: 60_000`、`retries: 0`，ELOCKED 时每 100ms 重试至多 350 次）；zod 凭据 schema 字段为 `revision`、可选 `signInAttempt`、`baseUrl`、`clientId`、可选 `models` 缓存、可选 `tokens`（`access_token`、`refresh_token`、`token_type: 'Bearer'`、`scope`、`expires_in`、`expiresAt`）与可选三档 `retryAfter`；`signIn` 先写入本次 `signInAttempt` 再请求设备码（轮询期间既有登录保持可用），换到 token 后按 `expiresAt = Date.now() + expires_in * 1000` 落盘并请求 `userinfo`；`getAccessToken` 在 `expiresAt <= Date.now() + 30_000` 或传入被拒 token 时先刷新，`getUserInfo` 收到 401 只重试一次刷新；刷新遇 `invalid_grant` 时删除 tokens（存在进行中 `signInAttempt`）或删除整个凭据文件；`signOut` 在锁内先 `fs.rm` 本地凭据文件、再对 refresh token 调 `revokeToken`，本地删除失败抛 `cleanup` 阶段错误、远程撤销失败抛 `revoke` 阶段错误；`getModels` 以 Bearer token 请求 `GET https://api.qwen.ai/compatible-mode/v1/models`（5 秒超时、1 MiB 上限、拒绝重定向），成功把去重后的模型列表写回凭据文件缓存，5xx 或网络失败时回退缓存并报 “Provider model list unavailable; using the last successfully loaded models.”；429 按 device/refresh/userinfo 三档把 `Retry-After` 写进文件做跨进程共享冷却；`isSignedIn`/`getIdentity` 只检查本地文件里 `baseUrl` 与 `clientId` 同当前 OAuth 配置匹配的 tokens 是否存在，不发网络请求；`onChange` 以 500ms 间隔 `watchFile` 凭据文件供 UI 订阅外部删除](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/core/src/qwen/subscription-session.ts)、[Qwen Code 官方设计文档 `docs/design/qwen-subscription.md`（固定到标签 v0.26.9，26,196 字节，关联 issue #15180，另有 zh-CN 版）：范围逐字为 “CLI (Ink/OpenTUI), Desktop and VS Code share Core subscription credentials, membership queries and OpenAI Chat inference. Subscription login, activation, model loading, inference, search and account commands are available without `DEV=true`, including packaged clients. Subscription clients use fixed production endpoints.”；授权流程 “Request a device code, display/open its authorization link and poll for tokens. Core enforces the returned `expires_in`; GUI adds no fixed 600-second deadline.”、“Only case-insensitive Plus/Pro qualifies for activation.”、“Purchase waiting checks membership every five seconds, for at most two minutes from its first confirmed unpaid state.”；退出 “Signout deletes local credentials before remote revocation. Remote failure must still synchronize local logout and explain that remote revocation failed; failed local deletion must not announce logout.”；协议端点表为 Device authorization `POST /api/oauth/device/code`、Token exchange/refresh `POST /api/oauth/token`、Identity/membership `GET /api/oauth/userinfo`、Revocation `POST /api/oauth/revoke`，并逐字写 “The subscription auth origin is `https://auth.qwen.ai` and the OAuth client ID is `qwen-code-cli`. Browser links to `chat.qwen.ai` carry `entry=qwen_code` and `paywallScene`.”；推理 “Inference uses the fixed `https://api.qwen.ai/compatible-mode/v1` gateway with OpenAI Chat Completions. Configuration stores the auth selector, model ID, fixed gateway and placeholder credential.”；凭据 “Subscription storage is separate from legacy OAuth.”、“Hosts share sessions only with the same effective `QWEN_HOME`.”、“tokens and device codes never enter GUI responses”；模型目录 “Load all IDs from `GET /compatible-mode/v1/models`, without an allowlist. The recorded preproduction catalog included `qwen3.8-max`, `qwen3.7-flash` and `qwen3.7-plus`. Every explicit subscription sign-in selects returned `qwen3.8-max`, otherwise the first model, ignoring the previous saved selection.”；命令可用性 “Offer built-in `/logout` and `/upgrade` only when local credentials belong to the current OAuth environment and the active model connection uses `qwen-subscription`. API-key connections and signed-out selections do not qualify. Expired access tokens with a refresh token remain signed in until refresh rejects them. Availability checks never start OAuth or call the network.”；退出后 “Interactive logout is restricted to an idle main response. After local logout, cancel background agents/side questions, clear account/plan status while preserving the model, provider and saved settings, without a dialog or automatic provider switch. Preserve other providers’ API keys and settings”；重登录 “Every explicit Qwen sign-in starts fresh device authorization at `/authorize`, even when local credentials remain valid.”；设置保存 “In a trusted project it saves the model, authentication type, and endpoint to that project’s settings regardless of where the provider catalog lives. When the interactive CLI is started in the home directory, it saves the selection to user settings so it survives restart.” 与 “The CLI `/auth` menu initially highlights Qwen Account with Subscription.”；配额 “Only HTTP `402` together with `error.code = insufficient_quota` identifies quota exhaustion”、“Known `lite`/`plus` members receive weekly-credit guidance and `/upgrade`; `pro` receives weekly-credit guidance to wait for reset.”；思考档位 “All models on the Qwen Subscription route default to medium in the controls and on the wire.”；搜索 “Subscription search uses the existing MCP backend with dynamic Bearer tokens, a single rejected-token refresh on HTTP 401 and cancellation tied to the tool request.”](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/design/qwen-subscription.md)、[Qwen Code v0.26.8 Release（2026-11-05T16:23:57Z，标签提交 `21ed8f1efbb351b973d96e2bc9efa78f278df99c`）：发布说明按 PR 标题列出 “feat: add Qwen subscription support across CLI, VS Code, and Desktop (#16378) by @liuxuely0626”，PR #16378 于 2026-11-05T12:44:21Z 合并（merge commit `0cc37bf44474cf60d4bf303a8df74aa6b5717c3c`）；v0.26.7 标签下 `auth.md` 仍写 “four top-level options”、`commands.md` 没有 `/logout` 与 `/upgrade` 行，因此 **v0.26.8 是 Qwen Subscription 登录进入 stable 通道的首个 Release**。2026-11-07 核对日期最新稳定 Release 为 v0.26.9（2026-11-06T16:07:57Z，标签提交 `600aff0592bcfc21668ca4aba95a5b20c6491b86`），其发布说明只有一条订阅相关条目 “subscription: isolate activation and restore sign-in recovery (#16453)”，`auth.md` 相对 v0.26.8 只把 chat.qwen.ai 链接加 `entry=qwen_code&paywallScene=cli` 参数、`commands.md` 逐字节相同](https://github.com/QwenLM/qwen-code/releases/tag/v0.26.8)、[Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/logout` |
| 入口与配置 | `/logout`。 |
| 支持范围 | 清除当前所选账号的 OAuth 凭据。 |
| 具体行为 | 退出 Kimi Code 账号；静态 Provider Key 仍保留在配置中。 |
| 会话与作用域 | 当前账号记录。 |
| 持久化位置 | 跨会话生效。 |
| 自动化用法 | 临时环境模型凭据随进程结束消失。 |
| 安全与管理 | 需要单独移除 `config.toml` 中的静态 Key。 |
| 条件与边界 | 只在 CLI 空闲时执行登录/退出。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/logout` |
| 入口与配置 | `/logout`。 |
| 支持范围 | 退出当前 Qoder 账号并移除本地登录状态。 |
| 具体行为 | 后续访问需要重新登录或使用 PAT。 |
| 会话与作用域 | 本机 Qoder CLI 登录。 |
| 持久化位置 | 跨会话生效。 |
| 自动化用法 | 环境 PAT 仍由调用环境控制。 |
| 安全与管理 | 退出本地账号不会撤销仍有效的 PAT；需要在账号侧撤销。 |
| 条件与边界 | Custom Model Key 的删除由模型设置处理。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Qwen Code 命令文档 `docs/users/features/commands.md`（固定到标签 v0.26.9，79,647 字节，与 v0.26.8 逐字节相同；v0.26.7 为 79,175 字节）：v0.26.9 相对 v0.26.7 的全部命令集合差异是 `### 1.10 Information, Settings, and Help` 表新增两行——`/logout` 行描述逐字为 “Sign out of the active Qwen Subscription account (available with Qwen Subscription login)”、`/upgrade` 行描述逐字为 “Open Qwen subscription plans (available with Qwen Subscription login)”，两行用法列都只有命令本身、无参数；同表 `/auth` 行逐字为 “Change authentication method”、用法列为 “`/auth`, `/connect`, `/login`”](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/users/features/commands.md)
- [Qwen Code `packages/cli/src/ui/commands/subscription-commands.ts`（固定到标签 v0.26.9，4,046 字节）与 `packages/cli/src/ui/hooks/use-subscription-command-visibility.ts`（2,037 字节）：`logoutCommand` 的 `name` 为 `logout`、描述 “Sign out of your Qwen account”、`supportedModes: ['interactive']`、`canCancel: false`，`config.getAuthType() !== AuthType.QWEN_SUBSCRIPTION` 或 `QwenSubscriptionSession().isSignedIn()` 为假时只返回 info “This connection does not require /logout. Use /auth to switch model providers.”，主响应未空闲（`!context.ui.isIdleRef.current`）时返回 warning “Wait for the current response to finish before signing out.”；`signOut()` 抛 `SubscriptionOAuthError` 且 `stage === 'revoke'` 时本地已退出、只追加 warning “You are signed out locally, but the remote session could not be revoked.”，其他错误返回 “Could not remove local Qwen credentials. Check local file permissions.”；成功路径依次执行 `context.ui.cancelBtw()`、`getBackgroundTaskRegistry().abortAll({ notify: false, persistedStatus: 'cancelled' })` 与 `config.setSubscriptionPlan(undefined)`。`upgradeCommand` 的 `name` 为 `upgrade`、描述 “Open Qwen subscription plans”、`supportedModes: ['interactive']`，非订阅登录时返回 info “This command is only available with Qwen Subscription login. Use /auth to sign in to Qwen Subscription.”，否则在 `isBrowserLaunchSuppressed()` 为假时 `openBrowserSecurely(getQwenSubscriptionPlansUrl('cli'))`、打开失败返回 error “Could not open your browser. Visit {{url}}”，两种情况都再给 info “Qwen subscription plans: {{url}}”（保留可复制 URL）。`filterSubscriptionCommands` 只在 `authType === AuthType.QWEN_SUBSCRIPTION && signedIn` 时保留两个命令，否则从命令列表整体过滤；`useSubscriptionCommandVisibility` 用 `useSyncExternalStore` 订阅凭据文件变化与 `onModelChange`，快照即 `config?.getAuthType?.() === AuthType.QWEN_SUBSCRIPTION && session.isSignedIn()`，凭据被外部删除时同时 `setSubscriptionPlan(undefined)`](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/cli/src/ui/commands/subscription-commands.ts)
- [Qwen Code `packages/core/src/qwen/subscription-session.ts`（固定到标签 v0.26.9，15,303 字节）：凭据文件路径为 `path.join(Storage.getGlobalQwenDir(), 'subscription_credentials.json')`，`storage.ts`（29,478 字节）的 `getGlobalQwenDir()` 先读 `QWEN_HOME`、否则 `~/.qwen`；写入用 `atomicWriteFile` 且 `mode: 0o600, forceMode: true, noFollow: true`，目录以 `mode: 0o700` 创建，读取以 `O_RDONLY | O_NOFOLLOW` 打开拒绝符号链接，互斥用 `proper-lockfile`（`stale: 60_000`、`retries: 0`，ELOCKED 时每 100ms 重试至多 350 次）；zod 凭据 schema 字段为 `revision`、可选 `signInAttempt`、`baseUrl`、`clientId`、可选 `models` 缓存、可选 `tokens`（`access_token`、`refresh_token`、`token_type: 'Bearer'`、`scope`、`expires_in`、`expiresAt`）与可选三档 `retryAfter`；`signIn` 先写入本次 `signInAttempt` 再请求设备码（轮询期间既有登录保持可用），换到 token 后按 `expiresAt = Date.now() + expires_in * 1000` 落盘并请求 `userinfo`；`getAccessToken` 在 `expiresAt <= Date.now() + 30_000` 或传入被拒 token 时先刷新，`getUserInfo` 收到 401 只重试一次刷新；刷新遇 `invalid_grant` 时删除 tokens（存在进行中 `signInAttempt`）或删除整个凭据文件；`signOut` 在锁内先 `fs.rm` 本地凭据文件、再对 refresh token 调 `revokeToken`，本地删除失败抛 `cleanup` 阶段错误、远程撤销失败抛 `revoke` 阶段错误；`getModels` 以 Bearer token 请求 `GET https://api.qwen.ai/compatible-mode/v1/models`（5 秒超时、1 MiB 上限、拒绝重定向），成功把去重后的模型列表写回凭据文件缓存，5xx 或网络失败时回退缓存并报 “Provider model list unavailable; using the last successfully loaded models.”；429 按 device/refresh/userinfo 三档把 `Retry-After` 写进文件做跨进程共享冷却；`isSignedIn`/`getIdentity` 只检查本地文件里 `baseUrl` 与 `clientId` 同当前 OAuth 配置匹配的 tokens 是否存在，不发网络请求；`onChange` 以 500ms 间隔 `watchFile` 凭据文件供 UI 订阅外部删除](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/core/src/qwen/subscription-session.ts)
- [Qwen Code 官方设计文档 `docs/design/qwen-subscription.md`（固定到标签 v0.26.9，26,196 字节，关联 issue #15180，另有 zh-CN 版）：范围逐字为 “CLI (Ink/OpenTUI), Desktop and VS Code share Core subscription credentials, membership queries and OpenAI Chat inference. Subscription login, activation, model loading, inference, search and account commands are available without `DEV=true`, including packaged clients. Subscription clients use fixed production endpoints.”；授权流程 “Request a device code, display/open its authorization link and poll for tokens. Core enforces the returned `expires_in`; GUI adds no fixed 600-second deadline.”、“Only case-insensitive Plus/Pro qualifies for activation.”、“Purchase waiting checks membership every five seconds, for at most two minutes from its first confirmed unpaid state.”；退出 “Signout deletes local credentials before remote revocation. Remote failure must still synchronize local logout and explain that remote revocation failed; failed local deletion must not announce logout.”；协议端点表为 Device authorization `POST /api/oauth/device/code`、Token exchange/refresh `POST /api/oauth/token`、Identity/membership `GET /api/oauth/userinfo`、Revocation `POST /api/oauth/revoke`，并逐字写 “The subscription auth origin is `https://auth.qwen.ai` and the OAuth client ID is `qwen-code-cli`. Browser links to `chat.qwen.ai` carry `entry=qwen_code` and `paywallScene`.”；推理 “Inference uses the fixed `https://api.qwen.ai/compatible-mode/v1` gateway with OpenAI Chat Completions. Configuration stores the auth selector, model ID, fixed gateway and placeholder credential.”；凭据 “Subscription storage is separate from legacy OAuth.”、“Hosts share sessions only with the same effective `QWEN_HOME`.”、“tokens and device codes never enter GUI responses”；模型目录 “Load all IDs from `GET /compatible-mode/v1/models`, without an allowlist. The recorded preproduction catalog included `qwen3.8-max`, `qwen3.7-flash` and `qwen3.7-plus`. Every explicit subscription sign-in selects returned `qwen3.8-max`, otherwise the first model, ignoring the previous saved selection.”；命令可用性 “Offer built-in `/logout` and `/upgrade` only when local credentials belong to the current OAuth environment and the active model connection uses `qwen-subscription`. API-key connections and signed-out selections do not qualify. Expired access tokens with a refresh token remain signed in until refresh rejects them. Availability checks never start OAuth or call the network.”；退出后 “Interactive logout is restricted to an idle main response. After local logout, cancel background agents/side questions, clear account/plan status while preserving the model, provider and saved settings, without a dialog or automatic provider switch. Preserve other providers’ API keys and settings”；重登录 “Every explicit Qwen sign-in starts fresh device authorization at `/authorize`, even when local credentials remain valid.”；设置保存 “In a trusted project it saves the model, authentication type, and endpoint to that project’s settings regardless of where the provider catalog lives. When the interactive CLI is started in the home directory, it saves the selection to user settings so it survives restart.” 与 “The CLI `/auth` menu initially highlights Qwen Account with Subscription.”；配额 “Only HTTP `402` together with `error.code = insufficient_quota` identifies quota exhaustion”、“Known `lite`/`plus` members receive weekly-credit guidance and `/upgrade`; `pro` receives weekly-credit guidance to wait for reset.”；思考档位 “All models on the Qwen Subscription route default to medium in the controls and on the wire.”；搜索 “Subscription search uses the existing MCP backend with dynamic Bearer tokens, a single rejected-token refresh on HTTP 401 and cancellation tied to the tool request.”](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/design/qwen-subscription.md)
- [Qwen Code v0.26.8 Release（2026-11-05T16:23:57Z，标签提交 `21ed8f1efbb351b973d96e2bc9efa78f278df99c`）：发布说明按 PR 标题列出 “feat: add Qwen subscription support across CLI, VS Code, and Desktop (#16378) by @liuxuely0626”，PR #16378 于 2026-11-05T12:44:21Z 合并（merge commit `0cc37bf44474cf60d4bf303a8df74aa6b5717c3c`）；v0.26.7 标签下 `auth.md` 仍写 “four top-level options”、`commands.md` 没有 `/logout` 与 `/upgrade` 行，因此 **v0.26.8 是 Qwen Subscription 登录进入 stable 通道的首个 Release**。2026-11-07 核对日期最新稳定 Release 为 v0.26.9（2026-11-06T16:07:57Z，标签提交 `600aff0592bcfc21668ca4aba95a5b20c6491b86`），其发布说明只有一条订阅相关条目 “subscription: isolate activation and restore sign-in recovery (#16453)”，`auth.md` 相对 v0.26.8 只把 chat.qwen.ai 链接加 `entry=qwen_code&paywallScene=cli` 参数、`commands.md` 逐字节相同](https://github.com/QwenLM/qwen-code/releases/tag/v0.26.8)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)

## 关联能力

- [本地凭据存储](./auth-storage.md)
- [浏览器账号登录](./auth-browser.md)
- [认证状态检查](./auth-status.md)
