# 多模型或多代理模式

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-collaboration)

> 核对日期：2026-08-23

## 定义

用多模型、多 Agent 或编排工作流并行处理同一个任务，并汇总、选择或提交各自结果。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/advisor [model\|off]`、`/batch <instruction>` | 官方确认 |
| Codex | `/agent` | 官方确认 |
| Qwen Code | `/advisor [focus]`、`/arena start`、`/arena status`、`/arena select`、`/arena stop`、`/batch <operation> <file-pattern>`、`/coordinate <goal>` | 源码确认 |
| Kimi Code | `/swarm on\|off`、`/swarm <task>`、`/tower [status\|on\|off\|teardown\|<objective>]` | 源码确认 |
| Qoder CLI | `/quest`、`/batch` | 官方确认 |

## 比较边界

### 本页包含

- 第二模型顾问
- 并行任务拆分
- 模型竞赛
- Swarm 和工作流编排
- 多 Agent 团队协作与共享任务清单

### 本页不包含

- 单个 Subagent 管理
- 普通后台 Shell
- 模型质量比较

## 跨产品事实

1. 五家的协作入口语义不同，不能仅按命令名称判断等价。
2. Claude Code `/batch` 会拆分为 5–30 个单元并使用隔离 Worktree。
3. Qwen Code Arena 让多个模型执行同一任务，之后选择一个结果并合并其 Diff。
4. Qwen Code `/batch` 是随产品提供的 Skill：发现文件、分块后使用并行执行 Agent 完成批量操作。
5. Qwen Code 的 `/coordinate` Skill 与 Agent Team 运行时（提交 `8858d4340bbb`，PR #8804）随 v0.21.11（2026-08-13 发布）进入正式通道：最多 3 个队友共享任务清单并互发消息，调查队友被强制只读，可选 1 名写手固定在 Leader 拥有的 Worktree。
6. Qwen Code 的 `/advisor`（提交 `18c9763f46ce`，PR #7567）于 2026-08-17 合入、随 v0.21.14（2026-08-19 发布）发布：以工具全部移除的只读旁路查询请审查模型对当前对话给出二次意见，固定输出 Verdict、Risks、Missing evidence、Recommendation 四节，`advisorModel` 设置可把审查路由到其他模型（可跨 Provider）。
7. Qoder CLI 官方 Slash 命令参考列出内置 Skill `/batch`：在隔离 git worktree 中派出并行工作 Agent 对多个文件应用批量修改，要求当前目录为 Git 仓库。
8. Kimi Code 的 `/tower` 在 main 分支经历三个阶段：2026-08-16 合入（提交 `f492cd7c9e03`，PR #2633），2026-08-18 整体禁用（提交 `5ae82cd5bcb9`，PR #3023，`tower` 标志未注册、任何方式都无法开启），2026-08-21 提交 `0f44537c13e7`（PR #3099）又把它重建为与 plan 并列的一等模式重新开启——内置 Skill 删除，编排手册改为 `tower_mode` 上下文注入，编排工具在进入模式时以工具覆盖层启用并在会话恢复时重新应用，`tower` 实验标志（`KIMI_CODE_EXPERIMENTAL_TOWER`）注册进登记册、默认关闭，合入 main 尚未发布。编排设计不变：主 Agent 作为唯一控制塔规划 mission 并合并分支，worker 在独立 git worktree 中执行任务，reviewer 审查分支，合并由代码级门禁强制（需针对当前分支 tip 的 clean review）。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/advisor [model\|off]`、`/batch <instruction>` |
| 别名 | 无公开别名 |
| 参数 | advisor: `opus\|sonnet\|model-id\|off`；batch: `<instruction>` |
| 执行行为 | Advisor 在关键时刻咨询第二模型；Batch 将大型改动拆为并行 Worktree 子任务。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Advisor 为会话设置；Batch 创建后台 Agent、Worktree 和 PR |
| 条件与边界 | Batch 需要 Git 仓库 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/agent` |
| 别名 | `/subagents` |
| 参数 | 无公开参数 |
| 执行行为 | 在并发 Agent 线程之间查看和切换；任务委派由主 Agent、项目指令或 Skill 触发。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/advisor [focus]`、`/arena start`、`/arena status`、`/arena select`、`/arena stop`、`/batch <operation> <file-pattern>`、`/coordinate <goal>` |
| 别名 | `/arena choose` |
| 参数 | `/advisor` 可选 `<focus>` 聚焦特定疑虑（省略时审查整段对话，长度与 `/btw` 同一上限，超限报 `Focus too long`）；Arena 使用相应子命令；Batch 使用 `<operation> <file-pattern>`；Coordinate 使用目标描述（参数提示 `<goal>`） |
| 执行行为 | `/advisor`（v0.21.14 起）以独立只读旁路单轮查询（`runForkedAgent`，工具全部移除）请审查模型对当前对话给出二次意见，不执行任务、不打断主对话，结果渲染为带 `/advisor · <model>` 标题的框形块，固定四节 Verdict、Risks、Missing evidence、Recommendation（结构化输出缺节即报错）；Arena 让多个模型执行同一任务并选择结果；随产品提供的 `/batch` Skill 发现匹配文件、分块并交给并行执行 Agent；`/coordinate` 启动原生多代理协作：Leader 把目标拆分为最多 3 个独立工作流，调查队友被强制只读工具集（不能执行 shell 或写文件），可选将 1 名写手队友固定在 Leader 创建的 Git Worktree，队友共享任务清单、经 `send_message` 等团队工具互发消息并显示在 Agent View 页签。 |
| 可用模式 | `/advisor` 支持交互式（渲染四节审查）与 ACP（以消息结果返回），源码 `supportedModes` 为 `interactive` 与 `acp`，纯非交互模式不加载；Arena 仅交互式；`/batch` 支持交互式、非交互式和 ACP；`/coordinate` 作为随产品提供的 Skill 加载，`disable-model-invocation: true`，只能由用户显式调用 |
| 保存范围 | `/advisor` 审查结果只显示给用户、不进入主对话历史，内置 `/advisor` 在 ACP 中不写入会话记录（用户定义的同名命令仍记录），`advisorModel` 写入 `settings.json`；Arena 运行属于当前会话；Arena select 和 Batch 任务可修改工作区；`/coordinate` 队伍与共享任务清单属于当前会话，写手在 Worktree 中修改，仅 Leader 拥有当前分支合并权 |
| 条件与边界 | `/advisor` 于 2026-08-17 合入 main（提交 `18c9763f46ce`，PR #7567），v0.21.13 早于该提交发布，首个包含它的稳定版为 v0.21.14（2026-08-19 发布，发布说明列出本项）；审查请求携带最近对话上下文（官方文档：至多最近 40 条消息），审查模型工具被全部移除（NO_TOOLS）且禁用模型回退；默认用主模型，`advisorModel`（`settings.json` 字符串，默认空，建议不低于主模型能力）可把审查路由到其他模型乃至其他 Provider，模型名不预校验，Provider 拒绝时报错，仅不可解析的别名（如未配置 fast 模型时的 `fast`）回退主模型；执行期间阻塞输入直到审查返回（不同于 fire-and-forget 的 `/btw`），主回合运行中或有未完成操作时报错，对话历史为空或未配置模型时报错；用户定义的同名 `advisor` 命令遮蔽内置命令。`/batch` 在 bare mode 或被 Skill/Slash 禁用时不可用；`/coordinate` 完整团队协作需将 `experimental.agentTeam` 设为 `true` 并重启，或以 `QWEN_CODE_ENABLE_AGENT_TEAM=1` 启动；未启用时退回普通前台 Agent 做只读并行调查（仅委派、不协作）；Agent Team 运行时依赖 `team_create`、`send_message`、`task_list`、`task_update` 工具；`/coordinate` 随 v0.21.11（2026-08-13 发布）进入正式通道 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)、[Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)、[Qwen Code /advisor command commit](https://github.com/QwenLM/qwen-code/commit/18c9763f46ce95eb64f46038941618c4ea50dcce)、[Qwen Code /advisor command documentation](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/docs/users/features/commands.md)、[Qwen Code advisor command source](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/packages/cli/src/ui/commands/advisor-command.ts)、[Qwen Code advisorModel setting documentation](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/docs/users/configuration/settings.md)、[Qwen Code multi-agent coordination documentation](https://github.com/QwenLM/qwen-code/blob/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b/docs/users/features/multi-agent-coordination.md)、[Qwen Code coordinate bundled Skill](https://github.com/QwenLM/qwen-code/blob/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b/packages/core/src/skills/bundled/coordinate/SKILL.md)、[Qwen Code native multi-agent coordination commit](https://github.com/QwenLM/qwen-code/commit/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b)、[Qwen Code v0.21.11 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11)、[Qwen Code v0.21.14 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.14) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/swarm on\|off`、`/swarm <task>`、`/tower [status\|on\|off\|teardown\|<objective>]` |
| 别名 | 无公开别名 |
| 参数 | `/swarm` 使用 `on\|off\|<task>`；`/tower` 不带参数或带 `status` 报告状态，`on\|off` 显式切换模式，`teardown` 发送拆除指令（由模型的 `TowerTeardown` 退出模式），其余输入作为目标：先幂等确保模式开启、首次开启提示 `Tower mode: ON`，再把目标作为普通输入发送 |
| 执行行为 | 切换 Swarm 模式，或为单轮任务开启 Swarm 并在成功完成后自动关闭。`/tower` 于 2026-08-21（提交 `0f44537c13e7`，PR #3099）重建为与 plan 并列的一等模式重新开启：编排手册从删除的内置 Skill 移入 `tower_mode` 上下文注入（full、sparse、exit 三类提醒，去重策略与 plan 模式相同），十一个 `Tower*` 编排工具在进入模式时以工具覆盖层启用、会话恢复时重新应用，模式状态持久可重放，TUI 页脚显示 `tower` 徽标、`/status` 显示模式行。Tower 模式下主 Agent 作为唯一控制塔，只做任务规划（`TowerPlan`）、派生 worker/reviewer（`TowerSpawn`）、路由信息与合并分支，不写产品代码；每个 worker 在 `.tower/worktrees/` 下的独立 git worktree 中执行一个 mission，reviewer 审查分支并经 `TowerReview` 提交结论；inbox、findings、reviews、mission 文件与 activity.log 全部由 `Tower*` 工具写入 `.tower/comms/`，禁止手工编辑 `.tower/` 文件。 |
| 可用模式 | 交互式 TUI；`/tower` 为 v2 引擎内置命令，v2 引擎无会话时惰性创建会话；SDK `Session.setTowerMode()` 与 kap-server `agent_config.tower_mode` 也可切换模式供非 TUI 客户端使用（v1 SDK 基座抛 `not_implemented`）；`/tower <objective>` 在未配置模型时报错；`towerMode` 状态经 `AgentStatusUpdatedEvent`、`/status` 行与页脚徽标同步，切换后经 `getStatus` 复核实际生效状态 |
| 保存范围 | Swarm 模式属于当前会话；`/tower` 于当前仓库目录创建 `.tower/` 工作区：`state.json` 记录基线分支与 Agent 名册，worktree 位于 `.tower/worktrees/`，teardown 后 `.tower/comms/`（含活动日志）保留作为审计记录；`tower_mode.enter`/`tower_mode.exit` 写入会话 wire 历史，恢复会话时重放并同时恢复模式与工具覆盖层；合并后分支保留 |
| 条件与边界 | 时间线：`/tower` 于 2026-08-16 首次合入 main（提交 `f492cd7c9e03`，PR #2633），从未进入 Release；2026-08-18 提交 `5ae82cd5bcb9`（PR #3023）整体禁用（`tower` 标志未注册进实验功能登记册，`KIMI_CODE_EXPERIMENTAL_TOWER=true`、master 开关或 `[experimental]` 配置都无法开启，changeset 被删除）；2026-08-21 提交 `0f44537c13e7`（PR #3099）重建为与 plan 并列的一等模式重新开启，内置 Skill 及其测试删除，合入 main 尚未发布（0.38.0 不含该提交，changeset `.changeset/tower-mode-command.md` 为 minor、随下一个版本发布）。门禁：`tower` 实验标志（标题 `Tower mode`，`surface: 'both'`）现经 `registerFlagDefinition` 注册进实验功能登记册、默认关闭，`KIMI_CODE_EXPERIMENTAL_TOWER=true`、`[experimental] tower = true` 或 master 开关 `KIMI_CODE_EXPERIMENTAL_FLAG=1` 都可开启，`/experiments` 列出该标志；功能在 App 启动时组装，运行中翻动标志需要重启才生效；标志关闭时专门的 `onBeforeExecuteTool` 钩子否决全部 tower 工具；SDK/REST 写入路径会复核模式是否实际生效，未生效时抛 `session.tower_mode_invalid`。仅 v2 引擎实现（agent-core-v2）；tower 模式仅限主 Agent，回放的非主 Agent 记录不生效。所有权：同一仓库的 tower 只允许一个在世持有者会话，其他在世会话持有时进入被拒绝，只能在原持有者已死时经 `TowerInit` 接管陈旧 tower，接管可跨重启保留；fork 出的会话无论标志状态都校验所有权，存在在世外部持有者时清除继承的模式。worker/reviewer 派生时固定 `auto` 权限模式，会话整体切换模式不影响它们；worker 写隔离按身份（`tower-worker` profile）而非功能激活状态判定，实验关闭后已派生的 worker 仍不能写主检出或其他 worktree；worker 在 secondary-model 实验开启时绑定 `[secondary_model]` 模型池，否则继承塔模型，reviewer 始终绑定主力模型；`TowerMerge` 门禁在最新 review 非 clean、分支在 review 后移动、依赖 mission 未合并、改动文件超出 mission 作用域 glob 或主检出不在记录的基线分支时拒绝合并；Tower 模式下 `TodoList` 工具被代码禁用，worker 无 `AskUserQuestion`；派生并发受预算限制（上限 16，遇 429 暂停 60 秒）；manual 权限模式下启动 `/swarm` 任务会询问是否切换到 auto 或 yolo；官方 Slash 命令文档尚未列出 `/tower` |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)、[Kimi Code /tower multi-agent orchestration commit](https://github.com/MoonshotAI/kimi-code/commit/f492cd7c9e03666ecfd10dc47ca9b48c35de2318)、[Kimi Code /tower changeset](https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/.changeset/tower-slash-command.md)、[Kimi Code /tower builtin skill body](https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/packages/agent-core-v2/src/features/tower/skill/tower.md)、[Kimi Code TowerSpawn tool source](https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/packages/agent-core-v2/src/features/tower/tools/spawn/spawnTool.ts)、[Kimi Code tower feature disable commit](https://github.com/MoonshotAI/kimi-code/commit/5ae82cd5bcb92395baf96feea68e12f8c96b51ed)、[Kimi Code tower skill experimental flag gate](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/features/tower/skill/skill.ts)、[Kimi Code TowerFeature flag guard source](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/features/tower/towerFeature.ts)、[Kimi Code tower flag gating tests](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/test/features/tower/towerFeature.test.ts)、[Kimi Code builtin skill flag filter](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/app/skillCatalog/builtin/builtin.ts)、[Kimi Code tower mode commit](https://github.com/MoonshotAI/kimi-code/commit/0f44537c13e7c32b9189e20af7c894c34704be5b)、[Kimi Code tower mode changeset](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/.changeset/tower-mode-command.md)、[Kimi Code tower mode flag source](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/packages/agent-core-v2/src/features/tower/flag.ts)、[Kimi Code /tower mode command source](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/apps/kimi-code/src/tui/commands/tower.ts)、[Kimi Code tower mode constants source](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/packages/agent-core-v2/src/features/tower/tower.ts) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/quest`、`/batch` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 以 Prompt 工作流使用专用 Subagent 引导功能开发；`/batch` 为内置 Skill，在隔离 git worktree 中派出并行工作 Agent 对多个文件应用批量修改。 |
| 可用模式 | TUI 与 Headless（`/quest`）；`/batch` 的模式范围未在文档中说明 |
| 保存范围 | 运行状态属于当前任务；`/batch` 工作 Agent 在隔离 worktree 中修改文件 |
| 条件与边界 | `/batch` 要求当前目录为 Git 仓库 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Qwen Code bundled Skill loader](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/packages/cli/src/services/BundledSkillLoader.ts)
- [Qwen Code /advisor command commit](https://github.com/QwenLM/qwen-code/commit/18c9763f46ce95eb64f46038941618c4ea50dcce)
- [Qwen Code /advisor command documentation](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/docs/users/features/commands.md)
- [Qwen Code advisor command source](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/packages/cli/src/ui/commands/advisor-command.ts)
- [Qwen Code advisorModel setting documentation](https://github.com/QwenLM/qwen-code/blob/18c9763f46ce95eb64f46038941618c4ea50dcce/docs/users/configuration/settings.md)
- [Qwen Code multi-agent coordination documentation](https://github.com/QwenLM/qwen-code/blob/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b/docs/users/features/multi-agent-coordination.md)
- [Qwen Code coordinate bundled Skill](https://github.com/QwenLM/qwen-code/blob/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b/packages/core/src/skills/bundled/coordinate/SKILL.md)
- [Qwen Code native multi-agent coordination commit](https://github.com/QwenLM/qwen-code/commit/8858d4340bbbb46f693dd09767aaaadc7ec7cc9b)
- [Qwen Code v0.21.11 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.11)
- [Qwen Code v0.21.14 release notes](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.14)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Kimi Code /tower multi-agent orchestration commit](https://github.com/MoonshotAI/kimi-code/commit/f492cd7c9e03666ecfd10dc47ca9b48c35de2318)
- [Kimi Code /tower changeset](https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/.changeset/tower-slash-command.md)
- [Kimi Code /tower builtin skill body](https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/packages/agent-core-v2/src/features/tower/skill/tower.md)
- [Kimi Code TowerSpawn tool source](https://github.com/MoonshotAI/kimi-code/blob/f492cd7c9e03666ecfd10dc47ca9b48c35de2318/packages/agent-core-v2/src/features/tower/tools/spawn/spawnTool.ts)
- [Kimi Code tower feature disable commit](https://github.com/MoonshotAI/kimi-code/commit/5ae82cd5bcb92395baf96feea68e12f8c96b51ed)
- [Kimi Code tower skill experimental flag gate](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/features/tower/skill/skill.ts)
- [Kimi Code TowerFeature flag guard source](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/features/tower/towerFeature.ts)
- [Kimi Code tower flag gating tests](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/test/features/tower/towerFeature.test.ts)
- [Kimi Code builtin skill flag filter](https://github.com/MoonshotAI/kimi-code/blob/5ae82cd5bcb92395baf96feea68e12f8c96b51ed/packages/agent-core-v2/src/app/skillCatalog/builtin/builtin.ts)
- [Kimi Code tower mode commit](https://github.com/MoonshotAI/kimi-code/commit/0f44537c13e7c32b9189e20af7c894c34704be5b)
- [Kimi Code tower mode changeset](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/.changeset/tower-mode-command.md)
- [Kimi Code tower mode flag source](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/packages/agent-core-v2/src/features/tower/flag.ts)
- [Kimi Code /tower mode command source](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/apps/kimi-code/src/tui/commands/tower.ts)
- [Kimi Code tower mode constants source](https://github.com/MoonshotAI/kimi-code/blob/0f44537c13e7c32b9189e20af7c894c34704be5b/packages/agent-core-v2/src/features/tower/tower.ts)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [Subagent 管理](./cmd-agents.md)
- [后台与并行](../subagents/agent-background.md)
- [Worktree 隔离](../subagents/agent-worktree.md)
