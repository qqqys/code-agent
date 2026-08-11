# Kimi Code `/tasks` 后台 Agent 实时活动

Kimi Code PR #2816（提交 `ad12ad8a140d24051d93ec98a4a6921ab33723ff`，2026-08-11 合入 main）为 `/tasks` 任务浏览器新增后台 Agent 实时活动视图：此前后台 Agent（`run_in_background` 或 `Ctrl+B` 启动）在 `/tasks` 面板只有静态元数据，输出视图在任务完成前显示 `[no output captured]`（Agent 任务输出只在终态时一次性捕获）；现在子 Agent 事件被分流进按 Agent 的有界内存活动流，预览窗格实时显示步骤级活动，Enter/O 打开全屏详情，Ctrl+O 展开或收起。changeset（`background-agent-activity-view.md`，minor）在核对时仍留在 main 分支，最新 Release 仍为 0.34.0（2026-08-06），属 main 分支尚未发布的功能。本次更新 `execution-background`（后台任务）字段的 Kimi Code 记录。

## 修正

- `execution-background` 字段 Kimi Code 矩阵结论由 "`run_in_background` · `/tasks`" 改为 "`run_in_background` · `/tasks`；条件：`/tasks` 后台 Agent 实时活动（main 分支，尚未发布）"。
- Kimi Code 详情补入：`/tasks` 预览窗格实时显示后台 Agent 活动，Enter/O 打开全屏活动详情、Ctrl+O 展开或收起；内存活动流（subagent activity store）按引擎 `turn.step.started` 事件分段，上限 `MAX_SUBAGENT_ACTIVITY_STEPS = 20` 步、步骤文本尾段 4000 字符、单条工具输出 8000 字符、工具参数字符串 16 KiB；全屏详情按步骤分组渲染 Markdown 文本和各工具结果；活动流仅存内存、会话切换时释放（`clear`），不落盘；实时视图只在 TUI 任务浏览器实现（`apps/kimi-code/src/tui/`），Web 与 SDK 未提供；会话恢复后没有内存活动记录的任务（如 lost 任务）回退到原捕获输出视图，Agent 任务输出仍在终态时一次性捕获。
- 新增跨产品事实：Kimi Code 后台 Agent 输出原在终态一次性捕获、完成前显示 `[no output captured]`，main 分支起预览窗格实时显示步骤级活动、活动记录只存内存且上限最近 20 步。
- 新增来源：`kimi-background-activity-commit`（固定到提交 SHA `ad12ad8a140d24051d93ec98a4a6921ab33723ff`）、`kimi-background-activity-changeset`（同一提交中的 `.changeset/background-agent-activity-view.md`）。
- `docs/06-任务执行与Git矩阵.md` 后台任务行 Kimi Code 单元格同步更新。
- `docs/09-版本与证据.md`：Kimi Code 主要材料补充 `/tasks` 后台 Agent 实时活动视图（内存活动流，main 分支尚未发布）；官方来源表 Kimi Code 执行与 Git 列新增提交与 changeset 两个固定 SHA 链接。
- `npm run generate` 重新生成 `docs/capabilities/execution/`（10 个详情，`execution-background.md` 内容更新）。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [后台任务详情](../docs/capabilities/execution/execution-background.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 提交 `ad12ad8a140d24051d93ec98a4a6921ab33723ff`（PR #2816 `feat(kimi-code): show live background agent activity in the /tasks panel`，作者时间 2026-08-11T21:32:39+08:00，2026-08-11T13:32:39Z 合入 main）：描述原文 "Background agents (run_in_background or Ctrl+B) showed no run details: the /tasks panel only had static metadata, and its output view stays '[no output captured]' until completion because agent tasks capture output only once at the end. Tee child-agent events into a bounded in-memory per-agent activity store segmented by the engine's own turn.step.started events … The /tasks preview pane now shows a live activity preview for agent tasks, and Enter/O opens a full-screen detail view rendering step-grouped Markdown text and per-tool results through the main transcript's renderers, with Ctrl+O to expand. Agent tasks without an in-memory record (e.g. lost after resume) fall back to the captured-output view."；PR 内后续提交 "retain 20 recent steps in the background agent activity view" 将保留步数定为 20。
- 该提交新增 `apps/kimi-code/src/tui/constant/rendering.ts` 常量：`MAX_SUBAGENT_ACTIVITY_STEPS = 20`、`SUBAGENT_STEP_TEXT_TAIL_CHARS = 4000`、`SUBAGENT_TOOL_OUTPUT_MAX_CHARS = 8000`、`SUBAGENT_ARG_STRING_MAX_CHARS = 16 * 1024`；实现文件为 `apps/kimi-code/src/tui/components/dialogs/agent-activity-viewer.ts`、`apps/kimi-code/src/tui/controllers/subagent-activity-store.ts` 与 `tasks-browser.ts` 等，全部位于 TUI 包内。
- `tasks-browser.ts` 回退逻辑注释原文："Agent tasks get the activity detail view when this process holds a record for the agent; otherwise (e.g. a `lost` task after resume) fall through to the captured-output viewer."；`subagent-activity-store.ts` 文档注释原文："Everything lives in memory and is released on session switch (`clear`)."。
- changeset 文件 `.changeset/background-agent-activity-view.md`（核对时经 main 分支 raw 地址抓取，仍为待发布状态）原文："`@moonshot-ai/kimi-code`: minor — Show the live work progress of background subagents in the `/tasks` panel."。
- Kimi Code 最新 Release 为 `@moonshot-ai/kimi-code@0.34.0`（2026-08-06T13:59:12Z），早于本提交；官方 `docs/zh/reference/slash-commands.md` 未随提交改动，`/tasks` 文档描述不变，故按源码确认记录并标注未发布。
- 其他产品本次无同类变化：Claude Code v2.1.226/v2.1.227 为修复与界面改进（此前单元已核对，无新增用户能力）；Codex 2026-08-11 合入提交（#38036、#38035、#38034、#38033、#38032、#38026、#38024、#38020）为 TUI/日志/沙箱修复，无后台任务观察能力变化；Qwen Code v0.21.10（2026-08-11 发布）Features 条目为 OpenAI API 日志清理（#8893）、Web Shell 会话列表缓存（#8891）、ACP reasoning effort 配置（#8526）与 Web Shell 图片预览（#8930），均不属后台任务实时观察；Qoder CLI 公开文档未见同类变化。
