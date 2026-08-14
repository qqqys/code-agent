# 会话分支

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-branch)

> 核对日期：2026-08-14

## 定义

复制当前会话截至某一时点的上下文，生成独立会话 ID，使新旧对话可以分别继续。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/branch` · `--fork-session` | 官方确认 |
| Codex | `/fork` · `codex exec fork`（条件：main 分支，尚未发布） | 源码确认 |
| Qwen Code | `/branch` | 源码确认 |
| Kimi Code | `/fork` | 官方确认 |
| Qoder CLI | SDK：`resume` + `forkSession` | 条件项 |

## 比较边界

### 本页包含

- 复制历史到新会话
- 新旧会话独立保存
- 分支时继承的状态边界

### 本页不包含

- Git 分支或 Worktree
- 后台 Subagent 委派
- 在同一会话中回退到检查点

## 跨产品事实

1. Claude Code、Codex、Qwen Code 和 Kimi Code 都有直接会话分支入口；Qoder CLI 当前只在 SDK 公开了同类选项。
2. Claude Code 和 Codex 还在 Headless 流程提供会话分支：Claude Code 用 `--fork-session`，Codex 用 `codex exec fork`（条件：main 分支，尚未发布）。
3. Qwen Code 的 `/fork` 是继承完整对话的后台 Agent，不是会话分支；会话分支入口是 `/branch`。
4. 会话分支复制的是对话状态，不代表复制所有进程内授权、Goal、后台任务或工作区状态。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/branch` · `--fork-session` |
| 入口与切换 | `/branch [name]` 在当前进程复制并切换；命令行用 `--continue` 或 `--resume` 配合 `--fork-session`。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 创建新会话 ID，复制截至分支点的对话，原会话磁盘记录保持不变。`/branch` 完成后当前进程写入新会话。 |
| 状态范围 | 同进程 `/branch` 继承本会话临时授权；新进程 `--fork-session` 不继承。运行中的后台 Agent 和 Bash 继续执行，输出进入新分支。 |
| 自动行为 | 未指定名称时根据会话首个提示生成名称。 |
| 保存与保留 | 新旧会话都进入会话选择器，并分别遵循会话保留策略。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 不要在两个终端直接恢复同一会话来模拟分支，否则消息会交错写入同一记录。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/fork` · `codex exec fork`（条件：main 分支，尚未发布） |
| 入口与切换 | `/fork` 把当前本地聊天复制为新的本地聊天；非交互流程使用 `codex exec fork <SESSION_ID> [PROMPT]`，`SESSION_ID` 接受会话 UUID 或线程名称。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | `/fork` 使新聊天获得独立线程标识并带入当前可见上下文，原聊天仍可继续或重新打开。`codex exec fork` 从既有会话创建新会话且原会话保持不变；不带提示词时只创建新线程、不开始回合，输出包含 `forked_from_id` 的会话配置后立即退出，带提示词时（`-` 从 stdin 读取）立即在派生会话中继续执行。 |
| 状态范围 | 复制的是本地聊天上下文；不表示创建 Git 分支、Worktree 或云任务。`codex exec fork` 可用 `--image`/`-i`（逗号分隔）为 fork 后的提示词附加图片。 |
| 自动行为 | 无自动分支；由用户在需要保留原路径时显式触发。 |
| 保存与保留 | 新线程作为独立本地会话进入 Codex 的会话存储；`codex exec fork` 输出的会话配置用 `forked_from_id` 记录来源会话。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | 命令可用性取决于当前 Codex 客户端 Surface 和版本；本页不把 `/side` 临时旁路聊天计作持久分支。条件：`codex exec fork` 于 2026-08-07 合入 main 分支，尚未进入 Release，官方非交互文档未列出；不带提示词的 fork 不能搭配 `--image`、`--output-schema`/`--output-last-message` 等输出参数或 ephemeral 模式，否则报错。 |
| 证据状态 | 源码确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex exec session fork](https://github.com/openai/codex/commit/80858a8cce7f3ba0aaf6a76ad9462dca1604daeb) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/branch` |
| 入口与切换 | `/branch` 从当前对话派生新会话。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | 复制当前会话的对话历史到新会话 ID，随后在新会话继续；原会话保持可恢复。 |
| 状态范围 | 会话分支仍处于当前项目会话存储范围。`/fork <directive>` 是后台 Agent，会继承完整对话但不创建可切换的会话分支。 |
| 自动行为 | 无自动分支；用户显式执行 `/branch`。 |
| 保存与保留 | 新会话作为新的聊天 JSONL 保存，与原会话分别出现在恢复历史中。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | 不要把 `/branch` 与 Git 分支或 `/fork` 后台 Agent 混为同一能力。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/fork` |
| 入口与切换 | `/fork` 在 TUI 派生当前会话；fork 后停留在原会话，派生副本之后用 `/sessions` 打开。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 复制完整对话历史创建独立会话，新旧会话互不影响；原会话保持活跃，后台任务继续运行，可随时用 `/sessions` 切换到副本。 |
| 状态范围 | 复制对话，但不复制已保存的 `/goal`；需要在新会话重新启动 Goal。 |
| 自动行为 | 无自动分支；由用户在 Agent 空闲时显式执行。 |
| 保存与保留 | 新会话目录的 `state.json` 记录 `forkedFrom`，并拥有独立 Agent 事件流。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | 这是会话级派生，不会自动创建 Git 分支或隔离工作目录；0.33.0 起 fork 不再自动切换到派生会话。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/guides/sessions.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)、[Kimi Code /fork stay-in-session commit](https://github.com/MoonshotAI/kimi-code/commit/54c04bf03ddbeb46d02b2edb460ea091ae194509) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | SDK：`resume` + `forkSession` |
| 入口与切换 | Agent SDK 在 `query()` 中同时设置 `resume: <sessionId>` 与 `forkSession: true`。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | 从指定会话恢复上下文，但生成新的会话 ID，后续消息写入新会话。 |
| 状态范围 | 能力属于 SDK 宿主接口；当前 TUI 内置命令表未列出 `/fork` 或 `/branch`。 |
| 自动行为 | `forkSession` 默认 `false`，必须由 SDK 调用方显式打开。 |
| 保存与保留 | 新会话 ID 由 SDK/CLI 运行时返回；具体 TUI 存储目录未公开。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | 只有与 `resume` 组合时构成会话分支；不能据此推断 TUI 存在同名命令。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code Manage sessions](https://code.claude.com/docs/en/sessions)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex exec session fork](https://github.com/openai/codex/commit/80858a8cce7f3ba0aaf6a76ad9462dca1604daeb)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Kimi Code current sessions](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/guides/sessions.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)
- [Kimi Code /fork stay-in-session commit](https://github.com/MoonshotAI/kimi-code/commit/54c04bf03ddbeb46d02b2edb460ea091ae194509)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [恢复会话](./session-resume.md)
- [后台与并行](../subagents/agent-background.md)
- [Worktree 隔离](../subagents/agent-worktree.md)
