# Qwen Code Agent 模型 Grade 选择

核对 Qwen Code v0.21.1（commit `7db57552e33a`）中 Agent 模型选择的 `modelGrades` 功能。

## 修正

- Qwen Code `agent-model` 矩阵结论从 "`model`: inherit · fast · modelId · authType:modelId" 更新为 "`model`: inherit · fast · modelId · authType:modelId · `modelGrades` 名称"。
- `modelGrades` 在 `settings.json` 的 `agents.modelGrades` 中定义（如 `"small": "fast"`），将 grade 名称映射到模型选择器。
- `agents.allowedGrades` 可限制允许使用的 grade 名称列表。
- Agent 工具调用时传 `model: "small"` 即可按 grade 选模型；未知或不在 `allowedGrades` 中的 grade 会被拒绝。
- Fork 和命名 Teammate 不接受 grade 选择。
- Agent 定义中的显式 `model` 字段优先于 grade。
- `agents.builtin.exploreModel` 可单独覆盖内置 Explore Agent 的模型，接受与 `model` 相同的选择器。
- 来源从 `2e08486b529bf64ca3b31d13424ad12f1100de93` 固定到 `7db57552e33a`。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [Agent 单独选模型详情](../docs/capabilities/subagents/agent-model.md)

## 证据版本

- Qwen Code 官方仓库 `7db57552e33a`，`docs/users/features/sub-agents.md` 中 Model grades 和 Built-in Explore agent model selection 段落。
- Qwen Code v0.21.1 Release（PR #7702 feat(core): add model grade selection for subagent spawn）。
