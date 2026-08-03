# 恢复会话

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-resume)

> 核对日期：2026-08-03

## 定义

退出后重新载入已有会话，使历史消息、工具结果和产品明确保存的会话状态继续参与后续对话。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/resume` · `--continue` | 官方确认 |
| Codex | `/resume` · `codex exec resume` | 官方确认 |
| Qwen Code | `/resume` · `/continue` | 源码确认 |
| Kimi Code | `/sessions` · `/resume` | 官方确认 |
| Qoder CLI | `/resume` | 官方确认 |

## 比较边界

### 本页包含

- 交互式选择历史会话
- 按最近会话或会话 ID 恢复
- 恢复后重新加载的状态

### 本页不包含

- 跨会话自动记忆
- 把当前会话复制成新 ID
- 单纯查看终端输入历史

## 跨产品事实

1. 五家都提供恢复入口，但会话选择范围分别按项目、工作目录、Worktree 或 SDK 参数组织。
2. 恢复历史不等于恢复所有启动参数；Claude Code 和 Qwen Code 都明确列出需要重新提供或重新加载的状态。
3. 会话文件通常包含提示词、工具结果和本地路径，分享前需要按敏感数据处理。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/resume` · `--continue` |
| 入口与切换 | `/resume` 在会话内切换；`claude --continue` 恢复当前目录最近会话；`claude --resume [name\|id]` 打开选择器或直接恢复。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 恢复完整对话和工具结果，并尝试恢复模型、Agent、权限模式、活动 Goal 与未过期的定时任务；部分状态受当前账号、模型可用性和安全规则影响。 |
| 状态范围 | 默认选择当前 Worktree 的会话；`Ctrl+W` 扩到仓库全部 Worktree，`Ctrl+A` 扩到本机全部项目。按名称可在当前仓库及其 Worktree 精确匹配。 |
| 自动行为 | 会话在工作过程中持续写入本地记录，不需要显式保存。 |
| 保存与保留 | 默认保留 30 天，可用 `cleanupPeriodDays` 调整；`--no-session-persistence` 可让单次 `claude -p` 不落盘。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | `--mcp-config`、`--settings`、`--plugin-dir`、`--fallback-model` 和额外目录等启动参数不会全部随会话恢复，需要按需重新传入。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/resume` · `codex exec resume` |
| 入口与切换 | 交互式会话使用 `/resume` 选择历史；非交互流程使用 `codex exec resume --last <prompt>` 或 `codex exec resume <SESSION_ID> <prompt>`。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 继续已有线程并把新提示追加到同一会话。非交互恢复保留此前对话上下文，适合分阶段脚本。 |
| 状态范围 | `--last` 选择最近会话；显式 ID 选择指定会话。交互选择范围由当前 Codex 客户端提供的会话列表决定。 |
| 自动行为 | 本地客户端持续维护会话记录；无需单独执行保存命令。 |
| 保存与保留 | 会话记录保存在 Codex Home；公开故障排查文档给出会话与归档目录，但当前命令页未承诺固定清理周期。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | `codex exec` 默认要求在 Git 仓库中运行；恢复命令接受后续提示，而不是只打开只读记录。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)、[Codex Troubleshooting](https://learn.chatgpt.com/docs/reference/troubleshooting) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/resume` · `/continue` |
| 入口与切换 | `/resume`（别名 `/continue`）打开历史会话；Headless 可用 `qwen --continue -p` 或 `qwen --resume <sessionId> -p`。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | 恢复对话历史、工具结果和聊天压缩检查点，再发送新的提示词；Worktree 绑定存在时会加载 sidecar 并提示后续工具继续使用对应路径。 |
| 状态范围 | 会话按项目和实际工作目录分桶；每个 linked Git Worktree 有独立会话目录，选择器只显示当前作用域的记录。 |
| 自动行为 | `general.chatRecording` 默认开启并持续保存；关闭后 `/resume` 和 `--continue` 都不可用。 |
| 保存与保留 | 聊天 JSONL 留在项目会话目录；Worktree 绑定另存为 `<sessionId>.worktree.json`。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | 从 Worktree 恢复时，CLI 验证目录是否仍存在；目录已删除会清理陈旧 sidecar 并在原作用域继续，而不是重建 Worktree。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)、[Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md)、[Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/sessions` · `/resume` |
| 入口与切换 | `/sessions`（别名 `/resume`）在 TUI 浏览和切换；`kimi --continue` 恢复当前目录最近会话；`kimi --session [id]` 选择或指定会话。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 从会话目录的元数据和 Agent 事件流恢复历史。会话中的后台任务、定时任务和子 Agent 状态有各自的持久化目录。 |
| 状态范围 | 会话按工作目录生成的 `workDirKey` 分组；顶层 `session_index.jsonl` 维护会话 ID、目录和工作目录索引。 |
| 自动行为 | 每次直接运行 `kimi` 创建新会话，并在运行过程中写入 `state.json` 和 `wire.jsonl`。 |
| 保存与保留 | 会话和诊断材料保存在 `KIMI_CODE_HOME`；官方文档未给出自动保留天数。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | `--continue` 与 `--session` 互斥；TUI 的会话切换命令只在 Agent 空闲时可用。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/sessions.md)、[Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-command.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/resume` |
| 入口与切换 | `/resume` 从历史记录选择会话；SDK 还提供 `continue: true`、`resume: <sessionId>` 和 `resumeSessionAt: <messageUuid>`。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | TUI 恢复历史会话；SDK 可以继续最近会话、指定会话 ID，或从指定消息锚点继续。 |
| 状态范围 | TUI 命令页只描述“历史记录”；SDK 由宿主传入工作目录、会话 ID 和消息锚点。 |
| 自动行为 | 公开命令页未说明 TUI 的保存频率；SDK 运行时会生成或接收 `sessionId`。 |
| 保存与保留 | SDK 可从消息与 Hook 取得 transcript 路径；固定磁盘目录和自动清理周期未在当前 TUI 文档中列出。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | `resumeSessionAt` 是 SDK 消息锚点；它不等同于回滚本地文件。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command)、[Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Codex Troubleshooting](https://learn.chatgpt.com/docs/reference/troubleshooting)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/configuration/settings.md)
- [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/sessions.md)
- [Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-command.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [会话分支](./session-branch.md)
- [会话命名](./session-naming.md)
- [检查点与回退](./session-checkpoint.md)
