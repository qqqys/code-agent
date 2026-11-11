# Subagent · Agent 单独选模型：Kimi 2.5.0 移除 `[secondary_model] force` 与 `model` 参数的隐含 `"primary"`，单条目池隐藏模型选择

日期：2026-11-11
能力字段：`agent-model`（Subagent · Agent 单独选模型，主字段）；同批修正 `agent-effort`（Subagent · Agent 推理强度）中由同一变更作废的两处旧记法

## 本次改动

本次从官方来源快照里 Kimi Code 已发布到 `@moonshot-ai/kimi-code@2.5.3`、而矩阵的 Kimi 证据仍停在 2.1.1／main `c9f01f07388a`（2026-10-10）这一坐标落差出发，复核 2.2.0–2.5.3 的官方更新日志，定位到 **2.5.0（2026-11-04T11:52:02Z 发布、`prerelease: false`）经 PR #4418（合并提交 `e3efbb9d3b2241412edfe9b704fc33b09a4c2054`）改写了 `[secondary_model]` 模型池的两条核心规则**，而矩阵的 `agent-model` 单元格与详情页此前把 `force = true` 和保留值 `"primary"` 记为现行能力，已成错误结论，故本次改正。

**一手证据**（统一固定到 2.5.0 标签提交 `41c341434ae24e45bfe0f2232ec11b80531ac717`；GitHub compare 确认 PR #4418 的合并提交 `e3efbb9` 是该标签的祖先、落后 0 个提交，即 2.5.0 是首个包含该变更的 Release）：

- `docs/zh/configuration/config-files.md`（47,824 字节）的 `[secondary_model]` 节字段表只剩 `default_model`、`models`、`default_effort` 三键，`force` 不再出现；正文逐字写 “原来的 `force` 字段已移除：单独一行 `default_model` 已经能把所有 subagent 固定到同一个模型。仍设置了 `force` 的配置会在加载时给出警告，该字段被忽略。”，约束列表与「配置错误直接报错」的 warning 框都删去了原先与 `force` 相关的条目。
- `model` 参数的取值规则逐字改为 “只接受池中别名。main agent 自己的模型不是隐含选项：如果希望难的子任务能用主模型，需要把主模型的别名显式写进模型池。”，并写 “`default_model` 与 `models` 都未配置时该参数不存在，subagent 继承调用方模型；池中只有一个条目时同样不提供该参数。”、“传入的值不是池中别名时，本次派生报错并列出可选值。”；`primary` 降级为「不能作为池 key 的保留字」，不再是 `model` 的合法取值。
- 模型选择的启用条件逐字为 “subagent 只会运行在模型池列出的模型上。单独一行 `default_model`（或只有一个条目的 `models` 表）会把所有 subagent 固定到该模型。池中有两个及以上条目时启用模型选择：`Agent` / `AgentSwarm` 工具会获得 `model` 参数……”；解析顺序仍是显式 `model` → `default_model` 两级，绑定池别名不继承调用方 Thinking 档位、依次回落 `default_effort` → `[thinking].enabled=false` → 所绑定模型 `default_effort` → 全局 `[thinking].effort` → `support_efforts` 中间项的规则不变。
- `apps/kimi-code/CHANGELOG.md`（固定到同一标签提交）2.5.0 段 #4418 两条逐字为 “Remove `[secondary_model] force`, which is now ignored with a warning: a lone `default_model` still pins every subagent to that model.” 与 “Stop offering Agent and AgentSwarm subagents an implicit `primary` choice that ran them on your current model and thinking level, and hide the model choice entirely when `[secondary_model]` names only one model; list two or more aliases in `[secondary_model.models]` to choose again, noting a listed main model uses `default_effort` and does not follow `/model` switches.”。同标签的 `docs/zh/release-notes/changelog.md` 尚未同步 2.5.0 段、最新只到 2.4.1，故版本级证据取自 `apps/kimi-code/CHANGELOG.md`。
- 旁证：`docs/zh/customization/agents.md` 字段表仍只列 `name`、`description`、`whenToUse`、`override`、`tools`、`disallowedTools`、`subagents`，并逐字写 “其他 Agent 工具的字段（如 Claude Code 的 `model`、OpenCode 的 `mode`）同样会被忽略”；`docs/zh/reference/slash-commands.md` 的 `/secondary-model`（别名 `/subagent-model`）「随时可用」列为「是」、无任何实验开关门禁。两页均与 2.5.0 标签提交一致。

**据此作废的旧结论**：`agent-model` 的 Kimi 单元格原写 “`[secondary_model]` 池别名 · 保留值 `"primary"` · `force = true` 固定到 `default_model`”，详情页原写 `force` 为字段表第四键、`force` 不能与 `models` 池同用、`model` 接受保留值 `"primary"` 且 `"primary"` 连模型带档位继承调用方、配置错误 warning 框含 `force` 条目——以上全部按 2.5.0 改正。

**同批修正 `agent-effort`**（同一 PR #4418 波及，非另一独立单元）：该字段 Kimi 详情原引用 “无论派生绑定到池中哪个条目（或 force 固定的模型）都生效” 与 “绑定保留值 `"primary"` 则连模型带档位一起继承调用方” 两句，2.5.0 的 config-files 已把前者改为 “无论派生绑定到池中哪个条目都生效”、并因移除 `"primary"` 而使后者失效，故删去「（或 force 固定的模型）」与 `"primary"` 继承句，并补记 2026-11-11 复核坐标。`agent-effort` 的矩阵结论（`[secondary_model] default_effort` 节级档位、`[models.<alias>.overrides] default_effort` 变体、Agent 文件无 effort 字段）未变。

**其余四家 `agent-model` 结论不变**：Claude Code（main `CHANGELOG.md` 至 v2.1.322 无 `CLAUDE_CODE_SUBAGENT_MODEL`/`_FORCE`/`CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` 相关条目）、Codex（rust-v0.167.0 发布说明无 subagent 模型条目）、Qwen Code（v0.27.1 变更日志无 `exploreModel`/`modelGrades`/subagent 模型条目）与 Qoder CLI（Release Notes 无 Subagent 模型选择条目）经更新日志／发布说明扫描均未发现变化，单元格、详情与坐标保持原样。

**本次看到但按「一个研究单元」原则未处理、留待后续**：

- Kimi `/secondary-model` 在 `cmd-model`（Slash 命令 · 选择模型）详情里仍记 “仅在 `secondary-model` 实验功能启用时可见（`KIMI_CODE_EXPERIMENTAL_SECONDARY_MODEL=1` 或 master flag）”，该实验开关已随 0.42.0（2026-09-09）移除、2.5.0 的 slash-commands 也标「随时可用＝是」，属早于本次 2.5.0 变更、且落在 commands 类的独立过期记法，建议后续单独修正。
- Kimi 2.4.0 的 `/import-sessions`（导入 Claude Code／Codex 会话）与 2.5.0 的 `--environment <id>`（SSH／Docker／自定义命令执行环境）是两项尚未入库的新能力，各自需要跨五家核对后再决定新增字段或并入现有字段。

## 同步范围

- `site/data.js`：`updatedAt` 推到 2026-11-11；`agent-model` 行的 Kimi 单元格改写为「`model` 只接受池中别名、主模型非隐含选项、单条目池固定全部 subagent 且不提供 `model` 参数、`models` ≥2 个别名才启用按次选择、`force` 与 `"primary"` 自 2.5.0 移除」；新增来源 `kimi-secondary-model-config-250`、`kimi-secondary-model-250-commit`、`kimi-app-changelog-250` 共 3 个，GitHub 证据固定到 2.5.0 标签提交 `41c341434ae24e45bfe0f2232ec11b80531ac717` 与 PR #4418 合并提交 `e3efbb9d3b2241412edfe9b704fc33b09a4c2054`；既有来源与其余行未改，能力字段总数维持 116。
- `site/subagent-details.js`：`agent-model` 的 Kimi `behavior` 重写（字段表三键、`force` 移除并告警忽略、`model` 只接受池别名、单条目池隐藏选择、解析顺序与 Thinking 回落不变、配置错误 warning 框删去 `force` 条目、时间线补 0.36.0 引入 `force` 与 2.5.0 移除两条），跨产品事实第 3 条（固定开关现仅 Claude）与第 5 条（模型池时间线补 2.5.0）改写，Kimi `sources` 用 3 个 2.5.0 来源替换原 `kimi-subagent-config`；`agent-effort` 的 Kimi `behavior` 删去「（或 force 固定的模型）」与 `"primary"` 继承句、补 2026-11-11 复核坐标，Kimi `sources` 增列 `kimi-secondary-model-config-250` 与 `kimi-secondary-model-250-commit`。
- `docs/02-Subagent能力矩阵.md`：手工矩阵的「Agent 单独选模型」行 Kimi 单元格同步改写，「来源」清单新增 2.5.0 config-files、PR #4418 提交与 2.5.0 更新日志三条链接。
- `docs/capabilities/subagents/agent-model.md`、`docs/capabilities/subagents/agent-effort.md` 及其余能力详情、`docs/03`–`docs/08` 矩阵：由 `npm run generate` 重新生成；除 `agent-model`、`agent-effort` 两页外，其余文件仅「核对日期」一行随 `updatedAt` 变为 2026-11-11。
- `docs/09-版本与证据.md`：Kimi「核对坐标」行日期推到 2026-11-11，主要材料追加一段「Subagent 模型池 `force` 与 `primary` 移除（2026-11-11 复核…）」记录（含逐字引文、标签提交、compare 结论、作废旧记法与四家不变说明）；「官方来源」表 Kimi 的「Subagent 或 Agent」列追加 2.5.0 config-files、PR #4418 提交与 2.5.0 更新日志三条链接。其余四家核对日期维持 2026-11-08。
- `README.md`：核对日期推到 2026-11-11；能力字段总数维持 116、Subagent 详情维持 22 个。
- 校验：`npm run generate` 八个生成器全部通过（Subagent 22 篇），`npm test` 三项校验通过——`Validated 116 details × 5 products.`、`Validated links in 286 Markdown files.`、`Validated matrix render, detail schemas, links, and CSS.`。
