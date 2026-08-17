# 远程与跨端

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-remote)

> 核对日期：2026-08-17

## 定义

把当前 CLI 会话迁移、暴露或继续到桌面端、Web、移动设备或云端运行环境。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/remote-control`、`/teleport`、`/desktop` | 官方确认 |
| Codex | `/app` | 官方确认 |
| Qwen Code | 无对应命令 | 未确认 |
| Kimi Code | `/web` | 官方确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- 远程控制
- 桌面端继续
- Web 会话拉取
- Cloud Mode

### 本页不包含

- IDE 上下文连接
- 普通会话恢复
- GitHub Actions 设置

## 跨产品事实

1. Claude Code 提供 Remote Control、Teleport 和 Desktop 三类不同入口。
2. Codex `/app` 把当前会话继续到 ChatGPT 桌面应用。
3. Kimi Code `/web` 可选择运行中的 Web 实例，或启动 Web Server 后继续当前会话。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/remote-control`、`/teleport`、`/desktop` |
| 别名 | `/rc`、`/app` |
| 参数 | 无公开参数 |
| 执行行为 | 暴露当前本地会话供远程控制、把 Web 会话拉到终端，或在 Desktop 继续当前会话。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 会话在对应 Surface 中继续 |
| 条件与边界 | Remote Control 和 Desktop 需要相应订阅；Desktop 只在 macOS/Windows |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/app` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 在 macOS 或 Windows 的 ChatGPT 桌面应用中继续当前会话。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 同一会话跨 Surface 继续 |
| 条件与边界 | 需要支持的桌面平台和应用 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | Daemon、Web Shell 与 Channel 可提供远程 Surface，但当前内置命令目录没有统一远程迁移命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/web` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 选择运行中的 Web 实例连接当前会话，或退出 TUI 后启动前台 Web Server。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话在 Web UI 中继续 |
| 条件与边界 | 流式输出期间可使用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | Qoder 提供 Remote Control 和 Cloud Mode 文档，但当前 Slash 命令目录没有独立远程控制命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [IDE 或编辑器](./cmd-ide.md)
- 远程接管与跨端继续：见对应能力矩阵
- 云端仓库任务：见对应能力矩阵
