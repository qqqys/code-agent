# 认证状态检查

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-status)

> 核对日期：2026-08-22

## 定义

显示当前账号、认证方式、Provider 配置或运行诊断状态，并区分专用认证状态与通用运行状态。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/status` · `/doctor` | 官方确认 |
| Codex | `codex login status` · `/status` | 官方确认 |
| Qwen Code | `/doctor` | 条件项 |
| Kimi Code | `/status`；无独立认证状态命令 | 条件项 |
| Qoder CLI | `/status` | 官方确认 |

## 比较边界

### 本页包含

- 登录状态命令
- 运行状态页中的认证信息
- 认证与 Provider 诊断入口

### 本页不包含

- 服务端账号管理后台
- 模型调用的完整网络抓包
- 只显示版本号而不检查认证的命令

## 跨产品事实

1. Codex 提供专用 `codex login status`；其他产品多在 `/status` 或 `/doctor` 中展示。
2. Qwen Code 应使用 `/doctor` 诊断认证；它的 `/status` 主要是版本与路径状态。
3. Kimi Code `/status` 是运行状态入口，公共命令目录没有独立 auth status 命令。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/status` · `/doctor` |
| 入口与配置 | `/status`、`/doctor`。 |
| 支持范围 | `/status` 显示版本、模型、账号和连接；`/doctor` 检查安装与配置健康度。 |
| 具体行为 | 帮助识别当前账号、Provider 与配置问题。 |
| 会话与作用域 | 当前进程和本机配置。 |
| 持久化位置 | 只读，不修改凭据。 |
| 自动化用法 | 脚本应优先验证实际模型请求或使用非交互诊断输出。 |
| 安全与管理 | 分享诊断信息前移除账号、组织和路径等敏感字段。 |
| 条件与边界 | 显示字段随 Provider 与客户端版本变化。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code authentication and credential management](https://code.claude.com/docs/en/team) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `codex login status` · `/status` |
| 入口与配置 | `codex login status`、交互式 `/status`。 |
| 支持范围 | 启动级命令专门报告登录；`/status` 显示当前线程配置与 token 使用。 |
| 具体行为 | 区分未登录、ChatGPT/API 凭据和当前运行配置。 |
| 会话与作用域 | 当前 Codex home 与线程。 |
| 持久化位置 | 只读。 |
| 自动化用法 | CI 可在任务前运行 `codex login status`。 |
| 安全与管理 | 不要在公开日志输出令牌值。 |
| 条件与边界 | Provider 环境变量是否有效仍需实际请求验证。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth)、[Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/doctor` |
| 入口与配置 | `/doctor`。 |
| 支持范围 | 诊断认证、Provider 与运行环境；`/status` 主要显示版本和路径。 |
| 具体行为 | 检查当前认证配置并提示问题。 |
| 会话与作用域 | 当前进程、项目与 Qwen 配置层。 |
| 持久化位置 | 诊断本身只读。 |
| 自动化用法 | Headless 可通过启动验证和实际请求确认 Provider Key。 |
| 安全与管理 | 报告诊断内容时避免暴露 Key 与环境值。 |
| 条件与边界 | 不能把 `/status` 单独当作专用登录状态命令。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md)、[Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/status`；无独立认证状态命令 |
| 入口与配置 | `/status`。 |
| 支持范围 | 显示当前运行、Provider、模型和会话相关状态。 |
| 具体行为 | 可辅助判断当前 Provider，但没有独立的 auth status 子命令。 |
| 会话与作用域 | 当前会话。 |
| 持久化位置 | 只读。 |
| 自动化用法 | 自动化应发起最小模型请求或验证配置文件，而非依赖交互页。 |
| 安全与管理 | 分享状态输出前检查 Provider 名和路径。 |
| 条件与边界 | 静态 Key 是否有效仍由真实请求结果确认。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)、[Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/status` |
| 入口与配置 | `/status`。 |
| 支持范围 | 显示版本、模型、账号和运行状态。 |
| 具体行为 | 确认当前 Qoder 登录与会话配置。 |
| 会话与作用域 | 当前 TUI 会话与本地账号。 |
| 持久化位置 | 只读。 |
| 自动化用法 | SDK/CI 通过 PAT 和请求结果验证认证。 |
| 安全与管理 | 公开日志中不要暴露 PAT 或账号细节。 |
| 条件与边界 | 公共文档未列独立 `qodercli login status`。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)

## 关联能力

- [浏览器账号登录](./auth-browser.md)
- [退出与撤销本地凭据](./auth-logout.md)
- [状态与用量](../commands/cmd-status.md)
