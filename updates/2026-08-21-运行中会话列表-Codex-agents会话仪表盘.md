# 运行中会话列表：Codex `codex agents` / `/agents` Agent 会话仪表盘（rust-v0.149.0）

Codex rust-v0.149.0（2026-08-20T21:04:55Z 发布）新增交互式 `codex agents` 仪表盘，发布说明 New Features 第一条："Added an interactive `codex agents` dashboard for searching, starting, opening, renaming, and stopping tasks, with configurable shortcuts. (#39094, #39112, #39114, #39142)"。该仪表盘列出共享本地 app-server Daemon 已加载的运行中会话，正是 `session-live-list`（运行中会话列表）字段的比较对象；此前矩阵该字段 Codex 结论为"官方命令表未列出运行中会话列表；`codex resume` 选择已保存会话"（证据状态"未确认"），本次更新为已确认的仪表盘入口。Claude Code（v2.1.238 更新日志仅修复 `ListAgents` 预暖空闲 worker 显示等问题，不改变运行中会话列表入口）、Qwen Code（v0.21.15 发布说明未改 `qwen sessions ps`）、Kimi Code（0.38.0 为 OAuth 登录方式与 `WaitFor` 工具等，无运行中会话列表入口）与 Qoder CLI（docs.qoder.com/cli/slash-reference 复核仍无运行中会话列表命令）四家结论不变。

## 修正

- `session-live-list`（运行中会话列表）矩阵结论更新：Codex 列由"官方命令表未列出运行中会话列表；`codex resume` 选择已保存会话"更新为"`codex agents` · `/agents` · `Alt+A` 列出共享 Daemon 加载的运行中会话（rust-v0.149.0 起）"，证据状态由"未确认"改为"官方确认"。其余四家矩阵结论不变。
- Codex 详情：入口记录 `codex agents` 子命令（clap 帮助文本 "Browse all agent sessions on the shared local app-server daemon"）、TUI `/agents`（"view and switch between all active agent sessions"）与全局 `Alt+A`；内嵌 app server 未连接共享 Daemon 时显示 "Shared agents unavailable"，Unix 下可选启动后台 Daemon。具体行为记录列表内容（`ThreadLoadedList` 分页上限 1000、排除 ephemeral 与 NotLoaded、会话名/首条消息预览/Subagent 状态、按更新时间排序、搜索 `Ctrl+F`、打开切换、新建任务 `Ctrl+N`、重命名 `Ctrl+R`、停止 `Ctrl+X`）。状态范围记录 Needs input/Working/Ready 分组与默认按项目分组、`Ctrl+S` 切换状态分组。自动行为记录 `ThreadStatus`（NotLoaded/Idle/SystemError/Active 带 WaitingOnApproval/WaitingOnUserInput）登记。适用界面记录 Unix 自动启动 Daemon、非 Unix 需 `--remote`、`--cd` 指定远端新任务目录。条件记录调用级配置覆盖冲突与 workload identity 限制、`tui.keymap` 可配置快捷键、官方 Slash 命令文档尚未列出 `/agents`、四个 PR 合入时间与 rust-v0.149.0 发布。
- 跨产品事实新增 Codex 仪表盘条目；原"Codex、Kimi Code 与 Qoder CLI 官方命令表未列出"一条收窄为 Kimi Code 与 Qoder CLI。
- `site/data.js`：新增来源 `codex-v0149-release`、`codex-agents-dashboard-commit`（`4617d4d21d27`）、`codex-agents-command-commit`（`fd5018e0445b`）、`codex-agents-shortcuts-commit`（`f47f77ada669`）、`codex-agents-overview-source`（固定到 rust-v0.149.0 标签提交 `758ef40f50c1`）；`updatedAt` 更新为 2026-08-21。
- `docs/09-版本与证据.md`：Codex 核对日期更新为 2026-08-21，主要材料新增 Agent 会话仪表盘条目；会话与上下文来源列新增 rust-v0.149.0 发布说明与仪表盘提交链接。
- `npm run generate` 重新生成全部详情页与矩阵页（核对日期随 `updatedAt` 更新为 2026-08-21）；`npm test` 通过（112 details × 5 products）。

## 影响页面

- [会话与上下文矩阵](../docs/04-会话与上下文矩阵.md)
- [运行中会话列表详情](../docs/capabilities/sessions/session-live-list.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Codex rust-v0.149.0 发布说明（published_at 2026-08-20T21:04:55Z）New Features 原文："Added an interactive `codex agents` dashboard for searching, starting, opening, renaming, and stopping tasks, with configurable shortcuts. (#39094, #39112, #39114, #39142)"。
- PR #39094（合并提交 `4617d4d21d278592002249773faaaf47d4c52e63`，2026-08-17T22:51:41Z）"Add an agents overview dashboard to the TUI"：`/agents` 打开共享 app server 已加载根会话的全屏仪表盘，Subagent 状态随根会话显示，支持搜索、导航与按项目或状态分组，随线程通知刷新。
- PR #39112（合并提交 `319b2f72b1d442c3fe2fd4b4d07d0eb9ffde879a`）使仪表盘成为可交互任务面板；PR #39114（合并提交 `fd5018e0445ba7d879c5dbda66ecdab4b6da1886`）新增专用 `codex agents` 命令；PR #39142（合并提交 `f47f77ada6699460bf13b0b7278e710692e0ea34`）新增可配置快捷键。
- rust-v0.149.0 标签（提交 `758ef40f50c1a458425c7cfbf1eb12cbc07af0b0`）源码：`codex-rs/cli/src/main.rs` 的 `Agents` 子命令注释 "Browse all agent sessions on the shared local app-server daemon"，`--cd`/`-C` 与 `--no-alt-screen` 参数，调用级配置覆盖（`-c` 原始覆盖、提示词、图片、`--model`、OSS provider、profile v2、`--sandbox-mode`、`--dangerously-bypass-approvals-and-sandbox`、`--bypass-hook-trust`、本地 `--cwd`、`--add-dir`、`--approval-policy`、`--web-search`）存在时报 "`codex agents` cannot attach to shared sessions with invocation-specific configuration overrides"，workload identity 激活时报不可用，非 Unix 平台要求 `--remote`；Unix 下无远端时校验终端后经 `AppServerLifecycleCommand::Start` 启动 Daemon。
- `codex-rs/tui/src/slash_command.rs`：`SlashCommand::Agents` 描述 "view and switch between all active agent sessions"，与 `subagents`（切换本会话 Subagent）分离。
- `codex-rs/tui/src/app/agents_overview.rs`：`ThreadLoadedList`（每页 100、上限 1000）获取 Daemon 已加载线程；视图排除 ephemeral 线程与 `ThreadStatus::NotLoaded` 根会话；预览取首个用户消息；`stop_agents_overview_thread` 经 `turn_interrupt` 中断进行中回合；`dispatch_agents_overview_task` 新建线程并提交提示词；内嵌 app server 时显示 "Shared agents unavailable" 与 Unix "Start background server" 选项。
- `codex-rs/tui/src/app/agents_overview_view.rs`：分组 Needs input（Active 且 `WaitingOnApproval`/`WaitingOnUserInput`，或 SystemError）、Working（Active）、Ready（Idle）、Finished（NotLoaded）；搜索与状态分组切换。
- `codex-rs/tui/src/keymap.rs`：默认 `Alt+A`（`open_agents`，注释 "Open the daemon-wide agent-session overview"）；仪表盘内 `Ctrl+F` 搜索、`Ctrl+N` 新任务、`Ctrl+R` 重命名、`Ctrl+X` 停止、`Ctrl+S` 切换分组；可经 `tui.keymap` 覆盖（`global.open_agents` 与 `agents` 组）。
- `codex-rs/app-server-protocol/src/protocol/v2/thread.rs`：`ThreadStatus` 枚举 `NotLoaded`/`Idle`/`SystemError`/`Active { active_flags }`，`ThreadActiveFlag` 为 `WaitingOnApproval`/`WaitingOnUserInput`。
- 官方 Slash 命令文档（developers.openai.com/codex/cli/slash-commands，308 重定向至 learn.chatgpt.com/docs/developer-commands?surface=cli，2026-08-21 复核）仍未列出 `/agents`（或 `/cd`、`/pwd`、`/cwd`）。
- 同窗口其余更新复核结论：Claude Code v2.1.238 的 `keybindingFlavor` 设置、plugin marketplace `headersHelper`、`claude self-hosted-runner --defer-shutdown-max-min`/`--proxy-authorization-command` 等新增项无对应既有字段变化，留待后续单元处理；Codex rust-v0.149.0 的 `/cd`/`/pwd`/`/cwd` 工作目录命令与 `codex queue` 消息队列、main 分支 #39827/#39830 history notes 工具属其他字段或尚未发布，留待后续单元；Qwen Code v0.21.15 的 Thinking 开关、`/review --resume`、Aone Code 评论等与既有字段的对应关系留待后续单元；Kimi Code 0.38.0 的 `WaitFor` 工具与双 OAuth 登录、0.38.0 起 Edit/Write 写前读保护由"合入 main 尚未发布"转为已发布等，同样留待后续单元处理。
