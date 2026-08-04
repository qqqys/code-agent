# Qwen Code Headless Goal 工作流

Qwen Code 在 2026-08-04（UTC）的官方仓库提交中为 Headless 模式补充了 Goal 工作流文档：Headless 接受 `/goal` 作为完整提示词，Goal 状态随会话保存，可用 `--continue` 或 `--resume <sessionId>` 跨进程查看或控制同一 Goal；运行期调度的 Goal 续跑段不计入 `--max-session-turns`；`--output-format stream-json` 以 `goal_state` 为权威状态事件。本次把这一手确认的内容并入现有 `cmd-goal` 字段的 Qwen Code 详情（不新增同义字段），新增来源 `qwen-headless-goal` 并固定到记录该内容的提交 SHA。

## 修正

- `cmd-goal` 详情 Qwen Code 的执行行为新增：Headless 把 `/goal` 作为完整提示词运行 Goal 工作流，`/goal` 不调用模型直接报告保存状态，`/goal set`、`/goal edit <objective>` 创建、替换或修改，`/goal pause`、`/goal resume` 暂停或恢复，`/goal clear` 免确认清除。
- Qwen Code 详情的参数更新：交互命令目录仍列 `/goal <condition>` 与 `/goal clear`；`/goal`（查看）、`/goal set`、`/goal edit`、`/goal pause`、`/goal resume` 等控制形式由 Headless 文档列出。
- Qwen Code 详情的持久化更新：Goal 状态随会话保存；跨进程控制用 `--continue` 或 `--resume <sessionId>`，要求 `general.chatRecording` 保持启用（默认启用）。
- Qwen Code 详情的条件新增：Headless 中 Goal 续跑段不计入 `--max-session-turns`（真实用户提示仍计入）；`--max-wall-time`、`--max-tool-calls` 超限时先暂停 Goal 工作再以预算专属错误退出；stream-json 的 `goal_state` 为权威状态事件，启用 partial messages 时旧版 `active_goal` 作为兼容投影；该行为适用于标准 Headless CLI 运行，ACP 仍走旧版 Goal 命令路径。
- 跨产品事实新增：Qwen Code Headless 把 `/goal` 作为完整提示词，Goal 状态随会话保存，`--continue`/`--resume <sessionId>` 可跨进程查看或控制；stream-json 以 `goal_state` 为权威状态事件。其余四家的 `/goal` 记录不变。
- `site/data.js` 的 `updatedAt` 更新为 2026-08-04；`docs/09-版本与证据.md` 中 Qwen Code 核对日期更新为 2026-08-04，其余四家保持 2026-08-03。
- 新增来源 `qwen-headless-goal`，固定到记录该文档的提交 SHA；`docs/09-版本与证据.md` 的 Headless 与 SDK 来源表同步补充。
- 矩阵 `cmd-goal` 行的五家简短结论不变。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [目标管理详情](../docs/capabilities/commands/cmd-goal.md)

## 证据版本

- Qwen Code 官方仓库提交 `48d37cdf704dbe4c5254cc4b31c2d62f1351bff1`（`docs: document headless Goal workflows (#8503)`）：在 `docs/users/features/headless.md` 新增 “Run a Persistent Goal” 一节。
- 同一 SHA 的 `docs/users/features/headless.md`：“Headless mode accepts `/goal` as the entire prompt. Goal state is stored with the session, so use `--continue` or `--resume <sessionId>` to inspect or control the same Goal from a later process. This requires `general.chatRecording` to remain enabled (the default).”
- 同一文档的控制表：`/goal` 不调用模型报告保存状态；`/goal <objective>` 或 `/goal set …` 创建或替换并开始 Headless Goal 工作；`/goal edit <objective>` 修改未完成目标；`/goal pause`、`/goal resume` 不调用模型暂停或恢复；`/goal clear` 免确认清除。
- 同一文档的预算规则：“Runtime-scheduled Goal continuation segments do not count against `--max-session-turns`, but real user prompts still do. Explicit `--max-wall-time` and `--max-tool-calls` budgets continue to apply; exceeding either pauses active Goal work before the run exits with the budget-specific error.”
- 同一文档的状态事件：“With `--output-format stream-json`, each Goal status change emits a `stream_event` whose `event.type` is `goal_state`. This canonical state event is emitted even without `--include-partial-messages`. When partial messages are enabled, the older `active_goal` event follows as a compatibility projection; automation should treat `goal_state` as authoritative.”
- 同一文档的边界注记：“This behavior applies to standard headless CLI runs. ACP still uses the legacy Goal command path.”
- 同一 SHA 的 `docs/users/features/commands.md`：交互命令目录中 `/goal` 仍只列 `/goal <condition>` 与 `/goal clear`（“Set a goal — keep working until condition met”），未列 set、edit、pause、resume 形式。
