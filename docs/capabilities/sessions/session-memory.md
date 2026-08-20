# 跨会话记忆

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-memory)

> 核对日期：2026-08-20

## 定义

在新会话开始时重新加载项目指令、用户偏好或由历史会话提炼出的持久信息。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `CLAUDE.md` + Auto memory | 官方确认 |
| Codex | 条件：`/memories`；默认关闭 | 条件项 |
| Qwen Code | `QWEN.md` + Auto-memory | 源码确认 |
| Kimi Code | `AGENTS.md`；自动记忆未列出 | 条件项 |
| Qoder CLI | `AGENTS.md`；条件：Auto-memory | 条件项 |

## 比较边界

### 本页包含

- 显式指令文件
- 自动提炼记忆
- 项目与用户作用域

### 本页不包含

- 当前会话短期上下文
- 权限和安全规则本身
- 只恢复原会话

## 跨产品事实

1. 五家都能加载项目级静态指令；Claude Code、Codex、Qwen Code 和 Qoder CLI 还公开了自动记忆机制。
2. Codex 本地记忆默认关闭；Qwen Code Auto-memory 默认开启；Qoder Auto-memory 需要环境变量并只在交互会话运行。
3. Kimi Code 当前公开的是 `AGENTS.md` 静态指令体系，没有列出独立自动记忆或 `/memory` 命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `CLAUDE.md` + Auto memory |
| 入口与切换 | `/memory` 查看和编辑加载的 `CLAUDE.md` 与 Auto memory；稳定规则写入用户、项目或本地 `CLAUDE.md`。 |
| 保存位置 | 默认保存在 `~/.claude/projects/<project>/<session-id>.jsonl`；项目名由工作目录转换得到。 |
| 具体行为 | 显式文件每次会话加载；Auto memory 从历史工作提炼偏好、模式和项目知识，并通过 `MEMORY.md` 索引和主题文件注入。 |
| 状态范围 | 项目 Auto memory 在同一仓库各 Worktree 间共享，存储在本机；用户和项目 `CLAUDE.md` 有不同共享范围。 |
| 自动行为 | Auto memory 在后台根据会话提炼和更新；`/memory` 可审计、编辑或关闭。 |
| 保存与保留 | Auto memory 位于 `~/.claude/projects/<project>/memory/`；启动加载 `MEMORY.md` 前 200 行或约 25KB，主题文件按需读取。 |
| 适用界面 | 本页以 CLI 为准。桌面端、Web 和 VS Code 各自维护会话历史；`claude -p` 与 Agent SDK 会话可按 ID 恢复，但不出现在 CLI 选择器中。 |
| 条件与边界 | 主 Agent Auto memory 默认不传给独立 Subagent；强制团队规则应放在版本控制的 `CLAUDE.md`，而不是只依赖自动记忆。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Memory](https://code.claude.com/docs/en/memory) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：`/memories`；默认关闭 |
| 入口与切换 | 启用后用 `/memories` 控制当前聊天是否读取既有记忆、是否贡献未来记忆；稳定团队规则写入 `AGENTS.md`。 |
| 保存位置 | 本地会话记录位于 `$CODEX_HOME/sessions`，默认是 `~/.codex/sessions`；归档会话单独位于 `$CODEX_HOME/archived_sessions`。 |
| 具体行为 | 从符合条件的历史聊天后台提取并合并本地记忆，为未来会话提供可复用上下文。 |
| 状态范围 | 本地 Codex 记忆与 ChatGPT Web 记忆分开；IDE 使用连接的 Codex Host 本地存储。 |
| 自动行为 | 会话空闲后后台提取；会跳过活跃、短会话，配额低于阈值时也可跳过。 |
| 保存与保留 | 默认存储在 `~/.codex/memories/`，包含摘要、持久条目、近期输入和证据。 |
| 适用界面 | 本页区分交互式 Codex 与 `codex exec`。桌面端、IDE 和 CLI 可能随各自版本提供不同的命令集合。 |
| 条件与边界 | 本地记忆默认关闭，需在设置中开启或配置 `[features] memories = true`；每聊天控制不改变全局开关。 |
| 证据状态 | 条件项 |
| 来源 | [Codex Memories](https://learn.chatgpt.com/docs/customization/memories)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `QWEN.md` + Auto-memory |
| 入口与切换 | `/memory` 管理，`/remember <text>` 显式写入，`/forget <text>` 删除，`/dream` 立即执行整理；稳定规则写入 `QWEN.md`。 |
| 保存位置 | 会话按当前项目保存在 `~/.qwen/projects/<sanitized-cwd>/chats/<sessionId>.jsonl`。 |
| 具体行为 | 每次会话加载显式指令；Auto-memory 在后台提炼偏好、反馈、项目背景和引用，并用 Markdown 文件供未来会话读取。 |
| 状态范围 | 项目私有记忆按 checkout 保存，普通分支共享，linked Worktree 独立；可选 `.qwen/team-memory/` 通过 Git 与团队共享。 |
| 自动行为 | Auto-memory 默认开启；每日在会话数量足够时做整理，`/dream` 可手动触发。Team memory 与自动 Git Sync 都默认关闭。 |
| 保存与保留 | 私有记忆位于 `~/.qwen/projects/<project>/memory/`；Team memory 位于仓库 `.qwen/team-memory/`。 |
| 适用界面 | 本页以交互式 TUI 为主；Headless 与 ACP 只有在对应命令注册或 CLI 参数存在时才单独列出。 |
| 条件与边界 | Team memory 会进入 Git diff，写入前做凭据扫描但仍需人工检查；始终生效的规则应写入 `QWEN.md`。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current memory](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/memory.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `AGENTS.md`；自动记忆未列出 |
| 入口与切换 | 项目或用户通过 `AGENTS.md` 提供跨会话指令；`/init` 可生成项目 `AGENTS.md`。当前命令表没有 `/memory`。 |
| 保存位置 | 会话位于 `$KIMI_CODE_HOME/sessions/<workDirKey>/<sessionId>/`，默认数据根为 `~/.kimi-code`；元数据在 `state.json`，消息和工具事件在 `agents/*/wire.jsonl`。 |
| 具体行为 | 启动时把用户、项目和目录级 `AGENTS.md` 作为 Agent 指令注入；子目录指令随文件访问路径加载。 |
| 状态范围 | 全局 Kimi 指令可放 `$KIMI_CODE_HOME/AGENTS.md`，跨工具指令可放 `~/.agents/AGENTS.md`，项目可放 `.kimi-code/AGENTS.md` 或 `AGENTS.md`。 |
| 自动行为 | 当前官方文档未列出从历史会话自动提炼和更新记忆文件的机制。 |
| 保存与保留 | 静态指令是普通 Markdown 文件，由用户或仓库维护；会话历史另存在 `sessions/`，不会自动等同为长期记忆。 |
| 适用界面 | 本页以交互式 TUI 和 `kimi` CLI 为主；只在 Web UI 中不同的行为会单独注明。 |
| 条件与边界 | 本项确认静态跨会话指令，但自动记忆保持未确认，不从会话存储或 Agent 状态推断。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/agents.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `AGENTS.md`；条件：Auto-memory |
| 入口与切换 | `/memory` 查看静态和自动记忆，`/memory manage` 管理自动记忆主题；静态规则写入 `AGENTS.md` 或 `.qoder/rules/*.md`。 |
| 保存位置 | 公开 TUI 文档未列出固定的会话存储目录；SDK 消息与 Hook 上下文提供 `session_id` 和 `transcript_path`。 |
| 具体行为 | 静态 Memory 每次会话加载；Auto-memory 提炼用户偏好、反馈、项目背景和外部引用，可用自然语言要求 Remember 或 Forget。 |
| 状态范围 | 静态指令支持用户、项目、本地项目和 Plugin；Auto-memory 默认项目级，可选跨项目用户级。 |
| 自动行为 | Auto-memory 只在交互会话运行，需以 `QODER_MEMORY=1` 启动；用户级还需 `QODER_MEMORY_USER=1`。 |
| 保存与保留 | 项目自动记忆位于 `~/.qoder/projects/<project>/memory/`，用户级位于 `~/.qoder/memory/`；启动加载索引前 200 行或约 25KB。 |
| 适用界面 | 本页以 Qoder CLI TUI 为主；只在 Agent SDK 提供的能力会明确标为 SDK 条件项。 |
| 条件与边界 | 环境变量未开启时 `/memory` 仍可管理 `AGENTS.md`，但 `/memory manage` 会提示 Auto-memory 不可用。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI Memory](https://docs.qoder.com/en/cli/memory)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Memory](https://code.claude.com/docs/en/memory)
- [Codex Memories](https://learn.chatgpt.com/docs/customization/memories)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code current memory](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/memory.md)
- [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/agents.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/data-locations.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Qoder CLI Memory](https://docs.qoder.com/en/cli/memory)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [恢复会话](./session-resume.md)
- [Agent 持久记忆](../subagents/agent-memory.md)
- [项目指令文件](../extensions/extension-project-instructions.md)
