# 初始上下文

[返回 Subagent 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=agent-initial-context)

> 核对日期：2026-08-24

## 定义

Subagent 启动时收到的任务、系统提示词、父会话历史和环境信息范围。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | 任务描述；可预载 Skills；Fork 继承完整对话与提示词缓存（v2.1.232 起交互会话默认开启） | 官方确认 |
| Codex | 父任务与委派描述 | 官方确认 |
| Qwen Code | 命名 Agent 接收任务提示；Fork 可继承最近若干轮或全部 | 源码确认 |
| Kimi Code | 只接收任务提示；条件：实验开关开启后 `fork` 参数以调用方对话快照启动（`KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK`，v2 引擎，合入 main 尚未发布） | 条件项 |
| Qoder CLI | 任务提示；可设 `initialPrompt` | 官方确认 |

## 比较边界

### 本页包含

- 任务描述
- 父会话历史继承
- 预加载指令

### 本页不包含

- 执行后的结果
- 持久记忆目录
- 工具权限

## 跨产品事实

1. 命名 Agent 通常以任务描述和自身系统提示词启动，不自动复制完整父会话。
2. Claude Code 自 v2.1.232 起在交互会话默认开启 Fork 模式：Fork 继承派生时刻的完整父对话并共享主会话提示词缓存；`-p` 非交互与 Agent SDK 默认关闭。
3. Qwen Code Fork 可继承全部父历史或最近若干个真实用户轮次。
4. Kimi Code 在 v2 引擎合入实验性 `fork` 参数（合入 main 尚未发布）：`Agent`/`AgentSwarm` 传 `fork: true` 时以调用方对话历史快照启动子 Agent，需 `KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK` 等实验开关。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 任务描述；可预载 Skills；Fork 继承完整对话与提示词缓存（v2.1.232 起交互会话默认开启） |
| 入口与配置 | 自然语言自动委派或点名；定义文件位于 Agent 目录，也可用 `--agents` 临时注入、用 `--agent` 作为会话主 Agent。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Subagent 系统提示词。 |
| 具体行为 | 命名 Subagent 从 Claude 撰写的委派任务摘要、自身定义的系统提示词和基础环境信息启动，不复制完整 Claude Code 系统提示词。Claude 也可通过 Agent 工具请求 `fork` 类型派生 Fork，用户可用 `/subtask` 加任务直接启动 Fork（不受 Fork 模式开关限制）；Fork 自身的工具调用不进入主会话，只有最终结果作为消息返回主会话。 |
| 作用域 | 组织托管、当前进程、项目、用户、插件五级来源；同名定义按官方优先级解析。 |
| 上下文与继承 | 命名 Subagent 使用独立上下文。Fork 继承派生时刻主会话的全部对话，系统提示词、工具与模型和主会话相同，首个请求复用主会话提示词缓存。 |
| 工作区隔离 | 默认从主会话当前目录工作；`isolation: worktree` 可创建临时 Git Worktree。 |
| 运行限制 | 可配置 `maxTurns`；官方 Subagent 字段表未列出单 Agent 超时字段。 |
| 条件与边界 | 插件分发的 Agent 会忽略 `hooks`、`mcpServers`、`permissionMode`。Fork 模式在交互会话默认开启（v2.1.232 起），`-p` 非交互与 Agent SDK 默认关闭；`CLAUDE_CODE_FORK_SUBAGENT=1` 对非交互与 SDK 也开启，`=0` 在所有会话类型关闭。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)、[Claude Code v2.1.232 changelog (subagent forking by default)](https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 父任务与委派描述 |
| 入口与配置 | 直接要求 Codex 委派，或由项目指令、Skill 触发；CLI 用 `/agent` 查看和切换线程。 |
| 定义格式 | 独立 TOML 文件；`name`、`description`、`developer_instructions` 为核心字段。 |
| 具体行为 | 父线程提供委派描述，并由 Agent 文件的 `developer_instructions` 定义角色行为。 |
| 作用域 | 项目级 `.codex/agents/` 与用户级 `~/.codex/agents/`；同名自定义 Agent 可覆盖内置定义。 |
| 上下文与继承 | 每个 Subagent 是独立线程；父线程负责委派、跟进、等待、关闭并汇总结果。 |
| 工作区隔离 | 继承父线程当前沙箱与审批策略；当前 Subagent 页面未列出每 Agent Worktree。 |
| 运行限制 | 可配置每会话并发线程数；当前 Agent 文件字段未列出单 Agent 轮数和超时。 |
| 条件与边界 | 父回合的实时沙箱和审批覆盖会在派生时重新应用。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 命名 Agent 接收任务提示；Fork 可继承最近若干轮或全部 |
| 入口与配置 | 使用 `/agents create`、`/agents manage` 管理；模型通过 Agent 工具按类型委派，也可显式点名。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为命名 Agent 的系统提示词。 |
| 具体行为 | 命名 Agent 从任务提示和自身系统提示词开始；Fork 用 `fork_turns` 选择全部或最近若干轮。 |
| 作用域 | 项目级 `.qwen/agents/`、用户级 `~/.qwen/agents/`、扩展 `agents/` 与内置定义。 |
| 上下文与继承 | 命名 Agent 从新上下文开始；Fork 继承父会话全部或最近若干个真实用户轮次。 |
| 工作区隔离 | Agent 调用可传 `isolation: "worktree"`；Fork 与 Worktree 隔离互斥。 |
| 运行限制 | 支持 `maxTurns`；配置只对超长 description 和系统提示词给软警告，未列出超时字段。 |
| 条件与边界 | `hooks` v1 在 Agent 运行期间按会话注册；`effort`、`skills`、`memory` 等 frontmatter 尚未落地。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 只接收任务提示；条件：实验开关开启后 `fork` 参数以调用方对话快照启动（`KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK`，v2 引擎，合入 main 尚未发布） |
| 入口与配置 | 主 Agent 依据描述自动派发，也可在提示词中点名；`--agent-file` 可在启动时显式加载定义。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Agent 系统提示词模板。 |
| 具体行为 | 默认子 Agent 只接收主 Agent 给出的任务描述和自身 profile，不继承完整主历史。v2 引擎合入实验性 `fork` 参数：`Agent` 与 `AgentSwarm` 传 `fork: true` 时，子 Agent 以调用方已完成对话的一次性快照启动，继承调用方的 Agent 类型、工具集与模型，提示词只需任务本身；快照中仍在执行的工具调用会补一条合成结果，注明结果未知、不要假设成败也不要等待。 |
| 作用域 | 显式文件、项目、额外目录、用户、Plugin、内置六级来源；更具体的作用域优先。 |
| 上下文与继承 | 默认只接收任务描述。`fork: true` 继承调用方对话历史快照，快照是一次性参考资料，新 Agent 独立运行而不是调用方的续写；`resume` 不能与 `fork` 同时使用，`subagent_type` 必须与调用方自身类型一致，`model` 只接受调用方自身模型或 `primary`，其余取值会被拒绝。 |
| 工作区隔离 | 当前 Agent 文档未列出每 Agent Worktree 隔离字段。 |
| 运行限制 | 全局 `[subagent] timeout_ms` 限制单个 Agent 或 AgentSwarm 运行时间，默认 7200000 ms（2 小时）；Agent 定义 frontmatter 无独立轮数或超时字段。 |
| 条件与边界 | `fork` 为实验功能，默认关闭：需 `KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK=true` 或 config.toml `[experimental]` 下 `subagent_fork = true`，master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1` 也会启用；开关关闭时传 `fork` 报 `fork is disabled: the subagent_fork experimental flag is off.`。仅 v2 引擎（agent-core-v2）实现，合入 main 尚未发布；官方 Agents 文档页尚未同步。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/customization/agents.md)、[Kimi Code subagent and secondary model configuration](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/configuration/config-files.md)、[Kimi Code subagent fork parameter commit](https://github.com/MoonshotAI/kimi-code/commit/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb)、[Kimi Code subagent fork changeset](https://github.com/MoonshotAI/kimi-code/blob/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb/.changeset/subagent-fork-context.md)、[Kimi Code subagent fork environment variable](https://github.com/MoonshotAI/kimi-code/blob/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb/docs/zh/configuration/env-vars.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 任务提示；可设 `initialPrompt` |
| 入口与配置 | TUI 用 `/agents` 管理、自然语言或 `@name` 调用；可用 `--agent` 作为会话 Agent，或用 `--agents` 临时注入。 |
| 定义格式 | 持久定义为 Markdown + YAML；`--agents` 接受当前进程有效的 JSON 对象。 |
| 具体行为 | 普通 Subagent 接收任务描述；`initialPrompt` 只在定义通过 `--agent` 作为会话 Agent 时自动提交。 |
| 作用域 | 内置、用户、项目、插件、命令行 Flag 五类来源；同名时 Flag 优先级最高。 |
| 上下文与继承 | 每个 Subagent 有独立上下文、系统提示词、工具注册表、Transcript 和压缩流程。 |
| 工作区隔离 | `isolation: worktree` 在独立 Git Worktree 中运行；省略时使用默认工作区。 |
| 运行限制 | 支持 `maxTurns` 与 `timeoutMins`，并可在 `settings.json` 中覆盖已发现 Agent 的运行限制。 |
| 条件与边界 | 插件 Agent 会移除 `hooks`、`mcpServers`、`permissionMode`；只保留值为 `worktree` 的 isolation。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code v2.1.232 changelog (subagent forking by default)](https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md)
- [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)
- [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/customization/agents.md)
- [Kimi Code subagent and secondary model configuration](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/configuration/config-files.md)
- [Kimi Code subagent fork parameter commit](https://github.com/MoonshotAI/kimi-code/commit/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb)
- [Kimi Code subagent fork changeset](https://github.com/MoonshotAI/kimi-code/blob/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb/.changeset/subagent-fork-context.md)
- [Kimi Code subagent fork environment variable](https://github.com/MoonshotAI/kimi-code/blob/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb/docs/zh/configuration/env-vars.md)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [独立上下文](./agent-context.md)
- [Agent 预载 Skills](./agent-skills.md)
- [结果回传](./agent-result.md)
