# Agent 推理强度

[返回 Subagent 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=agent-effort)

> 核对日期：2026-10-31

## 定义

为单个 Agent 覆盖主会话的推理强度、思考档位或推理预算。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `effort`；Agent 工具调用参数 `effort`（v2.1.292）；v2.1.316 另加派生默认 `CLAUDE_CODE_SUBAGENT_EFFORT`，官方环境变量页与 Subagents 页尚未收录 | 官方确认 |
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
4. Claude Code v2.1.316 更新日志新增 `CLAUDE_CODE_SUBAGENT_EFFORT`，让 Subagent 在没有其他来源指定 effort 时跑该变量给出的档位、不再直接继承会话 effort；官方环境变量页与 Subagents 页在核对日期都还没有该变量条目，取值集合与相对优先级记为未确认。
5. Codex 另有 config.toml 的 `agents.default_subagent_reasoning_effort`，为派生 Agent 设置全局默认推理强度。
6. Kimi Code 的 Agent 文件没有 effort 字段，但 `[secondary_model] default_effort` 与模型「变体」条目的 `default_effort` 让派生时绑定的模型自带档位。
7. Qwen Code 当前 Agent 文档未确认独立 effort 字段，它把 `effort` 列为尚未落地的兼容字段，原因是需要模型层参数。
8. 派生 Agent 的全局默认档位只有三家可配：Claude Code 用 v2.1.316 的 `CLAUDE_CODE_SUBAGENT_EFFORT`，Codex 用 `agents.default_subagent_reasoning_effort`，Kimi Code 用 `[secondary_model] default_effort` 且只在派生绑定模型池条目时生效；Qwen Code 与 Qoder CLI 没有对应键。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `effort`；Agent 工具调用参数 `effort`（v2.1.292）；v2.1.316 另加派生默认 `CLAUDE_CODE_SUBAGENT_EFFORT`，官方环境变量页与 Subagents 页尚未收录 |
| 入口与配置 | 自然语言自动委派或点名；定义文件位于 Agent 目录，也可用 `--agents` 临时注入、用 `--agent` 作为会话主 Agent。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Subagent 系统提示词。 |
| 具体行为 | frontmatter `effort` 的官方逐字说明为 “Effort level when this subagent is active. Overrides the session effort level, but not the `CLAUDE_CODE_EFFORT_LEVEL` environment variable. Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model”，即覆盖会话 effort、省略时继承会话 effort，但不覆盖该环境变量。官方模型配置页把 Skill 与 Subagent frontmatter 的 `effort` 归为同一机制，写明 frontmatter effort 只在该 Skill 或 Subagent 活动期间生效，且 `maxEffortLevel` 或组织 effort 上限仍然限制其实际运行级别。取值的模型支持范围（官方模型配置页 2026-10-31 以 `.md` 形式完整抓取，129,830 字节）：Fable 5.1 与 Fable 5 支持 `low`/`medium`/`high`/`xhigh`/`max`，Opus 5.5、Sonnet 5.5、Haiku 5.5、Opus 5、Sonnet 5、Opus 4.8 与 Opus 4.7 同为这五档，Opus 4.6 与 Sonnet 4.6 只支持 `low`/`medium`/`high`/`max`，官方逐字写 “Models not listed here do not support effort”；设置模型不支持的级别时回退到不高于该级别的最高受支持级别（官方例子为 `xhigh` 在 Opus 4.6 上按 `high` 运行）。`maxEffortLevel` 需 v2.1.267 及以上，取值 `low`/`medium`/`high`/`xhigh`/`max`（`max` 表示不设上限）、默认未设置，多个作用域都设上限时取最低值因而不能从另一作用域抬高，也可写进 `modelSettings` 的单个模型条目，Claude Code 在每次请求前自行套用因而在 Bedrock、Google Cloud's Agent Platform 与 Microsoft Foundry 上同样生效。v2.1.292 起 Agent 工具增加 `effort` 参数，更新日志（固定到 `fbe20e00e285`）逐字为 “Added an `effort` parameter to the Agent tool, so Claude runs a sub-agent at the effort level you ask for”；官方 Subagents 页现已在 Choose an effort level 小节记录该参数，逐字为 “When you ask Claude to run a non-fork subagent at a specific effort level, it can also pass an `effort` parameter for that invocation. The parameter overrides the `effort` field and stays in effect when the subagent is resumed. The `CLAUDE_CODE_EFFORT_LEVEL` environment variable takes precedence over both. The per-invocation parameter requires Claude Code v2.1.292 or later.”，即优先级为 `CLAUDE_CODE_EFFORT_LEVEL` → 每次调用 `effort` → frontmatter `effort`，该参数只用于非 fork 的 Subagent 且恢复后继续生效；它与 `maxEffortLevel` 或组织 effort 上限之间的交互官方没有单独说明，记为未确认。v2.1.316 更新日志（2026-10-31 复核，固定到 `80c6959d28c4c30ecd14fc1cdf172f19d9adad81`，Release v2.1.316 发布于 2026-10-31T01:01:35Z）逐字为 “Added `CLAUDE_CODE_SUBAGENT_EFFORT` to set the effort level subagents run at when nothing else names one, instead of inheriting the session's”，即在没有其他来源指定 effort 时由该变量决定 Subagent 档位、取代此前直接继承会话 effort 的行为；官方环境变量页（2026-10-31 以 `.md` 形式完整抓取，187,070 字节）在核对日期没有该变量条目，其 Subagent 相关行只有 `CLAUDE_CODE_FORK_SUBAGENT`、`CLAUDE_CODE_FORWARD_SUBAGENT_TEXT`、`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`、`CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION`、`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`、`CLAUDE_CODE_SUBAGENT_MODEL`、`CLAUDE_CODE_SUBAGENT_MODEL_FORCE`、`CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` 与 `CLAUDE_SUBAGENT_BG_SHELL_MAX_MS`，官方 Subagents 页（116,225 字节）的 Choose an effort level 小节也仍只给出 `CLAUDE_CODE_EFFORT_LEVEL` → 每次调用 `effort` → frontmatter `effort` 三级、没有提到它。因此该变量的取值集合、是否接受 `auto`、是否受 `maxEffortLevel` 与组织 effort 上限约束、是否覆盖 agent team teammates 与 workflow agent，以及它与 `CLAUDE_CODE_EFFORT_LEVEL` 的相对优先级（更新日志只写 “when nothing else names one”）都记为未确认；它与 v2.1.296 的 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` 一样属于只有更新日志、官方文档尚未同步的变量。会话 effort 的解析顺序（官方模型配置页 Adjust effort level 小节，2026-10-31 复核）逐字为五级并取第一个适用者：1. The `CLAUDE_CODE_EFFORT_LEVEL` environment variable；2. A level you pick in the session, such as with `/effort`, the `/model` picker, or `applyFlagSettings()`；3. Launching with `--effort`；4. Your settings: the level you saved for the model or an `effortLevel` key, with the precedence between them and across settings files stated at `modelSettings`；5. The model's default effort: `high` on every model that supports effort, except that Opus 5.5, Sonnet 5.5, and Haiku 5.5 default to `medium` and Opus 4.7 defaults to `xhigh`. If your organization sets a default effort level for its organization default model, that level is the default when you run that model。官方同页另记 Opus 5.5 起顶层 `effortLevel` 只在用户设置文件里失效（项目、local、managed 设置或 `--settings` 传入的仍对所有模型生效），因而第 4 级的实际取值随模型而变。`CLAUDE_CODE_EFFORT_LEVEL` 官方逐字为 “Set the effort level for supported models. Values: `low`, `medium`, `high`, `xhigh`, or `max`. Available levels depend on the model. Takes precedence over `--effort`, `/effort`, and the `modelSettings` and `effortLevel` settings. A `maxEffortLevel` cap still applies. Set it to `auto` or `unset` to have Claude Code send no effort level, so that the API applies its own default for the model.”，即 `auto` 与 `unset` 都表示不发送 effort 而由 API 用模型自己的默认值；环境变量页开头另写 “`--model` and `/model` override `ANTHROPIC_MODEL`, while `CLAUDE_CODE_EFFORT_LEVEL` overrides `--effort` and `/effort`”，且 `CLAUDE_CODE_EFFORT_LEVEL` 与持久化的 `effortLevel` 都不接受 `ultracode`。官方设置参考没有 Subagent 全局默认 effort 的设置键，`CLAUDE_CODE_SUBAGENT_EFFORT` 是核对日期唯一的 Subagent 专用 effort 变量。v2.1.198 起扩展思考配置也继承主会话。 |
| 作用域 | 组织托管、当前进程、项目、用户、插件五级来源；同名定义按官方优先级解析。 |
| 上下文与继承 | 命名 Subagent 使用独立上下文；接收自身系统提示词、基础环境信息和父 Agent 给出的任务。 |
| 工作区隔离 | 默认从主会话当前目录工作；`isolation: worktree` 可创建临时 Git Worktree。 |
| 运行限制 | 可配置 `maxTurns`；官方 Subagent 字段表未列出单 Agent 超时字段。 |
| 条件与边界 | 插件分发的 Agent 会忽略 `hooks`、`mcpServers`、`permissionMode`。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)、[Claude Code model configuration](https://code.claude.com/docs/en/model-config)、[Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code v2.1.292 Agent 工具 `effort` 参数更新日志](https://github.com/anthropics/claude-code/blob/fbe20e00e285/CHANGELOG.md)、[Claude Code v2.1.316 `CLAUDE_CODE_SUBAGENT_EFFORT` 更新日志（2026-10-31 复核，固定到提交 `80c6959d28c4c30ecd14fc1cdf172f19d9adad81`，Release v2.1.316 发布于 2026-10-31T01:01:35Z）：逐字为 “Added `CLAUDE_CODE_SUBAGENT_EFFORT` to set the effort level subagents run at when nothing else names one, instead of inheriting the session's”，即只在没有其他来源指定 effort 时决定 Subagent 档位，取代此前直接继承会话 effort 的行为；官方环境变量页（2026-10-31 以 `.md` 形式完整抓取，187,070 字节）与官方 Subagents 页（116,225 字节）在核对日期都没有 `CLAUDE_CODE_SUBAGENT_EFFORT` 条目，环境变量页的 Subagent 相关行只有 `CLAUDE_CODE_FORK_SUBAGENT`、`CLAUDE_CODE_FORWARD_SUBAGENT_TEXT`、`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`、`CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION`、`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`、`CLAUDE_CODE_SUBAGENT_MODEL`、`CLAUDE_CODE_SUBAGENT_MODEL_FORCE`、`CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` 与 `CLAUDE_SUBAGENT_BG_SHELL_MAX_MS`，Subagents 页的 Choose an effort level 小节仍只写 `CLAUDE_CODE_EFFORT_LEVEL` → 每次调用 `effort` → frontmatter `effort` 三级，因此该变量的取值集合、是否接受 `auto`、是否受 `maxEffortLevel` 与组织 effort 上限约束、是否覆盖 agent team teammates 与 workflow agent，以及它与 `CLAUDE_CODE_EFFORT_LEVEL` 的相对优先级都记为未确认；同版另有 “Added `CLAUDE_CODE_DISABLE_ULTRATHINK`, which turns the `ultrathink` keyword off” 与 v2.1.311 “Changed `ultrathink` in the interactive terminal to run its turn at xhigh effort on Opus 5.5, Sonnet 5.5, Haiku 5.5 and Fable 5.1 through Anthropic's API”，属其他能力字段、本次未处理](https://github.com/anthropics/claude-code/blob/80c6959d28c4c30ecd14fc1cdf172f19d9adad81/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model_reasoning_effort` · `[agents] default_subagent_reasoning_effort` 全局默认 |
| 入口与配置 | 直接要求 Codex 委派，或由项目指令、Skill 触发；CLI 用 `/agent` 查看和切换线程。 |
| 定义格式 | 独立 TOML 文件；`name`、`description`、`developer_instructions` 为核心字段。 |
| 具体行为 | `model_reasoning_effort` 可写入 Agent TOML；Agent 文件设置 `model` 或 `model_reasoning_effort` 时文件值优先。否则 Codex 按显式 spawn 值、`[agents]` 默认值、父会话值的顺序独立解析，`agents.default_subagent_reasoning_effort` 是派生 Agent 的全局默认，显式 spawn effort 优先于该默认。spawn 切换模型且没有显式或配置的 effort 时，使用该模型的默认 effort；只设 `model` 的 Agent 文件保留此前解析出的 effort。取值：Subagent 页列出 `ultra`、`max`、`xhigh`、`high`、`medium`、`low`；配置参考 `model_reasoning_effort` 条目列出 `minimal \| low \| medium \| high \| xhigh`（Responses API，`xhigh` 依模型而定）。main 分支起 Subagent activity 条目额外记录解析后的 `model` 与 `reasoning_effort`：app-server 协议与 Python SDK 类型把两者作为可空字段，旧记录迁移为 null；v2 多代理 spawn 在子 Agent 启动前捕获启动配置，并按模型元数据解析对外报告的 effort（测试用例把 `ultra` 报告为 `xhigh`）而不改动子 Agent 自身配置的 effort。提交 `b0a6b8d86f45`，合入 main 尚未发布，官方文档未记录。2026-10-31 复核官方 Subagents 页（以 `.md` 形式抓取，22,907 字节），继承与默认规则逐字未变：“If you don't configure a subagent model or `model_reasoning_effort`, the subagent inherits the parent agent's model and reasoning effort. If an explicit spawn request or an `[agents]` default selects a model without an explicit or configured reasoning effort, the subagent uses that model's default reasoning effort.”，给出的三条控制途径仍是 “request a specific model or reasoning effort in your prompt, configure `[agents]` defaults in `config.toml`, or set `model` and `model_reasoning_effort` directly in the custom agent file”；Reasoning effort 小节按档位给使用场景（`ultra` “Use for the deepest reasoning when the selected model supports it.”、`max` 与 `xhigh` “Use for especially demanding reasoning when the selected model supports these levels.”、`high` 用于需要追踪复杂逻辑与边界情形的 Agent、`medium` “Balances speed and depth.”、`low` 用于任务直接且速度优先），并写 “Higher reasoning effort increases response time and token usage, but it can improve quality for complex work.”；`[agents]` 键表逐字为 `agents.default_subagent_reasoning_effort`（string、非必填、“Set the default reasoning effort for spawned agents.”）与 “Explicit spawn values override `agents.default_subagent_model` and `agents.default_subagent_reasoning_effort`.”，官方仍未给出每次调用 effort 的旗标名或 API 参数名。 |
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
| 具体行为 | 当前 Agent 文档把 `effort` 列为尚未落地的 Claude Code 兼容字段，逐字原因为 “`effort` needs a model-layer parameter”，需模型层参数等前置基础设施后随后续版本引入；已落地的兼容字段表只含 `permissionMode`、`maxTurns`、`color`、`mcpServers`、`hooks`，模型 grade 和 `model` 选择不等同于推理强度。2026-10-31 复核 `docs/users/features/sub-agents.md`（提交 `fe30b5daaa6ae3bef16370393200204c4a82c28e`，41,363 字节），该段逐字为 “The remaining CC frontmatter fields — `effort`, `skills`, `initialPrompt`, `memory`, `isolation` — are documented in the declarative-agent design doc and land in follow-up PRs once the prerequisite infrastructure exists (`effort` needs a model-layer parameter; `memory` needs a scoped memory subsystem; `--agent` CLI flag enables `initialPrompt`; etc.)”，结论未变；全页没有 Subagent 级推理强度的配置键或环境变量。 |
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
| 入口与配置 | 主 Agent 需先获得授权才派发（2.3.2 起：用户显式请求、`AGENTS.md` 或 Skill 指令、已开启的多代理模式），也可在提示词中点名；`--agent-file` 可在启动时显式加载定义。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Agent 系统提示词模板。 |
| 具体行为 | Agent 文件的 frontmatter 字段表没有独立 effort 字段，官方逐字写 “其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”。子 Agent 的档位改由模型绑定决定：`[secondary_model] default_effort`（string，无默认值）是节级设置，官方说明为 “每次派生的 subagent 绑定的 Thinking 档位，优先于所绑定模型自带的 `default_effort`”，并写明它 “无论派生绑定到池中哪个条目（或 force 固定的模型）都生效”；想按条目区分档位时不要设置它，改用模型「变体」——在 `[models]` 里为同一底层模型再注册一个条目、用 `[models."<alias>".overrides]` 只覆盖 `default_effort`，再把原别名与变体别名都放进模型池，`overrides` 不接受 `provider`、`model`、`protocol`、`beta_api` 与 `base_url` 一类身份或路由字段。绑定池别名时不继承调用方的 Thinking 档位，解析顺序为本节 `default_effort` → `[thinking].enabled = false` 时保持关闭 → 所绑定模型条目的 `default_effort` → 全局 `[thinking].effort` → 所绑定模型 `support_efforts` 的中间项；绑定保留值 `"primary"` 则连模型带档位一起继承调用方。官方另记 main agent 与 subagent 的不对称：“对 main agent，全局 `[thinking].effort` 一旦设置就压过变体的 `default_effort`；对绑定池内别名的 subagent，变体的 `default_effort` 优先于全局值，只有 `[secondary_model].default_effort` 的优先级更高。”变体生效有两个前提：底层模型必须声明 `support_efforts`（官方注明 `managed:kimi-code` 下目前只有 k3 系列声明了档位），且变体是独立条目、不继承被指向条目的字段，`capabilities` 与 `support_efforts` 等元数据要完整照抄，否则 `default_effort` 不生效（它必须是 `support_efforts` 列表中的值）。全局 `[thinking].effort` 取值为 `low`/`medium`/`high`/`xhigh`/`max`，不在模型支持列表时回落默认档。只由旧版 `agent-core` 引擎读取的 `model_preference` 字段随该包在 0.42.0 被删除，当前 agents、config-files、env-vars 与 slash-commands 四份官方文档都已不出现该字段或 `KIMI_CODE_LEGACY_FLAG`。2026-10-31 复核 `docs/zh/configuration/config-files.md`（提交 `a2afdbc7d1fa0737d45d5780cc6c2bd38e477b55`，47,522 字节），`[secondary_model]` 节仍逐字写 “subagent 默认继承 main agent 正在运行的模型”“模型池始终可用，无需任何开启动作；未配置 `[secondary_model]` 时，subagent 继承调用方模型”，`default_effort` 行仍是 “每次派生的 subagent 绑定的 Thinking 档位，优先于所绑定模型自带的 `default_effort`”，`overrides` 仍逐字列出可覆盖 `max_context_size`、`max_input_size`、`max_output_size`、`capabilities`、`display_name`、`reasoning_key`、`adaptive_thinking`、`support_efforts`、`default_effort` 与 `off_effort` 而不接受身份或路由字段与 registry 管理的 `upgrade` 元数据，本节结论未变；官方仍没有 Subagent 级 effort 的 frontmatter 字段或专用环境变量。 |
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
| 具体行为 | `effort` 的官方字段表逐字为取值 `low`、`medium`、`high`、`xhigh`、`max` 或正整数、含义 “Reasoning effort or budget.”；文档未说明省略时的继承行为（同表的 `model` 写明省略即 `inherit`、`permissionMode` 写明省略继承父会话模式，`effort` 行没有对应说明），settings.json 覆盖 schema 只含启用状态、模型配置、运行限制、工具允许列表与追加的 MCP 服务器，不含 effort 键。2026-10-31 复核官方 Subagent 页，`--agents` 临时注入小节逐字为 “`--agents` uses the `prompt` field as the system prompt. The current JSON schema supports `description`, `prompt`, `tools`, `disallowedTools`, `mcpServers`, `model`, `effort`, `color`, `maxTurns`, `initialPrompt`, `skills`, and `permissionMode`. Use Markdown configuration when you need `timeoutMins`, `temperature`, `hooks`, `memory`, `background`, or `isolation`.”，即 JSON 形式也能带 `effort`，而 `temperature` 一类字段只能写在 Markdown 配置里；全页没有派生 Agent 的全局默认推理强度键。 |
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
- [Claude Code v2.1.316 `CLAUDE_CODE_SUBAGENT_EFFORT` 更新日志（2026-10-31 复核，固定到提交 `80c6959d28c4c30ecd14fc1cdf172f19d9adad81`，Release v2.1.316 发布于 2026-10-31T01:01:35Z）：逐字为 “Added `CLAUDE_CODE_SUBAGENT_EFFORT` to set the effort level subagents run at when nothing else names one, instead of inheriting the session's”，即只在没有其他来源指定 effort 时决定 Subagent 档位，取代此前直接继承会话 effort 的行为；官方环境变量页（2026-10-31 以 `.md` 形式完整抓取，187,070 字节）与官方 Subagents 页（116,225 字节）在核对日期都没有 `CLAUDE_CODE_SUBAGENT_EFFORT` 条目，环境变量页的 Subagent 相关行只有 `CLAUDE_CODE_FORK_SUBAGENT`、`CLAUDE_CODE_FORWARD_SUBAGENT_TEXT`、`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`、`CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION`、`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`、`CLAUDE_CODE_SUBAGENT_MODEL`、`CLAUDE_CODE_SUBAGENT_MODEL_FORCE`、`CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` 与 `CLAUDE_SUBAGENT_BG_SHELL_MAX_MS`，Subagents 页的 Choose an effort level 小节仍只写 `CLAUDE_CODE_EFFORT_LEVEL` → 每次调用 `effort` → frontmatter `effort` 三级，因此该变量的取值集合、是否接受 `auto`、是否受 `maxEffortLevel` 与组织 effort 上限约束、是否覆盖 agent team teammates 与 workflow agent，以及它与 `CLAUDE_CODE_EFFORT_LEVEL` 的相对优先级都记为未确认；同版另有 “Added `CLAUDE_CODE_DISABLE_ULTRATHINK`, which turns the `ultrathink` keyword off” 与 v2.1.311 “Changed `ultrathink` in the interactive terminal to run its turn at xhigh effort on Opus 5.5, Sonnet 5.5, Haiku 5.5 and Fable 5.1 through Anthropic's API”，属其他能力字段、本次未处理](https://github.com/anthropics/claude-code/blob/80c6959d28c4c30ecd14fc1cdf172f19d9adad81/CHANGELOG.md)
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
