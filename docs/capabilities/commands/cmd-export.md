# 导出会话

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-export)

> 核对日期：2026-07-27

## 定义

把当前会话历史写入用户指定文件或导出包，供阅读、归档或问题诊断。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/export [filename]` | 官方确认 |
| Codex | 无对应命令 | 未确认 |
| Qwen Code | `/export [md\|html\|json\|jsonl] [path]` | 源码确认 |
| Kimi Code | `/export-md [path]`、`/export-debug-zip` | 官方确认 |
| Qoder CLI | `/export [filename]` | 官方确认 |

## 比较边界

### 本页包含

- 导出格式
- 文件路径参数
- 剪贴板
- 调试包

### 本页不包含

- 分享远程会话链接
- 导出项目代码
- 会话恢复格式兼容

## 跨产品事实

1. Qwen Code 提供 HTML、Markdown、JSON、JSONL 四种格式。
2. Kimi Code 将普通 Markdown 导出与调试 ZIP 分开。
3. Codex 当前 CLI Slash 命令表未列出会话导出命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/export [filename]` |
| 别名 | 无公开别名 |
| 参数 | `[filename]` |
| 执行行为 | 导出为纯文本；无文件名时打开复制或保存对话框。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 写文件或剪贴板 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 当前官方命令目录未列出对应 Slash 命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/export [md\|html\|json\|jsonl] [path]` |
| 别名 | 无公开别名 |
| 参数 | `[md\|html\|json\|jsonl] [path]` |
| 执行行为 | 按指定格式写出当前会话消息历史；不带子命令默认 HTML。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 写入导出文件 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/export-md [path]`、`/export-debug-zip` |
| 别名 | `/export` |
| 参数 | `[path]` |
| 执行行为 | 普通会话导出为 Markdown；诊断信息导出为 ZIP。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 写入导出文件 |
| 条件与边界 | 仅空闲时使用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/export [filename]` |
| 别名 | 无公开别名 |
| 参数 | `[filename]` |
| 执行行为 | 把当前会话导出到文件。 |
| 可用模式 | TUI |
| 保存范围 | 写入导出文件 |
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

- [状态与用量](./cmd-status.md)
- [会话导出](../sessions/session-export.md)
- [配置](./cmd-config.md)
