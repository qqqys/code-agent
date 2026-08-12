# Qwen Code ACP 会话 Goal v3 规范运行时

Qwen Code PR #8732（提交 `05079297d26c9c42013c3699743350d1d272fac2`，2026-08-12T14:58:11Z 合入 main）让 ACP 会话改用 Goal v3 规范运行时：ACP Session 构造时绑定规范 Goal 运行时，`/goal` 不再走旧版 Goal 命令路径；Goal 状态变化经 `_meta.goalState` 下发给客户端，暂停的 Goal 在 Web Shell 与 WebUI 按 paused 状态渲染；Goal 持久化不可用（`general.chatRecording` 关闭或会话写入失败）时，查看状态与 `/goal clear` 降级返回空快照，`/goal set`、`/goal edit`、`/goal resume` 仍然失败。该提交晚于最新 CLI 发布 v0.21.11-preview.0（2026-08-12T00:55:59Z 发布），CLI 通道当前没有包含它的发行版；desktop-v0.2.1（2026-08-12T17:08:01Z）Release 说明的比较范围 `desktop-v0.2.0...desktop-v0.2.1` 列出该 PR，但 Desktop 与 CLI 为不同 Surface，分开记录。本次更新 `cmd-goal`（目标管理）字段的 Qwen Code 记录。

## 修正

- `cmd-goal` 详情 Qwen Code 的执行行为新增：ACP 会话自提交 `05079297d26c`（2026-08-12 合入 main，尚未发布）起采用 Goal v3 规范运行时。
- Qwen Code 详情的条件更新：删除“ACP 仍使用旧版 Goal 命令路径”结论；预算规则与 `goal_state` 事件的作用域表述改为“适用于标准 Headless CLI 运行”，并新增 ACP Goal v3 行为：Goal 状态变化经 `_meta.goalState` 下发，paused 状态在 Web Shell 与 WebUI 渲染；持久化不可用时查看状态与 `/goal clear` 降级返回空快照，`/goal set`、`/goal edit`、`/goal resume` 仍然失败；新到达的用户提示会打断进行中的 Goal 轮次；运行期调度的 Goal 续跑不触发 UserPromptSubmit 钩子；官方 Headless 文档页尚未同步该变化。
- 比较边界新增“ACP 会话 Goal 行为”；跨产品事实新增：Qwen Code ACP 会话自提交 `05079297d26c`（2026-08-12 合入 main，尚未发布）起采用 Goal v3 规范运行时，Goal 状态变化经 `_meta.goalState` 下发。其余四家的 `/goal` 记录不变。
- 新增来源 `qwen-goal-v3-acp`（固定到提交 SHA `05079297d26c9c42013c3699743350d1d272fac2`）。
- `docs/09-版本与证据.md`：Qwen Code 主要材料补充 ACP 会话 Goal v3 规范运行时；官方来源表 Qwen Code 命令列新增固定到该提交的链接。核对日期保持 2026-08-12。
- 矩阵 `cmd-goal` 行的五家简短结论不变；`npm run generate` 重新生成 `docs/capabilities/commands/cmd-goal.md`（内容更新）。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [目标管理详情](../docs/capabilities/commands/cmd-goal.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 提交 `05079297d26c9c42013c3699743350d1d272fac2`（PR #8732 `feat(cli): adopt Goal v3 in ACP sessions`，2026-08-12T14:58:11Z 合入 main）：提交标题即“adopt Goal v3 in ACP sessions”；提交说明记录 “The Goal v3 adoption made the Session constructor bind the canonical Goal runtime, and Session.prompt reserve a turn on it.”，改动文件集中在 `packages/cli/src/acp-integration/` 与 `packages/acp-bridge/`。
- 同一提交说明的降级行为：“goal-persistence unavailability hard-failed `/goal` and `/goal clear`… Those two operations now degrade to an empty snapshot; set/edit/resume still fail, since they need persistence.”；`fix(core)` 部分把会话写入失败统一转换为 `GoalPersistenceUnavailableError`，写入失败的 `/goal clear` 同样降级而不是报错。
- 同一提交说明的状态下发与渲染：“`MessageEmitter.emitGoalState`…`_meta.goalState` update”；“The pause this PR introduces projects as `goalStatus {kind:'paused'}`…Teaches both consumers the state and renders it”（webui 与 web-shell），transcript replay 同时重放 paused Goal 卡片。
- 同一提交说明的抢占与钩子规则：“a goal turn preempted by a newly arrived user prompt now settles via finishTurn”；“A runtime continuation is machine-generated, so it is now exempt from the hook for the same reason `isContinue` already is.”（UserPromptSubmit 钩子）。
- 发布状态核对：CLI 最新 Release 为 v0.21.11-preview.0（2026-08-12T00:55:59Z）与 v0.21.10（2026-08-11T14:21:34Z），均早于该提交；desktop-v0.2.1 Release 说明的 Full Changelog 范围列出 “feat(cli): adopt Goal v3 in ACP sessions by @qqqys in #8732”，但 Desktop 与 CLI 分开记录，故记为“合入 main 尚未发布”。
- 官方 main 分支 `docs/users/features/headless.md`（核对时点）仍写 “ACP still uses the legacy Goal command path.”，文档未随该提交同步，证据状态按源码确认记录。
- 其他四家本次无同类变化：Claude Code v2.1.226/v2.1.227/v2.1.228（2026-08-08 至 2026-08-11 发布）更新日志为缺陷修复与界面改进，无目标管理能力变化；Codex 2026-08-12 合入提交（#38217、#38214、#38205、#38204、#38197、#38189、#38188、#38186）为 Subagent MCP 懒启动、TUI 文本处理、delegate 审批策略、skill 影子选择与 workload identity 认证调整，rust-v0.148.0-alpha.7/8/9 为预发布标签，`/goal` 记录不变；Kimi Code 最新 Release 为 0.35.0（2026-08-12），2026-08-12 提交为 v2 引擎与 TUI 基底修复（含以 `KIMI_CODE_TUI_FULL_SCREEN` 环境变量开关的实验性全屏 `tui_mode`），`/goal` 记录不变；Qoder CLI 官方命令目录未检索到同类变化。
