# 登录账号

[返回 Slash 命令详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=cmd-login)

> 核对日期：2026-08-24

## 定义

在已经启动的 CLI 会话中选择账号、模型平台或认证方式，并写入后续请求所需的本地凭据。

## 命令对照

| 产品 | 命令摘要 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/login`、`/logout` | 官方确认 |
| Codex | `/logout` | 条件项 |
| Qwen Code | `/auth` | 源码确认 |
| Kimi Code | `/login`、`/logout` | 官方确认 |
| Qoder CLI | `/login`、`/logout` | 官方确认 |

## 比较边界

### 本页包含

- 交互式账号登录入口
- 退出登录与清理当前账号凭据
- 命令别名和登录平台差异

### 本页不包含

- 环境变量 API Key 的完整配置
- 企业单点登录策略
- 模型 Provider 的协议兼容性

## 跨产品事实

1. Claude Code、Kimi Code 和 Qoder CLI 都提供独立的登录与退出命令。
2. Qwen Code 把登录纳入 `/auth`，并兼容 `/connect`、`/login` 两个别名。
3. Codex CLI 使用启动级 `codex login` 完成登录；当前会话命令表只列出 `/logout`。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/login`、`/logout` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 登录或退出 Anthropic 账号。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 登录凭据供后续会话使用；`/logout` 清除当前登录状态 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/logout` |
| 别名 | 无公开别名 |
| 参数 | 登录：`codex login`；会话内退出：`/logout` |
| 执行行为 | 从交互会话退出当前 Codex 账号；登录由 `codex login` 启动级命令完成。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | 本地登录凭据跨会话使用，退出后失效 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 条件项 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/auth` |
| 别名 | `/connect`、`/login` |
| 参数 | 无公开参数 |
| 执行行为 | 打开认证流程，连接或切换 LLM Provider。 |
| 可用模式 | 交互式、非交互式、ACP |
| 保存范围 | 认证信息写入 Qwen Code 的本地认证配置 |
| 条件与边界 | 无额外条件 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code commands documentation](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/login`、`/logout` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 选择 Kimi Code 或 Kimi Platform 登录；前者走 OAuth 验证码，后者使用 API Key。 |
| 可用模式 | 交互式 CLI |
| 保存范围 | `/logout` 清除当前所选账号的凭据 |
| 条件与边界 | 登录与退出只在 CLI 空闲时执行 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code Slash commands](https://github.com/MoonshotAI/kimi-code/blob/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 主命令 | `/login`、`/logout` |
| 别名 | 无公开别名 |
| 参数 | 无公开参数 |
| 执行行为 | 登录或退出 Qoder 账号。 |
| 可用模式 | TUI |
| 保存范围 | 账号凭据供后续会话使用 |
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

- [选择模型](./cmd-model.md)
- [配置](./cmd-config.md)
- [状态与用量](./cmd-status.md)
