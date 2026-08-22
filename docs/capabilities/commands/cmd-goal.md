# 目标管理

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-goal)

> 核对日期：2026-08-22

## 定义

保存一个跨多轮持续执行的目标，让 Agent 在每轮结束后根据目标状态决定继续、暂停、完成或阻塞。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/goal [condition\|clear]` | 官方确认 |
| Codex | `/goal` | 官方确认 |
| Qwen Code | `/goal [condition\|clear]` | 源码确认 |
| Kimi Code | `/goal [...]` | 官方确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- 创建和查看目标
- 暂停、恢复、清除或替换
- 后续目标队列
- 非交互退出状态
- Headless Goal 工作流
- ACP 会话 Goal 行为

### 本页不包含

- 一次性任务提示
- 计划模式
- 后台 Shell 进程

## 跨产品事实

1. Claude Code、Codex、Qwen Code 和 Kimi Code 都提供 `/goal`。
2. Kimi Code 公开了 status、pause、resume、cancel、replace、next 等子命令及非交互退出码。
3. Kimi Code 0.37.0 起单条目标不超过 4000 字符，TUI 输入提示与 v1/v2 引擎双层校验，超限拒绝并保留已输入内容。
4. Claude Code v2.1.234 起 `/goal` 在回合因不可恢复错误终止时自动清除并提示；后台任务让目标等待超过 30 分钟时主动检查这些任务。
5. Qwen Code Headless 把 `/goal` 作为完整提示词，Goal 状态随会话保存，`--continue` 或 `--resume <sessionId>` 可跨进程查看或控制；stream-json 以 `goal_state` 为权威状态事件。
6. Qwen Code ACP 会话自提交 `05079297d26c`（2026-08-12 合入 main，尚未发布）起采用 Goal v3 规范运行时，Goal 状态变化经 `_meta.goalState` 下发。
7. Qoder CLI 当前命令目录没有 `/goal`。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/goal [condition\|clear]` |
| 别名 | 无公开别名 |
| 参数 | `condition`；`clear\|stop\|off\|reset\|none\|cancel` 可提前移除 |
| 执行行为 | 设置持续目标；不带参数显示当前或最近完成的目标。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话的持续目标状态 |
| 条件与边界 | v2.1.234 起：回合因不可恢复错误（如撤销认证、余额用尽、上下文溢出）终止时，`/goal` 自动清除并提示，不再保持生效；后台任务让目标等待超过 30 分钟时主动检查这些任务而不是无限等待，`CLAUDE_CODE_GOAL_CHECKIN_MINUTES=0` 可关闭该检查 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code v2.1.234 changelog (/goal self-clear and background check-in)](https://github.com/anthropics/claude-code/blob/354757e5b2d9/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/goal` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 设置、编辑、暂停、恢复、查看或清除任务目标。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话的持久目标状态 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/goal [condition\|clear]` |
| 别名 | 无公开别名 |
| 参数 | 交互命令目录列 `/goal <condition>` 与 `/goal clear`；Headless 文档另列 `/goal`、`/goal set`、`/goal edit <objective>`、`/goal pause`、`/goal resume` 控制形式 |
| 执行行为 | 设置目标并持续工作直到满足条件。Headless 模式把 `/goal` 作为完整提示词运行 Goal 工作流：`/goal` 不调用模型直接报告保存状态，`/goal set`、`/goal edit <objective>` 创建、替换或修改，`/goal pause`、`/goal resume` 暂停或恢复，`/goal clear` 免确认清除。ACP 会话自提交 `05079297d26c`（2026-08-12 合入 main，尚未发布）起采用 Goal v3 规范运行时。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | Goal 状态随会话保存；跨进程查看或控制同一 Goal 用 `--continue` 或 `--resume <sessionId>`，并要求 `general.chatRecording` 保持启用（默认启用） |
| 条件与边界 | Headless 中运行期调度的 Goal 续跑段不计入 `--max-session-turns`，真实用户提示仍计入；`--max-wall-time`、`--max-tool-calls` 预算继续生效，超限时先暂停活动 Goal 工作再以预算专属错误退出；`--output-format stream-json` 每次 Goal 状态变化发出 `event.type` 为 `goal_state` 的 `stream_event`（无需 `--include-partial-messages`），启用 partial messages 时旧版 `active_goal` 事件作为兼容投影跟随，自动化应以 `goal_state` 为准；预算与事件行为适用于标准 Headless CLI 运行。ACP 会话自提交 `05079297d26c`（main 分支，尚未发布）起改用 Goal v3 规范运行时，不再走旧版 Goal 命令路径：Goal 状态变化经 `_meta.goalState` 下发给客户端，paused 状态在 Web Shell 与 WebUI 渲染；Goal 持久化不可用（`general.chatRecording` 关闭或会话写入失败）时，查看状态与 `/goal clear` 降级返回空快照，`/goal set`、`/goal edit`、`/goal resume` 仍然失败；新到达的用户提示会打断进行中的 Goal 轮次；运行期调度的 Goal 续跑不触发 UserPromptSubmit 钩子；官方 Headless 文档页尚未同步该变化 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)、[Qwen Code headless Goal workflows](https://github.com/QwenLM/qwen-code/blob/48d37cdf704dbe4c5254cc4b31c2d62f1351bff1/docs/users/features/headless.md)、[Qwen Code Goal v3 adoption in ACP sessions commit](https://github.com/QwenLM/qwen-code/commit/05079297d26c9c42013c3699743350d1d272fac2) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/goal [...]` |
| 别名 | 无公开别名 |
| 参数 | `status\|pause\|resume\|cancel\|replace <objective>\|next <objective>\|next manage` |
| 执行行为 | 创建并管理目标模式，支持暂停、恢复、替换、取消和后续目标队列。 |
| 可用模式 | TUI；`kimi -p "/goal ..."` 只支持创建形式 |
| 保存范围 | 目标和后续目标队列保存在当前会话 |
| 条件与边界 | 0.37.0 起单条目标不超过 4000 字符：输入超长时 TUI 页脚实时提示当前长度/上限，提交时报 `Goal objective is too long (max 4000 characters)` 并建议把长内容写入文件后引用文件路径；编辑框为空且无替换面板时把已输入内容回填编辑框；v1 与 v2 引擎创建目标时同样校验并抛 `GOAL_OBJECTIVE_TOO_LONG`；官方 Slash 命令文档尚未同步该限制。Prompt 模式完成、阻塞、暂停分别使用退出码 0、3、6 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)、[Kimi Code /goal objective length limit commit](https://github.com/MoonshotAI/kimi-code/commit/d96cd037702637305422222e985139e51ff83c8c)、[Kimi Code 0.37.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.37.0) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 当前官方命令目录未列出对应 Slash 命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code v2.1.234 changelog (/goal self-clear and background check-in)](https://github.com/anthropics/claude-code/blob/354757e5b2d9/CHANGELOG.md)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Qwen Code headless Goal workflows](https://github.com/QwenLM/qwen-code/blob/48d37cdf704dbe4c5254cc4b31c2d62f1351bff1/docs/users/features/headless.md)
- [Qwen Code Goal v3 adoption in ACP sessions commit](https://github.com/QwenLM/qwen-code/commit/05079297d26c9c42013c3699743350d1d272fac2)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Kimi Code /goal objective length limit commit](https://github.com/MoonshotAI/kimi-code/commit/d96cd037702637305422222e985139e51ff83c8c)
- [Kimi Code 0.37.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.37.0)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [计划模式](./cmd-plan.md)
- [任务列表](./cmd-tasks.md)
- [多模型或多代理模式](./cmd-collaboration.md)
