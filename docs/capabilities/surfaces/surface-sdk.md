# Agent SDK

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-sdk)

> 核对日期：2026-08-24

## 定义

面向应用开发者的官方程序库，用类型化接口创建或恢复 Agent 会话、发送任务、消费事件并控制工具与权限。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Python · TypeScript | 官方确认 |
| Codex | TypeScript · Python | 官方确认 |
| Qwen Code | `@qwen-code/sdk` TypeScript | 条件项 |
| Kimi Code | 仓库内 TypeScript 包；未公开发布 | 条件项 |
| Qoder CLI | TypeScript · Python | 官方确认 |

## 比较边界

### 本页包含

- 公开安装包、语言与运行时
- 单轮、多轮、恢复和事件消费
- SDK 对工具、权限、MCP 和本地/云运行时的控制

### 本页不包含

- 只通过 Shell 启动 CLI
- 通用模型 API SDK
- 尚未公开发布的仓库内部包被视为稳定公共 SDK

## 跨产品事实

1. Claude Agent SDK、Codex SDK 和 Qoder Agent SDK 均公开提供 Python 与 TypeScript；Qwen Code 当前公开的是 TypeScript SDK。
2. Qwen、Claude、Codex 和 Qoder 的 SDK 本质上都可驱动本地 Agent 运行时，但各自对子进程、凭据和协议的封装不同。
3. Kimi Code 仓库已有 TypeScript SDK 包源码，但 package 标记为 private 且公共 npm 注册表没有该包，因此只记为仓库内能力。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Python · TypeScript |
| 入口与调用 | Python `claude-agent-sdk`；TypeScript `@anthropic-ai/claude-agent-sdk`。 |
| 协议与输出 | `query()` 返回异步消息流；Python `ClaudeSDKClient` 提供长连接多轮控制。 |
| 具体行为 | 创建或恢复会话，控制模型、工具、MCP、Hooks、权限、Subagent 和结构化输出。 |
| 会话与状态 | 会话自动持久化到磁盘；支持 continue、resume、fork、会话列表和消息读取。 |
| 工具与能力 | 提供与 Claude Code 相同的 Agent loop、内置工具与上下文管理，也可注册 SDK 自定义工具。 |
| 认证与权限 | 使用 Anthropic API、Claude 订阅对应的 Agent SDK 权益或支持的云平台凭据。 |
| 运行位置 | 运行在应用服务器、本机进程或 CI 环境；SDK 负责与本地 Claude Code 运行时通信。 |
| 条件与边界 | Python 和 TypeScript 的会话对象模型不完全相同；生产应用需按对应语言的生命周期接口管理连接。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)、[Claude Code Headless Mode](https://code.claude.com/docs/en/headless) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | TypeScript · Python |
| 入口与调用 | TypeScript `@openai/codex-sdk`；Python `openai-codex`。 |
| 协议与输出 | TypeScript 通过 `Codex.startThread()`、`run()`、`resumeThread()`；Python 通过本地 app-server JSON-RPC。 |
| 具体行为 | 创建线程、连续运行多轮任务、恢复线程并消费最终响应或事件。 |
| 会话与状态 | 线程 ID 是恢复键；同一 thread 对象多次 `run()` 会保留上下文。 |
| 工具与能力 | 复用 Codex 本地工具、沙箱、MCP 和配置；Python 可在每个 turn 调整 Sandbox。 |
| 认证与权限 | 复用 Codex CLI/ChatGPT 登录或所配置的 OpenAI 凭据。 |
| 运行位置 | TypeScript 要求服务端 Node.js；Python SDK 启动并控制本地 app-server，发布包带固定 Codex 运行时依赖。 |
| 条件与边界 | Python SDK 当前为 beta；SDK 面向本地 Codex 线程，不等同于直接调用 Codex Cloud 管理 API。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)、[Codex App Server](https://learn.chatgpt.com/docs/app-server) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `@qwen-code/sdk` TypeScript |
| 入口与调用 | `npm install @qwen-code/sdk`；Node.js 22+，发布包内置 CLI。 |
| 协议与输出 | `query()` 返回异步消息流；支持字符串单轮和 AsyncIterable 多轮；另有实验性 `DaemonClient`/`DaemonSessionClient`。 |
| 具体行为 | 控制 cwd、模型、权限、工具、MCP、Subagent、会话恢复、中断和上下文用量。 |
| 会话与状态 | 支持 `resume`、显式 `sessionId` 和长连接 Query 控制；Daemon 客户端用 session ID 绑定 HTTP + SSE 会话。 |
| 工具与能力 | `coreTools` 控制注册集合，`allowedTools`/`excludeTools` 控制授权；可嵌入 SDK MCP Server。 |
| 认证与权限 | 使用 Qwen Code 的 Provider/环境配置；SDK 可把环境变量传给内置 CLI。 |
| 运行位置 | 默认在应用宿主启动内置 qwen CLI 子进程；Daemon 客户端可连接已有 `qwen serve`。 |
| 条件与边界 | README 将其标为 minimum experimental；Node.js 版本和 SDK/CLI 版本需要按包约束匹配。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current TypeScript SDK](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md)、[Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 仓库内 TypeScript 包；未公开发布 |
| 入口与调用 | 仓库包含 `packages/node-sdk`，包名 `@moonshot-ai/kimi-code-sdk`。 |
| 协议与输出 | 源码定义 TypeScript SDK，但当前包 README 只有仓库级说明，尚无完整公共 API 文档。 |
| 具体行为 | 从包描述可确认目标是以 TypeScript 驱动 Kimi Code Agent；不能据此承诺公开安装和兼容性。 |
| 会话与状态 | 仓库源码含会话/协议依赖，但没有公开 SDK 生命周期契约可供外部用户依赖。 |
| 工具与能力 | 内部依赖 Agent Core、KAOS 与 OAuth 包；公开可用工具控制细节未形成 SDK 文档。 |
| 认证与权限 | 依赖 Kimi Code OAuth/Provider 组件；没有公开 SDK 认证指南。 |
| 运行位置 | 当前适合作为仓库内构建组成部分，不记作已发布公共 SDK。 |
| 条件与边界 | `package.json` 当前 `private: true`，公共 npm 查询不到该包；待官方发布和文档完成后再升级状态。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current TypeScript SDK package](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/packages/node-sdk/package.json)、[Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | TypeScript · Python |
| 入口与调用 | TypeScript `@qoder-ai/qoder-agent-sdk`；Python `qoder-agent-sdk`。 |
| 协议与输出 | 两种语言均提供 `query()` 异步消息流；长连接客户端支持多轮会话。 |
| 具体行为 | 控制 cwd、工具、权限、Hooks、MCP、Skills、Plugins、Subagent、模型、恢复和中断。 |
| 会话与状态 | 支持 continue/resume 和长连接会话；实验性 Cloud Agent 可把 Agent 与 session 状态放在 Qoder Cloud。 |
| 工具与能力 | 内置 Read/Edit/Bash/Agent 等工具可按可见、预授权和禁止三层控制，也可注册 SDK MCP 工具。 |
| 认证与权限 | 推荐 PAT；本地交互环境也可复用 qodercli 登录。 |
| 运行位置 | 默认随 SDK 启动内置 qodercli；`experimentalCloudAgent` 改为 SSE 连接 Qoder Cloud。 |
| 条件与边界 | Cloud Agent 是实验接口，且不支持本地 MCP、Hooks、Plugins、权限和 checkpoint 等选项。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder Agent SDK TypeScript quick start](https://docs.qoder.com/en/cli/sdk/quick-start)、[Qoder Agent SDK Python quick start](https://docs.qoder.com/en/cli/sdk/python/quick-start)、[Qoder SDK Cloud Agent](https://docs.qoder.com/en/cli/sdk/cloud-agent) |

## 官方来源

- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
- [Claude Code Headless Mode](https://code.claude.com/docs/en/headless)
- [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk)
- [Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [Qwen Code current TypeScript SDK](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/sdk-typescript/README.md)
- [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)
- [Kimi Code current TypeScript SDK package](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/packages/node-sdk/package.json)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Qoder Agent SDK TypeScript quick start](https://docs.qoder.com/en/cli/sdk/quick-start)
- [Qoder Agent SDK Python quick start](https://docs.qoder.com/en/cli/sdk/python/quick-start)
- [Qoder SDK Cloud Agent](https://docs.qoder.com/en/cli/sdk/cloud-agent)

## 关联能力

- [Headless 调用](./surface-headless.md)
- [服务端与 Daemon](./surface-service.md)
- [MCP 客户端](../extensions/extension-mcp.md)
