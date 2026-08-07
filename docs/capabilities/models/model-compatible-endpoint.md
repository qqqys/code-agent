# 自定义 API 端点

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=model-compatible-endpoint)

> 核对日期：2026-08-07

## 定义

把模型请求发往自定义基础地址、企业网关或自托管兼容服务，并明确兼容协议边界。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `ANTHROPIC_BASE_URL` · Messages 网关 | 官方确认 |
| Codex | `model_providers` · 仅 Responses 协议 | 条件项 |
| Qwen Code | `baseUrl` · OpenAI/Anthropic/Gemini 协议 | 源码确认 |
| Kimi Code | `base_url` · 多 Provider 协议 | 源码确认 |
| Qoder CLI | 公开文档仅列指定厂商；无任意 URL | 条件项 |

## 比较边界

### 本页包含

- base URL 配置
- 网关协议与自定义请求头
- 本地 OpenAI/Anthropic/Gemini 兼容服务

### 本页不包含

- 透明网络代理
- 未公开的私有端点
- 仅改变模型名称而不改变地址

## 跨产品事实

1. “可配 base URL”不等于兼容所有 OpenAI API：Codex 自定义 Provider 当前只支持 Responses。
2. Qwen Code 和 Kimi Code 按 Provider 协议选择适配器，因此可覆盖多种兼容接口。
3. Qoder CLI 公共文档只公开指定厂商 Custom Model，没有公开任意 base URL 字段。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `ANTHROPIC_BASE_URL` · Messages 网关 |
| 入口与配置 | `ANTHROPIC_BASE_URL`，可配 `ANTHROPIC_CUSTOM_HEADERS`。 |
| 支持范围 | 把 Anthropic Messages 请求路由到企业 LLM gateway；可选 `/v1/models` 发现模型。 |
| 具体行为 | 保留 Claude Code 的 Anthropic 请求语义，由网关转发、认证和审计。 |
| 会话与作用域 | 进程环境或组织统一环境配置。 |
| 持久化位置 | 通常由 Shell、容器、设备管理或 Settings env 提供。 |
| 自动化用法 | CI 注入网关地址、令牌和自定义头。 |
| 安全与管理 | 网关可集中认证、速率限制、日志和合规控制。 |
| 条件与边界 | 网关必须实现 Claude Code 所需的 Anthropic Messages 兼容行为。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code LLM gateway](https://code.claude.com/docs/en/llm-gateway)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `model_providers` · 仅 Responses 协议 |
| 入口与配置 | `model_providers.<id>.base_url` 与 `wire_api = "responses"`。 |
| 支持范围 | 自定义 Provider 可附加 `http_headers`、`env_http_headers` 和 `query_params`。 |
| 具体行为 | Codex 通过 Responses wire API 发出请求。 |
| 会话与作用域 | 配置文件或 profile。 |
| 持久化位置 | 写入 `config.toml`。 |
| 自动化用法 | 为本地/企业端点创建 profile，并用 `env_key` 注入凭据。 |
| 安全与管理 | 敏感头应从环境变量读取，不直接写入配置。 |
| 条件与边界 | 当前唯一支持的自定义 `wire_api` 值是 `responses`；Chat Completions 兼容不足以接入。 |
| 证据状态 | 条件项 |
| 来源 | [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `baseUrl` · OpenAI/Anthropic/Gemini 协议 |
| 入口与配置 | `modelProviders[].baseUrl`、`providerProtocol`。 |
| 支持范围 | 按 OpenAI、Anthropic、Gemini 或 Vertex 协议选择请求适配器。 |
| 具体行为 | 可连接 Azure/OpenRouter/Requesty、本地 vLLM/Ollama/LM Studio 和其他兼容端点。 |
| 会话与作用域 | 用户、项目或系统 Settings。 |
| 持久化位置 | 端点配置写入 Settings；Key 可留在 `.env`。 |
| 自动化用法 | 通过 Provider ID 和环境变量在不同部署间切换。 |
| 安全与管理 | 不要把带 Key 的 URL 或 Key 值提交到仓库。 |
| 条件与边界 | 端点必须满足所选 `providerProtocol` 的必需接口和流式行为。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `base_url` · 多 Provider 协议 |
| 入口与配置 | `[providers.<name>] base_url`。 |
| 支持范围 | 分别支持 Anthropic、OpenAI Chat Completions、OpenAI Responses、Google GenAI 和 VertexAI Provider 类型。 |
| 具体行为 | 根据 Provider 类型构造请求，可指向兼容或自托管实现。 |
| 会话与作用域 | 用户配置或临时 `KIMI_MODEL_BASE_URL`。 |
| 持久化位置 | 长期端点在 `config.toml`；临时通道只影响当前进程。 |
| 自动化用法 | 临时模型通道同时设置 Provider 类型、URL、模型与 Key。 |
| 安全与管理 | base URL 与 Key 分开配置；静态 Key 仍可能落在配置文件。 |
| 条件与边界 | 兼容服务必须实现所选 Provider 类型对应的协议。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)、[Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 公开文档仅列指定厂商；无任意 URL |
| 入口与配置 | `/model` → Custom Model → 指定厂商。 |
| 支持范围 | 公共文档提供受支持厂商清单和相应模型配置界面。 |
| 具体行为 | 按目录接入厂商 API，而不是声明任意协议与 base URL。 |
| 会话与作用域 | Individual 账号模型设置。 |
| 持久化位置 | 设置由 Qoder 模型配置保存。 |
| 自动化用法 | 公共 CLI 文档未给出任意 URL 的无交互配置方式。 |
| 安全与管理 | 用户输入对应厂商 API Key。 |
| 条件与边界 | 不能把“指定厂商 BYOK”推断成“任意 OpenAI-compatible endpoint”。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model) |

## 官方来源

- [Claude Code LLM gateway](https://code.claude.com/docs/en/llm-gateway)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)
- [Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)

## 关联能力

- [Provider 类型](./model-provider.md)
- [环境变量注入](./auth-environment.md)
- [API Key](./auth-api-key.md)
