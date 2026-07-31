# Kimi Code `/secondary_model` 命令纳入选择模型字段

Kimi Code 0.31.0（2026-07-30）正式在 Slash 命令文档中列出 `/secondary_model`。此前该命令只在 `agent-model` 详情中作为次主力模型入口提及，未纳入 Slash 命令矩阵的"选择模型"行。

## 修正

- `cmd-model` 矩阵 Kimi Code 列从 "`/model`" 更新为 "`/model` · `/secondary_model`"。
- 命令对照表、命令目录和详情页同步更新。
- `/secondary_model` 配置 Subagent 使用的次主力模型，写入 `[secondary_model]` 配置并立即生效。
- 条件：需通过 `/experiments` 启用 `secondary-model` 实验性功能。
- 来源固定到 commit `efac96c8a95a`（PR #2232）。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [选择模型详情](../docs/capabilities/commands/cmd-model.md)

## 证据版本

- Kimi Code 官方仓库 `efac96c8a95a`，`docs/zh/reference/slash-commands.md`。
- Kimi Code 0.31.0 Release（2026-07-30，commit `bc28e9d`）。
