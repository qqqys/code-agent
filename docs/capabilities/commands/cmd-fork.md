# 分支会话

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-fork)

> 核对日期：2026-08-19

## 定义

复制当前对话的历史状态，形成后续互不影响的会话分支或后台会话。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/branch [name]`、`/fork [prompt]` | 官方确认 |
| Codex | `/fork` | 官方确认 |
| Qwen Code | `/branch`、`/fork <directive>` | 源码确认 |
| Kimi Code | `/fork` | 条件项 |
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

1. 同名 `/fork` 的运行方式并不一致：Claude Code 复制到后台会话，Codex 创建新的聊天分支，Kimi Code 创建独立副本但不切换。
2. Claude Code `/branch` 会切换到新分支，`/fork` 则保留当前会话继续工作。
3. Qwen Code `/branch` 创建会话分支；`/fork` 创建继承完整对话的后台 Agent。
4. Kimi Code 0.33.0 起 `/fork` 后停留在原会话；此前版本 fork 后立即切换到派生会话并关闭原会话。
5. Kimi Code `/fork` 完成后还会打印可在新终端进程进入 fork 的 `kimi --resume` 命令并复制到剪贴板（条件：main 分支，尚未发布）。

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
| 执行行为 | 基于当前会话派生保留完整对话历史的独立副本；fork 后停留在原会话，原会话后台任务继续运行，副本可随时通过 `/sessions` 打开。fork 完成后打印可在新终端进程进入派生会话的 `kimi --resume` 命令（Windows 用 `pushd` 代替 `cd`），并复制到剪贴板（条件：main 分支，尚未发布）。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 派生副本独立保存；副本在打开前不占用运行时会话 |
| 条件与边界 | 仅空闲时使用；0.33.0 起不再切换到派生会话，此前版本 fork 后立即切换并关闭原会话；0.36.1 起在回合运行中 fork 会报错 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)、[Kimi Code /fork stay-in-session commit](https://github.com/MoonshotAI/kimi-code/commit/54c04bf03ddbeb46d02b2edb460ea091ae194509)、[Kimi Code /fork resume command print commit](https://github.com/MoonshotAI/kimi-code/commit/6b72345f8bb03487e3bcc05b541e65484818428c)、[Kimi Code 0.36.1 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.1) |

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
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Kimi Code /fork stay-in-session commit](https://github.com/MoonshotAI/kimi-code/commit/54c04bf03ddbeb46d02b2edb460ea091ae194509)
- [Kimi Code /fork resume command print commit](https://github.com/MoonshotAI/kimi-code/commit/6b72345f8bb03487e3bcc05b541e65484818428c)
- [Kimi Code 0.36.1 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.1)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [恢复会话](./cmd-resume.md)
- [初始上下文](../subagents/agent-initial-context.md)
- [新会话](./cmd-new.md)
