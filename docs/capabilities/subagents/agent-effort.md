# Agent 推理强度

[返回 Subagent 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=agent-effort)

> 核对日期：2026-10-08

## 定义

为单个 Agent 覆盖主会话的推理强度、思考档位或推理预算。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `effort`；Agent 工具调用参数 `effort`（v2.1.292） | 官方确认 |
| Codex | `model_reasoning_effort` · `[agents] default_subagent_reasoning_effort` 全局默认 | 官方确认 |
| Qwen Code | 未确认独立字段 | 未确认 |
| Kimi Code | 未确认独立 effort 字段 | 未确认 |
| Qoder CLI | `effort` | 官方确认 |

## 比较边界

### 本页包含

- Agent 级 effort 字段
- 每次调用传入的 effort
- 继承规则与优先级
- 可用取值与模型支持范围
- effort 上限
- 派生 Agent 的全局默认 effort

### 本页不包含

- 模型选择
- 温度
- 会话级 effort 的设置入口

## 跨产品事实

1. Claude Code、Codex 与 Qoder CLI 提供明确的 Agent 级推理强度字段。
2. Claude Code 自 v2.1.292 起在 Agent 工具上增加 `effort` 参数，委派方可为单次派生指定 effort；官方 Subagents 页与模型配置页当前只记录每次调用的 `model` 参数，尚未记录每次调用的 `effort`。
3. Claude Code 的 Agent frontmatter `effort` 覆盖会话 effort，但不覆盖 `CLAUDE_CODE_EFFORT_LEVEL`，且仍受 `maxEffortLevel` 与组织 effort 上限约束。
4. Codex 另有 config.toml 的 `agents.default_subagent_reasoning_effort`，为派生 Agent 设置全局默认推理强度。
5. Qwen Code 和 Kimi Code 当前 Agent 文档未确认独立 effort 字段；Qwen Code 把 `effort` 列为尚未落地的兼容字段，原因是需要模型层参数。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `effort`；Agent 工具调用参数 `effort`（v2.1.292） |
| 入口与配置 | 自然语言自动委派或点名；定义文件位于 Agent 目录，也可用 `--agents` 临时注入、用 `--agent` 作为会话主 Agent。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Subagent 系统提示词。 |
| 具体行为 | frontmatter `effort` 的官方逐字说明为 “Effort level when this subagent is active. Overrides the session effort level, but not the `CLAUDE_CODE_EFFORT_LEVEL` environment variable. Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model”，即覆盖会话 effort、省略时继承会话 effort，但不覆盖该环境变量。官方模型配置页把 Skill 与 Subagent frontmatter 的 `effort` 归为同一机制，写明 frontmatter effort 只在该 Skill 或 Subagent 活动期间生效，且 `maxEffortLevel` 或组织 effort 上限仍然限制其实际运行级别。取值的模型支持范围：Fable 5.1、Fable 5、Opus 5.5、Sonnet 5.5、Opus 5、Sonnet 5、Opus 4.8、Opus 4.7 支持 `low`/`medium`/`high`/`xhigh`/`max`，Opus 4.6 与 Sonnet 4.6 只支持 `low`/`medium`/`high`/`max`；设置模型不支持的级别时回退到不高于该级别的最高受支持级别（官方例子为 `xhigh` 在 Opus 4.6 上按 `high` 运行）。`maxEffortLevel` 需 v2.1.267 及以上，取值 `low`/`medium`/`high`/`xhigh`/`max`（`max` 表示不设上限）、默认未设置，多个作用域都设上限时取最低值因而不能从另一作用域抬高，也可写进 `modelSettings` 的单个模型条目，Claude Code 在每次请求前自行套用因而在 Bedrock、Google Cloud's Agent Platform 与 Microsoft Foundry 上同样生效。v2.1.292 起 Agent 工具增加 `effort` 参数，更新日志（固定到 `fbe20e00e285`）逐字为 “Added an `effort` parameter to the Agent tool, so Claude runs a sub-agent at the effort level you ask for”；该每次调用参数与 frontmatter `effort`、`CLAUDE_CODE_EFFORT_LEVEL`、`maxEffortLevel` 之间的优先级官方文档尚未记录，记为未确认。会话 effort 的解析顺序为 `CLAUDE_CODE_EFFORT_LEVEL`/`--effort`/`/effort` → `modelSettings` 或 `effortLevel` 设置 → 模型默认；`CLAUDE_CODE_EFFORT_LEVEL` 另可取 `auto` 表示用模型默认，且优先于 `--effort`、`/effort`、`modelSettings` 与 `effortLevel`。官方环境变量文档没有 Subagent 专用的 effort 环境变量，官方也未列出 Subagent 全局默认 effort 设置。v2.1.198 起扩展思考配置也继承主会话。 |
| 作用域 | 组织托管、当前进程、项目、用户、插件五级来源；同名定义按官方优先级解析。 |
| 上下文与继承 | 命名 Subagent 使用独立上下文；接收自身系统提示词、基础环境信息和父 Agent 给出的任务。 |
| 工作区隔离 | 默认从主会话当前目录工作；`isolation: worktree` 可创建临时 Git Worktree。 |
| 运行限制 | 可配置 `maxTurns`；官方 Subagent 字段表未列出单 Agent 超时字段。 |
| 条件与边界 | 插件分发的 Agent 会忽略 `hooks`、`mcpServers`、`permissionMode`。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)、[Claude Code model configuration](https://code.claude.com/docs/en/model-config)、[Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code v2.1.292 Agent 工具 `effort` 参数更新日志](https://github.com/anthropics/claude-code/blob/fbe20e00e285/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model_reasoning_effort` · `[agents] default_subagent_reasoning_effort` 全局默认 |
| 入口与配置 | 直接要求 Codex 委派，或由项目指令、Skill 触发；CLI 用 `/agent` 查看和切换线程。 |
| 定义格式 | 独立 TOML 文件；`name`、`description`、`developer_instructions` 为核心字段。 |
| 具体行为 | `model_reasoning_effort` 可写入 Agent TOML；Agent 文件设置 `model` 或 `model_reasoning_effort` 时文件值优先。否则 Codex 按显式 spawn 值、`[agents]` 默认值、父会话值的顺序独立解析，`agents.default_subagent_reasoning_effort` 是派生 Agent 的全局默认，显式 spawn effort 优先于该默认。spawn 切换模型且没有显式或配置的 effort 时，使用该模型的默认 effort；只设 `model` 的 Agent 文件保留此前解析出的 effort。取值：Subagent 页列出 `ultra`、`max`、`xhigh`、`high`、`medium`、`low`；配置参考 `model_reasoning_effort` 条目列出 `minimal \| low \| medium \| high \| xhigh`（Responses API，`xhigh` 依模型而定）。main 分支起 Subagent activity 条目额外记录解析后的 `model` 与 `reasoning_effort`：app-server 协议与 Python SDK 类型把两者作为可空字段，旧记录迁移为 null；v2 多代理 spawn 在子 Agent 启动前捕获启动配置，并按模型元数据解析对外报告的 effort（测试用例把 `ultra` 报告为 `xhigh`）而不改动子 Agent 自身配置的 effort。提交 `b0a6b8d86f45`，合入 main 尚未发布，官方文档未记录。 |
| 作用域 | 项目级 `.codex/agents/` 与用户级 `~/.codex/agents/`；同名自定义 Agent 可覆盖内置定义。 |
| 上下文与继承 | 每个 Subagent 是独立线程；父线程负责委派、跟进、等待、关闭并汇总结果。 |
| 工作区隔离 | 继承父线程当前沙箱与审批策略；当前 Subagent 页面未列出每 Agent Worktree。 |
| 运行限制 | 可配置每会话并发线程数；当前 Agent 文件字段未列出单 Agent 轮数和超时。 |
| 条件与边界 | 父回合的实时沙箱和审批覆盖会在派生时重新应用。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex Subagent activity 记录解析后模型与推理强度的提交](https://github.com/openai/codex/commit/b0a6b8d86f455d3db9dd869fc1178a5fbd865e7f) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 未确认独立字段 |
| 入口与配置 | 使用 `/agents create`、`/agents manage` 管理；模型通过 Agent 工具按类型委派，也可显式点名。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为命名 Agent 的系统提示词。 |
| 具体行为 | 当前 Agent 文档把 `effort` 列为尚未落地的 Claude Code 兼容字段，逐字原因为 “`effort` needs a model-layer parameter”，需模型层参数等前置基础设施后随后续版本引入；已落地的兼容字段表只含 `permissionMode`、`maxTurns`、`color`、`mcpServers`、`hooks`，模型 grade 和 `model` 选择不等同于推理强度。 |
| 作用域 | 项目级 `.qwen/agents/`、用户级 `~/.qwen/agents/`、扩展 `agents/` 与内置定义。 |
| 上下文与继承 | 命名 Agent 从新上下文开始；Fork 继承父会话全部或最近若干个真实用户轮次。 |
| 工作区隔离 | Agent 调用可传 `isolation: "worktree"`；Fork 与 Worktree 隔离互斥。 |
| 运行限制 | 支持 `maxTurns`；配置只对超长 description 和系统提示词给软警告，未列出超时字段。 |
| 条件与边界 | `hooks` v1 在 Agent 运行期间按会话注册；`effort`、`skills`、`memory` 等 frontmatter 尚未落地。 |
| 证据状态 | 未确认 |
| 来源 | [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 未确认独立 effort 字段 |
| 入口与配置 | 主 Agent 依据描述自动派发，也可在提示词中点名；`--agent-file` 可在启动时显式加载定义。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Agent 系统提示词模板。 |
| 具体行为 | 模型池与 `model_preference` 选择的是模型，不是独立 reasoning effort；v2 中绑定池别名不携带显式 thinking 档位，按全局 `[thinking]` 配置 → 所绑定模型的默认 effort 解析；当前 Agent 文档的 frontmatter 字段表仍未列出独立 effort 字段，全文也没有出现 effort 或 reasoning 配置项，Agent 级推理强度只能由全局 `[thinking]` 与所绑定模型决定。 |
| 作用域 | 显式文件、项目、额外目录、用户、Plugin、内置六级来源；更具体的作用域优先。 |
| 上下文与继承 | 子 Agent 只接收任务描述，在独立上下文中工作，最后把完整结果返回主 Agent。 |
| 工作区隔离 | 当前 Agent 文档未列出每 Agent Worktree 隔离字段。 |
| 运行限制 | 全局 `[subagent] timeout_ms` 限制单个 Agent 或 AgentSwarm 运行时间，默认 7200000 ms（2 小时）；main 分支起 AgentSwarm 改用独立 `[swarm] timeout_ms`（默认同为 7200000 ms、`0` 无超时，`KIMI_CODE_SWARM_TIMEOUT_MS` 覆盖），尚未发布；Agent 定义 frontmatter 无独立轮数或超时字段。 |
| 条件与边界 | Subagent 模型池为实验性功能，需 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1` 开启；开启后所有启动模式（包括 TUI）生效。默认 v2 引擎读取 `[secondary_model]` 模型池；`model_preference` 字段仅由旧版 `agent-core` 引擎（`KIMI_CODE_LEGACY_FLAG=1`）读取。 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/customization/agents.md)、[Kimi Code subagent and secondary model configuration](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `effort` |
| 入口与配置 | TUI 用 `/agents` 管理、自然语言或 `@name` 调用；可用 `--agent` 作为会话 Agent，或用 `--agents` 临时注入。 |
| 定义格式 | 持久定义为 Markdown + YAML；`--agents` 接受当前进程有效的 JSON 对象。 |
| 具体行为 | `effort` 的官方字段表逐字为取值 `low`、`medium`、`high`、`xhigh`、`max` 或正整数、含义 “Reasoning effort or budget.”；文档未说明省略时的继承行为（同表的 `model` 写明省略即 `inherit`、`permissionMode` 写明省略继承父会话模式，`effort` 行没有对应说明），settings.json 覆盖 schema 只含启用状态、模型配置、运行限制、工具允许列表与追加的 MCP 服务器，不含 effort 键。 |
| 作用域 | 内置、用户、项目、插件、命令行 Flag 五类来源；同名时 Flag 优先级最高。 |
| 上下文与继承 | 每个 Subagent 有独立上下文、系统提示词、工具注册表、Transcript 和压缩流程。 |
| 工作区隔离 | `isolation: worktree` 在独立 Git Worktree 中运行；省略时使用默认工作区。 |
| 运行限制 | 支持 `maxTurns` 与 `timeoutMins`，并可在 `settings.json` 中覆盖已发现 Agent 的运行限制。 |
| 条件与边界 | 插件 Agent 会移除 `hooks`、`mcpServers`、`permissionMode`；只保留值为 `worktree` 的 isolation。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code v2.1.292 Agent 工具 `effort` 参数更新日志](https://github.com/anthropics/claude-code/blob/fbe20e00e285/CHANGELOG.md)
- [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Subagent activity 记录解析后模型与推理强度的提交](https://github.com/openai/codex/commit/b0a6b8d86f455d3db9dd869fc1178a5fbd865e7f)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)
- [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/customization/agents.md)
- [Kimi Code subagent and secondary model configuration](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/configuration/config-files.md)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [Agent 单独选模型](./agent-model.md)
- [推理强度](../commands/cmd-effort.md)
- [轮数与超时限制](./agent-limits.md)
