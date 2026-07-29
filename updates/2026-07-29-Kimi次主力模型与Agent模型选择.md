# Kimi Code 次主力模型与 Agent 模型选择

核对 Kimi Code v0.30.0（commit `efac96c8a95a`）中 Agent `model_preference` 字段的次主力模型功能。

## 修正

- Kimi Code `model_preference` 矩阵结论从 "`model_preference`" 更新为 "`model_preference`: `primary` · `secondary`（实验性）"。
- `primary` 使用调用方主模型；`secondary` 使用 `config.toml` 中 `[secondary_model] model` 配置的模型。
- 优先级链：工具调用显式 `model` > `model_preference` > 已配置的次主力模型 > 继承调用方模型。
- 未配置 `[secondary_model]` 时子 Agent 继承主模型。
- `[secondary_model]` 还支持 `default_effort` 和模型覆盖参数（`max_context_size`、`max_output_size` 等）。
- 环境变量 `KIMI_SECONDARY_MODEL`、`KIMI_SECONDARY_EFFORT` 可覆盖配置文件。
- TUI 中可用 `/secondary_model` 交互选择次主力模型。
- 条件从"只在 Web 或实验 Headless 路径生效，TUI 忽略"更正为"所有启动模式（包括交互式 TUI）均生效"。
- 实验开关：`KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 `KIMI_CODE_EXPERIMENTAL_FLAG=1`。
- 恢复的子 Agent 保留原始模型。
- 来源从 `main` 分支和 `16c7189bd54a` 固定到 `efac96c8a95a`。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [Agent 单独选模型详情](../docs/capabilities/subagents/agent-model.md)

## 证据版本

- Kimi Code 官方仓库 `efac96c8a95a`（feat(agent-core): custom agent files and secondary model on the v1 engine #2232），`docs/zh/customization/agents.md` 和 `docs/zh/configuration/config-files.md`。
- Kimi Code v0.30.0 Release（`16c7189bd54a`）。
