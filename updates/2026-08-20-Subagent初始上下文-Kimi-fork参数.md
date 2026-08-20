# Subagent 初始上下文：Kimi Code Agent 工具实验性 `fork` 参数

Kimi Code 官方仓库在 2026-08-20 合入 PR #3007（`feat(agent-core-v2): add a fork parameter to the Agent tool`，合并提交 `f6736d7c0de609d44ed1cb761cfe9f195c4d94fb`，77 个文件 +2755/−643），在 v2 引擎（agent-core-v2）为 `Agent` 与 `AgentSwarm` 工具新增实验性布尔参数 `fork`：传 `fork: true` 时子 Agent 以调用方已完成对话的一次性快照启动，继承调用方的 Agent 类型、工具集与模型，提示词只需任务本身。changeset `.changeset/subagent-fork-context.md` 为 `@moonshot-ai/kimi-code` 的 minor 级变更；该提交晚于 0.38.0 发布（2026-08-20T13:13:44Z，发布提交 `0999454bdcb5`），0.38.0 发布说明不含该功能，属于合入 main 尚未发布。矩阵 `agent-initial-context`（初始上下文）字段 Kimi 列此前为"只接收任务提示"，本次补录实验性 fork 上下文继承行为。其余四家无同类变化：Claude Code Fork 模式行为维持 v2.1.232 记录，Codex 仍为父任务与委派描述，Qwen Code Fork 维持 `fork_turns` 继承规则，Qoder CLI 仍为任务提示加可选 `initialPrompt`，结论保持不变。

## 修正

- `agent-initial-context`（初始上下文）矩阵 Kimi Code 列由 "只接收任务提示" 更新为 "只接收任务提示；条件：实验开关开启后 `fork` 参数以调用方对话快照启动（`KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK`，v2 引擎，合入 main 尚未发布）"。证据状态由"官方确认"变为"条件项"（矩阵值含条件）。其余四家矩阵结论不变。
- Kimi Code 详情：具体行为补充默认仍只接收任务描述与自身 profile；`Agent` 与 `AgentSwarm` 传 `fork: true` 时以调用方已完成对话的一次性快照启动，继承调用方的 Agent 类型、工具集与模型，快照中仍在执行的工具调用补一条合成结果（注明结果未知、不要假设成败也不要等待）。上下文与继承补充快照为一次性参考资料、新 Agent 独立运行而非续写；`resume` 与 `fork` 互斥，`subagent_type` 必须与调用方自身类型一致，`model` 只接受调用方自身模型或 `primary`。条件与边界补充实验开关：`KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK=true` 或 config.toml `[experimental]` 下 `subagent_fork = true`，master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1` 也会启用，默认关闭；开关关闭时传 `fork` 报 `fork is disabled: the subagent_fork experimental flag is off.`；仅 v2 引擎实现，合入 main 尚未发布，官方 Agents 文档页尚未同步。
- 跨产品事实新增第 4 条：Kimi Code v2 引擎合入实验性 `fork` 参数（合入 main 尚未发布）。
- `site/data.js`：新增来源 `kimi-subagent-fork-commit`（合并提交 `f6736d7c0de6`）、`kimi-subagent-fork-env`（该提交时点 `docs/zh/configuration/env-vars.md`）与 `kimi-subagent-fork-changeset`（`.changeset/subagent-fork-context.md`）。
- `docs/02-Subagent能力矩阵.md`：初始上下文行 Kimi 列同步更新；来源新增 fork 参数提交与环境变量文档链接。
- `docs/09-版本与证据.md`：Kimi Code 核对日期保持 2026-08-20，主要材料新增 Agent 工具实验性 `fork` 参数条目；官方来源表 Kimi Code Subagent 列新增 fork 参数提交、changeset 与环境变量文档链接。
- `npm run generate` 重新生成 `docs/capabilities/subagents/`（`agent-initial-context.md` 内容更新）；`npm test` 通过。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [初始上下文详情](../docs/capabilities/subagents/agent-initial-context.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code PR #3007（`feat(agent-core-v2): add a fork parameter to the Agent tool`）：2026-08-20T13:50:44Z 合入 main，合并提交 `f6736d7c0de609d44ed1cb761cfe9f195c4d94fb`，77 个文件（+2755/−643），涉及 `.changeset/subagent-fork-context.md`、`docs/en|zh/configuration/env-vars.md`、`packages/agent-core-v2/src/agent/tools/agent/agent.ts`、`agentTool.ts`、`agent-fork.md`、`packages/agent-core-v2/src/agent/contextMemory/openToolExchange.ts`、`packages/agent-core-v2/src/session/subagent/spawn.ts`、`packages/agent-core-v2/src/features/swarm/tools/agent-swarm/agent-swarm.ts` 及 fork 一致性、生命周期与 swarm 测试。
- 该提交处的 `.changeset/subagent-fork-context.md`：`"@moonshot-ai/kimi-code": minor`，描述 "Add an optional `fork` parameter to the subagent and swarm tools that starts the subagent with a snapshot of the calling agent's conversation history instead of an empty context. Experimental: enable it by setting `KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK=true` or `subagent_fork = true` under `[experimental]` in config.toml."
- 该提交处的 `agentTool.ts` 工具 schema：`fork` 为 `z.boolean().optional()`，描述 "Fork the current context: the subagent starts with a snapshot of this agent's completed conversation history instead of zero context, inheriting this agent's agent type, tool set, and model. A non-empty resume is rejected. If subagent_type is provided, it must match this agent's type; if model is provided, it must be this agent's model or 'primary'. Different types and model overrides are rejected."
- 该提交处的 `spawn.ts`：`forkIncompatibility` 校验在 `fork: true` 时拒绝非空 `resume`（"Cannot set resume when forking the current context. Fork creates a new agent; resume continues an existing one."）、与调用方不同的 `subagent_type`（"Cannot set a different subagent_type when forking the current context. A fork inherits this agent's own agent type."）和覆盖模型（"Cannot override the model when forking the current context. A fork inherits this agent's model."，`model` 等于 `primary` 或调用方 `modelAlias` 时放行）；实验开关关闭时报 "fork is disabled: the subagent_fork experimental flag is off."；注入的 `FORK_CONTEXT_NOTICE` 说明继承对话是一次性快照、仅作参考、新 Agent 独立而非续写。
- 该提交处的 `openToolExchange.ts`：`closeTrailingOpenToolExchange` 为继承历史中缺少响应的工具调用追加合成工具消息，文案 "This tool call was still executing when this conversation snapshot was inherited from the source agent, so its result is not part of this context. The outcome is unknown — do not assume it succeeded or failed, and do not wait for it."
- 该提交处的 `agent-fork.md`（工具内说明）："Context forking: when the task builds on this conversation, pass `fork: true` instead of briefing from scratch — the subagent then starts with a snapshot of your completed history (inheriting your own agent type, tool set, and model), so the prompt only needs the task itself. A non-empty `resume` is rejected with `fork`; `subagent_type` must match your own agent type; `model` must be your own model or `primary`."
- 该提交处的 `docs/zh/configuration/env-vars.md`：`KIMI_CODE_EXPERIMENTAL_SUBAGENT_FORK` 条目 "在 `Agent` 和 `AgentSwarm` 工具上启用实验性的 `fork` 参数，让模型可以以调用方 Agent 对话历史的快照而不是空上下文启动 subagent；master `KIMI_CODE_EXPERIMENTAL_FLAG=1` 也会启用本功能"，真值 `1`/`true`/`yes`/`on`、假值 `0`/`false`/`no`/`off`，默认未开启。
- 该提交处的 `docs/zh/configuration/config-files.md`：`[experimental]` 小节仍处于注释状态且未列 `subagent_fork` 字段（`subagent_fork = true` 的用法以 changeset 为据）。
- 该提交处的 `docs/zh/customization/agents.md`：未提及 `fork` 参数或对话快照继承（官方 Agents 文档页尚未同步）。
- 发布状态核对：最新 Release `@moonshot-ai/kimi-code@0.38.0`（2026-08-20T13:13:44Z，changesets 发布提交 `0999454bdcb5` 于 13:11:45Z）早于本提交（13:50:44Z）；0.38.0 发布说明 minor 项为双 OAuth 登录（PR #2862）与 WaitFor 工具（PR #3060），不含 fork 参数，故该功能合入 main 尚未发布。
