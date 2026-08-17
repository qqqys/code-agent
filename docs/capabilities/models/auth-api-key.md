# API Key

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-api-key)

> 核对日期：2026-08-17

## 定义

以静态 API Key、Personal Access Token 或命令生成令牌访问模型与产品服务。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `ANTHROPIC_API_KEY` · `apiKeyHelper` | 官方确认 |
| Codex | `login --with-api-key` · Provider `env_key` | 官方确认 |
| Qwen Code | `/auth` · 环境变量 · `.env` | 源码确认 |
| Kimi Code | `config.toml` `api_key` · Kimi Platform | 条件项 |
| Qoder CLI | PAT · 指定厂商 Custom Model Key | 条件项 |

## 比较边界

### 本页包含

- 官方 Key/PAT 入口
- Key 的引用方式
- 交互与自动化用法

### 本页不包含

- 浏览器 OAuth 的完整流程
- 云厂商 IAM 凭据链
- 第三方 Secret Manager 产品比较

## 跨产品事实

1. 五家都能在至少一种路径使用静态凭据，但凭据代表的服务不同。
2. Kimi Code 的常规 Provider API Key 默认来自 `config.toml` 的 `api_key` 或 Provider env 表，不会自动读取同名 Shell 变量。
3. Codex 自定义 Provider 推荐用 `env_key` 或命令认证引用 Key，而不是把值写进配置。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `ANTHROPIC_API_KEY` · `apiKeyHelper` |
| 入口与配置 | `ANTHROPIC_API_KEY`、`ANTHROPIC_AUTH_TOKEN`、`apiKeyHelper`。 |
| 支持范围 | 直接使用 Anthropic API Key、Bearer token 或执行命令动态取得凭据。 |
| 具体行为 | 为 Anthropic API 或兼容网关请求附加认证。 |
| 会话与作用域 | 进程环境、Settings env 或凭据辅助命令。 |
| 持久化位置 | 环境变量不由 Claude Code 保存；helper 可从外部 Secret Store 动态读取。 |
| 自动化用法 | CI/容器通常注入环境变量或调用 `apiKeyHelper`。 |
| 安全与管理 | 动态 helper 可避免长期明文 Key；不要把 Key 写进仓库。 |
| 条件与边界 | 账号 OAuth 与 API Key 的计费、配额和组织控制不同。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code settings](https://code.claude.com/docs/en/settings) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `login --with-api-key` · Provider `env_key` |
| 入口与配置 | 管道输入 `codex login --with-api-key`；Provider `env_key` 或 command-backed auth。 |
| 支持范围 | OpenAI API Key 或自定义 Provider 的 Key/短期令牌。 |
| 具体行为 | 本地 Codex 使用 Key 发出模型请求；Provider 可从指定环境变量读取。 |
| 会话与作用域 | Codex 登录存储或具体 Provider 配置。 |
| 持久化位置 | 登录 Key 按 credentials store 保存；`env_key` 本身只保存变量名。 |
| 自动化用法 | CI 从 Secret 注入 `OPENAI_API_KEY`，再管道给 login 或让 Provider 读取。 |
| 安全与管理 | 避免把 Key 作为命令行参数出现在进程列表和 Shell 历史。 |
| 条件与边界 | API Key 登录不提供 Codex Cloud 的 ChatGPT 账号能力。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/auth` · 环境变量 · `.env` |
| 入口与配置 | `/auth`、Provider `envKey`、系统环境、`.qwen/.env`、`settings.json.env`。 |
| 支持范围 | 每个 Provider 指定自己的 Key 变量；交互向导也可接收 Key。 |
| 具体行为 | 按 Provider 配置将 Key 附加到请求。 |
| 会话与作用域 | 进程、项目 `.env`、用户/项目 Settings 或系统 Settings。 |
| 持久化位置 | 向导可回退到 `settings.json.env` 明文保存；文档推荐迁移到 `.env`。 |
| 自动化用法 | CI 直接注入 Provider 对应环境变量。 |
| 安全与管理 | 项目 `.env` 应加入忽略；不要提交含 Key 的 Settings。 |
| 条件与边界 | Key 名和请求格式由所选 Provider 决定。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)、[Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `config.toml` `api_key` · Kimi Platform |
| 入口与配置 | `config.toml` Provider 的 `api_key`、`/login` 的 Kimi Platform 选项。 |
| 支持范围 | 静态 Provider Key 写在配置；临时模型通道可用 `KIMI_MODEL_API_KEY`。 |
| 具体行为 | Provider 读取明确配置的 Key；不会自动读取普通 `OPENAI_API_KEY` 等 Shell 变量。 |
| 会话与作用域 | 用户配置或当前进程临时模型。 |
| 持久化位置 | `config.toml` 中静态 Key 为明文；临时环境变量不落盘。 |
| 自动化用法 | 生成临时 Provider 配置，或使用完整的 `KIMI_MODEL_*` 通道。 |
| 安全与管理 | 保护 `config.toml` 文件权限；避免将其复制到仓库。 |
| 条件与边界 | Provider `[env]` 表可显式把值传给实现，但不是通用 Shell 自动发现。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)、[Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | PAT · 指定厂商 Custom Model Key |
| 入口与配置 | `qodercli login` 的 PAT、`QODER_PERSONAL_ACCESS_TOKEN`、Custom Model Key 输入。 |
| 支持范围 | PAT 认证 Qoder 服务；BYOK Key 认证指定模型厂商。 |
| 具体行为 | PAT 支持 CLI/SDK 自动化；Custom Model Key 只用于相应 Provider。 |
| 会话与作用域 | 本地账号登录、进程环境或 Individual 模型设置。 |
| 持久化位置 | PAT 环境变量不落盘；交互登录与 Custom Model 设置由客户端保存。 |
| 自动化用法 | SDK 与 CI 使用 `QODER_PERSONAL_ACCESS_TOKEN`。 |
| 安全与管理 | 本地登录优先于环境 PAT，排障时要确认实际使用的凭据来源。 |
| 条件与边界 | Custom Model 只适用于 Individual 计划。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)、[Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)、[Qoder CLI model configuration](https://docs.qoder.com/en/cli/model) |

## 官方来源

- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)
- [Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)
- [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)
- [Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)

## 关联能力

- [环境变量注入](./auth-environment.md)
- [本地凭据存储](./auth-storage.md)
- [Provider 类型](./model-provider.md)
