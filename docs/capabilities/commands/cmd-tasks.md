# 任务列表

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-tasks)

> 核对日期：2026-07-27

## 定义

查看和控制当前会话中的后台 Shell、Subagent、Workflow 或其他长时间任务。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/tasks`、`/background [prompt]` | 官方确认 |
| Codex | `/ps`、`/stop` | 官方确认 |
| Qwen Code | `/tasks` | 源码确认 |
| Kimi Code | `/tasks` | 官方确认 |
| Qoder CLI | `/tasks` | 官方确认 |

## 比较边界

### 本页包含

- 后台任务列表
- 最近输出
- 停止任务
- 不同后台任务类型

### 本页不包含

- 历史会话列表
- 长期目标状态
- 云端仓库任务的完整管理

## 跨产品事实

1. 五家都提供后台任务相关入口，但 Codex 使用 `/ps` 和 `/stop`。
2. Qwen Code `/tasks` 输出文本摘要，交互式任务对话框从底部状态入口打开。
3. Claude Code 的任务列表包含已完成的后台 Subagent。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/tasks`、`/background [prompt]` |
| 别名 | `/bg` |
| 参数 | 无公开参数 |
| 执行行为 | 列出当前会话后台任务；可将整个会话转为后台 Agent。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 后台会话可在 `claude agents` 中继续管理 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/ps`、`/stop` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 显示后台终端及最近输出；`/stop` 停止当前会话的全部后台终端。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/tasks` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 输出后台任务文本列表；交互式对话框提供更完整的任务控制。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 当前会话 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code command source](https://github.com/QwenLM/qwen-code/tree/main/packages/cli/src/ui/commands) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/tasks` |
| 别名 | `/task` |
| 参数 | 无公开参数 |
| 执行行为 | 浏览后台任务列表。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 流式输出期间也可使用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/tasks` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 列出并管理后台任务。 |
| 可用模式 | TUI |
| 保存范围 | 仅影响当前会话或当前操作 |
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

- [目标管理](./cmd-goal.md)
- [后台与并行](../subagents/agent-background.md)
- 后台任务：见对应能力矩阵
