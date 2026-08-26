# 上下文占用

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-context-usage)

> 核对日期：2026-08-26

## 定义

查看当前会话已经占用和仍可使用的模型上下文窗口，而不是只查看账号套餐或计费配额。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/context` | 官方确认 |
| Codex | `/status` | 官方确认 |
| Qwen Code | `/context` · `/context detail` | 源码确认 |
| Kimi Code | `/usage` · 条件：resume 后恢复实测上下文占用（main 分支，尚未发布） | 条件项 |
| Qoder CLI | 未确认独立占用视图 | 未确认 |

## 比较边界

### 本页包含

- 上下文 token 占用
- 剩余窗口
- 占用内容分类

### 本页不包含

- 账号套餐用量
- API 账单
- 仅设置模型最大上下文窗口

## 跨产品事实

1. Claude Code 和 Qwen Code 提供专门的上下文构成视图；Codex 通过 `/status` 展示上下文用量。
2. Kimi Code 的 `/usage` 同时展示 token、上下文占用和配额；`/status` 主要是运行时状态。
3. Qoder CLI 的 `/context-window` 是设置窗口，`/usage` 是套餐用量，当前文档没有确认独立的上下文占用视图。
4. Kimi Code 的 v2 引擎在 main 分支把 token 计数台账持久化到会话 wire journal，resume 后上下文占用恢复实测值而不再回落为估算（尚未发布）；其余四家已固定的一手文档没有描述等价的实测占用恢复机制。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/context` |
| 入口与切换 | `/context` 显示当前上下文的占用构成。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 列出系统提示、工具、`CLAUDE.md`、Memory、Skills 和会话消息等上下文来源。 |
| 状态范围 | 针对当前会话和当前模型窗口，不是账号总 token 配额。 |
| 自动行为 | 窗口接近容量时会触发自动压缩；上下文视图用于判断何时压缩或清理。 |
| 保存与保留 | 占用是实时会话状态，不作为单独配置保存。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 工具 schema、MCP、指令和记忆都会占用窗口；仅看可见聊天消息会低估实际占用。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Context window](https://code.claude.com/docs/en/context-window)、[Claude Code Manage sessions](https://code.claude.com/docs/en/sessions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/status` |
| 入口与切换 | `/status` 显示聊天 ID、上下文用量和速率限制。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 把当前会话标识、当前配置和剩余上下文信息集中显示；状态栏也可配置 `context-remaining` 等字段。 |
| 状态范围 | 上下文用量属于当前聊天；速率限制属于账号或服务配额，两者在同一状态视图中但不是同一指标。 |
| 自动行为 | 达到自动压缩阈值时 Codex 可压缩历史；状态输出用于观察剩余空间。 |
| 保存与保留 | 状态值随聊天和模型实时变化；状态栏字段列表可在 `config.toml` 保存。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | `/usage` 不计入本能力：它面向 token 活动或套餐用量，不是当前聊天上下文占用。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/context` · `/context detail` |
| 入口与切换 | `/context` 查看汇总，`/context detail` 展开到具体条目。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | 展示模型窗口、已用和空闲 token、警告/自动压缩/硬上限，以及系统提示、工具、MCP、Memory、Skills 和消息等分类。 |
| 状态范围 | 针对当前会话；Detail 模式把分类进一步展开到文件、工具或消息条目。 |
| 自动行为 | 视图同时显示自动压缩阈值，阈值随模型窗口和配置计算。 |
| 保存与保留 | 占用数据不单独保存；恢复会话后根据已恢复上下文重新计算。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | 首次模型响应前的 token 数可能是估算，服务端返回实际使用后会更新。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/usage` · 条件：resume 后恢复实测上下文占用（main 分支，尚未发布） |
| 入口与切换 | `/usage` 显示 token 用量、上下文占用和配额信息；`/status` 也会渲染当前会话的 Context window 进度条（百分比与已用/上限 token）。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 在一个视图中同时给出当前会话上下文和账号配额，便于区分窗口压力与套餐余量。显示的上下文值来自 v2 引擎的 token 计数台账：每次模型交换返回 LLM 报告的整段上下文大小就写入一条 `token_counting.measured` 实测锚点；undo 截断写入 `token_counting.truncated`，丢弃截断点之后的锚点；清空或压缩写入 `token_counting.rebased`，把台账重置为单个锚点，压缩后的锚点混合实测摘要与保留消息、请求开销估算（`measured: false`）。状态事件 `agent.status.updated` 携带 `contextTokens` 供视图渲染。 |
| 状态范围 | 上下文部分针对当前会话；配额部分属于账号。`/status` 另行展示版本、模型、工作目录、权限模式和上下文窗口进度条。 |
| 自动行为 | 上下文接近上限时自动压缩，`/usage` 可用于观察压缩前后的占用；压缩后的锚点是混合估算值而非纯模型实测值。 |
| 保存与保留 | 条件：2026-08-16 起 `token_counting.measured`、`truncated`、`rebased` 三类记录由瞬时改为写入会话 wire journal（`agents/*/wire.jsonl` 事件流，v2 引擎），会话归档/取消归档或任意关闭 → resume 后，显示的上下文大小保持实测值，不再回落到较小的估算直到下一次模型调用；此前台账不持久化，resume 后从空台账重新估算。实时统计不作为独立会话文件，随会话事件流保存。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | 不要用 `/status` 替代上下文占用视图；当前命令表明确把上下文占用列在 `/usage`。条件：token 计数台账持久化于 2026-08-16 合入 main（提交 `ee564e5ec90afd068123b8052928c53f1fd5a27d`，PR #2969），尚未发布（最新 Release 为 0.36.1，2026-08-14 发布）；该变化只涉及 v2 引擎（agent-core-v2）。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)、[Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md)、[Kimi Code token counting ledger persistence commit](https://github.com/MoonshotAI/kimi-code/commit/ee564e5ec90afd068123b8052928c53f1fd5a27d)、[Kimi Code token counting ledger changeset](https://github.com/MoonshotAI/kimi-code/blob/ee564e5ec90afd068123b8052928c53f1fd5a27d/.changeset/persist-token-counting-ledger.md)、[Kimi Code token counting ledger source](https://github.com/MoonshotAI/kimi-code/blob/ee564e5ec90afd068123b8052928c53f1fd5a27d/packages/agent-core-v2/src/agent/tokenCounting/tokenCountingOps.ts) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 未确认独立占用视图 |
| 入口与切换 | 当前 TUI 命令表未确认独立的上下文占用视图；`/context-window` 设置模型窗口，`/usage` 显示套餐用量。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | 已确认的两个命令分别处理窗口配置和计划用量，没有文档说明它们展示当前会话各类上下文占比。 |
| 状态范围 | 本项只统计当前会话上下文可见性，不把窗口大小设置或套餐额度算作等价能力。 |
| 自动行为 | CLI 文档确认 `/compact`，但未公开可观察的自动压缩阈值。 |
| 保存与保留 | `/context-window` 的选择可通过模型配置保存；这仍不等于保存占用统计。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | 保留为未确认，直到官方 CLI 文档明确列出上下文已用/剩余或内容分类视图。 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Context window](https://code.claude.com/docs/en/context-window)
- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/6b72345f8bb03487e3bcc05b541e65484818428c/docs/zh/guides/sessions.md)
- [Kimi Code token counting ledger persistence commit](https://github.com/MoonshotAI/kimi-code/commit/ee564e5ec90afd068123b8052928c53f1fd5a27d)
- [Kimi Code token counting ledger changeset](https://github.com/MoonshotAI/kimi-code/blob/ee564e5ec90afd068123b8052928c53f1fd5a27d/.changeset/persist-token-counting-ledger.md)
- [Kimi Code token counting ledger source](https://github.com/MoonshotAI/kimi-code/blob/ee564e5ec90afd068123b8052928c53f1fd5a27d/packages/agent-core-v2/src/agent/tokenCounting/tokenCountingOps.ts)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [手动压缩](./session-compress.md)
- [状态与用量](../commands/cmd-status.md)
- [模型选择与切换](../models/model-switch.md)
