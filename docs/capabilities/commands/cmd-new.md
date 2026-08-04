# 新会话

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-new)

> 核对日期：2026-08-04

## 定义

在不退出 CLI 进程的情况下结束当前对话上下文并开始一个空白会话。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/clear [name]` | 官方确认 |
| Codex | `/new`、`/clear` | 官方确认 |
| Qwen Code | `/clear` | 源码确认 |
| Kimi Code | `/new` | 官方确认 |
| Qoder CLI | `/clear` | 官方确认 |

## 比较边界

### 本页包含

- 清空上下文
- 保留或命名前一会话
- 命令别名
- 是否退出 CLI

### 本页不包含

- 压缩当前上下文
- 删除历史会话
- 清空终端显示但保留对话

## 跨产品事实

1. 五家都有新会话或清空会话命令。
2. Claude Code 可在清空时给上一会话命名。
3. Kimi Code 的 `/new` 只在空闲状态执行，并明确丢弃当前上下文。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/clear [name]` |
| 别名 | `/reset`、`/new` |
| 参数 | `[name]` |
| 执行行为 | 创建空上下文的新对话；可用 name 标记上一会话。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 上一会话仍可通过 `/resume` 恢复 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/new`、`/clear` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 在当前 CLI 中开始新会话；`/clear` 同时清理终端显示和聊天上下文。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 已保存会话仍可恢复 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/clear` |
| 别名 | `/reset`、`/new` |
| 参数 | 无公开参数 |
| 执行行为 | 清空对话历史并释放上下文。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/new` |
| 别名 | `/clear` |
| 参数 | 无公开参数 |
| 执行行为 | 开始全新会话并丢弃当前上下文。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 仅空闲时使用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/clear` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 清空会话历史并释放上下文。 |
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

- [恢复会话](./cmd-resume.md)
- [压缩上下文](./cmd-compact.md)
- [分支会话](./cmd-fork.md)
