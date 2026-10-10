# Agent 单独选模型

[返回 Subagent 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=agent-model)

> 核对日期：2026-10-10

## 定义

为单个 Agent 指定不同于主会话的模型、模型别名或模型选择策略。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `model`：`sonnet`/`opus`/`haiku`/`fable` · 完整模型 ID · `inherit`；解析顺序为每次调用 `model` 参数 → frontmatter → `CLAUDE_CODE_SUBAGENT_MODEL` → 主会话模型；`CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` 强制统一（v2.1.257）；v2.1.296 另加只统一 workflow agent 的 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` | 官方确认 |
| Codex | `model`；解析顺序为显式 spawn 值 → `agents.default_subagent_model` → 父会话值，Agent 文件里写了 `model` 时文件值最后覆盖 | 官方确认 |
| Qwen Code | `model`: inherit · fast · modelId · authType:modelId · `modelGrades` 名称；`agents.builtin.exploreModel` 单独覆盖内置 Explore | 源码确认 |
| Kimi Code | `[secondary_model]` 池别名 · 保留值 `"primary"` · `force = true` 固定到 `default_model`；模型池自 0.42.0 起始终开启，无需开关 | 官方确认 |
| Qoder CLI | `model`：任意模型名或 `inherit`/`auto`/`lite`/`efficient`/`performance` 别名；省略即 `inherit` | 官方确认 |

## 比较边界

### 本页包含

- Agent 定义里的模型字段与可取值
- 每次调用传入的模型
- 省略时的继承规则与完整解析顺序
- 派生默认模型与强制统一到一个模型
- 跨 Provider 或主/备模型策略
- 内置 Agent 的模型

### 本页不包含

- 推理强度
- 模型价格
- 会话级模型切换入口

## 跨产品事实

1. 五家都能让子 Agent 跑在不同于主会话的模型上，但入口形状不同：Claude Code、Codex、Qwen Code 与 Qoder CLI 在 Agent 定义里写模型字段，Kimi Code 的 Agent 文件没有模型字段，改由 `[secondary_model]` 模型池在每次派生时选择。
2. 四家给出明确的解析顺序：Claude Code 为每次调用 `model` 参数 → 定义 frontmatter → `CLAUDE_CODE_SUBAGENT_MODEL` → 主会话模型；Codex 为显式 spawn 值 → `agents.default_subagent_model` → 父会话值，Agent 文件写了 `model` 时文件值最后覆盖；Kimi Code 为工具调用显式 `model` → `[secondary_model] default_model`；Qwen Code 与 Qoder CLI 省略字段即继承主会话模型。
3. 只有 Claude Code 与 Kimi Code 提供把全部子 Agent 固定到一个模型的开关：`CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`（v2.1.257 起）与 `[secondary_model] force = true`，两者都同时收回委派方的选择权，且 Kimi 的 `force` 不能与 `models` 池同用。
4. 内置 Agent 的模型可单独覆盖：Claude Code 用同名的用户或项目 Subagent 覆盖内置 `Explore` 并保留其 `model` 字段，Qwen Code 用 `agents.builtin.exploreModel`；Codex 与 Qoder CLI 的官方 Subagent 页没有给出内置 Agent 的单独模型键。
5. Kimi Code 的 Subagent 模型池在 0.36.0（2026-08-13）引入时为实验性，0.40.0（2026-09-02）转为正式，0.42.0（2026-09-09）起始终开启并移除实验开关；同一版删除旧版 `agent-core` v1 包，`model_preference` 与 `KIMI_CODE_LEGACY_FLAG` 随之退出官方文档。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model`：`sonnet`/`opus`/`haiku`/`fable` · 完整模型 ID · `inherit`；解析顺序为每次调用 `model` 参数 → frontmatter → `CLAUDE_CODE_SUBAGENT_MODEL` → 主会话模型；`CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` 强制统一（v2.1.257）；v2.1.296 另加只统一 workflow agent 的 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` |
| 入口与配置 | 自然语言自动委派或点名；定义文件位于 Agent 目录，也可用 `--agents` 临时注入、用 `--agent` 作为会话主 Agent。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Subagent 系统提示词。 |
| 具体行为 | frontmatter `model` 的官方逐字说明为 “Model to use: `sonnet`, `opus`, `haiku`, `fable`, a full model ID such as `claude-opus-5-5`, or `inherit`. When you omit it, Claude Code picks the model in the subagent model order”，完整模型 ID “Accepts the same values as the `--model` flag”，`inherit` 表示用主会话同一模型。官方给出的 subagent model order 逐字为四级：1. The per-invocation `model` parameter；2. The subagent definition's `model` frontmatter, where `inherit` selects the main conversation's model；3. The `CLAUDE_CODE_SUBAGENT_MODEL` environment variable, when you set it to a model alias or model ID；4. The main conversation's model。已安装的 mod 在 `agent.spawn` Hook 里设置模型时，Claude Code 用该模型取代每次调用参数。委派方可以在单次调用里传 `model`，该值在 Subagent 被恢复或收到后续消息时继续生效（v2.1.211 前恢复会丢掉它并回落到定义的 `model` 或主会话模型）。家族别名在两种情况下解析成主会话的模型而不是别名指向的版本：主会话模型本就属于该家族时，Subagent 跑主会话的确切模型并连 `[1m]` 后缀一起继承扩展上下文窗口；在 Anthropic API 以外的 Provider 上 Claude Code 分辨不出主会话模型家族时（例如 Bedrock 上尚未解析出背后模型的 application inference profile ARN），该规则只覆盖 `opus` 别名，且设置了 `ANTHROPIC_DEFAULT_OPUS_MODEL` 时不适用。`CLAUDE_CODE_SUBAGENT_MODEL` 是 subagents、agent team teammates 与 workflow agents 在没有其他来源指定模型时的默认模型，接受 `haiku` 一类别名或完整模型名，有两次调用时传入的模型与定义里的 `model` 字段（含 `inherit`）两个来源优先于它，取值 `inherit` 等同未设置，其中的别名总是解析到别名指向的版本即使它点名的就是主会话所属家族；v2.1.251 前该变量排在顺序首位并压过每次调用参数与 frontmatter（含 `model: inherit`）。单独设置 `CLAUDE_CODE_SUBAGENT_MODEL` 不改变内置 Explore 与 Plan 跑的模型。`CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`（需 v2.1.257 及以上）把同一模型强制套到所有 subagent、teammate 与 workflow agent：两个变量都设时用 `CLAUDE_CODE_SUBAGENT_MODEL` 里的模型，只设 FORCE 时用主会话模型但内置 Explore 仍跑 Built-in subagents 一节为它列出的模型；FORCE 生效期间 Claude Code 忽略定义里的 `model` 字段、Claude 也无法在启动 Subagent 时传模型，而 fork 与以 `model: inherit` 在 Subagent 中运行的 skill 仍跑主会话模型。三个来源的取值都要过组织 `availableModels` 允许清单，被拦截时按规则替换：被拦的是家族别名时改跑允许清单容许的该家族最新版本（v2.1.222 前改用继承的模型），其他被拦取值、替换不生效的 Provider 或清单不容许该家族任何版本时改跑继承的模型，设了 `CLAUDE_CODE_SUBAGENT_MODEL` 时先按同一规则试该模型；交互式会话会给出同时点名请求模型与实际模型的警告。v2.1.296 更新日志（固定到 `2301018b1f61`）逐字为 “Added `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` to run every workflow agent on one model while other subagents keep theirs”，即只统一 workflow agent 而其余 Subagent 保留各自模型；官方环境变量页与 Workflows 页在核对日期都没有收录该变量，它与 `CLAUDE_CODE_SUBAGENT_MODEL`、`CLAUDE_CODE_SUBAGENT_MODEL_FORCE`、脚本为 stage 指定的模型之间的优先级以及是否接受 `inherit` 记为未确认。Workflows 页记录 workflow agent 的模型按与 Subagent 相同的顺序解析、脚本为某个 stage 指定的模型算作该顺序里的每次调用值、没有其他来源指定时跑会话模型，组织 `availableModels` 拦下脚本请求的模型时该 agent 按与 Subagent 相同的替换规则改跑替代模型。内置 Subagent 的模型：Explore 跑主会话模型，但主会话跑 Fable 时分两种情况——用 Claude 订阅、Anthropic Console 账号或经 `ANTHROPIC_BASE_URL` 接到的 LLM gateway 时跑 `opus` 别名解析出的 Opus 模型，在 Amazon Bedrock、Google Cloud's Agent Platform、Microsoft Foundry、Claude Platform on AWS 或 Claude apps gateway 上仍跑主会话模型；Plan 继承主会话，除非设了 `CLAUDE_CODE_SUBAGENT_MODEL` 并强制到每个 Subagent；general-purpose 在没有其他来源指定时用 `CLAUDE_CODE_SUBAGENT_MODEL`，否则用主会话模型；`claude` 没有自己的模型、被当作 Subagent 派生时按模型顺序解析；`statusline-setup` 为 Sonnet，`claude-code-guide` 为 Haiku。名为 `Explore` 的用户或项目 Subagent 会覆盖内置定义并保留自己的 `model` 字段，因此写 `model: haiku` 就能把探索放到更便宜的模型上。`/tasks` 在 Subagent 行上显示它实际跑的模型并在设有 effort 时一并显示，需 v2.1.242 及以上。 |
| 作用域 | 组织托管、当前进程、项目、用户、插件五级来源；同名定义按官方优先级解析。 |
| 上下文与继承 | 命名 Subagent 使用独立上下文；接收自身系统提示词、基础环境信息和父 Agent 给出的任务。 |
| 工作区隔离 | 默认从主会话当前目录工作；`isolation: worktree` 可创建临时 Git Worktree。 |
| 运行限制 | 可配置 `maxTurns`；官方 Subagent 字段表未列出单 Agent 超时字段。 |
| 条件与边界 | 插件分发的 Agent 会忽略 `hooks`、`mcpServers`、`permissionMode`。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code Workflows（workflow agent 复用 Subagent 模型解析顺序、脚本为某个 stage 指定的模型算作每次调用值、`availableModels` 拦截时按同一替换规则改跑替代模型）](https://code.claude.com/docs/en/workflows)、[Claude Code v2.1.296 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` 更新日志（官方环境变量页与 Workflows 页尚未收录该变量）](https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model`；解析顺序为显式 spawn 值 → `agents.default_subagent_model` → 父会话值，Agent 文件里写了 `model` 时文件值最后覆盖 |
| 入口与配置 | 直接要求 Codex 委派，或由项目指令、Skill 触发；CLI 用 `/agent` 查看和切换线程。 |
| 定义格式 | 独立 TOML 文件；`name`、`description`、`developer_instructions` 为核心字段。 |
| 具体行为 | Agent 文件的核心字段只有 `name`、`description` 与 `developer_instructions`，官方逐字写 “You can also include other supported `config.toml` keys in a custom agent file, such as `model`, `model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, and `skills.config.”，`model` 因此是写进 Agent TOML 的普通配置键而不是独立 schema 字段。解析顺序官方逐字为 “Before applying the file, Codex resolves each setting from an explicit spawn value, then the corresponding `[agents]` default, then the parent's value.”，随后 “If a custom agent file sets `model` or `model_reasoning_effort`, the value in the file takes precedence.”，即文件值最后覆盖前三级。都不配置时 “the subagent inherits the parent agent's model and reasoning effort”。配置参考的 `[agents]` 表列出 `agents.default_subagent_model`（string，“Default model for spawned agents. An explicit spawn model takes precedence.”）与 `agents.default_subagent_reasoning_effort`（string，“Default reasoning effort for spawned agents. An explicit spawn effort takes precedence.”），两键都没有给出默认值；同表另有 `agents.<name>.config_file`（“Path to a TOML config layer for that role; relative paths resolve from the config file that declares the role.”），可用一整层 TOML 为某个角色指定模型。显式 spawn 值同时压过这两个 `[agents]` 默认。显式 spawn 或 `[agents]` 默认选中了模型而两者都没给推理强度时，用该模型自己的默认 effort；只设 `model` 的 Agent 文件保留此前解析出的 effort。官方给出的三条控制途径是 “request a specific model or reasoning effort in your prompt, configure `[agents]` defaults in `config.toml`, or set `model` and `model_reasoning_effort` directly in the custom agent file”；官方 Subagent 页与配置参考都没有为每次调用给出旗标名或 API 参数名，只用 “explicit spawn value”/“explicit spawn request” 指代，其具体传法记为未确认。顶层 `model` 键的说明为 “Model to use (e.g., `gpt-6.1-sol`).”，是会话级而非 Agent 级。官方 Subagent 页没有给出内置 `default`/`worker`/`explorer` 各自的模型，也没有类似 `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` 的全局强制键。 |
| 作用域 | 项目级 `.codex/agents/` 与用户级 `~/.codex/agents/`；同名自定义 Agent 可覆盖内置定义。 |
| 上下文与继承 | 每个 Subagent 是独立线程；父线程负责委派、跟进、等待、关闭并汇总结果。 |
| 工作区隔离 | 继承父线程当前沙箱与审批策略；当前 Subagent 页面未列出每 Agent Worktree。 |
| 运行限制 | 可配置每会话并发线程数；当前 Agent 文件字段未列出单 Agent 轮数和超时。 |
| 条件与边界 | 父回合的实时沙箱和审批覆盖会在派生时重新应用。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model`: inherit · fast · modelId · authType:modelId · `modelGrades` 名称；`agents.builtin.exploreModel` 单独覆盖内置 Explore |
| 入口与配置 | 使用 `/agents create`、`/agents manage` 管理；模型通过 Agent 工具按类型委派，也可显式点名。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为命名 Agent 的系统提示词。 |
| 具体行为 | frontmatter `model` 的官方取值逐字为四种：`inherit` 用主会话同一模型；省略该字段等同 `inherit`；`fast` 用配置好的 `fastModel`，没有有效 fast model 时回退 `inherit`；裸模型 ID（官方示例 `glm-5`）先查主会话的 auth type，该处不可用时可从另一个已配置的 Provider 解析；`authType:modelId`（官方示例 `openai:gpt-4o`）显式指定 Provider 与模型 ID，用于让 Subagent 跑在与主会话不同 auth type 下注册的模型。`fast` 选择器用的是 `settings.json` 或 `/model --fast` 配置的同一个 `fastModel`，该设置本身可以指向另一个 auth type 下的模型（官方示例 `openai:deepseek-v4-flash`）；选择器解析到其他 auth type 时，Qwen Code 为这次 Subagent 请求创建一个专用 runtime provider 并只把裸模型 ID 发给它。安全一节另记 “A subagent with `model: authType:modelId`, or `model: fast` where `fastModel` resolves to another auth type, sends that subagent's model requests to the selected provider.”，并提醒要确认该 Provider 已配置。内置 Explore 默认继承主会话模型，`agents.builtin.exploreModel` 只为这一个内置 Agent 另选模型且需要重启 Qwen Code，取值接受与 frontmatter 相同的选择器，只在解析内置 Explore 定义时套用——会话、项目、用户或扩展里名为 Explore 的 Agent 保留自己的 `model`；更早的版本默认用 `fastModel` 跑 Explore，把 `exploreModel` 设为 `fast` 可保留该行为。`agents.modelGrades` 定义名称到选择器的映射（官方示例 `"small": "fast"`、`"high": "qwen-max"`），`agents.allowedGrades` 可选地限制可用名称，配置后 Agent 工具接受 `model: "small"` 或 `model: "high"`，未知名称、不在允许清单里的名称、fork 与命名 Teammate 的 grade 选择都被拒绝，自定义 Agent 定义里的显式 `model` 仍优先于 grade。委派外部执行器时模型选择整体不适用：内置 `claude-code` 与 `codex` Agent 委派给另行安装的原生工具，“These agents use their native model and authentication settings. Qwen Code does not fall back to its own model when the executable is missing.”，且 “Qwen model overrides, tool lists, subagent hooks, `maxTurns`, fork history, teams, and workflows are not supported for external executors.”。官方 Subagent 页没有给出把全部子 Agent 固定到一个模型的开关，也没有 Agent 级模型的环境变量。 |
| 作用域 | 项目级 `.qwen/agents/`、用户级 `~/.qwen/agents/`、扩展 `agents/` 与内置定义。 |
| 上下文与继承 | 命名 Agent 从新上下文开始；Fork 继承父会话全部或最近若干个真实用户轮次。 |
| 工作区隔离 | Agent 调用可传 `isolation: "worktree"`；Fork 与 Worktree 隔离互斥。 |
| 运行限制 | 支持 `maxTurns`；配置只对超长 description 和系统提示词给软警告，未列出超时字段。 |
| 条件与边界 | `hooks` v1 在 Agent 运行期间按会话注册；`effort`、`skills`、`memory` 等 frontmatter 尚未落地。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)、[Qwen Code v0.25.1-preview.2 Subagent 文档（Model Selection 小节：`model` 四种选择器、省略等同 `inherit`、`agents.builtin.exploreModel`、`agents.modelGrades` 与 `agents.allowedGrades`、外部 executor 不支持模型覆盖）](https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/docs/users/features/sub-agents.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `[secondary_model]` 池别名 · 保留值 `"primary"` · `force = true` 固定到 `default_model`；模型池自 0.42.0 起始终开启，无需开关 |
| 入口与配置 | 主 Agent 依据描述自动派发，也可在提示词中点名；`--agent-file` 可在启动时显式加载定义。 |
| 定义格式 | Markdown 正文 + YAML frontmatter；正文作为 Agent 系统提示词模板。 |
| 具体行为 | Agent 文件本身不带模型字段：官方字段表只列 `name`、`description`、`whenToUse`、`override`、`tools`、`disallowedTools` 与 `subagents`，并逐字写 “未知字段会被忽略……其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”。子 Agent 的模型改由 `[secondary_model]` 模型池决定，官方对该节的说明为 “subagent 默认继承 main agent 正在运行的模型。`[secondary_model]` 节把这件事变成可配置的：为 subagent 准备一批候选模型（模型池）并指定默认绑定。”，且 “模型池始终可用，无需任何开启动作；未配置 `[secondary_model]` 时，subagent 继承调用方模型。”字段表四键为 `default_model`（string，无默认值，subagent 的默认模型）、`models`（`table<string, string>`，无默认值，subagent 模型池，key 为 `[models]` 条目别名、value 为挑选提示）、`force`（boolean，默认 `false`，把所有 subagent 固定到 `default_model` 并收回 main agent 的选择权）与 `default_effort`（string，无默认值，每次派生的 subagent 绑定的 Thinking 档位，优先于所绑定模型自带的 `default_effort`）；当前官方字段表没有旧记录里提到的兼容键 `[secondary_model] model`。约束为：配置 `models` 表时 `default_model` 必填且必须是其中的 key，单独写下 `default_model` 就是只含一个条目的池；`models` 的 value 中英文均可、空字符串表示只列出别名不给提示；`force` 必须搭配 `default_model` 且不能与 `models` 表同用（官方理由是 “表的意义在于提供选择，而 force 取消了选择”）；`default_effort` 是节级设置，想按条目区分档位时改用 `[models."<alias>".overrides]` 只覆盖 `default_effort` 的模型「变体」条目；`primary` 是保留字不能作为池 key。配置了池（显式 `models` 表或隐式单条目池）即启用模型选择：`Agent` 与 `AgentSwarm` 工具获得 `model` 参数，工具描述中列出模型池且默认模型标注 `[default]`，main agent 可按次派生挑选。派生时的解析顺序只有两级：1. 工具调用显式传入的 `model`；2. `default_model`。`model` 参数的取值规则为：接受池中任意别名或保留值 `"primary"`（即调用方自己正在运行的模型，始终合法，即使不在池中）；`default_model` 与 `models` 都未配置时该参数不存在，subagent 继承调用方模型；绑定池别名时不继承调用方的 Thinking 档位，本节设了 `default_effort` 就以它为准，否则 `[thinking].enabled = false` 保持关闭 Thinking、开启时依次用所绑定模型条目的 `default_effort`、全局 `[thinking].effort`、所绑定模型 `support_efforts` 的中间项；`"primary"` 连模型带档位一起继承调用方；传入的值既不是池别名也不是 `"primary"` 时本次派生报错并列出可选值。设 `force = true` 后不再提供 `model` 参数（与完全未配置时一样），每次派生都绑定 `default_model`，显式传入 `model`（包括 `"primary"`）会报错。池别名引用 `[models]` 表的当前内容：删除供应商、登出账号或其刷新后的模型列表不再包含某个别名时，会话启动会报出指明失效别名的配置错误，修正或移除对应条目即可恢复，系统不会自动改写 `[secondary_model]` 节。配置错误一律直接报错不做静默回退——`default_model` 缺失、不是池中 key 或池中 key 无法解析到已配置的 `[models]` 条目，以及 `force` 未搭配 `default_model` 或与 `models` 表同时使用时，会话的创建、恢复（resume）与 fork 都在启动时失败。交互式 TUI 里 `/secondary-model`（别名 `/subagent-model`）打开模型选择器，选择后写入 `default_model`（已有 `models` 表而所选别名不在其中时会一并补一条空描述条目），之后派生的 subagent 立即按新默认值绑定、无需重启会话；该命令在官方 Slash 命令表的「随时可用」列为「是」，即流式输出期间也可执行。时间线取自官方变更记录：0.31.0（2026-07-30）新增 `/secondary_model` 命令且当时为实验性、需先在 `/experiments` 中开启；0.36.0（2026-08-13）把实验性的子 Agent 模型配置升级为带描述的模型池（提交 `c9bfe8b2c831`，需 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或实验总开关 `KIMI_CODE_EXPERIMENTAL_FLAG=1`）；0.40.0（2026-09-02）逐字为 “子代理设置（`[secondary_model]`）功能由实验性转为正式。”；0.42.0（2026-09-09）逐字为 “子 Agent 模型池（`[secondary_model]`）现已始终开启，实验开关与 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` 退出选项已移除。”，对应提交 `e831fd1ea948`（PR #3634）；同版另有提交 `bb16383aa15f`（PR #3542）删除旧版 `agent-core` v1 包，`model_preference` frontmatter 与 `KIMI_CODE_LEGACY_FLAG` 因此在当前的 agents、config-files、env-vars 与 slash-commands 四份官方文档中都不再出现。 |
| 作用域 | 显式文件、项目、额外目录、用户、Plugin、内置六级来源；更具体的作用域优先。 |
| 上下文与继承 | 子 Agent 只接收任务描述，在独立上下文中工作，最后把完整结果返回主 Agent。 |
| 工作区隔离 | 当前 Agent 文档未列出每 Agent Worktree 隔离字段。 |
| 运行限制 | `[subagent] timeout_ms` 限制单个 `Agent` subagent 的最长运行时间，默认 7200000 ms（2 小时）、`0` 表示无超时，超时以 `timed_out` 收尾，`KIMI_SUBAGENT_TIMEOUT_MS` 的优先级高于配置文件；`AgentSwarm` 自 0.39.0（2026-08-27 发布）起改用与 `[subagent]` 相互独立的 `[swarm] timeout_ms`（默认同为 7200000 ms、`0` 无超时，`KIMI_CODE_SWARM_TIMEOUT_MS` 覆盖），超时后中止并在聚合报告里标记 `Subagent timed out.`；print 模式（`kimi -p`）下两键未显式设置时都按 `0` 处理，后台 subagent 不受墙钟超时约束。Agent 定义 frontmatter 无独立轮数或超时字段。 |
| 条件与边界 | Subagent 模型池自 0.42.0（2026-09-09 发布）起始终开启，官方逐字为“模型池始终可用，无需任何开启动作；未配置 `[secondary_model]` 时，subagent 继承调用方模型”，`KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` 与实验总开关的退出选项都已移除。旧版 `agent-core` v1 包在同一版被删除，`KIMI_CODE_LEGACY_FLAG` 与只由旧引擎读取的 `model_preference` 字段在当前的 agents、config-files、env-vars 与 slash-commands 四份官方文档里都不再出现；Agent 文件字段表没有 `model`，官方逐字写“其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Agents 文档（Agent 文件字段表没有 `model`，逐字写 “其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/customization/agents.md)、[Kimi Code subagent and secondary model configuration（`[secondary_model]` 模型池已始终开启、`default_effort`、`force` 约束、`/secondary-model` 写入 `default_model`、配置错误直接启动失败）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/configuration/config-files.md)、[Kimi Code Slash 命令参考（`/secondary-model`，别名 `/subagent-model`，写入 `[secondary_model] default_model`，流式输出期间也可用）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/reference/slash-commands.md)、[Kimi Code 官方变更记录（0.36.0 引入模型池为实验性、0.40.0 “子代理设置（`[secondary_model]`）功能由实验性转为正式”、0.42.0 “子 Agent 模型池（`[secondary_model]`）现已始终开启，实验开关与 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` 退出选项已移除”、0.39.0 新增 `[swarm] timeout_ms`）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/release-notes/changelog.md)、[Kimi Code subagent model pool commit](https://github.com/MoonshotAI/kimi-code/commit/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860)、[Kimi Code 移除 Subagent 模型池实验开关的提交（`feat(secondary-model): drop the experimental flag from the subagent model pool (#3634)`，随 0.42.0 发布）](https://github.com/MoonshotAI/kimi-code/commit/e831fd1ea9488ad5192bcc9d96579470cf0c4442)、[Kimi Code 删除旧版 agent-core v1 包的提交（`refactor: remove the legacy agent-core v1 package (#3542)`，随 0.42.0 发布）](https://github.com/MoonshotAI/kimi-code/commit/bb16383aa15f72954224d37ee0b9babb807e03b3) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model`：任意模型名或 `inherit`/`auto`/`lite`/`efficient`/`performance` 别名；省略即 `inherit` |
| 入口与配置 | TUI 用 `/agents` 管理、自然语言或 `@name` 调用；可用 `--agent` 作为会话 Agent，或用 `--agents` 临时注入。 |
| 定义格式 | 持久定义为 Markdown + YAML；`--agents` 接受当前进程有效的 JSON 对象。 |
| 具体行为 | 官方字段表逐字为 `model`｜必填 No｜取值 “Any model name or model alias; common values include `inherit`, `auto`, `lite`, `efficient`, `performance`”｜含义 “Model used by this Subagent. Omitted means `inherit`, using the current session model.”，即省略就是继承当前会话模型。同表的 `temperature` 为 Number，“Model temperature. When omitted, the loader writes a default temperature configuration.”。`--agents` 的 JSON schema 支持 `model`（与 `description`、`prompt`、`tools`、`disallowedTools`、`mcpServers`、`effort`、`color`、`maxTurns`、`initialPrompt`、`skills`、`permissionMode` 并列），但 `timeoutMins`、`temperature`、`hooks`、`memory`、`background` 与 `isolation` 只能用 Markdown 定义。已发现的 Subagent 还能被 `settings.json` 覆盖模型：官方逐字为 “`settings.json` cannot create new Subagents. It only overrides Subagents that have already been discovered. Current overrides support enabled state, model configuration, runtime limits, tool allowlists, and appended MCP servers.”，示例把 `agents.overrides.api-reviewer.modelConfig.model` 设为 `"auto"` 并在 `modelConfig.generateContentConfig.temperature` 里写 `0.2`，官方把 “Give one Subagent a different model and temperature.” 列为常见用途之一。内置 `Explore` 的说明为 “It inherits available tools, removes write and control tools, and uses exploration-oriented model settings.”，官方没有给出单独覆盖内置 Agent 模型的键。官方 Subagent 页没有记录每次调用的模型参数、派生默认模型的配置键或把全部 Subagent 固定到一个模型的开关。 |
| 作用域 | 内置、用户、项目、插件、命令行 Flag 五类来源；同名时 Flag 优先级最高。 |
| 上下文与继承 | 每个 Subagent 有独立上下文、系统提示词、工具注册表、Transcript 和压缩流程。 |
| 工作区隔离 | `isolation: worktree` 在独立 Git Worktree 中运行；省略时使用默认工作区。 |
| 运行限制 | 支持 `maxTurns` 与 `timeoutMins`，并可在 `settings.json` 中覆盖已发现 Agent 的运行限制。 |
| 条件与边界 | 插件 Agent 会移除 `hooks`、`mcpServers`、`permissionMode`；只保留值为 `worktree` 的 isolation。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code Workflows（workflow agent 复用 Subagent 模型解析顺序、脚本为某个 stage 指定的模型算作每次调用值、`availableModels` 拦截时按同一替换规则改跑替代模型）](https://code.claude.com/docs/en/workflows)
- [Claude Code v2.1.296 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` 更新日志（官方环境变量页与 Workflows 页尚未收录该变量）](https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md)
- [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)
- [Qwen Code v0.25.1-preview.2 Subagent 文档（Model Selection 小节：`model` 四种选择器、省略等同 `inherit`、`agents.builtin.exploreModel`、`agents.modelGrades` 与 `agents.allowedGrades`、外部 executor 不支持模型覆盖）](https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/docs/users/features/sub-agents.md)
- [Kimi Code Agents 文档（Agent 文件字段表没有 `model`，逐字写 “其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/customization/agents.md)
- [Kimi Code subagent and secondary model configuration（`[secondary_model]` 模型池已始终开启、`default_effort`、`force` 约束、`/secondary-model` 写入 `default_model`、配置错误直接启动失败）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/configuration/config-files.md)
- [Kimi Code Slash 命令参考（`/secondary-model`，别名 `/subagent-model`，写入 `[secondary_model] default_model`，流式输出期间也可用）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/reference/slash-commands.md)
- [Kimi Code 官方变更记录（0.36.0 引入模型池为实验性、0.40.0 “子代理设置（`[secondary_model]`）功能由实验性转为正式”、0.42.0 “子 Agent 模型池（`[secondary_model]`）现已始终开启，实验开关与 `KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` 退出选项已移除”、0.39.0 新增 `[swarm] timeout_ms`）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/release-notes/changelog.md)
- [Kimi Code subagent model pool commit](https://github.com/MoonshotAI/kimi-code/commit/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860)
- [Kimi Code 移除 Subagent 模型池实验开关的提交（`feat(secondary-model): drop the experimental flag from the subagent model pool (#3634)`，随 0.42.0 发布）](https://github.com/MoonshotAI/kimi-code/commit/e831fd1ea9488ad5192bcc9d96579470cf0c4442)
- [Kimi Code 删除旧版 agent-core v1 包的提交（`refactor: remove the legacy agent-core v1 package (#3542)`，随 0.42.0 发布）](https://github.com/MoonshotAI/kimi-code/commit/bb16383aa15f72954224d37ee0b9babb807e03b3)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [Agent 推理强度](./agent-effort.md)
- [配置格式](./agent-config.md)
- [内置 Agent](./agent-builtins.md)
- [模型选择与切换](../models/model-switch.md)
