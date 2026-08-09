# Qwen Code Dynamic Workflows 协作暂停/恢复

Qwen Code 官方仓库在 2026-08-08 合入提交 `88a325bce9db`（PR #8320），为 Dynamic Workflows 增加整次运行的协作暂停/恢复：Background Tasks 对话框按 `p` 或交互式 TUI 执行 `/workflows p <runId>`，运行状态在 running、pausing、paused 之间迁移。该功能随 v0.21.8（2026-08-08T17:07:22Z 发布）进入 Release，官方命令文档同步把 `/workflows` 描述更新为 “Inspect workflow runs; cooperatively pause/resume a background run”。矩阵的“任务列表”字段此前只记录 Qwen Code `/tasks` 输出文本列表，本次更新该字段的 Qwen Code 记录与矩阵结论。

## 修正

- `cmd-tasks`（任务列表）矩阵 Qwen Code 列由 `/tasks` 更新为 `/tasks` · 条件：Workflows 开启时 Background Tasks `p` 或 `/workflows p <runId>` 协作暂停/恢复后台 Workflow；字段描述由“查看后台进程、Agent 或长任务状态”改为“查看或控制后台进程、Agent 或长任务状态”。
- `cmd-tasks` 详情 Qwen Code 记录：主命令补充 `/workflows p <runId>`；行为记录协作暂停语义（暂停后不再启动新 Agent，已派发 Agent 收敛，Agent 调用之间的脚本代码继续执行，恢复后释放暂存结果并继续队列派发）与 running/pausing/paused 状态迁移；参数记录 `Usage: /workflows p <runId>` 等错误提示；模式记录 `/tasks` 支持交互式、非交互式、ACP，暂停/恢复控制仅交互式 TUI（`-p` 与 ACP 报 “Workflow pause controls are available only in the interactive TUI.”）；保存范围记录暂停状态只在当前进程、重启不保留；条件记录前台运行报错、pausing 不能撤销、`/workflows` 需 `QWEN_CODE_ENABLE_WORKFLOWS=1` 才注册。
- `docs/01-Slash命令矩阵.md`：对照表“任务列表”行 Qwen Code 列同步更新；Qwen Code 条件注册表为 `/workflows` 补上 `QWEN_CODE_ENABLE_WORKFLOWS=1` 环境变量名；Qwen Code 小节新增 v0.21.8 暂停/恢复说明；来源列表新增命令文档、快捷键文档、命令源码与 v0.21.8 Release。
- `docs/09-版本与证据.md`：Qwen Code 核对日期更新为 2026-08-09，主要材料补充 Dynamic Workflows 协作暂停/恢复；官方来源表 Qwen Code 命令列新增三个固定到提交 SHA 的链接。
- 顺带修正四个详情生成器（`generate-command-docs.mjs`、`generate-security-docs.mjs`、`generate-session-docs.mjs`、`generate-extension-docs.mjs`）中写入 `docs/capabilities/README.md` 的滞后能力数：Slash 命令 28→29、权限与沙箱 8→9、会话与上下文 8→9、扩展系统 7→8、任务执行与 Git 9→10，与 `site/data.js` 的 109 个能力字段和根 README 一致（2026-08-07、2026-08-08 更新记录声称的同类修正实际未落到生成器）。
- `README.md` 与各生成文档的核对日期更新为 2026-08-09。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [任务列表详情](../docs/capabilities/commands/cmd-tasks.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 官方命令文档（提交 `88a325bce9dbdbfafe0d5dc6e4667b4c2942818b`，2026-08-08T04:21:21Z）：`/workflows` 行为 “Inspect workflow runs; cooperatively pause/resume a background run”，形式 `/workflows`、`/workflows <runId>`、`/workflows p <runId>`；条件注册说明 “`/workflows`, `/lsp`, and `/trust` are registered only when their feature is enabled — via the `QWEN_CODE_ENABLE_WORKFLOWS=1` env var, the `--experimental-lsp` CLI flag, and the `security.folderTrust.enabled` setting respectively”。
- Qwen Code 官方快捷键文档（同一提交）：Background tasks dialog 中 `p` “Cooperatively pause or resume the selected background workflow run. No new agents start while paused, but script code between agent calls keeps running.”。
- Qwen Code 命令源码 `packages/cli/src/ui/commands/workflowsCommand.ts`（同一提交）：命令描述 “List workflow runs or cooperatively pause/resume a live run”，参数提示 `[runId | p <runId>]`；`executionMode !== 'interactive'` 时报 “Workflow pause controls are available only in the interactive TUI.”；前台运行报 “Foreground workflow runs cannot be paused or resumed; only background runs support cooperative pause.”；`pausing` 状态报 “Workflow ${runId} is still pausing; wait until it reaches paused before resuming.”；成功提示 “Cooperative pause requested for workflow ${runId}.”；命令帮助提示 “use `/workflows p <runId>` or Background tasks + p to cooperatively pause/resume”。
- Qwen Code v0.21.8 Release（2026-08-08T17:07:22Z）Features 原文：“Dynamic Workflows now support cooperative pause and resume via the 'p' shortcut in Background Tasks or the '/workflows p' command in the TUI. (#8320)”。
- Claude Code 更新日志 v2.1.226（提交 `2bb60696142b`，2026-08-08）仅 “Bug fixes and reliability improvements”，无新增后台任务控制；Codex 近期合入（如 #37644 hook handler 泛化、#37610 workload identity）为内部重构或未见用户文档；Kimi Code 0.34.0 后的提交为 SDK/内部修复（MCP auth 状态探测、搜索索引隔离、compaction 计数）与文档同步，未新增命令表之外的后台任务控制入口；Qoder CLI 公开文档无同类变化。四家本次不更新。
