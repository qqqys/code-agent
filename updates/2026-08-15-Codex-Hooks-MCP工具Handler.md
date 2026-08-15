# Codex Hooks `mcp_tool` Handler

Codex 官方仓库在 2026-08-15 合入提交 `85fc4def358b`（PR #38705，`Add MCP tool handler support to the hooks engine`），Hooks 引擎新增 `mcp_tool` Handler 类型：配置解析、发现、`hooks/list` 元数据和 TUI `/hooks` 浏览器展示均已就绪，但 CLI 运行时尚未接入 MCP 执行器，已配置的 `mcp_tool` Hook 启动时被跳过并告警。该提交晚于最新 Release `rust-v0.148.0-alpha.19`（2026-08-15T02:21:24Z），未进入任何发行版，标注为"main 分支，尚未发布"。官方文档页 learn.chatgpt.com/docs/hooks 同日仍写 "Only `type: \"command\"` handlers run today"，未提及 `mcp_tool`。同一字段顺带修正一处过期表述：原详情写"async 也尚未支持"，而官方文档已记录 command Handler 的 `async: true` 后台执行，按现文档改正。

## 修正

- `extension-hooks`（生命周期 Hooks）矩阵 Codex 列由 "`/hooks` · 当前仅 command 执行" 更新为 "`/hooks` · 当前仅 command 执行 · 条件：`mcp_tool` Handler 可配置并在 `/hooks` 列出，运行时未接入 MCP 执行器（main 分支，尚未发布）"；证据状态随条件项变化。
- Codex 详情具体行为改为列出全部 11 个事件名（PreToolUse、PermissionRequest、PostToolUse、PreCompact、PostCompact、SessionStart、SessionEnd、UserPromptSubmit、SubagentStart、SubagentStop、Stop）；扩展构成补充 `mcp_tool` Handler 的 `type` 值、`server`/`tool`/`input`/`timeout`/`statusMessage` 字段、`input` 必须可表示为 TOML、输出沿用 command Hook 约定、始终同步执行；加载与刷新补充 `hooks/list` 的 `handlerType: "mcpTool"` 与 server/tool 字段、TUI 浏览器展示；条件与边界补充 prompt/agent 跳过、command `async: true` 后台执行（SessionEnd 始终同步）、`mcp_tool` 启动告警跳过、SessionEnd 与 Managed 必选 Hook 不支持、`timeout` 缺省 600 秒、`${field.nested}` 占位符与缺失字段失败。
- 跨产品事实第 1 条补充 Codex main 分支的 `mcp_tool` 配置与列出路径及运行时跳过现状。
- 来源坐标：新增 `codex-hooks-mcp-tool`（提交 `85fc4def358b7df21883e72ae8dda43a0f572f32`）与 `codex-hooks-mcp-runner`（该提交处的 `codex-rs/hooks/src/engine/mcp_runner.rs`）。
- Codex 核对日期更新为 2026-08-15。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [版本与证据](../docs/09-版本与证据.md)
- [生命周期 Hooks 详情](../docs/capabilities/extensions/extension-hooks.md)

## 证据版本

- Codex 官方仓库提交 `85fc4def358b7df21883e72ae8dda43a0f572f32`（`Add MCP tool handler support to the hooks engine (#38705)`，committer 时间 2026-08-15T05:53:54Z）：提交说明为"Discover synchronous `mcp_tool` hook handlers and invoke their configured MCP server and tool through a supplied executor. Expand nested hook-event placeholders in MCP tool inputs while preserving JSON types, and process tool output through the existing hook output contract. Represent hook details as handler-specific metadata in `hooks/list`, including MCP server and tool fields, and show those details in the TUI hooks browser. Skip unsupported `SessionEnd` MCP hooks and runtimes without MCP invocation support with startup warnings."
- 该提交处的 `codex-rs/config/src/hook_config.rs`：`HookHandlerConfig` 新增 `#[serde(rename = "mcp_tool")] McpTool { server, tool, input, timeout_sec（rename `timeout`）, status_message（rename `statusMessage`） }`；`input` 反序列化时拒绝不能表示为 TOML 的值（如 `null`），错误信息 "MCP hook input must be representable as TOML"。
- 该提交处的 `codex-rs/hooks/src/engine/discovery.rs`：`SessionEnd` 事件的 `mcp_tool` Hook 跳过并告警 "SessionEnd MCP hooks are not supported"；`server`/`tool` 为空跳过；Managed 必选 Hook 中的 `mcp_tool` 跳过并告警 "MCP tool hooks are not supported yet"；`timeout` 缺省 600 秒、下限 1 秒；`hooks/list` 条目以 `HookListEntryHandler::McpTool { server, tool }` 返回。
- 该提交处的 `codex-rs/hooks/src/engine/mcp_runner.rs`：`input` 模板递归展开 `${field.nested}` 占位符，取值来自 Hook 事件 JSON；整串占位符保留原 JSON 类型，嵌入文本时按字符串渲染；字段缺失时 Hook 失败（"hook input placeholder ... was not found"）；工具返回文本按 command Hook 输出约定处理。
- 该提交处的 `codex-rs/app-server/README.md`："MCP tool hooks do not have an `async` field and always run synchronously."；"MCP tool hooks appear with `handlerType: \"mcpTool\"`. Their `server` and `tool` fields identify the configured MCP target."
- 该提交处的 TUI 快照 `codex_tui__bottom_pane__hooks_browser_view__tests__hooks_browser_mcp_tool_handler.snap`：`/hooks` 浏览器对 MCP Tool Hook 显示 "MCP Server" 与 "MCP Tool" 行。
- Codex 当前 main（`c4941302c73c`）：`codex-rs/core/src/session/mod.rs` 的 `build_hooks_config` 显式传 `mcp_executor: None`，仓库内没有任何生产调用点传入 MCP 执行器；`codex-rs/hooks/src/engine/mod.rs` 在执行器缺省时将 `mcp_tool` Handler 从已发现列表移除并告警 "skipping MCP tool hook in {path}: MCP invocation is not available yet"。因此当前 main 上 `mcp_tool` Hook 可配置、可列出，但不会实际执行。
- Codex Release 列表（2026-08-15 查询）：最新为 `rust-v0.148.0-alpha.19`（2026-08-15T02:21:24Z），早于该提交合入时间；该提交未进入任何 Release。
- 官方文档页 [Codex Hooks](https://learn.chatgpt.com/docs/hooks)（2026-08-15 访问）：仍为 "Only `type: \"command\"` handlers run today. `prompt` and `agent` handlers are parsed but skipped."，未提及 `mcp_tool`；同页记录 command Handler 的 `async` 字段："Set `async` to `true` to run a command hook in the background." 与 "`SessionEnd` hooks always run synchronously, even when `async` is `true`."
