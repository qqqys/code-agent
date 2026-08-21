# Provider 类型

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=model-provider)

> 核对日期：2026-08-21

## 定义

定义 CLI 能直接连接的模型服务类型，包括厂商托管服务、云平台、本地运行时和自定义 Provider。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Anthropic · Bedrock · Vertex · Foundry | 官方确认 |
| Codex | OpenAI · Bedrock · Ollama · LM Studio · 自定义 Responses | 官方确认 |
| Qwen Code | OpenAI · Anthropic · Gemini · Vertex · 自定义 | 源码确认 |
| Kimi Code | Kimi · Anthropic · OpenAI · Gemini · Vertex | 源码确认 |
| Qoder CLI | 托管目录 · 指定厂商 BYOK | 条件项 |

## 比较边界

### 本页包含

- 公开支持的 Provider 类型
- 协议适配器与本地运行时
- Provider 选择和配置入口

### 本页不包含

- 模型质量与价格
- 未在公开资料列出的私有适配
- 仅靠外部网关完成的透明转发

## 跨产品事实

1. Qwen Code 和 Kimi Code 都公开多协议 Provider 抽象；Qoder CLI 的 BYOK 是指定厂商目录。
2. Codex 的自定义 Provider 当前只接受 Responses wire API，但内置 Provider 可包含 Bedrock、Ollama 和 LM Studio。
3. Claude Code 的非 Anthropic Provider 是官方云部署路径，而不是任意协议插件系统。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Anthropic · Bedrock · Vertex · Foundry |
| 入口与配置 | 环境变量与 Settings 选择 Anthropic、Amazon Bedrock、Google Vertex AI、Microsoft Foundry 或 AWS 上的 Claude Platform。 |
| 支持范围 | 同一 Claude Code 客户端针对官方 Claude 部署切换认证和基础端点。 |
| 具体行为 | Provider 决定模型目录、凭据链、区域、请求端点和部分功能可用性。 |
| 会话与作用域 | 进程环境、用户/项目 Settings 或组织 Managed settings。 |
| 持久化位置 | 长期部署选择通常写入环境管理或 Settings。 |
| 自动化用法 | CI 按 Provider 注入云凭据和模型环境变量。 |
| 安全与管理 | 可复用云平台 IAM、短期凭据与组织网络网关。 |
| 条件与边界 | 仅覆盖 Claude 模型的官方部署和兼容 Messages 网关。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code model configuration](https://code.claude.com/docs/en/model-config)、[Claude Code authentication and credential management](https://code.claude.com/docs/en/team)、[Claude Code LLM gateway](https://code.claude.com/docs/en/llm-gateway) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | OpenAI · Bedrock · Ollama · LM Studio · 自定义 Responses |
| 入口与配置 | `model_provider`、`model_providers.<id>`、`--oss`、`--local-provider`。 |
| 支持范围 | 内置 OpenAI、Amazon Bedrock、Ollama、LM Studio；可增加 Responses-compatible Provider。 |
| 具体行为 | Provider 决定 base URL、认证来源、请求头、查询参数和模型目录。 |
| 会话与作用域 | 用户配置、项目配置、profile 或本次 CLI 参数。 |
| 持久化位置 | 自定义 Provider 写入 `config.toml`。 |
| 自动化用法 | 用 profile 为不同环境绑定 Provider、模型和认证变量。 |
| 安全与管理 | API Key 从 `env_key` 或命令认证读取，避免直接写入 Provider 配置。 |
| 条件与边界 | 自定义 wire API 当前仅支持 `responses`。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)、[Codex models](https://learn.chatgpt.com/docs/models) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | OpenAI · Anthropic · Gemini · Vertex · 自定义 |
| 入口与配置 | `/auth`、`modelProviders`、`providerProtocol`。 |
| 支持范围 | 内置 `openai`、`anthropic`、`gemini`、`vertex-ai` 协议；可定义自有 Provider ID。 |
| 具体行为 | Provider 绑定模型、baseUrl、Key 环境变量和协议能力。 |
| 会话与作用域 | 用户、项目、系统 Settings 与进程环境。 |
| 持久化位置 | Provider 配置写入 Settings；Key 可单独放 `.env`。 |
| 自动化用法 | Headless 通过 Settings 与环境变量选择 Provider。 |
| 安全与管理 | 推荐把 Key 放 `.env` 或系统环境，而不是提交项目 Settings。 |
| 条件与边界 | 旧 `qwen-oauth` 免费层已停止并从可选登录流程移除。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)、[Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Kimi · Anthropic · OpenAI · Gemini · Vertex |
| 入口与配置 | `/provider`、`kimi provider`、`config.toml` 的 `[providers]`。 |
| 支持范围 | Provider 类型包括 `kimi`、`anthropic`、`openai`、`openai_responses`、`google-genai`、`vertexai`。 |
| 具体行为 | Provider 定义 base URL、API Key、额外环境字段和关联模型。 |
| 会话与作用域 | 用户配置或 `KIMI_MODEL_*` 临时模型通道。 |
| 持久化位置 | 长期 Provider 保存在 `~/.kimi-code/config.toml`。 |
| 自动化用法 | 配置文件预置 Provider；临时通道可完全覆盖一次运行。 |
| 安全与管理 | OAuth 凭据与静态 API Key 的存储路径不同。 |
| 条件与边界 | 各 Provider 类型支持的请求字段和 thinking 能力不同。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 托管目录 · 指定厂商 BYOK |
| 入口与配置 | `/model` 的 Custom Model 流程。 |
| 支持范围 | 托管模型目录外，支持 ModelStudio、DeepSeek、Z.ai、Kimi、MiniMax、Xiaomi MIMO 等指定厂商 BYOK。 |
| 具体行为 | 用户从公开目录选择厂商、模型并输入对应 Key。 |
| 会话与作用域 | Individual 账号下的模型设置。 |
| 持久化位置 | 模型选择与选项保存在 `~/.qoder/settings.json`。 |
| 自动化用法 | 公开文档未给出任意 Provider 定义文件或协议插件入口。 |
| 安全与管理 | Custom Model 使用用户自己的厂商 Key。 |
| 条件与边界 | Custom Model 不适用于 Teams；厂商目录会随产品更新。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model) |

## 官方来源

- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Claude Code LLM gateway](https://code.claude.com/docs/en/llm-gateway)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Codex models](https://learn.chatgpt.com/docs/models)
- [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)

## 关联能力

- [自定义 API 端点](./model-compatible-endpoint.md)
- [API Key](./auth-api-key.md)
- [模型选择与切换](./model-switch.md)
