# Codex 跨会话消息 `codex queue` 会话消息投递

Codex 跨会话消息字段由“官方命令与文档未列出会话间消息”改为记录启动级命令 `codex queue`。rust-v0.149.0（2026-08-20 发布）发布说明的新功能条目记录 “New `codex queue` command to send messages to existing local or remote sessions”，官方仓库提交 `83d015375e57`（PR #39092，2026-08-17 合入）实现该命令：`codex queue --thread <THREAD> --message <TEXT>` 经 app-server `thread/queue/add`（JSON-RPC）把文本作为用户输入排队投递给现有活跃会话，`--thread` 接受会话 UUID 或精确会话名，来源覆盖 interactive、exec 与 custom 活跃会话，默认经本地 app-server daemon，`--remote`/`--remote-auth-token-env` 指向显式远程 app server。这是用户到会话的单向投递，官方未列出模型主动向其他会话发消息的工具；官方 Slash 命令表与文档站在核对日期仍未同步 `codex queue`，证据为官方更新日志与官方仓库提交，提交内的 `queue_cmd.rs` 已在 rust-v0.149.0 标签核实存在。

## 修正

- `session-messaging` 字段 Codex 矩阵结论由 “官方命令与文档未列出会话间消息”（未确认）改为 “`codex queue --thread <UUID|精确会话名> --message <文本>` · 经 app-server `thread/queue/add` 投递 · `--remote` 指向远程 app server（rust-v0.149.0 引入）；用户到会话单向”（官方确认）。
- Codex 详情由整段“无对应能力可确认”改为记录：命令语法与参数（`--thread` UUID 或精确会话名、`--message` 非空文本、`--remote`/`--remote-auth-token-env`、`-c` 配置覆盖）；投递经 app-server `thread/queue/add`，目标不存在报 `No active session found matching`、多个活跃会话同名报 `More than one active session is named` 并要求改用 UUID；空消息与图片附件被拒绝；官方更新日志修复条目记录排队消息可可靠唤醒空闲会话；服务端不支持该方法时报错提示更新或重启、不静默更换投递目标，`-c` 覆盖与运行中的本地 daemon 互斥；明确不把 Subagent 委派、`codex exec` 会话分支、TUI 内 Tab 排队下一轮输入或把 Codex 作为 MCP server 调用的多 Agent 工作流计作会话间消息。
- 跨产品事实由 “只有 Claude Code 提供独立会话之间的消息” 改为按产品分述：新增 Codex `codex queue` 一条，Kimi Code 单独保留“官方命令与文档仍未列出会话间消息”。
- 新增来源：`codex-queue-commit`（固定到提交 `83d015375e578e369c115b06aea631f266226a4f`）；`codex-v0149-release` 标签改为 “Codex rust-v0.149.0 release notes (agents dashboard and codex queue)”。
- `docs/09-版本与证据.md`：Codex 核对日期改为 2026-08-23；主要材料补充会话间消息排队；官方来源表会话与上下文列新增 `codex queue` 提交链接，发布说明链接标签同步更新。
- `npm run generate` 重新生成 `docs/capabilities/sessions/`（`session-messaging.md` 内容更新）、`docs/04-会话与上下文矩阵.md` 及各分类文档的核对日期。

## 影响页面

- [会话与上下文矩阵](../docs/04-会话与上下文矩阵.md)
- [跨会话消息详情](../docs/capabilities/sessions/session-messaging.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- rust-v0.149.0 发布说明（官方 Release，Codex 仓库 `CHANGELOG.md` 指向 releases 页）新功能条目原文："`codex queue` command to send messages to existing local or remote sessions."；修复条目原文："Reliable wake-up for idle sessions via queued messages and improved duplicate session name resolution."
- 提交 `83d015375e578e369c115b06aea631f266226a4f`（PR #39092，2026-08-17 合入）说明原文："Add `codex queue --thread <THREAD> --message <TEXT>` to submit a text message through the `thread/queue/add` app-server API."；"Resolve active sessions by UUID or exact name across interactive, exec, and custom sources, and reject ambiguous names."；"Support local and explicit remote app servers while reporting incompatible servers and configuration overrides instead of silently changing the target."；"Reject empty messages and image attachments."
- 提交内 `codex-rs/cli/src/queue_cmd.rs`（rust-v0.149.0 标签已核实存在）参数定义：`--thread` 帮助文本 "Session UUID or exact session name."，`--message` 帮助文本 "Message text to queue." 且使用 `NonEmptyStringValueParser`；另含 `InteractiveRemoteOptions`（`--remote`/`--remote-auth-token-env`）与 `SessionArchiveConfigOverrides` 配置覆盖。
- 提交内错误路径原文："No active session found matching '{target}."；"More than one active session is named '{name}'; use a session UUID instead."；"the local app-server daemon does not support thread/queue/add; update or restart the local app-server daemon"；"cannot queue through an embedded app server while a local app-server daemon is running; remove configuration overrides or use --remote"。
- 官方 Slash 命令文档（核对日期 2026-08-23 抓取，页面已迁移至 learn.chatgpt.com/docs/developer-commands）未列出 `codex queue` 或任何会话间消息命令；官方文档站目录页（learn.chatgpt.com/docs/cli）也未列出该子命令，详情按“官方文档站尚未同步”记录。
- 其余四家本次无变化：Claude Code v2.1.240 与 v2.1.241 更新日志均为 “Bug fixes and reliability improvements”，无跨会话消息新条目；Qwen Code `send_message`/`list_agents` 仍限当前会话后台 Agent；Kimi Code 官方命令表仍未列出会话间消息；Qoder CLI Agent Teams 仍为 `QODER_AGENT_TEAMS=1` beta 单会话内通信。
