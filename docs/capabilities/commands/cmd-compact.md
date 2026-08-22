# 压缩上下文

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-compact)

> 核对日期：2026-08-22

## 定义

把较长的对话历史替换为摘要或裁剪后的上下文，以释放模型上下文窗口。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/compact [instructions]` | 官方确认 |
| Codex | `/compact` | 官方确认 |
| Qwen Code | `/compress`、`/compress-fast` | 源码确认 |
| Kimi Code | `/compact [instruction]` | 官方确认 |
| Qoder CLI | `/compact [instructions]` | 官方确认 |

## 比较边界

### 本页包含

- 模型摘要压缩
- 自定义保留指令
- 非模型快速裁剪
- 压缩后的可撤销边界

### 本页不包含

- 清空会话
- 跨会话长期记忆
- 修改模型上下文窗口上限

## 跨产品事实

1. 五家都有上下文压缩入口。
2. Qwen Code 额外提供 `/compress-fast`，不调用模型，只裁剪旧工具输出和 thinking。
3. Kimi Code 压缩后，`/undo` 不能回到最近一次压缩之前。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/compact [instructions]` |
| 别名 | 无公开别名 |
| 参数 | `[instructions]` |
| 执行行为 | 总结当前对话并用摘要释放上下文；可指定摘要关注点。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 替换当前会话上下文表示 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/compact` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 总结可见聊天内容并释放 token。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 替换当前会话上下文表示 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/compress`、`/compress-fast` |
| 别名 | `/summarize` |
| 参数 | 无公开参数 |
| 执行行为 | `/compress` 生成摘要；`/compress-fast` 不调用模型，移除旧工具输出和 thinking 片段。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 修改当前会话上下文 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/compact [instruction]` |
| 别名 | 无公开别名 |
| 参数 | `[instruction]` |
| 执行行为 | 压缩当前对话；可指示需要保留的信息。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 修改当前会话上下文 |
| 条件与边界 | 仅空闲时使用；压缩前的提示不能再由 `/undo` 撤销 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/compact [instructions]` |
| 别名 | 无公开别名 |
| 参数 | `[instructions]` |
| 执行行为 | 以 Prompt 命令总结当前会话并压缩上下文。 |
| 可用模式 | TUI 与 Headless |
| 保存范围 | 修改当前会话上下文 |
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

- [新会话](./cmd-new.md)
- [状态与用量](./cmd-status.md)
- [记忆管理](./cmd-memory.md)
