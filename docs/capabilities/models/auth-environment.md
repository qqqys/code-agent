# 环境变量注入

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-environment)

> 核对日期：2026-08-07

## 定义

通过进程环境、项目环境文件或配置引用向模型 Provider 注入凭据与端点。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `ANTHROPIC_*` · 云厂商环境变量 | 官方确认 |
| Codex | `OPENAI_API_KEY` · Provider `env_key` | 官方确认 |
| Qwen Code | 系统环境 > `.env` > `settings.json.env` | 源码确认 |
| Kimi Code | 仅 `KIMI_MODEL_*` 临时通道；普通 Provider Key 不读 Shell | 条件项 |
| Qoder CLI | `QODER_PERSONAL_ACCESS_TOKEN` | 官方确认 |

## 比较边界

### 本页包含

- 公开环境变量名
- 加载优先级与项目 `.env`
- 自动化场景中的非交互注入

### 本页不包含

- 凭据文件加密实现
- Shell 自身的 Secret 管理
- 所有非认证环境变量

## 跨产品事实

1. Qwen Code 明确给出系统环境、`.env`、`settings.json.env` 的优先级。
2. Kimi Code 不自动读取普通 Provider Key Shell 变量；只有完整的 `KIMI_MODEL_*` 临时模型通道会直接读取进程环境。
3. Codex 自定义 Provider 通过 `env_key` 保存变量名，而不是在配置里保存 Key 值。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `ANTHROPIC_*` · 云厂商环境变量 |
| 入口与配置 | `ANTHROPIC_API_KEY`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_BASE_URL` 及云 Provider 环境变量。 |
| 支持范围 | 启动时读取进程环境；Settings 也可声明 env 值。 |
| 具体行为 | 为模型端点、认证、模型名和云部署提供运行参数。 |
| 会话与作用域 | 当前进程、Shell、容器、CI 或 Settings 作用域。 |
| 持久化位置 | Claude Code 不替用户保存 Shell 环境；Settings 中值会持久化。 |
| 自动化用法 | CI 从 Secret Store 注入环境。 |
| 安全与管理 | 敏感值不要提交到项目 Settings；可用 `apiKeyHelper` 动态取值。 |
| 条件与边界 | Managed settings 可以覆盖或限制下层配置。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code settings](https://code.claude.com/docs/en/settings)、[Claude Code authentication and credential management](https://code.claude.com/docs/en/team) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `OPENAI_API_KEY` · Provider `env_key` |
| 入口与配置 | `OPENAI_API_KEY`、`CODEX_ACCESS_TOKEN`、Provider `env_key`/`env_http_headers`。 |
| 支持范围 | 登录和 Provider 在运行时读取指定环境变量。 |
| 具体行为 | 把 Key、access token 或自定义请求头注入模型请求。 |
| 会话与作用域 | 当前进程与 profile 选择的 Provider。 |
| 持久化位置 | 环境值不由配置文件保存；配置仅保存变量名。 |
| 自动化用法 | CI 注入 Secret 后运行 `codex exec`。 |
| 安全与管理 | 优于在 `config.toml` 写入明文 Key。 |
| 条件与边界 | 实际变量名由 Provider 配置决定。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 系统环境 > `.env` > `settings.json.env` |
| 入口与配置 | 系统环境、项目 `.qwen/.env` 或查找到的 `.env`、`settings.json.env`。 |
| 支持范围 | 凭据优先级为 CLI flags > 系统环境 > `.env` > `settings.json.env`。 |
| 具体行为 | 按 Provider `envKey` 读取 Key，并可从 env 设置 base URL 等字段。 |
| 会话与作用域 | 进程、项目、用户或系统 Settings。 |
| 持久化位置 | `.env` 与 Settings 均为磁盘文件；系统环境由启动环境管理。 |
| 自动化用法 | CI 直接注入对应 Provider 变量。 |
| 安全与管理 | 推荐 `.env` 并确保忽略；Settings 明文 env 是兼容回退。 |
| 条件与边界 | 同名变量由高优先级来源覆盖。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)、[Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 仅 `KIMI_MODEL_*` 临时通道；普通 Provider Key 不读 Shell |
| 入口与配置 | `KIMI_MODEL_NAME`、`KIMI_MODEL_API_KEY`、`KIMI_MODEL_BASE_URL`、`KIMI_MODEL_PROVIDER_TYPE` 等。 |
| 支持范围 | 只有 `KIMI_MODEL_*` 构成一次性临时模型；普通 `OPENAI_API_KEY`、`ANTHROPIC_API_KEY` 不会自动读取。 |
| 具体行为 | 临时通道覆盖一次进程的 Provider、模型、端点、Key 和 effort。 |
| 会话与作用域 | 当前进程。 |
| 持久化位置 | 不落盘；长期 Provider Key 仍需 `config.toml`。 |
| 自动化用法 | CI 可完整注入一组 `KIMI_MODEL_*`。 |
| 安全与管理 | 环境 Secret 可能被子进程继承；控制执行环境与日志。 |
| 条件与边界 | 不能只设置普通 Provider 同名 Key 并期待 Kimi 自动发现。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)、[Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `QODER_PERSONAL_ACCESS_TOKEN` |
| 入口与配置 | `QODER_PERSONAL_ACCESS_TOKEN`。 |
| 支持范围 | SDK/CLI 从环境读取 Qoder PAT。 |
| 具体行为 | 在无交互环境认证 Qoder 服务。 |
| 会话与作用域 | 当前进程及其子进程。 |
| 持久化位置 | 不由 Qoder 写入磁盘。 |
| 自动化用法 | CI 和 Agent SDK 推荐使用。 |
| 安全与管理 | 通过 CI Secret 注入并限制日志；本地登录会覆盖该变量。 |
| 条件与边界 | 这是 Qoder 服务 PAT，不是任意 Custom Model Provider Key 的通用变量。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)、[Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start) |

## 官方来源

- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)
- [Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)
- [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)
- [Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)
- [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)

## 关联能力

- [API Key](./auth-api-key.md)
- [本地凭据存储](./auth-storage.md)
- [自定义 API 端点](./model-compatible-endpoint.md)
