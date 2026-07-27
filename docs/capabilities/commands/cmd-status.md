# 状态与用量

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-status)

> 核对日期：2026-07-27

## 定义

显示当前会话的模型、账号、连接、上下文、用量、配置或版本信息。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/status`、`/usage` | 官方确认 |
| Codex | `/status`、`/usage` | 官方确认 |
| Qwen Code | `/status`、`/stats [model\|tools\|skills\|daily\|monthly\|export]` | 源码确认 |
| Kimi Code | `/status`、`/usage`、`/version` | 官方确认 |
| Qoder CLI | `/status`、`/usage`、`/context-window` | 官方确认 |

## 比较边界

### 本页包含

- 会话状态
- 用量统计
- 上下文占用
- 版本和连接信息

### 本页不包含

- 后台任务列表
- 调试日志内容
- 账单和价格对比

## 跨产品事实

1. 五家都有状态入口，但展示内容不同。
2. Qwen Code `/stats` 提供 model、tools、skills、daily、monthly、export 子命令。
3. Qoder CLI 将 context window 配置与 usage 分成独立命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/status`、`/usage` |
| 别名 | `/stats`、`/cost` |
| 参数 | 无公开参数 |
| 执行行为 | `/status` 显示版本、模型、账号和连接；`/usage` 显示用量，`/stats` 是其别名。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 只读 |
| 条件与边界 | 这些状态命令可在 Claude 正在响应时立即执行 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/status`、`/usage` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 显示会话模型、审批策略、可写根、剩余上下文和账号用量。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 只读 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/status`、`/stats [model\|tools\|skills\|daily\|monthly\|export]` |
| 别名 | `/about`、`/usage` |
| 参数 | 无公开参数 |
| 执行行为 | 显示运行状态和多维使用统计。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 只读；export 子命令可写统计文件 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code command source](https://github.com/QwenLM/qwen-code/tree/main/packages/cli/src/ui/commands) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/status`、`/usage`、`/version` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 分别显示会话状态、用量和版本。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 只读 |
| 条件与边界 | 流式输出期间可使用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/status`、`/usage`、`/context-window` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 显示 CLI 状态、套餐用量，并查看或设置当前模型上下文窗口。 |
| 可用模式 | TUI |
| 保存范围 | 状态和用量只读；context-window 可修改模型设置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code command source](https://github.com/QwenLM/qwen-code/tree/main/packages/cli/src/ui/commands)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [选择模型](./cmd-model.md)
- [推理强度](./cmd-effort.md)
- [任务列表](./cmd-tasks.md)
