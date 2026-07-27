# 自定义命令

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-custom)

> 核对日期：2026-07-27

## 定义

从用户或项目文件加载自定义提示模板，并以 Slash 命令形式在 TUI 或 Headless 中执行。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/<skill-name>` | 条件项 |
| Codex | `/<skill-name>` | 条件项 |
| Qwen Code | `/workflows`、`/<skill-name>` | 源码确认 |
| Kimi Code | `/<skill-name>` | 条件项 |
| Qoder CLI | `/commands`、`/<command-name>` | 官方确认 |

## 比较边界

### 本页包含

- 自定义命令文件
- 项目与用户 scope
- 命令管理入口
- Headless 可用性

### 本页不包含

- 内置命令修改
- 普通项目指令文件
- 插件的完整打包规范

## 跨产品事实

1. Claude Code、Codex 和 Kimi Code 主要通过 Skills 提供自定义命令。
2. Qwen Code 同时提供 Workflows 与 Skills。
3. Qoder CLI 明确支持 `.qoder/commands/` 和 `~/.qoder/commands/`，Prompt 类型可用于 Headless。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/<skill-name>` |
| 别名 | 无公开别名 |
| 参数 | 由 Skill 定义；消息开头可连续写多个 Skill |
| 执行行为 | 自定义 Skill 可作为 Slash 命令调用，最多可在消息开头串联六个 Skill。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Skill 文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/<skill-name>` |
| 别名 | 无公开别名 |
| 参数 | 由 Skill 定义 |
| 执行行为 | 通过本地 Skills 扩展任务命令。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Skill 文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/workflows`、`/<skill-name>` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 工作流面板管理运行中的 Workflow；Skills 可作为命令调用。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 定义文件跨会话存在，运行状态属于相应会话 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code command source](https://github.com/QwenLM/qwen-code/tree/main/packages/cli/src/ui/commands) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/<skill-name>` |
| 别名 | 无公开别名 |
| 参数 | 由 Skill 定义 |
| 执行行为 | Skills 参与 Slash 命令补全，未匹配的 Slash 文本会作为普通消息发送。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | Skill 文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/commands`、`/<command-name>` |
| 别名 | 无公开别名 |
| 参数 | 项目 `.qoder/commands/`；用户 `~/.qoder/commands/` |
| 执行行为 | 管理并执行 Markdown + YAML 定义的自定义命令。 |
| 可用模式 | 管理界面只在 TUI；Prompt 命令可用于 TUI 与 Headless |
| 保存范围 | 命令文件跨会话存在 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code command source](https://github.com/QwenLM/qwen-code/tree/main/packages/cli/src/ui/commands)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [Skills](./cmd-skills.md)
- [插件或扩展](./cmd-plugins.md)
- 自定义 Slash 命令：见对应能力矩阵
