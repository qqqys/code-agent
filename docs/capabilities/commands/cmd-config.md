# 配置

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-config)

> 核对日期：2026-08-14

## 定义

在会话内查看、修改或诊断 CLI 的模型、界面、工具和行为设置。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/config [key=value ...]` | 官方确认 |
| Codex | `/debug-config` | 条件项 |
| Qwen Code | `/config <key>[=<value>]`、`/settings`、`/import-config` | 源码确认 |
| Kimi Code | `/settings` | 官方确认 |
| Qoder CLI | `/config` | 官方确认 |

## 比较边界

### 本页包含

- 设置界面
- 按 key 写配置
- 配置层诊断
- 导入配置

### 本页不包含

- 账号登录
- 权限规则完整语义
- MCP Server 独立管理

## 跨产品事实

1. Claude Code 与 Qwen Code 都支持在命令参数中直接设置 key/value。
2. Codex `/debug-config` 是只读诊断，不是通用配置编辑器。
3. Kimi Code 和 Qoder CLI 的配置命令打开 TUI 设置面板。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/config [key=value ...]` |
| 别名 | `/settings` |
| 参数 | `key=value ...`；`--help` 查看可设置键 |
| 执行行为 | 打开设置界面，或直接设置一个或多个配置项。 |
| 可用模式 | 交互式；key/value 形式也可用于 `-p` 和 Remote Control |
| 保存范围 | 写入设置，供后续会话使用 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/debug-config` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打印配置层顺序、启用状态和组织策略要求。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 只读，不修改配置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/config <key>[=<value>]`、`/settings`、`/import-config` |
| 别名 | 无公开别名 |
| 参数 | `<key>[=<value>]` 或 `--help` |
| 执行行为 | `/config` 按 dot-path 读写任意设置；`/settings` 打开图形设置；`/import-config` 导入配置。 |
| 可用模式 | `/config` 支持交互、非交互、ACP；设置界面仅交互 |
| 保存范围 | 写入项目或用户设置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/settings` |
| 别名 | `/config` |
| 参数 | 无公开参数 |
| 执行行为 | 打开 TUI 设置面板；更新配置也可调用内置 `/update-config` Skill。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 写入 Kimi Code 设置 |
| 条件与边界 | 流式输出期间可使用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/config` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开 Qoder CLI 配置管理界面。 |
| 可用模式 | TUI |
| 保存范围 | 写入 Qoder CLI 设置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [权限设置](./cmd-permissions.md)
- [选择模型](./cmd-model.md)
- [状态与用量](./cmd-status.md)
