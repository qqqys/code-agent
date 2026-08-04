# Subagent 管理

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-agents)

> 核对日期：2026-08-04

## 定义

在当前 CLI 中查看、创建、切换或重新加载可委派的 Subagent 定义和运行线程。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/agents`、`/subtask` | 官方确认 |
| Codex | `/agent` | 官方确认 |
| Qwen Code | `/agents manage`、`/agents create` | 源码确认 |
| Kimi Code | 无对应命令 | 未确认 |
| Qoder CLI | `/agents`、`/agents reload` | 官方确认 |

## 比较边界

### 本页包含

- Agent 定义管理
- Agent 线程切换
- 创建向导
- 重载 Agent 配置

### 本页不包含

- Subagent 的完整工具和权限矩阵
- 多模型竞赛模式
- 普通后台 Shell

## 跨产品事实

1. 五家的“Agent 管理”入口含义不同：有的管理定义，有的切换运行线程。
2. Claude Code 2.1.198 起 `/agents` 只打印管理指引；创建和编辑通过对话或文件完成。
3. Kimi Code 通过 Agent 配置和 Agent 工具使用 Subagent；`/swarm` 是另一种多代理运行模式。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/agents`、`/subtask` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | `/agents` 提示通过对话或 Agent 文件管理；`/subtask` 创建回传结果的后台 Subagent。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Agent 定义保存在项目或用户目录；Subtask 属于当前会话 |
| 条件与边界 | 2.1.197 及更早版本的 `/agents` 曾提供交互管理界面 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/agent` |
| 别名 | `/subagents` |
| 参数 | 无公开参数 |
| 执行行为 | 查看或切换已生成的 Agent 线程。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 线程属于当前会话 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Subagents](https://developers.openai.com/codex/subagents) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/agents manage`、`/agents create` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 管理已有 Subagent 定义，或通过向导创建新定义。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 定义保存到用户、项目或扩展目录 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)、[Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/079ce5346af7/docs/users/features/sub-agents.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | Agent 通过配置文件和 Agent 工具调用；`/swarm` 不等同于 Agent 定义管理命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/agents`、`/agents reload` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开 Subagent 配置管理；reload 重新读取 Agent 定义。 |
| 可用模式 | TUI |
| 保存范围 | 定义保存在项目、用户、插件或启动参数 scope |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command)、[Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/079ce5346af7/docs/users/features/sub-agents.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [内置 Agent](../subagents/agent-builtins.md)
- [配置格式](../subagents/agent-config.md)
- [多模型或多代理模式](./cmd-collaboration.md)
