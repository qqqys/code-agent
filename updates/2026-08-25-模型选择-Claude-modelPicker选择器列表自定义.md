# 模型选择与切换：Claude Code v2.1.243 `modelPicker` 选择器列表定制

Claude Code 官方更新日志在 v2.1.243（2026-08-24T23:40:26Z 发布，更新日志固定到提交 `8b6ef81f636a`）宣布新增 `modelPicker` 设置：以有序、带标签的模型列表定制 `/model` 选择器，可追加到内置列表之后或整体替换。官方设置参考与模型配置文档页已同步记录完整配置形态、作用域与行为（2026-08-25 核对）。矩阵 `model-switch`（模型选择与切换）字段 Claude 列此前未记录该设置，本次补录。其余四家无同类变化：Codex、Qwen Code、Kimi Code、Qoder CLI 保持原有结论，均未确认同类选择器列表定制设置。

## 修正

- `model-switch`（模型选择与切换）矩阵 Claude Code 列更新为 "`/model` · `--model` · `ANTHROPIC_DEFAULT_MODEL` 新会话默认模型（v2.1.236 起）· `modelPicker` 定制选择器列表（v2.1.243 起）"。证据状态维持"官方确认"。其余四家矩阵结论不变。
- Claude Code 详情（入口与配置、支持范围、具体行为、会话与作用域、持久化位置、自动化用法、安全与管理、条件与边界）补录：`modelPicker` 是带 `options` 行数组和可选 `replaceBuiltInOptions` 布尔值的对象；每行 `model` 必填且按原样取值，接受 `--model` 接受的全部写法（`opus` 等别名、Anthropic 模型 ID、Amazon Bedrock、Google Cloud Vertex/Agent Platform、Microsoft Foundry 或 LLM 网关的 Provider 格式 ID），`label` 与 `description` 可选；默认把自定义行追加在内置列表之后并跳过内置列表已覆盖的模型，`replaceBuiltInOptions: true` 只显示自定义行、**Default** 行与当前会话模型行，隐藏内置列表、`availableModels` 追加行、网关发现模型与 `ANTHROPIC_CUSTOM_MODEL_OPTION`；只从 Managed settings、`--settings` 与用户设置读取，忽略项目和 local 设置，三者中最高优先级且设置该键的来源提供整套列表且不合并两个来源；`availableModels` 允许清单仍作用于这些行，无法提供的行被丢弃、暂不可选的行灰显并附原因、全部失效时回退按允许清单过滤的内置列表，无法解析的行被丢弃；标签只改变选择器显示，不改变实际运行的模型；文档页标注需 v2.1.242 及以上，官方 Release 中不存在 v2.1.242，更新日志在 v2.1.243 宣布。
- 跨产品事实新增第 4 条，记录 `modelPicker` 定制能力与其余四家未确认同类设置。
- `site/data.js`：`updatedAt` 更新为 2026-08-25；新增来源 `claude-settings-reference`（设置参考）与 `claude-model-picker-v243`（更新日志固定到提交 `8b6ef81f636a`）。
- `docs/09-版本与证据.md`：Claude Code 核对日期由 2026-08-23 更新为 2026-08-25，主要材料新增 `modelPicker` 选择器列表定制条目；官方来源表 Claude Code"模型与 Provider"列新增 Settings reference 与 v2.1.243 更新日志链接。
- `README.md` 核对日期更新为 2026-08-25。能力字段总数不变（112 个）。
- `npm run generate` 重新生成 `docs/08-模型与认证矩阵.md` 与 `docs/capabilities/models/`；`npm test` 通过。

## 影响页面

- [模型与认证矩阵](../docs/08-模型与认证矩阵.md)
- [模型选择与切换详情](../docs/capabilities/models/model-switch.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Claude Code v2.1.243 更新日志（提交 `8b6ef81f636a`，Release v2.1.243 于 2026-08-24T23:40:26Z 发布）原文："Added `modelPicker` setting: curate the `/model` picker with an ordered, labeled list of models (any id spelling, including Vertex/Bedrock ids), appended to or replacing the built-in lineup"。
- Claude Code 官方设置参考 `modelPicker` 条目（2026-08-25 核对）：类型为 "object with an `options` array of rows and an optional `replaceBuiltInOptions` Boolean"，默认未设置时选择器显示内置列表；作用域 "User or managed"，"Claude Code reads the key from managed settings, `--settings`, and user settings, and ignores it in project and local settings so a repository you clone can't relabel the picker. The highest of those three that sets the key supplies the whole lineup, and Claude Code never combines lineups from two sources."；"Requires Claude Code v2.1.242 or later."；每行 `model` "is taken verbatim, so it accepts anything `--model` accepts: an alias such as `opus`, an Anthropic model ID, or a provider-format ID for Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, or an LLM gateway"；`options` 行按写入顺序显示、灰显行移到底部，未写 `label` 时用内置名称或模型 ID 作标题、未写 `description` 时显示通用第二行；`replaceBuiltInOptions` 默认 `false`，为 `true` 时 "show only these rows, **Default**, and a row for the model the session is already using"，并隐藏内置列表、`availableModels` 条目追加行、网关发现（gateway discovery）模型与 `ANTHROPIC_CUSTOM_MODEL_OPTION`，为 `false` 时跳过内置列表已覆盖的模型；"A label changes what the picker shows, not which model Claude Code runs."；`availableModels` 允许清单仍作用于这些行："Dropped: a row Claude Code can't serve, such as a retired model or a model your organization has no access to"、"Grayed out: a row you can't select yet, shown with the reason"、"No row survives: Claude Code keeps the built-in lineup, filtered by the allowlist as usual"；"Claude Code drops a row it can't parse and keeps the rest."。
- Claude Code 官方设置页（2026-08-25 核对）："`modelPicker` holds one ordered list of rows plus a replace flag, so Claude Code never merges rows from two sources. It takes the whole value from the highest of managed settings, `--settings`, and user settings that defines it, and ignores the key in project and local settings. Requires Claude Code v2.1.242 or later."
- Claude Code 官方模型配置页（2026-08-25 核对）：`modelPicker` 用于 "To list several models instead, in your own order and under labels you choose"，其条目说明该行列表替换内置列表时选择器保留哪些行；完整模型 ID 的自定义条目列在内置条目之后，`modelPicker` 追加行再列在其后。
- 发布状态核对：GitHub 官方 Release 不存在 v2.1.242（对应 Release 页返回 404），更新日志也无 2.1.242 条目；v2.1.240 与 v2.1.241 条目均为 "Bug fixes and reliability improvements"，`modelPicker` 由 v2.1.243 条目宣布。
