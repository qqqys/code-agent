# 记忆管理

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-memory)

> 核对日期：2026-08-21

## 定义

查看、创建或删除可跨会话复用的项目信息、用户偏好或自动提取的记忆。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/memory` | 官方确认 |
| Codex | `/memories` | 官方确认 |
| Qwen Code | `/memory`、`/remember <text>`、`/forget <text>`、`/learn <source> [focus]` | 源码确认 |
| Kimi Code | 无对应命令 | 未确认 |
| Qoder CLI | `/memory`、`/memory manage` | 官方确认 |

## 比较边界

### 本页包含

- 记忆管理界面
- 显式记住和忘记
- 自动记忆开关
- 项目指令文件入口

### 本页不包含

- 当前对话上下文
- Skill 知识包
- 会话导出

## 跨产品事实

1. Claude Code、Codex、Qwen Code 和 Qoder CLI 都提供记忆管理命令。
2. Qwen Code 将显式写入、删除和从知识源生成 Skill 拆成多个命令。
3. Kimi Code 当前 Slash 命令目录没有独立记忆管理命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/memory` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 编辑 CLAUDE.md 记忆文件，管理 auto-memory 开关并查看自动记忆条目。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 项目或用户记忆文件跨会话生效 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/memories` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 开启或关闭记忆注入和记忆生成。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 记忆功能可跨会话使用 |
| 条件与边界 | 仅在 Memories 功能可用时出现 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/memory`、`/remember <text>`、`/forget <text>`、`/learn <source> [focus]` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开记忆管理器、写入持久记忆、删除匹配的自动记忆，或从文件、URL、对话、文本生成 Skill。 |
| 可用模式 | `/memory` 仅交互；其他命令支持交互和 ACP |
| 保存范围 | 记忆或 Skill 文件跨会话生效 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

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
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/memory`、`/memory manage` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开记忆概览、自动记忆目录或主题文件管理。 |
| 可用模式 | TUI |
| 保存范围 | 记忆文件跨会话生效 |
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

- [Skills](./cmd-skills.md)
- [压缩上下文](./cmd-compact.md)
- [项目指令文件](../extensions/extension-project-instructions.md)
