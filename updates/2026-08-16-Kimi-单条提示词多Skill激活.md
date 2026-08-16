# Kimi Code 单条提示词多 Skill 激活

Kimi Code 官方仓库在 2026-08-16 合入提交 `61591bce09f4`（PR #2934）与 `44a6c70e6676`（PR #2935），实现单条提示词多 Skill 激活：TUI 提示词编辑器识别一条消息中的多个 `/skill:` token（空白字符后、包括后续行行首，带补全、高亮与去重），引擎侧 `promptWithSkills` 把全部激活打包进同一条用户消息，与提示词作为同一轮次运行，一次 `/undo` 整体撤销。changeset `.changeset/inline-multi-skill-tui.md`（`@moonshot-ai/kimi-code` minor）与 `.changeset/inline-multi-skill-sdk.md`（`@moonshot-ai/kimi-code-sdk` minor，node-sdk 新增 `session.promptWithSkills`、仅 v2 引擎）均未被 Release 消费（最新 Release 为 0.36.1，2026-08-14 发布），标注为"合入 main 尚未发布"。官方交互文档 `docs/zh/guides/interaction.md` 与 `docs/en/guides/interaction.md` 随 TUI 提交同步更新。

## 修正

- `extension-skills`（Agent Skills）矩阵 Kimi Code 列由 "`/skill:<name>` · `.kimi-code/skills/`" 更新为 "`/skill:<name>` · `.kimi-code/skills/` · 条件：单条提示词多 Skill 激活（main 分支，尚未发布）"；详情的入口补充空白字符后（含后续行行首）输入 `/` 打开仅含 Skill 的补全菜单、可在一条提示词中插入多个 Skill 引用；行为补充多个 Skill 引用经 `promptWithSkills` 打包进同一条用户消息、渲染的 Skill 块排在用户内容之前、与提示词作为同一轮次运行、一次 `/undo` 整体撤销、提示词原文保持不变、会话标题与 fork 提示词摘录只取用户原文不含 Skill 块；条件补充 Skill 引用只按名称激活不携带参数（参数仍是单独 `/skill:<name> args` 调用时的概念）、空白字符后的 `/` 只补全 Skill、内置命令和 plugin 命令仍须放在输入开头、两个提交的 SHA 与合入日期、最新 Release 0.36.1 未包含、引擎侧仅 v2 引擎实现且空提示词/空 Skill 列表/未知 Skill 在提交前整体拒绝、node-sdk 在 v1 引擎报错。证据状态改为"条件项"。跨产品事实新增一条。
- 来源坐标：新增 `kimi-multi-skill-engine-commit`（提交 `61591bce09f4467aa1664cb8ecb6aa6904b7accd`）、`kimi-multi-skill-tui-commit`（提交 `44a6c70e66762ea9e122f8dceae16dc759086a7c`）、`kimi-multi-skill-docs`（后一提交时点的 `docs/zh/guides/interaction.md`）、`kimi-multi-skill-changeset`（后一提交时点的 `.changeset/inline-multi-skill-tui.md`）。
- `docs/09-版本与证据.md`：Kimi Code 主要材料新增单条提示词多 Skill 激活条目（核对日期维持 2026-08-16）；官方来源表扩展系统列新增交互文档与两个提交共三个链接。
- 能力字段总数不变（110 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/05-扩展系统矩阵.md` 与 `docs/capabilities/extensions/`（`extension-skills.md` 内容更新）。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [Agent Skills 详情](../docs/capabilities/extensions/extension-skills.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 提交 `61591bce09f4467aa1664cb8ecb6aa6904b7accd`（`feat(agent-core-v2): bundle multiple skill activations into one prompt submission (#2934)`，2026-08-16T16:09:18Z 合入 main）：新增 `IAgentSkillService.promptWithSkills`，一个或多个 Skill 激活在提交前整体验证（未知 Skill、空提示词或空 Skill 列表拒绝且无副作用），全部激活打包进提示词自己的用户消息——渲染的 Skill 块排在调用方内容之前，每个激活的元数据写入 prompt origin 新增的 `skillActivations` 字段（`BundledSkillActivation`）；打包消息按构造即为一个轮次和一个 undo 锚点，提交 Hook 每次提交只触发一次，`skill.activated` 仍按 Skill 逐个触发，resume 从 prompt origin 重建逐 Skill 视图；`turn.started.prompt`、会话标题摘录来源与 fork 的 `lastPrompt` 只取调用方自身内容、排除引擎前置的 Skill 块；协议层新增 `UserPromptOrigin.skillActivations` 与 `BundledSkillActivation`，klient 暴露 `agentSkillContract.promptWithSkills`，node-sdk 新增 `session.promptWithSkills`——v2 引擎实现、已弃用的 v1 引擎显式拒绝。
- 该提交处的 `.changeset/inline-multi-skill-sdk.md` 原文："Add `session.promptWithSkills(input, skills)` to submit one prompt with one or more skill activations bundled into the same user message — one turn, one undo unit (v2 engine only; rejects on the v1 engine)."，级别 minor。
- Kimi Code 提交 `44a6c70e66762ea9e122f8dceae16dc759086a7c`（`feat(kimi-code): recognize multiple inline skill activations in one prompt (#2935)`，2026-08-16T16:09:18Z 合入 main）：TUI 提示词编辑器识别提示词中任意空白字符后（含后续行）的 `/skill:` token，带补全、高亮与去重；经 `session.promptWithSkills` 提交，使提示词与全部激活作为单个分组轮次（一个 undo 单元）落地；Ctrl-S 不提升分组项或含 Skill token 的草稿；Enter 可接受行内补全而不提交；激活同时穿过 cache-hints 与 `/btw` 命令；修改文件含 `apps/kimi-code/src/tui/utils/inline-skill-tokens.ts`、`apps/kimi-code/src/tui/commands/dispatch.ts`、`apps/kimi-code/src/tui/controllers/editor-keyboard.ts` 与 `docs/zh/guides/interaction.md`、`docs/en/guides/interaction.md`。
- 该提交处的 `.changeset/inline-multi-skill-tui.md` 原文："Activate multiple skills in a single prompt. Type `/` after whitespace to insert a skill token; all referenced skills run with the prompt as one turn (and undo as one unit)."，级别 minor；同提交另有 `.changeset/inline-slash-trigger-pi-tui.md`（`@moonshot-ai/pi-tui` patch）："Add an opt-in inline slash autocomplete trigger that fires after whitespace mid-input and at the start of subsequent editor lines."
- 该提交处的 `docs/zh/guides/interaction.md` 原文："在较长的提示词中，也可以在空白字符后（包括后续行的行首）输入 `/` 打开仅包含 Skill 的补全菜单。这样可以在一条提示词里引用多个 Skill：Kimi Code 会将它们一起激活，与提示词作为同一轮次运行（一次 `/undo` 即可整体撤销），提示词原文保持不变。提示词中的 Skill 引用不携带参数——只按名称激活；参数仍是单独以 `/skill:<name> args` 调用时的概念。内置命令和 plugin 命令仍需放在输入开头。"
- 发布状态：最新 Release 为 0.36.1（2026-08-14T12:53:36Z），两个提交（2026-08-16T16:09:18Z）晚于该发布，changeset 未被 Release 消费；PR #2934 与 #2935 均解决 issue #1736（提示词编辑器此前每条提示词只识别单个显式 Skill 激活）。
- 其余四家：Claude Code、Codex、Qwen Code、Qoder CLI 在本仓库已固定 SHA 的官方 Skills/命令文档中没有描述等价的单条提示词多 Skill 显式激活行为，本次未改动这四家的记录。
