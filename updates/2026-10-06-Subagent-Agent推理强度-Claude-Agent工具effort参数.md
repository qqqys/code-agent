# Agent 推理强度：Claude Code v2.1.292 Agent 工具新增 `effort` 参数，并补录 effort 上限与优先级

Claude Code v2.1.292 更新日志（提交 `fbe20e00e285`）逐字写 “Added an `effort` parameter to the Agent tool, so Claude runs a sub-agent at the effort level you ask for”，即在定义文件 frontmatter 的 `effort` 之外，委派方还能在单次 Agent 工具调用里指定该 Subagent 的 effort。此前矩阵 `agent-effort`（Agent 推理强度）字段 Claude 列只记 frontmatter `effort`，没有每次调用参数。官方 Subagents 页与模型配置页当前仍只记录每次调用的 `model` 参数（“When Claude invokes a subagent, it can also pass a `model` parameter for that specific invocation”），没有对应的 `effort` 说明，因此该每次调用参数与 frontmatter、`CLAUDE_CODE_EFFORT_LEVEL`、`maxEffortLevel` 之间的优先级记为未确认。

本次同时补录同一批官方页面上此前缺失的 effort 边界：官方 Subagents 页把 frontmatter `effort` 逐字定义为 “Effort level when this subagent is active. Overrides the session effort level, but not the `CLAUDE_CODE_EFFORT_LEVEL` environment variable. Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model”，明确了环境变量优先于 Agent 级 `effort`；官方模型配置页把 Skill 与 Subagent frontmatter 的 `effort` 归为同一机制，并写明 `maxEffortLevel` 或组织 effort 上限仍然限制其实际运行级别；官方设置参考给出 `maxEffortLevel` 的取值、默认值、多作用域取最低值规则、`modelSettings` 单模型条目与 v2.1.267 版本条件；官方模型配置页给出各模型支持的档位与不支持档位的回退规则。

Codex 侧补录一项 main 分支变化：官方仓库于 2026-10-06 合入 “Record resolved model and reasoning effort in sub-agent activity”（PR #51463，提交 `b0a6b8d86f45`），Subagent activity 条目新增可空的 `model` 与 `reasoning_effort`，v2 多代理 spawn 在子 Agent 启动前捕获启动配置、按模型元数据解析对外报告的 effort 而不改动子 Agent 自身配置的 effort。该提交晚于当前最新 Release（rust-v0.161.0-alpha.13.1，2026-10-06T05:27:02Z），尚未发布，官方文档未记录。

其余三家复核后结论不变：Qwen Code 官方 Subagent 文档仍把 `effort` 列为尚未落地的 Claude Code 兼容字段，逐字原因为 “`effort` needs a model-layer parameter”，已落地的兼容字段表只含 `permissionMode`、`maxTurns`、`color`、`mcpServers`、`hooks`；Kimi Code 官方 Agent 文档的 frontmatter 字段表仍无 effort 或 reasoning 配置项，全文也没有出现 `effort` 一词；Qoder CLI 官方 Subagent 页的 `effort` 行仍为取值 `low`、`medium`、`high`、`xhigh`、`max` 或正整数、含义 “Reasoning effort or budget.”，且 settings.json 覆盖 schema 不含 effort 键。三家矩阵结论保持不变。

## 修正

- `agent-effort`（Agent 推理强度）矩阵 Claude Code 列由 “`effort`” 更新为 “`effort`；Agent 工具调用参数 `effort`（v2.1.292）”。证据状态维持“官方确认”。Codex、Qwen Code、Kimi Code、Qoder CLI 四家矩阵结论不变。
- Claude Code 详情（具体行为）补录：frontmatter `effort` 的官方逐字说明与“覆盖会话 effort、不覆盖 `CLAUDE_CODE_EFFORT_LEVEL`”的优先级；模型支持范围（Fable 5.1/Fable 5、Opus 5.5、Sonnet 5.5、Opus 5、Sonnet 5、Opus 4.8、Opus 4.7 支持 `low`/`medium`/`high`/`xhigh`/`max`，Opus 4.6 与 Sonnet 4.6 只支持 `low`/`medium`/`high`/`max`）与不支持档位的回退规则（`xhigh` 在 Opus 4.6 上按 `high` 运行）；`maxEffortLevel` 的版本条件（v2.1.267）、取值、默认未设置、多作用域取最低值、`modelSettings` 单模型条目与在 Bedrock、Google Cloud's Agent Platform、Microsoft Foundry 上同样生效；v2.1.292 Agent 工具 `effort` 参数及其优先级未确认；会话 effort 解析顺序与 `CLAUDE_CODE_EFFORT_LEVEL` 的 `auto` 取值；官方没有 Subagent 专用 effort 环境变量，也没有 Subagent 全局默认 effort 设置。
- Codex 详情（具体行为）补录：只设 `model` 的 Agent 文件保留此前解析出的 effort；main 分支起 Subagent activity 记录解析后的 `model` 与 `reasoning_effort`（可空字段、旧记录迁移为 null），v2 spawn 按模型元数据解析对外报告的 effort（测试用例把 `ultra` 报告为 `xhigh`）而不改动子 Agent 配置的 effort，提交 `b0a6b8d86f45` 合入 main 尚未发布、官方文档未记录。
- Qwen Code 详情（具体行为）补录逐字原因 “`effort` needs a model-layer parameter” 与已落地兼容字段清单；结论仍为“未确认独立字段”。
- Kimi Code 详情（具体行为）补录“全文没有出现 effort 或 reasoning 配置项，Agent 级推理强度只能由全局 `[thinking]` 与所绑定模型决定”；结论仍为“未确认独立 effort 字段”。
- Qoder CLI 详情（具体行为）补录官方字段表逐字取值与含义，并写明同表 `model`、`permissionMode` 有省略继承说明而 `effort` 行没有，settings.json 覆盖 schema 的五类内容不含 effort。
- 跨产品事实由 3 条扩为 5 条，新增 Claude Code 每次调用 `effort` 参数与 frontmatter effort 的优先级/上限边界。
- 本页包含由 4 项扩为 6 项（新增“每次调用传入的 effort”“effort 上限”，并把“继承规则”“可用取值”写全）；本页不包含的“全局推理设置”改为更准确的“会话级 effort 的设置入口”。
- `site/data.js`：新增来源 `claude-v21292-effort-changelog`（固定到提交 `fbe20e00e285`）与 `codex-subagent-effort-activity-commit`（固定到提交 `b0a6b8d86f455d3db9dd869fc1178a5fbd865e7f`）。`updatedAt` 维持 2026-10-06。
- `docs/02-Subagent能力矩阵.md`：“Agent 单独设推理强度”行 Claude Code 列同步更新；来源清单新增 Claude Code 模型配置、设置参考、环境变量、v2.1.292 更新日志与 Codex 提交链接。
- `docs/09-版本与证据.md`：Codex 核对日期由 2026-10-05 更新为 2026-10-06，主要材料的 Subagent 条目新增只设 `model` 时保留已解析 effort、2026-10-06 复核取值与 main 分支提交 `b0a6b8d86f45`；Claude Code 主要材料新增 Subagent 推理强度条目；官方来源表 Claude Code 与 Codex 的“Subagent 或 Agent”列各新增一条链接。Qwen Code、Kimi Code、Qoder CLI 核对日期不变（证据坐标未变化）。
- `README.md` 核对日期已为 2026-10-06，能力字段总数不变（114 个），不改。
- `npm run generate` 重新生成 `docs/capabilities/subagents/`；`npm test` 通过（114 个详情 × 5 个产品、241 个 Markdown 文件链接、网页渲染与 CSS 校验）。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [Agent 推理强度详情](../docs/capabilities/subagents/agent-effort.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Claude Code 官方更新日志 v2.1.292（固定到提交 `fbe20e00e2851fc01506f54f98a8f0b875af3847`，2026-10-06T18:59:09Z）：逐字 “Added an `effort` parameter to the Agent tool, so Claude runs a sub-agent at the effort level you ask for”。官方 Release v2.1.292 发布于 2026-10-06T18:59:30Z。
- Claude Code 官方 Subagents 文档（2026-10-06 核对）：frontmatter 字段表 `effort` 行逐字为 “Effort level when this subagent is active. Overrides the session effort level, but not the `CLAUDE_CODE_EFFORT_LEVEL` environment variable. Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model”；每次调用参数只记录 `model`（“When Claude invokes a subagent, it can also pass a `model` parameter for that specific invocation”），没有每次调用的 `effort`。
- Claude Code 官方模型配置文档（2026-10-06 核对）：“Skill and subagent frontmatter: set `effort` in a skill or subagent markdown file to override the effort level when that skill or subagent runs”；“Frontmatter effort applies when that skill or subagent is active, overriding the session level but not the environment variable. A `maxEffortLevel` or organization effort cap still limits the level the skill or subagent runs at.”；模型档位表与 “If you set a level the active model does not support, Claude Code falls back to the highest supported level at or below the one you set. For example, `xhigh` runs as `high` on Opus 4.6.”；会话 effort 三步解析顺序。
- Claude Code 官方设置参考（2026-10-06 核对）：`maxEffortLevel` 逐字说明覆盖 “a skill's or subagent's `effort` frontmatter”，类型 `low`/`medium`/`high`/`xhigh`/`max`（`max` 表示不设上限）、默认未设置、多作用域取最低值、可写进 `modelSettings` 单模型条目、需 v2.1.267 及以上、由客户端在每次请求前套用。
- Claude Code 官方环境变量文档（2026-10-06 核对）：`CLAUDE_CODE_EFFORT_LEVEL` 取值 `low`/`medium`/`high`/`xhigh`/`max`/`auto`，“Takes precedence over `--effort`, `/effort`, and the `modelSettings` and `effortLevel` settings. A `maxEffortLevel` cap still applies.”；文档没有名称含 `SUBAGENT` 的 effort 环境变量。
- Codex 官方仓库提交 `b0a6b8d86f455d3db9dd869fc1178a5fbd865e7f`（“Record resolved model and reasoning effort in sub-agent activity (#51463)”，作者时间 2026-10-06T18:22:08Z、合入时间 2026-10-06T19:29:40Z）：`codex-rs/protocol/src/items.rs` 的 `SubAgentActivityItem` 与 `codex-rs/protocol/src/protocol.rs` 的 `SubAgentActivityEvent` 新增 `model`、`reasoning_effort`；app-server 协议 JSON Schema、v2 `ThreadItem::SubAgentActivity`、TypeScript `subAgentActivity` 类型与 Python SDK `SubAgentActivityThreadItem` 同步为可空字段；`codex-rs/core/src/agent/control/spawn.rs` 在子 Agent 启动前捕获启动配置并为 v2 多代理 spawn 解析 `reasoning_effort`，`codex-rs/core/src/agent/api.rs` 注明该解析不改动子 Agent 配置的 effort；`codex-rs/core/src/agent/control_tests.rs` 参数化测试验证 `ultra` 报告为 `xhigh`；rollout 迁移测试验证旧记录缺字段时迁移为 null。
- Codex 官方 Subagents 文档与配置参考（2026-10-06 核对）：`agents.default_subagent_reasoning_effort` 仍为 “Set the default reasoning effort for spawned agents”，`model_reasoning_effort` 配置参考取值仍为 `minimal | low | medium | high | xhigh`，Subagent 页档位仍为 `ultra`/`max`/`xhigh`/`high`/`medium`/`low`；两页均未记录 activity 中的 `model`/`reasoning_effort` 字段。
- Codex 发布状态核对（2026-10-06）：官方 Release 最新为 `rust-v0.161.0-alpha.13.1`（2026-10-06T05:27:02Z），早于该提交合入时间；无包含该提交的 Release。
- Qwen Code 官方 Subagent 文档（固定到提交 `412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e`，并与 main 当前内容逐字核对一致，main 上该文件最近提交为 `31f6047e9d544f4f4a0fd9d46ee4a336da3853c3`，2026-09-29）：`effort` 仍属 “The remaining CC frontmatter fields — `effort`, `skills`, `initialPrompt`, `memory`, `isolation` — ... land in follow-up PRs once the prerequisite infrastructure exists (`effort` needs a model-layer parameter; ...)”。
- Kimi Code 官方 Agent 文档（固定到提交 `c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860`，并与 main 当前内容核对，main 上该文件最近提交为 `494df61ce9858c70a9f37a996614534bc9b1cd12`，2026-09-03 的文档改版）：两个版本的 frontmatter 字段表都没有 effort 或 reasoning 字段，全文没有出现 `effort` 一词。
- Qoder CLI 官方 Subagent 文档（2026-10-06 核对）：`effort` 行为 “No | `low`, `medium`, `high`, `xhigh`, `max`, or positive integer | Reasoning effort or budget.”；settings.json 覆盖段落逐字为 “Current overrides support enabled state, model configuration, runtime limits, tool allowlists, and appended MCP servers.”，不含 effort。
