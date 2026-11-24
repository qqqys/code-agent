# Headless 调用

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-headless)

> 核对日期：2026-11-24

## 定义

不进入交互式终端界面，直接从命令参数或标准输入接收任务，并以进程输出和退出码交付结果。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `claude -p` | 官方确认 |
| Codex | `codex exec` · 条件：`codex exec --remote <ADDR>` 把非交互回合交给既有 app server 执行、配置与凭据取自服务端（rust-v0.171.0 起，官方文档尚未同步） | 官方确认 |
| Qwen Code | `qwen -p` | 源码确认 |
| Kimi Code | `kimi -p` | 源码确认 |
| Qoder CLI | `qodercli -p` | 官方确认 |

## 比较边界

### 本页包含

- 一次性非交互任务入口
- 标准输入、会话恢复和退出行为
- Headless 模式下的权限与配置加载

### 本页不包含

- 应用程序内嵌 SDK
- 常驻 HTTP、WebSocket 或 ACP 服务
- 托管云端任务

## 跨产品事实

1. 五家都提供专门的非交互入口，不需要模拟 TUI 键盘输入。
2. Claude Code、Codex、Qwen Code 和 Qoder CLI 可在非交互入口恢复已有会话；Kimi Code 可组合会话恢复参数与单次 prompt。
3. 非交互模式不能假设有人回答权限提示：各家通过只读默认、auto 模式、显式工具规则或流式双向协议处理这一边界。
4. Codex 自 rust-v0.171.0 起可用 `codex exec --remote <ADDR>` 把非交互回合交给既有 app server 执行，配置与凭据取自服务端；其余四家的非交互入口都在调用进程本机执行。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `claude -p` |
| 入口与调用 | `claude -p "<prompt>"` 或 `--print`；也可从 stdin 读取内容，使用 `--continue` 或 `--resume` 继续会话。 |
| 协议与输出 | 默认输出纯文本；可切换 `json` 或 `stream-json`。`--input-format stream-json` 可建立双向流式调用。 |
| 具体行为 | 执行完整 Agent 循环并在结束后退出；`--bare` 可跳过 Hooks、Skills、Plugins、MCP、自动记忆和项目指令的自动发现。 |
| 会话与状态 | 默认保留会话 ID 与历史；恢复参数把后续任务追加到既有会话。 |
| 工具与能力 | 保留 Claude Code 的文件、Shell、搜索、MCP 和 Subagent 工具；可用 `--allowedTools`、`--disallowedTools` 缩小或预授权。 |
| 认证与权限 | 复用 Claude Code 登录或支持的 API/云平台认证；无人值守任务仍需预先完成认证。 |
| 运行位置 | 运行在调用 `claude` 的本机、容器或 CI Runner 中。 |
| 条件与边界 | 普通 `-p` 不能停下来等待 TUI 选择器；需要交互式工具审批时应预设权限，或使用双向 `stream-json` 输入输出。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Headless Mode](https://code.claude.com/docs/en/headless)、[Claude Code tools reference](https://code.claude.com/docs/en/tools-reference) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `codex exec` · 条件：`codex exec --remote <ADDR>` 把非交互回合交给既有 app server 执行、配置与凭据取自服务端（rust-v0.171.0 起，官方文档尚未同步） |
| 入口与调用 | `codex exec "<task>"`；stdin 可作为额外上下文，`codex exec resume` 继续既有线程。rust-v0.171.0（2026-11-20 发布）起另有 `codex exec --remote <ADDR>`：把非交互回合交给一个既有 app server（如 `codex app-server --listen ws://IP:PORT` 监听的端点，或 `unix://` 指向的本地后台 daemon）启动或恢复线程；`--remote` 与 `--remote-auth-token-env` 在 exec 上是 `global = true` 的旗标，可写在 `exec` 之前或之后，两处都写且端点不同时报 “`codex exec` received conflicting remote server endpoints”。 |
| 协议与输出 | 默认把进度写入 stderr、最终消息写入 stdout；`--json` 把 stdout 改为 JSONL 事件流。远程模式先在 stderr 打印一行 `thread id: <UUID>`（JSONL 则发出带 `thread_id` 的 `ThreadStarted` 事件），`--output-last-message` 与 `--color` 在远程模式仍可用。 |
| 具体行为 | 在没有 TUI 的情况下运行完整任务；`--ephemeral` 不把 rollout 会话写入磁盘。远程模式按源码头注释 “Execute a noninteractive turn on an existing app server, using its configuration and credentials.” 执行：客户端名为 `codex_exec`，只支持 prompt、按 UUID 恢复与输出选项，携带 `--model`、`--sandbox`、`--cd`、`--worktree`、`--image`、`--output-schema`、`-c` 配置覆盖、`--ephemeral`、`--trust`、`--yolo` 等 21 项本地覆盖会被拒绝并报 “--remote currently supports only prompt, resume by UUID, and output options; configure the agent on the server”，`exec` 与 `exec resume` 之外的子命令报 “--remote supports exec and exec resume”。 |
| 会话与状态 | 默认持久化线程，可按 ID 恢复；`--ephemeral` 只保留本次进程生命周期。远程 resume 只接受线程 UUID（`--last`、`--all` 与图片被拒，报 “remote resume requires a thread UUID”），`ThreadResume` 带 `exclude_turns: true`；目标线程仍有活动回合时报 “remote thread already has an active turn” 拒绝启动；线程的 `ephemeral` 与 `history_mode` 由服务端返回。 |
| 工具与能力 | 复用本地 Codex 工具、MCP、规则与项目配置；必需 MCP Server 初始化失败会让任务直接失败。远程模式下模型、沙箱、MCP 等 agent 配置由 app server 一侧决定（“configure the agent on the server”），发起端不加载本地覆盖。 |
| 认证与权限 | 复用 Codex CLI 登录或 API 凭据；自动化环境应在启动前注入凭据。远程模式使用 app server 自己的凭据；`--remote-auth-token-env <ENV_VAR>` 从指定环境变量读取 WebSocket 握手用的 Bearer token，必须搭配 `--remote`（否则报 “`--remote-auth-token-env` requires `--remote`.”），且只允许 `wss://` 或回环 `ws://` 端点（否则报 “`--remote-auth-token-env` requires a `wss://` or loopback `ws://` remote.”），变量未设置或 trim 后为空直接报错。 |
| 运行位置 | 运行在本机或 CI Runner；这不是 Codex Cloud，文件与命令仍发生在调用进程的工作区。远程模式例外：回合在 app server 所在进程与主机环境执行，文件与命令发生在服务端工作区，而不是发起 `codex exec` 的机器。 |
| 条件与边界 | 默认是只读沙箱；写入需显式选择 `workspace-write` 等沙箱。`danger-full-access` 只适合外部已隔离环境。远程模式审批策略固定 `Never` 且 `required_human_approval: false`，不会停下等人批准；`ADDR` 只接受 `ws://host:port`、`wss://host:port`、`unix://`（CODEX_HOME 下默认控制 socket）与 `unix://PATH`（相对路径按当前目录解析），WebSocket URL 必须带显式端口、路径为 `/` 且无 query 与 fragment；连接与 initialize 超时各 10 秒、WebSocket 消息上限 128 MiB，Ctrl+C 经中断通道传给当前回合。官方 CLI 参考与 Non-interactive mode 页到 2026-11-23 核对时都未收录 `exec --remote`，CLI 参考的 `--remote` 行仍写 “other subcommands reject remote mode”。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)、[Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)、[Codex rust-v0.171.0 发布说明（2026-11-20T00:44:47Z 发布，附注标签对象 `295eca93394bb83a6ec8e0841033f3997f97fcbd`、指向提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`）：New Features 段逐字为 “Added `/rc` and `/remote` to manage local remote control and display device pairing codes from the TUI. (#62121)”，据此确认 `/rc` 已随正式 Release 发布而不只在 main；同段另有 “Added `codex exec --remote <ADDR>` to start or resume noninteractive sessions on an existing app server. (#61707)”、“Enabled the TUI workspace by default, with searchable document previews, image previews, and subagent transcripts alongside the main conversation.” 与 “Added custom MCP status line selection and authoring through `/statusline` when `tui_extensions_statusline` is enabled.”，三项分属 `surface-headless`、TUI 工作区与 `extension-status-line` 字段；该标签下 `codex-rs/tui/src/slash_command.rs` 为 14,582 字节、`codex-rs/tui/src/app/remote_control.rs` 为 15,284 字节、`codex-rs/tui/src/chatwidget/slash_dispatch.rs` 为 60,668 字节](https://github.com/openai/codex/releases/tag/rust-v0.171.0)、[Codex PR #61707（标题 “Support remote app servers in `codex exec`”，2026-11-16 合入，合并提交 `e51c551fb406486afb7ef5c3d43387f1be3c09e8`，9 个文件改动：新增 `codex-rs/exec/src/remote.rs` +148 行，`codex-rs/cli/src/main.rs` +10/−5，`codex-rs/exec/src/cli.rs` +18，`codex-rs/exec/src/lib.rs` +12，`codex-rs/cli/tests/queue.rs` +76/−2，事件处理器三个文件与帮助快照测试 +11）：PR 说明逐字为 “Allow `codex exec --remote <ADDR>` to run a noninteractive turn using an existing app server's configuration and credentials. Support starting a new thread or resuming one by UUID, with human-readable or JSON output and optional bearer-token authentication through `--remote-auth-token-env`.” 与 “Accept remote options before or after `exec`, and reject conflicting endpoints. Reject unsupported agent configuration overrides and active threads, and report an error if the server disconnects before the turn completes.”](https://github.com/openai/codex/pull/61707)、[Codex 合并提交 `e51c551fb406486afb7ef5c3d43387f1be3c09e8`（2026-11-15T23:39:49Z 作者时间、2026-11-16T00:02:00Z 提交时间，内部 RevId `d4c3b16fb80eb6e8c523aff92110eaa878cbd3ee`，patch 18,419 字节）：`EventProcessor` trait 新增 `fn print_thread_started(&mut self, thread_id: &str);`，人类可读输出实现逐字为 `eprintln!("thread id: {thread_id}")`、JSONL 输出实现发出带 `thread_id` 的 `ThreadEvent::ThreadStarted` 事件；`exec_args_tests.rs` 的帮助文本快照逐字为 “--remote <ADDR> / Connect to an existing app server”；`cli/tests/queue.rs` 的远程测试断言人类可读输出 stderr 含以 “thread id: ” 开头的头行、JSONL 事件流含 `turn.completed`、新建线程的 `thread_id` 与被恢复线程不同、resume 后线程共有 2 个 turns，端点冲突时 stderr 含 “conflicting remote server endpoints”](https://github.com/openai/codex/commit/e51c551fb406486afb7ef5c3d43387f1be3c09e8)、[Codex `codex-rs/exec/src/cli.rs`（固定到 rust-v0.171.0 标签提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，11,470 字节）：`--remote` 与 `--remote-auth-token-env` 直接定义在 exec 的顶层 `Cli` 结构上并且都是 `global = true`（因此可写在 `exec` 之前或之后），doc comment 逐字分别为 “Connect to an existing app server.” 与 “Environment variable containing the remote WebSocket bearer token.”，`value_name` 分别是 `ADDR` 与 `ENV_VAR`；`override_usage` 为 “codex exec [OPTIONS] [PROMPT]\n       codex exec [OPTIONS] <COMMAND> [ARGS]”；该文件内没有这两个旗标的冲突或校验逻辑（`conflicts_with_all` 只出现在 `ReviewArgs`）](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/exec/src/cli.rs)、[Codex `codex-rs/exec/src/lib.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，97,496 字节）：`run_main` 开头逐字为 `if let Some(endpoint) = codex_app_server_client::resolve_remote_endpoint(cli.remote.clone(), cli.remote_auth_token_env.clone())? { return remote::run(cli, endpoint).await; }`，即带 `--remote` 时整个非交互运行改走远程分支；本地路径的 `Cli` 解构以 `remote: _`、`remote_auth_token_env: _` 丢弃这两个字段](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/exec/src/lib.rs)、[Codex `codex-rs/exec/src/remote.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，5,479 字节）：文件头注释逐字为 “Execute a noninteractive turn on an existing app server, using its configuration and credentials.”；入口 `anyhow::ensure!` 一次拒绝 21 项本地覆盖——`--trust`、`--ignore-user-config`、`--ignore-rules`、`strict_config`、`--ephemeral`、`--thread-source`、`--cyber-access-program`、`--output-schema`、`-c` 配置覆盖（`raw_overrides` 非空）、`--image`、`--model`、`--oss`、`--local-provider`、config profile v2、`--sandbox`、`--approve-for-me`、`--dangerously-bypass-approvals-and-sandbox`、`--dangerously-bypass-hook-trust`、`--cd`、`--worktree`、`--add-dir`——违反时报 “--remote currently supports only prompt, resume by UUID, and output options; configure the agent on the server”；不带子命令时发 `ThreadStart`（`approval_policy: Some(AskForApproval::Never)`）新建线程；`exec resume` 要求 `!args.last && !args.all && args.images.is_empty()` 且 `session_id` 能按 UUID 解析，否则报 “remote resume requires a thread UUID”，`ThreadResume` 带 `exclude_turns: true`；其他子命令报 “--remote supports exec and exec resume”；线程状态为 `ThreadStatus::Active` 时报 “remote thread already has an active turn”；随后 `processor.print_thread_started(&thread.id)` 并发 `TurnStart`（`turn_trigger: Some("exec")`、`approval_policy: Some(AskForApproval::Never)`、输入只有一条 `UserInput::Text`），回合收尾走 `finish_turn` 并携带 Ctrl+C 中断通道；连接参数为 `client_name: "codex_exec"`、`required_human_approval: false`、`experimental_api: true`；可用的输出选项是 `--json`、`--color` 与 `--output-last-message`（`BoundOutput::open`），线程的 `ephemeral` 与 `history_mode` 由服务端返回](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/exec/src/remote.rs)、[Codex `codex-rs/app-server-client/src/remote_addr.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，4,782 字节）：`resolve_remote_addr` 只接受四种形式——`unix://`（空路径）经 `find_codex_home()` 与 `app_server_control_socket_path()` 解析为 CODEX_HOME 下的默认控制 socket（解析失败报 “failed to resolve CODEX_HOME”）、`unix://PATH` 相对当前目录解析为绝对路径、`ws://host:port` 与 `wss://host:port` 要求有 host、显式端口（含显式默认端口 80/443）、路径恰为 `/` 且无 query 与 fragment，其余一律报 “invalid remote address `{addr}`; expected `ws://host:port`, `wss://host:port`, `unix://`, or `unix://PATH`”；`resolve_remote_endpoint` 在给了 `--remote-auth-token-env` 而没有 `--remote` 时报 “`--remote-auth-token-env` requires `--remote`.”，端点是 Unix socket 或非 `wss://`、非回环 `ws://` 的 WebSocket 时报 “`--remote-auth-token-env` requires a `wss://` or loopback `ws://` remote.”，token 按环境变量名读取并 trim，未设置报 “environment variable `{env_var_name}` is not set”、trim 后为空报 “environment variable `{env_var_name}` is empty”](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/app-server-client/src/remote_addr.rs)、[Codex `codex-rs/app-server-client/src/remote.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，45,434 字节）：`RemoteAppServerEndpoint` 分 `WebSocket { websocket_url, auth_token }` 与 `UnixSocket { socket_path }` 两种；Bearer token 只在 `wss://` 任意主机或 `ws://` 回环主机（`localhost` 大小写不敏感、IPv4 与 IPv6 loopback）时允许，允许时握手请求加 `Authorization: Bearer <token>` 头、头值非法报 “invalid remote authorization header value: {err}”，不允许时报 “remote auth tokens require `wss://` or loopback `ws://` URLs; got `{websocket_url}`”；UDS 上的 WebSocket 握手固定用 URL “ws://localhost/rpc”；连接与 initialize 超时各 10 秒（`CONNECT_TIMEOUT`、`INITIALIZE_TIMEOUT`）、WebSocket 消息与帧上限 `128 << 20`（128 MiB）、请求总带 zstd 压缩头；断开与传输类错误逐字为 “remote app server at `{endpoint}` disconnected: {reason}”、“remote app server at `{endpoint}` transport failed: {err}”、“remote app server at `{endpoint}` closed the connection” 与 initialize 阶段的同型文案](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/app-server-client/src/remote.rs)、[Codex `codex-rs/cli/src/main.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，181,740 字节）：`Subcommand::Exec` 分支在根级（`codex --remote … exec`）与 exec 级两处都给了端点且取值不同时逐字报 “`codex exec` received conflicting remote server endpoints”，随后 `exec_cli.remote = exec_cli.remote.or(root_remote)`、token 环境变量同理合并，并继承根级 `-c` 配置覆盖与 `strict_config` 后进入 `codex_exec::run_main`；交互侧 `InteractiveRemoteOptions` 的 `--remote` doc comment 逐字为 “Connect the TUI to a remote app server endpoint. Accepted forms: `ws://host:port`, `wss://host:port`, `unix://`, or `unix://PATH`.”，`--remote-auth-token-env` 为 “Name of the environment variable containing the bearer token to send to a remote app server websocket.”；不支持远程模式的子命令仍经 `reject_remote_mode_for_subcommand` 报 “`--remote {remote}` is only supported for interactive TUI commands, not `codex {subcommand}`” 与 “`--remote-auth-token-env` is only supported for interactive TUI commands, not `codex {subcommand}`”；`Subcommand` 枚举里 `Exec` 的描述是 “Run Codex non-interactively.”（别名 `e`），另有独立的 `ExecServer`（“[EXPERIMENTAL] Run the standalone exec-server service.”）与 `exec --remote` 无关](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/cli/src/main.rs)、[Codex 官方 CLI 命令参考（`https://learn.chatgpt.com/docs/cli/reference` 的 `.md` 变体，2026-11-23 核对，56,114 字节）：`globalFlagOptions` 的 `--remote` 行逐字为 “Connect to a remote app-server endpoint over WebSocket or a Unix socket. Supported for `codex`, `codex agents`, `codex queue`, `codex resume`, `codex fork`, `codex archive`, `codex delete`, and `codex unarchive`; other subcommands reject remote mode.”，`--remote-auth-token-env` 行逐字为 “Read a bearer token from this environment variable and send it when connecting with `--remote`. Requires `--remote`; tokens are only sent over `wss://` URLs or local-only `ws://` URLs.”；`codex exec` 的旗标表（`execOptions`）没有 `--remote` 也没有 `--remote-auth-token-env`，即该页尚未同步 rust-v0.171.0 起 `exec` 也支持远程模式，“other subcommands reject remote mode” 与已发布行为不一致；`### codex (interactive)` 一节另逐字为 “Use `--remote ws://host:port` or `--remote wss://host:port` to connect the TUI to an app server started with `codex app-server --listen ws://IP:PORT`. For a local Unix socket, use `--remote unix://` for the default socket or `--remote unix://PATH` for an explicit path.”，`--no-daemon` 行写 “Run the interactive CLI without the shared background server. Can't be combined with `--remote` or `codex agents`.”](https://learn.chatgpt.com/docs/cli/reference)、[Codex 官方 Non-interactive mode 页（2026-11-23 核对，HTML 464,282 字节）：全页没有 `codex exec --remote` 或 `--remote-auth-token-env` 条目，`codex exec` 的旗标清单仍为 `--ephemeral`、`--sandbox`、`--approve-for-me`、`--trust`、`--ignore-user-config`、`--ignore-rules`、`--json`、`-o/--output-last-message`、`--output-schema`、`--skip-git-repo-check`、`-`（stdin 哨兵）与 `resume` 子命令（`--last` 或 `<SESSION_ID>`）等；全页唯一涉及 remote 的句子逐字为 “You can use `CODEX_API_KEY` with `codex exec`, `codex review`, the TypeScript SDK, and `codex exec-server --remote`.”，其中 `exec-server` 是 rust-v0.171.0 `main.rs` 枚举里独立的 “[EXPERIMENTAL] Run the standalone exec-server service” 子命令、与 `codex exec --remote` 无关，即官方非交互文档尚未同步该能力](https://learn.chatgpt.com/docs/non-interactive-mode) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen -p` |
| 入口与调用 | `qwen -p "<prompt>"`、`--prompt` 或管道 stdin；`--continue`、`--resume <id>` 可在当前项目恢复会话。 |
| 协议与输出 | 支持 `text`、`json` 和 `stream-json`；后者同时支持长连接式 `stream-json` 输入协议。 |
| 具体行为 | 执行与 TUI 相同的 Agent 循环并以退出码结束；可用 `--system-prompt`、`--append-system-prompt` 和 `--bare` 调整启动上下文。 |
| 会话与状态 | 会话按项目保存到本地 JSONL；恢复时还原历史、工具输出和压缩检查点。 |
| 工具与能力 | 支持内置工具、MCP、Skills、Subagent 与 Hooks；Headless 下无可用审批界面时会按 approval mode 自动拒绝或取消请求。 |
| 认证与权限 | 复用 Qwen Code Provider 与凭据配置；也可在 CI 中注入 OpenAI 兼容端点所需环境变量。 |
| 运行位置 | 运行在调用 `qwen` 的本机、容器或 CI Runner。 |
| 条件与边界 | 需要动态批准工具时应使用双向 `stream-json`；普通非交互输出无法展示 TUI 权限提示。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)、[Qwen Code current structured output](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/structured-output.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `kimi -p` |
| 入口与调用 | `kimi -p "<prompt>"` 或 `--prompt`；可配合 `--continue`、`--session <id>` 和 `--model`。 |
| 协议与输出 | 默认 transcript 风格文本；`--output-format stream-json` 逐行输出 Assistant 与 Tool 消息。 |
| 具体行为 | 不打开 TUI，Assistant 正文写 stdout，thinking、工具进度和恢复提示写 stderr。 |
| 会话与状态 | 可恢复当前目录最近会话或指定会话；执行仍写入 Kimi Code 的本地会话目录。 |
| 工具与能力 | 普通工具固定按 `auto` 权限策略执行，静态 deny 规则继续生效。 |
| 认证与权限 | 复用 `kimi login` 或 Provider 配置；脚本启动前必须已有可用认证。 |
| 运行位置 | 运行在调用 `kimi` 的本机或 CI Runner。 |
| 条件与边界 | `--prompt` 不能与 `--yolo`、`--auto` 或 `--plan` 同时使用；当前仅 `text` 与 `stream-json` 两种输出格式。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qodercli -p` |
| 入口与调用 | `qodercli -p "<prompt>"` 或 `--print`；`-c` 继续最近会话，`-r <id>` 恢复指定会话。 |
| 协议与输出 | `--output-format` 支持 `text`、`json`、`stream-json`。 |
| 具体行为 | 在指定 workspace 中运行完整 Agent 任务；可设置最大轮数、工具列表、Worktree 和 YOLO。 |
| 会话与状态 | 默认保留本地会话；`-c` 与 `-r` 复用历史。 |
| 工具与能力 | `--allowed-tools`、`--disallowed-tools` 与 `--max-turns` 控制非交互任务；`--worktree` 可把写入隔离到新 Worktree。 |
| 认证与权限 | 复用 Qoder CLI 登录，或通过 `QODER_PERSONAL_ACCESS_TOKEN` 为自动化环境认证。 |
| 运行位置 | 运行在调用 `qodercli` 的本机、容器或 CI Runner。 |
| 条件与边界 | Print Mode 与 Cloud Mode 不同；`qodercli --remote` 创建的是托管云任务，不属于本页的本地 Headless。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)、[Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions) |

## 官方来源

- [Claude Code Headless Mode](https://code.claude.com/docs/en/headless)
- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Codex rust-v0.171.0 发布说明（2026-11-20T00:44:47Z 发布，附注标签对象 `295eca93394bb83a6ec8e0841033f3997f97fcbd`、指向提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`）：New Features 段逐字为 “Added `/rc` and `/remote` to manage local remote control and display device pairing codes from the TUI. (#62121)”，据此确认 `/rc` 已随正式 Release 发布而不只在 main；同段另有 “Added `codex exec --remote <ADDR>` to start or resume noninteractive sessions on an existing app server. (#61707)”、“Enabled the TUI workspace by default, with searchable document previews, image previews, and subagent transcripts alongside the main conversation.” 与 “Added custom MCP status line selection and authoring through `/statusline` when `tui_extensions_statusline` is enabled.”，三项分属 `surface-headless`、TUI 工作区与 `extension-status-line` 字段；该标签下 `codex-rs/tui/src/slash_command.rs` 为 14,582 字节、`codex-rs/tui/src/app/remote_control.rs` 为 15,284 字节、`codex-rs/tui/src/chatwidget/slash_dispatch.rs` 为 60,668 字节](https://github.com/openai/codex/releases/tag/rust-v0.171.0)
- [Codex PR #61707（标题 “Support remote app servers in `codex exec`”，2026-11-16 合入，合并提交 `e51c551fb406486afb7ef5c3d43387f1be3c09e8`，9 个文件改动：新增 `codex-rs/exec/src/remote.rs` +148 行，`codex-rs/cli/src/main.rs` +10/−5，`codex-rs/exec/src/cli.rs` +18，`codex-rs/exec/src/lib.rs` +12，`codex-rs/cli/tests/queue.rs` +76/−2，事件处理器三个文件与帮助快照测试 +11）：PR 说明逐字为 “Allow `codex exec --remote <ADDR>` to run a noninteractive turn using an existing app server's configuration and credentials. Support starting a new thread or resuming one by UUID, with human-readable or JSON output and optional bearer-token authentication through `--remote-auth-token-env`.” 与 “Accept remote options before or after `exec`, and reject conflicting endpoints. Reject unsupported agent configuration overrides and active threads, and report an error if the server disconnects before the turn completes.”](https://github.com/openai/codex/pull/61707)
- [Codex 合并提交 `e51c551fb406486afb7ef5c3d43387f1be3c09e8`（2026-11-15T23:39:49Z 作者时间、2026-11-16T00:02:00Z 提交时间，内部 RevId `d4c3b16fb80eb6e8c523aff92110eaa878cbd3ee`，patch 18,419 字节）：`EventProcessor` trait 新增 `fn print_thread_started(&mut self, thread_id: &str);`，人类可读输出实现逐字为 `eprintln!("thread id: {thread_id}")`、JSONL 输出实现发出带 `thread_id` 的 `ThreadEvent::ThreadStarted` 事件；`exec_args_tests.rs` 的帮助文本快照逐字为 “--remote <ADDR> / Connect to an existing app server”；`cli/tests/queue.rs` 的远程测试断言人类可读输出 stderr 含以 “thread id: ” 开头的头行、JSONL 事件流含 `turn.completed`、新建线程的 `thread_id` 与被恢复线程不同、resume 后线程共有 2 个 turns，端点冲突时 stderr 含 “conflicting remote server endpoints”](https://github.com/openai/codex/commit/e51c551fb406486afb7ef5c3d43387f1be3c09e8)
- [Codex `codex-rs/exec/src/cli.rs`（固定到 rust-v0.171.0 标签提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，11,470 字节）：`--remote` 与 `--remote-auth-token-env` 直接定义在 exec 的顶层 `Cli` 结构上并且都是 `global = true`（因此可写在 `exec` 之前或之后），doc comment 逐字分别为 “Connect to an existing app server.” 与 “Environment variable containing the remote WebSocket bearer token.”，`value_name` 分别是 `ADDR` 与 `ENV_VAR`；`override_usage` 为 “codex exec [OPTIONS] [PROMPT]\n       codex exec [OPTIONS] <COMMAND> [ARGS]”；该文件内没有这两个旗标的冲突或校验逻辑（`conflicts_with_all` 只出现在 `ReviewArgs`）](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/exec/src/cli.rs)
- [Codex `codex-rs/exec/src/lib.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，97,496 字节）：`run_main` 开头逐字为 `if let Some(endpoint) = codex_app_server_client::resolve_remote_endpoint(cli.remote.clone(), cli.remote_auth_token_env.clone())? { return remote::run(cli, endpoint).await; }`，即带 `--remote` 时整个非交互运行改走远程分支；本地路径的 `Cli` 解构以 `remote: _`、`remote_auth_token_env: _` 丢弃这两个字段](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/exec/src/lib.rs)
- [Codex `codex-rs/exec/src/remote.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，5,479 字节）：文件头注释逐字为 “Execute a noninteractive turn on an existing app server, using its configuration and credentials.”；入口 `anyhow::ensure!` 一次拒绝 21 项本地覆盖——`--trust`、`--ignore-user-config`、`--ignore-rules`、`strict_config`、`--ephemeral`、`--thread-source`、`--cyber-access-program`、`--output-schema`、`-c` 配置覆盖（`raw_overrides` 非空）、`--image`、`--model`、`--oss`、`--local-provider`、config profile v2、`--sandbox`、`--approve-for-me`、`--dangerously-bypass-approvals-and-sandbox`、`--dangerously-bypass-hook-trust`、`--cd`、`--worktree`、`--add-dir`——违反时报 “--remote currently supports only prompt, resume by UUID, and output options; configure the agent on the server”；不带子命令时发 `ThreadStart`（`approval_policy: Some(AskForApproval::Never)`）新建线程；`exec resume` 要求 `!args.last && !args.all && args.images.is_empty()` 且 `session_id` 能按 UUID 解析，否则报 “remote resume requires a thread UUID”，`ThreadResume` 带 `exclude_turns: true`；其他子命令报 “--remote supports exec and exec resume”；线程状态为 `ThreadStatus::Active` 时报 “remote thread already has an active turn”；随后 `processor.print_thread_started(&thread.id)` 并发 `TurnStart`（`turn_trigger: Some("exec")`、`approval_policy: Some(AskForApproval::Never)`、输入只有一条 `UserInput::Text`），回合收尾走 `finish_turn` 并携带 Ctrl+C 中断通道；连接参数为 `client_name: "codex_exec"`、`required_human_approval: false`、`experimental_api: true`；可用的输出选项是 `--json`、`--color` 与 `--output-last-message`（`BoundOutput::open`），线程的 `ephemeral` 与 `history_mode` 由服务端返回](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/exec/src/remote.rs)
- [Codex `codex-rs/app-server-client/src/remote_addr.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，4,782 字节）：`resolve_remote_addr` 只接受四种形式——`unix://`（空路径）经 `find_codex_home()` 与 `app_server_control_socket_path()` 解析为 CODEX_HOME 下的默认控制 socket（解析失败报 “failed to resolve CODEX_HOME”）、`unix://PATH` 相对当前目录解析为绝对路径、`ws://host:port` 与 `wss://host:port` 要求有 host、显式端口（含显式默认端口 80/443）、路径恰为 `/` 且无 query 与 fragment，其余一律报 “invalid remote address `{addr}`; expected `ws://host:port`, `wss://host:port`, `unix://`, or `unix://PATH`”；`resolve_remote_endpoint` 在给了 `--remote-auth-token-env` 而没有 `--remote` 时报 “`--remote-auth-token-env` requires `--remote`.”，端点是 Unix socket 或非 `wss://`、非回环 `ws://` 的 WebSocket 时报 “`--remote-auth-token-env` requires a `wss://` or loopback `ws://` remote.”，token 按环境变量名读取并 trim，未设置报 “environment variable `{env_var_name}` is not set”、trim 后为空报 “environment variable `{env_var_name}` is empty”](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/app-server-client/src/remote_addr.rs)
- [Codex `codex-rs/app-server-client/src/remote.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，45,434 字节）：`RemoteAppServerEndpoint` 分 `WebSocket { websocket_url, auth_token }` 与 `UnixSocket { socket_path }` 两种；Bearer token 只在 `wss://` 任意主机或 `ws://` 回环主机（`localhost` 大小写不敏感、IPv4 与 IPv6 loopback）时允许，允许时握手请求加 `Authorization: Bearer <token>` 头、头值非法报 “invalid remote authorization header value: {err}”，不允许时报 “remote auth tokens require `wss://` or loopback `ws://` URLs; got `{websocket_url}`”；UDS 上的 WebSocket 握手固定用 URL “ws://localhost/rpc”；连接与 initialize 超时各 10 秒（`CONNECT_TIMEOUT`、`INITIALIZE_TIMEOUT`）、WebSocket 消息与帧上限 `128 << 20`（128 MiB）、请求总带 zstd 压缩头；断开与传输类错误逐字为 “remote app server at `{endpoint}` disconnected: {reason}”、“remote app server at `{endpoint}` transport failed: {err}”、“remote app server at `{endpoint}` closed the connection” 与 initialize 阶段的同型文案](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/app-server-client/src/remote.rs)
- [Codex `codex-rs/cli/src/main.rs`（固定到 rust-v0.171.0 提交 `ccf9be8cc458bd6b8336fe84d68d8893f2691a5e`，181,740 字节）：`Subcommand::Exec` 分支在根级（`codex --remote … exec`）与 exec 级两处都给了端点且取值不同时逐字报 “`codex exec` received conflicting remote server endpoints”，随后 `exec_cli.remote = exec_cli.remote.or(root_remote)`、token 环境变量同理合并，并继承根级 `-c` 配置覆盖与 `strict_config` 后进入 `codex_exec::run_main`；交互侧 `InteractiveRemoteOptions` 的 `--remote` doc comment 逐字为 “Connect the TUI to a remote app server endpoint. Accepted forms: `ws://host:port`, `wss://host:port`, `unix://`, or `unix://PATH`.”，`--remote-auth-token-env` 为 “Name of the environment variable containing the bearer token to send to a remote app server websocket.”；不支持远程模式的子命令仍经 `reject_remote_mode_for_subcommand` 报 “`--remote {remote}` is only supported for interactive TUI commands, not `codex {subcommand}`” 与 “`--remote-auth-token-env` is only supported for interactive TUI commands, not `codex {subcommand}`”；`Subcommand` 枚举里 `Exec` 的描述是 “Run Codex non-interactively.”（别名 `e`），另有独立的 `ExecServer`（“[EXPERIMENTAL] Run the standalone exec-server service.”）与 `exec --remote` 无关](https://github.com/openai/codex/blob/ccf9be8cc458bd6b8336fe84d68d8893f2691a5e/codex-rs/cli/src/main.rs)
- [Codex 官方 CLI 命令参考（`https://learn.chatgpt.com/docs/cli/reference` 的 `.md` 变体，2026-11-23 核对，56,114 字节）：`globalFlagOptions` 的 `--remote` 行逐字为 “Connect to a remote app-server endpoint over WebSocket or a Unix socket. Supported for `codex`, `codex agents`, `codex queue`, `codex resume`, `codex fork`, `codex archive`, `codex delete`, and `codex unarchive`; other subcommands reject remote mode.”，`--remote-auth-token-env` 行逐字为 “Read a bearer token from this environment variable and send it when connecting with `--remote`. Requires `--remote`; tokens are only sent over `wss://` URLs or local-only `ws://` URLs.”；`codex exec` 的旗标表（`execOptions`）没有 `--remote` 也没有 `--remote-auth-token-env`，即该页尚未同步 rust-v0.171.0 起 `exec` 也支持远程模式，“other subcommands reject remote mode” 与已发布行为不一致；`### codex (interactive)` 一节另逐字为 “Use `--remote ws://host:port` or `--remote wss://host:port` to connect the TUI to an app server started with `codex app-server --listen ws://IP:PORT`. For a local Unix socket, use `--remote unix://` for the default socket or `--remote unix://PATH` for an explicit path.”，`--no-daemon` 行写 “Run the interactive CLI without the shared background server. Can't be combined with `--remote` or `codex agents`.”](https://learn.chatgpt.com/docs/cli/reference)
- [Codex 官方 Non-interactive mode 页（2026-11-23 核对，HTML 464,282 字节）：全页没有 `codex exec --remote` 或 `--remote-auth-token-env` 条目，`codex exec` 的旗标清单仍为 `--ephemeral`、`--sandbox`、`--approve-for-me`、`--trust`、`--ignore-user-config`、`--ignore-rules`、`--json`、`-o/--output-last-message`、`--output-schema`、`--skip-git-repo-check`、`-`（stdin 哨兵）与 `resume` 子命令（`--last` 或 `<SESSION_ID>`）等；全页唯一涉及 remote 的句子逐字为 “You can use `CODEX_API_KEY` with `codex exec`, `codex review`, the TypeScript SDK, and `codex exec-server --remote`.”，其中 `exec-server` 是 rust-v0.171.0 `main.rs` 枚举里独立的 “[EXPERIMENTAL] Run the standalone exec-server service” 子命令、与 `codex exec --remote` 无关，即官方非交互文档尚未同步该能力](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)
- [Qwen Code current structured output](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/structured-output.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)

## 关联能力

- [结构化输出](./surface-structured-output.md)
- [Agent SDK](./surface-sdk.md)
- [非交互审批](../security/security-noninteractive.md)
