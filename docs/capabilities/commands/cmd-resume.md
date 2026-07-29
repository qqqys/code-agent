# 恢复会话

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-resume)

> 核对日期：2026-07-29

## 定义

从本地或账号会话历史中选择一个已保存会话，并恢复其对话上下文和关联状态。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/resume [session]` | 官方确认 |
| Codex | `/resume` | 官方确认 |
| Qwen Code | `/resume [session]` | 源码确认 |
| Kimi Code | `/sessions` | 官方确认 |
| Qoder CLI | `/resume` | 官方确认 |

## 比较边界

### 本页包含

- 历史选择器
- 按名称或 ID 恢复
- 后台会话限制
- 命令别名

### 本页不包含

- 从当前消息创建分支
- 跨产品导入会话
- 恢复单个文件检查点

## 跨产品事实

1. 五家都提供恢复会话入口。
2. Claude Code 可按 ID 或名称直接恢复；仍在运行的后台会话需从 agent view 管理。
3. Qwen Code `/resume` 只在交互模式提供。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/resume [session]` |
| 别名 | `/continue` |
| 参数 | `[session]` |
| 执行行为 | 按 ID、名称恢复，或不带参数打开会话选择器。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 仍在运行的后台会话不能从普通选择器恢复 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/resume` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 从已保存会话列表继续以前的 CLI 会话。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/resume [session]` |
| 别名 | `/continue` |
| 参数 | 无公开参数 |
| 执行行为 | 恢复先前会话；可接受命令参数进行定位。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/sessions` |
| 别名 | `/resume` |
| 参数 | 无公开参数 |
| 执行行为 | 浏览历史会话并切换或恢复。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 仅空闲时使用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/resume` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 从历史记录恢复以前的对话。 |
| 可用模式 | TUI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [新会话](./cmd-new.md)
- [分支会话](./cmd-fork.md)
- [状态与用量](./cmd-status.md)
