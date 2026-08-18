# Kimi Code `/tower` 功能在 main 分支整体禁用

Kimi Code 官方仓库在 2026-08-18 合入 PR #3023（`feat(agent-core-v2): disable the tower feature entirely`，提交 `5ae82cd5bcb92395baf96feea68e12f8c96b51ed`），把 2026-08-16 刚合入的 `/tower` 多代理 Tower 编排整体禁用。Tower Skill 被标记 `experimentalFlag: 'tower'`，CLI（agent-core-v2 `BuiltinSkillSource`）与 Web（kap-server skills 路由）的内置 Skill 加载源都会过滤未启用标志的 Skill；`TowerFeature` 构造函数在标志未启用时直接返回，不贡献十一个 `Tower*` 工具、`tower-worker` profile 与限流服务；`AgentTowerService.enter()` 与工具守护也先检查该标志。关键在于 `tower` 标志 id 未注册进实验功能登记册（仓库中已注册的实验标志只有 `tool-select`、`secondary-model`、`auto_session_title`、`persistence_minidb_readmodel` 与 kap-server 的 `search_worker`），`enabled('tower')` 恒为 false；官方测试固定了该行为：`KIMI_CODE_EXPERIMENTAL_TOWER=true`、master 开关 `KIMI_CODE_EXPERIMENTAL_FLAG=true` 或 `[experimental] tower = true` 都无法启用。同一 PR 还删除了 changeset `.changeset/tower-slash-command.md`，tower 不会出现在后续 Release 说明中。tower 代码与 Skill 正文仍保留在仓库，但当前无法开启，且从未进入任何 Release（最新 Release 为 0.36.1，2026-08-14 发布）。

## 修正

- `cmd-collaboration`（多模型或多代理模式）矩阵 Kimi Code 列由 "`/swarm` · `/tower`（条件：合入 main 尚未发布）" 更新为 "`/swarm` · `/tower`（条件：合入 main 后于 2026-08-18 禁用，当前无法开启）"。并入现有 `cmd-collaboration` 字段，不新增能力字段。
- 详情的 Kimi Code 记录：执行行为补充禁用提交、Skill 标志门禁与加载源过滤，原 Tower 模式行为改为“禁用前的设计”表述；可用模式与保存范围标注 `/tower` 当前禁用；条件补充禁用机制（`TowerFeature` 早退、`AgentTowerService` 守护、标志未注册导致 `enabled('tower')` 恒为 false、官方测试固定环境变量/master 开关/`[experimental]` 配置均无法开启、`/experiments` 面板不列出、changeset 删除、从未进入 Release），原设计边界保留在“禁用前的设计边界”之后；来源新增禁用提交、Skill 门禁源码、TowerFeature 源码、门禁测试与内置 Skill 过滤器五个坐标。跨产品事实第 8 条改写为合入后又禁用的完整过程。
- `docs/01-Slash命令矩阵.md`：对照表“多模型或多代理协作模式”行 Kimi Code 单元格同步更新；Kimi Code 命令目录的 `/tower` 段落改写为禁用状态与禁用方式；来源新增禁用提交、Skill 门禁、TowerFeature 源码、门禁测试与内置 Skill 过滤五个链接。
- `docs/09-版本与证据.md`：Kimi Code 核对日期更新为 2026-08-18，主要材料中 `/tower` 条目改写为“合入 main 后整体禁用”并补充禁用机制；官方来源表 Kimi Code 命令列新增禁用提交与门禁测试链接。
- `site/data.js`：新增来源 `kimi-tower-disable-commit`（提交 `5ae82cd5bcb92395baf96feea68e12f8c96b51ed`）、`kimi-tower-skill-gate`（该提交的 `skill/skill.ts`）、`kimi-tower-feature-source`（该提交的 `towerFeature.ts`）、`kimi-tower-flag-test`（该提交的 `test/features/tower/towerFeature.test.ts`）、`kimi-builtin-skill-filter`（该提交的 `skillCatalog/builtin/builtin.ts`）。
- 能力字段总数不变（110 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/capabilities/commands/`（`cmd-collaboration.md` 内容更新，其余页面主要为核对日期变化）。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [版本与证据](../docs/09-版本与证据.md)
- [多模型或多代理模式详情](../docs/capabilities/commands/cmd-collaboration.md)

## 证据版本

- Kimi Code 官方仓库提交 `5ae82cd5bcb92395baf96feea68e12f8c96b51ed`（`feat(agent-core-v2): disable the tower feature entirely (#3023)`，2026-08-18T05:38:13Z）：为 `SkillDefinition` 与 state manifest 增加可选 `experimentalFlag` 字段；`visibleBuiltinSkills(productSkillsEnabled, flags?)` 过滤 `experimentalFlag` 未启用的内置 Skill，agent-core-v2 的 `BuiltinSkillSource` 与 kap-server 的 `src/routes/skills.ts` 均注入 `IFlagService` 并传入；`TOWER_SKILL` 设置 `experimentalFlag: TOWER_FLAG_ID`（`'tower'`）；`TowerFeature` 构造函数首行 `if (!flags.enabled(TOWER_FLAG_ID)) return;`；`AgentTowerService` 的 `enter()` 与两个 `onBeforeExecuteTool` 守护（TodoList 禁用、worker Write/Edit 范围限制）先检查该标志；删除 `.changeset/tower-slash-command.md`。
- 该提交处的 `packages/agent-core-v2/test/features/tower/towerFeature.test.ts`：测试 “cannot be enabled by the dedicated or master env while no tower flag is registered” 同时设置 `KIMI_CODE_EXPERIMENTAL_TOWER: 'true'` 与 `KIMI_CODE_EXPERIMENTAL_FLAG: 'true'`（MASTER_ENV），断言 `flags.explain(TOWER_FLAG_ID)` 为 undefined、`flags.enabled(TOWER_FLAG_ID)` 为 false；测试 “cannot be enabled through the [experimental] config section” 写入 `[experimental] tower = true` 后断言同样结果。
- main 分支（提交 `86674ac89516`，2026-08-18）全仓库检索 `registerFlagDefinition`：仅 `tool-select`（`KIMI_CODE_EXPERIMENTAL_TOOL_SELECT`，默认 false）、`secondary-model`（`KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL`，默认 false）、`auto_session_title`（`KIMI_CODE_EXPERIMENTAL_AUTO_SESSION_TITLE`，默认 false）、`persistence_minidb_readmodel`（默认 true）与 kap-server `search_worker`（`KIMI_CODE_EXPERIMENTAL_SEARCH_WORKER`，默认 true）五个标志，无 `tower`；`FlagService.explain()` 对未注册 id 返回 undefined、`enabled()` 返回 false，且 master 开关分支在取到注册定义之后才生效。
- 该提交处的 `packages/agent-core-v2/src/features/tower/towerFeature.ts`：`TOWER_TOOL_CONTRIBUTIONS` 仍列出十一个工具（`TowerInit`、`TowerPlan`、`TowerSpawn`、`TowerMerge`、`TowerTeardown` 仅主 Agent，`TowerSend`、`TowerInbox`、`TowerFinding`、`TowerReview`、`TowerMission`、`TowerStatus` 不限），代码保留但不贡献。
- main 分支 `apps/kimi-code/src/tui/commands/` 无 tower 专用命令文件，`/tower` 仅经内置 Skill 目录暴露；`docs/zh/reference/slash-commands.md`（main）未列出 `/tower`；`docs/zh` 全目录无 tower 描述。
- Kimi Code 最新 Release 为 0.36.1（2026-08-14 发布），早于 tower 合入提交，tower 从未进入 Release。
