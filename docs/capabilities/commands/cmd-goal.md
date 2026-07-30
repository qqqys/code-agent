# 目标管理

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-goal)

> 核对日期：2026-07-30

## 定义

保存一个跨多轮持续执行的目标，让 Agent 在每轮结束后根据目标状态决定继续、暂停、完成或阻塞。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/goal [condition\|clear]` | 官方确认 |
| Codex | `/goal` | 官方确认 |
| Qwen Code | `/goal [condition\|clear]` | 源码确认 |
| Kimi Code | `/goal [...]` | 官方确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- 创建和查看目标
- 暂停、恢复、清除或替换
- 后续目标队列
- 非交互退出状态

### 本页不包含

- 一次性任务提示
- 计划模式
- 后台 Shell 进程

## 跨产品事实

1. Claude Code、Codex、Qwen Code 和 Kimi Code 都提供 `/goal`。
2. Kimi Code 公开了 status、pause、resume、cancel、replace、next 等子命令及非交互退出码。
3. Qoder CLI 当前命令目录没有 `/goal`。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/goal [condition\|clear]` |
| 别名 | 无公开别名 |
| 参数 | `condition`；`clear\|stop\|off\|reset\|none\|cancel` 可提前移除 |
| 执行行为 | 设置持续目标；不带参数显示当前或最近完成的目标。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话的持续目标状态 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/goal` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 设置、编辑、暂停、恢复、查看或清除任务目标。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话的持久目标状态 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/goal [condition\|clear]` |
| 别名 | 无公开别名 |
| 参数 | `[condition \| clear]` |
| 执行行为 | 设置目标并持续工作直到满足条件。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 当前会话的目标状态 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/goal [...]` |
| 别名 | 无公开别名 |
| 参数 | `status\|pause\|resume\|cancel\|replace <objective>\|next <objective>\|next manage` |
| 执行行为 | 创建并管理目标模式，支持暂停、恢复、替换、取消和后续目标队列。 |
| 可用模式 | TUI；`kimi -p "/goal ..."` 只支持创建形式 |
| 保存范围 | 目标和后续目标队列保存在当前会话 |
| 条件与边界 | Prompt 模式完成、阻塞、暂停分别使用退出码 0、3、6 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

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
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [计划模式](./cmd-plan.md)
- [任务列表](./cmd-tasks.md)
- [多模型或多代理模式](./cmd-collaboration.md)
