# Codex Subagent 全局默认推理强度

Codex Subagent 文档页已从 `developers.openai.com/codex/subagents` 迁移到 `learn.chatgpt.com/docs/agent-configuration/subagents`，文档与配置参考均记录 `agents.default_subagent_reasoning_effort`：为派生 Agent 设置全局默认推理强度。矩阵 `agent-effort` 字段此前只记录每 Agent 字段 `model_reasoning_effort`，本次补入全局默认键、解析顺序与取值差异。同时重新核对五家产品的 Agent 级推理强度：Claude Code `effort` 字段仍有效（文档明确档位、会话继承与 v2.1.198 起扩展思考继承），Qwen Code 文档把 `effort` 明确列为尚未落地的兼容字段，Kimi Code 仍无 effort 字段，Qoder CLI `effort` 字段取值不变。另外更新两处来源 SHA：Qwen Code Subagent 文档固定到 `412eae24b48f`，Kimi Code Agents 文档固定到 `29c9e2ab20a1`，两文件的 effort 结论均未变化。注意：2026-07-29 变更记录称当时补足了 `agents.max_threads`、`agents.default_subagent_model`、`agents.default_subagent_reasoning_effort` 并迁移文档 URL，经 git 核对，当时合入的矩阵只记录了 `agents.max_concurrent_threads_per_session`，其余内容实际未落库；本次补入 effort 全局默认与 URL 迁移，剩余两个键留待后续单元。

## 修正

- `agent-effort` 字段 Codex 矩阵结论由 "`model_reasoning_effort`" 改为 "`model_reasoning_effort` · `[agents] default_subagent_reasoning_effort` 全局默认"。
- Codex 详情补入：Agent 文件设置 `model` 或 `model_reasoning_effort` 时文件值优先；否则按显式 spawn 值、`[agents]` 默认值、父会话值的顺序独立解析；`agents.default_subagent_reasoning_effort` 为全局默认，显式 spawn effort 优先于该默认；spawn 切换模型且无显式或配置的 effort 时使用该模型的默认 effort；Subagent 页列出取值 `ultra`、`max`、`xhigh`、`high`、`medium`、`low`，配置参考 `model_reasoning_effort` 条目列出 `minimal | low | medium | high | xhigh`（Responses API，`xhigh` 依模型而定），两处取值列表照实并列。
- Claude Code 详情补足档位 `low`、`medium`、`high`、`xhigh`、`max`（依模型而定）、省略时继承会话 effort、v2.1.198 起扩展思考配置继承主会话、官方未列 Subagent 全局默认 effort。
- Qwen Code 详情改为官方表述：`effort` 属尚未落地的 Claude Code 兼容字段，需模型层参数等前置基础设施后随后续版本引入。
- Kimi Code 详情补"也没有 Subagent 全局默认 effort 设置"；Qoder CLI 详情补"文档未说明省略时的继承行为，settings.json 覆盖 schema 不含 effort 键"。
- `codex-agents` 来源 URL 改为迁移后的 learn.chatgpt.com 页面，该字段 Codex 来源新增 `codex-config-reference`。
- `qwen-agents` 来源由 `079ce5346af7` 更新为 `412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e`；`kimi-agents` 来源由 `efac96c8a95a` 更新为 `29c9e2ab20a1646ad33f2b7c999b450152f9c01a`。
- `docs/09-版本与证据.md`：Codex 主要材料补入 Subagent 全局默认推理强度与解析顺序；官方来源表 Codex Subagent 列改为新 URL 并新增配置参考 `[agents]` 链接，Qwen Subagents 与 Kimi Agents 链接更新到新 SHA。
- `docs/02-Subagent能力矩阵.md` 更新对应行与来源列表；`npm run generate` 重新生成 `docs/capabilities/subagents/`（22 个详情的来源链接随 URL 与 SHA 更新）及 `docs/capabilities/commands/cmd-agents.md`、`cmd-collaboration.md`。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [Agent 推理强度详情](../docs/capabilities/subagents/agent-effort.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Codex 官方 Subagent 文档（https://learn.chatgpt.com/docs/agent-configuration/subagents，2026-08-11 抓取；`developers.openai.com/codex/subagents` 返回 308 重定向到该页）：`[agents]` 键表原文 "`agents.default_subagent_reasoning_effort`: Set the default reasoning effort for spawned agents."；解析段落原文 "If a custom agent file sets `model` or `model_reasoning_effort`, the value in the file takes precedence. Otherwise, Codex resolves each setting independently: an explicit spawn value, then the corresponding `[agents]` default, then the parent's value. If a spawn selects a different model and neither an explicit nor configured effort is present, Codex uses that model's default effort."；`model_reasoning_effort` 小节列出取值 `ultra`、`max`、`xhigh`、`high`、`medium`、`low`；"Existing configurations can keep using `agents.max_threads` as a legacy alias."（`max_threads` 别名属 `agent-limits` 字段，本次不录入）。
- Codex 官方配置参考（https://learn.chatgpt.com/docs/config-file/config-reference，2026-08-11 抓取）：`agents.default_subagent_reasoning_effort` 类型 string、默认未设，原文 "Default reasoning effort for spawned agents. An explicit spawn effort takes precedence."；`agents.default_subagent_model` 原文 "Default model for spawned agents. An explicit spawn model takes precedence."（属 `agent-model` 字段，留待后续单元）；`model_reasoning_effort` 取值 `minimal | low | medium | high | xhigh`，描述 "Adjust reasoning effort for supported models (Responses API only; `xhigh` is model-dependent)."。
- Claude Code 官方 Subagent 文档（https://code.claude.com/docs/en/sub-agents，2026-08-11 抓取）：`effort` 字段行原文 "Effort level when this subagent is active. Overrides the session effort level. Default: inherits from session. Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model"；"As of v2.1.198, subagents also inherit the main conversation's extended thinking configuration: if thinking is on in your session, it's on for the subagent, and if it's off, it stays off."；未列出 Subagent 全局默认 effort 设置。
- Qwen Code 官方仓库 `412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e`（main 上改动 `docs/users/features/sub-agents.md` 的最新提交，2026-08-01，feat(core): add project-level fork profiles #8148）：原文 "The remaining CC frontmatter fields — `effort`, `skills`, `initialPrompt`, `memory`, `isolation` — are documented in the declarative-agent design doc and land in follow-up PRs once the prerequisite infrastructure exists (`effort` needs a model-layer parameter; …)"；effort 结论与原记录一致，仅更新来源 SHA。
- Kimi Code 官方仓库 `29c9e2ab20a1646ad33f2b7c999b450152f9c01a`（main 上改动 `docs/zh/customization/agents.md` 的最新提交，2026-08-03，docs: clarify secondary model default binding and override precedence #2553）：frontmatter 字段表仍为 `name`、`description`、`whenToUse`、`override`、`model_preference`、`tools`、`disallowedTools`、`subagents`，无 effort 字段，也无子 Agent 全局默认 effort 设置；仅更新来源 SHA。
- Qoder CLI 官方 Subagent 文档（https://docs.qoder.com/en/cli/subagent，2026-08-11 抓取）：`effort` 描述 "Reasoning effort or budget."，取值 `low`、`medium`、`high`、`xhigh`、`max` 或正整数；未说明省略时继承行为；settings.json 覆盖 schema 支持 `enabled`、`tools`、`runConfig`（`maxTurns`、`maxTimeMinutes`）、`modelConfig`（`model`、`generateContentConfig.temperature`）、`mcpServers`，不含 effort 键。
- 其他产品本次无同类变化：Claude Code v2.1.226 与 v2.1.227 均为修复与界面改进，无新增用户能力（CHANGELOG 提交 `2bb60696142b`、`54cc51a08a5d`）；Kimi Code main 近期提交（#2806 事件订阅内省等）为内部调试与重构；Qwen Code main 近期提交为 Web Shell 与 CLI 修复；Qoder CLI 公开文档未见新增 Subagent 推理强度能力。
