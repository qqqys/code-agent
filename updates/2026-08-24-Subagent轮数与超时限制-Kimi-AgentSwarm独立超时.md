# Subagent 轮数与超时限制：Kimi Code AgentSwarm 独立 `[swarm] timeout_ms`

Kimi Code 官方仓库在 2026-08-24 合入 PR #3198（`feat(agent-core-v2): add independent [swarm] timeout_ms for AgentSwarm`，合并提交 `496bb6ce4e555c11304074c31312c01edf4d773a`，14 个文件），为 `AgentSwarm` 子 Agent 超时新增专用 `[swarm] timeout_ms` 配置节，不再跟随 `[subagent] timeout_ms`。changeset `.changeset/swarm-timeout-config.md` 为 `@moonshot-ai/kimi-code` 的 patch 级变更；该提交晚于最新发布 `@moonshot-ai/kimi-code@0.38.0`（2026-08-20T13:13:44Z），属于合入 main 尚未发布。矩阵 `agent-limits`（轮数与超时限制）字段 Kimi 列此前为"全局 `[subagent] timeout_ms`（默认 2 h）；Agent 定义无独立字段"，本次补录 AgentSwarm 独立超时。其余四家无同类变化：Claude Code 仍为 `maxTurns` 加全局并发与嵌套上限（超时字段未确认），Codex 仍只确认 `agents.max_concurrent_threads_per_session`，Qwen Code 仍为 `maxTurns`，Qoder CLI 仍为 `maxTurns` 与 `timeoutMins`，结论保持不变。

## 修正

- `agent-limits`（轮数与超时限制）矩阵 Kimi Code 列更新为 "全局 `[subagent] timeout_ms`（默认 2 h）；AgentSwarm 改用独立 `[swarm] timeout_ms`（main 分支，尚未发布）；Agent 定义无独立字段"。证据状态维持"官方确认"。其余四家矩阵结论不变。
- Kimi Code 详情（具体行为）补录：`[subagent] timeout_ms` 同时是后台任务管理器的单任务超时，覆盖前台与后台 Subagent；PR #3198（提交 `496bb6ce4e55`，合入 main 尚未发布）为 AgentSwarm 新增独立 `[swarm] timeout_ms`，默认同为 7200000 ms（2 小时），`0` 表示无超时（运行到完成或手动停止），print 模式未显式设置时同样默认 0，环境变量 `KIMI_CODE_SWARM_TIMEOUT_MS` 优先于配置文件；超时的 swarm 子 Agent 被中止并在聚合报告中标记失败（`Subagent timed out.`），其他子 Agent 不受影响；取值超过 2147483647（约 24.8 天）时运行时收敛为约 24.8 天；该提交是有意的行为变更且无回退，原为覆盖 swarm 设置的 `[subagent] timeout_ms` 值需迁移到 `[swarm] timeout_ms`。
- 全部 Subagent 详情页共用的 Kimi Code 运行限制行同步更新，说明发布行为与 main 分支拆分。
- 跨产品事实第 2 条更新为包含 main 分支 AgentSwarm 独立超时。
- `site/data.js`：新增来源 `kimi-swarm-timeout-commit`（合并提交 `496bb6ce4e55`）、`kimi-swarm-timeout-config`（该提交时点 `docs/zh/configuration/config-files.md`）与 `kimi-swarm-timeout-changeset`（`.changeset/swarm-timeout-config.md`）。
- `docs/02-Subagent能力矩阵.md`：超限行 Kimi 列同步更新；来源新增 swarm 超时提交、配置文档与 changeset 链接。
- `docs/09-版本与证据.md`：Kimi Code 核对日期由 2026-08-21 更新为 2026-08-24，主要材料新增 AgentSwarm 独立超时配置条目；官方来源表 Kimi Code Subagent 列新增 swarm 超时提交、配置文档与 changeset 链接。
- `npm run generate` 重新生成 `docs/capabilities/subagents/`（`agent-limits.md` 及各页运行限制行更新）；`npm test` 通过。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [轮数与超时限制详情](../docs/capabilities/subagents/agent-limits.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code PR #3198（`feat(agent-core-v2): add independent [swarm] timeout_ms for AgentSwarm`）：2026-08-24T11:42:55Z 合入 main，合并提交 `496bb6ce4e555c11304074c31312c01edf4d773a`，14 个文件，涉及 `.changeset/swarm-timeout-config.md`、`docs/en|zh/configuration/config-files.md`、`docs/en|zh/configuration/env-vars.md`、`docs/en|zh/reference/tools.md`、`packages/agent-core-v2/docs/config-manifest.toml`、`packages/agent-core-v2/src/agent/task/printDefaults.ts`、`packages/agent-core-v2/src/features/swarm/configSection.ts`、`packages/agent-core-v2/src/features/swarm/tools/agent-swarm/agentSwarmTool.ts`、`packages/agent-core-v2/src/index.ts` 及配置与 swarm 测试。
- 该提交处的 `.changeset/swarm-timeout-config.md`：`"@moonshot-ai/kimi-code": patch`，描述 "Add a dedicated `[swarm] timeout_ms` config option (or the `KIMI_CODE_SWARM_TIMEOUT_MS` env var) for AgentSwarm subagent timeouts, which no longer follow `[subagent] timeout_ms`."
- 该提交处的 `docs/zh/configuration/config-files.md`：`[swarm] timeout_ms` 为单个 `AgentSwarm` subagent 的最长运行时间（毫秒），默认 `7200000`（2 小时），超时后该 subagent 被中止并在聚合报告中标记失败（`Subagent timed out.`），其他 subagent 不受影响，`0` 为无超时（运行到完成或手动停止），print 模式（`kimi -p`）未显式设置时默认 `0`，超过 `2147483647`（约 24.8 天）运行时收敛，环境变量 `KIMI_CODE_SWARM_TIMEOUT_MS` 优先级高于配置文件；`[subagent] timeout_ms` 描述改为单个 `Agent` subagent 的最长运行时间（超时以 `timed_out` 结束），并说明该值是后台任务管理器的单任务超时、覆盖前台与后台 subagent。
- 该提交处的 `docs/zh/configuration/env-vars.md`：`KIMI_CODE_SWARM_TIMEOUT_MS` 默认 `7200000`（2 小时），优先级高于 `config.toml` 的 `[swarm] timeout_ms`；`KIMI_SUBAGENT_TIMEOUT_MS` 维持单个 `Agent` subagent 超时覆盖。
- 提交说明记录这是有意行为变更且无回退：原先为覆盖 swarm 而设置的 `[subagent] timeout_ms` 值需要迁移到 `[swarm]`。
- 发布状态核对：最新 Release `@moonshot-ai/kimi-code@0.38.0`（2026-08-20T13:13:44Z）早于本提交（2026-08-24T11:42:55Z），故该配置合入 main 尚未发布。
