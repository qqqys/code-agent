# 服务端与 Daemon

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-service)

> 核对日期：2026-07-31

## 定义

把 Agent 作为可被其他程序或设备连接的长驻进程运行，通过 stdio、HTTP、SSE、WebSocket、ACP 或 MCP 管理会话和事件。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Agent SDK · Remote Control 服务 | 条件项 |
| Codex | `codex app-server` · `mcp-server` | 官方确认 |
| Qwen Code | `qwen serve` HTTP + SSE | 条件项 |
| Kimi Code | `kimi web` REST + WebSocket | 源码确认 |
| Qoder CLI | `qodercli --acp` · `remote-control` Daemon | 条件项 |

## 比较边界

### 本页包含

- 面向客户端集成的协议服务器
- 本地常驻服务和远程终端连接
- 会话、事件、权限与认证边界

### 本页不包含

- 单次 Headless 子进程
- 单纯的云端任务网页
- 只消费外部 MCP Server 的客户端能力

## 跨产品事实

1. Codex 的 app-server、Qwen 的 qwen serve 和 Kimi 的 kimi web 都提供面向富客户端的双向服务，但协议分别是 JSON-RPC、HTTP + SSE、REST + WebSocket。
2. Qoder 的 ACP Server 面向 IDE，Remote Control Daemon 面向 Qoder Web/移动端；它不是公开的本地 HTTP Agent API。
3. Claude Code 的 Agent SDK 和 Remote Control 可承载长运行会话，但官方没有把通用本地 HTTP Agent Daemon 作为开发者接口。

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
| 矩阵结论 | `codex app-server` · `mcp-server` |
| 入口与调用 | `codex app-server`；`codex mcp-server`；远程 TUI 可用 `app-server --listen` 配合 `codex --remote`。 |
| 协议与输出 | app-server 使用双向 JSON-RPC，默认 stdio JSONL，也支持 Unix socket；WebSocket transport 标为实验且不受支持。MCP Server 使用 stdio MCP。 |
| 具体行为 | app-server 提供认证、线程历史、审批和流式 Agent 事件；MCP Server 暴露 `codex` 与 `codex-reply` 工具。 |
| 会话与状态 | 一个服务可管理多个 thread/turn；远程终端连接到服务端工作区而非复制文件。 |
| 工具与能力 | 完整 Codex 工具、审批、MCP 和沙箱由 app-server 统一执行；MCP Server 可被上层 Agents SDK 编排。 |
| 认证与权限 | stdio/Unix 依赖本机边界；非本地 WebSocket 要配置 capability token 或签名 bearer，并置于 TLS 后。 |
| 运行位置 | 可运行在本机、远程开发机或产品后端；CLI TUI 可跨机器连接。 |
| 条件与边界 | WebSocket 明确是 experimental/unsupported；远程暴露必须使用 WSS、认证或 SSH 端口转发。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex App Server](https://learn.chatgpt.com/docs/app-server)、[Codex as an MCP server](https://learn.chatgpt.com/docs/mcp-server) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen serve` HTTP + SSE |
| 入口与调用 | `qwen serve`，默认 `127.0.0.1:4170`；可加 `--open`、`--no-web`、`--workspace` 和 bearer token。 |
| 协议与输出 | HTTP REST 管理会话与工作区，SSE 推送事件；内部通过一个或多个 `qwen --acp` 子进程承载 Agent。 |
| 具体行为 | 多客户端共享会话、权限请求和 Diff；SSE 支持 `Last-Event-ID` 重连，Web Shell 与 API 同源。 |
| 会话与状态 | 持久化 transcript 可分页读取和恢复；活跃进程状态在 daemon 重启后需重新加载，跨重启队列需应用层处理。 |
| 工具与能力 | 客户端可查询或控制工具、Skills、MCP、Approval mode、工作区和 Channel；严格变更路由要求 token。 |
| 认证与权限 | loopback 默认可无 token；非 loopback 绑定必须配置 bearer，远程设备登录可走 device flow。 |
| 运行位置 | 当前 v0.16-alpha 定位为本地单机、单用户或小团队；支持 launchd/systemd/nohup，但不承诺容器与多 daemon 协调。 |
| 条件与边界 | Stage 1 experimental，首版仅文本 prompt；生产级多客户端、网络抖动、容器和跨主机保证仍有明确限制。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)、[Qwen Code current TypeScript SDK](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `kimi web` REST + WebSocket |
| 入口与调用 | `kimi web` 前台启动；可用 `--no-open`、`--port`、`--host`、`--allowed-host` 和 `rotate-token`。 |
| 协议与输出 | 同一进程提供 REST、WebSocket、Web UI，以及 `/openapi.json` 和 `/asyncapi.json`。 |
| 具体行为 | 承载会话、prompt、工具流和本地文件访问；一个 home 下可启动多个实例并注册到 instances 目录。 |
| 会话与状态 | 会话与服务 token 保存在 Kimi Code home；服务前台运行，SIGINT/SIGTERM 时退出。 |
| 工具与能力 | Web 客户端驱动与 TUI 相同的 Agent 工具；VS Code/ACP 使用另一套进程入口。 |
| 认证与权限 | 默认生成并要求 bearer token；Web UI 从 URL fragment 读取 token。可旋转 token。 |
| 运行位置 | 默认 loopback 本地服务；可绑定 `0.0.0.0`，但网络、TLS 和访问控制由部署者负责。 |
| 条件与边界 | `--dangerous-bypass-auth` 会让任何可达客户端控制会话、文件和 Shell，只能放在可信网络或自有鉴权代理之后。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qodercli --acp` · `remote-control` Daemon |
| 入口与调用 | `qodercli --acp` 启动 IDE 协议服务器；`qodercli remote-control` 启动面向移动端的后台 Daemon。 |
| 协议与输出 | ACP 使用 stdin/stdout 标准协议；Remote Control 使用 Qoder 账号与云端中继连接 Qoder Web/移动端。 |
| 具体行为 | ACP 允许 IDE 创建会话、使用工具和处理权限；Remote Control Daemon 可连续接收多个远程任务。 |
| 会话与状态 | ACP 状态随宿主子进程；Remote Control Daemon 在本机持续运行并可串行或并行处理任务。 |
| 工具与能力 | ACP 提供 CLI 同款内置工具、Subagent、MCP、权限、压缩和多模态。 |
| 认证与权限 | ACP 复用 CLI 登录或 PAT；Remote Control 要求同一 Qoder 账号，并通过二维码/URL 配对。 |
| 运行位置 | 两种服务都运行在本机；Remote Control 的文件与 Shell 仍在本机执行。 |
| 条件与边界 | Remote Control Daemon 不是 Qoder Cloud Mode：本机必须保持在线，也没有公开通用 HTTP 客户端协议。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI ACP](https://docs.qoder.com/en/cli/acp)、[Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control) |

## 官方来源

- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
- [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control)
- [Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [Codex as an MCP server](https://learn.chatgpt.com/docs/mcp-server)
- [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)
- [Qwen Code current TypeScript SDK](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Qoder CLI ACP](https://docs.qoder.com/en/cli/acp)
- [Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control)

## 关联能力

- [Agent SDK](./surface-sdk.md)
- [Web 界面](./surface-web.md)
- [远程接管与跨端继续](./surface-remote-control.md)
