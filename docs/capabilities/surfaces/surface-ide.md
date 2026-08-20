# IDE 与 ACP

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-ide)

> 核对日期：2026-08-20

## 定义

在代码编辑器或 IDE 内提供 Agent 对话、编辑器上下文、原生 Diff 与权限交互，或通过 ACP 让第三方 IDE 驱动 Agent。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | VS Code · JetBrains | 官方确认 |
| Codex | Codex IDE Extension | 官方确认 |
| Qwen Code | VS Code Companion · `qwen --acp` | 源码确认 |
| Kimi Code | VS Code · `kimi acp` | 源码确认 |
| Qoder CLI | Qoder IDE · `qodercli --acp` | 官方确认 |

## 比较边界

### 本页包含

- 官方编辑器扩展
- CLI Companion 连接
- ACP Server 与已文档化的 IDE 客户端

### 本页不包含

- 独立桌面 Agent 应用
- 浏览器 Web UI
- 仅从 IDE 内置终端运行普通 CLI

## 跨产品事实

1. Qwen Code、Kimi Code 和 Qoder CLI 都提供 ACP Server，可被 Zed 等 ACP 客户端作为 Agent 进程启动。
2. Claude Code、Codex、Qwen Code 和 Kimi Code 都有官方 VS Code 体验，但“完整图形 Agent 面板”和“CLI Companion”不是同一种集成深度。
3. ACP 是否支持终端、文件 reverse-RPC、图片、MCP 和全部 Slash 命令，需要按每个实现的 capability 声明判断。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | VS Code · JetBrains |
| 入口与调用 | Claude Code VS Code Extension；JetBrains Plugin；CLI 中 `/ide` 管理与编辑器连接。 |
| 协议与输出 | 官方扩展内置 Claude Code CLI，并通过编辑器 API 提供选区、文件、Diff 与会话界面。 |
| 具体行为 | 支持 @mention、行范围、原生 Diff、计划审阅、自动接受编辑、会话历史和并行标签页。 |
| 会话与状态 | VS Code Extension、Desktop 和 Web 各自维护 Surface 会话历史；项目配置可共享。 |
| 工具与能力 | 复用 Claude Code 工具、MCP、Plugins 和权限；部分 CLI-only 功能在扩展中仍需终端。 |
| 认证与权限 | 扩展内登录 Claude 账号，或按文档使用第三方 Provider。 |
| 运行位置 | VS Code/Cursor/Open VSX 兼容编辑器与 JetBrains 系列。 |
| 条件与边界 | 扩展图形功能与 CLI 命令表不完全一致；具体能力取决于 IDE 与扩展版本。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code IDE integrations](https://code.claude.com/docs/en/ide-integrations)、[Claude Code platforms and integrations](https://code.claude.com/docs/en/platforms) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Codex IDE Extension |
| 入口与调用 | Codex IDE Extension，在 VS Code 及支持的编辑器内启动；也可从 CLI 传递 IDE context。 |
| 协议与输出 | 官方扩展使用 Codex app-server 作为富客户端后端。 |
| 具体行为 | 在编辑器旁发起线程、引用文件和选区、查看改动、审批执行并继续 Codex 任务。 |
| 会话与状态 | 线程由 Codex 本地运行时保存，可与本地 CLI 共享项目配置。 |
| 工具与能力 | 复用本地 Codex 工具、沙箱、MCP、Skills 和 AGENTS.md。 |
| 认证与权限 | 通过 ChatGPT/Codex 账号或配置的 API 凭据。 |
| 运行位置 | VS Code、Cursor 等支持的编辑器；后端在本机运行。 |
| 条件与边界 | Codex Cloud 是独立 Surface；IDE Extension 默认操作本地工作区。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex IDE extension](https://learn.chatgpt.com/docs/ide)、[Codex App Server](https://learn.chatgpt.com/docs/app-server) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | VS Code Companion · `qwen --acp` |
| 入口与调用 | VS Code Companion 配合 `/ide install\|enable\|status`；`qwen --acp` 可接 Zed，JetBrains 也有 ACP 配置。 |
| 协议与输出 | Companion 向 CLI 提供最近文件、光标、选区和原生 Diff；ACP 使用 stdin/stdout Agent Client Protocol。 |
| 具体行为 | Companion 在集成终端保持 CLI 体验；ACP 在 IDE Agent 面板中创建会话、引用文件和展示工具调用。 |
| 会话与状态 | Companion 绑定当前 workspace；ACP 会话由 Qwen Code 运行时管理。 |
| 工具与能力 | ACP 和 CLI 复用文件、Shell、MCP、Subagent 与权限系统，但 `--json-schema` 与 ACP 互斥。 |
| 认证与权限 | 复用 Qwen Code 登录和 Provider 设置。 |
| 运行位置 | VS Code/VS Code forks，以及支持 ACP 的 Zed、JetBrains 客户端。 |
| 条件与边界 | Companion 当前官方文档只声明 VS Code 系；其他编辑器应走 ACP，二者入口和 UI 能力不同。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current IDE integration](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/ide-integration/ide-integration.md)、[Qwen Code current ACP integration](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-zed.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | VS Code · `kimi acp` |
| 入口与调用 | 官方 Kimi Code VS Code Extension；`kimi acp` 可接 Zed、JetBrains AI Chat 等 ACP 客户端。 |
| 协议与输出 | VS Code Extension 提供 Webview Agent UI；ACP 使用 JSON-RPC stdin/stdout。 |
| 具体行为 | VS Code 支持会话、文件选择、Diff、权限、计划、MCP 与媒体；ACP 支持会话 new/load/resume、prompt、cancel 和配置选择。 |
| 会话与状态 | ACP 可列出与加载本地磁盘会话并回放历史；VS Code 连接同一本地 Kimi 运行时。 |
| 工具与能力 | ACP 转发 HTTP/stdio/SSE MCP，支持图片与嵌入资源；Shell 仍在本地执行。 |
| 认证与权限 | 复用 Kimi Code OAuth/Provider；ACP `authenticate` 处理缺失登录。 |
| 运行位置 | VS Code Extension，以及 Zed/JetBrains 等 ACP 客户端。 |
| 条件与边界 | ACP 当前未实现 session/close、logout、终端 reverse-RPC 和大多数不稳定扩展方法。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current IDE integrations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/guides/ides.md)、[Kimi Code current ACP reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-acp.md)、[Kimi Code current VS Code extension](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/apps/vscode/README.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Qoder IDE · `qodercli --acp` |
| 入口与调用 | Qoder IDE 与 JetBrains Plugin；`qodercli --acp` 可作为 Zed 等客户端的 Agent Server。 |
| 协议与输出 | ACP 通过 stdin/stdout；Qoder IDE 是完整桌面编辑器产品。 |
| 具体行为 | ACP 提供内置工具、Subagent、MCP、权限、上下文压缩、多模态和 IDE 侧文件/终端能力。 |
| 会话与状态 | ACP 进程复用 Qoder CLI 会话与登录；IDE 产品有自己的项目与会话界面。 |
| 工具与能力 | ACP 暴露与 CLI 相同的核心工具体系；当前可用 Slash 命令是 `/init`、`/memory`、`/about`、`/help`。 |
| 认证与权限 | 复用 qodercli 登录，或在 ACP 客户端配置 PAT 环境变量。 |
| 运行位置 | Qoder IDE、JetBrains Plugin 与任意兼容 ACP 的客户端。 |
| 条件与边界 | ACP 命令集合小于完整 CLI Slash 命令集合；Qoder IDE 功能也不能自动算入 Qoder CLI。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI ACP](https://docs.qoder.com/en/cli/acp)、[Qoder IDE quick start](https://docs.qoder.com/quick-start) |

## 官方来源

- [Claude Code IDE integrations](https://code.claude.com/docs/en/ide-integrations)
- [Claude Code platforms and integrations](https://code.claude.com/docs/en/platforms)
- [Codex IDE extension](https://learn.chatgpt.com/docs/ide)
- [Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [Qwen Code current IDE integration](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/ide-integration/ide-integration.md)
- [Qwen Code current ACP integration](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-zed.md)
- [Kimi Code current IDE integrations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/guides/ides.md)
- [Kimi Code current ACP reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-acp.md)
- [Kimi Code current VS Code extension](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/apps/vscode/README.md)
- [Qoder CLI ACP](https://docs.qoder.com/en/cli/acp)
- [Qoder IDE quick start](https://docs.qoder.com/quick-start)

## 关联能力

- [CLI](./surface-cli.md)
- [桌面端](./surface-desktop.md)
- [MCP 客户端](../extensions/extension-mcp.md)
