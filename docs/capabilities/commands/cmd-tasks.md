# 任务列表

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-tasks)

> 核对日期：2026-08-13

## 定义

查看和控制当前会话中的后台 Shell、Subagent、Workflow 或其他长时间任务。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/tasks`、`/background [prompt]` | 官方确认 |
| Codex | `/ps`、`/stop` | 官方确认 |
| Qwen Code | `/tasks`、`/workflows p <runId>` | 源码确认 |
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
2. Qwen Code `/tasks` 输出文本摘要，交互式任务对话框从底部状态入口打开；v0.21.8 起 Workflows 开启时，对话框内按 `p` 或用 `/workflows p <runId>` 可协作暂停/恢复后台 Workflow 运行。
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
| 主命令 | `/tasks`、`/workflows p <runId>` |
| 别名 | 无公开别名 |
| 参数 | `/workflows p <runId>` 接收运行中的 Workflow runId；参数缺失报 `Usage: /workflows p <runId>`，runId 未知或状态不符各有错误提示 |
| 执行行为 | 输出后台任务文本列表；交互式 Background Tasks 对话框中按 `p` 协作暂停或恢复选中的后台 Workflow 运行：暂停后不再启动新 Agent，已派发的 Agent 继续运行到收敛，Agent 调用之间的脚本代码继续执行，恢复后释放暂存结果并继续队列派发。`/workflows p <runId>` 在 TUI 提供同样的进程内控制，运行状态在 running、pausing、paused 之间迁移。 |
| 可用模式 | `/tasks` 支持交互式、非交互式、ACP；Workflow 暂停/恢复控制仅交互式 TUI，`-p` 与 ACP 报“Workflow pause controls are available only in the interactive TUI.” |
| 保存范围 | 任务状态属于当前会话；Workflow 暂停状态只保留在当前进程，重启不保留 |
| 条件与边界 | Workflow 暂停只作用于后台运行，前台 Workflow 运行报“Foreground workflow runs cannot be paused or resumed”；pausing 阶段不能撤销暂停，只能等待收敛或停止运行；`/workflows` 只在 `QWEN_CODE_ENABLE_WORKFLOWS=1` 启用 Workflows 时注册 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)、[Qwen Code /workflows pause/resume command docs](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/docs/users/features/commands.md)、[Qwen Code Background Tasks keyboard shortcuts](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/docs/users/reference/keyboard-shortcuts.md)、[Qwen Code workflows command source](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/packages/cli/src/ui/commands/workflowsCommand.ts)、[Qwen Code v0.21.8 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.8) |

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
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md) |

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
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Qwen Code /workflows pause/resume command docs](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/docs/users/features/commands.md)
- [Qwen Code Background Tasks keyboard shortcuts](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/docs/users/reference/keyboard-shortcuts.md)
- [Qwen Code workflows command source](https://github.com/QwenLM/qwen-code/blob/88a325bce9dbdbfafe0d5dc6e4667b4c2942818b/packages/cli/src/ui/commands/workflowsCommand.ts)
- [Qwen Code v0.21.8 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.8)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [目标管理](./cmd-goal.md)
- [后台与并行](../subagents/agent-background.md)
- 后台任务：见对应能力矩阵
- [自定义命令](./cmd-custom.md)
