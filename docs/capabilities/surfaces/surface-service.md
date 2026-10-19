# 服务端与 Daemon

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-service)

> 核对日期：2026-10-19

## 定义

把 Agent 作为可被其他程序或设备连接的长驻进程运行，通过 stdio、HTTP、SSE、WebSocket、ACP 或 MCP 管理会话和事件。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Agent SDK · Remote Control 服务 | 条件项 |
| Codex | `codex app-server` · `mcp-server` · 本地后台 daemon（`app-server daemon start\|restart\|update\|stop` · TUI `/daemon`） | 官方确认 |
| Qwen Code | `qwen serve` HTTP + SSE | 条件项 |
| Kimi Code | `kimi web` REST + WebSocket | 源码确认 |
| Qoder CLI | `qodercli --acp` · `remote-control` Daemon | 条件项 |

## 比较边界

### 本页包含

- 面向客户端集成的协议服务器
- 本地常驻服务和远程终端连接
- 本地常驻服务的发现、版本更新与重启入口
- 会话、事件、权限与认证边界

### 本页不包含

- 单次 Headless 子进程
- 单纯的云端任务网页
- 只消费外部 MCP Server 的客户端能力

## 跨产品事实

1. Codex 的 app-server、Qwen 的 qwen serve 和 Kimi 的 kimi web 都提供面向富客户端的双向服务，但协议分别是 JSON-RPC、HTTP + SSE、REST + WebSocket。
2. Qoder 的 ACP Server 面向 IDE，Remote Control Daemon 面向 Qoder Web/移动端；它不是公开的本地 HTTP Agent API。
3. Claude Code 的 Agent SDK 和 Remote Control 可承载长运行会话，但官方没有把通用本地 HTTP Agent Daemon 作为开发者接口。
4. 只有 Codex 记录到由 CLI 自己发现、附加并管理版本的本地后台服务器：TUI 默认附加共享 daemon，`/daemon` 可更新或重启它，`codex app-server daemon` 提供 start/restart/update/stop 等生命周期子命令。其余四家的常驻服务都由用户显式启动：Kimi 官方写明 `kimi web` 在前台运行到 SIGINT/SIGTERM，Qoder Remote Control Daemon 按 `Ctrl+C` 退出，Qwen `qwen serve` 的官方文档给出 systemd/launchd/`nohup &`/tmux 一类由部署者自行常驻的方式。
5. Codex daemon 的生命周期、状态文件与 `/daemon` 菜单只记录在官方仓库（`codex-rs/app-server-daemon/README.md`、TUI 源码与 CLI 集成测试）；官方文档站的 App Server 页没有 daemon 字样，只有 Developer commands 页的 remote-control 段写 “the local app-server daemon”。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Agent SDK · Remote Control 服务 |
| 入口与调用 | Agent SDK 长连接客户端；`claude remote-control` 或会话内 `/remote-control` 启动远程控制服务。 |
| 协议与输出 | SDK 通过本地运行时消息流通信；Remote Control 通过 Anthropic 中继把 Web/移动界面连接到本地会话。 |
| 具体行为 | SDK 宿主可持续发送多轮消息；Remote Control 同步本地终端、浏览器和手机上的同一对话。 |
| 会话与状态 | Agent SDK 会话可持久化与恢复；Remote Control 的执行进程和文件始终留在本机。 |
| 工具与能力 | 连接后的远程界面使用本机会话已有的文件、MCP、工具和项目配置。 |
| 认证与权限 | Remote Control 要求同一 Claude 账号并受组织开关控制；SDK 按 Agent SDK 认证。 |
| 运行位置 | 服务进程运行在用户机器或应用宿主；不是公开自托管 HTTP API。 |
| 条件与边界 | Remote Control 是专用跨端通道，不应作为任意第三方客户端协议；通用产品内嵌应使用 Agent SDK。 |
| 证据状态 | 条件项 |
| 来源 | [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)、[Claude Code Remote Control](https://code.claude.com/docs/en/remote-control) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `codex app-server` · `mcp-server` · 本地后台 daemon（`app-server daemon start\|restart\|update\|stop` · TUI `/daemon`） |
| 入口与调用 | `codex app-server`（默认 stdio，或 `--listen ws://127.0.0.1:4500`、`--listen unix://`）；`codex mcp-server`；`codex app-server daemon start\|restart\|update\|enable-remote-control\|disable-remote-control\|stop\|version\|bootstrap`；TUI 内 `/daemon`（源码描述 “Manage the local background server”）打开标题为 “Daemon” 的菜单；远程 TUI 可用 `app-server --listen` 配合 `codex --remote`；官方 Developer commands 页写 `codex remote-control start` “start the local app-server daemon with remote control enabled”、`codex remote-control stop` 停止它。 |
| 协议与输出 | app-server 使用双向 JSON-RPC，默认 stdio JSONL，也支持 Unix socket；WebSocket transport 标为实验且不受支持。MCP Server 使用 stdio MCP。daemon 生命周期命令走 `CODEX_HOME` 下的 Unix 控制套接字：`start` 幂等，在 app-server 能应答常规 JSON-RPC initialize 握手后返回；每条命令成功时向 stdout 写恰好一个 JSON 对象；同一 `CODEX_HOME` 的改动型命令串行执行。 |
| 具体行为 | app-server 提供认证、线程历史、审批和流式 Agent 事件；MCP Server 暴露 `codex` 与 `codex-reply` 工具。TUI 默认发现并附加本地后台 daemon（特征开关 `daemon_auto_start`，`codex --disable daemon_auto_start` 关闭），附加成功时状态行显示 `Server: Local background server`、改用内嵌服务器时显示 `Model:`；隐式发现的 daemon 无法初始化连接时 TUI 改起内嵌服务器，显式 `--remote` 端点仍以远端为准并报告连接失败。`/daemon` 菜单三项为 “Install latest public stable”、“Use this CLI build” 与 “Restart background server”：两个更新项在标题 “Update daemon and exit Codex?” 的确认（默认落在 Cancel）后退出 TUI、由启动它的 CLI 可执行文件执行更新并传播失败；重启项在标题 “Restart background server?” 的确认（正文 “Active or queued work in other chats may be interrupted.”、“Codex will reconnect automatically.”）后重启并自动重连，TUI 退出时进行中的重启会跑完。`stop` 先发优雅终止请求、超过 `shutdownGraceSeconds` 仍存活再强制结束；`update` 即使关闭自动更新也选最新 stable 并让被钉住的本地包恢复生产资格，运行中的 daemon 会重启、已停止的保持停止；`enable-remote-control`/`disable-remote-control` 持久化启动设置并重启已在运行的被管理 app-server。 |
| 会话与状态 | 一个服务可管理多个 thread/turn；远程终端连接到服务端工作区而非复制文件。daemon 状态在 `CODEX_HOME/app-server-daemon/`：`settings.json`（`remoteControlEnabled`、`shutdownGraceSeconds` 取 0–300 默认 60、`updater.autoUpdateEnabled`、`updater.updateIntervalMinutes`）、`app-server.pid`、`app-server-updater.pid` 与 `daemon.lock`；被管理的二进制固定在 `CODEX_HOME/packages/app-server-daemon/current/bin/codex`（Windows 为 `codex.exe`），生命周期命令一律用它而不随调用方 CLI 版本变化，旧 daemon 保留 `CODEX_HOME/packages/standalone/current`。CLI 集成测试以 `app-server-daemon/daemon.pid` 的内容变化断言重启确实发生，该文件与 README 记录的 `app-server.pid` 的关系未确认；测试写入的 `settings.json` 还含 `featureOverrides`（例如 `{"api_key_model_discovery": false}`），README 的键列表没有列出它。 |
| 工具与能力 | 完整 Codex 工具、审批、MCP 和沙箱由 app-server 统一执行；MCP Server 可被上层 Agents SDK 编排。 |
| 认证与权限 | stdio/Unix 依赖本机边界；非本地 WebSocket 要配置 capability token 或签名 bearer，并置于 TLS 后。共享客户端使用 daemon 启动时继承的环境，新开终端或清除变量都不会改变已运行 daemon 的环境；设置 `CODEX_EXEC_SERVER_URL` 的调用会跳过隐式 daemon 附加以保留自己的执行器选择。Windows 上的发现不信任可变别名，规范套接字地址必须放进 108 字节的 AF_UNIX 限制。 |
| 运行位置 | 可运行在本机、远程开发机或产品后端；CLI TUI 可跨机器连接。daemon 面向经 SSH 启动的 Codex 实例与需要以 `remote_control` 暴露 app-server 的新机器：`bootstrap` 在没有安装 daemon 包时把调用方的完整 CLI 包复制进 `CODEX_HOME/packages/app-server-daemon`、记录设置并以 pidfile 后台进程启动，条件满足时再拉起独立更新循环；合格的被管理 daemon 启动 5 分钟后检查更新、之后按 `updateIntervalMinutes`（默认 60）检查，更新循环只在开启自动更新、安装器选择了 stable `latest` 通道且被管理二进制支持 updater 命令时运行，且不随机器重启持久（重启后的一次受管启动会重新拉起）。顶层 `codex remote-control start` 会按需启动或 bootstrap daemon，`codex remote-control` 在合格时使用被管理 daemon、`--no-daemon` 改为单独的前台服务器。 |
| 条件与边界 | WebSocket 明确是 experimental/unsupported；远程暴露必须使用 WSS、认证或 SSH 端口转发。`/daemon` 的两个更新项在远程连接或拿不到 CLI 可执行文件时禁用：远程时菜单头部写 “Manage this server on its host. Local daemon updates are unavailable for remote connections.”，没有 CLI 可执行文件时写 “Run the Codex CLI to manage the daemon from this menu.”，“Use this CLI build” 在没有本地包时另给禁用原因 “This CLI has no local package to copy”；断线或使用内嵌服务器时菜单仍可打开。重启项只在 Codex 已核实自己管理这台本地服务器时可用（含 auto-start 关闭时发现的服务器与 `codex agents` 启动的服务器），是本地 daemon 但未被管理时写 “Codex hasn't verified it manages this server. Restart it where it was started.”，断线或已有重启在进行时同样禁用；该动作 2026-10-11 合入 main（提交 `27065a91ccbf`，PR #53173），核对日期最新 Release rust-v0.162.1（2026-10-09）与 rust-v0.163.0-alpha.5（2026-10-10）都早于该提交，而 `/daemon` 本身自 2026-09-16 提交 `04581f96044a`（PR #45854）进入 main、rust-v0.162.1 标签的 `SlashCommand` 枚举已含 `Daemon`。会话要求的特征设置与已运行 daemon 不一致时，TUI 提示 “Background server has incompatible feature settings”，可改用内嵌服务器或确认后重启并把确认的开关写进 `settings.json` 的 `featureOverrides`，取消则以非零状态退出并提示 “Cannot use the shared background server: This session requires <flag> to be disabled.”；提权启动的本地 TUI 直接用内嵌服务器且不启动 daemon，启动器受限时若 daemon 起不来也回退内嵌。官方 App Server 页没有 daemon 字样，Developer commands 页的内置 Slash 命令表（50 行）没有 `/daemon` 行、CLI 子命令表（26 个子命令）也没有 `codex app-server daemon`，只有该页 remote-control 段提到 “the local app-server daemon”。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex App Server](https://learn.chatgpt.com/docs/app-server)、[Codex as an MCP server](https://learn.chatgpt.com/docs/mcp-server)、[Codex Developer commands（`codex remote-control start` “start the local app-server daemon with remote control enabled”、CLI 子命令表与内置 Slash 命令表）](https://learn.chatgpt.com/docs/developer-commands?surface=cli)、[Codex app-server daemon README（`codex app-server daemon start|restart|update|enable-remote-control|disable-remote-control|stop|version|bootstrap`、`CODEX_HOME/app-server-daemon/settings.json` 的 `remoteControlEnabled`/`shutdownGraceSeconds`/`updater.*`、pid 与 lock 文件、自动更新条件与内嵌服务器回退）](https://github.com/openai/codex/blob/3b6ab3471a2d4d994c9fad322fca749564bc05e0/codex-rs/app-server-daemon/README.md)、[Codex `/daemon` 菜单合并提交（`04581f96044a9fe6062593c4d557036477aee961`，PR #45854，2026-09-16，标题 “Add `/daemon` menu for local background server updates”）](https://github.com/openai/codex/commit/04581f96044a9fe6062593c4d557036477aee961)、[Codex `/daemon` 菜单源码（`daemon_menu.rs`：菜单标题 “Daemon”、三项条目、重启与更新确认文案、远程连接与无 CLI 可执行文件时的禁用原因）](https://github.com/openai/codex/blob/27065a91ccbf5ba8532844be3777fcf83b77820d/codex-rs/tui/src/app/daemon_menu.rs)、[Codex 重启被管理后台服务器的合并提交（`27065a91ccbf5ba8532844be3777fcf83b77820d`，PR #53173，2026-10-11，标题 “Allow restarting managed background servers from the TUI”）](https://github.com/openai/codex/commit/27065a91ccbf5ba8532844be3777fcf83b77820d)、[Codex daemon 启动集成测试（`daemon_startup.rs`：`Server: Local background server` 状态行、`--disable daemon_auto_start`、特征设置不兼容时的内嵌/重启/取消三分支与 `featureOverrides` 写入）](https://github.com/openai/codex/blob/27065a91ccbf5ba8532844be3777fcf83b77820d/codex-rs/cli/tests/daemon_startup.rs)、[Codex rust-v0.162.1 标签的 Slash 命令枚举（含 `Daemon` 变体与描述 “Manage the local background server”）](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/tui/src/slash_command.rs) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen serve` HTTP + SSE |
| 入口与调用 | `qwen serve`，默认 `127.0.0.1:4170`；可加 `--open`、`--no-web`、`--workspace`、`--max-sessions`（默认 32）、`--require-auth` 与 bearer token（`--token` 或 `QWEN_SERVER_TOKEN`）。 |
| 协议与输出 | HTTP REST 管理会话与工作区，SSE 推送事件；内部通过一个或多个 `qwen --acp` 子进程承载 Agent。 |
| 具体行为 | 多客户端共享会话、权限请求和 Diff；SSE 支持 `Last-Event-ID` 重连，Web Shell 与 API 同源。 |
| 会话与状态 | 持久化 transcript 可分页读取和恢复；活跃进程状态在 daemon 重启后需重新加载，跨重启队列需应用层处理。 |
| 工具与能力 | 客户端可查询或控制工具、Skills、MCP、Approval mode、工作区和 Channel；严格变更路由要求 token。 |
| 认证与权限 | loopback 默认可无 token；非 loopback 绑定必须配置 bearer，`--require-auth` 可在 loopback 上也强制 bearer，远程设备登录可走 device flow。 |
| 运行位置 | v0.25.1 的文档仍标 “🚧 v0.16-alpha”（`qwen serve` 首次随 v0.16-alpha 发布到 npm）并定位为本地单机、单用户或小团队；官方给出 systemd/launchd/`nohup &`/tmux 与 Local launch templates 文档，但不承诺容器与多 daemon 协调。 |
| 条件与边界 | Stage 1 experimental，首版仅文本 prompt；生产级多客户端、网络抖动、容器和跨主机保证仍有明确限制。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code v0.25.1 的 `qwen serve` 文档（“Run Qwen Code as a local HTTP daemon”、默认 `127.0.0.1:4170`、`--max-sessions` 默认 32、`--require-auth`、`QWEN_SERVER_TOKEN`、“Status: Stage 1 (experimental)” 与 “🚧 v0.16-alpha”、systemd/launchd/nohup/tmux 与 Local launch templates）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/qwen-serve.md)、[Qwen Code current TypeScript SDK](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `kimi web` REST + WebSocket |
| 入口与调用 | `kimi web` 前台启动（默认端口 58627，被占用时自动 +1 重试）；可用 `--port`、`--host`（缺省 `127.0.0.1`，裸 `--host` 绑 `0.0.0.0`）、`--allowed-host`、`--no-open`、`--web-title`、`--log-level`、`--debug-endpoints`；`kimi web rotate-token` 换发 token。 |
| 协议与输出 | 同一进程提供 REST、WebSocket、Web UI，以及 `/openapi.json` 和 `/asyncapi.json`。 |
| 具体行为 | 承载会话、prompt、工具流和本地文件访问；同一 home 目录下可同时运行多个实例，每个实例注册到 `~/.kimi-code/server/instances/`。 |
| 会话与状态 | 会话与服务 token 保存在 Kimi Code home（token 写入 `~/.kimi-code/server.token`）；服务前台运行，收到 SIGINT/SIGTERM（如 `Ctrl-C`）时干净退出。 |
| 工具与能力 | Web 客户端驱动与 TUI 相同的 Agent 工具；VS Code/ACP 使用另一套进程入口。 |
| 认证与权限 | 默认只绑定 loopback 并在启动横幅打印 bearer token，Web UI 通过 URL 的 `#token=` 片段自动鉴权；`rotate-token` 生成新的持久化 token、旧 token 立即失效，token 由整个 home 共享，运行中的实例在下一次鉴权校验时自动换用而不必重启。 |
| 运行位置 | 默认 loopback 本地服务；可绑定 `0.0.0.0`，但网络、TLS 和访问控制由部署者负责。 |
| 条件与边界 | `--dangerous-bypass-auth` 会让任何可达客户端控制会话、文件和 Shell，只能放在可信网络或自有鉴权代理之后。当前没有后台服务管理命令：`kimi server kill` 已废弃，只用于停止 0.28.0 之前的版本在后台遗留的服务进程（legacy 单实例锁文件 `~/.kimi-code/server/lock`，先请求 `POST /api/v1/shutdown` 优雅退出，再对锁中记录的 pid 发 SIGTERM、必要时升级为 SIGKILL，确认进程退出后删除锁文件）。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)、[Kimi Code `kimi web` 参考（提交 `242ac230006447f8601e1678c49182bfbae89fe9`：默认端口 58627 与占用时 +1 重试、`--host`/`--allowed-host`/`--web-title`/`--log-level`/`--debug-endpoints`、`~/.kimi-code/server/instances/` 多实例登记、`~/.kimi-code/server.token` 与 `rotate-token`、前台运行到 SIGINT/SIGTERM、已废弃的 `kimi server kill`）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qodercli --acp` · `remote-control` Daemon |
| 入口与调用 | `qodercli --acp` 启动 IDE 协议服务器；`qodercli remote-control` 启动面向移动端的后台 Daemon。官方 ACP 页与 Remote Control 页把命令写作 `qoder --acp` 与 `qoder remote-control`。 |
| 协议与输出 | ACP 使用 stdin/stdout 标准协议；Remote Control 使用 Qoder 账号与云端中继连接 Qoder Web/移动端。 |
| 具体行为 | ACP 允许 IDE 创建会话、使用工具和处理权限；Remote Control 官方描述为 “Run CLI as a background daemon and dispatch new tasks from your phone at any time — no need to open a session first.”，daemon 模式下 “the CLI continuously receives and processes multiple tasks from the Qoder mobile app.” |
| 会话与状态 | ACP 状态随宿主子进程；Remote Control Daemon 在本机持续运行并可串行或并行处理任务，按 `Ctrl+C` 退出。 |
| 工具与能力 | ACP 提供 CLI 同款内置工具、Subagent、MCP、权限、压缩和多模态。 |
| 认证与权限 | ACP 复用 CLI 登录或 PAT（官方 ACP 页的 IDE 配置示例把 `command` 写成 `qoder`、`args` 写成 `["--acp"]`，Windows 用 npm 全局目录下的 `qoder.cmd`）；Remote Control 要求同一 Qoder 账号，成功后显示二维码与 URL，用手机相机扫码或在浏览器打开该 URL 并登录同一账号即可连接。 |
| 运行位置 | 两种服务都运行在本机；Remote Control 的文件与 Shell 仍在本机执行。 |
| 条件与边界 | Remote Control Daemon 不是 Qoder Cloud Mode：官方写明 “Your local computer must remain active.”，也没有公开通用 HTTP 客户端协议。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI ACP](https://docs.qoder.com/en/cli/acp)、[Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control) |

## 官方来源

- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
- [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control)
- [Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [Codex as an MCP server](https://learn.chatgpt.com/docs/mcp-server)
- [Codex Developer commands（`codex remote-control start` “start the local app-server daemon with remote control enabled”、CLI 子命令表与内置 Slash 命令表）](https://learn.chatgpt.com/docs/developer-commands?surface=cli)
- [Codex app-server daemon README（`codex app-server daemon start|restart|update|enable-remote-control|disable-remote-control|stop|version|bootstrap`、`CODEX_HOME/app-server-daemon/settings.json` 的 `remoteControlEnabled`/`shutdownGraceSeconds`/`updater.*`、pid 与 lock 文件、自动更新条件与内嵌服务器回退）](https://github.com/openai/codex/blob/3b6ab3471a2d4d994c9fad322fca749564bc05e0/codex-rs/app-server-daemon/README.md)
- [Codex `/daemon` 菜单合并提交（`04581f96044a9fe6062593c4d557036477aee961`，PR #45854，2026-09-16，标题 “Add `/daemon` menu for local background server updates”）](https://github.com/openai/codex/commit/04581f96044a9fe6062593c4d557036477aee961)
- [Codex `/daemon` 菜单源码（`daemon_menu.rs`：菜单标题 “Daemon”、三项条目、重启与更新确认文案、远程连接与无 CLI 可执行文件时的禁用原因）](https://github.com/openai/codex/blob/27065a91ccbf5ba8532844be3777fcf83b77820d/codex-rs/tui/src/app/daemon_menu.rs)
- [Codex 重启被管理后台服务器的合并提交（`27065a91ccbf5ba8532844be3777fcf83b77820d`，PR #53173，2026-10-11，标题 “Allow restarting managed background servers from the TUI”）](https://github.com/openai/codex/commit/27065a91ccbf5ba8532844be3777fcf83b77820d)
- [Codex daemon 启动集成测试（`daemon_startup.rs`：`Server: Local background server` 状态行、`--disable daemon_auto_start`、特征设置不兼容时的内嵌/重启/取消三分支与 `featureOverrides` 写入）](https://github.com/openai/codex/blob/27065a91ccbf5ba8532844be3777fcf83b77820d/codex-rs/cli/tests/daemon_startup.rs)
- [Codex rust-v0.162.1 标签的 Slash 命令枚举（含 `Daemon` 变体与描述 “Manage the local background server”）](https://github.com/openai/codex/blob/rust-v0.162.1/codex-rs/tui/src/slash_command.rs)
- [Qwen Code v0.25.1 的 `qwen serve` 文档（“Run Qwen Code as a local HTTP daemon”、默认 `127.0.0.1:4170`、`--max-sessions` 默认 32、`--require-auth`、`QWEN_SERVER_TOKEN`、“Status: Stage 1 (experimental)” 与 “🚧 v0.16-alpha”、systemd/launchd/nohup/tmux 与 Local launch templates）](https://github.com/QwenLM/qwen-code/blob/c1a8218f38203e272e6e965778ed6a2795cfeed7/docs/users/qwen-serve.md)
- [Qwen Code current TypeScript SDK](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Kimi Code `kimi web` 参考（提交 `242ac230006447f8601e1678c49182bfbae89fe9`：默认端口 58627 与占用时 +1 重试、`--host`/`--allowed-host`/`--web-title`/`--log-level`/`--debug-endpoints`、`~/.kimi-code/server/instances/` 多实例登记、`~/.kimi-code/server.token` 与 `rotate-token`、前台运行到 SIGINT/SIGTERM、已废弃的 `kimi server kill`）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/kimi-command.md)
- [Qoder CLI ACP](https://docs.qoder.com/en/cli/acp)
- [Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control)

## 关联能力

- [Agent SDK](./surface-sdk.md)
- [Web 界面](./surface-web.md)
- [远程接管与跨端继续](./surface-remote-control.md)
