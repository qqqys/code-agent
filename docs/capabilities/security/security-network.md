# 网络隔离

[返回权限与沙箱详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=security-network)

> 核对日期：2026-08-05

## 定义

限制 Agent 执行的程序和子进程访问外部网络，并可进一步按域名、代理、私网地址或工具规则收紧。

## 权限结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Sandbox 域名代理与 Allow/Deny；`strictAllowlist` 直接拒绝未列主机 | 官方确认 |
| Codex | `workspace-write` 默认断网；可单独启用与限域 | 官方确认 |
| Qwen Code | Seatbelt Profile 与代理；依配置 | 条件项 |
| Kimi Code | 网络工具权限；OS 网络隔离未确认 | 未确认 |
| Qoder CLI | Web 工具规则；SDK 条件网络 Sandbox | 条件项 |

## 比较边界

### 本页包含

- 命令子进程网络
- 域名或代理策略
- 网络工具权限

### 本页不包含

- 模型 API 自身联网
- 云端任务 Setup 网络
- 账号登录网络

## 跨产品事实

1. 网络工具 Allow/Deny 与命令子进程的 OS 网络隔离不是同一层。
2. Codex 的 `workspace-write` 默认关闭命令网络；Claude Code 和 Qwen Code 可在启用 Sandbox 时按域名或 Profile 控制。
3. Claude Code 对未列域名默认逐次审批，`sandbox.network.strictAllowlist` 或 Managed `allowManagedDomainsOnly` 可改为直接阻断。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Sandbox 域名代理与 Allow/Deny；`strictAllowlist` 直接拒绝未列主机 |
| 入口与切换 | `/permissions` 管理规则，`Shift+Tab` 切换常用模式；启动参数使用 `--permission-mode`，`/sandbox` 单独配置 Bash 沙箱。 |
| 默认状态 | 默认权限模式为 `default`。只读工具通常直接运行；Bash 和文件修改按权限规则与当前模式决定是否询问。 |
| 具体行为 | Sandbox 通过外部代理限制 Bash 及子进程域名，默认不预允许任何域名，首次使用新域名触发审批；`sandbox.network.strictAllowlist` 开启后直接拒绝 Allowlist 之外主机，Managed 的 `allowManagedDomainsOnly` 同样自动阻断未列域名且只认 Managed 来源的 Allow 规则。严格名单只约束沙箱内命令，WebFetch 等进程内工具仍按自身权限规则判断；WebFetch 规则与 Sandbox allow/deny domains 合并。 |
| 规则能力 | `permissions.allow`、`ask`、`deny` 按 deny → ask → allow 处理；规则覆盖 Bash、Read、Edit、WebFetch、MCP、Agent 等工具。 |
| 隔离边界 | 权限系统覆盖全部工具；OS 沙箱只覆盖 Bash 及其子进程。沙箱默认只允许向工作目录和会话临时目录写入，并通过代理限制网络域名。 |
| 保存与作用域 | 规则和模式可保存在用户、项目、本地项目或 Managed Settings；交互审批也可只放行一次或当前会话。`strictAllowlist` 只在用户、Managed 或 `--settings` 设置中生效，仓库 `.claude/settings.json` 或 `.claude/settings.local.json` 中设置无效。 |
| 非交互行为 | `claude -p` 没有确认界面。未被规则或模式预授权的 Shell、网络等操作会使运行中止；`dontAsk` 会直接拒绝所有仍需询问的操作。 |
| 条件与边界 | OS 沙箱依赖 macOS Seatbelt、Linux bubblewrap 或 WSL2；默认不可用时会警告并回退，`sandbox.failIfUnavailable` 可改为失败关闭。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Permissions](https://code.claude.com/docs/en/permissions)、[Claude Code Permission Modes](https://code.claude.com/docs/en/permission-modes)、[Claude Code Sandboxing](https://code.claude.com/docs/en/sandboxing)、[Claude Code Headless Mode](https://code.claude.com/docs/en/headless)、[Claude Code v2.1.219 changelog](https://github.com/anthropics/claude-code/blob/0c188278cdf9/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `workspace-write` 默认断网；可单独启用与限域 |
| 入口与切换 | `/permissions` 与权限选择器控制当前会话；CLI 可传 `--sandbox`、`--ask-for-approval`，持久配置写入 `config.toml`。 |
| 默认状态 | 版本库目录通常采用 `workspace-write` + `on-request`，非版本库目录通常采用 `read-only`；具体启动状态还受目录信任和配置影响。 |
| 具体行为 | `workspace-write` 默认 `network_access = false`；开启后可再启用 `network_proxy`，用 allow/deny 域名、私网和 Unix Socket 规则限域。 |
| 规则能力 | `approval_policy` 支持 `untrusted`、`on-request`、`never` 和 granular 分类策略；命令 Rules、MCP 注解、权限 Profile 与沙箱共同生效。 |
| 隔离边界 | 本地 CLI/IDE 使用 OS 级沙箱。`read-only`、`workspace-write`、`danger-full-access` 分别提供只读、工作区写入和无沙箱边界；工作区写入默认关闭命令网络。 |
| 保存与作用域 | 用户配置位于 `~/.codex/config.toml`；受信任项目可加载 `.codex/config.toml`、Hooks 和 Rules；系统与管理员 Requirements 可进一步收紧。 |
| 非交互行为 | 非交互流程无法展示新审批时，需要审批的动作失败并把错误返回给 Agent；可在启动前固定审批策略、沙箱和 Rules。 |
| 条件与边界 | 审批决定何时停下来询问，沙箱决定技术边界；`approval_policy = "never"` 不会自动移除仍在生效的沙箱。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Seatbelt Profile 与代理；依配置 |
| 入口与切换 | `/approval-mode`、`/permissions` 和 `Shift+Tab` 控制审批；CLI 可传 `--approval-mode`、`--allowed-tools`、`--sandbox`，启用目录信任后提供 `/trust`。 |
| 默认状态 | `tools.approvalMode` 当前默认值为 `auto`；Sandbox 与 `security.folderTrust.enabled` 均默认关闭。 |
| 具体行为 | Seatbelt 提供 open、closed、proxied Profile；代理模式可通过 `QWEN_SANDBOX_PROXY_COMMAND` 接入域名 Allowlist。 |
| 规则能力 | `permissions.deny` > `ask` > `allow`；规则可限制 Shell、Read、Edit、WebFetch、MCP 等。`tools.disabled` 在注册阶段直接移除工具。 |
| 隔离边界 | 可选 macOS Seatbelt 或 Docker/Podman 容器。Seatbelt 限制文件写入并按 Profile 控制网络；容器挂载工作区和 `~/.qwen`。 |
| 保存与作用域 | 审批模式和规则可写入用户、项目或系统 Settings；`/permissions` 可管理规则。目录信任记录单独保存在受信目录配置中。 |
| 非交互行为 | Headless 可预设 approval mode 和规则；没有交互通道时，仍需人工确认的工具调用会被拒绝。YOLO 会全放行工具，但不会自动启用 Sandbox。 |
| 条件与边界 | 目录信任是可选功能；未信任目录会阻止 Auto-Edit、Auto、YOLO 等高权限路径及部分项目自定义内容。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code Approval Mode](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/approval-mode.md)、[Qwen Code Sandbox](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sandbox.md)、[Qwen Code Settings](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md)、[Qwen Code Headless Mode](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/headless.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 网络工具权限；OS 网络隔离未确认 |
| 入口与切换 | `/permission` 选择模式；`/plan`、`/yolo`、`/auto` 快速切换。启动参数提供 `--plan`、`--yolo`、`--auto`。 |
| 默认状态 | `default_permission_mode` 默认为 `manual`，`default_plan_mode` 默认为 `false`。 |
| 具体行为 | 可用工具规则限制 Bash 或特定网络工具，内置搜索/抓取服务也可单独配置；当前 CLI 文档未确认命令子进程的 OS 网络沙箱。 |
| 规则能力 | `[[permission.rules]]` 按顺序匹配第一条 `allow`、`deny` 或 `ask`；`[tools].enabled` 与 `disabled` 另行限制模型能看到和调用的工具。 |
| 隔离边界 | 权限规则覆盖文件、Bash、MCP 等工具调用。当前公开 CLI 文档未列出对这些工具子进程提供 OS 级文件系统或网络沙箱。 |
| 保存与作用域 | 全局规则保存在 `~/.kimi-code/config.toml`；审批面板可放行当前会话。项目 `local.toml` 当前公开的是额外工作目录等本地设置。 |
| 非交互行为 | `kimi -p` 固定使用 Auto 权限策略，不弹人工审批；静态 deny 规则仍生效，且 `--prompt` 不能与 `--yolo`、`--auto`、`--plan` 同用。 |
| 条件与边界 | YOLO 跳过普通工具审批，但敏感文件与退出 Plan 仍可询问；Auto 会自动处理全部审批并禁止 Agent 向用户提问。 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code Interaction and Permissions](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/guides/interaction.md)、[Kimi Code Configuration](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/configuration/config-files.md)、[Kimi Code CLI Reference](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Web 工具规则；SDK 条件网络 Sandbox |
| 入口与切换 | `Shift+Tab` 循环权限模式，`Ctrl+Y` 进入 YOLO；CLI 支持 `--permission-mode`、`--allowed-tools`、`--disallowed-tools`，会话内可用 `/allow`、`/deny`。 |
| 默认状态 | 默认权限模式为 `default`。Plan 是独立工作状态；非默认权限模式只在受信任目录生效。 |
| 具体行为 | 主 CLI 可对 WebFetch/WebSearch 使用 ask/deny；SDK `sandbox.network` 可配置本地绑定、Unix Socket、HTTP 与 SOCKS 代理。 |
| 规则能力 | `permissions.deny`、`ask`、`allow` 覆盖文件、Bash、Web、MCP、Subagent 等；Hooks 可在权限流水线前后返回 allow、deny 或 ask。 |
| 隔离边界 | CLI 权限文档提供路径级 Read/Edit 规则与受信目录边界。Qoder CLI SDK 另有默认关闭的 Sandbox Settings，可限制文件系统和网络。 |
| 保存与作用域 | 规则来自用户、项目、本地项目、额外 Settings、CLI 参数、会话命令和临时 Session；`/allow`、`/deny` 写入本地项目设置。 |
| 非交互行为 | Headless 中 `ask` 自动转为 `deny`；SDK 可把请求交给 `canUseTool`，ACP 可通过 `requestPermission` 交给 IDE。 |
| 条件与边界 | 未信任目录强制回退 `default`；受保护路径仍可要求审批或在 Auto 中拒绝。PreToolUse Hook 的 deny 即使在 bypass 下也能阻断。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)、[Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code Permissions](https://code.claude.com/docs/en/permissions)
- [Claude Code Permission Modes](https://code.claude.com/docs/en/permission-modes)
- [Claude Code Sandboxing](https://code.claude.com/docs/en/sandboxing)
- [Claude Code Headless Mode](https://code.claude.com/docs/en/headless)
- [Claude Code v2.1.219 changelog](https://github.com/anthropics/claude-code/blob/0c188278cdf9/CHANGELOG.md)
- [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code Approval Mode](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/approval-mode.md)
- [Qwen Code Sandbox](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sandbox.md)
- [Qwen Code Settings](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md)
- [Qwen Code Headless Mode](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/headless.md)
- [Kimi Code Interaction and Permissions](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/guides/interaction.md)
- [Kimi Code Configuration](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/configuration/config-files.md)
- [Kimi Code CLI Reference](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/reference/kimi-command.md)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [文件系统隔离](./security-filesystem.md)
- [交互审批](./security-approval.md)
- [跳过审批](./security-bypass.md)
