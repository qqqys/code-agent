# 会话命名

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-naming)

> 核对日期：2026-07-27

## 定义

为持久会话设置可读名称或标题，便于在历史列表中识别和按名称恢复。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/rename` · `--name` | 官方确认 |
| Codex | `/rename` | 官方确认 |
| Qwen Code | `/rename` · `/tag` | 源码确认 |
| Kimi Code | `/title` · `/rename` | 官方确认 |
| Qoder CLI | TUI 命令表未列出 | 未确认 |

## 比较边界

### 本页包含

- 显式名称或标题
- 自动生成标题
- 名称在恢复列表中的用途

### 本页不包含

- 终端窗口标题
- Git 分支名
- 后台任务名称

## 跨产品事实

1. Claude Code、Codex、Qwen Code 和 Kimi Code 有显式命名入口；Qoder CLI 当前 TUI 命令表未列出用户命名命令。
2. Codex 的 `/title` 配置终端标题字段，不是会话命名；会话命名入口是 `/rename`。
3. 自动生成的展示标题不一定能作为恢复句柄，Claude Code 明确区分用户名称与 AI 标题。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/rename` · `--name` |
| 入口与切换 | 启动时用 `claude --name <name>`，会话中用 `/rename <name>`，选择器中可按 `Ctrl+R` 重命名。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 用户名称显示在提示栏和会话选择器，并可用于 `--resume <name>` 或 `/resume <name>` 精确恢复。 |
| 状态范围 | 名称是会话元数据；未命名会话还会有默认显示名和 AI 生成标题，但两者不是恢复句柄。 |
| 自动行为 | 未命名交互会话会用快速模型根据首个提示生成标题；接受 Plan 时也可生成名称，除非用户已命名。 |
| 保存与保留 | 显式名称随会话保存，`/clear` 后当前进程保留用户名称，但不保留 AI 自动标题。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 按名称恢复需要精确匹配；名称歧义时 CLI 和会话内命令的处理不同。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/rename` |
| 入口与切换 | `/rename` 为当前聊天设置名称。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 更新会话在客户端中的可读名称，便于从历史中识别。 |
| 状态范围 | 只修改聊天元数据，不改变项目、线程内容或终端标题设置。 |
| 自动行为 | 当前命令资料未承诺未命名会话的自动标题生成规则。 |
| 保存与保留 | 名称与本地会话记录关联；会话归档不等同于删除名称。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | `/title` 不计入本能力：它配置终端窗口标题显示项。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/rename` · `/tag` |
| 入口与切换 | `/rename <name>` 为当前会话命名，`/tag` 是别名；不带名称或使用 `--auto` 时可自动生成。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | 更新当前聊天记录的显示名称，供 `/resume` 选择器和历史管理识别。 |
| 状态范围 | 名称属于当前会话，不修改 Git 分支、Worktree slug 或项目名称。 |
| 自动行为 | 自动命名通过快速模型根据会话生成标题；显式名称直接保存。 |
| 保存与保留 | 名称写入当前项目的会话记录，并随该会话恢复。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | 命令在不同模式下按命令注册范围出现；名称长度和合法性由当前实现校验。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/title` · `/rename` |
| 入口与切换 | `/title [text]` 设置或显示标题，`/rename` 是别名。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 带参数时更新当前会话标题；不带参数时显示现有标题。 |
| 状态范围 | 标题保存在当前会话 `state.json`，不修改工作目录或 Agent 名称。 |
| 自动行为 | 公开会话文档未描述单独的 AI 自动命名入口。 |
| 保存与保留 | 标题随会话元数据保存，并显示在会话历史中。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | 标题最长 200 字符；命令可随时查看，但设置需要遵循当前 TUI 状态。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/sessions.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/slash-commands.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | TUI 命令表未列出 |
| 入口与切换 | 当前 TUI 内置命令表未列出会话重命名或标题命令。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | SDK 消息类型可通知宿主会话标题发生变化，但当前公开参考未提供用户设置标题的方法。 |
| 状态范围 | 只确认 SDK 可观察标题变化；不据此推断 TUI 存在命名入口。 |
| 自动行为 | 公开文档未说明标题生成时机和算法。 |
| 保存与保留 | 公开文档未说明标题在磁盘中的保存位置。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | 本项保留为未确认，直到 TUI 文档或 SDK 提供明确的设置入口。 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command)、[Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/sessions.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/slash-commands.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [恢复会话](./session-resume.md)
- [会话分支](./session-branch.md)
- [状态与用量](../commands/cmd-status.md)
