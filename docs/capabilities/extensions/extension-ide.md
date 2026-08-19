# IDE 连接

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-ide)

> 核对日期：2026-08-19

## 定义

让 Code Agent 在编辑器或 ACP 客户端中运行，或让外部 CLI 获取当前文件、选择区、诊断与原生 Diff 等 IDE 上下文。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/ide` · VS Code IDE MCP | 官方确认 |
| Codex | IDE 扩展 · `/ide-context` | 官方确认 |
| Qwen Code | `/ide` · VS Code Companion | 源码确认 |
| Kimi Code | `kimi acp` | 官方确认 |
| Qoder CLI | `qodercli --acp` | 官方确认 |

## 比较边界

### 本页包含

- IDE 扩展、Companion 或 ACP 启动入口
- 当前文件、选择区、诊断、Diff 与文件操作上下文
- 明确支持的编辑器或 ACP 客户端

### 本页不包含

- 只用于编辑当前 Prompt 文本的外部编辑器
- 没有上下文桥接的普通集成终端
- 云端任务或桌面端会话

## 跨产品事实

1. 五家都能进入 IDE 工作流，但形态不同：Codex 是原生 IDE 扩展，Claude Code 与 Qwen Code 提供 CLI 到 VS Code 的桥接，Kimi Code 与 Qoder CLI 公开 ACP Server。
2. Kimi Code 的 `/editor` 只配置输入内容的外部编辑器，不是 IDE 上下文连接；本矩阵因此改为 `kimi acp`。
3. Codex CLI 的 IDE 上下文命令是 `/ide-context`，不是 `/ide`；Claude Code 与 Qwen Code 才使用 `/ide` 管理连接。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/ide` · VS Code IDE MCP |
| 入口与配置 | 在外部终端运行 `/ide` 连接支持的编辑器；VS Code 扩展也可直接打开 Claude Code 面板。 |
| 文件与目录 | VS Code、Cursor 及兼容分支安装官方扩展；扩展为 CLI 暴露本地隐藏 `ide` MCP Server。 |
| 具体行为 | 每次提示附带活动文件与选择区，并提供原生 Diff、诊断和 Notebook 执行等 IDE 能力。 |
| 作用域与优先级 | 当前已连接的编辑器窗口与活动项目。 |
| 扩展构成 | VS Code 扩展、隐藏 IDE MCP、编辑器上下文与原生 Diff。 |
| 加载与刷新 | `/ide` 发现并选择可用编辑器；连接状态随编辑器和 CLI 会话维护。 |
| 适用界面 | VS Code、Cursor 和兼容分支；扩展面板与外部终端连接提供的命令集合并不完全相同。 |
| 权限与信任 | IDE 提供上下文与界面，文件和终端操作仍受 Claude Code 权限规则。 |
| 条件与边界 | 活动选择区和活动文件会自动加入提示；其他打开文件不等于全部自动进入上下文。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code IDE integrations](https://code.claude.com/docs/en/ide-integrations)、[Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | IDE 扩展 · `/ide-context` |
| 入口与配置 | 在 VS Code 系编辑器安装 Codex IDE 扩展；CLI 中使用 `/ide-context` 控制或查看编辑器上下文。 |
| 文件与目录 | Codex IDE 扩展运行于支持的 VS Code 系编辑器，并共享 Codex 配置。 |
| 具体行为 | 读取选中代码和文件上下文，展示本地改动与 Diff，可在本地或 Cloud 任务之间工作。 |
| 作用域与优先级 | 当前 IDE 工作区和扩展会话；与 CLI、桌面端共享部分配置而不是全部交互状态。 |
| 扩展构成 | IDE 面板、命令面板操作、选择区上下文、Diff 与本地/Cloud 任务入口。 |
| 加载与刷新 | 扩展启动后建立会话并读取共享配置；`/ide-context` 是 CLI 的相关 Slash 入口。 |
| 适用界面 | Codex IDE 扩展；插件系统当前不在该 Surface 中提供。 |
| 权限与信任 | 编辑器中的工具操作继续受 Codex 审批与沙箱配置。 |
| 条件与边界 | 旧矩阵写成 `/ide` 不准确；当前 Codex Slash 命令名是 `/ide-context`。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex IDE extension](https://learn.chatgpt.com/docs/ide)、[Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/ide` · VS Code Companion |
| 入口与配置 | `/ide install\|enable\|disable\|status` 管理 VS Code Companion 连接。 |
| 文件与目录 | VS Code 与兼容分支安装 Qwen Code Companion。 |
| 具体行为 | 向 CLI 提供最近文件、光标位置、最多 16 KiB 的选择区和原生 Diff 展示。 |
| 作用域与优先级 | 当前编辑器工作区；最近文件上下文最多取 10 个。 |
| 扩展构成 | CLI `/ide` 管理命令、Companion 扩展、上下文桥接与 Diff。 |
| 加载与刷新 | 安装并启用 Companion 后由 CLI 发现连接；`/ide status` 查看状态。 |
| 适用界面 | 交互式 CLI 与 VS Code/兼容分支；ACP 是另一条客户端协议，不等同于 Companion。 |
| 权限与信任 | IDE 只提供上下文和 Diff；文件、Shell 与网络仍经过 Qwen approval mode 和 Sandbox。 |
| 条件与边界 | 启用 Sandbox 时需要保留 Companion 通信所需网络；选择区超过 16 KiB 会受截断限制。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current IDE integration](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/ide-integration/ide-integration.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `kimi acp` |
| 入口与配置 | 使用 `kimi acp` 以 stdio 启动 Agent Client Protocol Server，由支持 ACP 的编辑器连接。 |
| 文件与目录 | 官方指南列出 Zed 与 JetBrains 等 ACP 客户端配置。 |
| 具体行为 | 通过 JSON-RPC/stdio 接收提示与上下文，并把工具、权限和消息事件返回给编辑器。 |
| 作用域与优先级 | 当前 ACP 客户端工作区；登录状态与普通 Kimi CLI 共享。 |
| 扩展构成 | ACP Server、客户端配置、MCP 转发与会话事件。 |
| 加载与刷新 | 编辑器按配置启动 `kimi acp`；ACP 会转发 stdio、HTTP 和 SSE MCP Server。 |
| 适用界面 | Zed、JetBrains 等支持 ACP 的 IDE；`/editor` 只编辑 Prompt，不属于 IDE 连接。 |
| 权限与信任 | ACP 客户端参与权限请求；实际工具仍遵循 Kimi 的权限与交互语义。 |
| 条件与边界 | 必须由支持 ACP 的客户端启动或连接；不能把 `/editor` 当成等价命令。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current IDE integrations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/ides.md)、[Kimi Code current ACP reference](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-acp.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qodercli --acp` |
| 入口与配置 | 使用 `qodercli --acp` 启动 ACP Server，并在 Zed 等支持 ACP 的客户端中配置。 |
| 文件与目录 | 配置在 ACP 客户端；Qoder CLI 作为子进程通过 stdio 通信。 |
| 具体行为 | 支持工具、Subagent、MCP、权限、上下文压缩和图像，并可使用 IDE 提供的文件系统与终端能力。 |
| 作用域与优先级 | 当前 ACP 客户端工作区与会话；登录沿用 Qoder CLI 环境。 |
| 扩展构成 | ACP Server、IDE 文件系统/终端桥接、权限请求、MCP 与 Subagent 事件。 |
| 加载与刷新 | 由编辑器启动 `qodercli --acp`；连接生命周期由 ACP 客户端管理。 |
| 适用界面 | Zed 等 ACP 客户端；Qoder IDE 本身是另一产品 Surface，不用它替代 CLI ACP 结论。 |
| 权限与信任 | 权限请求通过 ACP 交互呈现；IDE 提供能力不表示默认免审批。 |
| 条件与边界 | 旧矩阵中的“CLI 命令未确认”已由官方 ACP 文档补足；入口是 CLI 参数，不是 Slash 命令。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI ACP](https://docs.qoder.com/en/cli/acp) |

## 官方来源

- [Claude Code IDE integrations](https://code.claude.com/docs/en/ide-integrations)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex IDE extension](https://learn.chatgpt.com/docs/ide)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code current IDE integration](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/ide-integration/ide-integration.md)
- [Kimi Code current IDE integrations](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/guides/ides.md)
- [Kimi Code current ACP reference](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-acp.md)
- [Qoder CLI ACP](https://docs.qoder.com/en/cli/acp)

## 关联能力

- [MCP 客户端](./extension-mcp.md)
- IDE 与 ACP：见对应能力矩阵
- Agent SDK：见对应能力矩阵
