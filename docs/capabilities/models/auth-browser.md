# 浏览器账号登录

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-browser)

> 核对日期：2026-07-31

## 定义

通过浏览器或设备码完成产品账号授权，并区分账号登录与仅配置模型 Provider。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/login` | 官方确认 |
| Codex | `codex login` · Device Code | 官方确认 |
| Qwen Code | 当前无浏览器账号登录；`/auth` 配置 Provider | 条件项 |
| Kimi Code | `/login` · `kimi login` | 源码确认 |
| Qoder CLI | `/login` · `qodercli login` | 官方确认 |

## 比较边界

### 本页包含

- 浏览器 OAuth、设备码与账号登录命令
- 登录结果的 CLI 使用范围
- 无浏览器登录时的明确替代入口

### 本页不包含

- 静态 API Key 的全部注入方式
- 企业 SSO 管理细节
- IDE 自身的独立登录 UI

## 跨产品事实

1. Claude Code、Codex、Kimi Code 和 Qoder CLI 都有产品账号登录流程。
2. Qwen Code 当前 `/auth` 是 Provider/Key 配置入口；旧 Qwen OAuth 免费层已于 2026-04-15 停止，不应再标成可用浏览器账号登录。
3. Kimi Code 的 `kimi login` 可用设备码完成 Headless 登录。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/login` |
| 入口与配置 | `/login` 或启动时登录流程。 |
| 支持范围 | 浏览器授权 Claude.ai、Team 或 Enterprise 账号。 |
| 具体行为 | 获得可供 Claude Code 使用的账号 OAuth 凭据。 |
| 会话与作用域 | 本机用户，后续 Claude Code 会话复用。 |
| 持久化位置 | macOS 存 Keychain；其他平台按凭据文件与权限保存。 |
| 自动化用法 | 无人值守场景更适合 API Key、云 Provider 或 `apiKeyHelper`。 |
| 安全与管理 | 企业可限制登录方法和组织 UUID。 |
| 条件与边界 | 可用模型和额度由账号计划与组织策略决定。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)、[Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code server-managed settings](https://code.claude.com/docs/en/server-managed-settings) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `codex login` · Device Code |
| 入口与配置 | `codex login`；可选设备码登录。 |
| 支持范围 | 浏览器 ChatGPT 登录或 device-code 流程。 |
| 具体行为 | 本地 Codex 获得 ChatGPT 身份；Codex Cloud 要求 ChatGPT 登录。 |
| 会话与作用域 | 本机 Codex home，后续会话复用。 |
| 持久化位置 | 按 `cli_auth_credentials_store` 保存到文件或系统 Keyring。 |
| 自动化用法 | 无浏览器环境可用 device auth；API 自动化可改用 Key 或 access token。 |
| 安全与管理 | 组织可强制 ChatGPT 登录方式与 Workspace ID。 |
| 条件与边界 | API Key 登录可运行本地 Codex，但不能替代 Codex Cloud 的 ChatGPT 身份。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 当前无浏览器账号登录；`/auth` 配置 Provider |
| 入口与配置 | `/auth`。 |
| 支持范围 | 当前入口选择 ModelStudio 计划/API Key、第三方 Provider 或 Custom Provider。 |
| 具体行为 | 配置模型服务认证；不是当前可用的产品账号浏览器 OAuth 登录。 |
| 会话与作用域 | Provider 配置和本机 Key 来源。 |
| 持久化位置 | 可写入 Settings 或由环境与 `.env` 提供。 |
| 自动化用法 | Headless 使用 Provider 环境变量或 Settings。 |
| 安全与管理 | 旧 OAuth 凭据不应被当作当前免费登录路径。 |
| 条件与边界 | Qwen OAuth 免费层已于 2026-04-15 停止并不再可选。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)、[Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/login` · `kimi login` |
| 入口与配置 | `/login` 或 `kimi login`。 |
| 支持范围 | Kimi Code 账号走 OAuth；Headless 可显示设备码；Kimi Platform 可选 API Key。 |
| 具体行为 | OAuth 登录后选择账号并为 CLI 保存凭据。 |
| 会话与作用域 | 本机用户，当前选择账号供后续会话复用。 |
| 持久化位置 | OAuth 凭据保存在 `~/.kimi-code/credentials/`。 |
| 自动化用法 | 无浏览器机器使用 `kimi login` 设备码或 Provider API Key。 |
| 安全与管理 | 凭据目录 0700、文件 0600。 |
| 条件与边界 | Kimi Code OAuth 与 Kimi Platform API Key 是两种不同登录路径。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)、[Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/login` · `qodercli login` |
| 入口与配置 | `/login` 或 `qodercli login`。 |
| 支持范围 | 浏览器登录 Qoder 账号，也可输入 Personal Access Token。 |
| 具体行为 | CLI 保存登录态，SDK 可复用 qodercli 的身份。 |
| 会话与作用域 | 本机用户和账号。 |
| 持久化位置 | 本地登录缓存跨会话复用；公共文档未公开精确后端。 |
| 自动化用法 | CI 推荐 `QODER_PERSONAL_ACCESS_TOKEN`。 |
| 安全与管理 | PAT 适合撤销和最小化自动化凭据暴露。 |
| 条件与边界 | 本地交互登录优先于环境变量 PAT。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)、[Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)、[Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code server-managed settings](https://code.claude.com/docs/en/server-managed-settings)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/features/commands.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/kimi-command.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md)
- [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)
- [Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [API Key](./auth-api-key.md)
- [本地凭据存储](./auth-storage.md)
- [退出与撤销本地凭据](./auth-logout.md)
