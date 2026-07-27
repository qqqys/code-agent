# 远程接管与跨端继续

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-remote-control)

> 核对日期：2026-07-27

## 定义

让另一个终端、浏览器或移动设备接入正在运行的本地 Agent，或把托管会话带回本地继续；需要区分本机执行与云端执行。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/remote-control` · `/teleport` | 官方确认 |
| Codex | `app-server --listen` · `codex --remote` · Cloud | 条件项 |
| Qwen Code | `qwen serve` 多客户端；需自建网络 | 条件项 |
| Kimi Code | `kimi web --host`；需自建网络 | 条件项 |
| Qoder CLI | `/remote-control` · `qodercli remote-control` | 官方确认 |

## 比较边界

### 本页包含

- 远程控制本机会话
- 跨机器终端连接
- 本地与云端会话的继续或传送

### 本页不包含

- 只查看静态日志
- 普通 SSH 后手工启动另一会话
- 把所有云任务统称为远程控制

## 跨产品事实

1. Claude 与 Qoder 提供账号中继的本地会话远程控制，浏览器/手机可处理审批并继续发消息。
2. Codex app-server 可让另一个 CLI TUI 跨机器连接服务端 workspace；Qwen serve 与 kimi web 也能被远程客户端连接，但网络由用户自建。
3. Claude teleport 是把云会话与分支拉回 CLI；它与 Remote Control 同品牌但状态移动方式不同。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/remote-control` · `/teleport` |
| 入口与调用 | 本地 `/remote-control`、`/rc` 或 `claude remote-control`；云转本地用 `--teleport`、`/teleport`。 |
| 协议与输出 | Remote Control 通过 Claude 账号中继连接 claude.ai/code 或移动 App；teleport 拉取云分支和完整对话。 |
| 具体行为 | 终端、浏览器和手机可同时发送消息、查看状态与审批；本地工具和文件不上传到 Cloud runtime。 |
| 会话与状态 | Remote Control 保持一个本地会话；teleport 把 Cloud session 的分支与历史恢复到本地 CLI。 |
| 工具与能力 | Remote Control 使用本机文件、MCP、工具和项目配置；teleport 后使用本地环境。 |
| 认证与权限 | 同一 Claude 账号、短期连接 token 和组织 Remote Control 开关。 |
| 运行位置 | Remote Control 执行留在本机；teleport 的起点是 Anthropic Cloud。 |
| 条件与边界 | 本机睡眠或离线时 Remote Control 暂停并等待重连；不能把它当作本机关闭仍运行的 Cloud task。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control)、[Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `app-server --listen` · `codex --remote` · Cloud |
| 入口与调用 | 服务端 `codex app-server --listen ws://...`，客户端 `codex --remote <endpoint>`；Cloud task 可从 Web/CLI 继续。 |
| 协议与输出 | 远程 TUI 使用 WebSocket/Unix socket 上的 app-server JSON-RPC；Cloud 使用账号侧任务 Surface。 |
| 具体行为 | 远端 CLI 操作服务端工作区、审批和线程；Cloud 任务可从另一设备查看和继续。 |
| 会话与状态 | app-server thread 与文件留在服务端；Cloud thread 留在账号和云环境。 |
| 工具与能力 | 远程 TUI 使用服务端 Codex 工具、沙箱和文件；Cloud 使用配置的环境工具。 |
| 认证与权限 | 非本地 WebSocket 要求 token、WSS/TLS 或 SSH 转发；Cloud 使用 ChatGPT/Codex 账号。 |
| 运行位置 | 自管 app-server 远程主机，或 OpenAI 托管 Cloud。 |
| 条件与边界 | WebSocket transport 当前标为 experimental/unsupported；这不是 Qoder/Claude 式移动端账号中继。 |
| 证据状态 | 条件项 |
| 来源 | [Codex App Server](https://learn.chatgpt.com/docs/app-server)、[Codex cloud](https://learn.chatgpt.com/docs/cloud) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen serve` 多客户端；需自建网络 |
| 入口与调用 | 远程客户端连接 `qwen serve`；Web Shell、SDK DaemonClient 或 Channel 都可成为客户端。 |
| 协议与输出 | HTTP + SSE；多客户端可共享会话和权限请求，SSE 使用 Last-Event-ID 重连。 |
| 具体行为 | 远程浏览器或自定义客户端发送 prompt、处理审批、查看 Diff 与会话状态；文件操作发生在 daemon 主机。 |
| 会话与状态 | 会话和 transcript 留在 daemon 主机；客户端重连可恢复事件窗口或加载历史。 |
| 工具与能力 | 使用 daemon workspace 的 Qwen 工具、MCP、Skills 与 Channel。 |
| 认证与权限 | 非 loopback 必须 bearer token；远程设备登录可由 daemon device flow 完成。 |
| 运行位置 | 用户自建网络和服务主机；当前不是 Qwen 账号托管的全局中继。 |
| 条件与边界 | qwen serve alpha 明确以本地单机/小团队为边界；生产跨公网需自行承担 TLS、代理、故障恢复和版本协商。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)、[Qwen Code current TypeScript SDK](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `kimi web --host`；需自建网络 |
| 入口与调用 | `kimi web --host 0.0.0.0` 或指定地址，让其他设备打开 Web UI/API。 |
| 协议与输出 | REST + WebSocket，bearer token 鉴权；部署者负责网络可达性。 |
| 具体行为 | 远程浏览器可发送 prompt、查看工具与文件；执行仍发生在运行 kimi web 的主机。 |
| 会话与状态 | 会话、文件和 token 留在服务主机；服务退出后连接结束。 |
| 工具与能力 | 使用服务主机上的 Kimi 工具、Shell 和 Provider。 |
| 认证与权限 | 默认 bearer token，可轮换；不得在公网使用 bypass-auth。 |
| 运行位置 | 自管本机或远程服务器，没有官方账号中继。 |
| 条件与边界 | 当前没有托管跨端 handoff 或移动端 Remote Control；只有可远程部署的本地 Web 服务。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/remote-control` · `qodercli remote-control` |
| 入口与调用 | 会话内 `/remote-control`；后台模式 `qodercli remote-control`；Web 入口 `qoder.com/agents`。 |
| 协议与输出 | Qoder 账号中继连接本地 CLI、Qoder Web 和移动 App。 |
| 具体行为 | 查看本地任务、批准/拒绝操作、发送新任务；Daemon 模式可在没有预先打开会话时接收多个任务。 |
| 会话与状态 | 任务、文件和命令留在本机；Web/移动端同步状态与控制消息。 |
| 工具与能力 | 使用本地 qodercli 的全部 workspace 工具和权限。 |
| 认证与权限 | 同一 Qoder 账号，通过二维码或 URL 配对。 |
| 运行位置 | 本机 CLI 必须持续运行和联网；Web/移动前端由 Qoder 托管。 |
| 条件与边界 | 与 `qodercli --remote` Cloud Mode 不同：Remote Control 本机离线就无法继续，Cloud Mode 不依赖本机。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control)、[Qoder Web remote and cloud tasks](https://docs.qoder.com/mobile/web/remote-control) |

## 官方来源

- [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control)
- [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [Codex cloud](https://learn.chatgpt.com/docs/cloud)
- [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)
- [Qwen Code current TypeScript SDK](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control)
- [Qoder Web remote and cloud tasks](https://docs.qoder.com/mobile/web/remote-control)

## 关联能力

- [服务端与 Daemon](./surface-service.md)
- [Web 界面](./surface-web.md)
- [云端仓库任务](./surface-cloud.md)
