# 审批自动审查

[返回权限与沙箱详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=security-auto-review)

> 核对日期：2026-08-23

## 定义

把原本需要用户确认的越界或高风险操作交给产品内置的分类器或审查代理自动裁决；裁决可以放行也可以拒绝，与全部放行的 bypass 不同。

## 权限结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `auto` 权限模式 · classifier 审查 | 官方确认 |
| Codex | `approvals_reviewer = "auto_review"` · `--approve-for-me` | 官方确认 |
| Qwen Code | Auto 审批模式 · LLM 分类器 | 官方确认 |
| Kimi Code | 无同类机制；`/auto` 为全部审批自动放行 | 官方确认 |
| Qoder CLI | `auto` 权限模式 · AI 分类器 | 官方确认 |

## 比较边界

### 本页包含

- 分类器或审查代理裁决审批请求
- 放行与拒绝决策
- 审查策略、提示与熔断配置

### 本页不包含

- 全部放行的 YOLO/Bypass 模式
- 静态 Allow/Deny 规则
- OS 沙箱边界本身

## 跨产品事实

1. Claude Code、Codex、Qwen Code 与 Qoder CLI 都提供基于分类器或审查代理的自动审查；Kimi Code 无同类机制，其 `/auto` 是全部审批自动放行的无人值守模式。
2. 自动审查不是权限放大：Codex 明确 auto-review 只更换审批请求的裁决者、不放宽沙箱边界；Claude Code 的 auto 模式仍会被 classifier 阻断高风险操作。
3. Claude Code 与 Codex 都为连续拒绝设置熔断并回退人工审批；Qwen Code 的分类器不可用时失败关闭并在连续不可用后回退人工审批。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `auto` 权限模式 · classifier 审查 |
| 入口与切换 | `Shift+Tab` 循环切换到 `auto`（账号满足条件时才出现）；`--permission-mode auto` 也适用于 `-p`；`permissions.defaultMode` 可设为 `"auto"`。 |
| 默认状态 | 当前默认权限模式为 `default`；官方文档注明 2026-08-14 起 Pro/Max/Team 计划新会话默认进入 auto 模式。VS Code 的 `claudeCode.initialPermissionMode` 不接受 `auto`。 |
| 具体行为 | auto 模式由独立 classifier 模型在动作执行前审查，阻断超出当前请求、指向未知基础设施或疑似受所读敌意内容驱动的操作。classifier 可见用户消息、工具调用与 CLAUDE.md，工具结果被剥离；还会审查 Subagent 的任务描述、运行中每个动作与结束后的完整动作历史，以及经 `SendMessage` 发给其他 Agent 的消息，并裁决指向根目录或 Home 的删除。被拒动作进入 `/permissions` 的 Recently denied 列表，可按 `r` 手动重试。 |
| 规则能力 | classifier 把对话中声明的边界当作阻断信号；v2.1.198 起对同一主机和端口复用网络判定。Plan 模式配合 `useAutoModeDuringPlan`（默认开启）时，planning 阶段的 shell 命令也由 classifier 审查。 |
| 隔离边界 | auto 模式不取代沙箱；带 `_meta["anthropic/requiresUserInteraction"]` 的 MCP 工具跳过 classifier 直接询问用户。Remote Control 入口不能选择 Auto。 |
| 保存与作用域 | 模式选择作用于当前会话；`permissions.defaultMode` 可写入用户或 Managed Settings；v2.1.142 起项目或本地 settings 中的 `auto` 被忽略，仓库不能给自己授权。 |
| 非交互行为 | `claude -p --permission-mode auto` 可用；没有交互面板时，classifier 连续阻断会中止会话。 |
| 条件与边界 | 所有计划可用；Team/Enterprise 默认开启，管理员可用 `permissions.disableAutoMode` 关闭。模型要求 Anthropic API 与 Claude Platform on AWS 上 Opus 4.6+、Sonnet 4.6+ 或 Fable 5，Bedrock、Google Cloud Agent Platform、Microsoft Foundry 与登录网关会话上仅 Sonnet 5、Opus 4.7+、Fable 5。v2.1.158–v2.1.206 部分 Provider 需 `CLAUDE_CODE_ENABLE_AUTO_MODE=1`，v2.1.207 起该变量无效。连续 3 次或累计 20 次阻断后 auto 模式暂停并回退询问，阈值不可配置。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Permissions](https://code.claude.com/docs/en/permissions)、[Claude Code Permission Modes](https://code.claude.com/docs/en/permission-modes) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `approvals_reviewer = "auto_review"` · `--approve-for-me` |
| 入口与切换 | `config.toml` 设 `approvals_reviewer = "auto_review"`；`--approve-for-me` 用于交互式与 `exec` 命令（搭配 `approval_policy = "on-request"` 与 `workspace-write` 沙箱，并传播到 root、`exec`、`resume`、`fork` 参数处理）；TUI 用 `/approve` 对近期 auto-review 拒绝单项重试一次。 |
| 默认状态 | `approvals_reviewer` 默认 `"user"`，即审批仍由用户处理；只有 `on-request` 或 granular 这类会产生交互审批的策略下 auto-review 才有可审查对象，`never` 下没有。 |
| 具体行为 | 审查代理代替用户裁决沙箱边界审批请求：请求提升权限的 shell/exec 调用、被阻断的网络请求、`request_permissions` 提示、有副作用的 app/MCP 工具调用和 Computer Use 新域名访问。沙箱内已允许的动作不经过审查；Computer Use 的 app 层审批仍直接询问用户。审查者只看到精简 transcript 与审批请求本身，不含隐藏推理；拒绝时指示主 Agent 改走实质更安全的路径或停下询问用户，不得用变通方式规避。 |
| 规则能力 | 默认审查策略检查数据外泄、凭据探测、持久性安全削弱与破坏性动作；低/中风险按策略放行，critical 拒绝，高风险需要足够用户授权且无匹配 deny 规则。本地 `[auto_review].policy` 可整体替换策略；企业 `guardian_policy_config`（requirements.toml）优先于本地策略，两者都是替换而非合并。`apps._default.approvals_reviewer` 与 `apps.<id>.approvals_reviewer` 可按 app 配置；`allowed_approvals_reviewers` 在组织层面限定可用审查者。 |
| 隔离边界 | auto-review 是审查者替换而非权限放大：不扩大 `writable_roots`、不启用网络、不削弱受保护路径。Prompt 构建、审查会话与解析失败均失败关闭；超时单独呈现但动作同样不执行。 |
| 保存与作用域 | `approvals_reviewer` 写入 `~/.codex/config.toml` 或受信任项目的 `.codex/config.toml`；企业策略写入 managed requirements。TUI 每任务最多记录 10 条近期拒绝，供 `/approve` 重试。 |
| 非交互行为 | `codex exec --approve-for-me` 让非交互流程中的审批走自动审查；审查失败失败关闭，动作不执行并把结果返回 Agent。 |
| 条件与边界 | `--approve-for-me` 随 rust-v0.147.0（2026-08-07 发布）引入。同一 turn 内连续 3 次拒绝或最近 50 次审查的滚动窗口内 10 次拒绝会中断当前 turn。审查使用额外模型调用并计入用量；ChatGPT 桌面 App 以 Reviewing、Approved、Denied、Aborted、Timed out 状态展示审查项。`approval_policy = "never"`、`danger-full-access` 或 `--yolo` 下不产生可审查的审批请求。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)、[Codex automatic approval reviews](https://learn.chatgpt.com/docs/sandboxing/auto-review)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex v0.147.0 release notes (--approve-for-me)](https://github.com/openai/codex/releases/tag/rust-v0.147.0)、[Codex --approve-for-me commit](https://github.com/openai/codex/commit/b7a61066081644e0d8b2c0b4dbfd7408ac1514df) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Auto 审批模式 · LLM 分类器 |
| 入口与切换 | `/approval-mode auto` 或 `Shift+Tab` 循环（顺序 plan → default → auto-edit → auto → yolo）；CLI 可传 `--approval-mode`；`tools.approvalMode` 持久化模式。 |
| 默认状态 | 文档 Quick Reference 称 Auto 为“default out-of-the-box experience”，另一处写初始模式为 Ask Permissions，两处表述并存；`tools.approvalMode` 可写入 `auto`。 |
| 具体行为 | LLM 分类器逐条评估 shell 命令、网络调用与工作区外编辑，自动放行其判断安全的操作、阻断高风险操作；多数只读操作和工作区内编辑跳过分类器。文档列出的放行示例包括只读命令、工作目录内的包安装与构建测试、工作区内编辑；阻断示例包括 `rm -rf /`、`fdisk`、`mkfs` 等不可逆破坏，`curl \| sh` 等外部代码执行、凭据外泄、`.bashrc`/`crontab` 等未授权持久化、安全削弱与向 main/master 强制推送。 |
| 规则能力 | `permissions.autoMode.hints.allow`/`hints.deny` 用自然语言提示引导分类器，`permissions.autoMode.environment` 提供环境上下文；`classifyAllShell` 可让只读 shell 命令也经过分类器。 |
| 隔离边界 | 分类器不确定时偏向阻断；分类器 API 不可达时动作被阻断（fail-closed），连续两次不可用后下一次工具调用回退人工审批；连续三次策略阻断后下一次调用也回退人工审批。 |
| 保存与作用域 | 审批模式可经 `/approval-mode <mode> --project`/`--user` 或 `tools.approvalMode` 写入项目或用户 Settings。 |
| 非交互行为 | Headless 可用 `--approval-mode` 指定模式，文档写 headless 默认行为是 Ask Permissions；auto 模式下分类器裁决照常生效。 |
| 条件与边界 | 自动裁决依赖分类器 API 可用；启用目录信任功能时，未信任目录会阻断 Auto-Edit、Auto、YOLO 等高权限路径。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code Approval Mode](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/approval-mode.md)、[Qwen Code Settings](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 无同类机制；`/auto` 为全部审批自动放行 |
| 入口与切换 | 无自动审查入口；`/auto` 或 `--auto` 切换到完全无人值守模式。 |
| 默认状态 | `default_permission_mode` 默认 `manual`；无分类器或审查代理。 |
| 具体行为 | 官方交互文档没有分类器或审查代理机制：副作用工具调用弹出审批面板由用户确认；`/yolo` 自动批准普通工具调用但敏感文件与退出 Plan 仍可询问；`/auto` 自动处理全部审批且 Agent 不再提问，属于全部放行而非基于操作内容的安全评估。 |
| 规则能力 | `[[permission.rules]]` 静态 allow/deny/ask 规则照常匹配；Auto 模式不引入基于操作内容的评估。 |
| 隔离边界 | 公开 CLI 文档未列 OS 级沙箱；`/auto` 只移除人工审批，不改变文件或网络边界。 |
| 保存与作用域 | 模式选择作用于当前会话；静态规则保存在 `~/.kimi-code/config.toml`。 |
| 非交互行为 | `kimi -p` 固定使用 Auto 权限策略，等同全部放行，仍无独立审查代理。 |
| 条件与边界 | 当前官方仓库文档没有审批自动审查能力；`/auto` 是全部审批自动放行，不是自动审查。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Interaction and Permissions](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/guides/interaction.md)、[Kimi Code Configuration](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `auto` 权限模式 · AI 分类器 |
| 入口与切换 | `--permission-mode auto`、`Shift+Tab` 循环到 `auto`，或 `general.defaultPermissionMode` 设为 `auto`；`/goal set <objective>` 会自动切换到 `auto`。 |
| 默认状态 | 默认权限模式为 `default`；`auto` 模式下没有确认提示。 |
| 具体行为 | `auto` 模式零确认提示：安全读取与工作区编辑自动批准，危险 shell 命令与受保护路径直接拒绝，其余风险操作交给 AI 分类器评估。`autoMode.allow`、`autoMode.soft_deny`、`autoMode.environment` 以自然语言注入分类器提示，属于软指引，最终决定仍由分类器做出。 |
| 规则能力 | `autoMode.allow` 描述分类器倾向放行的操作，`autoMode.soft_deny` 描述倾向拒绝的操作，`autoMode.environment` 提供环境上下文；这些是注入分类器提示的软指引。 |
| 隔离边界 | `autoMode` 配置只从受信任来源读取（用户全局 settings 与 localSettings），项目 settings 被排除，以防恶意提权。 |
| 保存与作用域 | `general.defaultPermissionMode` 随 settings 持久化；`autoMode` 写入用户全局或本地 settings。 |
| 非交互行为 | Headless 可传 `--permission-mode auto`，风险操作由分类器评估或直接拒绝；`dont_ask` 拒绝所有需审批操作，不使用自动审查。 |
| 条件与边界 | 非默认权限模式只在受信任目录生效；受保护路径在 `auto` 中直接拒绝。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions) |

## 官方来源

- [Claude Code Permissions](https://code.claude.com/docs/en/permissions)
- [Claude Code Permission Modes](https://code.claude.com/docs/en/permission-modes)
- [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Codex automatic approval reviews](https://learn.chatgpt.com/docs/sandboxing/auto-review)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex v0.147.0 release notes (--approve-for-me)](https://github.com/openai/codex/releases/tag/rust-v0.147.0)
- [Codex --approve-for-me commit](https://github.com/openai/codex/commit/b7a61066081644e0d8b2c0b4dbfd7408ac1514df)
- [Qwen Code Approval Mode](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/approval-mode.md)
- [Qwen Code Settings](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md)
- [Kimi Code Interaction and Permissions](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/guides/interaction.md)
- [Kimi Code Configuration](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/configuration/config-files.md)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)

## 关联能力

- [交互审批](./security-approval.md)
- [跳过审批](./security-bypass.md)
- [非交互审批](./security-noninteractive.md)
