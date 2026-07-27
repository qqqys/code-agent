# Headless、SDK 与多端矩阵

[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#surfaces)

## 非交互与程序调用

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| Headless 调用 | `claude -p` | `codex exec` | `qwen -p` | `kimi --print` 等非交互入口 | Headless 模式 |
| 从 stdin 读取提示 | 支持 | 支持 | 支持 | 支持 | 支持 |
| 结构化输出 | JSON、流式 JSON 等 | JSONL 等 | JSON、JSONL、流式输出 | 依非交互参数 | 结构化输出 |
| 会话继续 | 非交互参数支持恢复 | `exec resume` 等 | 参数与会话接口 | 会话参数 | Headless 会话能力依接口 |
| 非交互权限策略 | 启动参数和设置 | 沙箱与审批参数 | approval mode、sandbox 参数 | 启动权限参数 | permission mode |
| Agent SDK | Claude Agent SDK | Codex SDK | Qwen Code SDK | 官方 SDK 情况按当前文档核对 | Python、TypeScript SDK |
| MCP Server 模式 | 支持相关 SDK/工具集成 | `codex mcp-server` 等入口 | MCP Server/Daemon 能力 | MCP 客户端；Server 模式未确认 | SDK/MCP 能力依文档 |
| Daemon 或常驻服务 | Remote Control/SDK 运行时 | App/Cloud 服务 | Daemon | 未确认 | Cloud/SDK 运行时 |

## Surface

| Surface | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| CLI | 是 | 是 | 是 | 是 | 是 |
| IDE | VS Code、JetBrains 等 | IDE Extension | IDE 集成 | 编辑器集成 | Qoder IDE |
| 桌面端 | Claude Desktop 集成 | Codex App | Desktop 入口 | 未确认独立桌面端 | Qoder 产品端 |
| Web | Claude.ai/Remote Control 相关入口 | ChatGPT/Codex Web | Web Shell | 产品 Web 能力与 CLI 分开 | Qoder 产品端 |
| Cloud 任务 | Web/Remote 工作流 | Codex Cloud | 依 Daemon 与部署 | 未确认 | Cloud Mode |
| 移动端控制 | Remote Control 相关入口 | App/Web 入口依账号 | IM/Channel 入口依部署 | 未确认 | 未确认 |
| IDE 到 CLI 上下文 | `/ide` | `/ide` | `/ide` | `/editor` | Qoder 产品集成 |
| 远程接管本地会话 | `/remote-control`、`/rc` | `/app` 与多端工作流 | 依 Daemon/Channel | 未确认 | Cloud Mode |
| 会话跨端继续 | `/teleport`、`/desktop` | App/CLI/Cloud 工作流 | 依会话后端 | `/sessions` 主要为 CLI 会话 | 产品账号与 Cloud Mode |

## Surface 约束

- Codex App 或 Cloud 出现的命令不自动算作 Codex CLI 命令。
- Qwen Code Daemon、Web Shell 或 Channel 的能力不自动算作 TUI 默认能力。
- Qoder 产品端能力不自动算作 Qoder CLI 本地能力。
- Claude Web、Desktop 和 CLI 使用同一品牌，但工具、权限和会话边界可能不同。

## 来源

- [Claude Code Headless](https://code.claude.com/docs/en/headless)
- [Codex Non-interactive mode](https://developers.openai.com/codex/noninteractive)
- [Codex SDK](https://developers.openai.com/codex/sdk)
- [Qwen Code SDK](https://github.com/QwenLM/qwen-code/tree/main/packages/sdk)
- [Kimi Code Documentation](https://github.com/MoonshotAI/kimi-code/tree/main/docs/zh)
- [Qoder CLI Documentation](https://docs.qoder.com/en/cli)
