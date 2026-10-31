# Agent 推理强度：Claude Code v2.1.316 新增 `CLAUDE_CODE_SUBAGENT_EFFORT`（没有其他来源指定档位时决定 Subagent 跑哪一档，取代此前直接继承会话 effort；官方环境变量页与 Subagents 页尚未收录），并补录会话 effort 五级解析顺序与 Haiku 5.5 的档位支持

本次只处理 `agent-effort`（Agent 推理强度）一个能力字段，能力字段总数维持 115。这一轮带来一条一手确认的新能力（Claude 的派生 Agent 全局默认档位环境变量）、一处旧记录作废（Claude 详情此前写「官方环境变量文档没有 Subagent 专用的 effort 环境变量，官方也未列出 Subagent 全局默认 effort 设置」，v2.1.316 起前半句已不成立）、两处同页证据的更正（模型支持范围漏了 Haiku 5.5，会话 effort 解析顺序此前被压成三级而官方是五级），以及其余四家复核坐标推进而结论不变。

主线是「派生 Agent 的默认档位由谁决定」。此前五家里只有 Codex（`agents.default_subagent_reasoning_effort`）与 Kimi（`[secondary_model] default_effort`）能在 Agent 定义之外统一设置派生档位，Claude 只能靠 frontmatter `effort` 或 v2.1.292 的每次调用参数逐个指定、其余情况一律继承会话 effort。v2.1.316 之后 Claude 也有了这一层，但它目前只有更新日志一处记录。

## Claude Code：`CLAUDE_CODE_SUBAGENT_EFFORT` 的确认与未确认边界

官方 [CHANGELOG](https://github.com/anthropics/claude-code/blob/80c6959d28c4c30ecd14fc1cdf172f19d9adad81/CHANGELOG.md)（提交 `80c6959d28c4c30ecd14fc1cdf172f19d9adad81`，2026-10-31T01:01:10Z；Release v2.1.316 发布于 2026-10-31T01:01:35Z）的 `## 2.1.316` 段逐字为：

> Added `CLAUDE_CODE_SUBAGENT_EFFORT` to set the effort level subagents run at when nothing else names one, instead of inheriting the session's

这句给出两条可核查事实：一是它决定 Subagent 跑的档位，二是它只在「没有其他来源指定档位」时生效，且明确取代此前「继承会话 effort」的兜底行为。这与 v2.1.296 的 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL`（只统一 workflow agent 的模型）属同一类：先出现在更新日志，官方文档尚未跟进。

官方文档未同步已逐页核实（均为 2026-10-31 以 `.md` 形式完整下载后全文检索，不依赖摘要）：

- [环境变量页](https://code.claude.com/docs/en/env-vars.md)（187,070 字节）没有 `CLAUDE_CODE_SUBAGENT_EFFORT` 条目。名称含 `SUBAGENT` 的行只有 `CLAUDE_CODE_FORK_SUBAGENT`、`CLAUDE_CODE_FORWARD_SUBAGENT_TEXT`、`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`、`CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION`、`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`、`CLAUDE_CODE_SUBAGENT_MODEL`、`CLAUDE_CODE_SUBAGENT_MODEL_FORCE`、`CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` 与已退役的 `CLAUDE_SUBAGENT_BG_SHELL_MAX_MS`。
- [Subagents 页](https://code.claude.com/docs/en/sub-agents.md)（116,225 字节）的 `### Choose an effort level` 小节全文没有提到该变量，仍只给三级顺序（见下）；frontmatter 字段表的 `effort` 行也仍只写 `CLAUDE_CODE_EFFORT_LEVEL` 一个环境变量。
- [模型配置页](https://code.claude.com/docs/en/model-config.md)（129,830 字节）的 `### Adjust effort level` 小节没有 Subagent 专用变量。

因此记为未确认的是：取值集合（是否就是 `low`/`medium`/`high`/`xhigh`/`max`）、是否也接受 `auto` 或 `unset`、是否受 `maxEffortLevel` 与组织 effort 上限约束、是否覆盖 agent team teammates 与 workflow agent、以及它与 `CLAUDE_CODE_EFFORT_LEVEL` 的相对优先级（更新日志只写 “when nothing else names one”，没有点名环境变量）。矩阵与详情都按「官方确认变量存在、细节未确认」记录，与 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` 的处理方式一致。

## Claude Code：同页更正两处此前记浅的 effort 事实

`### Choose an effort level` 小节现已收录 v2.1.292 的每次调用参数（2026-10-06 记录时官方两页都还只写 `model` 参数，2026-10-10 已改正详情，本次把 docs/09 里遗留的旧说法一并改正）：

> When you ask Claude to run a non-fork subagent at a specific effort level, it can also pass an `effort` parameter for that invocation. The parameter overrides the `effort` field and stays in effect when the subagent is resumed. The `CLAUDE_CODE_EFFORT_LEVEL` environment variable takes precedence over both. The per-invocation parameter requires Claude Code v2.1.292 or later.

模型支持范围表新增 Haiku 5.5（此前记录漏了它，Haiku 5.5 随 v2.1.293 上线）：

| Model | Levels |
| :- | :- |
| Fable 5.1 and Fable 5 | `low`, `medium`, `high`, `xhigh`, `max` |
| Opus 5.5, Sonnet 5.5, Haiku 5.5, Opus 5, Sonnet 5, Opus 4.8, and Opus 4.7 | `low`, `medium`, `high`, `xhigh`, `max` |
| Opus 4.6 and Sonnet 4.6 | `low`, `medium`, `high`, `max` |

同页另有 “Models not listed here do not support effort”。

会话 effort 解析顺序此前被压成「`CLAUDE_CODE_EFFORT_LEVEL`/`--effort`/`/effort` → `modelSettings` 或 `effortLevel` → 模型默认」三级，官方实际是五级且把「会话内选择」与「`--effort`」分开：

> Claude Code resolves the session's effort level in this order, taking the first that applies:
>
> 1. The `CLAUDE_CODE_EFFORT_LEVEL` environment variable
> 2. A level you pick in the session, such as with `/effort`, the `/model` picker, or `applyFlagSettings()`
> 3. Launching with `--effort`
> 4. Your settings: the level you saved for the model or an `effortLevel` key, with the precedence between them and across settings files stated at `modelSettings`
> 5. The model's default effort: `high` on every model that supports effort, except that Opus 5.5, Sonnet 5.5, and Haiku 5.5 default to `medium` and Opus 4.7 defaults to `xhigh`. If your organization sets a default effort level for its organization default model, that level is the default when you run that model.

这一层是 Subagent 继承的来源，因此属于本字段范围。同页另记 Opus 5.5 起用户设置文件的顶层 `effortLevel` 不再计入第 4 级，而项目、local、managed 设置或 `--settings` 传入的仍对所有模型生效——即第 4 级的实际取值随模型而变。

`CLAUDE_CODE_EFFORT_LEVEL` 的取值也补上 `unset`（此前只记 `auto`）：

> Set the effort level for supported models. Values: `low`, `medium`, `high`, `xhigh`, or `max`. Available levels depend on the model. Takes precedence over `--effort`, `/effort`, and the `modelSettings` and `effortLevel` settings. A `maxEffortLevel` cap still applies. Set it to `auto` or `unset` to have Claude Code send no effort level, so that the API applies its own default for the model.

环境变量页开头另有一句总口径：“`--model` and `/model` override `ANTHROPIC_MODEL`, while `CLAUDE_CODE_EFFORT_LEVEL` overrides `--effort` and `/effort`.”；模型配置页写明 `CLAUDE_CODE_EFFORT_LEVEL` 与持久化的 `effortLevel` 都不接受 `ultracode`。

## 其余四家：坐标推进，结论不变

- **Codex**：[Subagents 页](https://learn.chatgpt.com/docs/agent-configuration/subagents)（以 `.md` 抓取，22,907 字节）的继承规则逐字未变——“If you don't configure a subagent model or `model_reasoning_effort`, the subagent inherits the parent agent's model and reasoning effort. If an explicit spawn request or an `[agents]` default selects a model without an explicit or configured reasoning effort, the subagent uses that model's default reasoning effort.”；`[agents]` 键表的 `agents.default_subagent_reasoning_effort` 行仍是 “Set the default reasoning effort for spawned agents.”，且 “Explicit spawn values override `agents.default_subagent_model` and `agents.default_subagent_reasoning_effort`.”。本次补录该页 `### Reasoning effort (model_reasoning_effort)` 小节此前没记的逐档使用场景与 “Higher reasoning effort increases response time and token usage, but it can improve quality for complex work.”，并确认官方仍未给出每次调用 effort 的旗标名或 API 参数名（该点维持未确认）。核对日期最新 Release 为 rust-v0.166.0（2026-10-29T19:47:53Z）。
- **Qwen Code**：[`docs/users/features/sub-agents.md`](https://github.com/QwenLM/qwen-code/blob/fe30b5daaa6ae3bef16370393200204c4a82c28e/docs/users/features/sub-agents.md)（main 提交 `fe30b5daaa6ae3bef16370393200204c4a82c28e`，2026-10-31T14:07:48Z，41,363 字节）仍把 `effort` 列为尚未落地的 Claude Code 兼容字段，逐字为 “The remaining CC frontmatter fields — `effort`, `skills`, `initialPrompt`, `memory`, `isolation` — are documented in the declarative-agent design doc and land in follow-up PRs once the prerequisite infrastructure exists (`effort` needs a model-layer parameter; `memory` needs a scoped memory subsystem; `--agent` CLI flag enables `initialPrompt`; etc.)”。全页没有 Subagent 级推理强度的配置键或环境变量。矩阵结论维持「未确认独立字段」。
- **Kimi Code**：[`docs/zh/configuration/config-files.md`](https://github.com/MoonshotAI/kimi-code/blob/a2afdbc7d1fa0737d45d5780cc6c2bd38e477b55/docs/zh/configuration/config-files.md)（main 提交 `a2afdbc7d1fa0737d45d5780cc6c2bd38e477b55`，2026-10-30T11:15:24Z，47,522 字节）的 `[secondary_model]` 节仍写 “subagent 默认继承 main agent 正在运行的模型”“模型池始终可用，无需任何开启动作；未配置 `[secondary_model]` 时，subagent 继承调用方模型”，`default_effort` 行仍是 “每次派生的 subagent 绑定的 Thinking 档位，优先于所绑定模型自带的 `default_effort`”，`overrides` 可覆盖字段清单与「不接受身份或路由字段、不接受 registry 管理的 `upgrade` 元数据」也未变。核对日期最新 Release 为 `@moonshot-ai/kimi-code@2.4.1`（2026-10-30T09:50:16Z）。矩阵结论不变。
- **Qoder CLI**：[Subagent 页](https://docs.qoder.com/cli/subagent)的 `effort` 行仍是 “No | `low`, `medium`, `high`, `xhigh`, `max`, or positive integer | Reasoning effort or budget.”，仍没有省略时的继承说明，settings.json 覆盖仍只含启用状态、模型配置、运行限制、工具允许列表与追加的 MCP 服务器。本次补录 `--agents` 临时注入小节此前没记的一句：“The current JSON schema supports `description`, `prompt`, `tools`, `disallowedTools`, `mcpServers`, `model`, `effort`, `color`, `maxTurns`, `initialPrompt`, `skills`, and `permissionMode`. Use Markdown configuration when you need `timeoutMins`, `temperature`, `hooks`, `memory`, `background`, or `isolation`.”，即 JSON 形式也能带 `effort`，而 `temperature` 一类字段只能写在 Markdown 配置里。全页仍没有派生 Agent 的全局默认推理强度键。

## 修正

- `agent-effort`（Agent 推理强度）矩阵 Claude Code 列由 “`effort`；Agent 工具调用参数 `effort`（v2.1.292）” 更新为 “`effort`；Agent 工具调用参数 `effort`（v2.1.292）；v2.1.316 另加派生默认 `CLAUDE_CODE_SUBAGENT_EFFORT`，官方环境变量页与 Subagents 页尚未收录”。证据状态维持“官方确认”（变量本身由官方更新日志确认；取值与优先级在详情里明确记为未确认）。Codex、Qwen Code、Kimi Code、Qoder CLI 四家矩阵结论不变。
- Claude Code 详情（具体行为）：**作废**“官方环境变量文档没有 Subagent 专用的 effort 环境变量，官方也未列出 Subagent 全局默认 effort 设置”的前半句，改为 `CLAUDE_CODE_SUBAGENT_EFFORT` 的逐字更新日志文本、三个官方页面未收录的核实结果（含字节数与环境变量页全部 `SUBAGENT` 行清单）与五项未确认；模型支持范围补入 Haiku 5.5 与 “Models not listed here do not support effort”；会话 effort 解析顺序由三级改为官方五级逐字文本，并补 Opus 5.5 起用户设置顶层 `effortLevel` 失效的例外；`CLAUDE_CODE_EFFORT_LEVEL` 补 `unset` 取值、页首总口径与「不接受 `ultracode`」；补录 v2.1.292 每次调用参数的官方 Choose an effort level 逐字段落（含“只用于非 fork Subagent”“恢复后继续生效”“需 v2.1.292 及以上”）。
- Codex 详情（具体行为）补录 2026-10-31 的复核坐标（页面字节数）、继承与默认规则逐字文本、三条控制途径、Reasoning effort 小节的逐档场景与 `[agents]` 键表两行逐字文本；结论不变。
- Qwen Code 详情（具体行为）补录复核提交 `fe30b5daaa6a`、文件字节数与整段逐字文本（含 `isolation`、`memory`、`initialPrompt` 三项前置条件）；结论仍为“未确认独立字段”。
- Kimi Code 详情（具体行为）补录复核提交 `a2afdbc7d1fa`、文件字节数与三处逐字复核结果；结论不变。
- Qoder CLI 详情（具体行为）补录 `--agents` JSON schema 支持 `effort` 的逐字句与「`temperature` 等只能写 Markdown 配置」的边界；结论不变。
- 跨产品事实由 6 条增至 8 条：新增 `CLAUDE_CODE_SUBAGENT_EFFORT` 一条与「派生 Agent 全局默认档位只有三家可配（Claude、Codex、Kimi），Qwen 与 Qoder 没有对应键」一条。本页包含与本页不包含不变。
- `site/data.js`：新增来源 `claude-v21316-subagent-effort-changelog`（固定到提交 `80c6959d28c4c30ecd14fc1cdf172f19d9adad81`），并加入 `agent-effort` 的 Claude 来源列表。`updatedAt` 由 2026-10-29 改为 2026-10-31。共享来源 `qwen-agents`、`kimi-subagent-config`、`kimi-agents-c9f01f0`、`codex-agents`、`claude-env-vars`、`claude-model-config`、`claude-agents` 的固定坐标不改：这些来源被多个能力字段共用，本次只复核了 effort 相关内容，没有逐字段重新核对它们承载的其他结论，因此把本次复核用的新提交号写进详情正文与 `docs/02` 来源清单，而不是移动共享来源的锚点。
- `docs/02-Subagent能力矩阵.md`：“Agent 单独设推理强度”行 Claude Code 列同步更新；来源清单新增 3 条（Claude v2.1.316 更新日志、Qwen main `fe30b5daaa6a` 复核、Kimi main `a2afdbc7d1fa` 复核）。
- `docs/09-版本与证据.md`：五家核对日期统一更新为 2026-10-31；Claude Code 主要材料的“Subagent 推理强度”条目整段重写（复核日期改为 2026-10-31、模型支持范围补 Haiku 5.5、每次调用参数改为官方已收录并给出逐字段落、新增 `CLAUDE_CODE_SUBAGENT_EFFORT` 与其五项未确认、会话 effort 顺序改为五级、`CLAUDE_CODE_EFFORT_LEVEL` 补 `unset`）。
- `README.md` 核对日期更新为 2026-10-31；能力字段总数不变（115 个），不改。
- `npm run generate` 重新生成 `docs/capabilities/subagents/agent-effort.md` 与其余详情页的核对日期；`npm test` 通过（115 个能力 × 5 个产品、276 个 Markdown 文件的本地链接、矩阵与详情页渲染与 CSS 解析）。

## 未处理项

- 本次抓取 Subagents 页时顺带看到 `autoCompactWindow` 已进入官方 frontmatter：字段表行为 “Lower the [auto-compact window](#subagent-auto-compact-window) for this subagent to a token count from `100000` to `1000000`. Requires Claude Code v2.1.296 or later”，「CLI-defined subagents」的 Frontmatter fields 清单也列出了它。这与 `session-compress`（手动压缩）字段现记的「官方 Subagents 页未同步」以及 docs/09 里 2026-10-09 那句「官方 Subagents 页的 frontmatter 字段表在核对日期仍未列出该键……取值范围记为未确认」都已不符，官方现已收录并给出范围与版本条件。同页 `#subagent-auto-compact-window` 一节仍写 “If you set `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, the subagent uses that variable's window instead and the field has no effect”，与 v2.1.312 更新日志的「可下调该变量的窗口」仍不一致，另有一句此前没记的排错入口 “run `claude --debug` in your shell and search the debug log for `invalid autoCompactWindow`”。这些属 `session-compress` 字段，本次未改动，留给后续单元。
- v2.1.316 的 `CLAUDE_CODE_DISABLE_ULTRATHINK` 与 v2.1.311 的 “Changed `ultrathink` in the interactive terminal to run its turn at xhigh effort on Opus 5.5, Sonnet 5.5, Haiku 5.5 and Fable 5.1 through Anthropic's API”：`ultrathink` 关键字属提示词关键字与会话级 effort 的交互，不属 Agent 级字段，留待 `model-effort` 或提示词相关字段单独处理。
- v2.1.314 的 “Fixed sessions failing turn after turn with "Invalid effort level" when an organization's admin caps a model's effort: Claude Code now lowers the effort, retries, and says which level it uses”：属组织 effort 上限的失败行为，与 `maxEffortLevel` 同处，留待后续单元。
- v2.1.314 的 `permissions.blockWritesOutsideWorkingDirectories`：属权限与沙箱字段。
- Codex 近期提交（#58457 跨 backend 会话切换、#58446 TUI 图片路径可点击、#58436 交互控件与内联可视化样式）与 Qwen Code 近期提交（#16001 review 重锚定与 actionlint、#11486 精确版本更新、#12513 workspace 会话实时状态快照批量下发）都不涉及本字段，未处理。

## 影响页面

- [Subagent 能力矩阵](../docs/02-Subagent能力矩阵.md)
- [Agent 推理强度详情](../docs/capabilities/subagents/agent-effort.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Claude Code 官方更新日志 v2.1.316（固定到提交 `80c6959d28c4c30ecd14fc1cdf172f19d9adad81`，提交时间 2026-10-31T01:01:10Z）：逐字 “Added `CLAUDE_CODE_SUBAGENT_EFFORT` to set the effort level subagents run at when nothing else names one, instead of inheriting the session's”。官方 Release v2.1.316 发布于 2026-10-31T01:01:35Z。
- Claude Code 官方环境变量文档（2026-10-31 以 `.md` 完整下载，187,070 字节）：无 `CLAUDE_CODE_SUBAGENT_EFFORT`；`CLAUDE_CODE_EFFORT_LEVEL` 逐字含 “Set it to `auto` or `unset` to have Claude Code send no effort level”；页首总口径 “`--model` and `/model` override `ANTHROPIC_MODEL`, while `CLAUDE_CODE_EFFORT_LEVEL` overrides `--effort` and `/effort`.”。
- Claude Code 官方 Subagents 文档（2026-10-31 以 `.md` 完整下载，116,225 字节）：`### Choose an effort level` 全文与 frontmatter 字段表 `effort` 行均无 `CLAUDE_CODE_SUBAGENT_EFFORT`；CLI 定义 Subagent 的 frontmatter 字段清单为 `description`、`tools`、`disallowedTools`、`model`、`permissionMode`、`mcpServers`、`hooks`、`maxTurns`、`autoCompactWindow`、`skills`、`initialPrompt`、`memory`、`effort`、`background`、`omitClaudeMd`、`isolation`。
- Claude Code 官方模型配置文档（2026-10-31 以 `.md` 完整下载，129,830 字节）：`### Adjust effort level` 的模型档位表（含 Haiku 5.5）、“Models not listed here do not support effort”、五级会话 effort 解析顺序、Opus 5.5 的顶层 `effortLevel` 例外、“The persisted `effortLevel` setting and the `CLAUDE_CODE_EFFORT_LEVEL` environment variable don't accept `ultracode`.”。
- Codex 官方 Subagents 文档（2026-10-31 抓取，22,907 字节）：继承句、三条控制途径、`### Reasoning effort (model_reasoning_effort)` 小节逐档场景、`[agents]` 键表与 “Explicit spawn values override …” 一句。核对日期官方最新 Release 为 rust-v0.166.0（2026-10-29T19:47:53Z）。
- Qwen Code 官方 Subagent 文档（main 提交 `fe30b5daaa6ae3bef16370393200204c4a82c28e`，2026-10-31T14:07:48Z，41,363 字节）：`effort` 仍属尚未落地的兼容字段，逐字原因 “`effort` needs a model-layer parameter”。核对日期官方最新 Release 为 v0.26.4（2026-10-29T14:29:11Z）。
- Kimi Code 官方配置文档（main 提交 `a2afdbc7d1fa0737d45d5780cc6c2bd38e477b55`，2026-10-30T11:15:24Z，47,522 字节）：`[secondary_model]` 节与 `[models."<alias>".overrides]` 可覆盖字段清单逐字未变。核对日期官方最新 Release 为 `@moonshot-ai/kimi-code@2.4.1`（2026-10-30T09:50:16Z）。
- Qoder CLI 官方 Subagent 文档（2026-10-31 抓取，HTML 1,288,804 字节，最终地址 `https://docs.qoder.com/cli/subagent`）：`effort` 字段行、`--agents` JSON schema 句、settings.json 覆盖范围三处逐字核对。
