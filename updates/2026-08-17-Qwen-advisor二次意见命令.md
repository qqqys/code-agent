# Qwen Code `/advisor` 会话二次意见命令

Qwen Code 官方仓库在 2026-08-17 合入提交 `18c9763f46ce`（PR #7567，issue #6542 Advisor 提案的 Phase 1），新增内置 `/advisor` Slash 命令：以工具全部移除的只读旁路单轮查询，请审查模型对当前对话给出结构化的二次意见。最新 Release 为 v0.21.13（2026-08-17T02:11Z 发布），早于该提交，标注为"合入 main 尚未发布"。

## 修正

- `cmd-collaboration`（多模型或多代理模式）矩阵 Qwen Code 列由 "`/arena` · `/batch` · `/coordinate`（v0.21.11 起）" 更新为 "`/advisor`（条件：合入 main 尚未发布） · `/arena` · `/batch` · `/coordinate`（v0.21.11 起）"。该字段的"本页包含"已列出"第二模型顾问"，Claude Code `/advisor` 也记录在此，故并入现有字段，不新增能力字段。
- 详情的 Qwen Code 记录：命令新增 `/advisor [focus]`；执行行为补充只读旁路查询（`runForkedAgent`，NO_TOOLS）、`/advisor · <model>` 标题框与 Verdict/Risks/Missing evidence/Recommendation 四节结构化输出（缺节报 `Advisor returned invalid structured output.`）；参数补充可选 `<focus>`（与 `/btw` 同一长度上限，超限报 `Focus too long`）；可用模式补充交互式与 ACP（源码 `supportedModes` 为 `interactive`/`acp`，纯非交互不加载）；保存范围补充审查结果不进入主对话历史、内置 `/advisor` 在 ACP 不写入会话记录（同名用户命令仍记录）、`advisorModel` 写入 `settings.json`；条件补充提交与 PR、发布状态、至多最近 40 条消息上下文、禁用模型回退、`advisorModel` 解析与回退规则、阻塞输入与 busy/空历史/未配置模型守卫、同名命令遮蔽。跨产品事实新增一条。
- `docs/01-Slash命令矩阵.md`：对照表"多模型或多代理协作模式"行 Qwen 列新增 `/advisor`（条件）；Qwen 硬编码命令目录由 66 个更新为 68 个主命令定义，补入 `/advisor` 与本目录此前漏记的 `/curator`（2026-08-01 提交 `e569734a1e12`，PR #7846 注册），并新增 `/advisor` 行为说明段；来源清单新增 4 条 `/advisor` 链接与 curator 提交链接。
- 来源坐标：新增 `qwen-advisor-commit`（提交 `18c9763f46ce95eb64f46038941618c4ea50dcce`）、`qwen-advisor-docs`（该提交时点的 `docs/users/features/commands.md`）、`qwen-advisor-source`（该提交时点的 `packages/cli/src/ui/commands/advisor-command.ts`）、`qwen-advisor-settings`（该提交时点的 `docs/users/configuration/settings.md`）。
- `docs/09-版本与证据.md`：Qwen Code 核对日期更新为 2026-08-17，主要材料新增 `/advisor` 条目；官方来源表命令列新增 `/advisor` 提交、命令文档、命令源码与 `advisorModel` 设置文档链接。
- 能力字段总数不变（110 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/capabilities/commands/`（`cmd-collaboration.md` 内容更新，其余页面仅日期或无变化）。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [多模型或多代理模式详情](../docs/capabilities/commands/cmd-collaboration.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 提交 `18c9763f46ce95eb64f46038941618c4ea50dcce`（`feat(cli): add /advisor command for second-opinion conversation review (#7567)`，2026-08-17T08:54:18Z 合入 main，作者 yiliang114）：新增 `packages/cli/src/ui/commands/advisor-command.ts` 与 `AdvisorMessage.tsx`，在 `BuiltinCommandLoader.ts` 注册 `advisorCommand`，`settingsSchema.ts` 增加 `advisorModel`，`nonInteractiveCliCommands.ts` 为 `advisor` 转发 abort 信号，`acp-integration/session/Session.ts` 增加录制门禁。
- 该提交处的 `packages/cli/src/ui/commands/advisor-command.ts`：命令名 `advisor`、无别名、`CommandKind.BUILT_IN`、`supportedModes: ['interactive', 'acp']`；`focus` 超过 `BTW_MAX_INPUT_LENGTH` 报 `Focus too long`；`getHistoryForForkWindow()` 为空报 `No conversation context available for /advisor`；未配置模型报 `No model configured.`；`runForkedAgent` 传 `jsonSchema: ADVISOR_SCHEMA`（verdict/risks/missingEvidence/recommendation 四字段均必填非空）、`disableModelFallbacks: true`，注释写明工具始终移除（NO_TOOLS）；交互模式设 `Consulting advisor...` pending 并阻塞，busy 守卫报 `Another operation is in progress...`，完成后以 `MessageType.ADVISOR` 渲染（含解析后的模型名），aborted 时静默返回。
- 该提交处的 `docs/users/features/commands.md` 第 1.7 节 "Second Opinion (`/advisor`)"：`/advisor` 审查上方对话、`/advisor <focus>` 聚焦特定疑虑；旁路单轮 API 调用携带至多最近 40 条消息；审查模型不能执行工具；主对话不被打断、审查只显示给用户；四节固定输出；与 fire-and-forget 的 `/btw` 不同，`/advisor` 阻塞输入直到返回；默认主模型，`advisorModel` 可路由到其他 Provider 的模型；未知模型名不预校验，Provider 拒绝时报错，仅不可解析的别名（如未配置 fast 模型时的 `fast`）回退主模型；不使用已配置的模型回退；支持模式为 Interactive 与 ACP；`advisorModel` 无 `/model` flag 对应项。
- 该提交处的 `docs/users/configuration/settings.md`：`advisorModel`（string，默认 `""`），留空用主模型，建议不低于主模型能力，设置后最近对话记录会发送到该模型（即使属于其他 Provider）。
- 该提交处的 `packages/cli/src/nonInteractiveCliCommands.ts` 与 `services/commandUtils.ts`：非交互路径经 `getCommandsForMode(executionMode)` 按 `supportedModes` 过滤，`advisor` 不在 `non_interactive` 可用列表；`ResolvedSlashCommandInfo` 注释说明按解析后的命令判断录制门禁，用户定义的同名 `advisor` 命令遮蔽内置命令。
- 该提交处的 `acp-integration/session/Session.ts` diff：仅当解析结果为 `CommandKind.BUILT_IN` 且名称为 `advisor` 时跳过用户消息与结果的会话记录（R18-6），同名自定义命令保留记录。
- 该提交处的 `packages/cli/src/services/BuiltinCommandLoader.ts`：`allDefinitions` 含 68 个主命令对象（含条件命令 `/workflows`、`/dream`、`/forget`、`/trust`、`/lsp`），较此前目录记录的 66 个多出 `/advisor`（本提交新增）与 `/curator`（2026-08-01 提交 `e569734a1e127d253433409c91926373afda6b47`、PR #7846 新增，本目录此前漏记）；`aboutCommand` 定义 `name: 'status'`、`altNames: ['about']`。
- 发布状态：最新 Release 为 v0.21.13（2026-08-17T02:11:15Z），早于提交合入时间；v0.21.12-preview.5（2026-08-16）与其他可见 Release 均未提及 `/advisor`。
- 其余四家：Claude Code `/advisor`（第二模型顾问）已在本字段记录；Codex、Kimi Code、Qoder CLI 无同类"会话二次意见"命令，本次未改动这四家的记录。
