# Subagent 独立 Hooks 字段核对（Codex 与 Kimi）

`agent-hooks` 字段此前对 Codex 和 Kimi Code 均为“未确认”。本次核对两家官方 Subagent/Agent 定义文档后，确认两者都没有 per-Agent Hooks 字段，Hooks 都在全局配置；区别在于证据强度：Kimi 的 frontmatter 字段表是穷举的且未知字段被忽略，可确认缺省；Codex 的可选键列表用“such as”举例、非穷举，因此保留未确认状态但补足全局 Hooks 说明。

## 修正

- `agent-hooks` 矩阵 Kimi Code 列从“未确认”更新为“无独立字段；Hooks 在全局 `config.toml`”，证据状态由“未确认”变为“官方确认”。
- `agent-hooks` 矩阵 Codex 列从“未确认”更新为“未确认独立字段；Hooks 为全局 `/hooks`”，仍为“未确认”，但记录了全局 Hooks 入口与文档已列出的 per-Agent 键。
- Kimi frontmatter 仅支持 `name`、`description`、`whenToUse`、`override`、`model_preference`、`tools`、`disallowedTools`、`subagents`；未知字段被忽略，Hooks 只在 `config.toml` 全局配置，可在子 Agent 完成等节点触发。
- Codex 自定义 Agent 文档列出 `model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers`、`skills.config` 等键，未列独立 Hooks；Hooks 由全局 `/hooks`、config.toml `[hooks]` 管理（当前仅 command 执行）。
- 详情页跨产品事实与 Codex、Kimi 行为说明同步更新。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [Agent 独立 Hooks 详情](../docs/capabilities/subagents/agent-hooks.md)

## 证据版本

- Kimi Code 官方仓库 `efac96c8a95a`，`docs/zh/customization/agents.md`（frontmatter 字段表与“未知字段会被忽略”）。
- Codex 官方 Subagents 文档 `https://developers.openai.com/codex/subagents`（自定义 Agent 必填与可选键列表）。
