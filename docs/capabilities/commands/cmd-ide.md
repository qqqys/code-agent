# IDE 或编辑器

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-ide)

> 核对日期：2026-07-27

## 定义

连接或配置 IDE/外部编辑器，并把打开文件、选择区或编辑器状态加入 CLI 上下文。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/ide` | 官方确认 |
| Codex | `/ide` | 官方确认 |
| Qwen Code | `/ide`、`/editor` | 源码确认 |
| Kimi Code | `/editor` | 官方确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- IDE 连接状态
- 安装或启停集成
- 外部编辑器配置
- 编辑器上下文

### 本页不包含

- IDE 插件的全部功能
- LSP 功能矩阵
- 桌面端会话迁移

## 跨产品事实

1. Claude Code、Codex 和 Qwen Code 提供 `/ide`。
2. Kimi Code `/editor` 配置由 Ctrl-G 调起的外部编辑器。
3. Qoder CLI 命令表没有 IDE 连接命令，但 Qoder 产品另有 IDE Surface。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/ide` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 管理 IDE 集成并显示连接状态。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 仅影响当前会话或当前操作 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/ide` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 将 IDE 打开的文件、当前选择和其他编辑器上下文加入下一条提示。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 影响下一条或当前会话上下文 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/ide`、`/editor` |
| 别名 | 无公开别名 |
| 参数 | `/ide status\|install\|enable\|disable` |
| 执行行为 | `/ide` 检查、安装、启用或禁用 IDE 集成；`/editor` 设置外部编辑器偏好。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 集成和编辑器偏好跨会话保存 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code command source](https://github.com/QwenLM/qwen-code/tree/main/packages/cli/src/ui/commands) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/editor` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 配置 Ctrl-G 调起的外部编辑器。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 编辑器偏好跨会话保存 |
| 条件与边界 | 流式输出期间可使用 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | Qoder 产品提供 IDE Surface，但当前 CLI Slash 命令目录没有 IDE 连接命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code command source](https://github.com/QwenLM/qwen-code/tree/main/packages/cli/src/ui/commands)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [远程与跨端](./cmd-remote.md)
- IDE：见对应能力矩阵
- IDE 连接：见对应能力矩阵
