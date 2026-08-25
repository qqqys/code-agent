# 嵌套派生

[返回 Subagent 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=agent-nesting)

> 核对日期：2026-08-25

## 定义

一个 Subagent 是否还能派生下一层 Agent，以及如何限定可派生的类型。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | 默认最多 3 层；可限制可派生 Agent | 官方确认 |
| Codex | 当前 Subagent 页面未确认 | 未确认 |
| Qwen Code | 命名 Agent 受工具规则控制；Fork 禁止递归 Fork | 源码确认 |
| Kimi Code | 内置 `coder` 默认不可嵌套（0.35.0 起移除 `Agent`/`AgentSwarm`）；自定义 Agent 用 `subagents`，显式列 `Agent` 工具可恢复 | 官方确认 |
| Qoder CLI | Agent 工具可嵌套并支持 `Agent(name)` | 官方确认 |

## 比较边界

### 本页包含

- 嵌套派生
- 深度上限
- Agent 类型 allowlist

### 本页不包含

- 父会话并行
- Agent Team 通信
- 普通任务列表

## 跨产品事实

1. Claude Code、Qwen Code 命名 Agent 与 Qoder CLI 存在嵌套派生路径；Kimi Code 自 0.35.0 起内置 coder 默认不再派生，自定义 profile 显式列出 `Agent`/`AgentSwarm` 工具可恢复。
2. Qwen Code Fork 明确禁止递归 Fork；Codex 当前 Subagent 页面未确认嵌套规则。
3. Kimi Code 官方 Agents 文档页（main 分支）仍写内置 coder 可派发嵌套子 Agent，与 0.35.0 Release 说明及仓库 profile 代码不一致；本矩阵以 Release 说明与代码为准。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 默认最多 3 层；可限制可派生 Agent |
| 入口与配置 | 自然语言自动委派或点名；定义文件位于 Agent 目录，也可用 `--agents` 临时注入、用 `--agent` 作为会话主 Agent。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Subagent 系统提示词。 |
| 具体行为 | 默认允许向下派生，最多到主会话下三层；`Agent(name)` 与工具规则可限制下级类型。 |
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
| 矩阵结论 | 当前 Subagent 页面未确认 |
| 入口与配置 | 直接要求 Codex 委派，或由项目指令、Skill 触发；CLI 用 `/agent` 查看和切换线程。 |
| 定义格式 | 独立 TOML 文件；`name`、`description`、`developer_instructions` 为核心字段。 |
| 具体行为 | 当前 Subagent 页面说明父线程负责编排，但未列出子线程继续派生的公开规则。 |
| 作用域 | 项目级 `.codex/agents/` 与用户级 `~/.codex/agents/`；同名自定义 Agent 可覆盖内置定义。 |
| 上下文与继承 | 每个 Subagent 是独立线程；父线程负责委派、跟进、等待、关闭并汇总结果。 |
| 工作区隔离 | 继承父线程当前沙箱与审批策略；当前 Subagent 页面未列出每 Agent Worktree。 |
| 运行限制 | 可配置每会话并发线程数；当前 Agent 文件字段未列出单 Agent 轮数和超时。 |
| 条件与边界 | 父回合的实时沙箱和审批覆盖会在派生时重新应用。 |
| 证据状态 | 未确认 |
| 来源 | [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 命名 Agent 受工具规则控制；Fork 禁止递归 Fork |
| 入口与配置 | 使用 `/agents create`、`/agents manage` 管理；模型通过 Agent 工具按类型委派，也可显式点名。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为命名 Agent 的系统提示词。 |
| 具体行为 | 普通命名 Agent 是否可派生取决于 Agent 工具是否可用；Fork 在运行时禁止再创建 Fork。 |
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
| 矩阵结论 | 内置 `coder` 默认不可嵌套（0.35.0 起移除 `Agent`/`AgentSwarm`）；自定义 Agent 用 `subagents`，显式列 `Agent` 工具可恢复 |
| 入口与配置 | 主 Agent 依据描述自动派发，也可在提示词中点名；`--agent-file` 可在启动时显式加载定义。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Agent 系统提示词模板。 |
| 具体行为 | 0.35.0 起内置 coder profile（v1 与 v2 引擎）移除 `Agent` 与 `AgentSwarm` 工具，coder 子 Agent 默认不能再派生；主 Agent 保留这两个工具，默认会话仍可委派。自定义 Agent 用 `subagents` 指定允许委派的类型，派发前仍会强制校验；自定义 profile 在 `tools` 显式列出 `Agent`/`AgentSwarm` 可恢复嵌套。 |
| 作用域 | 显式文件、项目、额外目录、用户、Plugin、内置六级来源；更具体的作用域优先。 |
| 上下文与继承 | 子 Agent 只接收任务描述，在独立上下文中工作，最后把完整结果返回主 Agent。 |
| 工作区隔离 | 当前 Agent 文档未列出每 Agent Worktree 隔离字段。 |
| 运行限制 | 全局 `[subagent] timeout_ms` 限制单个 Agent 或 AgentSwarm 运行时间，默认 7200000 ms（2 小时）；main 分支起 AgentSwarm 改用独立 `[swarm] timeout_ms`（默认同为 7200000 ms、`0` 无超时，`KIMI_CODE_SWARM_TIMEOUT_MS` 覆盖），尚未发布；Agent 定义 frontmatter 无独立轮数或超时字段。 |
| 条件与边界 | Subagent 模型池为实验性功能，需 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1` 开启；开启后所有启动模式（包括 TUI）生效。官方 Agents 文档页（2026-08-13 核对的提交）仍写内置 coder 可继续派发嵌套子 Agent，尚未同步 coder 默认工具变化。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/customization/agents.md)、[Kimi Code subagent and secondary model configuration](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/configuration/config-files.md)、[Kimi Code coder profile Agent tool removal commit](https://github.com/MoonshotAI/kimi-code/commit/101c4d199746bf2ed4f26375b65a6fcb6cba2a60)、[Kimi Code coder profile Agent tool removal changeset](https://github.com/MoonshotAI/kimi-code/blob/101c4d199746bf2ed4f26375b65a6fcb6cba2a60/.changeset/v2-profile-drop-agent-tools.md)、[Kimi Code 0.35.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.35.0) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Agent 工具可嵌套并支持 `Agent(name)` |
| 入口与配置 | TUI 用 `/agents` 管理、自然语言或 `@name` 调用；可用 `--agent` 作为会话 Agent，或用 `--agents` 临时注入。 |
| 定义格式 | 持久定义为 Markdown + YAML；`--agents` 接受当前进程有效的 JSON 对象。 |
| 具体行为 | 允许 Agent 工具继续派生；`Agent(name)` 限定类型，`disallowedTools: [Agent]` 完全关闭。 |
| 作用域 | 内置、用户、项目、插件、命令行 Flag 五类来源；同名时 Flag 优先级最高。 |
| 上下文与继承 | 每个 Subagent 有独立上下文、系统提示词、工具注册表、Transcript 和压缩流程。 |
| 工作区隔离 | `isolation: worktree` 在独立 Git Worktree 中运行；省略时使用默认工作区。 |
| 运行限制 | 支持 `maxTurns` 与 `timeoutMins`，并可在 `settings.json` 中覆盖已发现 Agent 的运行限制。 |
| 条件与边界 | 插件 Agent 会移除 `hooks`、`mcpServers`、`permissionMode`；只保留值为 `worktree` 的 isolation。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)
- [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/customization/agents.md)
- [Kimi Code subagent and secondary model configuration](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/configuration/config-files.md)
- [Kimi Code coder profile Agent tool removal commit](https://github.com/MoonshotAI/kimi-code/commit/101c4d199746bf2ed4f26375b65a6fcb6cba2a60)
- [Kimi Code coder profile Agent tool removal changeset](https://github.com/MoonshotAI/kimi-code/blob/101c4d199746bf2ed4f26375b65a6fcb6cba2a60/.changeset/v2-profile-drop-agent-tools.md)
- [Kimi Code 0.35.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.35.0)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [工具白名单](./agent-tools.md)
- [工具黑名单](./agent-deny-tools.md)
- [后台与并行](./agent-background.md)
