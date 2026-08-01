# 分支会话

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-fork)

> 核对日期：2026-08-01

## 定义

复制当前对话的历史状态，形成后续互不影响的会话分支或后台会话。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/branch [name]`、`/fork [prompt]` | 官方确认 |
| Codex | `/fork` | 官方确认 |
| Qwen Code | `/branch`、`/fork <directive>` | 源码确认 |
| Kimi Code | `/fork` | 官方确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- 会话分支
- 上下文复制范围
- 是否切换到新分支
- 是否后台运行

### 本页不包含

- Git 分支创建
- Subagent 的独立任务上下文
- 文件检查点恢复

## 跨产品事实

1. 同名 `/fork` 的运行方式并不一致：Claude Code 复制到后台会话，Codex 与 Kimi Code 创建新会话。
2. Claude Code `/branch` 会切换到新分支，`/fork` 则保留当前会话继续工作。
3. Qwen Code `/branch` 创建会话分支；`/fork` 创建继承完整对话的后台 Agent。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/branch [name]`、`/fork [prompt]` |
| 别名 | 无公开别名 |
| 参数 | `/branch [name]`；`/fork [prompt]` |
| 执行行为 | `/branch` 创建并切换会话分支；`/fork` 复制到独立后台会话而当前会话继续运行。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 新会话独立保存 |
| 条件与边界 | `/fork` 当前行为需要 2.1.212+，关闭 agent view 时行为可能不同 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/fork` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 把当前聊天复制成一个新的聊天分支。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 新会话独立保存 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/branch`、`/fork <directive>` |
| 别名 | 无公开别名 |
| 参数 | `/fork <directive>` |
| 执行行为 | `/branch` 创建新会话；`/fork` 生成继承完整对话的后台 Agent。 |
| 可用模式 | `/fork` 仅交互式 |
| 保存范围 | 会话分支和 Fork Agent 独立保存 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/fork` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 基于当前会话创建新会话，并保留完整对话历史。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 新会话独立保存 |
| 条件与边界 | 仅空闲时使用 |
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

- [恢复会话](./cmd-resume.md)
- [初始上下文](../subagents/agent-initial-context.md)
- [新会话](./cmd-new.md)
