# 计划模式

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-plan)

> 核对日期：2026-08-26

## 定义

切换到先分析和形成执行方案、再进入修改或命令执行的计划模式。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/plan [description]` | 官方确认 |
| Codex | `/plan [prompt]` | 官方确认 |
| Qwen Code | `/plan` | 源码确认 |
| Kimi Code | `/plan [on\|off]`、`/plan clear` | 官方确认 |
| Qoder CLI | `/plan` | 官方确认 |

## 比较边界

### 本页包含

- 进入和退出 Plan 模式
- 可选任务描述
- 清除已有计划
- 权限边界

### 本页不包含

- 长期目标循环
- 普通对话中的计划文本
- Subagent 的 Plan 内置角色

## 跨产品事实

1. 五家 CLI 都提供 `/plan`。
2. Kimi Code 可用 `on|off` 显式设置，并提供 `/plan clear`。
3. Qoder CLI 的 `/plan` 切换 Plan 工作状态；该状态独立于权限模式，可与任意 permission mode 共存。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/plan [description]` |
| 别名 | 无公开别名 |
| 参数 | `[description]` |
| 执行行为 | 进入 Plan 模式；带描述时进入后立即开始分析指定任务。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话模式 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/plan [prompt]` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 切换 Plan 模式，并可同时发送一个计划任务提示。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话模式 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/plan` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 在 Plan 模式与原审批模式之间切换。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 当前会话模式 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/plan [on\|off]`、`/plan clear` |
| 别名 | 无公开别名 |
| 参数 | `on\|off\|clear` |
| 执行行为 | 翻转或显式设置 Plan 模式；`clear` 删除当前计划方案。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话模式和当前计划 |
| 条件与边界 | 单纯切换模式不会创建空计划文件 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/plan` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 切换 Plan 工作状态；Plan 独立于权限模式，可与任意 permission mode 共存。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话工作状态 |
| 条件与边界 | `general.plan.enabled: false` 可禁用；禁用后 `/plan` 不可用，`--permission-mode plan` 回退 `default` |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)

## 关联能力

- [目标管理](./cmd-goal.md)
- [权限设置](./cmd-permissions.md)
- [内置 Agent](../subagents/agent-builtins.md)
