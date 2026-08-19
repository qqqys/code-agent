# 生命周期 Hooks 字段：Codex 异步 command Hook 与 `mcp_tool` 引擎执行随 rust-v0.148.0 发布

Codex rust-v0.148.0（2026-08-18 发布）的发布说明记录 "Hooks can now run commands asynchronously and invoke MCP tools"（PR #37533、#38705）。核对结果拆成两层：command Handler 的 `async: true` 后台执行已经发布，官方 Hooks 文档页也列出 `async` 字段（后台运行、不能阻断或改写触发操作、输出在下一个安全点交付、每会话最多 8 个并发后台 Hook、未完成的随会话结束取消、SessionEnd 始终同步）；`mcp_tool` Handler 的引擎执行（发现、占位符展开、输出约定、`hooks/list` handler 专属元数据、TUI `/hooks` 浏览器展示、无执行器时启动告警跳过）同样随该版发布，但 rust-v0.148.0 的 CLI 会话运行时传入 `mcp_executor: None`（`codex-rs/core/src/session/mod.rs`），`mcp_tool` Hook 实际仍被跳过。会话内真正执行 MCP 工具 Hook 由 main 分支提交 `87070a77925c`（PR #39296，2026-08-18 合入）完成，经 GitHub compare 确认该提交不在 rust-v0.148.0 中；main 分支提交 `d35e5495f991`（PR #39331，2026-08-19 合入）进一步把 Hook MCP 调用改经当前连接集执行。矩阵 `extension-hooks`（生命周期 Hooks）字段此前把 `mcp_tool` 整体标记为 "main 分支尚未发布"，本次按发布状态拆分更新；其余四家无变化。官方 Hooks 文档页仍写 "Only `type: \"command\"` handlers run today"，尚未同步 `mcp_tool`。

## 修正

- `extension-hooks`（生命周期 Hooks）矩阵 Codex 列由 "`/hooks` · 当前仅 command 执行 · 条件：`mcp_tool` Handler 可配置并在 `/hooks` 列出，运行时未接入 MCP 执行器（main 分支，尚未发布）" 更新为 "`/hooks` · command 同步或 `async: true` 后台执行 · 条件：`mcp_tool` Handler 引擎执行随 rust-v0.148.0 发布，会话运行时接入仍在 main 分支（提交 `87070a77925c`，尚未发布）"。
- `extension-hooks` 详情：Codex 扩展构成改写为 command 同步/`async: true` 后台执行（rust-v0.148.0 发布）与 `mcp_tool` 引擎执行随 rust-v0.148.0 发布（PR #38705）；加载与刷新补充 `hooks/list` handler 专属元数据与 TUI 展示随 rust-v0.148.0 发布；条件与边界补充 async Hook 的全部语义、rust-v0.148.0 CLI 会话 `mcp_executor: None` 启动告警跳过、main 分支提交 `87070a77925c`（PR #39296）会话执行的约束（仅已连接/已列目录/策略允许的工具、不可用 Server 立即失败、不经模型工具审批、不递归、超时受 Server 上限约束）与提交 `d35e5495f991`（PR #39331）当前连接集路由，来源新增三条；跨产品事实同步改写。
- `docs/05-扩展系统矩阵.md`：生命周期 Hooks 行 Codex 列按上述结论更新。
- `docs/09-版本与证据.md`：Codex 核对日期更新为 2026-08-19，主要材料中 Hooks 条目改写为异步 command Handler 与 `mcp_tool` Handler 的分层状态；官方来源表 Codex 扩展系统列新增 rust-v0.148.0 发布说明、会话 MCP 工具 Hook 启用提交与 Hook MCP 当前连接路由提交三个链接。
- `site/data.js` 新增来源 `codex-v0148-release`（rust-v0.148.0 发布说明）、`codex-hooks-session-mcp`（提交 SHA `87070a77925cbffed8b34ddc99afaf40d56863aa`）与 `codex-hooks-mcp-route`（提交 SHA `d35e5495f991508409ff30e38db8dbe49d565570`）。
- 能力字段总数不变（110 个），`README.md` 计数无需调整；核对日期更新为 2026-08-19，`npm run generate` 重新生成全部能力详情页日期并刷新 `docs/capabilities/extensions/extension-hooks.md`。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [生命周期 Hooks 详情](../docs/capabilities/extensions/extension-hooks.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Codex 官方 Release rust-v0.148.0（2026-08-18T22:26:03Z）New Features 原文："Hooks can now run commands asynchronously and invoke MCP tools. (#37533, #38705)"；What's Changed 含 #37533 "Support asynchronous command hooks"、#37538 "Expose execution mode in hook listings"、#37363 "Recognize MCP tool hook configurations"、#38705 "Add MCP tool handler support to the hooks engine"，不含 #39296。
- Codex 官方 Hooks 文档页（learn.chatgpt.com/docs/hooks，2026-08-19 抓取）原文："Set `async` to `true` to run a command hook in the background while Codex continues."、"Background hooks can't block, approve, rewrite, or otherwise control the operation that triggered them."、"Codex runs up to eight background hooks concurrently per session."、"`SessionEnd` hooks always run synchronously, even when `async` is `true`."；同页仍写 "Only `type: \"command\"` handlers run today. `prompt` and `agent` handlers are parsed but skipped."，未列 `mcp_tool`。
- PR #38705（rust-v0.148.0 内）说明原文："Discover synchronous `mcp_tool` hook handlers and invoke their configured MCP server and tool through a supplied executor."、"Skip unsupported `SessionEnd` MCP hooks and runtimes without MCP invocation support with startup warnings."；其 diff 中 `codex-rs/core/src/session/mod.rs` 传 `mcp_executor: None`，告警文案为 "skipping MCP tool hook in {path}: MCP invocation is not available yet"。
- rust-v0.148.0 tag 不存在 `codex-rs/core/src/hook_mcp_executor.rs`（404）；GitHub commits API 显示该文件仅由提交 `87070a77925cbffed8b34ddc99afaf40d56863aa`（2026-08-18T22:10:43Z，PR #39296 "Enable MCP tool hooks in Codex sessions"）与 `d35e5495f991508409ff30e38db8dbe49d565570`（2026-08-19T01:15:10Z，PR #39331 "Route hook MCP calls through current connections"）修改。
- GitHub compare `rust-v0.148.0...87070a77925c` 状态为 diverged（ahead 151、behind 1），确认 #39296 未进入 rust-v0.148.0。
- PR #39296 说明原文："Execute `mcp_tool` hook handlers through the session's shared MCP runtime, including managed hook configurations."、"Restrict hook calls to already-connected, cataloged, and policy-allowed tools. Unavailable servers fail immediately without starting or reconnecting them."、"Pass session metadata to hook tools, cap hook timeouts by the server timeout, and invoke hooks without model-tool approval or recursive hook dispatch."。
- PR #39331 说明原文："Execute hook-triggered MCP calls through the runtime's latest connection set instead of preparing a separate catalog-bound call."、"Keep hook calls from waiting for server startup or reconnecting, and reject disconnected servers immediately."、"Apply the shorter of the hook-requested timeout and the server's configured tool timeout."。
