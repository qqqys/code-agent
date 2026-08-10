# 回退或检查点

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-rewind)

> 核对日期：2026-08-10

## 定义

回到当前会话较早的消息或工具调用点，并按产品能力恢复对话、文件或二者。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/rewind` | 官方确认 |
| Codex | 无对应命令 | 未确认 |
| Qwen Code | `/rewind`、`/restore` | 源码确认 |
| Kimi Code | `/undo [count]` | 官方确认 |
| Qoder CLI | 无对应命令 | 未确认 |

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

## 跨产品事实

1. Claude Code 与 Qwen Code 都提供会话回退，但恢复粒度不同。
2. Qwen Code `/restore` 以工具调用为锚点，同时重置对话与文件历史。
3. Kimi Code `/undo` 只撤销最近的用户提示，并受上下文压缩边界限制。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/rewind` |
| 别名 | `/checkpoint`、`/undo` |
| 参数 | 无公开参数 |
| 执行行为 | 从历史消息选择点恢复对话、代码或生成摘要。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 修改当前会话与可选代码状态 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

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
| 参数 | 无公开参数 |
| 执行行为 | `/rewind` 回到以前的对话轮次；`/restore` 恢复指定工具调用时的对话与文件状态。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 修改当前会话和可能的文件状态 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/undo [count]` |
| 别名 | 无公开别名 |
| 参数 | `[count]` |
| 执行行为 | 撤销最近的用户提示；不带 count 打开选择器。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 修改当前会话上下文 |
| 条件与边界 | 不能撤销到最后一次上下文压缩之前 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md) |

### Qoder CLI

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
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [恢复会话](./cmd-resume.md)
- [查看 Diff](./cmd-diff.md)
- [检查点与回退](../sessions/session-checkpoint.md)
