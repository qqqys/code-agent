# Kimi Code 内置 coder 默认取消嵌套派生

Kimi Code PR #2837（提交 `101c4d199746bf2ed4f26375b65a6fcb6cba2a60`）从内置 coder 子 Agent profile 的工具列表中移除 `Agent` 与 `AgentSwarm` 工具：v2 引擎 `packages/agent-core-v2/src/session/agentLifecycle/profile/profiles.ts` 的 `CODER_TOOLS` 与 v1 引擎 `packages/agent-core/src/profile/default/coder.yaml` 的 `tools` 同步删除这两项，`coder-subagent-tools.test.ts` 显式断言 coder 工具列表不含 `Agent`/`AgentSwarm`。PR 内后续修正把移除范围限定为 coder profile：主 Agent（`AGENT_TOOLS`）保留 `Agent`/`AgentSwarm`，默认会话仍可委派；explore 等只读 profile 本就不含这两个工具。该变化随 0.35.0（2026-08-12T03:47:33Z 发布）交付，此前矩阵记录的“coder 可嵌套”不再成立。官方 Agents 文档页（main 分支 `docs/zh/customization/agents.md`）仍写内置 coder“可以在任务自然拆解时继续派发自己的嵌套子 Agent”，与 0.35.0 Release 说明和仓库代码不一致，本次以 Release 说明与代码为准。同一 Release 的 minor 条目包含 PR #2816 的 `/tasks` 后台 Agent 实时活动（2026-08-11 已记录为 main 分支尚未发布），本次一并把该字段状态更新为随 0.35.0 发布。

## 修正

- `agent-nesting`（嵌套派生）字段 Kimi Code 矩阵结论由 "coder 可嵌套；自定义 Agent 用 `subagents`" 改为 "内置 `coder` 默认不可嵌套（0.35.0 起移除 `Agent`/`AgentSwarm`）；自定义 Agent 用 `subagents`，显式列 `Agent` 工具可恢复"，证据状态保持“官方确认”（0.35.0 Release 说明与官方仓库代码、测试共同确认）。
- Kimi Code 嵌套详情补入：移除同时作用于 v1 与 v2 引擎的 coder profile；主 Agent 保留 `Agent`/`AgentSwarm`，默认会话委派不受影响；自定义 profile 在 `tools` 显式列出 `Agent`/`AgentSwarm` 可恢复嵌套，`subagents` 允许列表在派发前仍强制校验；官方 Agents 文档页尚未同步该变化，详情页记录文档与 Release/代码冲突并以 Release 说明与代码为准。
- `docs/02-Subagent能力矩阵.md`：嵌套派生行与禁止嵌套行 Kimi Code 单元格同步更新，来源部分新增提交与 0.35.0 发布说明链接。
- `execution-background`（后台任务）字段 Kimi Code 矩阵结论由 "`run_in_background` · `/tasks`；条件：`/tasks` 后台 Agent 实时活动（main 分支，尚未发布）" 改为 "`run_in_background` · `/tasks`；条件：`/tasks` 后台 Agent 实时活动（0.35.0 起）"；详情中 entry、primitives、behavior、conditions 的“main 分支”表述同步改为 0.35.0，来源新增 0.35.0 发布说明。
- 新增来源：`kimi-coder-nesting-commit`（固定到提交 SHA `101c4d199746bf2ed4f26375b65a6fcb6cba2a60`）、`kimi-coder-nesting-changeset`（同一提交的 `.changeset/v2-profile-drop-agent-tools.md`）、`kimi-v035-release`（0.35.0 发布说明）。
- `docs/09-版本与证据.md`：Kimi Code 核对日期更新为 2026-08-12，主要材料补充内置 coder 默认取消嵌套派生，并把 `/tasks` 实时活动由“main 分支尚未发布”改为“随 0.35.0 发布”；官方来源表 Kimi Code Subagent 或 Agent 列新增提交、changeset 与发布说明三个固定链接，执行与 Git 列新增 0.35.0 发布说明链接。
- `npm run generate` 重新生成 `docs/capabilities/subagents/`（`agent-nesting.md` 内容更新）、`docs/capabilities/execution/`（`execution-background.md` 内容更新）与 `docs/06-任务执行与Git矩阵.md`。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [嵌套派生详情](../docs/capabilities/subagents/agent-nesting.md)
- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [后台任务详情](../docs/capabilities/execution/execution-background.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 0.35.0 发布说明（2026-08-12T03:47:33Z）Patch Changes 原文："[#2837] [`101c4d1`] … Remove the Agent and AgentSwarm tools from the built-in coder subagent profile, so coder subagents no longer delegate further by default. Custom profiles that list these tools explicitly can still opt in."；Minor Changes 原文："[#2816] [`ad12ad8`] … Show the live work progress of background subagents in the `/tasks` panel."。
- 提交 `101c4d199746bf2ed4f26375b65a6fcb6cba2a60`（PR #2837 `feat(agent-core-v2): remove Agent and AgentSwarm from builtin profile tool lists`）变更文件含 `packages/agent-core-v2/src/session/agentLifecycle/profile/profiles.ts`、`packages/agent-core/src/profile/default/coder.yaml`、`packages/agent-core/test/harness/coder-subagent-tools.test.ts` 与 `.changeset/v2-profile-drop-agent-tools.md`；PR 内修正提交说明原文 "Scope the removal to the coder subagent profile on both engines: the main agent keeps Agent/AgentSwarm so default sessions can still delegate, while coder subagents no longer spawn nested subagents by default."。
- 提交中的 changeset 原文（固定 SHA 抓取）："Remove the Agent and AgentSwarm tools from the built-in coder subagent profile, so coder subagents no longer delegate further by default. Custom profiles that list these tools explicitly can still opt in."。
- main 分支现状核对（0.35.0 发布后）：`profiles.ts` 的 `CODER_TOOLS` 与 `coder.yaml` 的 `tools` 均不含 `Agent`/`AgentSwarm`（v2 列表为 Bash、CronCreate、CronDelete、CronList、Edit、EnterPlanMode、ExitPlanMode、Glob、Grep、Read、ReadMediaFile、Skill、TaskList、TaskOutput、TaskStop、TodoList、WebSearch、FetchURL、Write、`mcp__*`）；主 Agent 的 `AGENT_TOOLS` 仍含 `Agent` 与 `AgentSwarm`。
- 官方 `docs/zh/customization/agents.md`（main 分支 raw 抓取）仍写 "`coder` 子 Agent 与主 Agent 共享大部分工具集：可以在后台执行 Shell 命令、维护待办列表、进入 Plan 模式、调用 Agent Skills，也可以在任务自然拆解时继续派发自己的嵌套子 Agent。"，与 0.35.0 Release 说明及代码冲突；按证据优先级以更新日志与仓库代码为准，冲突已在详情页标注。
- 其他产品本次无同类变化：Claude Code v2.1.226/v2.1.227/v2.1.228（2026-08-08 至 2026-08-11）更新日志为缺陷修复与界面改进（含 Write 工具覆盖规则对齐 Edit、claude.ai 同步 Skills 加固等），无 Subagent 嵌套能力变化；Codex 2026-08-11 至 12 合入提交（#38127、#38108、#38103、#38101、#38094、#38092、#38089、#38087）为 rollout/MCP 审批路由/云上下文调整，rust-v0.148.0-alpha.7/8/9 为预发布标签，嵌套记录不变；Qwen Code 2026-08-12 合入提交（#8990、#8987、#8844、#8984、#8857、#8818、#8939、#8954）为 webui、desktop、web-shell、acp-bridge 测试、cli 文案、core 与 serve 的调整，v0.21.11-preview.0 的 Agent Plugins v1 已在前一单元记录，嵌套记录不变；Qoder CLI 公开文档（2026-08-12 核对）未列 Subagent 嵌套规则变化。
