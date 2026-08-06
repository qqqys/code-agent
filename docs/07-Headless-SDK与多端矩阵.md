# Headless、SDK 与多端矩阵

[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#surfaces) · [详情目录](./capabilities/surfaces/)

> 核对日期：2026-08-06

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| [Headless 调用](./capabilities/surfaces/surface-headless.md) | `claude -p` | `codex exec` | `qwen -p` | `kimi -p` | `qodercli -p` |
| [结构化输出](./capabilities/surfaces/surface-structured-output.md) | `json` · `stream-json` · JSON Schema | `--json` JSONL · `--output-schema` | `json` · `stream-json` · JSON Schema | `stream-json` JSONL | `text` · `json` · `stream-json` |
| [Agent SDK](./capabilities/surfaces/surface-sdk.md) | Python · TypeScript | TypeScript · Python | `@qwen-code/sdk` TypeScript | 仓库内 TypeScript 包；未公开发布 | TypeScript · Python |
| [服务端与 Daemon](./capabilities/surfaces/surface-service.md) | Agent SDK · Remote Control 服务 | `codex app-server` · `mcp-server` | `qwen serve` HTTP + SSE | `kimi web` REST + WebSocket | `qodercli --acp` · `remote-control` Daemon |
| [CLI](./capabilities/surfaces/surface-cli.md) | `claude` | `codex` | `qwen` | `kimi` | `qodercli` |
| [IDE 与 ACP](./capabilities/surfaces/surface-ide.md) | VS Code · JetBrains | Codex IDE Extension | VS Code Companion · `qwen --acp` | VS Code · `kimi acp` | Qoder IDE · `qodercli --acp` |
| [Web 界面](./capabilities/surfaces/surface-web.md) | claude.ai/code · Remote Control | ChatGPT Web · Codex Cloud | `qwen serve` 内置 Web Shell | `kimi web` 本地 Web UI | Qoder Web · Cloud Agents Console |
| [桌面端](./capabilities/surfaces/surface-desktop.md) | Claude Desktop Code | ChatGPT Desktop Codex | Qwen Code Desktop | 无独立桌面端；提供 VS Code/Web | Qoder IDE |
| [云端仓库任务](./capabilities/surfaces/surface-cloud.md) | `claude --remote` · Web Cloud | Codex Cloud | 无托管云任务；`qwen serve` 为自托管 | 无托管云任务；`kimi web` 为自托管 | `qodercli --remote` · Cloud Mode |
| [远程接管与跨端继续](./capabilities/surfaces/surface-remote-control.md) | `/remote-control` · `/teleport` | `app-server --listen` · `codex --remote` · Cloud | `qwen serve` 多客户端；需自建网络 | `kimi web --host`；需自建网络 | `/remote-control` · `qodercli remote-control` |

## 阅读边界

本矩阵把一次性 Headless、结构化输出、Agent SDK、常驻服务、CLI、IDE/ACP、Web、Desktop、托管云任务和远程接管拆成不同字段。能把本地服务部署到云主机，不等于厂商提供托管 Cloud Mode；能从浏览器打开本地会话，也不等于任务已转移到云端执行。

## 详情字段

每个能力页分别记录五家的入口与调用、协议与输出、具体行为、会话与状态、工具与能力、认证与权限、运行位置、条件和官方来源。
