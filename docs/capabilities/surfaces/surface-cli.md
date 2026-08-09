# CLI

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-cli)

> 核对日期：2026-08-09

## 定义

在本地终端中运行的交互式 Agent 主界面，直接读取工作区、显示工具调用并接受用户输入与审批。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `claude` | 官方确认 |
| Codex | `codex` | 官方确认 |
| Qwen Code | `qwen` | 源码确认 |
| Kimi Code | `kimi` | 源码确认 |
| Qoder CLI | `qodercli` | 官方确认 |

## 比较边界

### 本页包含

- 主 CLI 命令与交互式 TUI
- 本地工作区和会话
- CLI 可切换到的 Headless 或协议子命令

### 本页不包含

- IDE 图形界面
- 独立桌面应用
- 只在托管云端运行的任务

## 跨产品事实

1. 五家都以本地 CLI 作为核心 Surface，并在同一二进制或包中提供 Headless、协议或远程入口。
2. CLI 的工具能力可能与 Desktop、Web 或 Cloud 共用底层运行时，但命令、审批和可视化不能自动互相等同。
3. Qwen Code 与 Kimi Code 开源仓库同时包含多个客户端；主 CLI 仍分别是 qwen 与 kimi。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `claude` |
| 入口与调用 | `claude` 在当前目录启动；支持交互命令、`@` 文件引用、权限选择和会话恢复。 |
| 协议与输出 | 终端 TUI；脚本化时切换 `-p`，远程控制时切换 `remote-control` 或会话命令。 |
| 具体行为 | 模型可读写文件、运行 Bash、搜索、调用 MCP 与 Subagent，并在终端展示计划、Diff 与任务状态。 |
| 会话与状态 | 会话按项目持久化；`--continue`、`--resume` 与命令选择器恢复。 |
| 工具与能力 | 工具受 permissions、sandbox、Hooks、Plugins 和 Agent 定义控制。 |
| 认证与权限 | Claude 账号登录、API key 或受支持的 Bedrock/Vertex/Foundry 等部署。 |
| 运行位置 | macOS、Linux、Windows/WSL 等受支持终端环境。 |
| 条件与边界 | 部分图形功能、Remote Control 和 Cloud 需要对应账号、版本或组织设置。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Documentation](https://code.claude.com/docs/en/overview)、[Claude Code platforms and integrations](https://code.claude.com/docs/en/platforms) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `codex` |
| 入口与调用 | `codex` 在工作区启动交互 TUI；`codex exec`、`app-server`、`mcp-server` 是同一 CLI 的其他入口。 |
| 协议与输出 | 本地终端 TUI，命令执行使用统一 PTY；可通过 `codex --remote` 连接远端 app-server。 |
| 具体行为 | 读写文件、运行命令、搜索、使用 MCP/Subagent，并展示审批、计划、后台进程和 Diff。 |
| 会话与状态 | 线程与 rollout 保存在 Codex home；可恢复历史线程。 |
| 工具与能力 | 工具与写入受沙箱、审批、rules、Hooks、Skills、Plugins 和 AGENTS.md 控制。 |
| 认证与权限 | ChatGPT/Codex 登录或 API 凭据。 |
| 运行位置 | 本机终端或连接到远程 app-server 的 TUI。 |
| 条件与边界 | 本地 CLI 与 Codex Cloud 使用不同运行位置；`codex --remote` 也不等同于创建 Cloud task。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Documentation](https://developers.openai.com/codex)、[Codex App Server](https://learn.chatgpt.com/docs/app-server) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qwen` |
| 入口与调用 | `qwen` 在当前目录启动 TUI；子命令还包括 `serve`、`channel`，参数模式包括 `-p` 和 `--acp`。 |
| 协议与输出 | Ink/终端交互界面；IDE Companion 通过本地连接补充上下文与 Diff。 |
| 具体行为 | 提供文件、Shell、搜索、Web、MCP、Subagent、Worktree、Review、Hooks 和 Plugins。 |
| 会话与状态 | 项目会话保存为 JSONL，可继续、恢复、命名、归档、导出和压缩。 |
| 工具与能力 | 工具由 approval mode、sandbox、permission rules、Skills、Agents 和 Extensions 共同控制。 |
| 认证与权限 | 支持 Qwen/Model Studio 及 OpenAI 兼容 Provider 配置。 |
| 运行位置 | Node.js CLI，可在本机、容器和 CI 使用。 |
| 条件与边界 | Daemon、Web Shell、Desktop 和 Channel 是独立 Surface；不能把其菜单或协议方法算作 TUI Slash 命令。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code Documentation](https://github.com/QwenLM/qwen-code/tree/main/docs/users)、[Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)、[Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `kimi` |
| 入口与调用 | `kimi` 启动交互式 TUI；`acp`、`web`、`login`、`export` 等为子命令。 |
| 协议与输出 | 终端 TUI；Headless 用 `-p`，IDE 用 ACP，浏览器用本地 Web 服务。 |
| 具体行为 | 读写文件、Shell、搜索、Web、MCP、Skills、Hooks 和 Subagent。 |
| 会话与状态 | 会话保存在 Kimi Code home，可继续、选择、恢复、导出和可视化。 |
| 工具与能力 | 权限模式、Plan、YOLO、工具规则和自定义 Agent 控制执行。 |
| 认证与权限 | Kimi OAuth 或自定义兼容 Provider。 |
| 运行位置 | 本机终端，官方安装脚本或 npm/native 包。 |
| 条件与边界 | 当前没有独立 Kimi Code 桌面应用；VS Code 与 Web UI 是另外的客户端。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)、[Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `qodercli` |
| 入口与调用 | `qodercli` 启动交互 TUI；`--acp`、`-p`、`--remote` 与 `remote-control` 切换其他运行面。 |
| 协议与输出 | 终端 TUI，支持 Shell 快捷入口和 Slash 命令。 |
| 具体行为 | 提供文件、Shell、搜索、Web、MCP、Skills、Plugins、Subagent、Worktree 和 Review。 |
| 会话与状态 | 本地会话可继续、恢复和管理；Cloud/Remote task 另有账号侧会话。 |
| 工具与能力 | 工具由 permission mode、rules、Hooks、SDK/Agent 定义控制。 |
| 认证与权限 | 浏览器登录、PAT 或 `QODER_PERSONAL_ACCESS_TOKEN`。 |
| 运行位置 | macOS、Linux 和 Windows 的本地 CLI。 |
| 条件与边界 | Qoder IDE、Qoder Web 和 Cloud Mode 是同品牌其他 Surface，不能替代 CLI 字段。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)、[Qoder CLI Documentation](https://docs.qoder.com/en/cli) |

## 官方来源

- [Claude Code Documentation](https://code.claude.com/docs/en/overview)
- [Claude Code platforms and integrations](https://code.claude.com/docs/en/platforms)
- [Codex Documentation](https://developers.openai.com/codex)
- [Codex App Server](https://learn.chatgpt.com/docs/app-server)
- [Qwen Code Documentation](https://github.com/QwenLM/qwen-code/tree/main/docs/users)
- [Qwen Code current headless mode](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/headless.md)
- [Qwen Code current daemon and Web Shell](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/qwen-serve.md)
- [Kimi Code current CLI, Headless and Web reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)
- [Qoder CLI Documentation](https://docs.qoder.com/en/cli)

## 关联能力

- [Headless 调用](./surface-headless.md)
- [状态与用量](../commands/cmd-status.md)
- [交互审批](../security/security-approval.md)
