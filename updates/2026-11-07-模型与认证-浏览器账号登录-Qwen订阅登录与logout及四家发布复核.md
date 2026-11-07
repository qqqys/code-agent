# 模型与认证 · 浏览器账号登录：Qwen Subscription 登录与 `/logout` 落地，作废两条旧结论

日期：2026-11-07
能力字段：`auth-browser`（模型与认证 · 浏览器账号登录），连带改写 `auth-logout`（退出与撤销本地凭据）、`auth-storage`（本地凭据存储）与 `model-provider`（Provider 类型）的 Qwen 列

## 来源

- [Qwen Code 认证文档（v0.26.9 标签提交 `600aff0592bcfc21668ca4aba95a5b20c6491b86`）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/users/configuration/auth.md)
- [Qwen Code 命令文档（v0.26.9）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/users/features/commands.md)
- [Qwen Subscription 官方设计文档 `docs/design/qwen-subscription.md`（v0.26.9）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/docs/design/qwen-subscription.md)
- [`subscription-oauth-client.ts` 与 `oauth-config.ts`（v0.26.9）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/core/src/qwen/subscription-oauth-client.ts)
- [`subscription-session.ts` 凭据存储与撤销（v0.26.9）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/core/src/qwen/subscription-session.ts)
- [`subscription-commands.ts` 的 `/logout` 与 `/upgrade`（v0.26.9）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/cli/src/ui/commands/subscription-commands.ts)
- [`use-subscription.ts` 与 `activate-subscription.ts` 登录激活流程（v0.26.9）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/cli/src/ui/auth/use-subscription.ts)
- [`subscription-models.ts` 模型选择（v0.26.9）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/core/src/qwen/subscription-models.ts)
- [`BuiltinCommandLoader.ts` 命令注册（v0.26.9）](https://github.com/QwenLM/qwen-code/blob/v0.26.9/packages/cli/src/services/BuiltinCommandLoader.ts)
- [Qwen Code v0.26.8 Release](https://github.com/QwenLM/qwen-code/releases/tag/v0.26.8) 与 [PR #16378](https://github.com/QwenLM/qwen-code/pull/16378)
- [Claude Code CHANGELOG（固定到 v2.1.319 更新日志提交 `0ed94698aa0a`）](https://github.com/anthropics/claude-code/blob/0ed94698aa0a/CHANGELOG.md)
- [Codex rust-v0.167.0 Release](https://github.com/openai/codex/releases/tag/rust-v0.167.0)
- [Kimi Code CHANGELOG（2.5.2 段）](https://github.com/MoonshotAI/kimi-code/blob/main/apps/kimi-code/CHANGELOG.md)
- [Qoder CLI Release Notes](https://docs.qoder.com/release-notes/qoder-cli)

## 本次改动

本次单元处理 2026-11-05「认证状态检查」单元显式留存的待办：当时发现 Qwen Code v0.26.8 的 `auth.md` 把 `/auth` 菜单由四项改为五项、新增 Qwen OAuth 浏览器登录，`commands.md` 新增 `/logout` 与 `/upgrade` 两行，已使矩阵中「Qwen 当前无浏览器账号登录」与「无独立 logout」两条结论过期。本次按 v0.26.9 标签（核对日期最新稳定 Release，2026-11-06T16:07:57Z，标签提交 `600aff0592bcfc21668ca4aba95a5b20c6491b86`）完整复核并改写四个字段。

**版本时间线与发布坐标**：

- 功能来自 PR #16378 “feat: add Qwen subscription support across CLI, VS Code, and Desktop”（2026-11-05T12:44:21Z 合并，merge commit `0cc37bf44474cf60d4bf303a8df74aa6b5717c3c`），随 **v0.26.8**（2026-11-05T16:23:57Z，标签提交 `21ed8f1efbb351b973d96e2bc9efa78f278df99c`）首次进入 stable 通道；v0.26.7 标签下 `auth.md`（31,378 字节）仍写 “four top-level options”、`commands.md`（79,175 字节）没有 `/logout` 与 `/upgrade` 行。
- **v0.26.9**（2026-11-06T16:07:57Z）的 `auth.md` 为 32,963 字节，相对 v0.26.8（32,534 字节）的全部差异是 chat.qwen.ai 链接统一加 `entry=qwen_code&paywallScene=cli` 两个参数；`commands.md`（79,647 字节）与 v0.26.8 逐字节相同。v0.26.9 发布说明只有一条订阅相关条目 “subscription: isolate activation and restore sign-in recovery (#16453)”。
- 官方文档站 `https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/` 2026-11-07 复核同样写 “five top-level options” 并含 Qwen Account with Subscription 一节，不存在文档滞后。

**浏览器账号登录（`auth-browser`，作废旧结论「当前无浏览器账号登录」）**：

- `auth.md` 首句逐字为 “Qwen Code’s first-run `/auth` menu has five top-level options.”，第一项即 **Qwen Account with Subscription**：“sign in with your Qwen account through **Qwen OAuth** to access **Qwen Code and Agent** with your **Plus or Pro subscription** from chat.qwen.ai”；`## Option 1: Qwen OAuth — Qwen Account with Subscription` 整节给出 How it works（“follow the browser sign-in flow to authorize Qwen Code with your Qwen account”）、Requirements（“a Qwen account with an active **Plus or Pro subscription** … and internet access”）与五步 Interactive setup，节末逐字为 “For non-interactive environments where you cannot complete the browser sign-in flow, such as CI or unattended containers, use an API-key-based authentication method instead.”；原 “Option 2: Qwen OAuth (Discontinued)” 整节在 v0.26.8 同批删除。`## Removed qwen auth CLI command` 迁移表的 “OAuth browser flow” 行逐字为 “Run `qwen` interactively and use `/auth`; OAuth cannot be configured with env vars alone”。
- 机制是 OAuth 2.0 设备码授予（`subscription-oauth-client.ts`，8,672 字节）：`POST https://auth.qwen.ai/api/oauth/device/code`（`client_id: qwen-code-cli`、`scope: 'model:invoke profile:read'`）返回 `device_code`、`user_code`、`verification_uri`、`verification_uri_complete`、`expires_in` 与 `interval`；`pollForToken` 用 `grant_type=urn:ietf:params:oauth:grant-type:device_code` 调 `POST /api/oauth/token`，`authorization_pending` 按原间隔继续、`slow_down` 把间隔加 5 秒、429/5xx/网络错误按 `max(interval, delay*2, Retry-After)` 退避；`GET /api/oauth/userinfo` 返回 `sub`、`name`、`email`、`member_type`；`POST /api/oauth/revoke` 撤销令牌。`oauth-config.ts`（1,730 字节）另给出固定推理网关 `https://api.qwen.ai/compatible-mode/v1`、默认模型 `qwen3.8-max`、订阅 `web_search` 网关 `https://api.qwen.ai/api/v1/mcp/web_search` 与占位凭据 `QWEN_SUBSCRIPTION_DYNAMIC_TOKEN`。
- UI 流程（`use-subscription.ts`，15,029 字节）：把 `user_code` 组装成 `https://chat.qwen.ai/authorize?user_code=…&client=cli&entry=qwen_code&paywallScene=cli` 并在浏览器启动未被抑制时 `openBrowserSecurely` 自动打开、链接同时保留展示；`member_type` 大小写不敏感等于 plus 或 pro 才进入 ready，否则进入 purchase-required——购买等待每 5 秒复查 membership、自首次确认未付费起至多 120 秒，超时后可手动 Check again、重开计划页或 Sign out。设计文档逐字为 “Only case-insensitive Plus/Pro qualifies for activation.”、“Purchase waiting checks membership every five seconds, for at most two minutes from its first confirmed unpaid state.”、“Every explicit Qwen sign-in starts fresh device authorization at `/authorize`, even when local credentials remain valid.” 与 “The CLI `/auth` menu initially highlights Qwen Account with Subscription.”
- 激活（`activate-subscription.ts`，2,497 字节）：要求 `settings.isTrusted`（否则抛 “Workspace is not trusted.”），`security.auth.enforcedType` 指定其他认证类型时抛 “Authentication is restricted by policy.”；`refreshSubscriptionModels` 从 `GET /models` 全量加载目录（无允许清单），`selectSubscriptionModel`（`subscription-models.ts`，2,545 字节）优先 `qwen3.8-max`、缺席取第一个，`qwen3.8-max` 与 `qwen3.8-flash` 宣告图像与视频输入模态；`applyProviderInstallPlan({ providerId: 'qwen-subscription', authType: AuthType.QWEN_SUBSCRIPTION, modelSelection: { modelId, baseUrl } })` 在 `workspaceSettingsActive` 时写 Workspace 作用域设置、否则写 User 作用域。`AuthType` 枚举新增 `QWEN_SUBSCRIPTION = 'qwen-subscription'`，与遗留 `QWEN_OAUTH = 'qwen-oauth'`（免费层 2026-04-15 停止）是两个独立取值，设计文档逐字为 “Subscription storage is separate from legacy OAuth.”
- 订阅路由的其余口径（设计文档）：CLI、Desktop 与 VS Code 共享 Core 凭据与会员查询、仅相同 `QWEN_HOME` 的端共享会话；推理配置只存认证选择器、模型 ID、固定网关与占位凭据，Bearer 令牌在传输层动态供给；订阅路由全部模型思考档位默认 medium；配额耗尽只认 HTTP 402 且 `error.code = insufficient_quota`，lite/plus 引导 `/upgrade`、pro 提示等待每周重置。

**退出与撤销本地凭据（`auth-logout`，作废旧结论「无独立 logout；重配 Provider 或删除 Key」）**：

- `commands.md` 的 `/logout` 行逐字为 “Sign out of the active Qwen Subscription account (available with Qwen Subscription login)”；实现（`subscription-commands.ts`，4,046 字节）`supportedModes: ['interactive']`、`canCancel: false`，非订阅认证下运行只提示 “This connection does not require /logout. Use /auth to switch model providers.”，主响应未空闲时提示 “Wait for the current response to finish before signing out.”。
- 退出顺序（`subscription-session.ts`，15,303 字节；设计文档 “Signout deletes local credentials before remote revocation.”）：锁内先 `fs.rm` 凭据文件、再 `POST /api/oauth/revoke` 撤销 refresh token（`token_type_hint=refresh_token`）；远程撤销失败不回滚本地退出、只警告 “You are signed out locally, but the remote session could not be revoked.”，本地删除失败报 “Could not remove local Qwen credentials. Check local file permissions.” 且不宣布已退出。成功后 `cancelBtw()`、`abortAll({ notify: false, persistedStatus: 'cancelled' })` 中止全部后台任务并 `setSubscriptionPlan(undefined)`，保留模型、Provider 选择与已保存设置，不弹对话框、不自动切 Provider、不动其他 Provider 的 API Key。
- 可见性门禁：`filterSubscriptionCommands` 只在 `authType === AuthType.QWEN_SUBSCRIPTION && signedIn` 时保留 `/logout` 与 `/upgrade`，`useSubscriptionCommandVisibility`（2,037 字节）以 `useSyncExternalStore` 订阅凭据文件（500ms 轮询）与模型变化，外部删除凭据文件同样清掉计划缓存并隐藏两个命令；设计文档逐字为 “Offer built-in `/logout` and `/upgrade` only when local credentials belong to the current OAuth environment and the active model connection uses `qwen-subscription`. API-key connections and signed-out selections do not qualify. Expired access tokens with a refresh token remain signed in until refresh rejects them.”
- Provider Key 配置的旧路径不变：仍无退出命令，用 `/auth` 重选 Provider 并从 Settings、`.env` 或系统环境删除 Key，因此 Qwen 列证据状态保持「条件项」。

**本地凭据存储（`auth-storage`，补录新令牌文件）**：令牌对（access + refresh，含 `expiresAt`）写 `~/.qwen/subscription_credentials.json`（`QWEN_HOME` 优先）——文件 0600、目录 0700、`atomicWriteFile` 加 `noFollow`、读取 `O_NOFOLLOW` 拒绝符号链接、`proper-lockfile` 跨进程互斥（stale 60 秒、ELOCKED 每 100ms 重试至多 350 次）；模型目录缓存与三档 429 冷却（device/refresh/userinfo 的 `Retry-After`）也写回同一文件；凭据的 `baseUrl`/`clientId` 与当前 OAuth 配置不匹配时按未登录处理；access token 在 `expiresAt` 前 30 秒内或收到 401 时刷新（单请求只重试一次），刷新遇 `invalid_grant` 删除凭据。作废旧句「当前认证流程不依赖可用的 Qwen OAuth 浏览器缓存」。

**Provider 类型（`model-provider`，四组入口改五组）**：`/auth` 顶层入口由四个改为五个（Qwen Account with Subscription、QwenCloud、Alibaba ModelStudio、Third-party Providers、Custom Provider）；订阅通道不经 `modelProviders` 预设，认证类型 `qwen-subscription`、固定网关与目录由服务端提供；`ALL_PROVIDERS` 注册表（v0.26.9 下 3,672 字节、与旧坐标逐字节同尺寸）不含订阅预设，15 个预设的旧结论不变。

**四家同轮复核（本字段结论均不变）**：

- Claude Code：v2.1.319（2026-11-06T17:04:44Z，更新日志固定到提交 `0ed94698aa0a`，`CHANGELOG.md` 1,176,779 字节、最新段 `## 2.1.319`）没有浏览器登录或 `/logout` 的功能变化，唯一相关条目是修复 “Fixed a ~0.5s hang after pressing Enter on the `/login` success screen”。
- Codex：核对日期最新非 alpha Release rust-v0.167.0（2026-11-06T01:40:00Z）的登录变化是 “Find API key and cloud provider options under 'Sign in another way.' Enable `gcp_setup_wizard` to set up Google Cloud Vertex AI with Application Default Credentials or a credential file (#57857, #58427)”，属 `auth-cloud-provider`/`auth-api-key` 字段的入口重组，`codex login` 与 Device Code 的浏览器登录结论不变。
- Kimi Code：2.5.2（2026-11-06T05:50:10Z，npm 2026-11-06T06:01:33.310Z）只有三条修复（`select_tools` 重复工具声明、web 转向消息排队、web HTTP 项目创建），`/login` 与 `kimi login` 结论不变。
- Qoder CLI：Release Notes 两种官方渲染在核对日期仍不一致——HTML（782,358 字节）最新条目为 **CLI 1.1.84／November 6, 2026 “Improves Session Compaction and MCP Status Display”**（两条：重启恢复后保留近期响应与工具结果、`/mcp` 列表正确显示待认证服务状态），`.md`（116,633 字节）最新仍是 CLI 1.1.82；1.1.83 与 1.1.84 都没有登录、退出或凭据条目，`/login` 与 `qodercli login` 结论不变。

## 比较变更

| 产品 | 原结论 | 新结论 |
| --- | --- | --- |
| Claude Code | `/login` | 不变 |
| Codex | `codex login` · Device Code | 不变 |
| Qwen Code | 当前无浏览器账号登录；`/auth` 配置 Provider | `/auth` 首选 Qwen Account with Subscription（Qwen OAuth 设备码 + 浏览器授权，需 chat.qwen.ai Plus/Pro 订阅，v0.26.8 起）· 条件：仅交互式，非交互改用 API Key |
| Kimi Code | `/login` · `kimi login` | 不变 |
| Qoder CLI | `/login` · `qodercli login` | 不变 |

连带的 `auth-logout` Qwen 列由「无独立 logout；重配 Provider 或删除 Key」改为「`/logout`（条件：仅 Qwen Subscription 登录且空闲时出现，先删本地凭据再远程撤销 refresh token）· Provider Key 配置仍无退出命令、需删除 Key」；`auth-storage` Qwen 列补「Subscription 令牌另存 `~/.qwen/subscription_credentials.json`（0600）」；`model-provider` Qwen 列由「`/auth` 四组入口」改为「`/auth` 五组入口：Qwen Account with Subscription · QwenCloud · Alibaba ModelStudio · Third-party Providers · Custom Provider」并加「Subscription 入口自 v0.26.8」条件。`auth-browser` 跨产品事实三条全部改写（五家都有账号登录、Qwen 订阅登录与遗留通道并存、设备码路径对比）；`auth-logout` 与 `auth-storage` 的事实各改写/新增 Qwen 相关一条。

## 影响文件

- `site/data.js`：`updatedAt` 推到 2026-11-07；`auth-browser`、`auth-logout`、`auth-storage`、`model-provider` 四行的 Qwen 单元格改写；新增来源 `qwen-subscription-auth-doc`、`qwen-subscription-commands-doc`、`qwen-subscription-design`、`qwen-subscription-oauth-src`、`qwen-subscription-session-src`、`qwen-subscription-commands-src`、`qwen-subscription-ui-src`、`qwen-subscription-models-src`、`qwen-subscription-loader`、`qwen-subscription-v0268-release` 共 10 个；既有来源零删改，共享来源 `qwen-model-auth-current`、`qwen-model-commands-current`、`qwen-model-settings-current` 仍固定在提交 `7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab`、被多个模型字段引用，故不移动；能力字段总数维持 115。
- `site/model-details.js`：`auth-browser` 的 Qwen 记录九个维度全部重写、事实三条改写；`auth-logout` 的 Qwen 记录重写、事实前两条改写；`auth-storage` 的 Qwen 记录重写、事实新增一条；`model-provider` 的 Qwen 记录 entry/mechanism/conditions 更新并追加 3 个来源。
- `docs/01-Slash命令矩阵.md`：对照表「退出登录」行 Qwen 列由 `/auth logout` 改为 `/logout`（条件：仅 Qwen Subscription 登录时出现；Provider Key 配置无退出命令）；Qwen 硬编码目录按 v0.26.9 加载器复核由 69 个主命令更新为 73 个（新增 `/commit`、`/logout`、`/output-style`、`/upgrade`），条件表由 6 个扩为 8 个并新增 `/logout`、`/upgrade` 行，另加两段说明（订阅账号命令的合并坐标与行为、`/commit` 与 `/output-style` 的字段归属留待后续单元）。
- `docs/08-模型与认证矩阵.md`、`docs/capabilities/models/`：由 `npm run generate` 重新生成。
- `docs/09-版本与证据.md`：Qwen Code 核对日期推到 2026-11-07，主要材料追加本次复核记录；「模型与认证来源」表 Qwen 行两列共追加 12 个链接；其余四家行不变。
- `README.md`：核对日期推到 2026-11-07，能力字段总数维持 115。

## 本次发现但未处理

- **Claude Code v2.1.319** 的 “Added a warning when your claude.ai login ends and Claude Code continues on the sign-in from `ant auth login`, which bills usage to your Claude Console organization” 与 “Added a line at startup naming the Claude Console organization that is billed …” 是 2026-11-05 凭据到期单元的后续（到期后回落 `ant auth login` 的告警与启动行），属 `auth-status` 字段；同版还有 auto mode 服务端裁决改造（`CLAUDE_CODE_AUTO_MODE_SERVER`）、MCP tasks 后台化（`CLAUDE_CODE_DISABLE_MCP_TASK_BACKGROUND`）、`permissions.denyInsteadOfPrompting`、`/claude-api latency-optimize`、`CLAUDE_CODE_DISABLE_FEATURE_FLAGS` 与 `/tasks` 的 “Earlier in this session” 行，分属审批自动审查、MCP、权限与任务字段。
- **Codex rust-v0.167.0** 的 “Sign in another way” 入口重组与 `gcp_setup_wizard`（Vertex AI ADC/凭据文件）属 `auth-cloud-provider` 与 `auth-api-key` 字段；同版 `codex agents --no-daemon`、会话选择器后端切换与本地图片附件预览属运行中会话列表与文件读写相邻字段。
- **Qwen `/commit` 与 `/output-style`**：`docs/06` 的 Git 操作行（现为 `run_shell_command` · `/diff`）与 `docs/05` 的输出风格行（现为「官方设置与扩展文档未列出输出风格」）都未反映这两个 v0.26.9 已注册命令，属整表刷新、留作后续单元。
- **Qoder Release Notes 双渲染不一致持续**：`.md` 形式仍停在 CLI 1.1.82，HTML 已到 CLI 1.1.84；1.1.83 的 “Added support for enterprise admins to disable Auto and YOLO modes” 属 `auth-enterprise` 与权限模式字段、本次未展开。
