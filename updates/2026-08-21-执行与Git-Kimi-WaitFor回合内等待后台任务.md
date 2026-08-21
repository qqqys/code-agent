# Kimi Code `WaitFor` 回合内等待后台任务工具

Kimi Code 0.38.0（2026-08-20 发布）随 PR #3060（合并提交 `8440801de47ddae29224430048e1228b80cde370`）新增内置 `WaitFor` 工具：模型可以在当前回合内挂起等待后台任务（子 Agent、后台 Bash 或后台提问）结束，而不是结束回合后被重新调用。工具属于 v2 引擎（agent-core-v2）任务域，与 `TaskList`/`TaskOutput`/`TaskStop` 并列；参数为必填 `timeout`（单位秒，上限 600）与可选 `task_id`，不传 `task_id` 时调用时刻运行中的任意一个后台任务结束即返回；等待期间不发起 LLM 请求，超时不算错误、结果列出仍在运行的任务，经 `WaitFor` 汇报过结果的任务不再推送自动完成通知。0.38.0 官方工具文档同时把 `TaskOutput` 记为始终非阻塞（立即返回快照、完成经自动通知送达），本字段原记录的“TaskOutput 可阻塞等待最多 3600 秒”来自较早固定提交，与 0.34.0 至 0.38.0 各发布标签的官方工具文档均不一致，本次一并更正。

## 修正

- `execution-background` 字段 Kimi Code 矩阵结论由 "`run_in_background` · `/tasks`；条件：`/tasks` 后台 Agent 实时活动（0.35.0 起）" 改为 "`run_in_background` · `/tasks` · `WaitFor` 回合内等待（0.38.0 起）；条件：`/tasks` 后台 Agent 实时活动（0.35.0 起）"。
- Kimi Code 详情补入：`WaitFor` 入口与参数（`timeout` 必填上限 600 秒、`task_id` 可选、无运行中任务立即返回、等待更久可再次调用）；回合内挂起且等待期间不发起 LLM 请求；超时不是错误并列出仍在运行的任务，等待结束时一并列出等待窗口内完成的其他任务；经 `WaitFor` 汇报过的任务不再推送自动完成通知；等待对被等待任务无副作用，用户打断等待时任务继续运行；只能等待本 Agent 启动的后台任务；与 `TaskList`/`TaskOutput` 一样自动放行；Goal 模式可用 `WaitFor` 时注入的指引文本要求优先回合内等待而不是结束回合；仅 v2 引擎提供，实验标志 `wait_for` 默认开启、`KIMI_CODE_EXPERIMENTAL_WAIT_FOR=false` 可关闭，随 0.38.0 发布。
- Kimi Code 详情更正：`TaskOutput` 始终非阻塞，立即返回当前快照，任务完成经自动通知送达（替换原“TaskOutput 可阻塞等待最多 3600 秒”表述）。
- 新增跨产品事实：Kimi Code 0.38.0 起提供 `WaitFor` 回合内等待工具；其余四家当前一手资料未列出同类专门的回合内等待工具。
- 新增来源：`kimi-wait-for-release`（0.38.0 发布说明）、`kimi-wait-for-commit`（固定到提交 SHA `8440801de47ddae29224430048e1228b80cde370`）、`kimi-wait-for-docs`（0.38.0 标签官方工具文档）、`kimi-wait-for-flag`（0.38.0 标签 `flag.ts`）、`kimi-wait-for-changeset`（同一提交中的 `.changeset/wait-for-tool.md`）；`kimi-tools-current` 由提交 `77618e38c35a` 改固定到 0.38.0 发布标签。
- `docs/06-任务执行与Git矩阵.md` 后台任务行 Kimi Code 单元格同步更新。
- `docs/09-版本与证据.md`：Kimi Code 核对日期改为 2026-08-21；主要材料补充 WaitFor 回合内等待后台任务工具；官方来源表 Kimi Code 执行与 Git 列新增 WaitFor 提交、changeset、实验标志源码与 0.38.0 发布说明链接，Tools 链接改固定到 0.38.0 标签。
- `npm run generate` 重新生成 `docs/capabilities/execution/`（`execution-background.md` 内容更新）与 `docs/06-任务执行与Git矩阵.md`。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [后台任务详情](../docs/capabilities/execution/execution-background.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 0.38.0 发布说明（`@moonshot-ai/kimi-code@0.38.0`，2026-08-20T13:13:44Z）Minor Changes 原文："Add the WaitFor tool: the agent can now wait for a background task to finish within the current turn instead of ending the turn and being re-invoked."（PR #3060，提交 `8440801`）。
- 提交 `8440801de47ddae29224430048e1228b80cde370` 标题："feat(agent-core-v2): add the `WaitFor` tool for waiting on background tasks (#3060)"；提交内含 `WaitFor` 交付标记、等待竞态取消、Goal 指引按标志与工具可用性注入、执行时强制校验 `wait_for` 标志等后续修正。
- changeset `.changeset/wait-for-tool.md`（minor）原文："Add the WaitFor tool: the agent can now wait for a background task (sub-agent, background bash, or background question) inside the current turn — with an optional task ID and a required timeout of up to 600 seconds — instead of ending the turn and being re-invoked."
- 0.38.0 标签 `packages/agent-core-v2/src/agent/tools/task/task-wait/flag.ts` 原文：`WAIT_FOR_FLAG_ID = 'wait_for'`、`WAIT_FOR_FLAG_ENV = 'KIMI_CODE_EXPERIMENTAL_WAIT_FOR'`、`default: true`、`surface: 'core'`；描述为 "Give the model the WaitFor tool so it can wait for background tasks inside the current turn instead of ending the turn and being re-invoked."
- 0.38.0 标签 `docs/zh/reference/tools.md` 后台任务工具表新增行："`WaitFor` | 自动放行 | 等待后台任务结束"；`WaitFor` 段落原文："`WaitFor` 把当前轮次挂起，直到后台任务结束或超时。参数：`timeout`（必填，单位秒，上限 600）和可选的 `task_id`。不传 `task_id` 时，调用时刻运行中的任意一个后台任务结束即返回；当前没有运行中的后台任务时立即返回。超时不是错误——结果会列出仍在运行的任务，Agent 可以再次等待，也可以先处理其他工作。已通过 `WaitFor` 汇报结果的任务不会再推送自动完成通知。"；`TaskOutput` 段落原文："该调用始终是非阻塞的——立即返回当前快照，任务完成会通过自动通知送达。"
- 0.38.0 标签工具描述文件 `task-wait.md` 补充约束：等待期间不发起 LLM 请求；未知 `task_id` 报错，已结束任务立即返回；等待窗口内开始的新任务不在本次等待范围；等待结束时一并列出窗口内完成的其他任务；`WaitFor` 不停止任务，用户打断等待时任务继续运行；每个已完成任务的结果只投递一次；只能等待本 Agent 启动的后台任务。
- Goal 模式指引（提交内 `goalInjection.ts`）原文："If you are waiting for background sub-agents or bash tasks to finish, call WaitFor to wait for them inside this turn instead of ending the turn; ending the turn just gets you re-invoked again and again."，仅在 `wait_for` 标志开启且工具注册并激活时注入。
- 默认引擎佐证：0.38.0 标签 `docs/zh/configuration/config-files.md` 表述默认引擎为 `agent-core-v2`（"设置 `KIMI_CODE_LEGACY_FLAG=1` 选择旧版引擎"），故 `WaitFor` 在默认引擎下可用；v1 旧引擎无该工具。
- `TaskOutput` 非阻塞表述的版本范围：0.34.0、0.35.0、0.36.0、0.37.0、0.38.0 各发布标签的 `docs/zh/reference/tools.md` 均写为"始终是非阻塞的"；本字段原记录依据的固定提交 `77618e38c35a` 中该段为可选 `block`（默认 false）与 `timeout`（默认 30，范围 0–3600）参数，与上述已发布文档不一致，故按已发布官方文档更正。
- 其他产品本次无同类专门工具：Claude Code 官方工具参考列出 `TaskList`/`TaskGet`/`TaskOutput`（已弃用，建议改读任务输出文件）/`TaskStop` 等，无回合内等待后台任务的工具（`WaitForMcpServers` 仅用于等待 MCP Server 连接）；Codex 官方命令表为 `/ps`/`/stop`，无等待工具；Qwen Code 当前一手资料列出的后台任务原语为 `task_list`/`task_stop`/`monitor` 与完成通知，无等待工具；Qoder CLI 公开 Tools 页面未列出回合内等待工具。
