# 工具延迟声明与按需发现

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-tool-discovery)

> 核对日期：2026-10-12

## 定义

把部分工具的完整声明从每轮请求的函数列表里撤下，只留下名称级线索，模型需要时用一个发现工具取回完整 schema 再调用，用来压低常驻上下文占用。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | MCP 工具默认全部延迟 · 内置 `ToolSearch` · `ENABLE_TOOL_SEARCH` 取 `true`/`auto`/`auto:N`/`false` · Server `alwaysLoad` 与工具 `_meta["anthropic/alwaysLoad"]` 豁免 | 官方确认 |
| Codex | MCP 工具始终延迟 · 内置 `tool_search`（BM25，`limit` 默认 8）· `tool_search` 与 `tool_search_always_defer_mcp_tools` 开关已移除、没有关闭入口 | 源码确认 |
| Qwen Code | `tools.toolSearch.enabled` 默认 `true` · `tool_search` + `tool_call` 桥 · MCP、`agent`/`list_agents`/Goal、`task_stop`、`monitor`、cron 默认延迟 · `tools.eager`/`tools.visible`/`tools.toolSearch.threshold` 调节 | 官方确认 |
| Kimi Code | 条件：Server 条目 `deferred: true` + `tool-select` 实验标志 + 模型声明 `dynamically_loaded_tools` · 内置 `select_tools` 按精确名加载 | 条件项 |
| Qoder CLI | 条件：`mcp.lazyLoad` 默认 `false` 且需重启，或 `QODER_MCP_LAZY=1` · 开启后只暴露 `mcp_list`／`mcp_get`／`mcp_call` 三个 Meta Tools · 只覆盖 MCP 工具 | 条件项 |

## 比较边界

### 本页包含

- 哪些工具默认延迟、哪些始终常驻、哪些可以逐个豁免
- 发现工具的名字、查询形式、参数、返回内容与排序或打分方式
- 打开或关闭延迟声明的配置键、环境变量、默认值与是否需要重启
- 延迟声明对提示词缓存前缀、Subagent、恢复会话与中途连上的 Server 的影响

### 本页不包含

- 工具本身的执行行为、审批规则与沙箱边界
- MCP Server 的传输、认证、连接状态与工作区信任
- Skills 的渐进披露与按需加载正文
- 上下文占用统计命令、压缩阈值与记忆调度

## 跨产品事实

1. 五家都把「声明」和「可用」拆开：被延迟的工具仍然注册、仍然可以调用，只是不在首轮请求的函数列表里；发现工具取回的是 schema 而不是执行权限，调用仍走各自的审批与沙箱。
2. 延迟范围分两档：Codex、Kimi Code 与 Qoder CLI 的官方资料只覆盖 MCP 工具，Claude Code 官方文档也只写 MCP 工具；只有 Qwen Code 把延迟扩到内置工具，v0.25.1 起 `agent`、`list_agents`、`get_goal`、`update_goal` 与 `propose_goal` 也默认延迟，`task_stop`、`monitor`、`computer_use__*` 与 cron/loop 工具同样按需加载。
3. 默认状态分三档：Codex 始终开启且 `tool_search` 与 `tool_search_always_defer_mcp_tools` 两个特性开关都已移除、没有用户关闭入口；Claude Code 与 Qwen Code 默认开启但可以关（`ENABLE_TOOL_SEARCH=false`、`tools.toolSearch.enabled: false`）；Kimi Code 与 Qoder CLI 默认关闭，Kimi 还要实验标志加模型能力两个前提。
4. 发现工具的形态分四类：Codex `tool_search` 用 BM25 排序、参数是 `query` 与 `limit`（默认 8）；Qwen Code `tool_search` 支持 `select:Name1,Name2` 精确取名、关键词打分（默认最多 5 条、硬上限 20）与 `+must-word` 必含词；Kimi Code `select_tools` 只接受精确工具名数组、不做关键词检索；Qoder CLI 拆成 `mcp_list`、`mcp_get`、`mcp_call` 三个 Meta Tools。Claude Code 的 `ToolSearch` 在官方工具参考里只有一句描述，没有公开查询参数与排序方式。
5. 调用路径分两类：Claude Code、Codex 与 Kimi Code 在加载后由模型直接按本名调用工具；Qwen Code 要求经 `tool_call` 桥调用仍未声明的工具，官方给出的理由是让声明列表逐字节稳定、保住提示词缓存前缀。Qoder CLI 的 `mcp_call` 从名字看像是第三条路径，但官方没有写明它与直接调用的关系。
6. 豁免入口各不相同：Claude Code 有 Server 级 `alwaysLoad` 与工具级 `_meta["anthropic/alwaysLoad"]` 两层，Qwen Code 有 `tools.visible` 与 `tools.toolSearch.threshold` 预载预算，Kimi Code 靠「不写 `deferred` 即始终内联」的逐 Server 选择；Codex 没有任何豁免键（MCP 工具始终延迟），Qoder CLI 的 `mcp.lazyLoad` 与 `QODER_MCP_LAZY` 都是全局开关，官方资料没有给出单个 Server 或单个工具的豁免方式。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | MCP 工具默认全部延迟 · 内置 `ToolSearch` · `ENABLE_TOOL_SEARCH` 取 `true`/`auto`/`auto:N`/`false` · Server `alwaysLoad` 与工具 `_meta["anthropic/alwaysLoad"]` 豁免 |
| 入口与配置 | 没有 Slash 命令入口。模型侧入口是内置 `ToolSearch` 工具，官方工具参考的描述逐字为 “Searches for and loads deferred tools when tool search is enabled”、Permission required 列为 “No”；用户侧靠 `ENABLE_TOOL_SEARCH` 环境变量或 settings.json 的 `env` 字段调节，也可以用 `permissions.deny: ["ToolSearch"]` 单独禁用这个工具。 |
| 文件与目录 | 开关写在进程环境变量或 settings.json 的 `env` 字段；Server 级豁免写在 MCP 配置里该 Server 的条目（例如 `.mcp.json` 的 `alwaysLoad`），官方说明该字段对所有 Server 类型都可用；工具级豁免由 Server 作者在 `tools/list` 条目的 `_meta` 里声明 `"anthropic/alwaysLoad"`。 |
| 具体行为 | 官方逐字为 “Tool search keeps MCP context usage low by deferring tool definitions until Claude needs them. Only tool names and server instructions load at session start, so adding more MCP servers has minimal impact on your context window.”，并明确 Claude Code 不设固定的每 Server 工具上限、实际限制是上下文窗口预算。Server 在 Claude 工作过程中连上时，Claude Code 在同一次请求里把该 Server 的工具名报给模型，模型不必等下一条用户消息就能搜索并调用；Server 连接失败时，开启工具搜索会把失败的 Server 名与连接错误告诉模型，同样的信息也会出现在没有命中任何工具的 `ToolSearch` 结果里，而在任何未启用工具搜索的配置下 Claude Code 不向模型报告连接失败。工具搜索关闭时改由 `WaitForMcpServers` 工具等待仍在连接的 Server，该工具只在工具搜索关闭时出现。 |
| 作用域与优先级 | 作用于当前会话发往模型的请求，只覆盖 MCP 工具；官方文档没有把 Claude Code 自己的内置工具、Skill 或 Subagent 定义列入这条延迟路径。 |
| 扩展构成 | 内置 `ToolSearch` 工具、`ENABLE_TOOL_SEARCH` 环境变量、Server 级 `alwaysLoad`、工具级 `_meta["anthropic/alwaysLoad"]`、描述长度上限 `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH`、`permissions.deny` 对 `ToolSearch` 的禁用；插件 mods 的 `$.tool.register` 另有 `isDeferred` 参数（v2.1.293 加入，官方更新日志逐字为 “`false` lists the tool schema in the prompt from the start instead of behind tool search”）。 |
| 加载与刷新 | 按 `ENABLE_TOOL_SEARCH` 的取值在启动时决定延迟还是预载：未设时全部 MCP 工具延迟并按需加载，`true` 始终延迟并发送 beta 头，`auto` 在定义总量不足上下文窗口 10% 时预载、达到 10% 后全部延迟，`auto:N` 用自定义百分比（N 取 0-100，例如 `auto:5`），`false` 全部预载。`alwaysLoad: true` 的 Server 会让启动等待它的工具，上限是标准 5 秒连接超时；带有效 `cached` 条目的远程 Server 从发现缓存供工具因而不阻塞启动，其他 Server 默认在后台连接，`MCP_CONNECTION_NONBLOCKING=0` 可让启动一并等待。v2.1.287 起 `"alwaysLoad": false` 把该 Server 的全部工具（包括作者标记为上送的工具）留在工具搜索之后。 |
| 适用界面 | 以 Claude Code CLI 为准。`claude -p` 与 Agent SDK 运行中若某个已配置 Server 需要认证，Claude Code 会告诉模型该 Server 的工具在授权前不可用，模型据此点名需要登录的 Server；交互式会话则用 `/mcp` 或 `claude mcp login <name>` 完成授权。 |
| 权限与信任 | 延迟只改变声明时机，不改变审批：取回 schema 后的工具调用仍按权限规则与审批模式执行。`ToolSearch` 自身不需要权限，但可以被 `permissions.deny` 规则整体禁用。 |
| 条件与边界 | 需要模型支持 `tool_reference` 块，官方点名 Claude Sonnet 4.5、Claude Haiku 4.5、Claude Opus 4.5 及更新模型；`ANTHROPIC_BASE_URL` 指向非第一方主机时默认关闭（多数代理不转发 `tool_reference`），需要显式设 `ENABLE_TOOL_SEARCH` 覆盖；Microsoft Foundry 托管在 Azure 的部署由服务端拒绝，Claude Code 检测到拒绝后改为预载，`ENABLE_TOOL_SEARCH` 也压不过；Google Cloud 的 Agent Platform 上早于 Claude 4.5 代的模型始终预载、`ENABLE_TOOL_SEARCH=true` 无效（v2.1.221 之前该平台所有模型都默认关闭）；设了 `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` 时工具搜索保持关闭且用户自设的 `ENABLE_TOOL_SEARCH` 被忽略，该变量还会剥掉 `defer_loading` 一类 beta 工具 schema 字段，组织可在 v2.1.227 及以上用 managed settings 保持开启。描述截断存在一手资料冲突：MCP 页与环境变量页都写默认 2,048 字符（`CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` 需 v2.1.280 及以上），而更新日志 v2.1.295 把经工具搜索加载的 MCP 工具描述改为截断在 16,384 字符、v2.1.296 把上送描述与 Server instructions 的默认上限从 2,048 改为 4,096，两个文档页在核对日期都没有跟进。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code MCP](https://code.claude.com/docs/en/mcp)、[Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code 更新日志（工具搜索版本时间线：v2.1.7 auto 模式默认开启并按 10% 上下文阈值延迟、v2.1.9 `auto:N`、v2.1.119 Vertex AI 默认关闭、v2.1.121 Server `alwaysLoad`、v2.1.221 Vertex 对 4.5 代及以上重新启用、v2.1.285 工具级 `_meta` 与 Server 级 `alwaysLoad` 的覆盖关系、v2.1.287 Server `alwaysLoad: false` 延迟该 Server 全部工具、v2.1.293 mods `$.tool.register` 的 `isDeferred`、v2.1.295 经工具搜索加载的描述改为 16,384 字符、v2.1.296 上送描述与 Server instructions 默认上限由 2,048 改为 4,096，固定到 v2.1.296）](https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | MCP 工具始终延迟 · 内置 `tool_search`（BM25，`limit` 默认 8）· `tool_search` 与 `tool_search_always_defer_mcp_tools` 开关已移除、没有关闭入口 |
| 入口与配置 | 没有 Slash 命令入口，也没有用户可关的开关。模型侧入口是内置 `tool_search` 工具，工具描述以 “# Tool discovery” 开头，正文逐字为 “Searches over deferred tool metadata with BM25 and exposes matching tools for the next model call.”，并要求 MCP 工具发现一律用 `tool_search` 而不是 `list_mcp_resources` 或 `list_mcp_resource_templates`。 |
| 文件与目录 | 特性开关的位置是 `config.toml` 的 `features` 表：`codex-rs/core/config.schema.json` 在顶层与 `ConfigProfile` 各列出 `features.tool_search`、`features.tool_search_always_defer_mcp_tools` 与 `features.code_mode_tool_search` 三个 boolean，但 schema 没有给默认值或描述。官方 Configuration reference 只在 “Local computer access with Work Cloud compatibility limits” 表里提到前两个键。 |
| 具体行为 | 参数只有两个：`query`（string，描述 “Search query for deferred tools.”，必填，trim 后为空报 “query must not be empty”）与 `limit`（number，描述 “Maximum number of tools to return. Defaults to 8.”，缺省取 `TOOL_SEARCH_DEFAULT_LIMIT = 8`，为 0 报 “limit must be greater than zero”），`additionalProperties` 为 false。结果按 BM25 排序取前 `limit` 条，以 `{"tools": [...]}` 形状返回可加载声明（`LoadableToolSpec`）；没有任何可搜索来源时直接返回空 `tools` 数组。工具描述里还会附一段可搜索来源清单，逐字为 “You have access to tools from the following sources:” 加每行 `- <name>: <description>`，来源描述合计预算是 `MAX_TOOL_SEARCH_SOURCE_DESCRIPTION_BYTES = 512 * 1024` 字节，超预算的来源描述被按字符边界截断，一个来源都没有时写 “None currently enabled.”。 |
| 作用域与优先级 | 作用于当前会话的工具声明，被延迟的是 MCP 工具：`Feature::ToolSearchAlwaysDeferMcpTools` 的源码注释逐字为 “Removed compatibility flag. MCP tools are always deferred when tool_search is available.”。另有 Connector 与 Plugin 两类可发现项（`DiscoverableTool`）以及 `list_available_plugins_to_install`、`request_plugin_install` 两个发现工具名常量，属于安装建议而不是延迟声明。 |
| 扩展构成 | 内置 `tool_search` 工具与处理器、`LoadableToolSpec` 可加载声明、`ToolSearchSourceInfo` 来源清单、`DiscoverableTool` 可发现项、`features.tool_search` 与 `features.tool_search_always_defer_mcp_tools` 两个已移除的兼容开关、`features.code_mode_tool_search` 与 `features.deferred_tool_world_state` 两个开发中开关。 |
| 加载与刷新 | 延迟在构建工具列表时生效，命中后在“下一次模型调用”暴露匹配工具；`codex-rs/state/migrations/0019_thread_dynamic_tools_defer_loading.sql` 表明动态工具的延迟加载状态随线程持久化，`codex-rs/core/tests/suite/snapshots/` 下另有 `deferred_tools_initial_unchanged_and_removed`、`deferred_tools_recover_during_sampling` 与 `deferred_tools_resume_without_duplicate_update` 三个快照覆盖初始声明、采样中途恢复与恢复会话不重复更新。 |
| 适用界面 | 以 Codex CLI 为准。JavaScript code mode 里的排序工具发现由独立开关 `code_mode_tool_search` 控制，源码注释逐字为 “Expose ranked tool discovery inside JavaScript code mode.”，`Stage::UnderDevelopment` 且 `default_enabled: false`；处理器里 code mode 走 `search_code_mode` 分支，返回 `CodeModeSearchResult` 并受 `code_mode.tool_input_schema_max_bytes` 与 `Feature::CodeModeToolDescriptionFirst` 影响。 |
| 权限与信任 | 延迟只改变声明时机；工具调用仍按 Codex 的审批策略与沙箱配置执行，官方资料没有把 `tool_search` 与审批规则关联。 |
| 条件与边界 | 官方用户文档没有专门介绍工具搜索：Configuration reference 只在 managed requirements 的兼容性表里写 “Retired switches such as `tool_search` = false, `tool_search_always_defer_mcp_tools` = false, `js_repl` = true, and `remote_control` = true are rejected.”，该行对应的 Setting or family 是 “features / `feature_requirements`, models, `computer_use`”、兼容性列写 “Partial.”。源码侧 `Feature::ToolSearch` 是 `Stage::Removed`、注释为 “Removed compatibility flag retained as a no-op now that tool_search is always enabled.”，旧配置解析对 `tool_search` 与 `tool_search_always_defer_mcp_tools` 两个键直接 `continue` 跳过，因此没有用户可用的关闭入口。`deferred_tool_world_state`（在模型可见的 world state 里描述被延迟的工具命名空间）与 `incremental_tools`（在 world state 里跟踪顶层工具定义并发出增量上下文更新）都还是 `Stage::UnderDevelopment`、默认关闭。官方 Release 最新为 rust-v0.162.1（2026-10-09T19:44:51Z），上述源码坐标是 2026-10-12 的 main 分支。 |
| 证据状态 | 源码确认 |
| 来源 | [Codex `tool_search` 工具声明源码（描述逐字为 “Searches over deferred tool metadata with BM25”、`query` 与 `limit` 两个参数、来源清单渲染与 512 KiB 来源描述预算，main `7c1b64c5df07`）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/src/tools/handlers/tool_search_spec.rs)、[Codex `tool_search` 处理器源码（`limit` 缺省取 `TOOL_SEARCH_DEFAULT_LIMIT`、空 query 报 “query must not be empty”、`limit` 为 0 报 “limit must be greater than zero”、code mode 分支与 `{"tools": [...]}` 结果形状）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/src/tools/handlers/tool_search.rs)、[Codex 工具发现常量与可发现项源码（`TOOL_SEARCH_TOOL_NAME = "tool_search"`、`TOOL_SEARCH_DEFAULT_LIMIT = 8`、`list_available_plugins_to_install` 与 `request_plugin_install` 两个发现工具名、Connector 与 Plugin 两类 `DiscoverableTool`）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/tools/src/tool_discovery.rs)、[Codex 特性开关源码（`tool_search` 与 `tool_search_always_defer_mcp_tools` 均为 `Stage::Removed` 且注释写明工具搜索始终启用、MCP 工具始终延迟，`code_mode_tool_search` 与 `deferred_tool_world_state` 为 `Stage::UnderDevelopment` 且默认关闭，旧配置解析对这两个键直接跳过）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/features/src/lib.rs)、[Codex `config.schema.json`（`features.tool_search`、`features.tool_search_always_defer_mcp_tools` 与 `features.code_mode_tool_search` 三个 boolean，顶层与 `ConfigProfile` 各一份）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/config.schema.json)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `tools.toolSearch.enabled` 默认 `true` · `tool_search` + `tool_call` 桥 · MCP、`agent`/`list_agents`/Goal、`task_stop`、`monitor`、cron 默认延迟 · `tools.eager`/`tools.visible`/`tools.toolSearch.threshold` 调节 |
| 入口与配置 | 模型侧入口是内置 `tool_search`（显示名 `ToolSearch`）与 `tool_call`（显示名 `ToolCall`）两半桥。用户侧入口是 settings.json 的 `tools.toolSearch.enabled`、`tools.toolSearch.threshold`、`tools.eager`、`tools.visible`、`tools.disabled` 与 `tools.discoveryCommand`；`/tools` 仍然列出被延迟的工具，`/context` 用来复核实际占用。 |
| 文件与目录 | 键写在 settings.json：用户 `~/.qwen/settings.json`、项目 `.qwen/settings.json` 与系统作用域合并，`tools.eager` 与 `tools.visible`、`tools.disabled` 的合并规则不同（后两者按作用域取并集，`tools.eager` 是后作用域整体替换前面的列表）。`tools.toolSearch.enabled` 与 `tools.toolSearch.threshold` 都标注 “Requires restart: Yes”，`tools.eager` 同样写明需要重启。 |
| 具体行为 | 工具描述逐字为 “Reviews function declarations for deferred tools without changing the active tool list.”，并说明被延迟的工具只在 deferred-tools 启动提醒里按名字出现，`tool_search` 接受一个查询、与被延迟工具列表匹配后把命中工具的 name + description + parameter schema 放在 `<functions>` 块里返回；该块是信息性的，看过 schema 后要用 `tool_call` 按精确名与 schema 形状的参数调用，不要直接调仍未声明的工具（它的声明保持隐藏，好让模型侧工具列表与提示词缓存前缀稳定），而 `select:` 命中的工具如果本来就已声明就直接调用、`tool_call` 只接受隐藏的延迟工具。查询有三种形式：“select:ToolA,ToolB” 按精确名取、“keyword phrase” 关键词搜索（最多 `max_results` 条）、“+must-word other” 要求名字里含该词再给其余词排序。空查询报 “Error: query is empty. Use `select:ToolName` or free-text keywords.”，分词后没有可用词报 “Error: no search terms extracted from query.”。 |
| 作用域与优先级 | 默认延迟的范围覆盖全部 MCP 工具（`mcp__*`）、Computer Use 家族（`computer_use__*`）、`task_stop`、`monitor` 与 cron/loop 工具（`cron_create` 构造参数里 `shouldDefer` 为 `true`、注释为 “scheduling is infrequent”，并带搜索提示词 `cron schedule reminder recurring timer`），以及 v0.25.1 起默认延迟的 `agent`、`list_agents`、`get_goal`、`update_goal` 与 `propose_goal`。豁免清单是 `tool_search` 与 `tool_call`（桥的两半）、`structured_output` 与 plan-mode 生命周期工具（`enter_plan_mode`、`exit_plan_mode`、`ask_user_question`），它们无论 `tools.eager` 怎么写都保持正常加载行为。 |
| 扩展构成 | 内置 `tool_search` 与 `tool_call` 桥、`tools.eager` 允许清单、`tools.visible` 强制上送、`tools.disabled` 注册期移除、`tools.discoveryCommand` 发现的外部工具、`tools.toolSearch.threshold` 预载预算；Code Mode（`tools.codeModeOnly`）下改用另一段描述，发现走顶层 `tool_search`、调用走 `exec`，搜索结果不改变工具声明。 |
| 加载与刷新 | 关键词模式按打分排序：名字精确命中内置工具 10 分、MCP 工具 12 分，名字子串内置 5 分、MCP 6 分，`searchHint` 命中 4 分，动作别名 6 分，描述命中 2 分；`DEFAULT_MAX_RESULTS = 5`、`HARD_MAX_RESULTS = 20`，分词会剔除 `the`/`please`/`what` 一类停用词，并把 `cancel`/`clear`/`delete`/`remove`/`stop` 互为别名。`tools.toolSearch.threshold` 默认 `0`，表示不做阈值预载、普通延迟工具留在桥后面（代价是首次使用前多一次 `tool_search` 往返）；抬到 `N` 后，当全部候选延迟 schema 能放进上下文窗口的 `N%` 时一次性全部上送、否则继续留在桥后，预载对候选池是「全有或全无」，且被 `tools.eager` 降级的工具永远不参与预载。预载在会话启动时跑，而 MCP Server 通常在其后才连上，所以新启动的会话无论阈值多少都不声明 MCP 工具，它们从下一次会话启动（CLI 里是 `/clear` 之后）才参与预载，`QWEN_CODE_LEGACY_MCP_BLOCKING=1` 下立即参与。 |
| 适用界面 | 以 Qwen Code CLI 为准，但官方提醒设置的作用范围会外溢：“Settings apply to every client that reads them (CLI, Web Shell, serve)”，因此按部署定制工具面需要单独的设置作用域。ACP host 另有一处例外：PR #13033 说明 ACP host 会在具备审批能力的用户回合上临时暴露 `propose_goal`。 |
| 权限与信任 | 桥不绕过权限。`tools.toolSearch.enabled: false` 同时移除两半桥；`tool_search` 或 `tool_call` 的 deny 规则、`--exclude-tools` 条目或 `tools.disabled` 条目移除其中一半时，`tools.eager` 仍然扣住 schema，但没有东西能把它们加载回来，被扣的工具不再提供给模型（会记一条警告），它们仍然注册、`/tools` 仍列出、按名字直接调用仍走正常审批，只有同时写在 `tools.visible` 里的工具例外；这种情况下普通延迟工具（全部 MCP 工具与延迟的 Computer Use 家族）反而被强制上送进每次请求。`permissions.allow` 与审批模式不省任何声明，前者是纯自动批准。`tools.disabled` 与整工具 `permissions.deny` 才是真正移除，MCP 工具对 deny 式移除豁免、要用每 Server 的 `includeTools`/`excludeTools` 或 `tools.disabled`。 |
| 条件与边界 | 两半桥缺一即失效。Subagent 不声明显式工具列表时会拿到每个已注册工具的 schema（含延迟工具）且不走 ToolSearch，能影响它的只有 `tools.eager` 与 `permissions.deny`，预载阈值不能。恢复会话时，历史里出现过的被扣工具会自动取回 schema，被 deny 的工具不会。声明列表并非不可变：resume、MCP 发现、会话内首次进入 plan mode、Subagent 定义变化这几类工具集刷新，只要实时历史里有对仍未声明工具的直接调用就会重新声明它；Subagent 定义变化还会改写 agent 工具自身的描述；MCP Server 在会话中途以 `alwaysLoadTools: true` 注册时同样会重新声明——而重新声明会移动提示词缓存前缀。文档边界：官方 MCP 文档（`docs/users/features/mcp.md`）在 v0.25.1 下完全没有提到延迟声明或 `tool_search`，`alwaysLoadTools` 在整个设置参考里只出现在 `tools.toolSearch.enabled` 的描述中一次、没有独立的设置行；`tools.core` 已标注 Deprecated、将在下个版本移除。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code v0.25.1 设置参考（`tools.toolSearch.enabled` 默认 `true`、`tools.toolSearch.threshold` 默认 `0`、`tools.eager`、`tools.visible`、`tools.disabled`、`tools.discoveryCommand`、`tools.core` 迁移说明与 `permissions.allow` 行，标签 `v0.25.1`，提交 `c1a8218f3820`）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/configuration/settings.md)、[Qwen Code v0.25.1 上下文成本文档（`tool_search` → `tool_call` 桥、豁免工具清单、桥缺一半时的回退、Agent 与 Goal 默认延迟、Subagent 不走 ToolSearch、恢复会话与工具集刷新会重新声明）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/features/context-cost.md)、[Qwen Code v0.25.1 `tool_search` 源码（`DEFAULT_MAX_RESULTS = 5`、`HARD_MAX_RESULTS = 20`、名字精确命中内置 10 与 MCP 12、子串 5 与 6、`searchHint` 4、动作别名 6、描述 2、停用词表、`select:` 与 `+` 前缀两种查询模式、Code Mode 专用描述）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/tool-search.ts)、[Qwen Code v0.25.1 工具名与显示名映射源码（`tool_search` → `ToolSearch`、`tool_call` → `ToolCall`、`agent`、`list_agents`、`get_goal`、`update_goal`、`propose_goal`）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/tool-names.ts)、[Qwen Code v0.25.1 设计文档 `default-deferred-coordination.md`（把 `agent`、`list_agents`、`get_goal`、`update_goal`、`propose_goal` 标为原生延迟，不新增设置、不改 schema、不改执行与审批语义）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/design/default-deferred-coordination.md)、[Qwen Code PR #13033（feat(core): defer agent and goal declarations by default，2026-10-06T04:13:29Z 合入 main，合并提交 `8e3f3923b8c8`）](https://github.com/QwenLM/qwen-code/pull/13033)、[Qwen Code v0.25.1 发布说明（2026-10-11，Features 段逐字为 “Agent and Goal coordination tools are now deferred by default and discovered on demand, reducing unnecessary tool declarations in ordinary tool-call sessions.”）](https://github.com/QwenLM/qwen-code/releases/tag/v0.25.1)、[Qwen Code v0.25.1 `cron_create` 工具源码（构造参数里的 `shouldDefer` 为 `true`、注释 “scheduling is infrequent”、`alwaysLoad` 为 `false`、搜索提示词 `cron schedule reminder recurring timer`）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/cron-create.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：Server 条目 `deferred: true` + `tool-select` 实验标志 + 模型声明 `dynamically_loaded_tools` · 内置 `select_tools` 按精确名加载 |
| 入口与配置 | 没有 Slash 命令入口。在 `mcp.json` 的 Server 条目里写 `deferred: true`，再打开 `tool-select` 实验标志：环境变量 `KIMI_CODE_EXPERIMENTAL_TOOL_SELECT=1`，或 `config.toml` 的 `[experimental]` 下写 `tool-select = true`，总开关 `KIMI_CODE_EXPERIMENTAL_FLAG=1` 也会一并启用。模型侧入口是内置 `select_tools`。 |
| 文件与目录 | Server 字段在用户级 `$KIMI_CODE_HOME/mcp.json`（默认 `~/.kimi-code/mcp.json`）或项目级 `.kimi-code/mcp.json` 的该 Server 条目里，与 `enabled`、`startupTimeoutMs`、`toolTimeoutMs`、`enabledTools`、`disabledTools` 并列，`deferred` 适用列写「全部」（stdio、HTTP 与 SSE）。实验标志在环境变量或 `config.toml` 的 `[experimental]`，模型能力在 `config.toml` 的 `capabilities`。 |
| 具体行为 | 官方逐字为「默认情况下，server 的所有工具都会直接进入模型的顶层工具列表；接入的 server 较多、或单个 server 暴露的工具较多时，这些工具定义会持续占用上下文。把 server 标记为 deferred 后，它的工具不再进入顶层工具列表：模型先看到一份可加载工具清单，需要时通过内置的 `select_tools` 工具加载完整定义，并可在同一回合内直接调用。」`select_tools` 的入参只有 `names`（字符串数组、`min(1)`、schema 为 `strict()`，描述逐字为 “Exact tool names to load, taken from the latest announced tool list.”）；工具描述要求名字取自系统上下文里的 `<tools_added>`/`<tools_removed>` 公告并按顺序折叠得到当前清单，插件名、Skill 名或分类名都不接受，已可用的工具要直接调用而不是传给 `select_tools`。执行结果按行拼装：`Loaded: <names>`、`Already available: <names>`、对已可调用的名字给 “"<name>" is already available — call it directly; select_tools is only for names in the <tools_added> announcements.”、对未知名字给 “Unknown tool: <name>. Did you mean: <candidates>?”，没有候选时按可加载数量给 “No tools can be loaded in this session — use the tools you already have.”（一个都加载不了时）或 “Loadable tools: <names>.”（可加载项不超过 5 个时）或 “Pick from the latest announced tools list.”；三类命中都为空时 `isError` 为真。 |
| 作用域与优先级 | 只作用于标了 `deferred: true` 的那些 MCP Server 的工具。未写 `deferred` 的 Server 不受影响、工具始终直接暴露；需要 OAuth 的 Server 在授权完成前暴露的认证工具也遵循同一字段。内置工具、Skill 工具与 Plugin 自带的其他组件不走这条路径。 |
| 扩展构成 | Server 级 `deferred` 字段、`tool-select` 实验标志、模型 `dynamically_loaded_tools` 能力标签、内置 `select_tools` 工具与 `<tools_added>`/`<tools_removed>` 公告。同一条目上的 `enabledTools`/`disabledTools` 是另一层工具过滤，与延迟声明无关。 |
| 加载与刷新 | 两个前提同时满足才生效：`tool-select` 实验标志开启，且当前模型声明 `dynamically_loaded_tools` 能力——官方模型自动声明，其他模型要在 `config.toml` 的 `capabilities` 里追加，该数组「只能追加不能移除」。加载成功后完整定义立即可用，可以在下一次工具调用里直接调用。 |
| 适用界面 | 以 Kimi Code CLI 为准。官方文档没有区分 ACP、Web UI、桌面端或 SDK 下 `deferred` 与 `select_tools` 是否同样生效。 |
| 权限与信任 | `select_tools` 的审批规则名就是工具自身（源码里 `approvalRule: this.name`），执行描述为 “Loading <names>”。延迟只改变声明时机，MCP 工具调用仍按 `[[permission.rules]]` 与当前权限模式审批；官方同时提醒 Ask When Needed 模式下 MCP 工具调用会自动批准。 |
| 条件与边界 | 官方明确标注为实验功能，前提缺失时 `deferred` 字段被忽略、行为与不写相同；模型不支持时 `select_tools` 执行返回 “select_tools is not available for the current model.” 且 `isError` 为真。文档之间存在缺口：`docs/zh/configuration/config-files.md` 与英文版都把整个 `## experimental` 段落包在 HTML 注释里（站点不渲染），注释内也只写 `micro_compaction` 是「唯一用户可见的字段」、没有列 `tool-select`；`docs/en/reference/tools.md` 的工具清单同样没有 `select_tools`。Kimi Code 最新 Release 仍是 2026-09-24 的 2.1.1，本次证据坐标是 2026-10-12 的 main 分支。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code MCP 文档「按需加载工具」段与 Server `deferred` 字段（main `cbd754049a11`，两个前提、`select_tools` 加载、未标 `deferred` 的 Server 始终内联、OAuth 认证工具同样遵循该字段）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/docs/zh/customization/mcp.md)、[Kimi Code 环境变量文档（`KIMI_CODE_EXPERIMENTAL_TOOL_SELECT` 与总开关 `KIMI_CODE_EXPERIMENTAL_FLAG` 的取值，main `cbd754049a11`）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/docs/zh/configuration/env-vars.md)、[Kimi Code 配置文档（`capabilities` 可追加 `dynamically_loaded_tools` 且只能追加不能移除；`## experimental` 整段被包在 HTML 注释里、站点不渲染，注释内也只列 `micro_compaction`，main `cbd754049a11`）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/docs/zh/configuration/config-files.md)、[Kimi Code `select_tools` 工具源码（`SELECT_TOOLS_TOOL_NAME = "select_tools"`、描述要求名字取自 `<tools_added>`/`<tools_removed>` 公告、`approvalRule` 为工具自身、模型不支持时返回 “select_tools is not available for the current model.”）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/packages/agent-core-v2/src/agent/tools/select-tools/selectToolsTool.ts)、[Kimi Code `select_tools` 入参 schema 源码（`names` 为字符串数组、`min(1)`、描述 “Exact tool names to load, taken from the latest announced tool list.”、`strict()`）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/packages/agent-core-v2/src/agent/tools/select-tools/select-tools.ts) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：`mcp.lazyLoad` 默认 `false` 且需重启，或 `QODER_MCP_LAZY=1` · 开启后只暴露 `mcp_list`／`mcp_get`／`mcp_call` 三个 Meta Tools · 只覆盖 MCP 工具 |
| 入口与配置 | 没有 Slash 命令入口。开关是设置项 `mcp.lazyLoad` 或环境变量 `QODER_MCP_LAZY=1`；模型侧入口是三个 Meta Tools `mcp_list`、`mcp_get` 与 `mcp_call`，官方内置能力参考没有单独列出这三个工具。 |
| 文件与目录 | `mcp.lazyLoad` 出现在官方设置参考的 `mcp` 分组，与 `mcp.allowed`、`mcp.excluded`、`mcp.enableAllProjectMcpServers`、`mcp.enabledProjectMcpServers` 并列；同页环境变量表另有 `QODER_MCP_LAZY` 一行，描述逐字为 “Enables MCP Lazy Loading when set to `1`.”。设置文件分用户 `~/.qoder/settings.json`、项目 `<project>/.qoder/settings.json` 与本地 `<project>/.qoder/settings.local.json` 三层，命令行 `--settings` 优先级最高，`QODER_CONFIG_DIR` 可改默认配置目录。 |
| 具体行为 | 官方 MCP reference 的 “Lazy Loading Mode” 段逐字为 “When multiple MCP servers are connected, all tool schemas are registered at startup by default, which may consume a significant number of Prompt Tokens in the first turn. When lazy loading is enabled (`mcp.lazyLoad: true` or `QODER_MCP_LAZY=1`), the CLI exposes only three Meta Tools (`mcp_list` / `mcp_get` / `mcp_call`) and loads the actual tools on demand, saving token overhead.”；设置参考对 `mcp.lazyLoad` 的描述逐字为 “Lazy load MCP tools (exposes Meta Tool).”。官方没有给出三个 Meta Tools 各自的参数、返回内容与排序方式，也没有写明 `mcp_call` 之前是否必须先经 `mcp_get` 取回 schema。 |
| 作用域与优先级 | 只覆盖 MCP 工具：默认状态是多个 MCP Server 接入时在启动注册全部工具 schema，开启后改为按需加载。内置工具、Skill 工具与 Plugin 组件是否也能延迟未确认。 |
| 扩展构成 | 一个布尔设置项 `mcp.lazyLoad`、一个环境变量 `QODER_MCP_LAZY`，以及 `mcp_list`、`mcp_get`、`mcp_call` 三个 Meta Tools；官方资料没有给出单个 Server 或单个工具的豁免键。 |
| 加载与刷新 | 类型 boolean、默认 `false`、Restart 列标注 “Yes”，即改动需要重启 Qoder CLI 才生效。官方 Settings 页写明未标注 “requires restart” 的项通常立即生效、标注了的必须重启，同一页的 `mcpServers` 与 `mcp.allowed` 描述里也各自带着 “(requires restart)”。 |
| 适用界面 | 以 Qoder CLI 为准。官方文档没有区分 ACP（`qodercli --acp`）、Agent SDK、Cloud Mode 或 Remote Control 下 `mcp.lazyLoad` 是否同样生效。 |
| 权限与信任 | 官方 MCP reference 的 Permissions and Security 段写明 MCP 工具与内置工具一样由权限系统管理、调用前需要用户确认（`auto` 与 `bypass_permissions` 模式除外），同段还列出 `--allowed-mcp-server-names`、`--strict-mcp-config` 与 `mcp.allowed`／`mcp.excluded` 这几个缩小暴露范围的入口；官方没有说明三个 Meta Tools 自身是否需要审批。 |
| 条件与边界 | 默认关闭，需要显式打开并重启。三个 Meta Tools 只在 MCP reference 的 “Lazy Loading Mode” 一段里出现，官方内置能力参考与 MCP Servers 页都没有列出它们，Settings 页也没有提到 `mcp.lazyLoad`，因此各自的参数、返回内容、排序方式与调用顺序记为未确认，也不按名称推断它们等价于其他四家的 `ToolSearch`／`tool_search`／`select_tools`。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI MCP reference（“Lazy Loading Mode” 段：默认在启动注册全部 MCP 工具 schema，`mcp.lazyLoad: true` 或 `QODER_MCP_LAZY=1` 开启后只暴露 `mcp_list`／`mcp_get`／`mcp_call` 三个 Meta Tools 并按需加载实际工具；Permissions and Security 段写明 MCP 工具与内置工具一样需要用户确认）](https://docs.qoder.com/cli/mcp-reference)、[Qoder CLI 设置参考（`mcp` 分组的 `mcp.lazyLoad`：boolean、默认 `false`、Restart 列标注 “Yes”、描述逐字为 “Lazy load MCP tools (exposes Meta Tool).”）](https://docs.qoder.com/cli/settings-reference)、[Qoder CLI 内置能力参考（`batch` Skill）](https://docs.qoder.com/cli/builtins-reference)、[Qoder CLI MCP servers](https://docs.qoder.com/en/cli/mcp-servers)、[Qoder CLI Configuration Files and Application Order](https://docs.qoder.com/cli/settings) |

## 官方来源

- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code 更新日志（工具搜索版本时间线：v2.1.7 auto 模式默认开启并按 10% 上下文阈值延迟、v2.1.9 `auto:N`、v2.1.119 Vertex AI 默认关闭、v2.1.121 Server `alwaysLoad`、v2.1.221 Vertex 对 4.5 代及以上重新启用、v2.1.285 工具级 `_meta` 与 Server 级 `alwaysLoad` 的覆盖关系、v2.1.287 Server `alwaysLoad: false` 延迟该 Server 全部工具、v2.1.293 mods `$.tool.register` 的 `isDeferred`、v2.1.295 经工具搜索加载的描述改为 16,384 字符、v2.1.296 上送描述与 Server instructions 默认上限由 2,048 改为 4,096，固定到 v2.1.296）](https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md)
- [Codex `tool_search` 工具声明源码（描述逐字为 “Searches over deferred tool metadata with BM25”、`query` 与 `limit` 两个参数、来源清单渲染与 512 KiB 来源描述预算，main `7c1b64c5df07`）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/src/tools/handlers/tool_search_spec.rs)
- [Codex `tool_search` 处理器源码（`limit` 缺省取 `TOOL_SEARCH_DEFAULT_LIMIT`、空 query 报 “query must not be empty”、`limit` 为 0 报 “limit must be greater than zero”、code mode 分支与 `{"tools": [...]}` 结果形状）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/src/tools/handlers/tool_search.rs)
- [Codex 工具发现常量与可发现项源码（`TOOL_SEARCH_TOOL_NAME = "tool_search"`、`TOOL_SEARCH_DEFAULT_LIMIT = 8`、`list_available_plugins_to_install` 与 `request_plugin_install` 两个发现工具名、Connector 与 Plugin 两类 `DiscoverableTool`）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/tools/src/tool_discovery.rs)
- [Codex 特性开关源码（`tool_search` 与 `tool_search_always_defer_mcp_tools` 均为 `Stage::Removed` 且注释写明工具搜索始终启用、MCP 工具始终延迟，`code_mode_tool_search` 与 `deferred_tool_world_state` 为 `Stage::UnderDevelopment` 且默认关闭，旧配置解析对这两个键直接跳过）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/features/src/lib.rs)
- [Codex `config.schema.json`（`features.tool_search`、`features.tool_search_always_defer_mcp_tools` 与 `features.code_mode_tool_search` 三个 boolean，顶层与 `ConfigProfile` 各一份）](https://github.com/openai/codex/blob/7c1b64c5df07ae124c70a9a0094811cd3e23fcb5/codex-rs/core/config.schema.json)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code v0.25.1 设置参考（`tools.toolSearch.enabled` 默认 `true`、`tools.toolSearch.threshold` 默认 `0`、`tools.eager`、`tools.visible`、`tools.disabled`、`tools.discoveryCommand`、`tools.core` 迁移说明与 `permissions.allow` 行，标签 `v0.25.1`，提交 `c1a8218f3820`）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/configuration/settings.md)
- [Qwen Code v0.25.1 上下文成本文档（`tool_search` → `tool_call` 桥、豁免工具清单、桥缺一半时的回退、Agent 与 Goal 默认延迟、Subagent 不走 ToolSearch、恢复会话与工具集刷新会重新声明）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/features/context-cost.md)
- [Qwen Code v0.25.1 `tool_search` 源码（`DEFAULT_MAX_RESULTS = 5`、`HARD_MAX_RESULTS = 20`、名字精确命中内置 10 与 MCP 12、子串 5 与 6、`searchHint` 4、动作别名 6、描述 2、停用词表、`select:` 与 `+` 前缀两种查询模式、Code Mode 专用描述）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/tool-search.ts)
- [Qwen Code v0.25.1 工具名与显示名映射源码（`tool_search` → `ToolSearch`、`tool_call` → `ToolCall`、`agent`、`list_agents`、`get_goal`、`update_goal`、`propose_goal`）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/tool-names.ts)
- [Qwen Code v0.25.1 设计文档 `default-deferred-coordination.md`（把 `agent`、`list_agents`、`get_goal`、`update_goal`、`propose_goal` 标为原生延迟，不新增设置、不改 schema、不改执行与审批语义）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/design/default-deferred-coordination.md)
- [Qwen Code PR #13033（feat(core): defer agent and goal declarations by default，2026-10-06T04:13:29Z 合入 main，合并提交 `8e3f3923b8c8`）](https://github.com/QwenLM/qwen-code/pull/13033)
- [Qwen Code v0.25.1 发布说明（2026-10-11，Features 段逐字为 “Agent and Goal coordination tools are now deferred by default and discovered on demand, reducing unnecessary tool declarations in ordinary tool-call sessions.”）](https://github.com/QwenLM/qwen-code/releases/tag/v0.25.1)
- [Qwen Code v0.25.1 `cron_create` 工具源码（构造参数里的 `shouldDefer` 为 `true`、注释 “scheduling is infrequent”、`alwaysLoad` 为 `false`、搜索提示词 `cron schedule reminder recurring timer`）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/packages/core/src/tools/cron-create.ts)
- [Kimi Code MCP 文档「按需加载工具」段与 Server `deferred` 字段（main `cbd754049a11`，两个前提、`select_tools` 加载、未标 `deferred` 的 Server 始终内联、OAuth 认证工具同样遵循该字段）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/docs/zh/customization/mcp.md)
- [Kimi Code 环境变量文档（`KIMI_CODE_EXPERIMENTAL_TOOL_SELECT` 与总开关 `KIMI_CODE_EXPERIMENTAL_FLAG` 的取值，main `cbd754049a11`）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/docs/zh/configuration/env-vars.md)
- [Kimi Code 配置文档（`capabilities` 可追加 `dynamically_loaded_tools` 且只能追加不能移除；`## experimental` 整段被包在 HTML 注释里、站点不渲染，注释内也只列 `micro_compaction`，main `cbd754049a11`）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/docs/zh/configuration/config-files.md)
- [Kimi Code `select_tools` 工具源码（`SELECT_TOOLS_TOOL_NAME = "select_tools"`、描述要求名字取自 `<tools_added>`/`<tools_removed>` 公告、`approvalRule` 为工具自身、模型不支持时返回 “select_tools is not available for the current model.”）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/packages/agent-core-v2/src/agent/tools/select-tools/selectToolsTool.ts)
- [Kimi Code `select_tools` 入参 schema 源码（`names` 为字符串数组、`min(1)`、描述 “Exact tool names to load, taken from the latest announced tool list.”、`strict()`）](https://github.com/MoonshotAI/kimi-code/blob/cbd754049a114ee36d1b27675c82819e4963c692/packages/agent-core-v2/src/agent/tools/select-tools/select-tools.ts)
- [Qoder CLI MCP reference（“Lazy Loading Mode” 段：默认在启动注册全部 MCP 工具 schema，`mcp.lazyLoad: true` 或 `QODER_MCP_LAZY=1` 开启后只暴露 `mcp_list`／`mcp_get`／`mcp_call` 三个 Meta Tools 并按需加载实际工具；Permissions and Security 段写明 MCP 工具与内置工具一样需要用户确认）](https://docs.qoder.com/cli/mcp-reference)
- [Qoder CLI 设置参考（`mcp` 分组的 `mcp.lazyLoad`：boolean、默认 `false`、Restart 列标注 “Yes”、描述逐字为 “Lazy load MCP tools (exposes Meta Tool).”）](https://docs.qoder.com/cli/settings-reference)
- [Qoder CLI 内置能力参考（`batch` Skill）](https://docs.qoder.com/cli/builtins-reference)
- [Qoder CLI MCP servers](https://docs.qoder.com/en/cli/mcp-servers)
- [Qoder CLI Configuration Files and Application Order](https://docs.qoder.com/cli/settings)

## 关联能力

- [MCP 客户端](./extension-mcp.md)
- [Agent Skills](./extension-skills.md)
- [工具白名单](../subagents/agent-tools.md)
- [上下文占用](../sessions/session-context-usage.md)
