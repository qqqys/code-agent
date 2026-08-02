# MCP

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-mcp)

> 核对日期：2026-08-02

## 定义

查看和管理当前 CLI 已配置的 Model Context Protocol Server、连接状态和可用工具。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/mcp [reconnect <server>\|enable\|disable [server\|all]]` | 官方确认 |
| Codex | `/mcp [verbose]` | 官方确认 |
| Qwen Code | `/mcp [desc\|nodesc\|schema]` | 源码确认 |
| Kimi Code | `/mcp`、`/mcp-config` | 官方确认 |
| Qoder CLI | `/mcp` | 官方确认 |

## 比较边界

### 本页包含

- Server 列表
- 连接状态
- 启用与禁用
- OAuth 或重连

### 本页不包含

- MCP 协议实现细节
- 工具权限完整策略
- 把 CLI 本身作为 MCP Server

## 跨产品事实

1. 五家都提供 `/mcp`。
2. Claude Code 支持 reconnect、enable、disable 子命令。
3. Qwen Code 的 `/mcp` 打开管理对话框，并支持 desc、nodesc、schema 参数。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp [reconnect <server>\|enable\|disable [server\|all]]` |
| 别名 | 无公开别名 |
| 参数 | `reconnect <server>`、`enable\|disable [server\|all]` |
| 执行行为 | 打开连接列表，重连 Server，或启用和禁用连接。 |
| 可用模式 | 交互式；`-p` 无参数时输出文本状态 |
| 保存范围 | enable/disable 修改连接启用状态 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp [verbose]` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 列出已配置 MCP 工具；verbose 显示 Server 详情。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 只读状态入口 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp [desc\|nodesc\|schema]` |
| 别名 | 无公开别名 |
| 参数 | `desc\|nodesc\|schema` |
| 执行行为 | 打开 MCP 管理对话框，并控制工具描述或 schema 展示。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp`、`/mcp-config` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 查看 MCP 状态；通过内置 Skill 配置 MCP Server。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 配置写入 MCP 设置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/mcp` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 列出并管理 MCP Server。 |
| 可用模式 | TUI |
| 保存范围 | 由管理界面操作决定 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [插件或扩展](./cmd-plugins.md)
- [Skills](./cmd-skills.md)
- [MCP 客户端](../extensions/extension-mcp.md)
