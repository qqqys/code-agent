# Kimi Code `/tower` 多代理 Tower 编排

Kimi Code 官方仓库在 2026-08-16 合入提交 `f492cd7c9e03`（PR #2633），新增 `/tower` Slash 命令：主 Agent 作为唯一控制塔编排多个 Agent 在同一仓库并行工作，worker 在各自 git worktree 中执行 mission，reviewer 审查分支，合并由代码级门禁强制。changeset `.changeset/tower-slash-command.md` 级别 minor、尚未被 Release 消费（最新 Release 为 0.36.1，2026-08-14 发布），官方 Slash 命令文档尚未列出 `/tower`，标注为"合入 main 尚未发布"。该功能只在 v2 引擎（agent-core-v2）实现，PR 过程中移除了 agent-core v1 版本。

## 修正

- `cmd-collaboration`（多模型或多代理模式）矩阵 Kimi Code 列由 `/swarm` 更新为 "`/swarm` · `/tower`（条件：合入 main 尚未发布）"；详情的命令、参数、执行行为、可用模式、保存范围、条件和来源同步补充 `/tower`：不带参数或带 `status` 查看状态、带 `teardown` 拆除工作区、其余输入作为目标；v2 引擎内置 Skill 且 `disable-model-invocation: true`；`.tower/` 工作区（`state.json`、`.tower/worktrees/`、`.tower/comms/` 含活动日志，teardown 后 comms 保留）；`tower_mode.enter`/`tower_mode.exit` 写入会话 wire 历史；worker/reviewer 派生时固定 `auto` 权限模式；worker 在 secondary-model 实验开启时绑定模型池、reviewer 始终主力模型；`TowerMerge` 门禁（clean review 对当前 tip、依赖已合并、改动在 mission 作用域内、主检出在记录的基线分支）；Tower 模式禁用 `TodoList`；派生并发上限 16、遇 429 暂停 60 秒。证据状态改为"源码确认"。跨产品事实新增一条。
- Slash 命令矩阵对照表"多模型或多代理协作模式"行与 Kimi Code 命令目录同步新增 `/tower` 及行为说明；目录说明补充同一提交起 Skill 命令在回合运行时排队、Ctrl-S 注入运行中回合的行为（changeset `queue-skill-commands-while-busy.md`，级别 patch）。
- 来源坐标：新增 `kimi-tower-commit`（提交 `f492cd7c9e03666ecfd10dc47ca9b48c35de2318`）、`kimi-tower-changeset`（该提交的 `.changeset/tower-slash-command.md`）、`kimi-tower-skill`（该提交的 `packages/agent-core-v2/src/features/tower/skill/tower.md`）、`kimi-tower-spawn`（该提交的 `TowerSpawnTool` 源码）。
- Kimi Code 核对日期更新为 2026-08-16。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [版本与证据](../docs/09-版本与证据.md)
- [多模型或多代理模式详情](../docs/capabilities/commands/cmd-collaboration.md)

## 证据版本

- Kimi Code 官方仓库提交 `f492cd7c9e03666ecfd10dc47ca9b48c35de2318`（`feat(agent-core): add tower command to orchestrate multi-agents (#2633)`，2026-08-16T07:13:42Z，晚于 0.36.1 发布提交 `13d86f8b7bb2` 4 个提交）：新增 `packages/agent-core-v2/src/features/tower/`（协议 store、rate limit、tower-mode service、十一个 `Tower*` 工具、`tower-worker` profile 与 `/tower` Skill 正文），`TowerInit`/`TowerPlan`/`TowerSpawn`/`TowerMerge`/`TowerTeardown` 仅注册给主 Agent（`agentId === 'main'`），`TowerSend`/`TowerInbox`/`TowerFinding`/`TowerReview`/`TowerMission`/`TowerStatus` 同时供 worker/reviewer 使用；wire 词汇新增持久化记录 `tower_mode.enter`/`tower_mode.exit`；TUI 的 Skill 命令不再因 busy 拒绝（`apps/kimi-code/src/tui/commands/resolve.ts`）。
- 该提交处的 `.changeset/tower-slash-command.md` 原文："Add the /tower slash command to orchestrate multiple agents iterating on one repo in parallel — you act as the control tower while worker agents execute missions in their own git worktrees. Run /tower to start."，级别 minor；`.changeset/queue-skill-commands-while-busy.md` 原文说明 busy 时输入的 Slash Skill 命令排队、Ctrl-S 作为真实 activation 注入，级别 patch。
- 该提交处的 `packages/agent-core-v2/src/features/tower/skill/tower.md`：Skill frontmatter 带 `disable-model-invocation: true`；参数语义为空/`status` → `TowerStatus`、`teardown` → `TowerTeardown`、其余为目标；`TowerInit` 要求至少一个提交的 git 仓库；`TowerPlan` 拒绝重叠的 build mission 作用域；reviewer 轮数上限为 5 轮或连续两轮相同结论；Tower 自身不写产品代码且 `TodoList` 被代码禁用；Tower 可用 `AskUserQuestion`，worker/reviewer 的 profile 不含该工具，auto 权限模式下全部禁用。
- 该提交处的 `packages/agent-core-v2/src/features/tower/tools/spawn/spawnTool.ts`：worker spawn 为 mission 创建 worktree（`.tower/worktrees/` 下），将任务注册为 detached `SubagentTask`；worker/reviewer 派生时固定 `auto` 权限模式，`broadcastPermissionMode` 跳过 `tower-worker` profile，会话整体切换模式不影响；模型绑定沿用 `resolveSubagentBinding`：secondary-model 实验开启时绑定配置的次主力模型，否则继承塔模型，reviewer 强制 `'primary'`；写守护（towerService.ts）拒绝 worker 在名册记录 worktree 之外 Write/Edit。
- 该提交处的 `packages/agent-core-v2/src/features/tower/protocol/store.ts` 与 `tools/merge/merge.md`：`TowerMerge` 门禁依次检查依赖 mission 已合并、survey mission 零 diff、存在 review 且最新结论为 clean、`reviewed_commit` 等于当前 tip、改动文件全部匹配 mission 作用域 glob（picomatch）、主检出位于 `TowerInit` 记录的基线分支；合并使用 `git merge --no-ff`，合并后列出触碰相同文件的未合并分支。
- 该提交处的 `packages/agent-core-v2/src/features/tower/workerProfile.ts`：`tower-worker` profile 工具集含 `Agent`、`Bash`、`Edit`、`Write`、`Read`、`Glob`、`Grep`、六个 `Tower*` 通信工具与 `mcp__*` 等，`subagents: ['explore', 'plan']`（仅只读 profile，移除 `AgentSwarm` 以防绕过 worktree/审查协议）。
- 该提交处的 `packages/agent-core-v2/src/features/tower/towerRateLimitService.ts`：派生并发预算上限 `TOWER_MAX_BUDGET = 16`，遇 429 暂停新派生 `TOWER_SPAWN_PAUSE_MS = 60000` ms，成功后可提前解除暂停。
- 该提交处的 `packages/agent-core-v2/src/features/tower/tools/teardown/teardown.md`：teardown 移除 mission worktree（有未提交改动的 worktree 保留并列出，除非 force），退出 Tower 模式，`.tower/comms/` 始终保留作为审计记录。
- Kimi Code main 分支 `docs/zh/reference/slash-commands.md`（核对时）仅列出 `/swarm on|off` 与 `/swarm <task>`，未列出 `/tower`。
