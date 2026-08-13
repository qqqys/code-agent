# Kimi Code Subagent 模型池（0.36.0，`/secondary-model`）

Kimi Code 0.36.0（2026-08-13 发布）包含 PR #2700（提交 `c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860`，2026-08-13T04:29Z 合入 main）：把原先的单一次主力模型实验替换为声明式 Subagent 模型池。默认 v2 引擎读取 `[secondary_model]` 的 `default_model`、`[secondary_model.models]`（别名 → 描述池）与 `force`；派生时显式传入的 `model` 参数接受池别名或保留值 `"primary"`，解析顺序为显式 `model` → `default_model`。Agent frontmatter 的 `model_preference` 字段改为仅由旧版 `agent-core` 引擎（`KIMI_CODE_LEGACY_FLAG=1`）读取，默认 v2 引擎忽略。命令 `/secondary_model` 改名为 `/secondary-model` 并新增别名 `/subagent-model`，打开模型选择器并写入 `[secondary_model] default_model`。整项功能仍由 `secondary-model` 实验门控（`KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 master flag `KIMI_CODE_EXPERIMENTAL_FLAG=1`），关闭时池配置不生效、子 Agent 继承调用方模型。本次更新 `agent-model`（Agent 单独选模型）与 `cmd-model`（选择模型）字段的 Kimi Code 记录。

## 修正

- `agent-model` 字段 Kimi Code 矩阵结论由 "`model_preference`: `primary` · `secondary`（实验性）" 改为 "`model`：`[secondary_model]` 池别名 · `primary`（实验性）"；详情补入：`default_model`/`models`/`force` 键语义（`force = true` 移除 `model` 参数并固定全部子 Agent）、解析顺序、`"primary"` 连模型带 thinking 档位继承而池别名按全局 `[thinking]` → 所绑定模型默认 effort 解析、遗留配方键 `model` 的兼容读取、配置错误在会话创建/恢复/fork 时直接失败的校验行为、v2 与旧版引擎差异。
- `cmd-model` 字段 Kimi Code 矩阵结论由 "`/model` · `/secondary_model`" 改为 "`/model` · `/secondary-model`（别名 `/subagent-model`）"；详情更新参数、保存范围（写入 config.toml，对下一次子 Agent 派生生效、无需重启会话）与可见条件（仅实验功能启用时出现）。
- Kimi Code 公共条件（影响全部 22 个 Subagent 详情页的“条件与边界”）由 `model_preference` 表述更新为模型池实验门控与引擎差异。
- Kimi Code Agent 作用域表述由“显式文件、项目、额外目录、用户、内置五级来源”更正为“显式文件、项目、额外目录、用户、Plugin、内置六级来源”：重新固定到的 Agents 文档与其前一固定版本均为六级，原记录漏掉 Plugin。
- `agent-effort` 字段 Kimi Code 注记同步为模型池语义（池别名不携带显式 thinking 档位）；`agent-nesting` 条件同步更新，并确认官方 Agents 文档页（2026-08-13 固定提交）仍写内置 coder 可继续派发嵌套子 Agent，文档未同步的既有结论保持成立。
- `docs/01-Slash命令矩阵.md`：对照表“选择模型”行 Kimi Code 列更新；Kimi Code 命令目录以 `/secondary-model` 替换 `/secondary_model` 并新增 `/subagent-model`；Kimi 段落补充改名说明；来源列表新增模型池提交与 0.36.0 发布说明，Slash 命令链接重新固定到 `c9bfe8b2c831`。
- `docs/02-Subagent能力矩阵.md`：“Agent 单独选模型”行 Kimi Code 列更新；来源列表新增模型池配置文档、提交与 0.36.0 发布说明，Agents 链接重新固定。
- `docs/09-版本与证据.md`：Kimi Code 核对日期更新为 2026-08-13，主要材料补入 Subagent 模型池；官方来源表 Slash commands 与 Agents 链接固定到新 SHA，Subagent 列新增模型池配置、提交与 0.36.0 发布说明。
- `site/data.js` 来源：`kimi-commands`、`kimi-agents`、`kimi-subagent-config` 重新固定到提交 `c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860`；新增 `kimi-subagent-model-pool-commit`、`kimi-v036-release`。
- `npm run generate` 重新生成 `docs/capabilities/`（命令与 Subagent 等 110 页，Kimi 相关来源链接与条件随数据更新）；`npm test` 全部通过。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [Agent 单独选模型详情](../docs/capabilities/subagents/agent-model.md)
- [选择模型命令详情](../docs/capabilities/commands/cmd-model.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 提交 `c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860`（PR #2700 `feat: replace the secondary-model experiment with a declarative subagent model pool (#2700)`，2026-08-13T04:29:03Z 出现在 main 快照）：95 个文件变化，含 `.changeset/subagent-model-pool.md`、`.changeset/remove-secondary-model-sdk.md`、`packages/agent-core-v2/src/session/subagent/` 校验与 schema、`apps/kimi-code/src/tui/commands/` 命令注册、`docs/{en,zh}` 文档更新。
- 0.36.0 发布说明（2026-08-13T05:50:17Z 发布）Minor Changes 原文列出 “Configurable Subagent Model Pool: Added via PR #2700 behind the `secondary-model` experiment”，并说明 `/secondary-model` 命令与 `[secondary_model]` 配置、独立 `model` 键作为兜底默认仍受支持。
- `docs/zh/configuration/config-files.md`（固定到该提交）原文：“派生时按以下顺序解析子 Agent 的模型：工具调用显式传入的 `model` → `default_model`”；“配置 `[secondary_model.models]` 时（`default_model`）必填，且必须是其中的 key；单独写下它……等价于只含它一个条目的模型池”；“`force`……把所有子 Agent 固定到 `default_model`：不再提供 `model` 参数……必须配置 `default_model`……且不能与 `[secondary_model.models]` 同时使用”；“`default_model` 缺失、不是池中 key，或池中 key 无法解析到已配置的 `[models]` 条目时，会话的创建、恢复（resume）与 fork 都会在启动时直接失败”；“别名 `primary` 是保留字……不能作为池中 key”；“旧版 `agent-core` 引擎会忽略 `default_model` 和 `[secondary_model.models]`”；“模型池键之前位于 `[subagent]` 下；遗留的 `[subagent] default_model` 或 `[subagent.models]` 表不再生效”（开发期键，未随任何 Release 发布）。
- `docs/zh/reference/slash-commands.md`（固定到该提交）：`/secondary-model` 行，别名 `/subagent-model`，描述“选择子 Agent 的默认模型（写入 `[secondary_model] default_model`……）。在次主力模型实验功能启用时可见”；命令表不再含下划线写法 `/secondary_model`。
- `docs/zh/customization/agents.md`（固定到该提交）：`model_preference` 字段说明原文“仅使用 `KIMI_CODE_LEGACY_FLAG=1` 选择的旧版 `agent-core` 引擎读取该字段；默认的 v2 引擎会忽略”；作用域优先级原文“显式（`--agent-file`）> 项目 > 额外 > 用户 > Plugin > 内置”。
- `docs/zh/configuration/env-vars.md`（固定到该提交）：`KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL` “在包括交互式 TUI 在内的所有启动方式下启用实验性的次主力模型功能；master `KIMI_CODE_EXPERIMENTAL_FLAG=1` 也会启用本功能”；“`KIMI_SECONDARY_MODEL` 和 `KIMI_SECONDARY_EFFORT` 仅由旧版引擎读取，默认引擎会忽略它们”。
- 其他产品本次无同类变化：Claude Code、Codex、Qwen Code、Qoder CLI 的 `agent-model` 与 `cmd-model` 记录不受影响。
