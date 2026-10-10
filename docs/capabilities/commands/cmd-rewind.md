# 回退或检查点

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-rewind)

> 核对日期：2026-10-10

## 定义

回到当前会话较早的消息或工具调用点，并按产品能力恢复对话、文件或二者。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/rewind` | 官方确认 |
| Codex | 无对应命令 | 未确认 |
| Qwen Code | `/rewind`、`/restore` | 官方确认 |
| Kimi Code | `/undo [count]` | 官方确认 |
| Qoder CLI | `/rewind` | 官方确认 |

## 比较边界

### 本页包含

- 消息回退
- 代码检查点
- 工具调用恢复
- 回退选择器

### 本页不包含

- Git reset
- 恢复历史会话
- 撤销最近一次文本编辑器输入
- CLI 二进制版本回滚

## 跨产品事实

1. Claude Code、Qwen Code 与 Qoder CLI 都提供会话回退，但恢复粒度不同。
2. Qwen Code `/restore` 以工具调用为锚点，同时重置对话与文件历史。
3. Qoder CLI `/rewind` 以用户消息为检查点，可选恢复对话与文件、只对话或只文件，默认恢复对话与文件。
4. Kimi Code `/undo` 只撤销最近的用户提示，并受上下文压缩边界与空闲状态限制。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/rewind` |
| 别名 | `/checkpoint`、`/undo` |
| 参数 | 无公开参数；恢复范围在菜单中选择 |
| 执行行为 | 从历史消息选择点恢复对话、代码，或从该点前后生成定向摘要。 |
| 可用模式 | 交互式 CLI；输入框为空时连按两次 `Esc` 打开同一菜单 |
| 保存范围 | 修改当前会话与可选代码状态；检查点随会话保存 |
| 条件与边界 | 两个代码恢复项只在所选检查点有可回退文件改动时出现；不跟踪 Bash 改动、会话外修改与符号链接或硬链接路径 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 当前官方命令目录未列出对应 Slash 命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/rewind`、`/restore` |
| 别名 | `/rollback` |
| 参数 | `/restore` 不带参数列出检查点，`/restore <ID>` 恢复指定检查点 |
| 执行行为 | `/rewind` 回到以前的对话轮次；`/restore` 恢复指定工具调用时的对话与文件状态。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 修改当前会话和可能的文件状态 |
| 条件与边界 | 文件检查点在交互模式默认开启；`/doctor rollback` 是回滚 CLI 二进制版本，官方注明对话历史应改用 `/rewind` |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)、[Qwen Code main 命令文档（`/rewind`、`/restore`、`/doctor rollback` 与文件检查点交互模式默认开启，提交 e39567eb564c）](https://github.com/QwenLM/qwen-code/blob/e39567eb564cf5473dc703b25b219c66059fcb1b/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/undo [count]` |
| 别名 | 无公开别名 |
| 参数 | `[count]` |
| 执行行为 | 撤销最近的用户提示；不带 count 打开选择器。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 修改当前会话上下文，不回滚代码改动 |
| 条件与边界 | 不能撤销到最后一次上下文压缩之前；命令表把「随时可用」标为「否」，流式输出或压缩上下文时会被拦截，需先按 `Esc` 或 `Ctrl-C` |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)、[Kimi Code Slash 命令表（`/undo [<count>]` 行、「随时可用」列为「否」与空闲限制提示，提交 25dd4ce97345）](https://github.com/MoonshotAI/kimi-code/blob/25dd4ce97345c7ebfd9c036898e5eef955c45ea8/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/rewind` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开 Rewind 界面，从以用户消息为检查点的列表中选择恢复范围：对话与文件（默认）、只对话或只文件，确认前显示受影响文件数与增删行。 |
| 可用模式 | TUI |
| 保存范围 | 截断当前会话对话历史和/或按会话内记录的编辑历史还原文件 |
| 条件与边界 | 人工编辑或 Shell 命令产生的改动可能不被撤销；文件检查点由 `general.fileCheckpointing.enabled` 控制、默认 `true`；`qoder rollback` 是 CLI 版本回滚而非本命令 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI Undo and Restore（`/rewind` 检查点、三种恢复范围与影响预览）](https://docs.qoder.com/cli/undo-restore)、[Qoder CLI 设置、环境变量与文件路径参考（未列出 `security.crossSessionInbound` 与 `general.dialogExpiry`）](https://docs.qoder.com/cli/settings-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Qwen Code main 命令文档（`/rewind`、`/restore`、`/doctor rollback` 与文件检查点交互模式默认开启，提交 e39567eb564c）](https://github.com/QwenLM/qwen-code/blob/e39567eb564cf5473dc703b25b219c66059fcb1b/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Kimi Code Slash 命令表（`/undo [<count>]` 行、「随时可用」列为「否」与空闲限制提示，提交 25dd4ce97345）](https://github.com/MoonshotAI/kimi-code/blob/25dd4ce97345c7ebfd9c036898e5eef955c45ea8/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Undo and Restore（`/rewind` 检查点、三种恢复范围与影响预览）](https://docs.qoder.com/cli/undo-restore)
- [Qoder CLI 设置、环境变量与文件路径参考（未列出 `security.crossSessionInbound` 与 `general.dialogExpiry`）](https://docs.qoder.com/cli/settings-reference)

## 关联能力

- [恢复会话](./cmd-resume.md)
- [查看 Diff](./cmd-diff.md)
- [检查点与回退](../sessions/session-checkpoint.md)
