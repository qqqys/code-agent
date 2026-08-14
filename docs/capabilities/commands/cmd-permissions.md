# 权限设置

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-permissions)

> 核对日期：2026-08-14

## 定义

在会话运行中查看或修改工具审批模式、允许规则和拒绝规则。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/permissions` | 官方确认 |
| Codex | `/permissions` | 官方确认 |
| Qwen Code | `/approval-mode`、`/permissions` | 源码确认 |
| Kimi Code | `/permission`、`/auto [on\|off]`、`/yolo [on\|off]` | 官方确认 |
| Qoder CLI | `/config` | 条件项 |

## 比较边界

### 本页包含

- 审批预设
- 允许、询问、拒绝规则
- YOLO/自动编辑模式
- 生效范围

### 本页不包含

- 操作系统沙箱实现
- 企业托管策略完整配置
- Subagent 独立权限字段

## 跨产品事实

1. Claude Code 和 Qwen Code 将审批模式与细粒度规则分成不同入口。
2. Codex `/permissions` 切换审批预设，例如 Auto 与 Read Only。
3. Kimi Code 除 `/permission` 外还提供 `/auto` 与 `/yolo` 快捷开关。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/permissions` |
| 别名 | `/allowed-tools` |
| 参数 | 无公开参数 |
| 执行行为 | 管理工具权限的 allow、ask、deny 规则，并查看工作目录和最近的 auto mode 拒绝。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 由对话框选择的规则 scope 决定 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/permissions` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 切换当前会话审批预设，例如 Auto、Read Only 或已配置的命名权限档案。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 立即影响当前会话后续操作 |
| 条件与边界 | 命名权限档案启用时会出现在选择器中 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/approval-mode`、`/permissions` |
| 别名 | 无公开别名 |
| 参数 | `/approval-mode <mode>` |
| 执行行为 | `/approval-mode` 切换工具审批模式；`/permissions` 管理细粒度权限规则。 |
| 可用模式 | 仅交互式 |
| 保存范围 | 模式影响当前会话；规则按权限配置 scope 保存 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/permission`、`/auto [on\|off]`、`/yolo [on\|off]` |
| 别名 | `/yes` |
| 参数 | 无公开参数 |
| 执行行为 | 选择权限模式；auto 自动处理工具审批，yolo 跳过普通工具调用审批。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 当前会话 |
| 条件与边界 | yolo 不跳过退出 Plan 模式的审批 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/config` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 权限模式通过配置界面管理；官方命令目录没有独立 `/permissions`。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 由配置项 scope 决定 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md)
- [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [计划模式](./cmd-plan.md)
- [配置](./cmd-config.md)
- [Agent 权限模式](../subagents/agent-permission.md)
