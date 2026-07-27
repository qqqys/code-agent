# 多模型或多代理模式

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-collaboration)

> 核对日期：2026-07-27

## 定义

用多模型、多 Agent 或编排工作流并行处理同一个任务，并汇总、选择或提交各自结果。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/advisor [model\|off]`、`/batch <instruction>` | 官方确认 |
| Codex | `/agent` | 官方确认 |
| Qwen Code | `/arena start`、`/arena status`、`/arena select`、`/arena stop`、`/batch <operation> <file-pattern>` | 源码确认 |
| Kimi Code | `/swarm on\|off`、`/swarm <task>` | 官方确认 |
| Qoder CLI | `/quest` | 官方确认 |

## 比较边界

### 本页包含

- 第二模型顾问
- 并行任务拆分
- 模型竞赛
- Swarm 和工作流编排

### 本页不包含

- 单个 Subagent 管理
- 普通后台 Shell
- 模型质量比较

## 跨产品事实

1. 五家的协作入口语义不同，不能仅按命令名称判断等价。
2. Claude Code `/batch` 会拆分为 5–30 个单元并使用隔离 Worktree。
3. Qwen Code Arena 让多个模型执行同一任务，之后选择一个结果并合并其 Diff。
4. Qwen Code `/batch` 是随产品提供的 Skill：发现文件、分块后使用并行执行 Agent 完成批量操作。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/advisor [model\|off]`、`/batch <instruction>` |
| 别名 | 无公开别名 |
| 参数 | advisor: `opus\|sonnet\|model-id\|off`；batch: `<instruction>` |
| 执行行为 | Advisor 在关键时刻咨询第二模型；Batch 将大型改动拆为并行 Worktree 子任务。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Advisor 为会话设置；Batch 创建后台 Agent、Worktree 和 PR |
| 条件与边界 | Batch 需要 Git 仓库 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/agent` |
| 别名 | `/subagents` |
| 参数 | 无公开参数 |
| 执行行为 | 在并发 Agent 线程之间查看和切换；任务委派由主 Agent、项目指令或 Skill 触发。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Subagents](https://developers.openai.com/codex/subagents) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/arena start`、`/arena status`、`/arena select`、`/arena stop`、`/batch <operation> <file-pattern>` |
| 别名 | `/arena choose` |
| 参数 | Arena 使用相应子命令；Batch 使用 `<operation> <file-pattern>` |
| 执行行为 | Arena 让多个模型执行同一任务并选择结果；随产品提供的 `/batch` Skill 发现匹配文件、分块并交给并行执行 Agent。 |
| 可用模式 | Arena 仅交互式；`/batch` 支持交互式、非交互式和 ACP |
| 保存范围 | Arena 运行属于当前会话；Arena select 和 Batch 任务可修改工作区 |
| 条件与边界 | `/batch` 在 bare mode 或被 Skill/Slash 禁用时不可用 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)、[Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/swarm on\|off`、`/swarm <task>` |
| 别名 | 无公开别名 |
| 参数 | `on\|off\|<task>` |
| 执行行为 | 切换 Swarm 模式，或为单轮任务开启 Swarm 并在成功完成后自动关闭。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 模式属于当前会话 |
| 条件与边界 | manual 权限模式下启动任务会询问是否切换到 auto 或 yolo |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/quest` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 以 Prompt 工作流使用专用 Subagent 引导功能开发。 |
| 可用模式 | TUI 与 Headless |
| 保存范围 | 运行状态属于当前任务 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command)、[Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [Subagent 管理](./cmd-agents.md)
- [后台与并行](../subagents/agent-background.md)
- [Worktree 隔离](../subagents/agent-worktree.md)
