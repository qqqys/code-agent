# 任务列表：Claude v2.1.329 把定时任务、`/loop` 唤醒、目标与会话分支并入 `/tasks` 且 `x` 逐项停止，Kimi 2.7.0 起 `/tasks` 同列运行中的前台 subagent，Qoder 补录 `/bg`、`/background` 别名，Codex 补录 `/clean` 别名与 `unified_exec` 条件，Qwen 固定 `/tasks` 文本清单与三种运行模式

日期：2026-11-20
能力字段：`cmd-tasks`（Slash 命令 · 任务列表）

## 本次改动

官方来源快照里 Claude Code 在采集前一天晚上发布了 v2.1.329（2026-11-19T22:14:41Z，`CHANGELOG.md` 更新提交 `f9e4d1e5753c` 早 17 秒），本仓库 `docs/09-版本与证据.md` 的 Claude 坐标当时只到 v2.1.328；Kimi Code 在采集当天凌晨发布了 `@moonshot-ai/kimi-code@2.7.1`（2026-11-20T06:35:34Z），前一天发布的 2.7.0 里有一条上一单元明确留作后续的 `/tasks` 变化。核对后确认这两条都落在 `cmd-tasks` 字段上，且该字段五家记录都偏浅（Claude 只写「列出当前会话后台任务」、条件栏是「无额外条件」，Kimi 只写「浏览后台任务列表」，Qoder 只写「列出并管理后台任务」且别名栏为「无公开别名」，Codex 没有别名与前置条件），因此本次研究单元定为 `cmd-tasks`，并按同一口径复核五家。

### 1. Claude Code：v2.1.329 扩大 `/tasks` 覆盖范围并统一后台计数

更新日志 `## 2.1.329` 段（固定到提交 `f9e4d1e5753ccffcffdd832f047d72be000396a6`，1,363,204 字节，全文没有 `## 2.1.330` 段）里与任务列表相关的三条逐字为：

- “Added this session's scheduled tasks, `/loop` wakeups, the goal and this conversation's forks to `/tasks`; x stops one after asking”
- “Changed the `/tasks` header and the footer's background count to one number covering shells, monitors, MCP calls, agents, workflows and scheduled tasks”
- “Changed 'Exit and stop tasks' to end this session's scheduled tasks so they don't run again on resume, unless you exit while Claude is responding”

即列表范围从后台 Shell 与 Subagent 扩到本会话的定时任务、`/loop` 待触发唤醒、目标与本会话分支，`x` 先询问再停止其中一项；表头计数与页脚后台计数合并为一个覆盖六类工作的数字。同段另有一条渲染修复（fullscreen、`/help`、history search 与 background tasks list 在矮窗口丢行或丢标题）与一条 Hook 载荷变更（Stop／SubagentStop 的 `background_tasks` 把 Monitor 脚本报为 `monitor` 而不是 `shell`），后者属扩展系统字段、本次只登记不展开。

四页官方文档同步复核并补录：

- 命令页（56,777 字节）`/tasks` 行逐字为 “View and manage background work in the current session, including subagents that have finished. Also available as `/bashes`”，即 `/bashes` 是此前没有记录的别名；`/background [prompt]` 行给出 `Alias: /bg`、“Pass a prompt to send one more instruction before detaching” 与 “Monitor the session with `claude agents`”；页首另写 `/status`、`/tasks`、`/usage` 属在 Claude 回复期间也立即执行、不打断当前回合的命令。
- “Run agents in parallel” 页（9,383 字节）逐字为 “For anything running in the background of the current session, `/tasks` lists each item and lets you check on, attach to, or stop it.”，并把 `/workflows`（运行中与已完成的 run、所处阶段、已完成 Agent 数）与 `claude agents`（后台会话）分列为另外两个入口。
- Interactive mode 页（78,865 字节）“## Background Bash commands” 一节逐字为 “Background tasks are automatically cleaned up when Claude Code exits. On macOS and Linux, when you stop a background task from `/tasks` or Claude Code stops it at exit, processes that detached from the task's shell, such as ones started under `setsid` or `timeout`, stop too”，同节另有 `Ctrl+B` 后台化（tmux 需按两次）、输出超 5GB 自动终止、`CLAUDE_CODE_DISABLE_BG_SHELL_PRESSURE_REAP=1` 关闭内存压力停止、`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 或 bare mode 关闭后台命令与 `Ctrl+B`；“## Task list” 一节写明待办清单 “is separate from the background-task view. To see running shells and subagents, use `/tasks` instead.”，即 `Ctrl+T` 的待办清单与本页比较的后台任务视图不是同一个东西。
- “Run prompts on a schedule” 页（20,380 字节）**全页没有出现 `/tasks`**：管理入口仍写 “Ask Claude in natural language to list or cancel tasks, or reference the underlying tools directly.”，工具表为 `CronCreate`、`CronList`（“List scheduled tasks with their IDs, schedules, next run times, and prompts.”）与 `CronDelete`，自定节奏循环只写 “A dynamically scheduled loop appears in your scheduled task list like any other task”，Limitations 一节写 “You also lose session-scoped tasks if you exit between turns by choosing `Exit and stop tasks`.”。因此「定时任务、`/loop` 唤醒、目标与分支并入 `/tasks`」目前只有更新日志一手记录，这些条目能否用 `x` 停止、以及停止定时任务是否等价于 `CronDelete`，都记为未确认。

`x` 停止选中项另有文档级证据：MCP 文档的 “Stop an MCP task or get its result” 一节逐字为 “To stop a running task, select it in `/tasks` and press `x`, or ask Claude to.” 与 “Pressing `Esc` doesn't stop a background task.”，本次把该来源一并挂到 Claude 记录上。

### 2. Kimi Code：2.7.0 起 `/tasks` 同列运行中的前台 subagent

中文 Slash 命令参考 `docs/zh/reference/slash-commands.md` 坐标前移到该文件最新一次变更提交 `a09bf8573cdfaa611366b7ca8c7bfefb1727409b`（2026-11-18T11:54:13Z，“feat(tui): show foreground agent activity in /tasks (#5049)”，13,258 字节），「## 会话管理」表 `/tasks` 行逐字为 “| `/tasks` | `/task` | 浏览后台任务和正在运行的前台 subagent。选中任务后按 `Enter` 查看输出。 | 是 |”。与本仓库此前记录的「浏览后台任务列表」相比，新增两点：列表同时包含**正在运行的前台 subagent**，以及**选中后按 `Enter` 查看输出**；末列「随时可用」为「是」即流式输出期间也可执行。

`@moonshot-ai/kimi-code@2.7.0`（2026-11-19T11:16:28Z 发布）的发布说明逐字为 “[#5049] [`a09bf85`] Thanks @Grapedge! - View running foreground agents and their activity in `/tasks`.”，与文档同一提交，据此确认该行为**已随 2.7.0 发布**而不是只合入 main；同版另有 “[#4886] [`1fc7be4`] … - Fix corrupted characters in the truncated output of background Bash tasks.”，属后台任务输出显示的修复。`@moonshot-ai/kimi-code@2.7.1`（2026-11-20T06:35:34Z 发布）里与后台相关的只有 “[#5166] [`f0ea8ac`] … - Keep queued prompts pending until background notification turns finish.”，没有任务列表变化。官方命令参考没有给出在 `/tasks` 里停止任务的键位，停止方式记为未确认；0.35.0 起的后台 Agent 内存实时活动流仍记在「后台与并行」字段，本次只把该提交作为来源挂在 Kimi 记录上。

### 3. Qoder CLI：补录 `/bg`、`/background` 两个官方别名

官方 Slash 命令参考 `.md` 孪生体（11,720 字节，与 2026-11-19 记录同字节数）“## Work Modes” 表 `/tasks` 行逐字为 “Open the background task panel (aliases `/bg`, `/background`).”，本仓库此前别名栏写「无公开别名」、执行行为写「列出并管理后台任务」，属漏记而非产品新增，本次改正。同表另有 `/workflows`（“Open the workflow panel (alias `/workflow-tasks`).”）、`/crontab`（“Open the scheduled and recurring task management panel.”）、`/quest` 与 `/goal`，“Sessions and Conversations” 表的 `/subtask` 行为 “Dispatch a background subagent with the current context; results return here (requires Agent sessions).”；页末 “## Conditional Commands” 只列 `/agents`、`/plan`、`/workflows`、`/marketplace`、`/skills`、`/mcp` 与 `/setup-github`，不含 `/tasks`。

另两页给出用途口径：“Built-in Capabilities Overview”（15,247 字节）把该行写为 “| `/tasks` | Manage Tasks. |” 并写 “You can use `/workflows` to manage workflows, and `/tasks` to track task progress.”；“Process Tasks in Parallel”（3,697 字节）首段把 Worktree、Background Agents / Tasks 与 Subagents 并列为三种隔离方式、正文写 “Use `/tasks` to view currently running background tasks:”。三页都没有说明面板列出哪些任务类型、有哪些键位、能否在面板里停止任务，这三点记为未确认。

### 4. Codex：补录 `/clean` 别名、三行输出上限与 `unified_exec` 前置条件

`https://developers.openai.com/codex/cli/slash-commands` 现以 308 重定向到 `https://learn.chatgpt.com/docs/developer-commands?surface=cli`（`.md` 孪生体 59,711 字节）。“## Built-in slash commands” 表把 `/ps` 记为 “Show background terminals and their recent output.”／用途列 “Check long-running commands without leaving the main transcript.”，`/stop` 记为 “Stop all background terminals.”／“Cancel background terminal work started by the current session.”；两条专节补齐了行为细节：“Codex shows each background terminal's command plus up to three recent, non-empty output lines so you can gauge progress at a glance.”、“Background terminals appear when `unified_exec` is in use; otherwise, the list may be empty.”、“Confirm if Codex asks before stopping the listed terminals.” 与 “Codex stops all background terminals for the current session. `/clean` is still available as an alias for `/stop`.”。

源码 `codex-rs/tui/src/slash_command.rs`（固定到该文件最新一次变更提交 `5f775c7f4f5f3e0b3bb6eb499b280e023e697f71`，2026-11-17T21:05:23Z “Add `/rc` to manage remote control from the TUI (#62121)”，14,582 字节，与 main 一致）确认别名来源与参数边界：枚举含 `Ps,` 与 `#[strum(to_string = "stop", serialize = "clean")] Stop,`，描述匹配臂为 `SlashCommand::Ps => "list background terminals",` 与 `SlashCommand::Stop => "stop all background terminals",`，`supports_inline_args` 不含 `Ps`、`Stop`，文件里没有 `Tasks` 或 `Background` 变体。同枚举的 `/daemon`（“Open background server controls.”）管的是本地后台服务、`/agents` 是会话仪表盘、`/subagents` 在本会话的 Subagent 之间切换，都不属本字段。

Surface 边界一并固定：`https://learn.chatgpt.com/docs/reference/slash-commands.md`（5,012 字节）是 ChatGPT 应用侧的 28 条 Slash 命令表（`/approve`、`/archive`、`/chat`、`/cloud`、`/cloud-environment`、`/compact`、`/fast`、`/feedback`、`/fork`、`/goal`、`/ide-context`、`/init`、`/local`、`/mcp`、`/memories`、`/model`、`/new`、`/pet`、`/pin`、`/plan`、`/project`、`/reasoning`、`/rename`、`/review`、`/side`、`/status`、`/usage`、`/worktree`），既没有 `/ps` 也没有 `/stop`，属另一 Surface 的表，不据此推断 CLI 没有这两条命令。

### 5. Qwen Code：坐标前移并固定文本清单与三种运行模式

命令文档坐标前移到 `docs/users/features/commands.md` 的最新变更提交 `ed8a4045ba74521eb0c12d73df8fe927a8ce5ae6`（2026-11-19T14:34:15Z，81,966 字节），`/tasks` 行逐字为 “| `/tasks` | List background tasks | `/tasks` |”，`/workflows` 行为 “Inspect workflow runs; cooperatively pause/resume a background run”，全文没有 `/stop`、`/kill` 或 `/background` 行，也没有描述 Background Tasks 对话框的正文段落。

源码 `packages/cli/src/ui/commands/tasksCommand.ts`（固定到该文件最新一次变更提交 `d0d68c0e8bc77c563a3870a980a8388196e81100`，2026-08-21T07:24:49Z “feat(cli): extend non-blocking slash commands to more builtins (#9495)”，9,024 字节，与 main 一致）给出文档没有的细节：定义为 `name: 'tasks'`、`kind: CommandKind.BUILT_IN`、描述 “List background tasks (text dump — interactive dialog opens via the footer pill)”、`supportedModes: ['interactive', 'non_interactive', 'acp'] as const`、`canRunDuringStreaming: true`，没有 `altNames`；定义内注释写明三种模式都保留该命令是因为 non_interactive 与 acp 消费者（headless `-p`、IDE bridge、SDK）没有对话框、只能靠这份文本清单查看后台任务状态。输出为 `Background tasks (<N> total)` 标题行、每条 `[<id>] <状态>  <运行时长><pid>  <标签>` 与可选的 `output: <路径>` 行，空列表返回 `No background tasks.`，交互式模式追加指向页脚 Background tasks 胶囊的提示（注释说明该提示不在 non_interactive 与 acp 输出，且故意不固定单一按键路径因为有 Subagent 时 ↓ 会先经过 Arena agent tab bar）；`type TaskEntry = AgentTask | ShellTask | MonitorTask;` 把条目固定为 agent、shell、monitor 三类，状态标签含 running、paused、paused (resume blocked)、completed (exit <码>)、failed 与 cancelled 并可附事件数。v0.21.8 起的 Workflow 协作暂停/恢复结论不变。

### 6. 跨产品事实

`facts` 由 3 条增至 5 条并全部重写：① 四家用 `/tasks`、Codex 用 `/ps` 加 `/stop`，别名各家不同（Claude `/bashes`、Kimi `/task`、Qoder `/bg` 与 `/background`、Codex `/clean`）；② 只有 Claude 把定时任务、`/loop` 唤醒、目标与会话分支并进同一列表并给出统一的后台计数（v2.1.329 起）；③ Kimi 2.7.0 起同列运行中的前台 subagent，Qwen 只输出文本清单且条目为 agent、shell、monitor 三类；④ 停止粒度不同——Claude `x` 逐项确认后停止、Codex `/stop` 一次停掉本会话全部后台终端、Qwen 在对话框内取消、Kimi 与 Qoder 官方未给出停止操作；⑤ 可用时机与前置条件不同——Claude 与 Qwen、Kimi 都可在模型输出期间执行，Codex 的后台终端只在 `unified_exec` 生效时出现。原第 3 条「Claude Code 的任务列表包含已完成的后台 Subagent」已并入新的第 ② ③ 条与 Claude 记录正文。

`excludes` 里的「长期目标状态」删除：Claude v2.1.329 起目标本身会出现在 `/tasks` 里，继续排除会与记录冲突；改为排除「定时任务的排程规则、抖动与过期」（这些属 `session-schedule`）。`includes` 增加「列表覆盖的任务类型」与「命令别名」两项。`related` 由 `cmd-custom` 改为 `session-schedule`，其余三项不变。

## 同步范围

- `site/data.js`：`updatedAt` 由 2026-11-19 改为 2026-11-20；`cmd-tasks` 行五个单元格全部改写（Claude 加 `/bashes` 别名与 v2.1.329 列表扩容、Codex 加 `/clean` 别名与 `unified_exec` 条件、Qwen 加三类条目与页脚胶囊入口、Kimi 加前台 subagent 与 `Enter` 查看输出、Qoder 加 `/bg`、`/background` 别名与「打开后台任务面板」）；能力字段总数维持 119。新增 14 个来源（Claude 5：`claude-tasks-command-20261120`、`claude-agents-tasks-20261120`、`claude-interactive-background-20261120`、`claude-v21329-tasks-changelog`、`claude-scheduled-tasks-tasks-20261120`；Codex 2：`codex-ps-stop-cli-20261120`、`codex-slash-command-5f775c7f`；Qwen 2：`qwen-commands-tasks-20261120`、`qwen-tasks-command-source`；Kimi 2：`kimi-tasks-slash-a09bf857`、`kimi-270-release-tasks`；Qoder 3：`qoder-slash-reference-tasks-20261120`、`qoder-builtins-tasks-20261120`、`qoder-parallel-tasks-20261120`），既有来源零删改。
- `site/details.js`：只改 `cmd-tasks` 一个能力。`definition`、`includes`、`excludes` 与 `facts` 全部重写（facts 3→5 条）；claude 记录七个字段全部重写、来源由默认 1 条增至 6 条（含既有的 `claude-mcp-tasks-doc`）；codex 记录补别名 `/clean`、参数、行为与 `unified_exec` 条件，来源由 `codex-commands` 换成本次核对的两条；qwen 记录补输出格式、三类条目与三种运行模式，来源由 5 条换为 6 条（新增两条本次坐标、保留三条 Workflow 暂停来源与 v0.21.8 Release）；kimi 记录补前台 subagent、`Enter` 查看输出与 2.7.0 发布坐标，来源由 1 条增至 3 条；qoder 记录补两个别名与三页口径，来源由 1 条增至 3 条。`related` 由 `cmd-custom` 改为 `session-schedule`。
- `docs/01-Slash命令矩阵.md`：对照表「任务列表」一行五格全部改写；Claude、Codex、Qwen、Kimi、Qoder 五个命令目录各追加一段本次复核说明（含别名的归属与「未确认」项）；「## 来源」列表追加 15 条本次一手链接。
- `docs/capabilities/commands/cmd-tasks.md` 与其余 118 篇能力详情、`docs/03`–`docs/08` 六份矩阵文档全部由 `npm run generate` 重新生成；`updatedAt` 前移使这些文件的「核对日期」行统一变为 2026-11-20，内容实际产生差异的只有 `docs/capabilities/commands/cmd-tasks.md`（定义、边界、5 条跨产品事实、五家逐产品记录、官方来源清单）。`docs/01-Slash命令矩阵.md` 与 `docs/02-Subagent能力矩阵.md` 不由生成器覆盖，前者按上一条手工同步、后者与本字段无关未改动。
- `docs/09-版本与证据.md`：五家「核对坐标」行的核对日期统一改为 2026-11-20，「主要材料」各追加一段「任务列表命令复核」（Claude 一段含三条更新日志逐字与四页文档坐标及文档缺口；Codex 一段含两节专节原文、源码别名来源与另一 Surface 的 28 条命令表；Qwen 一段含新旧坐标与源码输出格式；Kimi 一段含文档行逐字、2.7.0 发布确认与 2.7.1 无变化；Qoder 一段含三页原文与三处未确认）；「官方来源」表五行的「命令」列各追加本次链接（Claude 5 条、Codex 2 条、Qwen 2 条、Kimi 2 条、Qoder 3 条）。全文行数维持 74，官方来源表五行按 ` | ` 切分仍各为 7 段。
- `README.md`：核对日期由 2026-11-19 改为 2026-11-20；能力字段总数维持 119、Slash 命令详情仍是 30 篇，两处摘要文字仍然成立，未改动。
- 校验：`npm run generate` 八个生成器全部通过（Slash 命令 30 篇），`npm test` 三项校验通过——`Validated 119 details × 5 products.`、`Validated links in 299 Markdown files.`、`Validated matrix render, detail schemas, links, and CSS.`（299 含本篇变更记录）。

## 未处理项

- **Claude v2.1.329 的其他条目**：同版还有 `/mcp` 的 “Server message” 行（属 `cmd-mcp` 或 `extension-mcp`）、`/status` 的 “Marketplace auto-update” 行（属 `cmd-status` 或 `extension-plugins`）、`/tasks` 之外的 Code Mode 变更（开启条件放宽到关闭 telemetry／nonessential traffic／feature flags 的会话、PreToolUse Hook 出错不再拒绝脚本内工具调用而要求显式 `onFailure: "block"`、脚本读行范围超 256 MiB 被拒、超过 4,096 个工具时 `tools` 失效的修复，属 `execution-code-mode` 与 `extension-hooks`）、`/code-review` 无目标时改为对默认分支审查整条分支（属 `execution-review`）、`CLAUDE_CODE_DISABLE_DEFERRED_TOOL_RESUME`（v2.1.328，属 `extension-tool-discovery`）、`"onFailure": "block"` 扩到 `mcp_tool` Hook（v2.1.328，属 `extension-hooks`，本仓库 2026-11-04 单元只记了 command 与 HTTP 两类）与信任弹窗提示 Hook 声明位置（属 `security-trust`）。按「一次只处理一个能力字段」的规则本次都没有展开。
- **Claude `/tasks` 里定时任务与目标的可操作性**：更新日志只写 `x stops one after asking`，没有说明按任务类型是否有差异；官方定时任务页仍未同步。停止一条 scheduled task 是否等价于 `CronDelete`、停止目标是否等价于清除 `/goal`，都记为未确认。
- **Kimi `/tasks` 的停止方式与条目字段**：官方文档只给出「选中任务后按 `Enter` 查看输出」，没有停止键位，也没有说明前台 subagent 条目显示哪些活动字段；PR #5049 的实现细节本次没有逐个核对。
- **Qoder 后台任务面板的构成**：三页官方文档都只给一句用途描述。面板列出哪些任务类型、有无输出查看与停止操作、`/bg` 与 `/background` 两个别名是否与 `/tasks` 完全等价，全部记为未确认；官方 CLI 更新日志本次也没有检索 `/tasks` 相关条目。
- **Qoder 命令目录漂移**：`/crontab`、`/subtask`、`/btw`、`/continue`、`/copy`、`/new`、`/rename` 等官方已列出的命令仍未进入 `docs/01` 的 Qoder 命令目录，属整表刷新、留作后续单元。
- **Codex `/ps` 的显示上限来源**：“up to three recent, non-empty output lines” 取自官方文档，本次没有回到源码核对该上限是否可配置。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [任务列表详情](../docs/capabilities/commands/cmd-tasks.md)
- [Slash 命令详情目录](../docs/capabilities/commands/README.md)
- [版本与证据](../docs/09-版本与证据.md)
