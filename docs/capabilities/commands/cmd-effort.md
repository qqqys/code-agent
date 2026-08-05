# 推理强度

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-effort)

> 核对日期：2026-08-05

## 定义

调整推理模型的思考强度或选择服务端快速档位，不改变任务提示本身。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/effort [level\|auto]`、`/fast [on\|off]` | 官方确认 |
| Codex | `/model`、`/fast` | 官方确认 |
| Qwen Code | `/effort` | 源码确认 |
| Kimi Code | 无对应命令 | 未确认 |
| Qoder CLI | `/effort [level]`、`/fast [on\|off]` | 官方确认 |

## 比较边界

### 本页包含

- reasoning effort
- 快速服务档位
- 参数范围
- 是否立即生效和是否持久化

### 本页不包含

- 模型切换
- 上下文窗口大小
- 响应风格

## 跨产品事实

1. Claude Code、Qwen Code 和 Qoder CLI 提供独立 `/effort`。
2. Codex 将 reasoning effort 放在 `/model` 中，并用 `/fast` 控制可用的 Fast 服务档位。
3. Kimi Code 当前 Slash 命令目录未列出独立 effort 命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/effort [level\|auto]`、`/fast [on\|off]` |
| 别名 | 无公开别名 |
| 参数 | `low\|medium\|high\|xhigh\|max\|auto`；可用档位依模型 |
| 执行行为 | 设置模型 effort；`/fast` 切换快速服务模式。 |
| 可用模式 | 交互式；`-p` 支持带 level 参数 |
| 保存范围 | `max` 和 `-p` 形式仅当前会话；其他档位可通过设置保存 |
| 条件与边界 | 部分档位需要支持的模型或服务计划 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/model`、`/fast` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 在模型选择器中设置 reasoning effort；`/fast` 切换模型目录提供的 Fast 档位。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | `/fast` 的选择会持久化 |
| 条件与边界 | 仅在当前模型目录暴露对应档位时可用 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/effort` |
| 别名 | 无公开别名 |
| 参数 | 命令提示显示当前支持的 effort tiers；不带参数打开选择器 |
| 执行行为 | 设置统一 effort 档位，再按 Provider 能力映射和截断。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 当前会话或当前模型配置 |
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
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/8db7d42f23472a692eb389a0e0e5a3e18aa1b94d/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/effort [level]`、`/fast [on\|off]` |
| 别名 | 无公开别名 |
| 参数 | `/effort [level]`；不带 level 打开模型选项 |
| 执行行为 | 设置当前模型推理强度；`/fast` 切换快速模式。 |
| 可用模式 | TUI |
| 保存范围 | 当前模型设置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/8db7d42f23472a692eb389a0e0e5a3e18aa1b94d/docs/zh/reference/slash-commands.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [选择模型](./cmd-model.md)
- [状态与用量](./cmd-status.md)
- [配置](./cmd-config.md)
