# Codex `codex exec` 会话分支 `fork`

Codex 官方仓库在 2026-08-07 合入提交 `80858a8cce7f`（PR #37367），为 `codex exec` 增加 `fork` 子命令：按会话 UUID 或线程名称从既有会话派生新会话。最新 Release rust-v0.147.0 发布于 2026-08-07T01:41:49Z，早于该提交合入（03:27:21Z），官方非交互模式文档也尚未列出 `fork`，因此记录为条件项。此前“会话分支”字段只记录 Codex TUI 的 `/fork`，本次更新该字段的 Codex 记录并新增来源固定到合入提交 SHA。其余四家核对无变化：Claude Code 仍是 `--fork-session`，Qwen Code SDK README 未列出 fork 选项，Kimi Code CLI 参考未列出 fork/branch 参数，Qoder CLI 仍只有 SDK `resume` + `forkSession`。

## 修正

- `session-branch`（会话分支）矩阵 Codex 列由 `/fork` 更新为 `/fork` · `codex exec fork`（条件：main 分支，尚未发布）。
- `session-branch` 详情 Codex 入口、行为、状态范围、保存与保留、条件同步更新：`codex exec fork <SESSION_ID> [PROMPT]` 的 `SESSION_ID` 接受会话 UUID 或线程名称；不带提示词时只创建新线程、不开始回合，输出包含 `forked_from_id` 的会话配置后立即退出；带提示词时（`-` 从 stdin 读取）立即在派生会话继续执行，原会话保持不变；`--image`/`-i`（逗号分隔）可为 fork 后的提示词附加图片；不带提示词的 fork 不能搭配 `--image`、`--output-schema`/`--output-last-message` 等输出参数或 ephemeral 模式，否则报错；证据状态为源码确认。
- 跨产品事实新增一条：Claude Code 和 Codex 还在 Headless 流程提供会话分支（`--fork-session`、`codex exec fork`）。
- 来源新增 `codex-exec-fork`，固定到合入提交 SHA；Codex 核对日期保持 2026-08-07。

## 影响页面

- [会话与上下文矩阵](../docs/04-会话与上下文矩阵.md)
- [版本与证据](../docs/09-版本与证据.md)
- [会话分支详情](../docs/capabilities/sessions/session-branch.md)

## 证据版本

- Codex 官方仓库提交 `80858a8cce7f3ba0aaf6a76ad9462dca1604daeb`（`Add session forking to codex exec (#37367)`，2026-08-07T03:27:21Z 合入 main）：`codex-rs/exec/src/cli.rs` 新增 `Fork(ForkArgs)` 子命令，描述 “Fork a previous session by id into a new session.”；`ForkArgs` 参数为 `session_id`（“Conversation/session id (UUID) or thread name to fork.”）、`--image`/`-i`（“Optional image(s) to attach to the prompt sent after forking.”，逗号分隔）和可选 `prompt`（“Optional prompt to send after forking. If `-` is used, read from stdin.”）；`codex-rs/exec/src/lib.rs` 中不带提示词的 fork 创建新线程但不开始回合，`SessionConfiguredEvent` 携带 `forked_from_id` 标记来源会话，带提示词时立即继续执行；无提示词搭配图片、输出参数（`--output-schema`、`--output-last-message`）或 ephemeral 模式时分别报错 “Forking with images requires a prompt”“Forking with output options requires a prompt”“Ephemeral forks require a prompt”；`codex-rs/exec/src/cli_tests.rs`、`lib_tests.rs` 与 `tests/suite/resume.rs` 覆盖参数解析、提示词/无提示词分支与错误路径。
- Codex 官方非交互模式文档（learn.chatgpt.com/docs/non-interactive-mode，2026-08-07 访问）：仍只列出 `codex exec resume --last` 与 `codex exec resume <SESSION_ID>`，未列出 `fork`。
- Codex 官方 Release：rust-v0.147.0 发布于 2026-08-07T01:41:49Z，早于该提交合入，不包含 `codex exec fork`。
- Qwen Code 官方仓库 TypeScript SDK README（main 分支，2026-08-07 访问）：会话相关选项仅 `resume` 与 `sessionId`，未列出 fork/branch。
- Kimi Code 官方仓库 CLI 参考（main 分支，2026-08-07 访问）：会话相关参数仅 `--session [id]` 与 `--continue`，非交互模式未列出 fork/branch。
