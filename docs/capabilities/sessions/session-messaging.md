# 跨会话消息

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-messaging)

> 核对日期：2026-08-15

## 定义

在不退出当前会话的情况下发现其他会话、后台 Agent 或队友，并互相发送消息，使并行任务之间可以交换信息。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/list-agents` · `/peers` · `SendMessage`/`ListAgents` · `@` 会话名提及 · `crossSessionInbound` | 官方确认 |
| Codex | 官方命令与文档未列出会话间消息 | 未确认 |
| Qwen Code | `send_message` · `list_agents`；限当前会话后台 Agent | 官方确认 |
| Kimi Code | 官方命令表未列出会话间消息 | 未确认 |
| Qoder CLI | 条件：`QODER_AGENT_TEAMS=1` Agent Teams `SendMessage`（beta，单会话内） | 条件项 |

## 比较边界

### 本页包含

- 可寻址会话或 Agent 的发现列表
- 会话或 Agent 之间发送与接收消息
- 接收审批、保留与投递控制

### 本页不包含

- 跨会话记忆或自动上下文共享
- 会话恢复或分支
- 文件与结构化数据传输

## 跨产品事实

1. 只有 Claude Code 提供独立会话之间的消息：`ListAgents`/`/list-agents` 发现本地会话、Subagent 与 Remote Control 会话，`SendMessage` 按名称投递；v2.1.224 引入，v2.1.225 支持按名称主动发起对其他机器 Remote Control 会话的对话，v2.1.229 为列表增加 `offline`/`cloud` 状态标签，v2.1.232 增加提示词 `@` 会话名提及、`SendMessage` 裸名投递与同机唯一会话名。
2. Qwen Code 的 `send_message`/`list_agents` 面向当前会话内的后台 Agent（含随会话恢复还原的 Agent），官方文档未列出独立并行会话之间的消息。
3. Qoder CLI 的 Agent Teams 用 `SendMessage` 在主 Agent 与队友、队友与队友之间通信，但团队只存在于单个 TUI 会话内，且当前需要 `QODER_AGENT_TEAMS=1` beta 开关。
4. Codex 与 Kimi Code 的官方命令与文档未列出会话间消息；Kimi 的 `/swarm` 是多 Agent 任务模式，`/btw` 是与派生子 Agent 的旁路对话，都不等于会话间消息。
5. Claude Code 的消息是纯文本：不携带历史或文件，文本中的命令不会被执行，接收会话自身的权限审批仍然适用。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/list-agents` · `/peers` · `SendMessage`/`ListAgents` · `@` 会话名提及 · `crossSessionInbound` |
| 入口与切换 | `/list-agents`（别名 `/peers`）列出可达会话、Subagent 与 Remote Control 会话，并显示每个本地会话的工作目录；模型用 `ListAgents` 发现、`SendMessage` 按名称发送，v2.1.229 起 `ListAgents` 把云端会话标为 `cloud`、断开的 Remote Control 会话标为 `offline`。v2.1.232 起可在提示词输入 `@` 加会话名开头字母，从补全列表中选择本机其他运行中会话进行提及，Claude 无需先列出会话即可用 `SendMessage` 直接联系该会话；`/rename` 或 `--name` 为会话命名，`/status` 的 `Peer address` 行显示 inbox 套接字。 |
| 保存位置 | 收件箱是每会话 Unix socket（`/status` 显示 `uds:` 路径），消息不作为独立文件落盘；会话记录本身仍在 `~/.claude/projects/`。 |
| 具体行为 | 收到的消息在活跃回合的工具调用之间送达，空闲时启动新回合；不打断运行中的工具，到达后以发送方会话名展示并保留在对话中，发往其他机器 Remote Control 会话的消息显示为本会话的 Remote Control 名称。消息为纯文本，不携带对话历史或文件，文本中的 `/compact` 等命令不会被执行；接收会话的权限审批对被请求的操作仍然生效。本地投递走每会话 Unix socket，不经过 Anthropic 服务器；跨机器经 Remote Control 由 Anthropic 服务器中转，v2.1.225 起可按名称主动发起对其他机器 Remote Control 会话的对话（`ListAgents` 显示为 `name [ref]`），官方文档 Limitations 一节仍记录跨机器会话为仅回复。v2.1.232 起 `SendMessage` 对恰好匹配一个运行中会话的裸名直接投递，不再先要求确认 ref；多个会话同名或无法核查全部运行位置时，列表行为每行附加短标识符并按标识符寻址；`@` 提及或点名命中多个运行中会话时，Claude 先询问要发送给哪一个。 |
| 状态范围 | 支持 macOS、Linux（含 WSL 2），原生 Windows 不支持；Amazon Bedrock、Claude Platform on AWS、Google Agent Platform、Microsoft Foundry 不支持。`isolatePeerMachines` 为 `true` 时，任何 `SendMessage` 到达本机以外的会话前都需显式用户批准，且在 `bypassPermissions` 模式下同样适用。v2.1.232 起同机交互会话保持唯一名称：启动、重命名或恢复会话时名称已被本机其他运行中会话占用，则原会话保留名称，新会话改名为 `name-word-word` 变体并收到提示；运行旧版本的会话或自动生成的名称仍可能重名。 |
| 自动行为 | 未设置 `crossSessionInbound` 时按收发双方权限模式决定：需要审批的接收会话直接投递，仅当发送方跳过审批时保留；跳过审批的接收会话保留所有消息，只接收同样跳过审批的发送方。`accept` 立即投递，`hold` 只提示不投递，`refuse` 直接丢弃；`hold` 的批准对话框超过 `dialogExpiry`（默认 5 分钟）未回答即关闭并丢弃消息。v2.1.232 起 `/config` 提供两行：`Messages from your other sessions` 设置 `crossSessionInbound`，`Dialog expiry` 设置 `dialogExpiry`；`dialogExpiry` 设为 `"never"` 时默认保留的消息保留到会话结束，`-p` 会话无法弹出批准对话框，其默认保留的消息同样按 `dialogExpiry` 到期丢弃。 |
| 保存与保留 | 收件箱是每会话 Unix socket（`/status` 显示 `uds:` 路径）；保留中的消息最多 100 条（超出丢弃最旧），已接受未读消息最多 50 条。`CLAUDE_CODE_MESSAGING_SOCKET` 在 Hook 执行前导出 inbox 路径供 Hook 和 Bash 读取。 |
| 适用界面 | CLI 与 Remote Control 会话；发往 Web 云端会话的消息经 Anthropic 服务器投递。`claude -p` 绑定 inbox、可接收消息并出现在列表，但无法弹出批准对话框，无人值守需配 `crossSessionInbound: "accept"`；bare 模式不绑定 socket、不可接收。 |
| 条件与边界 | v2.1.224 引入，v2.1.225 起支持按名称发起跨机器对话，v2.1.229 起 `ListAgents` 输出 `offline`/`cloud` 状态标签，v2.1.232 起提供 `@` 会话名提及、`SendMessage` 裸名投递、同机唯一会话名和 `/config` 的 `Messages from your other sessions`/`Dialog expiry` 两行；`@` 提及与 `/config` 行均要求 v2.1.232 及以上，`Messages from your other sessions` 行在 managed settings 或 `--settings` 已设置 `crossSessionInbound` 时不显示，且拒绝 `/config crossSessionInbound=value` 简写。关闭 feature flag 求值的环境变量（`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`、`DISABLE_TELEMETRY`、`DO_NOT_TRACK`、`DISABLE_GROWTHBOOK`）会停用消息功能；权限规则 `"deny": ["SendMessage", "ListAgents"]` 整体移除工具，deny `SendMessage` 同时阻断向 Subagent 和 Agent 团队队友发消息；沙箱命令对 socket 的访问受 `sandbox.network.allowAllUnixSockets`/`allowUnixSockets` 控制；消息循环按发送方限速，相同重复消息会被丢弃。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)、[Claude Code v2.1.224 changelog (SendMessage)](https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md)、[Claude Code v2.1.225 changelog (SendMessage by name)](https://github.com/anthropics/claude-code/blob/53f9910f6ef0/CHANGELOG.md)、[Claude Code v2.1.229 changelog (ListAgents status labels)](https://github.com/anthropics/claude-code/blob/992381936817/CHANGELOG.md)、[Claude Code v2.1.232 changelog (@ mentions and bare-name delivery)](https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 官方命令与文档未列出会话间消息 |
| 入口与切换 | 官方 CLI 命令表与文档目录未列出会话间消息命令或工具。 |
| 保存位置 | 无对应消息存储；会话记录本身位于 `$CODEX_HOME/sessions`。 |
| 具体行为 | Codex 会话是相互独立的本地线程；本页不把 Subagent 委派、`codex exec` 会话分支或把 Codex 作为 MCP server 调用的多 Agent 工作流计作会话间消息。 |
| 状态范围 | 无对应能力可确认。 |
| 自动行为 | 无对应能力可确认。 |
| 保存与保留 | 无对应能力可确认。 |
| 适用界面 | 本页核对 CLI 命令表与官方文档目录；如后续版本提供会话间消息，应以官方命令或会话文档为准。 |
| 条件与边界 | 保留为未确认；不从 Subagents、Cloud 或 Remote 能力推断。 |
| 证据状态 | 未确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Documentation](https://developers.openai.com/codex) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `send_message` · `list_agents`；限当前会话后台 Agent |
| 入口与切换 | `send_message` 携 `task_id` 向后台 Agent 发送消息；`list_agents` 列出当前会话可寻址的后台 Agent。 |
| 保存位置 | `send_message`/`list_agents` 作用于当前会话的后台 Agent；文档未列出独立的磁盘消息存储，会话记录本身按项目保存。 |
| 具体行为 | `send_message` 对运行中的 Agent 入队消息、对暂停的 Agent 恢复执行、对已完成的 Agent 继续对话；被继续的 Agent 以下一次完成通知报告结果。完成的 Agent 优先复用常驻运行时，否则从保留的 transcript 恢复。 |
| 状态范围 | 限于当前会话内可寻址的后台 Agent，包括随恢复会话还原的兼容 Agent；官方文档未列出独立并行 CLI 会话之间的消息。 |
| 自动行为 | 后台 Agent 默认以完成通知向主会话报告结果；任务可见但保留状态缺失或不兼容时不可继续，`list_agents` 会给出原因。 |
| 保存与保留 | 后台 Agent 完成后 Qwen Code 保留继续相关工作所需的状态；`list_agents` 条目包含 `task_id`、状态和是否可接收消息，公开文档未给出保留时长。 |
| 适用界面 | 本页以官方 Subagent 文档为准；文档未说明 Headless 或 ACP Surface 的消息行为。 |
| 条件与边界 | 文档另提到 agent-team teammates 与命名 Subagent 一样不接受 `fork_turns`；队友的专门消息入口未在公开文档单列。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code background agent messaging](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 官方命令表未列出会话间消息 |
| 入口与切换 | 官方 Slash 命令表未列出会话间消息命令。 |
| 保存位置 | 无对应消息存储；会话记录本身位于 `$KIMI_CODE_HOME/sessions/`。 |
| 具体行为 | `/swarm` 是启用多 Agent 并行执行的任务模式，`/btw` 是与派生子 Agent 的旁路问答；两者都不是独立会话之间互发消息。 |
| 状态范围 | 本页核对中文 Slash 命令表与会话文档。 |
| 自动行为 | 无对应能力可确认。 |
| 保存与保留 | 无对应能力可确认。 |
| 适用界面 | 以 TUI 命令表为准；不从 Web UI 或 ACP Surface 推断。 |
| 条件与边界 | 保留为未确认；不从 swarm 模式或子 Agent 行为推断。 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code current slash commands (no messaging command)](https://github.com/MoonshotAI/kimi-code/blob/8db7d42f23472a692eb389a0e0e5a3e18aa1b94d/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 条件：`QODER_AGENT_TEAMS=1` Agent Teams `SendMessage`（beta，单会话内） |
| 入口与切换 | Agent Teams：主 Agent 按需创建命名队友（如 `@researcher`），`SendMessage` 在主 Agent 与队友、队友与队友之间通信；用户以 `QODER_AGENT_TEAMS=1` 启动并在对话中显式要求使用 Agent Teams。 |
| 保存位置 | 团队与队友状态只存在于当前 TUI 会话运行期，文档未列出磁盘保存位置；`resume` 只恢复对话历史。 |
| 具体行为 | 普通输出文本不会自动发给队友，只有 `SendMessage` 内容被共享，界面显示 “Message from @[name]”；共享任务列表记录负责人、状态和依赖；完成任务不终止队友，队友在 running/idle 间循环，可被新消息或任务唤醒。 |
| 状态范围 | 单个交互式 TUI 会话；每个会话自动拥有一个当前团队，无手动建队命令；队友视图在单窗口内切换，不支持分栏。 |
| 自动行为 | 主 Agent 根据任务需要动态创建队友；官方建议用户在提示词中明确要求 Agent Teams 并指定角色，否则可能使用普通 Subagent。 |
| 保存与保留 | beta 功能，需 `QODER_AGENT_TEAMS=1`（CLI 环境变量或用户级 `.env`：macOS/Linux 为 `$HOME/.qoder/.env`，Windows 为 `%USERPROFILE%\.qoder\.env`，修改后需重启）；团队不随 TUI 退出保留，`resume` 恢复历史但不恢复队友及其状态。 |
| 适用界面 | 交互式 TUI；官方文档未说明 Headless 或 SDK Surface 支持 Agent Teams。 |
| 条件与边界 | beta；队友 stdout 相互隔离；固定多阶段流程官方建议用 Workflows，单个独立子任务建议用 Subagents。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI Agent Teams](https://docs.qoder.com/cli/agent-teams) |

## 官方来源

- [Claude Code cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)
- [Claude Code v2.1.224 changelog (SendMessage)](https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md)
- [Claude Code v2.1.225 changelog (SendMessage by name)](https://github.com/anthropics/claude-code/blob/53f9910f6ef0/CHANGELOG.md)
- [Claude Code v2.1.229 changelog (ListAgents status labels)](https://github.com/anthropics/claude-code/blob/992381936817/CHANGELOG.md)
- [Claude Code v2.1.232 changelog (@ mentions and bare-name delivery)](https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Documentation](https://developers.openai.com/codex)
- [Qwen Code background agent messaging](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)
- [Kimi Code current slash commands (no messaging command)](https://github.com/MoonshotAI/kimi-code/blob/8db7d42f23472a692eb389a0e0e5a3e18aa1b94d/docs/zh/reference/slash-commands.md)
- [Qoder CLI Agent Teams](https://docs.qoder.com/cli/agent-teams)

## 关联能力

- [恢复会话](./session-resume.md)
- [后台与并行](../subagents/agent-background.md)
- 远程接管与跨端继续：见对应能力矩阵
