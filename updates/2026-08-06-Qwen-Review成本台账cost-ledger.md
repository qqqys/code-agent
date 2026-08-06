# Qwen Code Review 成本台账 `cost-ledger`

Qwen Code 官方仓库在 2026-08-05 合入提交 `4f79036a2269`（PR #8471），为 `qwen review` CLI 增加 `cost-ledger` 子命令：从本次审查留在磁盘上的用量记录聚合主循环与各审查 Agent 的模型调用和 token 消耗，随 v0.21.6（2026-08-05T15:57:25Z 发布）进入正式版本。内置 Review Skill 的 Step 8 会运行该命令并把台账归档进审查报告。矩阵的“代码 Review”字段此前没有记录该入口，本次并入现有 `execution-review` 字段的 Qwen Code 详情（不新增同义字段），并新增来源固定到实现提交 SHA。

## 修正

- `execution-review` 矩阵 Qwen Code 列由 `/review` 内置 Skill · `publish-assets` 证据图 · Web Shell 结构化结果 更新为 `/review` 内置 Skill · `publish-assets` 证据图 · Web Shell 结构化结果 · `cost-ledger` 成本台账。
- Qwen Code 详情入口与工具新增：`qwen review cost-ledger --plan <计划报告> [--out <路径>]`；`--plan` 必填，其 mtime 标记审查开始。
- Qwen Code 详情核心机制新增：`cost-ledger` 聚合 chat 与 subagent transcript JSONL 中 assistant 事件携带的 `usageMetadata`，与 coverage gate 读取同一批记录；记录位置来自 CLI 导出的 `QWEN_CODE_PROJECT_DIR`/`QWEN_CODE_SESSION_ID` 环境变量，不接受模型指定的路径。
- Qwen Code 详情执行行为新增：计费窗口以 `--plan` 报告 mtime 为起点（计划前引导轮次与台账运行后的组装不计入），按流输出主循环与每个 Agent 的模型调用数、输入/缓存/输出/思考 token 数与耗时；调用数只统计携带 `usageMetadata` 的 assistant 记录，是下限而非精确 API 调用数。
- Qwen Code 详情状态与产物新增：内置 Skill Step 8 运行 `cost-ledger`，打印块原样粘贴进报告并在终端摘要转述首行；`--out` 保存完整台账 JSON（Skill 约定 `.qwen/reviews/<报告名>-cost-ledger.json`，worktree 模式落在主项目目录）；打印块只列最大的 8 个 Agent，JSON 保留全部。
- Qwen Code 详情条件与边界新增：`cost-ledger` 为 informational，记录缺失或无法计算时输出 `cost-ledger unavailable — <原因>` 并以退出码 0 结束，`--out` 写入失败降级为警告，均不阻塞审查。
- 跨产品事实新增：其余四家当前一手资料未列出同类内置 Review 成本聚合入口。
- 新增来源 `qwen-review-cost-ledger`，固定到实现提交 SHA；其余四家结论不变。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [代码 Review 详情](../docs/capabilities/execution/execution-review.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 官方仓库提交 `4f79036a2269bb43f95f736ca8c44bc60b0cc9d6`（`feat(review): a cost ledger from the records already on disk (#8471)`，2026-08-05T02:18:06Z）：新增 `packages/cli/src/commands/review/cost-ledger.ts` 并在 `packages/cli/src/commands/review.ts` 注册 `cost-ledger` 子命令，yargs 定义为 `--plan`（string，必填，描述 “The plan report from Step 1 — its mtime marks the review start”）与 `--out`（string，描述 “Also write the full ledger as JSON to this path”）；同一提交更新了 `packages/core/src/skills/bundled/review/SKILL.md`。
- 同一提交的 `cost-ledger.ts` 源码注释与实现：聚合对象是 chat 与 subagent transcript 事件中携带 `usageMetadata` 的 assistant 记录（prompt/candidates/thoughts/cached 计数）；“a ledger that cannot be computed prints why and exits 0”；`--out` 写入失败降级为警告且退出码保持 0；模型调用计数是下限（“call counts are a floor, not an exact API-call tally”）。
- 同一提交处的 `packages/cli/src/commands/review/lib/transcripts.ts`：记录位置只从环境变量 `QWEN_CODE_PROJECT_DIR` 与 `QWEN_CODE_SESSION_ID` 解析（subagent 目录为 `$QWEN_CODE_PROJECT_DIR/subagents/<sessionId>`），注释明确 “This module never takes a path from the model”；未导出时抛出 `TranscriptsUnavailableError`。
- v0.21.6 标签处的 `packages/core/src/skills/bundled/review/SKILL.md` Step 8：`"${QWEN_CODE_CLI:-qwen}" review cost-ledger --plan <the plan report from Step 1> --out .qwen/reviews/<report>-cost-ledger.json` 聚合 harness 记录的模型调用（主循环与各 Agent 的输入/缓存/输出/思考 token 数与耗时），窗口以计划报告 mtime 为起点；打印块粘贴进报告，打印块只列最大的 8 个 Agent、`--out` JSON 保留全部；输出 `cost-ledger unavailable` 时照实记录，informational 且从不阻塞审查。
- Qwen Code 官方 Release v0.21.6（2026-08-05T15:57:25Z 发布）：Features 包含 “Added the qwen review cost-ledger command to aggregate model usage statistics from existing review records on disk.”。此前 Release v0.21.6-preview.0 与 v0.21.5 系列不包含该命令。
