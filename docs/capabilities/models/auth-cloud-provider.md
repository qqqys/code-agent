# 云厂商凭据链

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-cloud-provider)

> 核对日期：2026-08-17

## 定义

使用云平台原生身份、Profile、ADC、工作负载身份或签名协议访问托管模型。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Bedrock · Vertex · Foundry 原生凭据链 | 官方确认 |
| Codex | Bedrock AWS SigV4 · Provider 命令令牌 | 官方确认 |
| Qwen Code | Vertex 与兼容 Provider 的密钥配置 | 条件项 |
| Kimi Code | Vertex AI ADC · `GOOGLE_APPLICATION_CREDENTIALS` | 源码确认 |
| Qoder CLI | 公开 CLI 文档未列通用云凭据链 | 未确认 |

## 比较边界

### 本页包含

- AWS、Google Cloud 与官方云 Provider 凭据链
- Profile、区域与 ADC
- 短期令牌和命令生成认证

### 本页不包含

- 普通 API Key
- 仅设置自定义 base URL
- 外部云平台本身的 IAM 产品功能

## 跨产品事实

1. Claude Code 对 Bedrock、Vertex 和 Foundry 有明确云部署认证路径。
2. Codex 的 Bedrock Provider 使用 AWS SigV4；Kimi Code 的 VertexAI Provider 使用 Google ADC。
3. Qoder CLI 公共模型文档未公开通用云厂商凭据链，不能从其 BYOK 厂商目录外推。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Bedrock · Vertex · Foundry 原生凭据链 |
| 入口与配置 | Bedrock、Vertex AI、Foundry 对应的 Provider 环境变量与云 CLI/SDK 登录。 |
| 支持范围 | 复用 AWS credential chain、Google Application Default Credentials 或 Azure/Foundry 身份。 |
| 具体行为 | 按云平台端点、区域和签名协议调用 Claude 部署。 |
| 会话与作用域 | 本机 Profile、工作负载身份、容器/CI 角色或组织设备配置。 |
| 持久化位置 | 由云平台 SDK、CLI 和 Secret/Identity 系统管理，不统一写入 Claude 凭据库。 |
| 自动化用法 | CI 使用 OIDC、实例角色、工作负载身份或短期凭据。 |
| 安全与管理 | 可用 IAM 最小权限和短期令牌，避免长期 API Key。 |
| 条件与边界 | 各平台模型 ID、区域和功能可用性不同。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)、[Claude Code model configuration](https://code.claude.com/docs/en/model-config) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Bedrock AWS SigV4 · Provider 命令令牌 |
| 入口与配置 | Amazon Bedrock 内置 Provider 的 `profile`、`region`；自定义 Provider 的 command-backed auth。 |
| 支持范围 | Bedrock 请求使用 AWS SigV4；认证命令可返回短期 bearer token。 |
| 具体行为 | 按 Provider 配置获取并刷新云凭据。 |
| 会话与作用域 | AWS Profile/环境、当前进程或配置的认证命令。 |
| 持久化位置 | Codex 保存 Provider 配置，不必保存云 Secret 本身。 |
| 自动化用法 | CI 使用 AWS 角色/Profile，或由命令从外部凭据代理取令牌。 |
| 安全与管理 | 短期签名和命令认证可避免静态 Key 写入配置。 |
| 条件与边界 | 云 Provider 的具体模型与区域必须由目标服务支持。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Vertex 与兼容 Provider 的密钥配置 |
| 入口与配置 | `vertex-ai` Provider 和 Provider 自定义认证字段。 |
| 支持范围 | 当前公开配置以 Provider Key、项目/端点字段为主。 |
| 具体行为 | 通过 Vertex 或兼容 Provider 配置调用云端模型。 |
| 会话与作用域 | Settings、环境变量和项目 `.env`。 |
| 持久化位置 | 配置可写入用户、项目或系统 Settings。 |
| 自动化用法 | CI 注入对应 Provider 的环境字段。 |
| 安全与管理 | Key 应保存在 Secret/环境，而不是提交 Settings。 |
| 条件与边界 | 公开文档未描述像 Claude/Codex 那样完整的通用 AWS credential chain。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)、[Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Vertex AI ADC · `GOOGLE_APPLICATION_CREDENTIALS` |
| 入口与配置 | `vertexai` Provider，`GOOGLE_APPLICATION_CREDENTIALS` 与项目/位置字段。 |
| 支持范围 | 使用 Google Application Default Credentials。 |
| 具体行为 | 按配置的 project、location 和 ADC 身份请求 Vertex AI。 |
| 会话与作用域 | 本机 gcloud ADC、服务账号文件或工作负载环境。 |
| 持久化位置 | 身份由 Google ADC 管理；Kimi 配置保存 Provider 元数据。 |
| 自动化用法 | CI 设置工作负载身份或 `GOOGLE_APPLICATION_CREDENTIALS`。 |
| 安全与管理 | 优先使用工作负载身份；服务账号文件需要限制权限。 |
| 条件与边界 | 仅 VertexAI Provider 使用该凭据链。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)、[Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 公开 CLI 文档未列通用云凭据链 |
| 入口与配置 | 公共 CLI 文档未列通用 AWS/GCP/Azure 凭据入口。 |
| 支持范围 | Custom Model 采用指定厂商 Key 配置。 |
| 具体行为 | 当前可确认的是目录内 BYOK，不是通用云 IAM 适配。 |
| 会话与作用域 | Individual 模型设置。 |
| 持久化位置 | 由 Qoder 模型配置保存。 |
| 自动化用法 | 公共文档未给出云 Profile/ADC 自动化契约。 |
| 安全与管理 | 不要把未公开能力标成已支持的云凭据链。 |
| 条件与边界 | 后续若文档增加云 Provider，应按具体协议重新核对。 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model) |

## 官方来源

- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code current model providers](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/model-providers.md)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)
- [Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)

## 关联能力

- [Provider 类型](./model-provider.md)
- [API Key](./auth-api-key.md)
- [环境变量注入](./auth-environment.md)
