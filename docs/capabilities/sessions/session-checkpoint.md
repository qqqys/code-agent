# 检查点与回退

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-checkpoint)

> 核对日期：2026-08-20

## 定义

在会话中选择较早锚点，恢复对话、文件或两者；不同产品对 Shell、副 Agent 和外部修改的覆盖范围不同。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/rewind` · `/checkpoint` · `/undo` | 官方确认 |
| Codex | CLI 命令表未列出 | 未确认 |
| Qwen Code | `/rewind`；条件：`/restore` | 条件项 |
| Kimi Code | `/undo`（不回滚代码） | 官方确认 |
| Qoder CLI | SDK 条件：`rewindFiles()` | 条件项 |

## 比较边界

### 本页包含

- 对话回退
- 文件快照恢复
- 回退锚点与保留期

### 本页不包含

- Git 提交历史
- 会话分支
- 单纯压缩整段上下文

## 跨产品事实

1. Claude Code 同时支持对话和直接文件工具编辑的恢复；Qwen Code 将对话 `/rewind` 与条件文件 `/restore` 分开。
2. Kimi Code `/undo` 只撤销上下文、Todo 和 Plan 状态，不回滚代码。
3. Qoder 的文件回退当前是 SDK 条件能力，默认关闭，而且只改文件、不改会话历史；Codex CLI 命令表未列出同类回退。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/rewind` · `/checkpoint` · `/undo` |
| 入口与切换 | `/rewind`，别名 `/checkpoint` 和 `/undo`；输入框为空时双击 `Esc` 也可打开菜单。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 可恢复代码与对话、只恢复对话、只恢复代码，或从指定消息前后定向总结。 |
| 状态范围 | 每个用户提示前创建检查点，跟踪 Claude 直接文件编辑工具产生的变化；最近保留 100 个检查点。 |
| 自动行为 | 检查点自动创建，无需手动保存；文件快照随旧检查点和会话清理回收。 |
| 保存与保留 | 检查点随会话保存，恢复会话后仍可回退；默认随会话在 30 天后清理。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 不跟踪 Bash 改文件、外部修改、大多数 Subagent 编辑、符号链接或硬链接路径；不能替代 Git。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing)、[Claude Code Manage sessions](https://code.claude.com/docs/en/sessions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | CLI 命令表未列出 |
| 入口与切换 | 当前 Codex CLI 命令表未列出对话或文件检查点回退命令。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 本项不把 Git 操作、撤销未提交改动或分支会话算作内置检查点。 |
| 状态范围 | 公开资料未确认 CLI 自动保存可选择的每轮文件快照。 |
| 自动行为 | 未确认。 |
| 保存与保留 | 会话本身有本地记录，但没有公开的 CLI 检查点保留契约。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | 需要永久代码历史时仍应使用 Git；本页保留为未确认。 |
| 证据状态 | 未确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Troubleshooting](https://learn.chatgpt.com/docs/reference/troubleshooting) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/rewind`；条件：`/restore` |
| 入口与切换 | `/rewind`（别名 `/rollback`）选择对话回退点；启用文件检查点后可用 `/restore` 选择工具调用前的文件状态。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | `/rewind` 截断当前对话；`/restore` 回滚文件与相应历史到工具调用前，并可重新执行该工具。 |
| 状态范围 | 对话和文件是两个入口。文件备份位于 `~/.qwen/file-history/`，只覆盖已捕获的文件工具修改。 |
| 自动行为 | 文件检查点功能启用时在工具修改前创建备份；过期备份由每日最多一次的后台清理删除。 |
| 保存与保留 | `general.cleanupPeriodDays` 默认保留 30 天；`0` 仍保留约一小时和当前活跃会话。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | `/restore` 仅在文件检查点功能启用时注册；Shell、外部程序和未捕获的修改不能保证恢复。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/undo`（不回滚代码） |
| 入口与切换 | `/undo [count]`；不带数量打开选择器，带数量撤销最近若干提示。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 从当前上下文移除所选提示，并回滚这些提示产生的 Todo 列表和 Plan 模式状态。 |
| 状态范围 | 只处理对话与会话内计划状态，不回滚代码文件。 |
| 自动行为 | 没有自动文件检查点；由用户显式撤销提示。 |
| 保存与保留 | 撤销结果写回当前会话事件流；原文件系统状态保持不变。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | 不能撤销到最后一次上下文压缩之前；需要代码恢复时必须使用 Git 或其他文件历史。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)、[Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | SDK 条件：`rewindFiles()` |
| 入口与切换 | Agent SDK 设置 `enableFileCheckpointing: true`，再调用 `q.rewindFiles(userMessageId)`；可先用 `{ dryRun: true }` 预览。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | 把直接文件工具的修改恢复到某条用户消息开始处理时的状态；Dry Run 返回文件列表和汇总增删行。 |
| 状态范围 | 只修改文件，不回退会话历史；以用户消息 UUID 为锚点。 |
| 自动行为 | 启用后在文件工具修改前后建立快照；功能默认关闭。 |
| 保存与保留 | 同一 SDK 会话内使用保存的消息 UUID 回退；公开文档未承诺长期快照保留时间。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | 必须同时启用检查点和保存消息 ID；Cloud runtime 不提供此本地文件能力，且 Shell/外部修改不在文件工具快照契约内。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI SDK Checkpoint](https://docs.qoder.com/en/cli/sdk/checkpoint)、[Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Troubleshooting](https://learn.chatgpt.com/docs/reference/troubleshooting)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md)
- [Qoder CLI SDK Checkpoint](https://docs.qoder.com/en/cli/sdk/checkpoint)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [会话分支](./session-branch.md)
- [手动压缩](./session-compress.md)
- [回退或检查点](../commands/cmd-rewind.md)
