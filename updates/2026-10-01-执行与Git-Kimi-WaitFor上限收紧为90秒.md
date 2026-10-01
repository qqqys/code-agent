# 后台任务：Kimi Code `WaitFor` 回合内等待上限由 600 秒收紧为 90 秒、新输入立即结束等待

Kimi Code 官方仓库在 2026-09-29 合入 main 的 PR #4061（`feat: cap WaitFor at 90s and let new input end the wait`，提交 `20a2cea72f5d2c4be3a3845e4ff24ce302a6630e`，25 个文件）把 `WaitFor` 回合内等待后台任务工具的 `timeout` 上限由 600 秒收紧为 90 秒、不再接受更长取值，并让新消息立即结束本次等待。changeset `.changeset/shorter-wait-for.md` 为 `@moonshot-ai/kimi-code` 的 minor 级变更；该提交晚于最新发布 `@moonshot-ai/kimi-code@2.1.1`（2026-09-24），属于合入 main 尚未发布。矩阵 `execution-background`（后台任务）字段 Kimi 列此前的 `WaitFor` 详情写的是"`timeout` 必填，上限 600 秒"，本次补录 main 分支的 90 秒上限与"新输入结束等待"行为，并保留已发布版本（0.38.0–2.1.1）的 600 秒上限表述。其余四家无同类变化：Claude Code、Codex、Qwen Code、Qoder CLI 当前一手资料均未列出专门的回合内等待后台任务工具，矩阵结论保持不变。

## 修正

- `execution-background`（后台任务）矩阵 Kimi Code 列更新为追加"main 分支（尚未发布）起 `WaitFor` 上限由 600 秒收紧为 90 秒、新输入立即结束等待"。证据状态维持"源码确认"。其余四家矩阵结论不变。
- Kimi Code 详情（核心机制）补录：已发布版本 0.38.0–2.1.1 上限 600 秒；main 分支提交 `20a2cea72f5d`（PR #4061，尚未发布）起收紧为 `WAIT_FOR_MAX_TIMEOUT_S = 90`，schema 以 `.max(90)` 拒绝更长取值，`timeout` 描述文本改为 `1-90` 并要求按任务预期耗时选取而非直接填上限，指引不鼓励反复等待。
- Kimi Code 详情（执行行为）补录：main 分支起新消息提前结束本次等待——终端等待期间按 `Enter`（`Ctrl-S` 同样有效）把消息 steer 进当前轮次，等待开始时已在队列中的消息也会被 steer 进来（队列含 shell 命令或 skill 时整个队列与新输入仍排队到轮次结束），被等待的后台任务继续运行、完成后仍自动通知，TUI 把该状态渲染为 `interrupted`（`Wait interrupted by new input`）。
- Kimi Code 详情（条件与边界）补录：90 秒上限与"新输入结束等待"随 PR #4061（提交 `20a2cea72f5d`、changeset `.changeset/shorter-wait-for.md` 为 minor、2026-09-29 合入 main）合入，晚于最新发布 2.1.1（2026-09-24），属于合入 main 尚未发布。
- 跨产品事实新增一条 Kimi `WaitFor` 90 秒上限与新输入结束等待的说明。
- `site/data.js`：`updatedAt` 由 2026-09-30 更新为 2026-10-01；新增来源 `kimi-wait-for-cap-commit`（提交 `20a2cea72f5d`）、`kimi-wait-for-cap-source`（该提交处 `task-wait.ts`，`WAIT_FOR_MAX_TIMEOUT_S = 90`）、`kimi-wait-for-cap-docs`（该提交处 `docs/zh/reference/tools.md`）、`kimi-wait-for-cap-changeset`（`.changeset/shorter-wait-for.md`）；能力字段总数不变（112 个）。
- `docs/09-版本与证据.md`：Kimi Code 核对日期由 2026-09-30 更新为 2026-10-01，主要材料的 WaitFor 条目补录 90 秒上限与"新输入结束等待"；官方来源表"执行与 Git"列 Kimi Code 追加 90 秒上限提交、工具文档、源码与 changeset 四个链接。
- `README.md` 核对日期更新为 2026-10-01。
- `npm run generate` 重新生成 `docs/06-任务执行与Git矩阵.md`、`docs/capabilities/execution/`（`execution-background.md` 与各页核对日期）；`npm test` 通过。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [后台任务详情](../docs/capabilities/execution/execution-background.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code PR #4061（`feat: cap WaitFor at 90s and let new input end the wait`）：2026-09-29T10:52:09Z 合入 main，提交 `20a2cea72f5d2c4be3a3845e4ff24ce302a6630e`，25 个文件，涉及 `.changeset/shorter-wait-for.md`、`apps/kimi-code/src/tui/components/messages/tool-renderers/wait-for.ts`、`apps/kimi-code/src/tui/controllers/session-event-handler.ts`、`docs/en|zh/guides/interaction.md`、`docs/en|zh/reference/tools.md`、`packages/agent-core-v2/src/agent/tools/task/task-wait/task-wait.ts`、`taskWaitTool.ts`、`task-wait.md`、`task-wait-subagent.md` 及相关测试。
- 该提交处的 `packages/agent-core-v2/src/agent/tools/task/task-wait/task-wait.ts`：`export const WAIT_FOR_MAX_TIMEOUT_S = 90;`，`timeout` 参数 schema `z.number().int().positive().max(WAIT_FOR_MAX_TIMEOUT_S).describe('Maximum time to wait, in seconds (1-90). Pick it from how long you expect the task to take, not the maximum. A timeout is not an error: the tool returns the tasks that are still running.')`。
- 该提交处的 `docs/zh/reference/tools.md`（逐字）："`WaitFor` 把当前轮次挂起，直到后台任务结束、超时或收到 steer 消息。参数：`timeout`（必填，单位秒，上限 90）和可选的 `task_id`。……新消息会提前结束本次等待——在终端中，Agent 等待期间按 `Enter` 会把消息 steer 进当前轮次（`Ctrl-S` 同样有效），等待开始时已在队列中的消息也会被 steer 进来（队列中若有 shell 命令或 skill，则整个队列和新输入仍排队到轮次结束）；后台任务继续运行，完成后仍会自动通知。已通过 `WaitFor` 汇报结果的任务不会再推送自动完成通知。"
- 该提交处的 `.changeset/shorter-wait-for.md`：`"@moonshot-ai/kimi-code": minor`，描述 "Cap the agent's in-turn wait for background tasks at 90 seconds (longer timeouts are no longer accepted), discourage repeated waits, and let a new message end the wait immediately."
- TUI 渲染 `apps/kimi-code/src/tui/components/messages/tool-renderers/wait-for.ts`：`WaitForStatus` 增加 `interrupted`，`status === 'interrupted'` 时显示 `Wait interrupted by new input`；`session-event-handler.ts` 在等待开始已有排队消息时调用 `steerQueuedMessagesIntoRunningTurn` 把消息 steer 进当前轮次以结束等待。
- 发布状态核对（2026-10-01）：Kimi Code 最新 Release `@moonshot-ai/kimi-code@2.1.1`（2026-09-24）早于本提交（2026-09-29），故 90 秒上限合入 main 尚未发布；已发布版本（WaitFor 随 0.38.0 发布、至 2.1.1）仍为 600 秒上限。
