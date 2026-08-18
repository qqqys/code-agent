# 目标管理字段：Claude Code `/goal` 自动清除与后台检查，Kimi Code 目标 4000 字符上限

Claude Code v2.1.234（2026-08-17 发布）官方更新日志为 `/goal` 记录了两条新行为：回合因不可恢复错误（撤销认证、余额用尽、上下文溢出等）终止时，`/goal` 自动清除并提示，不再保持生效；后台任务让目标等待超过 30 分钟时主动检查这些任务而不是无限等待，`CLAUDE_CODE_GOAL_CHECKIN_MINUTES=0` 可关闭检查。Kimi Code 0.37.0（2026-08-18 发布）的发布说明（PR #2928，提交 `d96cd0377026`）为 `/goal` 目标新增长度上限：单条目标不超过 4000 字符，TUI 输入时页脚实时提示当前长度/上限，提交超限报错并建议把长内容写入文件后引用文件路径，已输入内容在编辑框为空且无替换面板时回填编辑框；v1 与 v2 引擎创建目标时同样校验并抛 `GOAL_OBJECTIVE_TOO_LONG`。官方 Slash 命令文档尚未同步该限制。矩阵 `cmd-goal`（目标管理）字段此前只记录五家的 `/goal` 入口与子命令，本次把两条新行为补入 Claude Code 与 Kimi Code 记录；Codex、Qwen Code、Qoder CLI 核对无变化。0.37.0 同时发布了此前记录为"合入 main 尚未发布"的 `/fork` 恢复命令打印、单条提示词多 Skill 激活和 token 计数台账持久化，这些状态属于其他能力字段，本次不改动。

## 修正

- `cmd-goal`（目标管理）矩阵 Kimi Code 列由 "`/goal`" 更新为 "`/goal` · 条件：0.37.0 起单条目标不超过 4000 字符"。
- `cmd-goal` 详情：Claude Code 条件补充 v2.1.234 起 `/goal` 在不可恢复错误终止回合时自动清除、后台任务等待超 30 分钟主动检查及 `CLAUDE_CODE_GOAL_CHECKIN_MINUTES=0` 关闭开关，来源新增固定到提交 SHA 的 v2.1.234 更新日志；Kimi Code 条件补充 0.37.0 起 4000 字符上限的 TUI 实时提示、超时报错与输入回填、v1/v2 引擎 `GOAL_OBJECTIVE_TOO_LONG` 校验和官方文档未同步状态，来源新增固定到提交 SHA 的限制提交与 0.37.0 发布说明；跨产品事实新增两条对应条目。
- `docs/01-Slash命令矩阵.md`：目标行 Kimi Code 列按上述结论更新。
- `docs/09-版本与证据.md`：Claude Code 核对日期更新为 2026-08-18，主要材料补充 `/goal` 自动清除与后台任务检查条目；Kimi Code 主要材料补充 `/goal` 目标长度上限条目；官方来源表 Claude Code 命令列新增 v2.1.234 更新日志链接，Kimi Code 命令列新增限制提交与 0.37.0 发布说明链接。
- `site/data.js` 新增来源 `claude-goal-v234`（v2.1.234 更新日志，固定提交 SHA `354757e5b2d9`）、`kimi-goal-limit-commit`（提交 SHA `d96cd037702637305422222e985139e51ff83c8c`）与 `kimi-v037-release`（0.37.0 发布说明）。
- 能力字段总数不变（110 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/capabilities/commands/cmd-goal.md`。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [目标管理详情](../docs/capabilities/commands/cmd-goal.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Claude Code 官方更新日志 v2.1.234（提交 `354757e5b2d9`，2026-08-17T20:20:52Z；Release v2.1.234，2026-08-17T20:20:58Z）原文："`/goal` now clears itself with a notice when a turn dies on an unrecoverable error (e.g. revoked auth, an exhausted credit balance, or a context overflow) instead of staying armed" 与 "`/goal`: when background tasks keep a goal waiting for 30+ minutes, Claude now checks in on them instead of waiting indefinitely (set `CLAUDE_CODE_GOAL_CHECKIN_MINUTES=0` to opt out)"。
- Kimi Code 官方 Release `@moonshot-ai/kimi-code@0.37.0`（2026-08-18T11:23:11Z 发布）Patch Changes 包含 PR #2928（提交 `d96cd037702637305422222e985139e51ff83c8c`），发布说明原文："Warn when a typed `/goal` objective exceeds the 4000-character limit, and keep the input if it is rejected."。
- Kimi Code 提交 `d96cd037702637305422222e985139e51ff83c8c`：`apps/kimi-code/src/tui/commands/goal.ts` 定义 `MAX_GOAL_OBJECTIVE_LENGTH = 4000`，`parseGoalCommand` 与 `parseNextGoalCommand` 超限时返回 `restoreInput: true` 与报错 "Goal objective is too long (max 4000 characters). Put long content in a file and reference the file path."；`apps/kimi-code/src/tui/controllers/editor-keyboard.ts` 在输入疑似 `/goal` 时经 `goalObjectiveLengthWarning` 更新页脚实时提示（当前长度/上限）；`apps/kimi-code/src/tui/goal-queue-store.ts` 归一化目标时超限抛 `GOAL_OBJECTIVE_TOO_LONG`；`packages/agent-core/src/agent/goal/index.ts`（v1）与 `packages/agent-core-v2/src/agent/goal/goalService.ts`（v2）创建目标时同样校验；输入回填由 `canRestoreSubmittedInput` 守护（编辑框为空且未挂载替换面板）。changeset 为 `.changeset/goal-objective-length-warning.md` 与 `.changeset/goal-objective-too-long-message.md`。
- Kimi Code 官方 Slash 命令文档（main 分支 docs/zh/reference/slash-commands.md，2026-08-18 抓取）`/goal` 小节未列出字符上限；文档中唯一的字符限制是 `/title` 的 200 字符。
- Kimi Code 0.37.0 发布说明同时包含此前已记录的提交 `6b72345f8bb0`（`/fork` 恢复命令打印）、`44a6c70e6676`（单条提示词多 Skill 激活）与 `ee564e5ec90a`（token 计数台账持久化），对应字段（`cmd-fork`、`session-branch`、`extension-skills`、`session-context-usage`）的"合入 main 尚未发布"状态本次未改动，留待后续研究单元核对。
