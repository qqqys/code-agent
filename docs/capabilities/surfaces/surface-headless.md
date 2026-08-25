# Headless 调用

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-headless)

> 核对日期：2026-08-25

## 定义

不进入交互式终端界面，直接从命令参数或标准输入接收任务，并以进程输出和退出码交付结果。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `claude -p` | 官方确认 |
| Codex | `codex exec` | 官方确认 |
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
| 矩阵结论 | `codex exec` |
| 入口与调用 | `codex exec "<task>"`；stdin 可作为额外上下文，`codex exec resume` 继续既有线程。 |
| 协议与输出 | 默认把进度写入 stderr、最终消息写入 stdout；`--json` 把 stdout 改为 JSONL 事件流。 |
| 具体行为 | 在没有 TUI 的情况下运行完整任务；`--ephemeral` 不把 rollout 会话写入磁盘。 |
| 会话与状态 | 默认持久化线程，可按 ID 恢复；`--ephemeral` 只保留本次进程生命周期。 |
| 工具与能力 | 复用本地 Codex 工具、MCP、规则与项目配置；必需 MCP Server 初始化失败会让任务直接失败。 |
| 认证与权限 | 复用 Codex CLI 登录或 API 凭据；自动化环境应在启动前注入凭据。 |
| 运行位置 | 运行在本机或 CI Runner；这不是 Codex Cloud，文件与命令仍发生在调用进程的工作区。 |
| 条件与边界 | 默认是只读沙箱；写入需显式选择 `workspace-write` 等沙箱。`danger-full-access` 只适合外部已隔离环境。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)、[Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security) |

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
