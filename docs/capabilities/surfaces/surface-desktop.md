# 桌面端

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-desktop)

> 核对日期：2026-08-10

## 定义

以原生或 Electron 桌面应用提供 Agent 会话、文件审阅、终端和项目管理，而不是只在终端或编辑器插件中运行。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Claude Desktop Code | 官方确认 |
| Codex | ChatGPT Desktop Codex | 官方确认 |
| Qwen Code | Qwen Code Desktop | 源码确认 |
| Kimi Code | 无独立桌面端；提供 VS Code/Web | 条件项 |
| Qoder CLI | Qoder IDE | 官方确认 |

## 比较边界

### 本页包含

- 官方桌面应用或官方桌面 IDE
- 本地 Agent 运行与文件审阅
- 桌面端特有的多会话、预览或计算机控制

### 本页不包含

- VS Code Extension 被当作独立桌面应用
- 浏览器 PWA
- 仅有仓库源码但没有产品定位的实验 UI

## 跨产品事实

1. Claude、Codex、Qwen 和 Qoder 都有明确桌面产品；Kimi Code 当前公开 Surface 是 CLI、VS Code、ACP 与本地 Web。
2. Qwen Code Desktop 是 Qwen Code 仓库内的 Electron 应用，并通过 ACP 驱动打包的 Qwen CLI runtime。
3. 桌面端经常增加 Worktree、多窗格、文件预览和会话管理，但不意味着 Headless 参数或全部 CLI 命令在 GUI 中可用。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Claude Desktop Code |
| 入口与调用 | Claude Desktop 的 Code tab，macOS 与 Windows 客户端。 |
| 协议与输出 | 桌面 GUI 调用 Claude Code 运行时，可选择 Local、Remote 或 SSH 环境。 |
| 具体行为 | 并行会话与自动 Worktree、终端/编辑器/预览、多窗格、Side chat、Diff 评论、Computer Use、PR monitoring 和 scheduled task。 |
| 会话与状态 | 每个会话独立跟踪上下文和改动；Remote 会话关机后仍在云端继续。 |
| 工具与能力 | Local/SSH 可用项目配置、MCP 与 Plugins；Desktop 另有 Connectors 与 Computer Use。 |
| 认证与权限 | Claude 账号；企业可通过 managed settings 和管理台控制可用能力。 |
| 运行位置 | macOS 和 Windows；Local、Anthropic Remote 或用户 SSH 主机。 |
| 条件与边界 | Desktop 是交互式 Surface，不支持 `--print`/`--output-format`；Agent Teams 仍是 CLI/SDK 能力。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Desktop](https://code.claude.com/docs/en/desktop) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | ChatGPT Desktop Codex |
| 入口与调用 | ChatGPT Desktop 中选择 Codex，在 macOS/Windows 应用内创建 coding chat。 |
| 协议与输出 | ChatGPT 桌面应用连接本地文件夹、Codex 本地运行时和 Cloud。 |
| 具体行为 | 集中管理项目和长运行任务，打开文件、审阅产物、使用浏览器/电脑工具并调度任务。 |
| 会话与状态 | 项目和 chat 保存在 ChatGPT 工作区；Codex 本地与 Cloud task 按各自环境保留状态。 |
| 工具与能力 | 可使用本地文件、终端、浏览器、Computer Use 和 Plugins；具体工具受当前模式与权限控制。 |
| 认证与权限 | ChatGPT 账号与工作区权限。 |
| 运行位置 | macOS 与 Windows ChatGPT Desktop。 |
| 条件与边界 | 当前桌面产品是 ChatGPT app 内的 Codex，不再是单独命名的 Codex App；Cloud task 与本地 folder task 仍需区分。 |
| 证据状态 | 官方确认 |
| 来源 | [ChatGPT desktop app](https://learn.chatgpt.com/docs/app)、[Codex cloud](https://learn.chatgpt.com/docs/cloud) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Qwen Code Desktop |
| 入口与调用 | Qwen Code Desktop；GitHub release 提供 macOS、Windows、Linux 构建。 |
| 协议与输出 | Electron 应用通过 ACP 驱动随应用打包的 Qwen Code CLI runtime。 |
| 具体行为 | 多会话 chat、source connection、Skills、文件/Office/PDF/Diff 预览、Automation 和权限模式。 |
| 会话与状态 | 本地优先保存 workspace、会话与 source；每个 Agent session 由 Qwen runtime 承载。 |
| 工具与能力 | 使用 Qwen Code 模型发现、MCP、REST/文件 source、Skills、Permission mode 和 Automation。 |
| 认证与权限 | 复用 Qwen Code runtime 认证；桌面应用不保存第三方 LLM API key。 |
| 运行位置 | 官方仓库可构建 macOS、Windows、Linux 安装包。 |
| 条件与边界 | 桌面包在仓库 workspace 中被排除于根 npm workspace，使用 Bun/Electron 独立构建；功能不能自动计入 CLI。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current Desktop](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/desktop/README.md)、[Qwen Code current ACP integration](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-zed.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 无独立桌面端；提供 VS Code/Web |
| 入口与调用 | 当前官方仓库未提供独立 Kimi Code Desktop 安装包。 |
| 协议与输出 | 桌面图形体验由 VS Code Extension 或浏览器中的 `kimi web` 提供。 |
| 具体行为 | 可以在编辑器或本地 Web UI 使用 Agent，但没有单独桌面应用的项目/窗口生命周期。 |
| 会话与状态 | 会话仍由本地 Kimi Code runtime 保存。 |
| 工具与能力 | VS Code、ACP 与 Web 复用 Kimi Agent 工具。 |
| 认证与权限 | 复用 Kimi Code 登录和 Provider。 |
| 运行位置 | CLI、VS Code/ACP 或本地 Web；无独立桌面发行物。 |
| 条件与边界 | “有 VS Code Extension/Web UI”不等于“有 Desktop App”，后续若官方发布需重新核对。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)、[Kimi Code current VS Code extension](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/apps/vscode/README.md)、[Kimi Code current IDE integrations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/guides/ides.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Qoder IDE |
| 入口与调用 | Qoder IDE，官方桌面编辑器；另有 JetBrains Plugin。 |
| 协议与输出 | 完整桌面 IDE 集成 Agent、项目索引、编辑器、终端与 Qoder 账号服务。 |
| 具体行为 | 打开/克隆项目、索引代码、Chat/Quest Agent、审阅改动并使用 IDE 内浏览器与工具。 |
| 会话与状态 | IDE 管理本地项目、索引和 Agent conversation；可与 Cloud/Remote task 联动。 |
| 工具与能力 | 提供 IDE Agent、终端、Sandbox、浏览器、索引、Rules 和 MCP 等产品能力。 |
| 认证与权限 | Qoder 账号，可用 Google/GitHub 等登录。 |
| 运行位置 | macOS 与 Windows 等官方支持桌面平台。 |
| 条件与边界 | Qoder IDE 是与 qodercli 并列的产品 Surface；IDE 索引和 Quest 等能力不自动算作 CLI 能力。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder IDE quick start](https://docs.qoder.com/quick-start)、[Qoder CLI Documentation](https://docs.qoder.com/en/cli) |

## 官方来源

- [Claude Code Desktop](https://code.claude.com/docs/en/desktop)
- [ChatGPT desktop app](https://learn.chatgpt.com/docs/app)
- [Codex cloud](https://learn.chatgpt.com/docs/cloud)
- [Qwen Code current Desktop](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/desktop/README.md)
- [Qwen Code current ACP integration](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-zed.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Kimi Code current VS Code extension](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/apps/vscode/README.md)
- [Kimi Code current IDE integrations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/guides/ides.md)
- [Qoder IDE quick start](https://docs.qoder.com/quick-start)
- [Qoder CLI Documentation](https://docs.qoder.com/en/cli)

## 关联能力

- [IDE 与 ACP](./surface-ide.md)
- [Web 界面](./surface-web.md)
- [并行 Worktree](../execution/execution-worktree.md)
