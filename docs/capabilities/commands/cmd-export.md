# 导出会话

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-export)

> 核对日期：2026-08-13

## 定义

把当前会话历史写入用户指定文件或导出包，供阅读、归档或问题诊断。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/export [filename]` | 官方确认 |
| Codex | `/export [path]` | 源码确认 |
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
3. Codex TUI 的 `/export` 于 2026-08-07 合入 main 分支，导出结构化 Markdown；官方命令文档尚未列出。

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
| 主命令 | `/export [path]` |
| 别名 | 无公开别名 |
| 参数 | `[path]`；不带参数打开选择器（Copy to clipboard · Save to file） |
| 执行行为 | 把完整会话历史导出为结构化 Markdown，保留用户与助手消息、计划、推理、活动、图片标签、文件改动和 MCP 工具细节，并遵循推理可见性设置；不带参数时打开 Export conversation 选择器。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 写入 Markdown 文件或剪贴板；保存默认文件名 `codex-session-<thread_id>.md`，无 thread ID 时为 `codex-session.md` |
| 条件与边界 | 条件：main 分支合入，尚未进入 Release；不覆盖已存在文件；相对路径按当前工作目录解析，`~` 展开为主目录 |
| 证据状态 | 源码确认 |
| 来源 | [Codex TUI Markdown conversation export](https://github.com/openai/codex/commit/2801d12661bea3c7ff1a6a39c810348222453a27) |

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
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md) |

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
- [Codex TUI Markdown conversation export](https://github.com/openai/codex/commit/2801d12661bea3c7ff1a6a39c810348222453a27)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/7c919f0376c0331d0d057ef3643c7adcc2c55802/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [状态与用量](./cmd-status.md)
- [会话导出](../sessions/session-export.md)
- [配置](./cmd-config.md)
