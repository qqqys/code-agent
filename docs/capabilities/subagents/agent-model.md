# Agent 单独选模型

[返回 Subagent 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=agent-model)

> 核对日期：2026-07-29

## 定义

为单个 Agent 指定不同于主会话的模型、模型别名或模型选择策略。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `model` | 官方确认 |
| Codex | `model` | 官方确认 |
| Qwen Code | `model`: inherit · fast · modelId · authType:modelId | 源码确认 |
| Kimi Code | `model_preference` | 官方确认 |
| Qoder CLI | `model` | 官方确认 |

## 比较边界

### 本页包含

- 模型字段
- 继承主模型
- 跨 Provider 或主/备模型策略

### 本页不包含

- 推理强度
- 模型价格
- 全局默认模型

## 跨产品事实

1. 五家都提供某种 Agent 级模型选择，但字段取值与生效 Surface 不同。
2. 省略模型字段时，Claude Code、Codex、Qwen Code 与 Qoder CLI 都有继承主会话模型的路径。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model` |
| 入口与配置 | 自然语言自动委派或点名；定义文件位于 Agent 目录，也可用 `--agents` 临时注入、用 `--agent` 作为会话主 Agent。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Subagent 系统提示词。 |
| 具体行为 | `model` 接受模型别名、完整模型 ID 或 `inherit`；环境变量和每次调用参数可覆盖文件值。 |
| 作用域 | 组织托管、当前进程、项目、用户、插件五级来源；同名定义按官方优先级解析。 |
| 上下文与继承 | 命名 Subagent 使用独立上下文；接收自身系统提示词、基础环境信息和父 Agent 给出的任务。 |
| 工作区隔离 | 默认从主会话当前目录工作；`isolation: worktree` 可创建临时 Git Worktree。 |
| 运行限制 | 可配置 `maxTurns`；官方 Subagent 字段表未列出单 Agent 超时字段。 |
| 条件与边界 | 插件分发的 Agent 会忽略 `hooks`、`mcpServers`、`permissionMode`。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model` |
| 入口与配置 | 直接要求 Codex 委派，或由项目指令、Skill 触发；CLI 用 `/agent` 查看和切换线程。 |
| 定义格式 | 独立 TOML 文件；`name`、`description`、`developer_instructions` 为核心字段。 |
| 具体行为 | Agent TOML 可设置任意受支持的 `model`，显式 spawn 值还能覆盖默认 Subagent 模型。 |
| 作用域 | 项目级 `.codex/agents/` 与用户级 `~/.codex/agents/`；同名自定义 Agent 可覆盖内置定义。 |
| 上下文与继承 | 每个 Subagent 是独立线程；父线程负责委派、跟进、等待、关闭并汇总结果。 |
| 工作区隔离 | 继承父线程当前沙箱与审批策略；当前 Subagent 页面未列出每 Agent Worktree。 |
| 运行限制 | 可配置每会话并发线程数；当前 Agent 文件字段未列出单 Agent 轮数和超时。 |
| 条件与边界 | 父回合的实时沙箱和审批覆盖会在派生时重新应用。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Subagents](https://developers.openai.com/codex/subagents) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model`: inherit · fast · modelId · authType:modelId |
| 入口与配置 | 使用 `/agents create`、`/agents manage` 管理；模型通过 Agent 工具按类型委派，也可显式点名。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为命名 Agent 的系统提示词。 |
| 具体行为 | `model` 支持 `inherit`、`fast`、模型 ID、`authType:modelId` 和受控模型 grade。 |
| 作用域 | 项目级 `.qwen/agents/`、用户级 `~/.qwen/agents/`、扩展 `agents/` 与内置定义。 |
| 上下文与继承 | 命名 Agent 从新上下文开始；Fork 继承父会话全部或最近若干个真实用户轮次。 |
| 工作区隔离 | Agent 调用可传 `isolation: "worktree"`；Fork 与 Worktree 隔离互斥。 |
| 运行限制 | 支持 `maxTurns`；配置只对超长 description 和系统提示词给软警告，未列出超时字段。 |
| 条件与边界 | `hooks` v1 在 Agent 运行期间按会话注册；`effort`、`skills`、`memory` 等 frontmatter 尚未落地。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sub-agents.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model_preference` |
| 入口与配置 | 主 Agent 依据描述自动派发，也可在提示词中点名；`--agent-file` 可在启动时显式加载定义。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Agent 系统提示词模板。 |
| 具体行为 | `model_preference` 只表达 `primary` 或 `secondary` 偏好；工具调用显式 `model` 优先。 |
| 作用域 | 显式文件、项目、额外目录、用户、内置五级来源；更具体的作用域优先。 |
| 上下文与继承 | 子 Agent 只接收任务描述，在独立上下文中工作，最后把完整结果返回主 Agent。 |
| 工作区隔离 | 当前 Agent 文档未列出每 Agent Worktree 隔离字段。 |
| 运行限制 | 全局 `[subagent] timeout_ms` 限制单个 Agent 或 AgentSwarm 运行时间，默认 7200000 ms（2 小时）；Agent 定义 frontmatter 无独立轮数或超时字段。 |
| 条件与边界 | `model_preference` 只在次主力模型实验功能开启的 Web 或实验 Headless 路径生效，TUI 忽略。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/customization/agents.md)、[Kimi Code subagent timeout configuration](https://github.com/MoonshotAI/kimi-code/blob/16c7189bd54a/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model` |
| 入口与配置 | TUI 用 `/agents` 管理、自然语言或 `@name` 调用；可用 `--agent` 作为会话 Agent，或用 `--agents` 临时注入。 |
| 定义格式 | 持久定义为 Markdown + YAML；`--agents` 接受当前进程有效的 JSON 对象。 |
| 具体行为 | `model` 接受具体模型或 `inherit`、`auto`、`lite`、`efficient`、`performance` 等别名。 |
| 作用域 | 内置、用户、项目、插件、命令行 Flag 五类来源；同名时 Flag 优先级最高。 |
| 上下文与继承 | 每个 Subagent 有独立上下文、系统提示词、工具注册表、Transcript 和压缩流程。 |
| 工作区隔离 | `isolation: worktree` 在独立 Git Worktree 中运行；省略时使用默认工作区。 |
| 运行限制 | 支持 `maxTurns` 与 `timeoutMins`，并可在 `settings.json` 中覆盖已发现 Agent 的运行限制。 |
| 条件与边界 | 插件 Agent 会移除 `hooks`、`mcpServers`、`permissionMode`；只保留值为 `worktree` 的 isolation。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sub-agents.md)
- [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/customization/agents.md)
- [Kimi Code subagent timeout configuration](https://github.com/MoonshotAI/kimi-code/blob/16c7189bd54a/docs/zh/configuration/config-files.md)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [Agent 推理强度](./agent-effort.md)
- [配置格式](./agent-config.md)
- [模型选择与切换](../models/model-switch.md)
