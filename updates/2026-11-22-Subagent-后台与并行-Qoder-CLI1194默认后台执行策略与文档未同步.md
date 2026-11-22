# 后台与并行：Qoder CLI 1.1.94 把默认 Subagent 执行策略改为后台（更新日志已确认、Subagent 页/设置参考/Parallel Tasks 页均未同步），启用开关与 `background` 默认值仍记为未确认；其余四家默认落点不变

日期：2026-11-22
能力字段：`agent-background`（Subagent · 后台与并行）

## 为什么选这个字段

官方来源快照里 Qoder CLI 没有公开仓库提交与 Release（闭源，只有文档站与更新日志站），因此本次直接核对 `changelog.qoder.com/cli`。该站最新条目仍是 **CLI 1.1.94（November 20, 2026）**，没有更新的版本；上一轮研究（提交 `915ec2d`，2026-11-21）已把该版记进 `session-schedule` 与 `cmd-tasks` 的坐标，但明确把 1.1.94 的两条默认值变化列为「下一次研究的候选」：

> **Qoder CLI 1.1.94 的两条默认值变化**：“Changed the default Subagent execution strategy to run in the background” 与本仓库 `agent-background` 字段 Qoder 单元格现记的「`background` frontmatter 决定默认后台、需先启用后台 Subagent 会话……官方未公布启用后台 Subagent 会话的开关」直接相关……两条都是下一次研究的候选，本次未展开。

其中 Subagent 默认执行策略这一条直接推翻/补充 `agent-background` 的 Qoder 既有记录，因此本次研究单元定为 `agent-background`，并按同一口径复核其余四家的默认落点是否变化。同版另一条 “Background Bash commands now default to a 10-minute timeout” 属 `execution-background`，按「一次只处理一个能力字段」的规则本次未展开。

## 本次改动

### 1. Qoder CLI：1.1.94 把默认 Subagent 执行策略改为后台（更新日志已确认）

一手证据是官方更新日志 `https://changelog.qoder.com/cli`（2026-11-22 复核，HTML **831,154 字节**，`https://docs.qoder.com/release-notes/qoder-cli` 以 307 跳转到该址，最新条目为 November 20, 2026 的 CLI 1.1.94）。CLI 1.1.94 小节标题逐字为 “Stability Fixes and Improved Background Execution Defaults”，与后台 Subagent 直接相关的一条逐字为：

> Changed the default Subagent execution strategy to run in the background

这是本仓库此前完全没有记录过的一条默认值变化（全仓检索 “default Subagent execution strategy” 命中数为 0）。

### 2. Qoder CLI：官方文档三页均未同步该默认（负面检索）

为确认 1.1.94 的默认是否已写进文档，本次以 `.md` 与 HTML 两种渲染复核了三份官方材料：

- **Subagent 页**（`https://docs.qoder.com/cli/subagent`，HTML **1,144,295 字节**、`.md` 变体 **34,148 字节**）：frontmatter 字段表 `background` 行仍逐字为 “Whether the Subagent should launch in the background by default. Requires background Subagent sessions to be enabled.”（Boolean、必填 No，**仍无默认值**）；后台行为仍逐字为 “When background Subagent sessions are enabled, independent work can also run in the background and notify the main session later.”；全页没有出现 1.1.94、也没有 “default … background” 一类表述。
- **设置参考**（`https://docs.qoder.com/cli/settings-reference`，`.md` **31,752 字节**，较 2026-10-18 的 31,634 字节略增）：全页仍**没有任何启用后台 Subagent 会话的设置键**（`agents.background`、`backgroundSubagents` 与 `general.background` 都不存在；含 background 字样的只有终端主题相关的 `ui.autoThemeSwitching`、`ui.terminalBackgroundPollingInterval` 与后台任务 `.output` 文件 7 天清理的保留说明），也没有 Subagent 并发键或 `QODER_CLI_MAX_CONCURRENT_SUBAGENTS`（该环境变量只在更新日志出现）；`agents` 组仍只有 `agents.overrides`。本次新增的环境变量 `QODER_SUBAGENT_MODEL`（“Model used by Subagents.”）属 `agent-model` 字段、与后台执行无关。
- **Parallel Tasks 页**（`https://docs.qoder.com/cli/parallel-tasks`，`.md` **3,697 字节**）：仍只把 Background Agents / Tasks 与 Worktree、Subagents 并列为三种隔离方式并写 “Use `/tasks` to view currently running background tasks:”，没有说明如何启用后台 Subagent 会话。

因此本次按「更新日志已确认、官方文档未同步」的既有口径记录（与 Claude `session-schedule` 的 30 天、`CLAUDE_CODE_SUBAGENT_EFFORT` 等条目同类），并把「默认即后台」与文档仍写的「需先启用后台 Subagent 会话」如何衔接明确记为**未确认**——究竟是后台会话默认已启用、`background` 字段默认变为 `true`、还是会话级策略默认值改变，官方没有给出判据。

矩阵单元格据此追加一条「条件：」子句（badge 由 `官方确认` 变为 `条件项`，与 `session-schedule` 的 Claude 单元格处理文档滞后的方式一致），详情页 `behavior` 补录 1.1.94 逐字条目与三页未同步的复核，`conditions` 补录三页字节数、三种读法均未确认、以及 1.1.42 嵌套限制与 1.1.79/1.1.80/1.1.93 后台稳定性修复时间线。

### 3. Qoder CLI：后台 Subagent 更新日志时间线补全

既有来源 `qoder-release-notes-subagent-concurrency` 的坐标停在 2026-10-18（最新 CLI 1.1.73），且其 label 写「全页没有含 ‘background subagents’、‘background sessions’ 或 ‘parallel subagents’ 字样的条目」——这一负面结论在 1.1.94 之后已不成立。本次按全页扫描补全 1.1.74 至 1.1.94 之间与后台 Subagent 相关的条目（既有来源零删改，另建 `qoder-v1194-subagent-background-changelog` 记录）：

| 版本 | 日期 | 逐字条目 |
| --- | --- | --- |
| CLI 1.1.94 | November 20, 2026 | Changed the default Subagent execution strategy to run in the background |
| CLI 1.1.93 | November 19, 2026 | Fixed background processes not being reclaimed when a subagent exits |
| CLI 1.1.93 | November 19, 2026 | Fixed the issue where the progress line kept showing “Starting...” after delegating to a subagent |
| CLI 1.1.80 | October 27, 2026 | Improved Subagent startup speed so Git operations no longer block startup |
| CLI 1.1.79 | October 26, 2026 | Fixed Hook progress from background Agent incorrectly showing in the TUI |

更早的 CLI 1.1.42（September 3, 2026）“Limited subagent spawning to one nested level by default” 与 CLI 1.1.31（August 26, 2026）`QODER_CLI_MAX_CONCURRENT_SUBAGENTS` 并发上限仍在同一页，结论不变。

### 4. 其余四家：默认落点复核，结论不变

`facts` 第 1 条比较五家的默认前后台落点，本次只改写其中 Qoder 一段（补 1.1.94 默认变化与文档未同步），其余四家逐字未动，并核对各自最新 Release 没有触及后台 Subagent 默认：

- **Claude Code**：最新 Release v2.1.330（2026-11-20T22:32:56Z）的实质条目为周期任务 30 天、Enterprise Admin Console 组织登录、内置 mod `easel`、`/mcp` 的 “Plugin MCPs”、`claude plugin install --json` 与 `CLAUDE_CODE_FULL_SIGN_IN_LINK=1`，没有 Subagent 前后台默认变化；`agent-background` 的 Claude 单元格仍按 v2.1.302 的 Fork 默认记录。
- **Codex**：最新稳定 Release rust-v0.171.0（2026-11-20T00:44:47Z）的 “Enabled the TUI workspace by default, with searchable document previews, image previews, and subagent transcripts alongside the main conversation.” 是 TUI 工作区的**查看**变化，不是前后台默认变化；Codex 官方仍只写并行派生后统一收集结果、不区分前台与后台，单元格结论不变。rust-v0.173.0-alpha.1–4 为预发布且 Release 正文为空，未取证。
- **Qwen Code**：最新 Release v0.28.4（2026-11-22T12:04:21Z）集中在 Web Shell、Managed Agent／Hosted Harness 与 core runtime（Gemini 4 reasoning defaults、命令迁移只建 Markdown、扩展 manifest 支持 UTF-8 BOM、Local Runtime 状态目录权限），没有 Subagent 前后台默认变化；单元格仍按 v0.25.2 文档（41,363 字节）记录。
- **Kimi Code**：最新稳定 Release `@moonshot-ai/kimi-code@2.7.2`（2026-11-20）与快照里的 main 提交 “refactor: deliver subagent model choices via system reminder (#5190)” 属 `agent-model` 字段、“feat(session): add POST /sessions/{id}:continue”（#5048）属会话继续，均与后台默认无关；`Agent` 工具 `run_in_background` 默认 `false` 的结论不变。

## 同步范围

- `site/data.js`：`updatedAt` 由 2026-11-21 改为 2026-11-22；`agent-background` 行只改 Qoder 一个单元格（追加 1.1.94 默认变化的「条件：」子句、文档三页未同步、启用开关与 `background` 默认值仍未给出），其余四家单元格逐字未动；能力字段总数维持 119。新增 3 个来源（`qoder-v1194-subagent-background-changelog`、`qoder-subagent-background-20261122`、`qoder-settings-reference-agents-20261122`），既有来源零删改。
- `site/subagent-details.js`：只改 `agent-background` 一个能力。`facts` 第 1 条改写 Qoder 一段（条数维持 6）；qoder 记录的 `behavior` 与 `conditions` 两个字段改写，来源由 4 条增至 7 条；其余四家记录逐字未动。五家 `value` 与主表一致性由 `validate-details.mjs` 保证。
- `docs/09-版本与证据.md`：五家「核对坐标」行的核对日期统一改为 2026-11-22；Qoder 行「主要材料」追加一段本次取证记录（1.1.94 逐字条目、三页字节数与未同步结论、未确认的三种读法、相邻稳定性修复时间线）；「官方来源」表 Qoder 行的「Subagent 或 Agent」列追加本次 3 条链接。行首前缀与行尾 ` |` 保持不变，每行按 ` | ` 切分的片段数改动前后完全一致（核对坐标五行 10／22／20／30／44，官方来源表五行各 7），全文行数维持 73（`wc -l`，与 HEAD 一致）。
- `README.md`：核对日期由 2026-11-21 改为 2026-11-22；能力字段总数维持 119、Subagent 仍是 22 篇详情，两处摘要文字仍然成立，未改动。
- `docs/capabilities/subagents/agent-background.md`、`docs/capabilities/subagents/README.md` 与其余七类详情文档、六份由生成器产出的矩阵文档（03–08）全部由 `npm run generate` 重新生成；`updatedAt` 前移使 119 篇能力详情与生成的矩阵文档「核对日期」行统一变为 2026-11-22，内容实际产生差异的是 `docs/capabilities/subagents/agent-background.md`（能力结论表 Qoder 一行、跨产品事实第 1 条、Qoder 逐产品记录、官方来源清单）。`docs/01-Slash命令矩阵.md` 与 `docs/02-Subagent能力矩阵.md` 不由生成器产出（命令与 Subagent 生成器只写各自的 `docs/capabilities/<category>/`），属手工维护：本次手工更新 `docs/02` 的「后台运行」行 Qoder 单元格（追加 1.1.94 默认变化与文档未同步的条件），`docs/01` 与本字段无关、未改动。

## 未处理项

- **「默认即后台」的确切含义**：1.1.94 只写 “Changed the default Subagent execution strategy to run in the background”，没有说明是后台会话默认已启用、`background` frontmatter 默认变为 `true`、还是会话级策略默认值改变，也没有给出启用后台 Subagent 会话的开关名。等官方 Subagent 页或设置参考同步后再取证。
- **Qoder CLI 1.1.94 的 “Background Bash commands now default to a 10-minute timeout”**：属 `execution-background` 字段，本次未展开，是下一次研究的候选。
- **Qoder CLI 1.1.93 的 `protocolVersion`**：MCP 服务器配置新增 `protocolVersion` 选项，属 `extension-mcp`，本次未处理。
- **`QODER_SUBAGENT_MODEL` 环境变量**：本次在设置参考新见到（“Model used by Subagents.”），属 `agent-model` 字段，本次未展开。
- **Codex rust-v0.171.0 的其余条目**：GPT-6.2 Sol/Astra 进模型目录（`model-switch`/`model-provider`）、`codex exec --remote <ADDR>`（`surface-headless`）、可配置 undo/redo 快捷键（`cmd-keymap`）、`/statusline` 的 MCP 状态行创作（`extension-status-line`，该字段已记录 v0.171.0 来源）分属不同字段，本次都未展开。
- **Qwen v0.28.4 的其余条目**：Gemini 4 reasoning defaults（`model-*`）、命令迁移只建 Markdown 并在冲突时保留原 TOML（`extension-custom-commands`）、扩展 manifest 支持 UTF-8 BOM（`extension-plugins`）分属不同字段，本次未展开。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [后台与并行详情](../docs/capabilities/subagents/agent-background.md)
- [Subagent 能力详情目录](../docs/capabilities/subagents/README.md)
- [版本与证据](../docs/09-版本与证据.md)
