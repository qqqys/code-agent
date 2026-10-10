# 检查点与回退

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-checkpoint)

> 核对日期：2026-10-10

## 定义

在会话中选择较早锚点，恢复对话、文件或两者；不同产品对 Shell、副 Agent 和外部修改的覆盖范围不同。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/rewind` · `/checkpoint` · `/undo` | 官方确认 |
| Codex | CLI 命令表未列出 | 未确认 |
| Qwen Code | `/rewind`（别名 `/rollback`）· `/restore`（条件：文件检查点启用，交互模式默认开启） | 条件项 |
| Kimi Code | `/undo [count]`（不回滚代码，仅空闲可用） | 官方确认 |
| Qoder CLI | `/rewind`（对话、文件或两者）· `general.fileCheckpointing.enabled` 默认 `true` · SDK `rewindFiles()` | 官方确认 |

## 比较边界

### 本页包含

- 对话回退
- 文件快照恢复
- 回退锚点与保留期
- 恢复范围选择与影响预览

### 本页不包含

- Git 提交历史
- 会话分支
- 单纯压缩整段上下文
- CLI 二进制版本回滚

## 跨产品事实

1. Claude Code、Qwen Code 和 Qoder CLI 都能恢复文件；Kimi Code `/undo` 只撤销上下文、Todo 与 Plan 状态，Codex CLI 命令表没有列出同类命令。
2. Qoder CLI 的 `/rewind` 以对话中的用户消息为检查点，恢复范围可在「对话与文件」（默认）、「只对话」、「只文件」之间选择，确认前显示受影响文件数与增删行；文件检查点由 `general.fileCheckpointing.enabled` 控制且默认 `true`。
3. Claude Code 在每个用户提示前自动建检查点并保留最近 100 个检查点的文件快照，保留清扫默认约 30 天后删除；Qwen Code 的 `~/.qwen/file-history/` 会话备份由 `general.cleanupPeriodDays`（默认 `30`）控制，超期数据由每天至多运行一次的后台任务删除。
4. 三家有文件回退的产品都不把 Shell 写入纳入契约：Claude Code 不跟踪 Bash 改动，Qoder CLI 明确经 `Bash` 直接写文件不产生可回退快照，Qwen Code 的 `/restore` 只覆盖已捕获的文件工具修改。
5. Qoder CLI 的 Agent SDK 另有 `rewindFiles()`/`rewind_files()`，以用户消息 `uuid` 为锚点、只改文件不改对话历史，可先 `dryRun` 预览受影响文件与增删行汇总。
6. Qoder 的 `qoder rollback` 与 Qwen 的 `/doctor rollback` 都是回滚 CLI 二进制版本，Qwen 的命令表直接注明对话历史应改用 `/rewind`。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/rewind` · `/checkpoint` · `/undo` |
| 入口与切换 | `/rewind`，别名 `/checkpoint` 和 `/undo`；输入框为空时连按两次 `Esc` 打开同一菜单，输入框有文字时双击 `Esc` 改为清空输入并把文字存进输入历史（按 `↑` 取回）。 |
| 保存位置 | 检查点与对话一起保存（会话文件默认在 `~/.claude/projects/<project>/<session-id>.jsonl`）；恢复时跳过的路径写进 `~/.claude/debug/<session-id>.txt`，需先用 `/debug` 打开调试日志。 |
| 具体行为 | 菜单项为 Restore code and conversation、Restore conversation、Restore code、Summarize from here、Summarize up to here 与 Never mind；两个代码恢复项只在所选检查点有可回退的文件改动时出现，否则只剩 Restore conversation、两个总结项和 Never mind。恢复对话或选择 Summarize from here 后，所选消息的原始提示词回填到输入框；Summarize up to here 把人留在对话末尾且输入框为空，两种总结都在被压缩的位置留下 `Summarized conversation` 标记。总结不改动磁盘文件、原消息仍留在会话 transcript，可在高亮总结项时于 add context (optional) 处输入指引再按 `Enter`，直接按数字键则立即总结。 |
| 状态范围 | 每个用户提示前创建检查点，只跟踪 Claude 直接文件编辑工具在当前会话内产生的变化；在回合运行中送达的排队消息不单独建检查点，要撤销其后的改动需回退到开启该回合的提示词，这会连该消息到达前的工作一起回退。 |
| 自动行为 | 检查点自动创建，无需手动保存。前台运行的 forked Skill（`context: fork` 且 `background: false`）在自己的回合里改工作树，回退按常规恢复其编辑；其他 Subagent（默认在后台运行的 fork、后台 `/code-review --fix`）的编辑不恢复。 |
| 保存与保留 | 检查点随会话保存，恢复会话后仍可 `/rewind`；一个会话内保留最近 100 个检查点的文件快照，丢弃旧检查点会删除不再被任何检查点引用的快照文件，但每个文件的第一份快照保留给 VS Code 扩展作为会话 Diff 基线。保留清扫默认在会话最后一次保存快照约 30 天后删除快照，回退到快照已删除的检查点会以 `No files were restored` 失败；`cleanupPeriodDays` 可延长保留。 |
| 适用界面 | CLI；VS Code 扩展使用每个文件的第一份快照作为其会话 Diff 的基线。 |
| 条件与边界 | 不跟踪 Bash 命令改动的文件（如 `rm`、`mv`、`cp`），不跟踪当前会话外的人工修改与其他并发会话的修改（除非恰好改了同一文件），也不回退符号链接或硬链接路径——选择恢复代码时跳过这些路径并提示 `Restored the code, but skipped N files`，被跳过的文件保持当前内容。同一进程内执行过 `/clear` 时，菜单顶部多出一行 `/resume <session-id> (previous session)`，直到退出 Claude Code 或恢复其他会话。官方明确检查点只面向会话级快速恢复，永久版本历史仍应使用 Git。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing)、[Claude Code Manage sessions](https://code.claude.com/docs/en/sessions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | CLI 命令表未列出 |
| 入口与切换 | 官方 CLI Slash 命令表在 2026-10-10 核对时没有 `/rewind`、`/rollback`、`/restore`、`/undo` 或 `/checkpoint`；CLI customization 页也没有双击 `Esc` 回退、撤销或检查点条目，只记录 `Ctrl+G` 打开外部编辑器。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 本项不把 Git 操作、撤销未提交改动或分支会话算作内置检查点。 |
| 状态范围 | 公开资料未确认 CLI 自动保存可选择的每轮文件快照。 |
| 自动行为 | 未确认。 |
| 保存与保留 | 会话本身有本地记录（`$CODEX_HOME/sessions`），但没有公开的 CLI 检查点保留契约。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | rust-v0.162.1（2026-10-09 发布）与 rust-v0.162.0 的发布说明都没有检查点或回退类条目；需要永久代码历史时仍应使用 Git。 |
| 证据状态 | 未确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex CLI customization（无检查点或回退命令，只记 `Ctrl+G` 外部编辑器）](https://learn.chatgpt.com/docs/cli-customization)、[Codex rust-v0.162.0 发布说明（apply_patch 无条件保留换行）](https://github.com/openai/codex/releases/tag/rust-v0.162.0)、[Codex rust-v0.162.1 发布说明（New Features 与 Bug Fixes 都没有检查点或回退条目）](https://github.com/openai/codex/releases/tag/rust-v0.162.1) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/rewind`（别名 `/rollback`）· `/restore`（条件：文件检查点启用，交互模式默认开启） |
| 入口与切换 | `/rewind` 把对话回退到较早轮次，官方用法示例把 `/rollback` 写作同一命令的写法；`/restore` 列出检查点，`/restore <ID>` 把项目文件恢复到某次工具调用运行前的检查点。 |
| 保存位置 | 文档站 Checkpointing 页记录影子 Git 仓库 `~/.qwen/history/<project_hash>`（不干扰项目自己的 Git 仓库）以及对话与工具调用 JSON 位于 `~/.qwen/tmp/<project_hash>/checkpoints`；main 分支设置参考改称 `~/.qwen/file-history/` 会话备份。两处路径不一致，本表以较新的 main 分支设置参考为准，差异记为未确认。 |
| 具体行为 | 文档站 Checkpointing 页把恢复写成三件事：把项目文件恢复到快照状态、恢复 CLI 中的对话历史、重新提出原来的工具调用以便再次运行、修改或忽略。main 分支命令文档把两者分成对话回退与文件回退两个入口，逐字描述为 “Rewind conversation to a previous turn” 与 “Revert project files to the checkpoint before a tool call ran”。 |
| 状态范围 | 检查点在批准会修改文件系统的工具（如 `write_file`、`edit`）时自动创建。main 分支命令文档逐字写 “Per-turn diffs require file checkpointing to be enabled (on by default in interactive mode). When file checkpointing is off, only the "Current" source is available.”，即文件检查点在交互模式下默认开启，关闭时按轮次 Diff 只剩 Current 一个来源。 |
| 自动行为 | 文件工具执行前自动建立检查点，无需手动保存。 |
| 保存与保留 | `general.cleanupPeriodDays` 为 number、默认 `30`，官方描述为保留 `~/.qwen/file-history/` 会话备份（供 `/rewind` 使用）与运行期 `debug/` 目录下会话调试日志的天数，超期数据由每天至多运行一次的后台任务删除；`0` 表示最小保留（约 1 小时），保留最近一小时触碰过的会话与当前活动会话；改动需重启生效。 |
| 适用界面 | 交互式 CLI。文档站 Checkpointing 页记录用 `qwen --checkpointing` 只为当前会话开启，或在 `settings.json` 写 `general.checkpointing.enabled: true` 为所有会话默认开启，并写明该功能 disabled by default；这与 main 分支命令文档的「交互模式默认开启」不一致，两处都是官方一手资料。 |
| 条件与边界 | 检查点文件名由时间戳、被改文件名与即将运行的工具名组成，官方示例为 `2025-06-22T10-00-00_000Z-my-file.txt-write_file`。`/doctor rollback` 逐字为 “Roll back the standalone CLI binary to the previous version (standalone installs only; for conversation history use `/rewind`)”，属版本回滚不属本字段。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code main 命令文档（`/rewind`、`/restore`、`/doctor rollback` 与文件检查点交互模式默认开启，提交 e39567eb564c）](https://github.com/QwenLM/qwen-code/blob/e39567eb564cf5473dc703b25b219c66059fcb1b/docs/users/features/commands.md)、[Qwen Code main 设置文档（`general.cleanupPeriodDays` 与 `~/.qwen/file-history/`，提交 86b9f13395bd）](https://github.com/QwenLM/qwen-code/blob/86b9f13395bd77938f5096011f8fb02986b7facf/docs/users/configuration/settings.md)、[Qwen Code 文档站 Checkpointing 页（影子 Git 快照、`--checkpointing` 与 `general.checkpointing.enabled`）](https://qwenlm.github.io/qwen-code-docs/en/users/features/checkpointing/) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/undo [count]`（不回滚代码，仅空闲可用） |
| 入口与切换 | `/undo [<count>]`；不带数量打开选择器，带数量撤销对应条数。官方 Slash 命令表没有给出别名，也没有 `/rewind`、`/restore`、`/checkpoint` 或任何文件回退命令。 |
| 保存位置 | 官方文档没有记录文件快照目录；会话本身位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`。 |
| 具体行为 | 从当前上下文移除最近的提示词，并一并回滚这些提示词产生的 todo 列表和计划模式状态；官方在该行明确写「不回滚代码改动」。 |
| 状态范围 | 只处理对话上下文与会话内计划状态，不产生也不恢复文件快照。 |
| 自动行为 | 没有自动文件检查点；撤销由用户显式发起。 |
| 保存与保留 | 撤销结果写回当前会话事件流；文件系统状态保持不变。 |
| 适用界面 | 交互式 TUI。命令表把 `/undo` 的「随时可用」列标为「否」，官方提示部分命令仅在空闲状态可用。 |
| 条件与边界 | 最后一次上下文压缩之前的提示词不能撤销；会话正在流式输出或压缩上下文时执行会被拦截，需先按 `Esc` 或 `Ctrl-C` 中断。需要恢复代码时必须使用 Git 或其他文件历史。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash 命令表（`/undo [<count>]` 行、「随时可用」列为「否」与空闲限制提示，提交 25dd4ce97345）](https://github.com/MoonshotAI/kimi-code/blob/25dd4ce97345c7ebfd9c036898e5eef955c45ea8/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/rewind`（对话、文件或两者）· `general.fileCheckpointing.enabled` 默认 `true` · SDK `rewindFiles()` |
| 入口与切换 | `/rewind` 打开 Rewind 界面；官方 Slash 命令参考把它列在 Sessions and Conversations 分组、描述逐字为 “Roll back to a specific checkpoint.”，且不出现在条件命令说明里。Agent SDK 侧为 `enableFileCheckpointing: true`（Python `enable_file_checkpointing=True`）加 `q.rewindFiles(userMessageId, { dryRun })`（Python `client.rewind_files(user_message_id, dry_run=...)`）。 |
| 保存位置 | 官方 Undo and Restore 页只写 “Qoder CLI records the file editing history during a session”，没有给出编辑历史的磁盘路径；设置参考也没有对应的路径键，记为未确认。 |
| 具体行为 | CLI：Rewind 界面列出对话中的检查点（以发送过的用户消息为标记），选中后先显示从该点回退的影响并要求确认，恢复范围可选「恢复对话与文件」（默认）、「只恢复对话」、「只恢复文件」；界面显示受影响文件数与增删行，官方示例为 “Rewinding now will revert 3 files (+42 -17)”，该检查点没有可回退的文件改动时显示 “Will restore conversation, no file changes involved.”。恢复对话时对话历史被截断回该检查点，恢复文件时按记录的编辑历史把相关文件还原到检查点状态。SDK：`rewindFiles` 只恢复本地文件、不回滚对话历史，`dryRun` 不修改任何文件并返回 `canRewind`、`error`、`filesChanged`、`insertions`、`deletions`；执行模式下不可回退时 TypeScript 的 Promise reject、Python 抛异常，官方列出的常见失败原因是未启用文件检查点、ID 不是有效的用户消息 UUID、ID 属于其他会话，或目标消息没有可回退的文件快照。 |
| 状态范围 | 检查点锚定对话中的用户消息；SDK 的锚点是用户消息的 `uuid`（不是 `session_id`，也不是结果消息的 ID），只在其所属会话上下文内有效。只回退本地文件检查点：MCP 工具、远程服务或数据库的外部副作用不撤销，经 `Bash` 直接写文件不产生可回退快照，目录创建一类目录级副作用可能不撤销。 |
| 自动行为 | 文件检查点由 `general.fileCheckpointing.enabled` 控制：类型 boolean、默认 `true`、描述逐字为 “Enable file checkpoints (code rollback).”、写入 `settings.json`、改动需重启，官方没有给出对应环境变量。SDK 传 `settings` 对象时自动合并 `general.fileCheckpointing.enabled = true`（已有的 `fileCheckpointing.enabled` 被 SDK 选项覆盖），传设置文件路径时不改写该文件、需自行配置。 |
| 保存与保留 | 编辑历史只在当前会话内记录，跨会话改动不在范围内；SDK 的检查点 ID 绑定会话，恢复同一会话后该 ID 仍可用，但不能跨不同会话混用。公开文档没有承诺快照保留期限。 |
| 适用界面 | CLI TUI 的 `/rewind` 与 Agent SDK 的 `rewindFiles`/`rewind_files`；两者共用 `general.fileCheckpointing.enabled` 这一个开关。 |
| 条件与边界 | 人工编辑或 Shell 命令产生的文件改动可能不被 Rewind 撤销，官方说明 Rewind 主要针对 Qoder 通过文件编辑工具做的改动，并建议在关键节点配合 Git 提交。`qoder rollback` 子命令描述为 “Roll back to a previous version.”，是 CLI 版本回滚而不是文件检查点。Release Notes 只在 CLI 1.1.29（2026-08-24）记 “Fixed being unable to fork and rewind history messages after compaction”、CLI 1.1.23（2026-08-15）的小节标题为 “Session Resume, Rewind, and Tool-Call Fixes”，没有写明 `/rewind` 的引入版本。关闭 `general.fileCheckpointing.enabled` 后 `/rewind` 是否只剩对话恢复，官方没有说明，记为未确认。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Undo and Restore（`/rewind` 检查点、三种恢复范围与影响预览）](https://docs.qoder.com/cli/undo-restore)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI 设置、环境变量与文件路径参考（未列出 `security.crossSessionInbound` 与 `general.dialogExpiry`）](https://docs.qoder.com/cli/settings-reference)、[Qoder CLI SDK Checkpoint](https://docs.qoder.com/en/cli/sdk/checkpoint)、[Qoder CLI 命令行参考（`--worktree`、子命令表与 `plugins`/`skills`/`hooks`/`agents` 子命令组）](https://docs.qoder.com/cli/cli-reference)、[Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算、Hook 失败、`/hooks` GA 与插件市场条目的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli) |

## 官方来源

- [Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex CLI customization（无检查点或回退命令，只记 `Ctrl+G` 外部编辑器）](https://learn.chatgpt.com/docs/cli-customization)
- [Codex rust-v0.162.0 发布说明（apply_patch 无条件保留换行）](https://github.com/openai/codex/releases/tag/rust-v0.162.0)
- [Codex rust-v0.162.1 发布说明（New Features 与 Bug Fixes 都没有检查点或回退条目）](https://github.com/openai/codex/releases/tag/rust-v0.162.1)
- [Qwen Code main 命令文档（`/rewind`、`/restore`、`/doctor rollback` 与文件检查点交互模式默认开启，提交 e39567eb564c）](https://github.com/QwenLM/qwen-code/blob/e39567eb564cf5473dc703b25b219c66059fcb1b/docs/users/features/commands.md)
- [Qwen Code main 设置文档（`general.cleanupPeriodDays` 与 `~/.qwen/file-history/`，提交 86b9f13395bd）](https://github.com/QwenLM/qwen-code/blob/86b9f13395bd77938f5096011f8fb02986b7facf/docs/users/configuration/settings.md)
- [Qwen Code 文档站 Checkpointing 页（影子 Git 快照、`--checkpointing` 与 `general.checkpointing.enabled`）](https://qwenlm.github.io/qwen-code-docs/en/users/features/checkpointing/)
- [Kimi Code Slash 命令表（`/undo [<count>]` 行、「随时可用」列为「否」与空闲限制提示，提交 25dd4ce97345）](https://github.com/MoonshotAI/kimi-code/blob/25dd4ce97345c7ebfd9c036898e5eef955c45ea8/docs/zh/reference/slash-commands.md)
- [Qoder CLI Undo and Restore（`/rewind` 检查点、三种恢复范围与影响预览）](https://docs.qoder.com/cli/undo-restore)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI 设置、环境变量与文件路径参考（未列出 `security.crossSessionInbound` 与 `general.dialogExpiry`）](https://docs.qoder.com/cli/settings-reference)
- [Qoder CLI SDK Checkpoint](https://docs.qoder.com/en/cli/sdk/checkpoint)
- [Qoder CLI 命令行参考（`--worktree`、子命令表与 `plugins`/`skills`/`hooks`/`agents` 子命令组）](https://docs.qoder.com/cli/cli-reference)
- [Qoder CLI Release Notes（跨会话消息、`/loop`、`/crontab`、任务预算、Hook 失败、`/hooks` GA 与插件市场条目的版本时间线）](https://docs.qoder.com/release-notes/qoder-cli)

## 关联能力

- [会话分支](./session-branch.md)
- [手动压缩](./session-compress.md)
- [回退或检查点](../commands/cmd-rewind.md)
