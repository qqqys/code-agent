# 上下文占用：Kimi Code PR #5058 的实验性「上下文用量」视图与三个只读 context 接口、Qoder CLI `/context` 面板由「未确认」纠正为条件项，另纠正 Kimi token 台账「尚未发布」的过期结论并补录 Claude `/context [all]` 与 Codex 状态栏三个上下文字段

日期：2026-11-19
能力字段：`session-context-usage`（会话与上下文 · 上下文占用）

## 本次改动

官方来源快照里 Kimi Code 在采集当天（2026-11-19）有一条 `feat: add the context usage view and session context inspection routes (#5058)` 提交（`638fd94b6c22`，12:54:48Z），同时发布了 `@moonshot-ai/kimi-code@2.7.0`（11:16:28Z）与 `kimi-code-desktop@1.4.0`（11:29:44Z）。核对后发现该提交正好落在本仓库 `session-context-usage` 字段里 Kimi 单元格记为「main 分支，尚未发布」的那条机制的延长线上，而同一单元格里「最新 Release 为 0.36.1，2026-08-14 发布」已经过期三个多月；Qoder 单元格又长期停在「未确认独立占用视图」。因此本次研究单元定为 `session-context-usage`，并按同一口径复核五家。

### 1. Kimi Code：纠正一处过期结论

本仓库此前把 token 计数台账持久化记为「2026-08-16 合入 main（提交 `ee564e5ec90afd068123b8052928c53f1fd5a27d`，PR #2969），尚未发布（最新 Release 为 0.36.1，2026-08-14 发布）」。该结论已过期：

- `@moonshot-ai/kimi-code@0.37.0`（2026-08-18T11:23:11Z 发布）的发布说明里 PR #2969 条目逐字为 “Fix the displayed context size dropping to a smaller estimate after archiving and resuming a session.”，正是这条机制。
- GitHub compare API 以 `ee564e5ec90afd068123b8052928c53f1fd5a27d` 为 base、`@moonshot-ai/kimi-code@0.37.0` 为 head 返回 `status: ahead`、`ahead_by: 30`、`behind_by: 0`，确认该提交是这个 tag 的祖先。

据此把 `persistence` 由「条件：……尚未发布」改写为「自 0.37.0 起写入会话 wire journal」，`token_counting.measured`／`truncated`／`rebased` 三类记录的语义与「压缩后锚点是混合估算值」保留不变。

### 2. Kimi Code：补录实验性「上下文用量」视图与三个只读 context 接口

PR #5058（合并提交 `638fd94b6c22589253570b9b90dbe5359849ddc2`，2026-11-19T12:54:48Z，58 个文件 +4030/−56）新增两层能力：

**服务端**：agent-core-v2 的 Loop 服务新增只读方法 `previewRequestContent()`，按 turn 请求同样的整理步骤（tool-select 塑形 → 对不支持图片的模型隐藏 `ReadMediaFile` → projector 投影）算出下一次请求的 `{ systemPrompt, tools, messages }`，不发请求也不改持久化消息；PR 说明写「一个对照测试跑真实 turn，断言 provider 收到的内容与预览一致」。kap-server 在 `packages/kap-server/src/routes/context.ts`（17,690 字节、510 行）注册三个只读路由：

- `GET /api/v1/sessions/{session_id}/context/summary`（description “Get lightweight context composition summary for a session agent”）
- `GET /api/v1/sessions/{session_id}/context/items`（“List context block outlines and composition summary for a session agent”）
- `GET /api/v1/sessions/{session_id}/context/items/{item_id}`（“Get full parsed and raw content for a single context item”）

已核对的实现细节：三者 tags 均为 `sessions`，错误集含 `VALIDATION_FAILED`、`SESSION_NOT_FOUND` 与会话冲突错误，单条详情另有 `MESSAGE_NOT_FOUND`；`agent_id` 可选（正则 `^[^/\\]+$`），缺省 `MAIN_AGENT_ID`，子 agent 不在内存时先 `getOrRestoreAgent` 恢复，因此能查非前台会话与 Subagent 的上下文；`items` 另接受 `role`（单值或数组）、`offset`（非负整数）与 `limit`（1–500，`DEFAULT_ITEMS_LIMIT = 100`），响应带 `total` 与 `has_more`；`PREVIEW_MAX_CHARS = 240` 截断条目 preview，`MEDIA_PAYLOAD_MIN_CHARS = 512` 以上的媒体字符串替换为 `[encoded media · <长度> chars]`；条目 id 只有 `system`、`tool-<index>`、`message-<index>` 三种形状，`readContextItem()` 拒绝其他值；`readAgentContextSources()` 过滤掉 `tool.deferred === true` 的工具，用 `ISessionTokenCountingService`（自动压缩用的同一个估算服务）估算各项后按 `scale = used / estimatedTotal` 分摊，`used` 取 `tokenCounting.latestMeasured(...) > 0 ? legacyStatus?.contextTokens : undefined`，没有实测值时退回估算总和，`tokens.max` 取 `legacyStatus?.maxContextTokens`；`splitSystemPromptParts()` 只在代码围栏外按一级标题 `# ` 切分系统提示词并逐段给 token 数。响应 schema 在 `packages/kap-server/src/protocol/rest-context.ts`（2,198 字节），`contextItemPartSchema` 的 `kind` 只取 `text`／`think`／`definition`／`function`／`media`。

**客户端**：入口是输入框圆环小窗、右侧会话信息栏的上下文分区与详情面板。改动落在 `apps/desktop/src/renderer/`（新增 `inspector/ContextPanel.vue`、`ContextItemDialog.vue`、`ContextPartView.vue`、`JsonTree.vue`）与 `packages/app-components`、`packages/app-client`、`packages/app-core`；PR 说明写「`apps/web` 已不存在……`kimi web` 的界面由桌面端渲染进程构建，自动带上这些改动」，**CLI TUI 不在改动范围内**，因此按 Surface 规则记为桌面端与 `kimi web` 的条件项，不计入 CLI。

三个入口都受「设置 → 实验室」的开关控制：`packages/app-i18n/src/locales/en/settings.ts` 的 `lab.contextInspector` 逐字为 “Context usage”、`contextInspectorHint` 为 “Show context usage and composition in the composer ring and session info, and inspect each item the model receives.”；开关值存 `packages/app-core/src/lib/storage.ts` 的 `STORAGE_KEYS.contextInspector = "kimi-web.context-inspector"`，经 `packages/app-core/src/composables/useContextInspector.ts` 读写 `globalThis.localStorage`，初值判断是 `safeGetJson<boolean>(...) === true`，即默认关闭、每台机器各自保存、不随会话或账号同步。面板文案在同提交新增的 `packages/app-i18n/src/locales/en/inspector.ts`（2,033 字节），含 `usedPercent: "{pct}% used"`、`usageSummary: "Used {used} · {remaining} left"`、`ringTooltipWithMax`、`tokens: "~{n} tokens"`（估算值前缀 `~`）、`currentContextHint: "System prompt, tools, and messages held by this chat at the displayed time. Per-item token counts are estimates. Refresh to update."` 与刷新失败时的 `staleSummary`。

**发布状态判定为尚未发布**：两个 changeset（`.changeset/context-usage.md` 影响 `kimi-code-app` 与 `@moonshot-ai/kimi-code`，正文 “Add Context usage, an experimental view of context usage and composition in the composer ring and session info sidebar, with a details panel listing each item the model receives. Turn it on in Settings → Lab.”；`.changeset/session-context-preview.md` 影响 `@moonshot-ai/kap-server` 与 `@moonshot-ai/agent-core-v2`）在核对日期仍留在 main 的 `.changeset/` 目录未被消费；同日发布的 `@moonshot-ai/kimi-code@2.7.0`（说明正文 8,008 字节）对 “context” 与 “5058” 的命中数都是 0，`kimi-code-desktop@1.4.0`（正文 10,715 字节）唯一一处 “context” 是 “Add mark as unread/read to the session context menu.”（指右键菜单），两个 Release 的发布时间都早于 12:54:48Z 的合入时间。

**其他已核对条件**：PR 说明写「刷新由服务端推送的已用 token 和会话状态驱动，没有定时轮询」、右侧栏显示期间每个 step 约一次 summary 请求（后台低优先级）而圆环小窗与详情面板只在打开时请求、逐项 token 是估算按比例分摊实测总量因而各项相加等于圆环上的已用量、读取冷会话会把会话加载进服务进程、`HOST_API_LEVEL` 保持 `1` 因而旧远程主机上这三个接口返回 404 且只影响开启了该功能的面板；PR 明确没有更新 `packages/kap-server/docs/kap.md`，即官方用户文档没有这三个接口。

**CLI 侧入口同步按源码固定**：中文命令参考坐标前移到 main `80bd35955585b85166ae99df2ffc5b4b0321076e`（`docs/zh/reference/slash-commands.md`，13,258 字节），「## 信息与状态」表 `/usage` 行逐字为 “显示 token 用量、上下文占用以及配额信息”、`/status` 行为 “显示当前会话运行时状态：版本、模型、工作目录、权限模式等”，末列「随时可用」表示流式输出期间也可用，全页对 “/context” 的命中数为 0。`apps/kimi-code/src/tui/components/messages/usage-panel.ts`（11,827 字节、347 行）的 `buildUsageReportLines()` 依次输出 `Session usage`（按模型列 input/output/total，无记录时写 “No token usage recorded yet.”）、`Context window`（仅当 `maxContextTokens > 0`：`renderProgressBar(ratio, 20)` 画 20 格进度条、`usagePercent()` 给百分比、括号内是已用与上限）、`Plan usage`（配额逐行画条并给 `reset`／`resets in <时长>`）与 managed／extra 段；`status-panel.ts`（5,582 字节、165 行）的 `contextValues()` 回退读取同一组三个字段，取不到上限时输出 “No context window data available.”。两处都只有总量与百分比、没有内容构成——这正是本仓库此前把「`/status` 也渲染 Context window 进度条」写成结论但没有源码坐标的部分，本次补上。

### 3. Qoder CLI：由「未确认独立占用视图」纠正为条件项

本仓库此前记「当前 TUI 命令表未确认独立的上下文占用视图」。该结论与官方文档冲突，本次纠正：

- 官方 Slash 命令参考 `https://docs.qoder.com/cli/slash-reference.md`（2026-11-19 核对，11,720 字节；本仓库 2026-11-17 记录的同页为 11,857 字节）「## Remote and Other」表里逐字列出 “`/context` — Manage context.”，同表另有 `/remote-control`、`/remote-env`、`/add-dir`、`/docs`、`/help`、`/about`、`/feedback`、`/release-notes`。
- 更新日志 `https://changelog.qoder.com/cli`（HTML 815,021 字节、去标签后正文 1,711 行）确认它是一个含用量统计与分类的面板：“Improved /context panel accuracy and display”（April 28, 2026 · CLI 0.2.3）、“Improved the accuracy of usage statistics and categorization in /context”（August 28, 2026 · CLI 1.1.33）、“Fixed /context and status bar ratio becoming inconsistent during long sessions”（June 12, 2026 · CLI 1.0.19，说明面板比例与状态栏进度条同源）、“Fixed context warning thresholds becoming inconsistent”（June 13, 2026 · CLI 1.0.20）、“Fixed context usage display issue when resuming a compacted session”（July 3, 2026 · CLI 1.0.37）、“Fixed an issue where using /btw after compaction affected the TUI status bar context usage calculation”（October 8, 2026 · CLI 1.1.66）。
- 状态栏进度条时间线：“Added context token usage progress bar to default statusline for live context window visibility” 与 “Fixed context window progress bar zeroing, flashing, or displaying incorrect values during compression, sub-agent runs, and session resume”（May 12, 2026 · CLI 0.2.12）、“Fixed context window progress bar not updating after /compact command”（May 13, 2026 · CLI 0.2.13）。
- `cli/interface.md`（15,277 字节）`## Status Bar` 逐字写内置默认状态栏显示 `model · workspace · +N -N` 且宽度不足时自动隐藏低优先级段；“### Custom Status Bar Command” 写自定义命令 “receives session data as JSON via stdin (including Session ID, Working Directory, model, context usage, Git branch, Vim mode, etc.)”；“### Paragraph Color” 写 “The context progress bar ignores custom colors and automatically changes color (green/yellow/red) based on usage.”，即上下文进度条不受 `statusLine.colors` 影响。
- 边界同时固定：`cli/usage.md`（2,726 字节）的 Usage Panel 字段表只有 Plan、Plan Expiration Date、Plan Credits Used、Add-on Credits Used、Org Resource Package、Total Duration API、Total Duration wall 与 Total Code Changes，全页 “context” 命中数为 0，因此 `/usage` 仍不计入本能力；`cli/settings-reference.md`（31,752 字节）只有 `model.contextWindow`（“Explicit Context Window (tokens).”）与 `context.*` 记忆／文件发现键，没有上下文占用显示相关键；官方文档站 `llms.txt`（22,485 字节）与站点地图（294 个 `/cli` 页面）都没有介绍 `/context` 输出内容的专页。

因此 Qoder 单元格由「未确认独立占用视图」改为「`/context` 面板 · 内置状态栏上下文进度条（按用量变绿/黄/红）· 条件：官方只写 “Manage context.”，面板分类与警告阈值未公开」，`status` 由「未确认」改为「条件项」——命令存在与「面板含用量统计和分类」已由一手资料确认，但面板具体分类、是否有 warn/auto/hard 阈值线、是否接受参数与警告阈值取值仍未公开。

### 4. Claude Code：补录 `/context [all]` 的官方 synopsis

官方命令页 `https://code.claude.com/docs/en/commands.md`（57,039 字节）该行描述逐字为 “Visualize current context usage as a colored grid. Shows optimization suggestions for context-heavy tools, memory bloat, and capacity warnings. When the conversation exceeds the context window, the output includes a warning showing how far over the limit you are and which command frees space. In fullscreen mode, `/context` collapses the per-item breakdown to keep the grid visible. Pass `all` to expand it”。据此把单元格由 `/context` 改为 `/context [all]`，并补录全屏模式默认折叠逐项明细、超限时给超出量与释放空间的命令两个条件。Context window 页（10,879 字节）另逐字写 “To see your actual context usage at any point, run `/context` for a live breakdown by category with optimization suggestions, including which CLAUDE.md and auto memory files loaded.”，即分类里能看到具体加载了哪些 `CLAUDE.md` 与 auto memory 文件。同页 `/skill-doctor`（需 v2.1.252 及以上与 feature-flag fetching）是按 Skill 拆的上下文成本视图，记为不属本命令。

更新日志侧无能力变化：v2.1.326（2026-11-16 发布）只有 `/context` 网格在窄终端被截断或错乱一类渲染修复，v2.1.327 与 v2.1.328（2026-11-19T01:14:04Z，最新 Release）的更新日志没有 `/context` 条目。

### 5. Codex：补录状态栏三个上下文字段的确切 id

官方 Slash 命令页（59,711 字节）的 `/status` 行描述为 “Display session configuration and token usage.”、用途列为 “Confirm the active model, approval policy, writable roots, and remaining context capacity.”；“Inspect the session with `/status`” 一节写 TUI 连远程时输出还含远端地址与服务端版本，并逐字写 “After `/status`, use `/copy` to copy the full status or an individual field.”。`/statusline` 行写 “Pick and reorder footer items (model/context/limits/git/tokens/session) and persist in config.toml.”，正文写选择结果 “persists to `tui.status_line` in `config.toml`”、可用项 “include model, model+reasoning, context stats, rate limits, git branch, token counters, session id, current directory/project root, and Codex version”、`/statusline <items…>` 只对本次会话生效、`/statusline --clear` 隐藏全部。全页没有 `/context` 命令。

本仓库此前只写了「状态栏也可配置 `context-remaining` 等字段」且引的是 Advanced Configuration 页；本次核对发现该页（56,782 字节）对 `context-remaining`／`context-used`／`context-window-size` 的命中数为 0、`status_line` 只作为遥测 counter 名出现一次，即配置文档没有同步这批取值。确切 id 由源码给出：`codex-rs/tui/src/bottom_pane/status_line_setup.rs`（main `4d517cce4abf9ccfe999b0a078d1b84f6043709b`，31,876 字节、864 行）文件头注释列 “- Context usage (remaining %, used %, window size)” 并写 “Context/limit items only show when data is available from the API”；`StatusLineItem` 的三项为 `ContextRemaining`（`context-remaining`，“Percentage of context window remaining (omitted when unknown)”）、`ContextUsed`（`#[strum(to_string = "context-used", serialize = "context-usage")]`，即 `context-used` 是当前 id、`context-usage` 仍被接受为旧值）与 `ContextWindowSize`（“Total context window size in tokens (omitted when unknown)”），同文件测试 `context_remaining_is_selectable_id` 与 `context_used_accepts_context_usage_legacy_id` 固定这两个 id 的解析。

### 6. Qwen Code：坐标前移，结论不变

命令文档坐标由本仓库此前固定的 `8a44b1b9f79341a0faca9814fb1b57f0f1b354a2` 前移到 main `adca3e7ddc9114d990e4e1ea42d4c5667340a4bb`（compare 返回 `status: ahead`、`ahead_by: 4870`、`behind_by: 0`，即旧坐标是新坐标的祖先）。`docs/users/features/commands.md`（81,966 字节）会话命令表两行逐字为 “`/context` — Show context window usage breakdown” 与子命令行 “→ `detail` — Show per-item context usage breakdown”，单元格维持 `/context` · `/context detail`。`docs/users/configuration/settings.md`（451,570 字节）`#### context` 小节补录两处原文：`context.autoCompactThreshold` 行写 “Target fraction of the context window at which auto-compaction triggers. Must be greater than 0 and at most 1. Default is `0.85` (85%). Acts as a ceiling on the trigger: on large windows it is the effective trigger (~85%), while on smaller windows compaction may fire earlier to leave room to summarize.”；已移除的 `model.chatCompression.contextPercentageThreshold` 行写 “Auto-compaction now uses a three-tier threshold ladder (warn / auto / hard) computed internally from the model's context window via the `computeThresholds()` function. The old setting is silently ignored (no startup warning).”，即视图里 warn/auto/hard 三条线的来源得到官方文档确认。同小节 `context.clearContextOnIdle` 三键默认值 60／5／500000 一并录入。

### 7. 跨产品事实

`facts` 由 4 条增至 5 条并重写：① 三家有名为 `/context` 的专门视图，Codex 与 Kimi 的 CLI 都没有该命令；② 把占用拆到内容构成的只有 Claude（彩色网格加优化建议）、Qwen（`detail` 逐条目）与 Kimi 的实验性视图（`system`／`tool-<i>`／`message-<i>` 逐条列出下一次请求内容），Codex 与 Qoder 只有总量或笼统分类；③ Kimi 自 0.37.0 起台账落盘、resume 后保持实测值，其余四家没有等价机制（原第 4 条的「尚未发布」限定删除）；④ 五家占用数字都是实时状态不落盘，能保存的只是显示方式（Codex `tui.status_line`、Qoder `statusLine.colors`／`statusLine.command`、Kimi 的 localStorage 开关）；⑤ 新增一条 Surface 边界——Kimi 的实验性构成视图属桌面端与 `kimi web`，记成 CLI 能力会跨越 Surface 边界。原第 2、3 条（Kimi `/usage` 同时展示三类信息、Qoder 无独立占用视图）已被新证据取代。

## 同步范围

- `site/data.js`：`updatedAt` 由 2026-11-18 改为 2026-11-19；`session-context-usage` 行五个单元格里四个改写（Claude 加 `[all]` 与全屏折叠、Codex 加三个状态栏字段 id、Kimi 改为「进度条 + 0.37.0 起实测恢复 + 桌面端／`kimi web` 实验性构成视图」、Qoder 由「未确认独立占用视图」改为 `/context` 面板加状态栏进度条），Qwen 单元格不变；能力字段总数维持 119。新增 18 个来源（Claude 1：`claude-context-command-20261119`；Codex 2：`codex-status-context-20261119`、`codex-statusline-items-source`；Qwen 1：`qwen-context-commands-20261119`；Kimi 11：`kimi-token-ledger-release`、`kimi-slash-20261119`、`kimi-usage-panel-source`、`kimi-status-panel-context-20261119`、`kimi-context-usage-commit`、`kimi-context-routes-source`、`kimi-context-rest-schema`、`kimi-context-changesets`、`kimi-context-lab-toggle`、`kimi-context-lab-labels`、`kimi-context-release-absent`；Qoder 3：`qoder-slash-reference-context`、`qoder-interface-context-bar`、`qoder-changelog-context-history`），既有来源零删改，来源总数由 1,275 增至 1,293。其中 `kimi-status-panel-context-20261119` 特意没有复用既有的 `kimi-status-panel-source`：后者固定在标签 `@moonshot-ai/kimi-code@2.5.1`（5,852 字节）且服务于 `auth-status` 等字段的「`/status` 不渲染认证行」结论，本次改用 main `80bd35955585`（5,582 字节）的新坐标单独记录上下文段，避免同一 key 覆盖既有证据。
- `site/session-details.js`：只改 `session-context-usage` 一个能力。`facts` 由 4 条增至 5 条并全部重写；claude 记录的 `entry`／`behavior`／`automation`／`persistence`／`conditions` 重写，来源由 2 条增至 3 条；codex 记录五个字段重写并补三个状态栏 id 与「配置文档未同步」的条件，来源由 `codex-commands`＋`codex-config` 换为两条本次核对的新来源；qwen 记录补 warn/auto/hard 来源、`clearContextOnIdle` 三键默认值与旧键已移除，来源由 2 条增至 3 条；kimi 记录含新增的 `storage` 与 `surfaces` 覆盖在内八个字段全部重写，`status` 维持「条件项」，来源由 5 条增至 14 条；qoder 记录七个字段全部重写，`status` 由「未确认」改为「条件项」，来源由 1 条增至 4 条。五家 `value` 与主表一致性由 `validate-details.mjs` 保证，未改动其他能力字段。
- `docs/04-会话与上下文矩阵.md`、`docs/capabilities/sessions/session-context-usage.md` 与其余七类详情文档全部由 `npm run generate` 重新生成；`updatedAt` 前移使 119 篇能力详情与八份矩阵文档的「核对日期」行统一变为 2026-11-19，内容实际产生差异的是 `docs/capabilities/sessions/session-context-usage.md`（能力结论表五行、证据状态两处由「未确认」变「条件项」、跨产品事实 4→5 条、五家逐产品记录、官方来源清单）与 `docs/04-会话与上下文矩阵.md` 的上下文占用一行，其余生成文件只有日期行变化。
- `docs/09-版本与证据.md`：五家「核对坐标」行的核对日期统一改为 2026-11-19，「主要材料」各追加一段本次取证记录（Claude 一段含 `/context [all]` 逐字 synopsis 与三个版本的更新日志核对；Codex 一段含 `/status`、`/statusline` 原文、源码三个 id 与配置文档命中数为 0；Qwen 一段含新旧坐标的 compare 结果与 settings 两处原文；Kimi 一段分四点，含台账已随 0.37.0 发布的纠正、PR #5058 的三个路由与客户端开关、尚未发布的判定依据；Qoder 一段含 `/context` 行原文、八条更新日志时间线、interface 页三节原文与三处边界）；「官方来源」表五行的「会话与上下文」列各追加本次链接（Claude 1 条、Codex 2 条、Qwen 2 条、Kimi 11 条、Qoder 3 条）。行首前缀与行尾 ` |` 保持不变，每行按 ` | ` 切分的片段数改动前后完全一致（核对坐标五行 10／22／12／24／37，官方来源表五行各 7），全文行数维持 74。
- `README.md`：核对日期由 2026-11-18 改为 2026-11-19；能力字段总数维持 119、会话与上下文仍是 11 篇详情，两处摘要文字仍然成立，未改动。
- 校验：`npm run generate` 八个生成器全部通过（会话与上下文 11 篇），`npm test` 三项校验通过——`Validated 119 details × 5 products.`、`Validated links in 297 Markdown files.`、`Validated matrix render, detail schemas, links, and CSS.`。

## 未处理项

- **Kimi PR #5058 的对照测试与估算精度**：PR 说明写用本地 80 个会话约 2.5 万次调用比对、估算按类别汇总后与实测相差在 ±30% 以内，并列出 `coreLoopService.test.ts`、`context.test.ts`、`sessionInfoPanel.test.ts`、`contextPanel.test.ts` 等覆盖点。这些属实现质量证据，本次只登记结论、没有逐个核对测试文件内容。
- **Kimi 桌面端与 `kimi web` 的 Surface 拆分**：本次把构成视图记在 `session-context-usage` 的条件项里。`surface-desktop` 与 `surface-web` 两个字段是否也要登记这个实验室开关（以及它与「多标签页的会话列表」等既有 Lab 项的关系），需要单独取证。
- **Kimi 2.7.0 的其他条目**：同版还有 Amazon Bedrock provider（`type = "bedrock"` 加 `AWS_REGION`，属 `model-provider`）、`/tasks` 显示前台运行中的 agent（属 `cmd-tasks` 或 `agent-background`）、`kimi server` 不开浏览器启动本地服务（属 `surface-service`）、Follow-up behavior 的 Steer 设置（属 `session-messaging` 或 TUI 交互）、`KIMI_CODE_SESSION_ID` 与 `KIMI_CODE_WORKSPACE_ID` 注入 `Bash` 子进程（属 `execution-shell`）、`kimi web --json` 与 `GET /api/v1/sessions/{id}/interactions`、`POST …:wait`、`GET /api/v1/kap.md`（属 `surface-web`）。按「一次只处理一个能力字段」的规则本次都没有展开。
- **同日 main 上的另外两条 Kimi 提交**：`chore: remove the root AGENTS.md size limit (#5144)` 属 `extension-project-instructions`（该字段 Kimi 记录目前较浅，只有 `AGENTS.md` 一句结论，是下一次深化的候选）；`fix(tui): decouple compaction from turn state (#5137)` 属 `session-compress`。
- **Qoder `/context` 的面板构成**：官方没有专页，更新日志只证明存在「usage statistics and categorization」。面板是否给 warn/auto/hard 阈值线、是否接受参数、分类项名称，以及 “Fixed context warning thresholds becoming inconsistent” 涉及的阈值取值与配置键，全部记为未确认。
- **Codex 状态栏字段的配置文档缺口**：`tui.status_line` 的合法取值列表只存在于源码，官方 Advanced Configuration 与 config-reference 都没有同步；本次按源码记录并把「文档未同步」写进条件，没有推断其他未列出的字段。
- **Claude `/context` 的分类清单**：官方只写 “breakdown by category” 并举例 `CLAUDE.md` 与 auto memory 文件，没有给完整分类表；本仓库 Claude 记录沿用「系统提示、工具、`CLAUDE.md`、Memory、Skills 和会话消息」这一旧描述，本次未逐类回到一手资料核对，属下一次可深化点。
- **Codex 与 Qwen 的 MCP 连接共享**：官方来源快照里 Codex 当天有 “Enable MCP connection sharing by default (#62552)”，属 `extension-mcp`，本次未处理。

## 影响页面

- [会话与上下文矩阵](../docs/04-会话与上下文矩阵.md)
- [上下文占用详情](../docs/capabilities/sessions/session-context-usage.md)
- [会话与上下文详情目录](../docs/capabilities/sessions/README.md)
- [版本与证据](../docs/09-版本与证据.md)
