# 查看 Diff

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-diff)

> 核对日期：2026-08-21

## 定义

在 CLI 中查看工作区相对 Git 基线的文件变化，或按 Agent 轮次查看其产生的差异。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/diff` | 官方确认 |
| Codex | `/diff` | 官方确认 |
| Qwen Code | `/diff` | 源码确认 |
| Kimi Code | 无对应命令 | 未确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- 工作树 Diff
- 未跟踪文件
- 按轮次 Diff
- 交互浏览

### 本页不包含

- 代码审查结论
- Git 提交
- 云端 PR Diff

## 跨产品事实

1. Claude Code、Codex 和 Qwen Code 提供内置 Diff 命令。
2. Claude Code 可在当前 Git Diff 与每轮 Agent Diff 之间切换。
3. Qwen Code 当前 `/diff` 输出相对 HEAD 的工作树变更统计，不等同于完整补丁查看器。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/diff` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 打开交互式 Diff 浏览器，在当前 Git Diff、单轮变更和文件之间切换。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 只读，不修改工作区 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/diff` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 显示 Git Diff，并包含尚未被 Git 跟踪的文件。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 只读，不修改工作区 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/diff` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 显示工作树相对 HEAD 的变更统计。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 只读，不修改工作区 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 可通过 Git 或 Shell 查看差异，但当前官方 Slash 命令目录没有 `/diff`。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | — |
| 条件与边界 | 不据此推断底层能力不存在 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | 可通过 Git 或 Shell 查看差异，但当前官方 Slash 命令目录没有 `/diff`。 |
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

- [代码审查](./cmd-review.md)
- [回退或检查点](./cmd-rewind.md)
- 文件读写：见对应能力矩阵
