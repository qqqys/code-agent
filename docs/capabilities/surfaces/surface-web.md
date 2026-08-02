# Web 界面

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-web)

> 核对日期：2026-08-02

## 定义

在浏览器中创建、查看、审批或继续 Agent 会话；既包括托管 Web 产品，也包括 CLI 自带的本地 Web UI。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | claude.ai/code · Remote Control | 官方确认 |
| Codex | ChatGPT Web · Codex Cloud | 官方确认 |
| Qwen Code | `qwen serve` 内置 Web Shell | 条件项 |
| Kimi Code | `kimi web` 本地 Web UI | 条件项 |
| Qoder CLI | Qoder Web · Cloud Agents Console | 官方确认 |

## 比较边界

### 本页包含

- 托管 Web Agent 界面
- 本地 Agent Web Shell
- 浏览器中的会话、Diff、审批和任务管理

### 本页不包含

- 只在浏览器完成账号登录
- IDE 内嵌 Webview
- 没有会话控制能力的静态报告页

## 跨产品事实

1. Claude、Codex 与 Qoder 提供账号托管的 Web Surface；Qwen 和 Kimi 当前提供由本地服务进程托管的 Web UI。
2. 本地 Web UI 能否从其他设备访问取决于网络、绑定地址、TLS 与 token；它不自动成为厂商托管云服务。
3. Web Surface 的工具、命令和文件位置取决于会话实际运行在本机还是云端。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | claude.ai/code · Remote Control |
| 入口与调用 | claude.ai/code 创建 Cloud session；Remote Control 页面打开本地会话。 |
| 协议与输出 | 托管 Web 应用；Cloud session 连接 Anthropic VM，Remote Control 通过账号中继连接本机。 |
| 具体行为 | 创建/监控任务、查看 Diff、留言继续、审批、共享和归档会话。 |
| 会话与状态 | Cloud 会话保存在账号侧并可从 CLI teleport；Remote Control 状态由本地进程持有。 |
| 工具与能力 | Cloud 使用克隆仓库中的项目配置；Remote Control 使用本机完整工具与文件。 |
| 认证与权限 | Claude 账号；Cloud 通常连接 GitHub，Remote Control 要求同一账号与组织允许。 |
| 运行位置 | 浏览器端由 Anthropic 托管；执行位置按 Cloud 或 Remote Control 分开。 |
| 条件与边界 | 不要把 Remote Control 与 Cloud 混写：前者本机执行，后者在托管 VM 中执行。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)、[Claude Code Remote Control](https://code.claude.com/docs/en/remote-control) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | ChatGPT Web · Codex Cloud |
| 入口与调用 | ChatGPT Web 中选择 Codex；Codex Cloud 页面创建和管理 coding task。 |
| 协议与输出 | OpenAI 托管 Web 产品，连接 Codex Cloud 环境与账号线程。 |
| 具体行为 | 选择仓库/环境，后台运行任务，查看日志、摘要和 Diff，继续任务并创建 Pull Request。 |
| 会话与状态 | Cloud chats 与 code reviews 保存在账号/工作区，可从 Web、CLI 或集成继续查看。 |
| 工具与能力 | 工具在配置的云环境中运行；依赖、环境变量、secrets 和网络由 environment 管理。 |
| 认证与权限 | ChatGPT/Codex 账号与 GitHub 授权。 |
| 运行位置 | Web 前端和 Agent 运行环境均由 OpenAI 托管。 |
| 条件与边界 | 本地 CLI 和 IDE 的未提交文件不会自动出现在 Cloud；任务基于所连仓库和云环境。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex cloud](https://learn.chatgpt.com/docs/cloud)、[ChatGPT desktop app](https://learn.chatgpt.com/docs/app) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen serve` 内置 Web Shell |
| 入口与调用 | `qwen serve` 根路径自带 Web Shell；`--open` 自动打开浏览器，`--no-web` 可禁用。 |
| 协议与输出 | 同源静态 Web App 通过 HTTP REST 与 SSE 连接本地 daemon。 |
| 具体行为 | 提供聊天、Diff、提交历史、工具调用、权限请求、会话与工作区管理。 |
| 会话与状态 | 会话由本地 daemon 和磁盘 transcript 管理；多浏览器客户端可共享同一会话。 |
| 工具与能力 | Web Shell 使用 qwen serve 背后的 ACP 运行时和本地工具。 |
| 认证与权限 | loopback 可无 token；共享或非 loopback 访问必须使用 bearer token。 |
| 运行位置 | Web UI 与 API 由用户机器上的 qwen serve 提供，不是 Qwen 托管 Web 产品。 |
| 条件与边界 | 当前 Daemon 为实验性本地部署；远程暴露需要自行处理网络和安全边界。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `kimi web` 本地 Web UI |
| 入口与调用 | `kimi web` 启动并打开本地 Web UI；`--no-open` 只启动服务。 |
| 协议与输出 | Web UI 通过同进程 REST + WebSocket API 工作；服务公开 OpenAPI 与 AsyncAPI。 |
| 具体行为 | 在浏览器中管理会话、发送 prompt、展示工具、Diff、文件和媒体。 |
| 会话与状态 | 使用本地 Kimi 会话与 home；多个服务实例可并存。 |
| 工具与能力 | 调用本地 Agent 的文件、Shell、搜索与 MCP 工具。 |
| 认证与权限 | 默认 bearer token；URL fragment 把 token 传给 Web UI，支持 rotate-token。 |
| 运行位置 | 默认只在 loopback；可绑定其他地址但仍是用户自托管。 |
| 条件与边界 | 不是 Kimi 托管云任务；关闭前台 `kimi web` 进程后 Web 会话服务停止。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Qoder Web · Cloud Agents Console |
| 入口与调用 | Qoder Web / `qoder.com/agents`；Cloud Agents Console 管理 Cloud 与 Remote Control task。 |
| 协议与输出 | Qoder 托管 Web 产品，通过账号连接 Cloud Agent 或已配对的本地 CLI。 |
| 具体行为 | 创建云任务、选择 GitHub 仓库和分支、查看本地/云任务、处理审批并继续对话。 |
| 会话与状态 | 云任务与本地远程任务出现在统一 conversation list。 |
| 工具与能力 | Cloud task 使用云环境工具；Remote Control task 使用本机 CLI 工具。 |
| 认证与权限 | Qoder 账号；云仓库任务需要 GitHub App/授权，本地任务需同账号配对。 |
| 运行位置 | Web 由 Qoder 托管，执行位置可能是 Qoder Cloud 或用户本机。 |
| 条件与边界 | Web 统一列表并不表示两类任务共享文件系统；必须看任务是 Cloud 还是 Remote Control。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder Web remote and cloud tasks](https://docs.qoder.com/mobile/web/remote-control)、[Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control)、[Qoder CLI Cloud Mode](https://docs.qoder.com/en/cli/cloud-mode) |

## 官方来源

- [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Claude Code Remote Control](https://code.claude.com/docs/en/remote-control)
- [Codex cloud](https://learn.chatgpt.com/docs/cloud)
- [ChatGPT desktop app](https://learn.chatgpt.com/docs/app)
- [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Qoder Web remote and cloud tasks](https://docs.qoder.com/mobile/web/remote-control)
- [Qoder CLI Remote Control](https://docs.qoder.com/en/cli/remote-control)
- [Qoder CLI Cloud Mode](https://docs.qoder.com/en/cli/cloud-mode)

## 关联能力

- [服务端与 Daemon](./surface-service.md)
- [云端仓库任务](./surface-cloud.md)
- [远程接管与跨端继续](./surface-remote-control.md)
