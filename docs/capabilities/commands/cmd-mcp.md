# MCP

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-mcp)

> 核对日期：2026-10-08

## 定义

查看和管理当前 CLI 已配置的 Model Context Protocol Server、连接状态、可用工具，以及远程 Server 的 OAuth 登录入口。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/mcp [reconnect (<server>\|all)\|enable\|disable [<server>\|all]]` | 官方确认 |
| Codex | `/mcp [verbose \| login <name>]` | 官方确认 |
| Qwen Code | `/mcp [desc\|nodesc\|schema]` | 源码确认 |
| Kimi Code | `/mcp`、`/mcp-config` | 官方确认 |
| Qoder CLI | `/mcp`、`/mcp reload`、`/mcp-config` | 官方确认 |

## 比较边界

### 本页包含

- Server 列表与连接状态
- 启用、禁用与重连子命令
- 会话内 MCP OAuth 登录入口
- 工具描述与 schema 展示开关

### 本页不包含

- MCP 协议实现细节
- 工具权限完整策略
- 把 CLI 本身作为 MCP Server
- Server 配置的作用域、传输与文件位置（见 MCP 客户端）

## 跨产品事实

1. 五家都提供 `/mcp`。Kimi Code 与 Qoder CLI 另有独立的 `/mcp-config`；Claude Code、Codex 和 Qwen Code 把差异放在 `/mcp` 的子命令或参数上。
2. 会话内 MCP OAuth 登录入口四家已有：Claude Code 用 `/mcp` 面板的 **Re-authenticate**，Codex 自 rust-v0.161.0 起用 `/mcp login <name>`，Qwen Code 用 `/mcp` 对话框内的 Auth 动作，Kimi Code 用 `/mcp-config login <server-name>`。Qoder CLI 公开文档没有 MCP Server 认证入口。
3. Claude Code 与 Codex 的 `/mcp` 都能带参数直接执行而不打开界面：Claude Code 支持 `reconnect`/`enable`/`disable`，Codex 支持 `verbose` 与 `login <name>`。
4. Codex 的 `/mcp verbose` 与 `/mcp login <name>` 只出现在源码、rust-v0.161.0 发布说明与 CLI 命令参考里；官方 Slash 命令参考页仍把 `/mcp` 写成 “Open MCP status to view connected servers.”，不列任何子命令。
5. Qwen Code 的 `/mcp auth` 与 `/mcp noauth` 已不再执行认证，只返回一条改到对话框内完成 OAuth 的警告；v0.24.7 与 v0.25.1-preview.0 的命令源码逐字相同。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp [reconnect (<server>\|all)\|enable\|disable [<server>\|all]]` |
| 别名 | 无公开别名 |
| 参数 | `reconnect (<server>\|all)`、`enable [<server>\|all]`、`disable [<server>\|all]`；面板动作 **Re-authenticate**、**Clear authentication**、**Reconnect**、启用/禁用开关 |
| 执行行为 | 官方描述为 “Manage MCP server connections and OAuth authentication.”。不带参数打开交互式 Server 列表；带 `reconnect`、`enable` 或 `disable` 加 Server 名或 `all` 时直接改连接状态而不打开列表，`reconnect all` 重试全部失败或待认证的 Server。面板内可对单个 Server 执行 **Re-authenticate**（重新登录）、**Clear authentication**（撤销访问）、**Reconnect** 与启用/禁用开关；面板显示每个已连接 Server 的工具数，并标记声明了 tools 能力却没有暴露任何工具的 Server。远程 Server 需要 OAuth 2.0 时官方给出的做法就是 “Run `/mcp` in Claude Code and follow the browser login flow.” |
| 可用模式 | 交互式；也可在 `-p` 非交互模式使用，此时不带参数打印 Server 状态的文本摘要而不打开列表，需 Claude Code v2.1.205 及以上 |
| 保存范围 | `enable`/`disable` 改变 Server 的启用状态并保留配置，禁用后仍在 `/mcp` 列出并标记 `⊘ Disabled for this project (re-enable via /mcp)`；选择 **Disable** 或 **Clear authentication** 会同时丢弃该 Server 的缓存条目；`claude mcp remove <name>` 连带删除已存的 OAuth 令牌与客户端注册 |
| 条件与边界 | OAuth 只适用于 HTTP Server；Server 返回 `401 Unauthorized` 或 `403 Forbidden` 时被标为需要认证。已登录 Server 再次收到 `401` 时先刷新令牌、重连并重试一次，只有重试也失败才在 `/mcp` 标记；刷新令牌被服务端拒绝时立即提示打开 `/mcp` 选 **Re-authenticate**。OAuth 登录按端点分别保存，另一个项目加载的是不同 Server 定义时要单独登录。Shell 侧另有 `claude mcp login <name>`（可加 `--no-browser`）与 `claude mcp logout <name>` |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code MCP](https://code.claude.com/docs/en/mcp) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp [verbose \| login <name>]` |
| 别名 | 无公开别名 |
| 参数 | `verbose`（对整串参数做大小写不敏感相等比较）；`login <name>`（按第一个空格切分，`login` 大小写不敏感，Server 名去空白后不能为空）。TUI 没有 `/mcp logout`；顶层 `/logout` 是退出 Codex 账号，源码描述 “log out of Codex” |
| 执行行为 | 不带参数列出 MCP 工具与认证状态（源码 `McpServerStatusDetail::ToolsAndAuthOnly`）；`verbose` 输出完整 Server 详情（`McpServerStatusDetail::Full`）；`login <name>` 在活动会话内启动该 Server 的 MCP OAuth 登录——经 app server 发起登录请求、在浏览器打开授权 URL，并把成功或失败回报到发起命令的 thread。登录尝试按 Server 分别跟踪，因此不同 Server 可各自登录，已完成的尝试不再重复打开浏览器，结果在线程切换与会话刷新后仍保留，过期的重试完成不会覆盖当前结果。rust-v0.161.0 源码里 `SlashCommand::Mcp` 的描述为 “list MCP tools; use /mcp verbose or /mcp login <name>” |
| 可用模式 | 交互式 TUI。`login` 要求有活动会话，没有 thread 时报错 `MCP sign-in requires an active session.`；参数既不匹配 `verbose` 也不匹配 `login <name>` 时打印 `Usage: /mcp [verbose \| login <name>]` |
| 保存范围 | 不带参数与 `verbose` 只读；`login` 成功后 OAuth 凭据按 `codex mcp` 的既有存储保存，CLI 侧用 `codex mcp logout <name>` 删除已存凭据 |
| 条件与边界 | OAuth 动作（`login`、`logout`）只对支持 OAuth 的 streamable HTTP Server 有效。同一 Server 已有登录在途时再次 `login` 得到 `MCP sign-in is starting. Wait for it to finish before trying again.`；Server 名未配置时报 `Unknown MCP server <name>`，成功时报 `Signed in to <name>.`。`/mcp login <name>` 由 PR #49290 加入并随 rust-v0.161.0（2026-10-07 发布）进入 Release，发布说明逐字为 “Sign in to MCP servers from an active terminal session with `/mcp login <name>`.”；官方 Slash 命令参考页核对时仍只写 “Open MCP status to view connected servers.” 且不列子命令 |
| 证据状态 | 官方确认 |
| 来源 | [Codex rust-v0.161.0 发布说明（`/mcp login <name>`）](https://github.com/openai/codex/releases/tag/rust-v0.161.0)、[Codex PR #49290（Add `/mcp login <name>` to the TUI）](https://github.com/openai/codex/pull/49290)、[Codex rust-v0.161.0 Slash 命令源码（`/mcp` 描述含 login）](https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/slash_command.rs)、[Codex rust-v0.161.0 `/mcp` 参数解析与报错源码](https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/chatwidget/slash_dispatch.rs)、[Codex rust-v0.161.0 `/mcp login` 重叠启动与结果保留测试快照](https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/app/tests/snapshots/codex_tui__app__tests__mcp_login_tests__overlapping_mcp_login.snap)、[Codex CLI 命令参考（`codex mcp login` 与 `logout`，OAuth 仅限 streamable HTTP）](https://learn.chatgpt.com/docs/developer-commands?surface=cli)、[Codex Slash 命令参考页（`/mcp` 未列子命令）](https://learn.chatgpt.com/docs/reference/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp [desc\|nodesc\|schema]` |
| 别名 | 无公开别名 |
| 参数 | 源码 `argumentHint` 为 `desc\|nodesc\|schema`，三者都打开同一个对话框，其展示状态由命令外部持有（包含 `Ctrl+T` 的 slash-command 路径）；官方命令表列出的用法是 `/mcp`、`/mcp desc`、`/mcp nodesc`、`/mcp schema` |
| 执行行为 | 打开 MCP 管理对话框（源码描述 `Open MCP management dialog`）：查看已配置 Server 及其工具与 Prompt，选中 Server 后可看 Resources 数量、用 **View resources** 浏览资源 URI 与其描述、MIME 类型和可直接粘贴的 `@server:uri` 引用，并在对话框内用 Auth 动作管理该 Server 的 OAuth。官方 MCP 文档把该入口写成 “Use the `/mcp` dialog within Qwen Code to inspect MCP servers and manage authentication interactively.”，官方命令表把 `/mcp` 说明为 “List configured MCP servers and tools” |
| 可用模式 | 仅交互式（源码 `supportedModes: ['interactive']`） |
| 保存范围 | 对话框内的开关与认证结果写入 MCP 配置与令牌存储。OAuth 令牌默认存在 `~/.qwen/mcp-oauth-tokens.json`（明文、权限 0600）；设 `QWEN_CODE_FORCE_ENCRYPTED_FILE_STORAGE=true` 后改用可用的 keychain 后端，或 AES-256-GCM 加密的 `~/.qwen/mcp-oauth-tokens-v2.json`。过期时若有 refresh token 会自动刷新，每次连接前会校验 |
| 条件与边界 | `/mcp auth` 与 `/mcp noauth` 已不执行认证，只返回警告 “MCP OAuth is now managed in the /mcp dialog. Open /mcp, select '{{serverName}}', then use the Auth actions there.”（未给 Server 名时为 “…select a server…”）。OAuth 只对 `--transport sse` 与 `--transport http` 生效，与 `--transport stdio` 组合会被拒绝；回调地址默认 `http://localhost:7777/oauth/callback`，远程或云部署必须自行配置公网 `--oauth-redirect-uri` 并反代回本机，Qwen Code 自身不终止 TLS。命令源码在 v0.24.7 与 v0.25.1-preview.0 逐字相同 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code v0.25.1-preview.0 `/mcp` 命令源码](https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/packages/cli/src/ui/commands/mcpCommand.ts)、[Qwen Code v0.24.7 `/mcp` 命令源码（与 v0.25.1-preview.0 逐字节相同）](https://github.com/QwenLM/qwen-code/blob/v0.24.7/packages/cli/src/ui/commands/mcpCommand.ts)、[Qwen Code v0.25.1-preview.0 MCP 文档（`/mcp` 对话框、OAuth 与令牌存储）](https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/docs/users/features/mcp.md)、[Qwen Code v0.25.1-preview.0 命令文档（`/mcp` 行）](https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp`、`/mcp-config` |
| 别名 | 无公开别名 |
| 参数 | `/mcp` 无公开参数；`/mcp-config login <server-name>`。官方 MCP 文档只记录 `login` 子命令，没有列出 `logout`、`add` 或 `remove` |
| 执行行为 | `/mcp` 在官方斜杠命令表的「信息与状态」分组，说明为“列出当前会话中的 MCP server 及连接状态”，标注随时可用。`/mcp-config` 在「内置 Skill 命令」分组，说明为“配置 MCP server 并处理 MCP OAuth 登录”：在 TUI 中交互式新增、编辑或删除 Server，需要 OAuth 时运行 `/mcp-config login <server-name>` 完成浏览器授权。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | `/mcp-config` 的改动写入 MCP 配置，OAuth 授权结果供后续连接复用；官方文档没有说明 MCP OAuth 令牌的保存位置 |
| 条件与边界 | HTTP 与 SSE Server 可用 `headers` 或 `bearerTokenEnvVar` 提供静态凭证，需要 OAuth 时才走 `/mcp-config login <server-name>`。2.0.0（2026-09-17 发布，提交 `31f1b6824d19`）修复 “Fix OAuth login never triggering for MCP servers that allow anonymous tool discovery but reject tool calls with 401.”；2.1.0（2026-09-23 发布，提交 `e796bb5d482e`）修复 “Fix MCP OAuth not requesting the offline_access scope, which caused hourly browser re-authorization with providers like Vercel.” |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code 斜杠命令表（`/mcp` 与 `/mcp-config` 行）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/slash-commands.md)、[Kimi Code MCP 文档（`/mcp-config login <server-name>`）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/customization/mcp.md)、[Kimi Code 2.0.0 发布说明（401 工具调用触发 MCP OAuth 登录）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.0)、[Kimi Code 2.1.0 发布说明（MCP OAuth offline_access 修复）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.1.0) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp`、`/mcp reload`、`/mcp-config` |
| 别名 | 无公开别名 |
| 参数 | 官方 Slash 命令参考没有为 `/mcp` 或 `/mcp-config` 给出 synopsis、子命令或参数；MCP Servers 页只额外记录 `reload` |
| 执行行为 | `/mcp` 在官方 Slash 命令参考的 “Extensions and Tools” 分组，描述为 “Manage MCP servers.”；MCP Servers 页记录 CLI 已在运行时用 `/mcp reload` 重新发现 Server 与工具，新会话则在启动时自动发现。`/mcp-config` 在 “Built-in Skills” 分组，描述为 “Manage MCP server configurations.” |
| 可用模式 | TUI |
| 保存范围 | Server 配置由 `qoder mcp add <name> -s user\|local\|project` 决定落盘位置：`user` 写 `~/.qoder/settings.json`，`local`（默认）写 `${project}/.qoder/settings.local.json`，`project` 写 `${project}/.mcp.json`。`/mcp reload` 只重新发现，不改配置 |
| 条件与边界 | MCP 被禁用时 `/mcp` 显示禁用提示（官方 Slash 命令参考 Conditional Commands 逐字为 “/mcp: Displays a disabled prompt when MCP is disabled.”）。官方 MCP Servers 页与 Slash 命令参考都没有记录 MCP Server 的 OAuth 或其他认证入口，只说明 MCP 工具仍要过 Qoder CLI 权限检查、工具名形如 `mcp__<server>__<tool>`；截至 CLI 1.1.63（2026-09-24）的公开 Release Notes 也没有 MCP 认证相关条目 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI MCP servers](https://docs.qoder.com/en/cli/mcp-servers)、[Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab` 与任务预算的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Codex rust-v0.161.0 发布说明（`/mcp login <name>`）](https://github.com/openai/codex/releases/tag/rust-v0.161.0)
- [Codex PR #49290（Add `/mcp login <name>` to the TUI）](https://github.com/openai/codex/pull/49290)
- [Codex rust-v0.161.0 Slash 命令源码（`/mcp` 描述含 login）](https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/slash_command.rs)
- [Codex rust-v0.161.0 `/mcp` 参数解析与报错源码](https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/chatwidget/slash_dispatch.rs)
- [Codex rust-v0.161.0 `/mcp login` 重叠启动与结果保留测试快照](https://github.com/openai/codex/blob/979011409de0a60b52f179721948e65531d26144/codex-rs/tui/src/app/tests/snapshots/codex_tui__app__tests__mcp_login_tests__overlapping_mcp_login.snap)
- [Codex CLI 命令参考（`codex mcp login` 与 `logout`，OAuth 仅限 streamable HTTP）](https://learn.chatgpt.com/docs/developer-commands?surface=cli)
- [Codex Slash 命令参考页（`/mcp` 未列子命令）](https://learn.chatgpt.com/docs/reference/slash-commands)
- [Qwen Code v0.25.1-preview.0 `/mcp` 命令源码](https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/packages/cli/src/ui/commands/mcpCommand.ts)
- [Qwen Code v0.24.7 `/mcp` 命令源码（与 v0.25.1-preview.0 逐字节相同）](https://github.com/QwenLM/qwen-code/blob/v0.24.7/packages/cli/src/ui/commands/mcpCommand.ts)
- [Qwen Code v0.25.1-preview.0 MCP 文档（`/mcp` 对话框、OAuth 与令牌存储）](https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/docs/users/features/mcp.md)
- [Qwen Code v0.25.1-preview.0 命令文档（`/mcp` 行）](https://github.com/QwenLM/qwen-code/blob/304df378b562b82e371b4eae86610a83548d2e39/docs/users/features/commands.md)
- [Kimi Code 斜杠命令表（`/mcp` 与 `/mcp-config` 行）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/reference/slash-commands.md)
- [Kimi Code MCP 文档（`/mcp-config login <server-name>`）](https://github.com/MoonshotAI/kimi-code/blob/21406fb4c805cc8c715e6d1f16ad3fb5f25f4fe3/docs/zh/customization/mcp.md)
- [Kimi Code 2.0.0 发布说明（401 工具调用触发 MCP OAuth 登录）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.0)
- [Kimi Code 2.1.0 发布说明（MCP OAuth offline_access 修复）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.1.0)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI MCP servers](https://docs.qoder.com/en/cli/mcp-servers)
- [Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab` 与任务预算的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli)

## 关联能力

- [插件或扩展](./cmd-plugins.md)
- [Skills](./cmd-skills.md)
- [MCP 客户端](../extensions/extension-mcp.md)
