# Agent 推理强度

[返回 Subagent 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=agent-effort)

> 核对日期：2026-10-10

## 定义

为单个 Agent 覆盖主会话的推理强度、思考档位或推理预算。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `effort`；Agent 工具调用参数 `effort`（v2.1.292） | 官方确认 |
| Codex | `model_reasoning_effort` · `[agents] default_subagent_reasoning_effort` 全局默认 | 官方确认 |
| Qwen Code | 未确认独立字段 | 未确认 |
| Kimi Code | `[secondary_model] default_effort` 节级档位 · `[models.<alias>.overrides] default_effort` 变体；Agent 文件 frontmatter 无 effort 字段 | 官方确认 |
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
2. Claude Code 自 v2.1.292 起在 Agent 工具上增加 `effort` 参数，官方 Subagents 页现已记录该每次调用参数：它覆盖定义里的 `effort` 字段、在 Subagent 被恢复时继续生效，而 `CLAUDE_CODE_EFFORT_LEVEL` 压过两者。
3. Claude Code 的 Agent frontmatter `effort` 覆盖会话 effort，但不覆盖 `CLAUDE_CODE_EFFORT_LEVEL`，且仍受 `maxEffortLevel` 与组织 effort 上限约束。
4. Codex 另有 config.toml 的 `agents.default_subagent_reasoning_effort`，为派生 Agent 设置全局默认推理强度。
5. Kimi Code 的 Agent 文件没有 effort 字段，但 `[secondary_model] default_effort` 与模型「变体」条目的 `default_effort` 让派生时绑定的模型自带档位。
6. Qwen Code 当前 Agent 文档未确认独立 effort 字段，它把 `effort` 列为尚未落地的兼容字段，原因是需要模型层参数。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `effort`；Agent 工具调用参数 `effort`（v2.1.292） |
| 入口与配置 | 自然语言自动委派或点名；定义文件位于 Agent 目录，也可用 `--agents` 临时注入、用 `--agent` 作为会话主 Agent。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Subagent 系统提示词。 |
| 具体行为 | frontmatter `effort` 的官方逐字说明为 “Effort level when this subagent is active. Overrides the session effort level, but not the `CLAUDE_CODE_EFFORT_LEVEL` environment variable. Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model”，即覆盖会话 effort、省略时继承会话 effort，但不覆盖该环境变量。官方模型配置页把 Skill 与 Subagent frontmatter 的 `effort` 归为同一机制，写明 frontmatter effort 只在该 Skill 或 Subagent 活动期间生效，且 `maxEffortLevel` 或组织 effort 上限仍然限制其实际运行级别。取值的模型支持范围：Fable 5.1、Fable 5、Opus 5.5、Sonnet 5.5、Opus 5、Sonnet 5、Opus 4.8、Opus 4.7 支持 `low`/`medium`/`high`/`xhigh`/`max`，Opus 4.6 与 Sonnet 4.6 只支持 `low`/`medium`/`high`/`max`；设置模型不支持的级别时回退到不高于该级别的最高受支持级别（官方例子为 `xhigh` 在 Opus 4.6 上按 `high` 运行）。`maxEffortLevel` 需 v2.1.267 及以上，取值 `low`/`medium`/`high`/`xhigh`/`max`（`max` 表示不设上限）、默认未设置，多个作用域都设上限时取最低值因而不能从另一作用域抬高，也可写进 `modelSettings` 的单个模型条目，Claude Code 在每次请求前自行套用因而在 Bedrock、Google Cloud's Agent Platform 与 Microsoft Foundry 上同样生效。v2.1.292 起 Agent 工具增加 `effort` 参数，更新日志（固定到 `fbe20e00e285`）逐字为 “Added an `effort` parameter to the Agent tool, so Claude runs a sub-agent at the effort level you ask for”；官方 Subagents 页现已在 Choose an effort level 小节记录该参数，逐字为 “When you ask Claude to run a non-fork subagent at a specific effort level, it can also pass an `effort` parameter for that invocation. The parameter overrides the `effort` field and stays in effect when the subagent is resumed. The `CLAUDE_CODE_EFFORT_LEVEL` environment variable takes precedence over both. The per-invocation parameter requires Claude Code v2.1.292 or later.”，即优先级为 `CLAUDE_CODE_EFFORT_LEVEL` → 每次调用 `effort` → frontmatter `effort`，该参数只用于非 fork 的 Subagent 且恢复后继续生效；它与 `maxEffortLevel` 或组织 effort 上限之间的交互官方没有单独说明，记为未确认。会话 effort 的解析顺序为 `CLAUDE_CODE_EFFORT_LEVEL`/`--effort`/`/effort` → `modelSettings` 或 `effortLevel` 设置 → 模型默认；`CLAUDE_CODE_EFFORT_LEVEL` 另可取 `auto` 表示用模型默认，且优先于 `--effort`、`/effort`、`modelSettings` 与 `effortLevel`。官方环境变量文档没有 Subagent 专用的 effort 环境变量，官方也未列出 Subagent 全局默认 effort 设置。v2.1.198 起扩展思考配置也继承主会话。 |
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
| 矩阵结论 | `[secondary_model] default_effort` 节级档位 · `[models.<alias>.overrides] default_effort` 变体；Agent 文件 frontmatter 无 effort 字段 |
| 入口与配置 | 主 Agent 依据描述自动派发，也可在提示词中点名；`--agent-file` 可在启动时显式加载定义。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Agent 系统提示词模板。 |
| 具体行为 | Agent 文件的 frontmatter 字段表没有独立 effort 字段，官方逐字写 “其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”。子 Agent 的档位改由模型绑定决定：`[secondary_model] default_effort`（string，无默认值）是节级设置，官方说明为 “每次派生的 subagent 绑定的 Thinking 档位，优先于所绑定模型自带的 `default_effort`”，并写明它 “无论派生绑定到池中哪个条目（或 force 固定的模型）都生效”；想按条目区分档位时不要设置它，改用模型「变体」——在 `[models]` 里为同一底层模型再注册一个条目、用 `[models."<alias>".overrides]` 只覆盖 `default_effort`，再把原别名与变体别名都放进模型池，`overrides` 不接受 `provider`、`model`、`protocol`、`beta_api` 与 `base_url` 一类身份或路由字段。绑定池别名时不继承调用方的 Thinking 档位，解析顺序为本节 `default_effort` → `[thinking].enabled = false` 时保持关闭 → 所绑定模型条目的 `default_effort` → 全局 `[thinking].effort` → 所绑定模型 `support_efforts` 的中间项；绑定保留值 `"primary"` 则连模型带档位一起继承调用方。官方另记 main agent 与 subagent 的不对称：“对 main agent，全局 `[thinking].effort` 一旦设置就压过变体的 `default_effort`；对绑定池内别名的 subagent，变体的 `default_effort` 优先于全局值，只有 `[secondary_model].default_effort` 的优先级更高。”变体生效有两个前提：底层模型必须声明 `support_efforts`（官方注明 `managed:kimi-code` 下目前只有 k3 系列声明了档位），且变体是独立条目、不继承被指向条目的字段，`capabilities` 与 `support_efforts` 等元数据要完整照抄，否则 `default_effort` 不生效（它必须是 `support_efforts` 列表中的值）。全局 `[thinking].effort` 取值为 `low`/`medium`/`high`/`xhigh`/`max`，不在模型支持列表时回落默认档。只由旧版 `agent-core` 引擎读取的 `model_preference` 字段随该包在 0.42.0 被删除，当前 agents、config-files、env-vars 与 slash-commands 四份官方文档都已不出现该字段或 `KIMI_CODE_LEGACY_FLAG`。 |
| 作用域 | 显式文件、项目、额外目录、用户、Plugin、内置六级来源；更具体的作用域优先。 |
| 上下文与继承 | 子 Agent 只接收任务描述，在独立上下文中工作，最后把完整结果返回主 Agent。 |
| 工作区隔离 | 当前 Agent 文档未列出每 Agent Worktree 隔离字段。 |
| 运行限制 | `[subagent] timeout_ms` 限制单个 `Agent` subagent 的最长运行时间，默认 7200000 ms（2 小时）、`0` 表示无超时，超时以 `timed_out` 收尾，`KIMI_SUBAGENT_TIMEOUT_MS` 的优先级高于配置文件；`AgentSwarm` 自 0.39.0（2026-08-27 发布）起改用与 `[subagent]` 相互独立的 `[swarm] timeout_ms`（默认同为 7200000 ms、`0` 无超时，`KIMI_CODE_SWARM_TIMEOUT_MS` 覆盖），超时后中止并在聚合报告里标记 `Subagent timed out.`；print 模式（`kimi -p`）下两键未显式设置时都按 `0` 处理，后台 subagent 不受墙钟超时约束。Agent 定义 frontmatter 无独立轮数或超时字段。 |
| 条件与边界 | Subagent 模型池自 0.42.0（2026-09-09 发布）起始终开启，官方逐字为“模型池始终可用，无需任何开启动作；未配置 `[secondary_model]` 时，subagent 继承调用方模型”，`KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` 与实验总开关的退出选项都已移除。旧版 `agent-core` v1 包在同一版被删除，`KIMI_CODE_LEGACY_FLAG` 与只由旧引擎读取的 `model_preference` 字段在当前的 agents、config-files、env-vars 与 slash-commands 四份官方文档里都不再出现；Agent 文件字段表没有 `model`，官方逐字写“其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Agents 文档（Agent 文件字段表没有 `model`，逐字写 “其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/customization/agents.md)、[Kimi Code subagent and secondary model configuration（`[secondary_model]` 模型池已始终开启、`default_effort`、`force` 约束、`/secondary-model` 写入 `default_model`、配置错误直接启动失败）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/configuration/config-files.md)、[Kimi Code 官方变更记录（0.36.0 引入模型池为实验性、0.40.0 “子代理设置（`[secondary_model]`）功能由实验性转为正式”、0.42.0 “子 Agent 模型池（`[secondary_model]`）现已始终开启，实验开关与 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` 退出选项已移除”、0.39.0 新增 `[swarm] timeout_ms`）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/release-notes/changelog.md)、[Kimi Code 删除旧版 agent-core v1 包的提交（`refactor: remove the legacy agent-core v1 package (#3542)`，随 0.42.0 发布）](https://github.com/MoonshotAI/kimi-code/commit/bb16383aa15f72954224d37ee0b9babb807e03b3) |

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
- [Kimi Code Agents 文档（Agent 文件字段表没有 `model`，逐字写 “其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/customization/agents.md)
- [Kimi Code subagent and secondary model configuration（`[secondary_model]` 模型池已始终开启、`default_effort`、`force` 约束、`/secondary-model` 写入 `default_model`、配置错误直接启动失败）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/configuration/config-files.md)
- [Kimi Code 官方变更记录（0.36.0 引入模型池为实验性、0.40.0 “子代理设置（`[secondary_model]`）功能由实验性转为正式”、0.42.0 “子 Agent 模型池（`[secondary_model]`）现已始终开启，实验开关与 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` 退出选项已移除”、0.39.0 新增 `[swarm] timeout_ms`）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/release-notes/changelog.md)
- [Kimi Code 删除旧版 agent-core v1 包的提交（`refactor: remove the legacy agent-core v1 package (#3542)`，随 0.42.0 发布）](https://github.com/MoonshotAI/kimi-code/commit/bb16383aa15f72954224d37ee0b9babb807e03b3)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [Agent 单独选模型](./agent-model.md)
- [推理强度](../commands/cmd-effort.md)
- [轮数与超时限制](./agent-limits.md)
