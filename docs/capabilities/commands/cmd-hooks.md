# Hooks

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-hooks)

> 核对日期：2026-08-23

## 定义

查看、信任、启用或管理在 Agent 生命周期事件上执行的 Hook。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/hooks` | 官方确认 |
| Codex | `/hooks` | 官方确认 |
| Qwen Code | `/hooks` | 源码确认 |
| Kimi Code | 无对应命令 | 未确认 |
| Qoder CLI | 无对应命令 | 未确认 |

## 比较边界

### 本页包含

- Hook 列表
- 信任状态
- 启用与禁用
- 命令级管理入口

### 本页不包含

- 每种 Hook 事件的完整参数 schema
- CI Hook
- Git Hook

## 跨产品事实

1. Claude Code、Codex 和 Qwen Code 提供独立 `/hooks`。
2. Qoder CLI 支持 Agent Hooks，但当前命令目录没有独立 `/hooks`。
3. Kimi Code 当前 Slash 命令目录未列出 Hook 管理命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/hooks` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 查看工具事件等生命周期 Hook 配置。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 只读或进入 Hook 配置管理，配置文件跨会话生效 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/hooks` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 查看和管理 Hook，信任新 Hook 或变化后的 Hook，并可禁用非托管 Hook。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 信任和启用状态跨会话生效 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/hooks` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 管理 Qwen Code Hooks；命令支持交互、非交互和 ACP。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | Hook 配置跨会话生效 |
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
| 主命令 | 无对应命令 |
| 别名 | 无公开别名 |
| 参数 | — |
| 执行行为 | Agent 配置支持 `hooks` 字段，但当前官方 Slash 命令目录没有独立 Hook 管理命令。 |
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

- [插件或扩展](./cmd-plugins.md)
- [Agent 独立 Hooks](../subagents/agent-hooks.md)
- [生命周期 Hooks](../extensions/extension-hooks.md)
