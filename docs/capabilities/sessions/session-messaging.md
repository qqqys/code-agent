# 跨会话消息

[返回会话与上下文详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=session-messaging)

> 核对日期：2026-08-25

## 定义

在不退出当前会话的情况下发现其他会话、后台 Agent 或队友，并互相发送消息，使并行任务之间可以交换信息。

## 会话结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/list-agents` · `/peers` · `SendMessage`/`ListAgents` · `@` 会话名提及 · `crossSessionInbound` · 原生 Windows（v2.1.239 宣布可用） | 官方确认 |
| Codex | `codex queue --thread <UUID\|精确会话名> --message <文本>` · 经 app-server `thread/queue/add` 投递 · `--remote` 指向远程 app server（rust-v0.149.0 引入）；条件：`codex_tui` 任务工具列出、读取、等待、发消息、创建、派生其他任务（合入 main 尚未发布）；条件：TUI 输入框 `@` 任务提及提交为其他任务的实时引用、模型经 `read_thread` 读取（合入 main 尚未发布） | 条件项 |
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

1. Claude Code 用 `ListAgents`/`/list-agents` 发现本地会话、Subagent 与 Remote Control 会话，`SendMessage` 按名称投递；v2.1.224 引入，v2.1.225 支持按名称主动发起对其他机器 Remote Control 会话的对话，v2.1.229 为列表增加 `offline`/`cloud` 状态标签，v2.1.232 增加提示词 `@` 会话名提及、`SendMessage` 裸名投递与同机唯一会话名，v2.1.239 宣布原生 Windows 可用、`ListAgents` 告知会话自身名称并列出在世队友。
2. Claude Code 的收件箱在 macOS、Linux（含 WSL 2）是每会话 Unix socket，在原生 Windows 是命名管道；同一台机器上 WSL 2 会话与原生 Windows 会话互不可达。
3. Qwen Code 的 `send_message`/`list_agents` 面向当前会话内的后台 Agent（含随会话恢复还原的 Agent），官方文档未列出独立并行会话之间的消息。
4. Qoder CLI 的 Agent Teams 用 `SendMessage` 在主 Agent 与队友、队友与队友之间通信，但团队只存在于单个 TUI 会话内，且当前需要 `QODER_AGENT_TEAMS=1` beta 开关。
5. Codex 自 rust-v0.149.0（2026-08-20 发布）提供启动级命令 `codex queue --thread <UUID|精确会话名> --message <文本>`，经 app-server `thread/queue/add` 把文本作为用户输入排队投递给本地或远程的现有活跃会话；这是用户到会话的单向投递。条件：2026-08-24 PR #40308 合入 main（尚未发布）后，TUI 会为模型注册 `codex_tui` 工具命名空间，模型可在 TUI 会话内列出、读取、等待、发消息、创建、派生、重命名、归档其他 Codex 任务，委派类工具须经审批门控的本地 MCP 服务器逐次批准。同日提交（PR #40315，合入 main 尚未发布）让 TUI 输入框的 `@` 提及弹窗在当前会话支持任务工具时列出匹配的 Codex 任务，选中的任务以实时线程引用提交，模型须用 `read_thread` 读取被引用任务。
6. Kimi Code 的官方命令与文档仍未列出会话间消息；`/swarm` 是多 Agent 任务模式，`/btw` 是与派生子 Agent 的旁路对话，都不等于会话间消息。
7. Claude Code 的消息是纯文本：不携带历史或文件，文本中的命令不会被执行，接收会话自身的权限审批仍然适用。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/list-agents` · `/peers` · `SendMessage`/`ListAgents` · `@` 会话名提及 · `crossSessionInbound` · 原生 Windows（v2.1.239 宣布可用） |
| 入口与切换 | `/list-agents`（别名 `/peers`）列出可达会话、Subagent 与 Remote Control 会话，并显示每个本地会话的工作目录；模型用 `ListAgents` 发现、`SendMessage` 按名称发送，v2.1.229 起 `ListAgents` 把云端会话标为 `cloud`、断开的 Remote Control 会话标为 `offline`。v2.1.232 起可在提示词输入 `@` 加会话名开头字母，从补全列表中选择本机其他运行中会话进行提及，Claude 无需先列出会话即可用 `SendMessage` 直接联系该会话；`/rename` 或 `--name` 为会话命名，`/status` 的 `Peer address` 行显示 inbox 套接字。v2.1.239 起 `ListAgents` 还会告知会话自身的名称（即同伴向其发消息所用的名称），`ListAgents`/`/list-agents` 额外列出在世的 Agent 团队队友（官方跨会话消息文档页在核对日期仍记录队友不列入、需经团队自身名册联系，两处不一致）。 |
| 保存位置 | 收件箱在 macOS、Linux（含 WSL 2）是每会话 Unix socket（`/status` 显示 `uds:` 路径），在原生 Windows 是命名管道；消息不作为独立文件落盘；会话记录本身仍在 `~/.claude/projects/`。 |
| 具体行为 | 收到的消息在活跃回合的工具调用之间送达，空闲时启动新回合；不打断运行中的工具，到达后以发送方会话名展示并保留在对话中，发往其他机器 Remote Control 会话的消息显示为本会话的 Remote Control 名称。消息为纯文本，不携带对话历史或文件，文本中的 `/compact` 等命令不会被执行；接收会话的权限审批对被请求的操作仍然生效。本地投递走每会话收件箱（Unix socket 或命名管道），不经过 Anthropic 服务器；跨机器经 Remote Control 由 Anthropic 服务器中转，v2.1.225 起可按名称主动发起对其他机器 Remote Control 会话的对话（`ListAgents` 显示为 `name [ref]`），官方文档 Limitations 一节仍记录跨机器会话为仅回复。v2.1.232 起 `SendMessage` 对恰好匹配一个运行中会话的裸名直接投递，不再先要求确认 ref；多个会话同名或无法核查全部运行位置时，列表行为每行附加短标识符并按标识符寻址；`@` 提及或点名命中多个运行中会话时，Claude 先询问要发送给哪一个。v2.1.238 起向拒绝接收消息（如 `crossSessionInbound: "refuse"`）的本机会话发送会向发送方报告被拒，而不是静默成功；收件箱因限速或队列已满丢弃消息时也会通知发送方会话。v2.1.239 起 `SendMessage` 发给本会话自身名称时提示这就是当前会话，而不是报“没有该名称的 Agent”。 |
| 状态范围 | 支持 macOS、Windows 与 Linux（含 WSL 2）：官方文档记录 macOS、Linux、WSL 2 需 v2.1.224 及以上，原生 Windows 需 v2.1.234 及以上，v2.1.239 更新日志宣布 Windows 跨会话消息可用并与其他平台一致；同一台机器上的 WSL 2 会话与原生 Windows 会话注册在不同主目录、监听不同套接字类型，互不可达。Amazon Bedrock、Claude Platform on AWS、Google Agent Platform、Microsoft Foundry 不支持。`isolatePeerMachines` 为 `true` 时，任何 `SendMessage` 到达本机以外的会话前都需显式用户批准，且在 `bypassPermissions` 模式下同样适用。v2.1.232 起同机交互会话保持唯一名称：启动、重命名或恢复会话时名称已被本机其他运行中会话占用，则原会话保留名称，新会话改名为 `name-word-word` 变体并收到提示；运行旧版本的会话或自动生成的名称仍可能重名。 |
| 自动行为 | 未设置 `crossSessionInbound` 时按收发双方权限模式决定：需要审批的接收会话直接投递，仅当发送方跳过审批时保留；跳过审批的接收会话保留所有消息，只接收同样跳过审批的发送方。`accept` 立即投递，`hold` 只提示不投递，`refuse` 直接丢弃；`hold` 的批准对话框超过 `dialogExpiry`（默认 5 分钟）未回答即关闭并丢弃消息。v2.1.232 起 `/config` 提供两行：`Messages from your other sessions` 设置 `crossSessionInbound`，`Dialog expiry` 设置 `dialogExpiry`；`dialogExpiry` 设为 `"never"` 时默认保留的消息保留到会话结束，`-p` 会话无法弹出批准对话框，其默认保留的消息同样按 `dialogExpiry` 到期丢弃。 |
| 保存与保留 | 收件箱在 macOS、Linux（含 WSL 2）是每会话 Unix socket（`/status` 显示 `uds:` 路径），在原生 Windows 是命名管道且每条连接须先以仅本机操作系统用户可读的密钥认证，首行不是有效认证行的连接被关闭且不投递任何消息；保留中的消息最多 100 条（超出丢弃最旧），已接受未读消息最多 50 条。`CLAUDE_CODE_MESSAGING_SOCKET` 在 Hook 执行前导出 inbox 路径供 Hook 和 Bash 读取；原生 Windows 上该令牌是验证自己子进程消息的唯一方式。 |
| 适用界面 | CLI 与 Remote Control 会话；发往 Web 云端会话的消息经 Anthropic 服务器投递。`claude -p` 绑定 inbox、可接收消息并出现在列表，但无法弹出批准对话框，无人值守需配 `crossSessionInbound: "accept"`；bare 模式不绑定 socket、不可接收。 |
| 条件与边界 | v2.1.224 引入，v2.1.225 起支持按名称发起跨机器对话，v2.1.229 起 `ListAgents` 输出 `offline`/`cloud` 状态标签，v2.1.232 起提供 `@` 会话名提及、`SendMessage` 裸名投递、同机唯一会话名和 `/config` 的 `Messages from your other sessions`/`Dialog expiry` 两行；`@` 提及与 `/config` 行均要求 v2.1.232 及以上，`Messages from your other sessions` 行在 managed settings 或 `--settings` 已设置 `crossSessionInbound` 时不显示，且拒绝 `/config crossSessionInbound=value` 简写。关闭 feature flag 求值的环境变量（`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`、`DISABLE_TELEMETRY`、`DO_NOT_TRACK`、`DISABLE_GROWTHBOOK`）会停用消息功能；权限规则 `"deny": ["SendMessage", "ListAgents"]` 整体移除工具，deny `SendMessage` 同时阻断向 Subagent 和 Agent 团队队友发消息；沙箱命令对 socket 的访问受 `sandbox.network.allowAllUnixSockets`/`allowUnixSockets` 控制；消息循环按发送方限速，相同重复消息会被丢弃。v2.1.236 起 `SendMessage` 支持 `notify_when_idle`，请本机另一会话在下次空闲时发送一次性通知，只发送一次、不轮询，仅 macOS 与 Linux；v2.1.238 起发送方会收到入站被拒与收件箱丢弃的回报；v2.1.239 起原生 Windows 可用，`ListAgents` 告知会话自身名称并列出在世队友。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)、[Claude Code v2.1.224 changelog (SendMessage)](https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md)、[Claude Code v2.1.225 changelog (SendMessage by name)](https://github.com/anthropics/claude-code/blob/53f9910f6ef0/CHANGELOG.md)、[Claude Code v2.1.229 changelog (ListAgents status labels)](https://github.com/anthropics/claude-code/blob/992381936817/CHANGELOG.md)、[Claude Code v2.1.232 changelog (@ mentions and bare-name delivery)](https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md)、[Claude Code v2.1.236 changelog (SendMessage notify_when_idle)](https://github.com/anthropics/claude-code/blob/084ca20bcf90/CHANGELOG.md)、[Claude Code v2.1.238 changelog (inbound refusal and drop reporting)](https://github.com/anthropics/claude-code/blob/8a8e81d098cb/CHANGELOG.md)、[Claude Code v2.1.239 changelog (Windows cross-session messaging)](https://github.com/anthropics/claude-code/blob/16440d0f6ee8/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `codex queue --thread <UUID\|精确会话名> --message <文本>` · 经 app-server `thread/queue/add` 投递 · `--remote` 指向远程 app server（rust-v0.149.0 引入）；条件：`codex_tui` 任务工具列出、读取、等待、发消息、创建、派生其他任务（合入 main 尚未发布）；条件：TUI 输入框 `@` 任务提及提交为其他任务的实时引用、模型经 `read_thread` 读取（合入 main 尚未发布） |
| 入口与切换 | 启动级命令 `codex queue --thread <THREAD> --message <TEXT>`（rust-v0.149.0 引入）：`--thread` 填会话 UUID 或精确会话名，`--message` 为非空文本；`--remote`/`--remote-auth-token-env` 指向远程 app server，`-c` 传入配置覆盖。条件：PR #40308 合入 main（2026-08-24，尚未发布）后，TUI 在会话启动时为模型注册 `codex_tui` 工具命名空间（命名空间描述 “Manage Codex tasks available through the connected app server.”），含九个动态工具：`list_threads`、`list_archived_threads`、`read_thread`、`wait_threads`、`send_message_to_thread`、`create_thread`、`fork_thread`、`set_thread_title`、`set_thread_archived`。条件：提交 `76d98a771e6c`（PR #40315，合入 main 尚未发布）起，当前会话支持任务工具时，输入框输入 `@` 的提及弹窗在插件、Skill、文件、目录等候选外还会列出匹配的 Codex 任务（标为 `Task`，工作目录为当前目录或其子目录的任务排前），选中的任务以 `@标题` 留在输入框，随消息提交为实时线程引用。 |
| 保存位置 | 未列出独立消息存储；消息经 app-server `thread/queue/add`（JSON-RPC）注入目标会话，会话记录本身位于 `$CODEX_HOME/sessions`。`codex_tui` 工具也不建立独立消息存储：委派提示词经 `ThreadResume`/`TurnStart` 等既有 app-server 请求成为目标会话的普通用户输入，`read_thread` 展示历史时会解包 `<codex_delegation>` 信封、只显示被委派的原文；MCP 传输是 127.0.0.1 随机端点的临时本地 HTTP 端点（每次启动生成 Bearer UUID 令牌），只存在于 TUI 进程运行期。任务提及同样不建立消息存储：提及以 `[@标题]` `(thread://<会话ID>)` 形式的 Markdown 链接写进用户消息文本并随会话记录保存；会话是否支持任务工具除内存集合外还写入按会话 ID 命名的能力文件，供重启或恢复后识别。 |
| 具体行为 | 命令把文本作为用户输入排队到目标活跃会话，官方更新日志修复条目记录排队消息可可靠唤醒空闲会话；空消息与图片附件被拒绝。目标按 UUID 或精确名称解析，来源覆盖 interactive、exec 与 custom 活跃会话；找不到匹配会话报 `No active session found matching`，多个活跃会话同名报 `More than one active session is named` 并要求改用 UUID。条件：`codex_tui` 工具由 app server 以 `DynamicToolCall` 服务器请求发回 TUI 执行——`send_message_to_thread` 恢复目标会话并开始新回合，提示词包装为携带源会话 ID 的 `<codex_delegation>` 委派信封（提示词上限 1000 UTF-8 字节，信封合计上限 1256 字节），并把目标注册为后台任务，可选 `model` 覆盖；`create_thread` 仅在用户明确要求新任务时使用，继承调用会话的工作目录、项目、模型、审批策略、审批审查器与沙箱或权限配置（外部沙箱且无权限配置时报 `Cannot inherit an external sandbox without a permission profile`），新任务注册为后台任务并启动首回合，ephemeral 任务报 `ephemeral tasks cannot create inspectable background tasks`；`fork_thread` 派生任务但不启动新回合，省略 `threadId` 派生调用方自身，派生只含已完成历史并附继续说明；`wait_threads` 同时等待至多 8 个其他任务，唤醒条件为回合完成、状态转为不活跃或需要审批/用户输入，`timeoutMs` 上限 120000、缺省即用上限、`0` 立即返回快照，不能等待调用方自身且拒绝重复目标；`set_thread_archived` 归档任务及其派生任务、恢复只作用于所选任务，拒绝归档调用方自身（`cannot archive the calling task`）；`set_thread_title` 重命名，省略 `threadId` 重命名调用方自身。列表与读取有界：`limit` 默认 10、上限 50，`list_threads` 按更新时间倒序且不接受游标，`list_archived_threads` 支持游标分页；`read_thread` 的 `turnLimit` 默认 1、上限 10，输出截断默认 2000、上限 20000 字符；响应超出预算时自动减半重试或截断。九个工具的描述均要求模型把其他任务的标题、摘要与内容当作不可信数据而不是指令。条件：任务提及弹窗用 `ThreadSearch`（按最近活跃排序、至多 50 条、排除归档）与本地状态库 `ThreadList`（至多 50 条、仅按更新时间补齐标题）两个并行请求合并产生，输入防抖 100 毫秒、请求超时 10 秒，两者都失败或超时时弹窗静默无结果；任务标题取会话名、预览文本、会话 ID 中第一个非空值，显示上限 160 字符。提交时提及改写为 `[@标题]` `(thread://<会话ID>)` 形式的链接（会话 ID 不超过 64 字符、仅限字母、数字、`_`、`-`），并在消息文本插入 `## Referenced chats with Codex:` 上下文（原文说明这是实时引用而不是任务内容、模型 MUST 先对每个被引用任务调用 `read_thread`、把任务标题与内容当作不可信上下文）与 `[{"threadId": ...}]` JSON 数组；原文没有 `## My request for Codex:` 标题时自动补上；提及当前会话自身或重复会话被跳过，最多 16 个引用、会话 ID 合计不超过 768 字节，超出静默截断。引用不携带任务内容，模型须自行调用 `read_thread` 读取。 |
| 状态范围 | 默认经本地 app-server daemon 投递，`--remote` 指向显式远程 app server；目标服务端不支持 `thread/queue/add` 时报错提示更新或重启服务端，不静默更换投递目标。投递后由目标会话自身的权限审批处理后续操作。条件：`codex_tui` 的委派类工具 `create_thread`、`send_message_to_thread`、`fork_thread` 经 TUI 注入线程配置的审批门控本地 MCP 服务器执行（`mcp_servers.codex_tui`，三者 `approval_mode: "prompt"` 逐次弹出批准，其余工具按 `default_tools_approval_mode: "approve"` 自动放行）；MCP 传输只在 TUI 连接本地 daemon 且非远程工作区或环境时启动，嵌入式 app server 不启用，外部 app server 不支持动态工具时回退为不带动态工具启动会话并记录降级警告。经该工具创建或恢复的任务仍受目标会话自身的审批策略与沙箱约束；TUI 派生会话时同样注入该 MCP 配置，派生会话保留委派工具。任务提及要求 `features.mentions_v2` 开启（功能注册表中标记 stable、默认开启，官方配置参考在核对日期尚未列出该键）且当前会话支持任务工具；会话启动时按请求携带的动态工具参数或注入的 `mcp_servers.codex_tui` 配置判定能力，派生会话仅在父会话支持任务工具时继承。 |
| 自动行为 | 排队消息在目标会话空闲时唤醒会话并按用户输入处理。条件：`send_message_to_thread` 与 `create_thread` 把后续提示词或新任务交给目标会话后台执行并注册为后台任务；`wait_threads` 挂起当前工具调用直到唤醒条件或超时，返回各任务的唤醒原因与错误；模型可经 `list_threads`/`list_archived_threads` 自行发现任务，无需用户级命令。官方未列出消息自动转发。 |
| 保存与保留 | 公开资料未记录独立的磁盘消息队列或保留时长；本地投递依赖运行中的 app-server daemon，`-c` 配置覆盖与运行中的本地 daemon 互斥，命令报错而不是绕过。`codex_tui` MCP 服务器不持久化，随 TUI 退出销毁；TUI 退出或丢弃线程时中止处理中的动态工具调用并向调用方回报 `TUI disconnected while handling a dynamic tool call`，源任务在处理期间被关闭时回报 `Source task was closed while handling a dynamic tool call`。条件：任务提及在输入框历史与线程启动、恢复、派生流程中保留，链接形式的提及在展示时解码回 `@标题`；会话的任务工具能力写入按会话 ID 命名的能力文件，持久化失败时记录 `failed to persist task-reference capability` 警告。 |
| 适用界面 | 启动级 CLI 命令；官方 Slash 命令表与文档站目录在核对日期仍未列出 `codex queue`，桌面端或 IDE Surface 未记录等价入口。条件：`codex_tui` 工具只存在于连接支持动态工具的 app server 的 TUI 会话；此前 TUI 对 app-server 动态工具调用一律以 “Dynamic tool calls are not available in TUI yet.” 拒绝，官方文档、Slash 命令表与发布说明在核对日期尚未列出 `codex_tui`。任务提及只存在于 TUI 输入框，官方文档、Slash 命令表与发布说明在核对日期同样尚未列出。 |
| 条件与边界 | `codex queue` 于 rust-v0.149.0（2026-08-20 发布）引入，提交 `83d015375e57`（PR #39092），用户到会话单向投递。条件：`codex_tui` 任务工具于 2026-08-24 合入 main（提交 `a8468330bb5f`，PR #40308），尚未发布，合并提交晚于 rust-v0.149.1 标签；启用前提包括 app server 支持动态工具（旧服务端自动降级为不带动态工具启动）、TUI 连接本地 daemon 且非远程工作区或环境、用户配置未定义同名 `codex_tui` MCP server（冲突时跳过启动并报 “a user-configured MCP server already owns the codex_tui namespace”）、managed MCP requirements 允许该命名空间（否则报 “managed MCP requirements do not permit the TUI task-tools server”）。条件：任务提及于 2026-08-24 合入 main（提交 `76d98a771e6c`，PR #40315），尚未发布，合并提交领先 rust-v0.149.1 标签 140 个提交；前提为 `features.mentions_v2` 开启（功能注册表默认开启）且当前线程支持任务工具，线程能力按内存集合与按会话 ID 的能力文件判定。本页不把 Subagent 委派、`codex exec` 会话分支、TUI 内 Tab 排队下一轮输入或把 Codex 作为 MCP server 调用的多 Agent 工作流计作会话间消息。 |
| 证据状态 | 条件项 |
| 来源 | [Codex rust-v0.149.0 release notes (agents dashboard and codex queue)](https://github.com/openai/codex/releases/tag/rust-v0.149.0)、[Codex `codex queue` session messaging commit](https://github.com/openai/codex/commit/83d015375e578e369c115b06aea631f266226a4f)、[Codex TUI `codex_tui` task tools commit](https://github.com/openai/codex/commit/a8468330bb5f45e9f4d2ec630b01ea8c52908be3)、[Codex TUI task tools source](https://github.com/openai/codex/blob/a8468330bb5f45e9f4d2ec630b01ea8c52908be3/codex-rs/tui/src/dynamic_tools.rs)、[Codex TUI composer task mentions commit](https://github.com/openai/codex/commit/76d98a771e6cd44a79a3ab895a9f7c49d27d6deb)、[Codex TUI task mentions source](https://github.com/openai/codex/blob/76d98a771e6cd44a79a3ab895a9f7c49d27d6deb/codex-rs/tui/src/task_mentions.rs) |

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
- [Claude Code v2.1.236 changelog (SendMessage notify_when_idle)](https://github.com/anthropics/claude-code/blob/084ca20bcf90/CHANGELOG.md)
- [Claude Code v2.1.238 changelog (inbound refusal and drop reporting)](https://github.com/anthropics/claude-code/blob/8a8e81d098cb/CHANGELOG.md)
- [Claude Code v2.1.239 changelog (Windows cross-session messaging)](https://github.com/anthropics/claude-code/blob/16440d0f6ee8/CHANGELOG.md)
- [Codex rust-v0.149.0 release notes (agents dashboard and codex queue)](https://github.com/openai/codex/releases/tag/rust-v0.149.0)
- [Codex `codex queue` session messaging commit](https://github.com/openai/codex/commit/83d015375e578e369c115b06aea631f266226a4f)
- [Codex TUI `codex_tui` task tools commit](https://github.com/openai/codex/commit/a8468330bb5f45e9f4d2ec630b01ea8c52908be3)
- [Codex TUI task tools source](https://github.com/openai/codex/blob/a8468330bb5f45e9f4d2ec630b01ea8c52908be3/codex-rs/tui/src/dynamic_tools.rs)
- [Codex TUI composer task mentions commit](https://github.com/openai/codex/commit/76d98a771e6cd44a79a3ab895a9f7c49d27d6deb)
- [Codex TUI task mentions source](https://github.com/openai/codex/blob/76d98a771e6cd44a79a3ab895a9f7c49d27d6deb/codex-rs/tui/src/task_mentions.rs)
- [Qwen Code background agent messaging](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)
- [Kimi Code current slash commands (no messaging command)](https://github.com/MoonshotAI/kimi-code/blob/8db7d42f23472a692eb389a0e0e5a3e18aa1b94d/docs/zh/reference/slash-commands.md)
- [Qoder CLI Agent Teams](https://docs.qoder.com/cli/agent-teams)

## 关联能力

- [恢复会话](./session-resume.md)
- [后台与并行](../subagents/agent-background.md)
- 远程接管与跨端继续：见对应能力矩阵
