# 目标管理字段：Claude Code v2.1.239 `/goal` 恢复与检查放宽，Qoder CLI `/goal` 确认

Claude Code v2.1.239（2026-08-21 发布）官方更新日志为 `/goal` 记录了两条行为：经 `claude --resume` 选择列表恢复会话时恢复其活动目标；对长时后台工作的重复检查放宽间隔（先等待 30 分钟，然后 1 小时，之后每 2 小时一次），不再每 30 分钟重复。Qoder CLI 官方 Slash 命令参考（`cli/slash-reference`）“Work Modes”一节列出 `/goal`（Manage session goals），并有独立 Goal Command Reference 页：`/goal [description] [--turns <N>]` 创建或更新目标，不带子命令等价于 `/goal status`；`status`、`pause`、`resume`、`take`、`clear` 子命令；`--turns` 须为正整数、非法取值忽略、未设时适用内置默认上限，达到上限自动暂停且 `/goal resume` 授予全新轮数预算；状态为 `active`/`paused`/`complete`，状态字段含 `ownerSessionId`；目标随会话保存，进程在 active 状态意外退出后下次启动自动降级为 paused；更新其他会话持有的目标必须先 `/goal take`；`/goal` 从不改变权限模式。矩阵 `cmd-goal`（目标管理）字段此前把 Qoder CLI 记为“无对应命令、未确认”，本次改为官方确认并补全记录；Claude Code 记录补入 v2.1.239 两条行为；Codex、Qwen Code、Kimi Code 核对无变化。

## 修正

- `cmd-goal`（目标管理）矩阵 Qoder CLI 列由 "—" 更新为 "`/goal [description] [--turns <N>]` · `/goal status|pause|resume|take|clear`"。
- `cmd-goal` 详情：Claude Code 保存范围补充 v2.1.239 起 `--resume` 选择列表恢复会话时恢复活动目标，条件补充重复检查间隔放宽为 30 分钟、1 小时、之后每 2 小时，来源新增固定到提交 SHA 的 v2.1.239 更新日志；Qoder CLI 由 `unconfirmed` 改为完整命令记录（子命令、`--turns` 参数、状态机、随会话保存与崩溃降级、`/goal take` 所有权、权限模式无关），来源为官方命令参考与 Goal Command Reference；跨产品事实首条改为五家都提供 `/goal`，新增 v2.1.239 与 Qoder 两条事实，删除“Qoder CLI 当前命令目录没有 `/goal`”。
- `docs/01-Slash命令矩阵.md`：目标行 Qoder CLI 列按上述结论更新；Qoder CLI 命令目录补入 `/goal`，目录说明补记 2026-08-23 核对情况；来源新增 Goal Command Reference 链接。
- `docs/09-版本与证据.md`：Claude Code 核对日期更新为 2026-08-23，`/goal` 材料补充 v2.1.239 检查放宽与恢复行为；Qoder CLI 核对日期更新为 2026-08-23，主要材料补充 `/goal` 目标管理条目；官方来源表 Claude Code 命令列新增 v2.1.239 更新日志链接，Qoder CLI 命令列新增 Goal Command Reference 链接。
- `site/data.js` 新增来源 `claude-goal-v239`（v2.1.239 更新日志，固定提交 SHA `16440d0f6ee8`）与 `qoder-goal-reference`（Goal Command Reference）。
- 能力字段总数不变（112 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/capabilities/commands/cmd-goal.md`。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [目标管理详情](../docs/capabilities/commands/cmd-goal.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Claude Code 官方更新日志 v2.1.239（提交 `16440d0f6ee8`，2026-08-21T19:54:17Z；Release v2.1.239，2026-08-21T19:54:23Z）原文："`/goal`: resuming a session from the `claude --resume` picker now restores its active goal" 与 "`/goal`: repeat check-ins on long-running background work now back off (30 min, then 1 h, then every 2 h) instead of repeating every 30 minutes"（核对用文本取自提交 `45bdfa96ca41` 的 CHANGELOG.md，两条位于 2.1.239 小节）。
- Claude Code 官方更新日志 v2.1.240 与 v2.1.241（2026-08-22、2026-08-23 发布）仅 “Bug fixes and reliability improvements”，无新增 `/goal` 或其他能力条目。
- Qoder CLI 官方 Slash 命令参考（2026-08-23 抓取）“Work Modes”一节列出 `/goal`；Goal Command Reference（https://docs.qoder.com/cli/goal-reference ，2026-08-23 抓取）列出子命令表、`--turns <N>` 参数、`active`/`paused`/`complete` 状态、`objective`/`status`/`maxTurns`/`turnsUsed`/`timeUsedSeconds`/`ownerSessionId`/`planWasActive` 字段、"Goal never changes the Permission Mode"、"Resuming with /goal resume grants a fresh turn budget to continue."、"automatically downgrade to paused on the next startup" 与 `/goal take` 所有权说明；文档未列出非交互退出码。
- Codex、Qwen Code、Kimi Code 的 `/goal` 记录本次未变化：Codex main 分支近期提交（记忆整合、内容类型标注等）与 Qwen Code、Kimi Code 近期提交均未涉及 `/goal` 行为。
