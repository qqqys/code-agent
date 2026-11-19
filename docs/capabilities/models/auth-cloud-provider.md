# 云厂商凭据链

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-cloud-provider)

> 核对日期：2026-11-19

## 定义

使用云平台原生身份、Profile、ADC、工作负载身份或签名协议访问托管模型。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Bedrock · Vertex · Foundry 原生凭据链 | 官方确认 |
| Codex | Bedrock AWS SigV4 · Provider 命令令牌 | 官方确认 |
| Qwen Code | Vertex 与兼容 Provider 的密钥配置 | 条件项 |
| Kimi Code | Vertex AI ADC · `GOOGLE_APPLICATION_CREDENTIALS` · 条件：`bedrock` 走 AWS CLI 凭证链换短期 bearer token，合入 main 尚未发布 | 条件项 |
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
2. Codex 的 Bedrock Provider 使用 AWS SigV4；Kimi Code 的 `vertexai` Provider 使用 Google ADC，2026-11-13 合入 main 的 `bedrock` Provider 改用 AWS CLI 凭证链，但尚未随任何 Release 发布。
3. 同在 AWS 上两家的实现路径不同：Codex 的 `amazon-bedrock` 只接受嵌套 `[model_providers.amazon-bedrock.aws]` 里的 `profile` 与 `region` 并对请求做 SigV4 签名；Kimi 的 `bedrock` 把 `AWS_REGION`/`AWS_PROFILE` 写在 `[providers.<name>.env]` 子表，由 AWS SDK 解析凭据后生成短期 bearer token，秘密凭证写进子表不生效。
4. Qoder CLI 公共模型文档未公开通用云厂商凭据链，不能从其 BYOK 厂商目录外推。

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
| 矩阵结论 | Vertex AI ADC · `GOOGLE_APPLICATION_CREDENTIALS` · 条件：`bedrock` 走 AWS CLI 凭证链换短期 bearer token，合入 main 尚未发布 |
| 入口与配置 | `vertexai` Provider 的 `[providers.vertexai.env]` 项目与位置字段加 `GOOGLE_APPLICATION_CREDENTIALS`；`bedrock` Provider 的 `[providers.bedrock.env]` 里的 `AWS_REGION`（或 `AWS_DEFAULT_REGION`）与可选 `AWS_PROFILE`。 |
| 支持范围 | `vertexai` 使用 Google Application Default Credentials，由 Google SDK 自行读取、CLI 不参与；`bedrock` 使用标准 AWS CLI 凭证链（SSO、实例角色、环境变量、共享配置），由 `@aws/bedrock-token-generator` 的 `getTokenProvider` 生成短期 bearer token，CLI 只把 region 与 profile 传给它，凭据解析全在 AWS SDK 内部完成，因此不对每个请求做 SigV4 签名。 |
| 具体行为 | `vertexai` 按配置的 project、location 和 ADC 身份请求 Vertex AI；`bedrock` 按解析出的区域拼 `https://bedrock-runtime.<region>.amazonaws.com`，Anthropic Messages 模型追加 `/anthropic`、OpenAI 兼容模型追加 `/openai/v1`，令牌放进 `Authorization: Bearer` 而不发 `x-api-key`。 |
| 会话与作用域 | 本机 gcloud ADC、服务账号文件或工作负载环境；`bedrock` 侧为 shell 里的 AWS 环境凭证、`~/.aws/credentials`、SSO 缓存或实例角色，区域与 profile 由 `[providers.<name>.env]` 子表优先、shell 兜底。 |
| 持久化位置 | 身份由 Google ADC 与 AWS SDK 各自管理，Kimi 配置只保存 Provider 元数据（区域、profile 与可选的长期密钥）；AWS 秘密凭证从不写进 `config.toml`，写进 `[providers.<name>.env]` 也不生效。 |
| 自动化用法 | CI 设置工作负载身份或 `GOOGLE_APPLICATION_CREDENTIALS`；`bedrock` 侧只需注入 AWS 环境凭证与区域——既无 API Key 也无 OAuth 令牌时 `supportsAmbientCredential` 为真，`GET /api/v1/providers` 直接报 `connected`，认证摘要也不再因缺少凭据报错。 |
| 安全与管理 | 优先使用工作负载身份，服务账号文件需要限制权限；`bedrock` 的 bearer token 默认 TTL 43200 秒并留 15 分钟提前量，并发请求合并成一次取令牌，HTTP 401 触发强制换新令牌而 500 不触发，取令牌失败（例如 SSO 过期）原样冒泡且下一次调用会重试；官方转述 AWS 的建议是不要用长期 API 密钥，但已配置的 `api_key`、`api_key_env` 或 `AWS_BEARER_TOKEN_BEDROCK` 始终优先于环境凭证链。 |
| 条件与边界 | `vertexai` 的项目 ID 与区域必须写在 `[providers.vertexai.env]` 子表，直接 `export GOOGLE_CLOUD_PROJECT` 不被读取；`bedrock` 的区域必须能从 `AWS_REGION` 或 `AWS_DEFAULT_REGION` 解析，不支持从 `~/.aws/config` 推断默认区域，解析不出即抛配置错误；`bedrock` 由 PR #4895（合并提交 `88e3c20739a20a9a4003e366db7ecad9b88e10bd`，2026-11-13）合入 main，changeset 标 minor 且到 main HEAD `f082f04a093a3e71a2263c5461d52507dc31f83a` 仍未被消费，2.6.2 的发布说明没有 Bedrock 条目，截至 2026-11-15 尚无包含它的 Release。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current model providers](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/providers.md)、[Kimi Code current environment variables](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/env-vars.md)、[Kimi Code 中文「平台与模型」文档 `docs/zh/configuration/providers.md`（PR #4895 合并提交 `88e3c20739a20a9a4003e366db7ecad9b88e10bd`，2026-11-13T08:20:37Z，13,938 字节；本仓库此前固定的提交 `18c6d64272952503baccf706bff455bb6a2c488e` 版本为 9,874 字节）：供应商类型表由六行增至七行，新增一行逐字为 “| `bedrock` | Anthropic Messages / OpenAI 兼容（按模型区分） | Amazon Bedrock |”；新增 `## bedrock` 一节，首段逐字为 “用于接入 Amazon Bedrock。一个 `bedrock` 供应商可以承载 Anthropic Messages API 或 OpenAI 兼容 API 的模型——CLI 会按 Bedrock 模型 ID 逐个推断线路协议，因此 Claude、GPT 和 Kimi 模型可以共用同一个供应商条目。”；「认证」小节逐字为 “`type = "bedrock"` 的供应商可以使用标准 AWS CLI 凭证链，基于你的 AWS 环境凭证（来自 SSO、实例角色、环境变量、共享配置等）生成短期持有者令牌（bearer token）。只需指定 AWS 区域，可选地再指定一个命名 profile”，示例为 `[providers.bedrock]` 下 `type = "bedrock"` 加 `[providers.bedrock.env]` 下 `AWS_REGION = "us-east-1"` 与可选注释行 `AWS_PROFILE = "my-profile"`；长期密钥一节逐字为 “另外，也可以改用 Amazon Bedrock API 密钥，通过 `api_key`、`api_key_env` 或 `[providers.bedrock.env]` 子表中的 `AWS_BEARER_TOKEN_BEDROCK` 键来配置。不过出于安全考虑，AWS 一般不建议使用长期 API 密钥。已配置的密钥始终优先于环境凭证链。”；区域一节逐字为 “区域必须能从 `AWS_REGION` 或 `AWS_DEFAULT_REGION`（写在子表里或在 shell 中导出）解析出来；目前不支持从 `~/.aws/config` 推断默认区域。”；「端点 URL」一节逐字为 “base URL 默认取区域化的 `bedrock-runtime.<region>.amazonaws.com` 端点——只有当你需要自定义端点（如 `bedrock-mantle`、代理或 FIPS/双栈主机名）时才设置 `base_url`（或 `AWS_BEDROCK_BASE_URL` 环境键）。自定义 `base_url` 是完整 URL：必须包含模型所用协议的线路路径（`/anthropic` 或 `/openai/v1`），CLI 会原样使用它，不会追加协议后缀。”；「模型与线路协议」一节的推断规则逐字为 “`anthropic.*` → Anthropic Messages API”、“`openai.gpt-oss*` → OpenAI Chat Completions API（这些开放权重模型在 `bedrock-runtime` 上仅提供此 API）”、“其他 `openai.*` → OpenAI Responses API（GPT-6 / GPT-5.6 系列仅提供此 API，也是 OpenAI 推荐的方向）”、“`moonshotai.*` / `moonshot.*` → OpenAI Chat Completions API（Kimi 模型卡片推荐）”，并写 “其他前缀默认使用 OpenAI Chat Completions API。要为同时提供多种 API 的模型另行选择时，请在模型别名上显式设置 `protocol`”，四个示例别名分别为 `sonnet`（`global.anthropic.claude-sonnet-4-6`）、`gpt-6`（`global.openai.gpt-6-astra`，注释「推断为 OpenAI Responses API」）、`gpt-oss`（`openai.gpt-oss-120b-1:0`，注释「推断为 OpenAI Chat Completions API」）与 `kimi-k3-responses`（`global.moonshotai.kimi-k3` 加 `protocol = "openai_responses"`，注释「显式覆盖：Kimi K3 同时提供 Responses API」）；末尾提示逐字为 “当前大多数 Bedrock 模型要求使用推理 profile ID（即 `global.` / `us.` 等前缀），而不是基础模型 ID”；同页 `/provider` 管理器的 Known third-party provider 路径仍逐字写 “Amazon Bedrock / Cohere 等专有协议和无法识别的显式协议会被拒绝导入”](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/docs/zh/configuration/providers.md)、[Kimi Code 中文环境变量文档 `docs/zh/configuration/env-vars.md`（同上提交，23,923 字节）：页首「API 密钥不在这里配置」warning 的例外句改为逐字 “例外包括：`KIMI_MODEL_*` 系列、供应商的 `api_key_env` 字段，以及少数由厂商 SDK 直接从 shell 读取的凭证（`GOOGLE_APPLICATION_CREDENTIALS`，以及 Amazon Bedrock 的 AWS 凭证链）。”；「供应商凭证键」表新增五行——`AWS_BEARER_TOKEN_BEDROCK`（适用 Amazon Bedrock，默认「无」）、`AWS_DEFAULT_REGION`（默认「shell 中的值（如有）」）、`AWS_REGION`（默认「已配置的 `AWS_DEFAULT_REGION` 或 shell 中的值」）、`AWS_BEDROCK_BASE_URL`（默认「按区域推导为 `bedrock-runtime.<region>.amazonaws.com`」）与 `AWS_PROFILE`（默认「回退到 shell 中的值」）；表后 warning 逐字为 “有两类凭证机制绕过配置表，直接从系统环境读取：`GOOGLE_APPLICATION_CREDENTIALS`（服务账号 JSON 路径）由 Google SDK 通过 ADC 流程读取，CLI 不参与。对于 Amazon Bedrock，AWS 秘密凭证（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`、SSO 或 `~/.aws/credentials`）由 AWS SDK 的标准凭证链从 shell 读取。把它们写进 `[providers.<name>.env]` 不受支持、也不生效——CLI 只把区域和 profile 传给令牌生成器，由令牌生成器自行解析凭证。”，并以 “其他所有键名都必须写在 `[providers.<name>.env]` 子表里。” 收尾](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/docs/zh/configuration/env-vars.md)、[Kimi Code PR #4895 合并提交 `88e3c20739a20a9a4003e366db7ecad9b88e10bd`（2026-11-13T08:20:37Z，标题 “feat(core): add Amazon Bedrock provider with AWS credential chain auth (#4895)”，改动 36 个文件，含四份英文与四份中文文档、changeset、`packages/core` 新增的 `bedrock/` 目录四个文件、`packages/agent-core-v2` 的 `authService.ts`/`catalog-service.ts`/`catalog.ts`/`model-auth.ts`/`model.types.ts`/`provider-definition.ts`、`packages/kap-server` 的 `rest-modelCatalog.ts` 与 `modelCatalog.ts`、`packages/migration-legacy/src/steps/config.ts`、`packages/node-sdk/src/config/schema.ts`、`flake.nix`、`pnpm-lock.yaml` 与 `apps/kimi-code/scripts/native/check-bundle.mjs`；提交信息正文列出四条子提交 “feat(core): add Bedrock provider with isolated Anthropic auth”、“fix(core): preserve model input cap behavior”、“docs: refine Bedrock changeset” 与 “fix(build): update pnpm deps hash”）](https://github.com/MoonshotAI/kimi-code/commit/88e3c20739a20a9a4003e366db7ecad9b88e10bd)、[Kimi Code changeset `.changeset/bedrock-provider.md`（main HEAD `f082f04a093a3e71a2263c5461d52507dc31f83a`，2026-11-13T17:32:03Z，136 字节，全文逐字为 frontmatter `"@moonshot-ai/kimi-code": minor` 加正文 “Add support for Amazon Bedrock providers, configured with `type = "bedrock"` and `AWS_REGION`.”）：该文件在 main HEAD 仍然存在，说明这次 minor 变更尚未被任何 Release 消费；同目录另有 `allow-resume-occupied-sessions.md`、`background-task-tail-utf8.md`、`compact-own-line-calls.md`、`feat-prompt-prediction.md`、`fix-subagent-zero-timeout.md`、`fix-tui-transcript-history.md` 与 `follow-up-behavior.md` 七个待发布 changeset](https://github.com/MoonshotAI/kimi-code/blob/f082f04a093a3e71a2263c5461d52507dc31f83a/.changeset/bedrock-provider.md)、[Kimi Code Release `@moonshot-ai/kimi-code@2.6.2`（2026-11-13T17:20:51Z，核对日期最新 stable）：正文只有 Patch Changes 六条（#4875 自定义 registry 的 `search_url` 与 `feedback_url`、#4876 `/feedback` 去掉纯文本选项、#4885 长会话重开延迟、#4905 拒绝失败或未完成的知识库媒体上传、#4922 Swarm 面板缺失的实时 subagent 更新、#4927 web 交互与已知问题修复），没有任何 Bedrock 或 AWS 条目；GitHub compare 显示 2.6.2 标签与提交 `88e3c20739a20a9a4003e366db7ecad9b88e10bd` 的关系是 `diverged`（标签领先 27 个提交、落后 23 个），即 2.6.2 从发布分支切出、不包含该提交，而 main HEAD `f082f04a093a3e71a2263c5461d52507dc31f83a` 与该提交的关系是 `ahead`（领先 2 个、落后 0 个），即该提交确已在 main 上](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.6.2)、[Kimi Code `packages/core/src/llm/builtin/provider/bedrock/credentials.ts`（同上提交，2,413 字节）：从 `@aws/bedrock-token-generator` 导入 `getTokenProvider`，`createBedrockTokenProvider` 只把 `region`、`profile` 与 `expiresInSeconds` 传给它，常量逐字为 `const DEFAULT_TTL_SECONDS = 43_200;` 与 `const EXPIRY_MARGIN_MS = 15 * 60 * 1000;`，缓存的过期时刻按 `now() + ttlMs - EXPIRY_MARGIN_MS` 计算；并发 `resolve()` 通过 `pending` 变量合并成一次取令牌；返回的凭据提供器把令牌包成 `{ apiKey: token }`，`canRecover` 逐字为 `(error) => errorStatusCode(error) === 401`，`invalidate()` 清空缓存并用 `refreshed` 预取一个新令牌，下一次 `resolve()` 无条件采用它](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/packages/core/src/llm/builtin/provider/bedrock/credentials.ts)、[Kimi Code `packages/agent-core-v2/src/llm-adapter/model/model-auth.ts`（同上提交，10,125 字节）：凭据解析在 `endpointApiKey !== undefined` 时直接返回 `{ apiKey: endpointApiKey }`，其次才是 `provider.oauth`，最后当 `args.provider?.type === 'bedrock'` 时返回 `{ aws: { region, profile } }`，其中 `region` 逐字为 `region ?? process.env['AWS_REGION'] ?? process.env['AWS_DEFAULT_REGION']`（`region` 本身取子表的 `AWS_REGION` 再退 `AWS_DEFAULT_REGION`）、`profile` 逐字为 `profile ?? process.env['AWS_PROFILE']`，即子表优先、shell 兜底，这与文档「已配置的密钥始终优先于环境凭证链」一致；`resolveEndpointBaseUrl` 的优先级为模型级 `base_url` → 供应商级 `base_url` → 端点声明的 `baseUrlEnv`，最后才在 `provider.type === 'bedrock'` 时按 `{ ...process.env, ...provider.env }` 推导，协议取 `bedrockWireProtocolOf(model.protocol) ?? inferBedrockProtocol(wireName) ?? 'openai'`，区域解析不出时抛 `CONFIG_INVALID_ERROR_CODE`，错误文案逐字为 `Provider "<id>" could not resolve an AWS region to build the endpoint URL. Set AWS_REGION (or AWS_DEFAULT_REGION) in the provider's [providers.<id>.env] sub-table, or export it in the environment.`；`withAnthropicProfile` 在 `providerType === 'bedrock'` 时先剥掉跨区域前缀再匹配 Claude 模型档案，因此 `global.anthropic.claude-sonnet-4-6` 能拿到 thinking 与 effort 特征](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/packages/agent-core-v2/src/llm-adapter/model/model-auth.ts)、[Kimi Code `packages/agent-core-v2/src/llm-adapter/model/catalog-service.ts`（同上提交，18,885 字节）、`catalog.ts`（5,952 字节）、`model.types.ts`（528 字节）与 `packages/agent-core-v2/src/app/auth/authService.ts`（34,065 字节）：`ResolvedModelAuthMaterial` 新增 `readonly aws?: AwsAuthMaterial;`，`AwsAuthMaterial` 只有 `region?` 与 `profile?` 两个字段；`ModelCatalog` 在 `auth.aws !== undefined` 时用 `createBedrockTokenProvider({ region: auth.aws.region, profile: auth.aws.profile })` 作为凭据提供器；`ProviderCredentialState` 新增 `readonly supportsAmbientCredential: boolean`，取值逐字为 `provider.type === 'bedrock' && !hasApiKey && !hasOAuthToken`，`toProtocolProvider` 的 `status` 判定因此改为 `credential.hasApiKey || credential.hasOAuthToken || credential.supportsAmbientCredential ? 'connected' : 'unconfigured'`，即只配了区域的 `bedrock` 供应商在 `GET /api/v1/providers` 里直接报 `connected`；`AuthSummaryService` 新增 `if (auth.aws !== undefined) return;`，使认证摘要不再因为缺少 API Key 或 `api_key_env` 而报错](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/packages/agent-core-v2/src/llm-adapter/model/catalog-service.ts)、[Kimi Code `packages/core/test/llm/bedrock.test.ts`（同上提交，4,925 字节，单个用例名逐字为 “keeps token lifecycle, routing, and Anthropic authentication provider-local”）：断言 `inferBedrockProtocol` 对 `global.anthropic.claude-sonnet-4-6`、`openai.gpt-oss-120b-1:0`、`global.openai.gpt-6-astra`、`global.moonshotai.kimi-k3`、`meta.llama-4` 依次返回 `anthropic`、`openai`、`openai_responses`、`openai`、`undefined`；`stripBedrockInferenceProfilePrefix('apac.moonshotai.kimi-k3')` 得 `moonshotai.kimi-k3`；`resolveBedrockBaseUrl('anthropic', { AWS_REGION: 'us-west-2' })` 得 `https://bedrock-runtime.us-west-2.amazonaws.com/anthropic`，`resolveBedrockBaseUrl('openai', { AWS_DEFAULT_REGION: 'us-east-1' })` 得 `https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1`；`bedrockModelCapability('global.anthropic.claude-sonnet-4-6')` 与 `getAnthropicModelCapability('claude-sonnet-4-6')` 相等；令牌生命周期部分断言两个并发 `resolve()` 只触发一次取令牌、时钟前进 12 小时后重新取令牌、`canRecover({ status: 401 })` 为真而 `{ status: 500 }` 为假、`invalidate()` 后再取一次；另一段断言取令牌抛出的错误（示例文案 `run aws sso login`）原样冒泡、下一次 `resolve()` 会重试；传输层断言 Bedrock 客户端发出的请求头 `authorization` 为 `Bearer bedrock-api-key-transport` 且 `x-api-key` 为 `null`，而原生 `anthropic` 协议客户端发出 `x-api-key: upstream-key` 与自定义 `authorization: Bearer gateway-token`](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/packages/core/test/llm/bedrock.test.ts) |

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
- [Kimi Code 中文「平台与模型」文档 `docs/zh/configuration/providers.md`（PR #4895 合并提交 `88e3c20739a20a9a4003e366db7ecad9b88e10bd`，2026-11-13T08:20:37Z，13,938 字节；本仓库此前固定的提交 `18c6d64272952503baccf706bff455bb6a2c488e` 版本为 9,874 字节）：供应商类型表由六行增至七行，新增一行逐字为 “| `bedrock` | Anthropic Messages / OpenAI 兼容（按模型区分） | Amazon Bedrock |”；新增 `## bedrock` 一节，首段逐字为 “用于接入 Amazon Bedrock。一个 `bedrock` 供应商可以承载 Anthropic Messages API 或 OpenAI 兼容 API 的模型——CLI 会按 Bedrock 模型 ID 逐个推断线路协议，因此 Claude、GPT 和 Kimi 模型可以共用同一个供应商条目。”；「认证」小节逐字为 “`type = "bedrock"` 的供应商可以使用标准 AWS CLI 凭证链，基于你的 AWS 环境凭证（来自 SSO、实例角色、环境变量、共享配置等）生成短期持有者令牌（bearer token）。只需指定 AWS 区域，可选地再指定一个命名 profile”，示例为 `[providers.bedrock]` 下 `type = "bedrock"` 加 `[providers.bedrock.env]` 下 `AWS_REGION = "us-east-1"` 与可选注释行 `AWS_PROFILE = "my-profile"`；长期密钥一节逐字为 “另外，也可以改用 Amazon Bedrock API 密钥，通过 `api_key`、`api_key_env` 或 `[providers.bedrock.env]` 子表中的 `AWS_BEARER_TOKEN_BEDROCK` 键来配置。不过出于安全考虑，AWS 一般不建议使用长期 API 密钥。已配置的密钥始终优先于环境凭证链。”；区域一节逐字为 “区域必须能从 `AWS_REGION` 或 `AWS_DEFAULT_REGION`（写在子表里或在 shell 中导出）解析出来；目前不支持从 `~/.aws/config` 推断默认区域。”；「端点 URL」一节逐字为 “base URL 默认取区域化的 `bedrock-runtime.<region>.amazonaws.com` 端点——只有当你需要自定义端点（如 `bedrock-mantle`、代理或 FIPS/双栈主机名）时才设置 `base_url`（或 `AWS_BEDROCK_BASE_URL` 环境键）。自定义 `base_url` 是完整 URL：必须包含模型所用协议的线路路径（`/anthropic` 或 `/openai/v1`），CLI 会原样使用它，不会追加协议后缀。”；「模型与线路协议」一节的推断规则逐字为 “`anthropic.*` → Anthropic Messages API”、“`openai.gpt-oss*` → OpenAI Chat Completions API（这些开放权重模型在 `bedrock-runtime` 上仅提供此 API）”、“其他 `openai.*` → OpenAI Responses API（GPT-6 / GPT-5.6 系列仅提供此 API，也是 OpenAI 推荐的方向）”、“`moonshotai.*` / `moonshot.*` → OpenAI Chat Completions API（Kimi 模型卡片推荐）”，并写 “其他前缀默认使用 OpenAI Chat Completions API。要为同时提供多种 API 的模型另行选择时，请在模型别名上显式设置 `protocol`”，四个示例别名分别为 `sonnet`（`global.anthropic.claude-sonnet-4-6`）、`gpt-6`（`global.openai.gpt-6-astra`，注释「推断为 OpenAI Responses API」）、`gpt-oss`（`openai.gpt-oss-120b-1:0`，注释「推断为 OpenAI Chat Completions API」）与 `kimi-k3-responses`（`global.moonshotai.kimi-k3` 加 `protocol = "openai_responses"`，注释「显式覆盖：Kimi K3 同时提供 Responses API」）；末尾提示逐字为 “当前大多数 Bedrock 模型要求使用推理 profile ID（即 `global.` / `us.` 等前缀），而不是基础模型 ID”；同页 `/provider` 管理器的 Known third-party provider 路径仍逐字写 “Amazon Bedrock / Cohere 等专有协议和无法识别的显式协议会被拒绝导入”](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/docs/zh/configuration/providers.md)
- [Kimi Code 中文环境变量文档 `docs/zh/configuration/env-vars.md`（同上提交，23,923 字节）：页首「API 密钥不在这里配置」warning 的例外句改为逐字 “例外包括：`KIMI_MODEL_*` 系列、供应商的 `api_key_env` 字段，以及少数由厂商 SDK 直接从 shell 读取的凭证（`GOOGLE_APPLICATION_CREDENTIALS`，以及 Amazon Bedrock 的 AWS 凭证链）。”；「供应商凭证键」表新增五行——`AWS_BEARER_TOKEN_BEDROCK`（适用 Amazon Bedrock，默认「无」）、`AWS_DEFAULT_REGION`（默认「shell 中的值（如有）」）、`AWS_REGION`（默认「已配置的 `AWS_DEFAULT_REGION` 或 shell 中的值」）、`AWS_BEDROCK_BASE_URL`（默认「按区域推导为 `bedrock-runtime.<region>.amazonaws.com`」）与 `AWS_PROFILE`（默认「回退到 shell 中的值」）；表后 warning 逐字为 “有两类凭证机制绕过配置表，直接从系统环境读取：`GOOGLE_APPLICATION_CREDENTIALS`（服务账号 JSON 路径）由 Google SDK 通过 ADC 流程读取，CLI 不参与。对于 Amazon Bedrock，AWS 秘密凭证（`AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN`、SSO 或 `~/.aws/credentials`）由 AWS SDK 的标准凭证链从 shell 读取。把它们写进 `[providers.<name>.env]` 不受支持、也不生效——CLI 只把区域和 profile 传给令牌生成器，由令牌生成器自行解析凭证。”，并以 “其他所有键名都必须写在 `[providers.<name>.env]` 子表里。” 收尾](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/docs/zh/configuration/env-vars.md)
- [Kimi Code PR #4895 合并提交 `88e3c20739a20a9a4003e366db7ecad9b88e10bd`（2026-11-13T08:20:37Z，标题 “feat(core): add Amazon Bedrock provider with AWS credential chain auth (#4895)”，改动 36 个文件，含四份英文与四份中文文档、changeset、`packages/core` 新增的 `bedrock/` 目录四个文件、`packages/agent-core-v2` 的 `authService.ts`/`catalog-service.ts`/`catalog.ts`/`model-auth.ts`/`model.types.ts`/`provider-definition.ts`、`packages/kap-server` 的 `rest-modelCatalog.ts` 与 `modelCatalog.ts`、`packages/migration-legacy/src/steps/config.ts`、`packages/node-sdk/src/config/schema.ts`、`flake.nix`、`pnpm-lock.yaml` 与 `apps/kimi-code/scripts/native/check-bundle.mjs`；提交信息正文列出四条子提交 “feat(core): add Bedrock provider with isolated Anthropic auth”、“fix(core): preserve model input cap behavior”、“docs: refine Bedrock changeset” 与 “fix(build): update pnpm deps hash”）](https://github.com/MoonshotAI/kimi-code/commit/88e3c20739a20a9a4003e366db7ecad9b88e10bd)
- [Kimi Code changeset `.changeset/bedrock-provider.md`（main HEAD `f082f04a093a3e71a2263c5461d52507dc31f83a`，2026-11-13T17:32:03Z，136 字节，全文逐字为 frontmatter `"@moonshot-ai/kimi-code": minor` 加正文 “Add support for Amazon Bedrock providers, configured with `type = "bedrock"` and `AWS_REGION`.”）：该文件在 main HEAD 仍然存在，说明这次 minor 变更尚未被任何 Release 消费；同目录另有 `allow-resume-occupied-sessions.md`、`background-task-tail-utf8.md`、`compact-own-line-calls.md`、`feat-prompt-prediction.md`、`fix-subagent-zero-timeout.md`、`fix-tui-transcript-history.md` 与 `follow-up-behavior.md` 七个待发布 changeset](https://github.com/MoonshotAI/kimi-code/blob/f082f04a093a3e71a2263c5461d52507dc31f83a/.changeset/bedrock-provider.md)
- [Kimi Code Release `@moonshot-ai/kimi-code@2.6.2`（2026-11-13T17:20:51Z，核对日期最新 stable）：正文只有 Patch Changes 六条（#4875 自定义 registry 的 `search_url` 与 `feedback_url`、#4876 `/feedback` 去掉纯文本选项、#4885 长会话重开延迟、#4905 拒绝失败或未完成的知识库媒体上传、#4922 Swarm 面板缺失的实时 subagent 更新、#4927 web 交互与已知问题修复），没有任何 Bedrock 或 AWS 条目；GitHub compare 显示 2.6.2 标签与提交 `88e3c20739a20a9a4003e366db7ecad9b88e10bd` 的关系是 `diverged`（标签领先 27 个提交、落后 23 个），即 2.6.2 从发布分支切出、不包含该提交，而 main HEAD `f082f04a093a3e71a2263c5461d52507dc31f83a` 与该提交的关系是 `ahead`（领先 2 个、落后 0 个），即该提交确已在 main 上](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.6.2)
- [Kimi Code `packages/core/src/llm/builtin/provider/bedrock/credentials.ts`（同上提交，2,413 字节）：从 `@aws/bedrock-token-generator` 导入 `getTokenProvider`，`createBedrockTokenProvider` 只把 `region`、`profile` 与 `expiresInSeconds` 传给它，常量逐字为 `const DEFAULT_TTL_SECONDS = 43_200;` 与 `const EXPIRY_MARGIN_MS = 15 * 60 * 1000;`，缓存的过期时刻按 `now() + ttlMs - EXPIRY_MARGIN_MS` 计算；并发 `resolve()` 通过 `pending` 变量合并成一次取令牌；返回的凭据提供器把令牌包成 `{ apiKey: token }`，`canRecover` 逐字为 `(error) => errorStatusCode(error) === 401`，`invalidate()` 清空缓存并用 `refreshed` 预取一个新令牌，下一次 `resolve()` 无条件采用它](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/packages/core/src/llm/builtin/provider/bedrock/credentials.ts)
- [Kimi Code `packages/agent-core-v2/src/llm-adapter/model/model-auth.ts`（同上提交，10,125 字节）：凭据解析在 `endpointApiKey !== undefined` 时直接返回 `{ apiKey: endpointApiKey }`，其次才是 `provider.oauth`，最后当 `args.provider?.type === 'bedrock'` 时返回 `{ aws: { region, profile } }`，其中 `region` 逐字为 `region ?? process.env['AWS_REGION'] ?? process.env['AWS_DEFAULT_REGION']`（`region` 本身取子表的 `AWS_REGION` 再退 `AWS_DEFAULT_REGION`）、`profile` 逐字为 `profile ?? process.env['AWS_PROFILE']`，即子表优先、shell 兜底，这与文档「已配置的密钥始终优先于环境凭证链」一致；`resolveEndpointBaseUrl` 的优先级为模型级 `base_url` → 供应商级 `base_url` → 端点声明的 `baseUrlEnv`，最后才在 `provider.type === 'bedrock'` 时按 `{ ...process.env, ...provider.env }` 推导，协议取 `bedrockWireProtocolOf(model.protocol) ?? inferBedrockProtocol(wireName) ?? 'openai'`，区域解析不出时抛 `CONFIG_INVALID_ERROR_CODE`，错误文案逐字为 `Provider "<id>" could not resolve an AWS region to build the endpoint URL. Set AWS_REGION (or AWS_DEFAULT_REGION) in the provider's [providers.<id>.env] sub-table, or export it in the environment.`；`withAnthropicProfile` 在 `providerType === 'bedrock'` 时先剥掉跨区域前缀再匹配 Claude 模型档案，因此 `global.anthropic.claude-sonnet-4-6` 能拿到 thinking 与 effort 特征](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/packages/agent-core-v2/src/llm-adapter/model/model-auth.ts)
- [Kimi Code `packages/agent-core-v2/src/llm-adapter/model/catalog-service.ts`（同上提交，18,885 字节）、`catalog.ts`（5,952 字节）、`model.types.ts`（528 字节）与 `packages/agent-core-v2/src/app/auth/authService.ts`（34,065 字节）：`ResolvedModelAuthMaterial` 新增 `readonly aws?: AwsAuthMaterial;`，`AwsAuthMaterial` 只有 `region?` 与 `profile?` 两个字段；`ModelCatalog` 在 `auth.aws !== undefined` 时用 `createBedrockTokenProvider({ region: auth.aws.region, profile: auth.aws.profile })` 作为凭据提供器；`ProviderCredentialState` 新增 `readonly supportsAmbientCredential: boolean`，取值逐字为 `provider.type === 'bedrock' && !hasApiKey && !hasOAuthToken`，`toProtocolProvider` 的 `status` 判定因此改为 `credential.hasApiKey || credential.hasOAuthToken || credential.supportsAmbientCredential ? 'connected' : 'unconfigured'`，即只配了区域的 `bedrock` 供应商在 `GET /api/v1/providers` 里直接报 `connected`；`AuthSummaryService` 新增 `if (auth.aws !== undefined) return;`，使认证摘要不再因为缺少 API Key 或 `api_key_env` 而报错](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/packages/agent-core-v2/src/llm-adapter/model/catalog-service.ts)
- [Kimi Code `packages/core/test/llm/bedrock.test.ts`（同上提交，4,925 字节，单个用例名逐字为 “keeps token lifecycle, routing, and Anthropic authentication provider-local”）：断言 `inferBedrockProtocol` 对 `global.anthropic.claude-sonnet-4-6`、`openai.gpt-oss-120b-1:0`、`global.openai.gpt-6-astra`、`global.moonshotai.kimi-k3`、`meta.llama-4` 依次返回 `anthropic`、`openai`、`openai_responses`、`openai`、`undefined`；`stripBedrockInferenceProfilePrefix('apac.moonshotai.kimi-k3')` 得 `moonshotai.kimi-k3`；`resolveBedrockBaseUrl('anthropic', { AWS_REGION: 'us-west-2' })` 得 `https://bedrock-runtime.us-west-2.amazonaws.com/anthropic`，`resolveBedrockBaseUrl('openai', { AWS_DEFAULT_REGION: 'us-east-1' })` 得 `https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1`；`bedrockModelCapability('global.anthropic.claude-sonnet-4-6')` 与 `getAnthropicModelCapability('claude-sonnet-4-6')` 相等；令牌生命周期部分断言两个并发 `resolve()` 只触发一次取令牌、时钟前进 12 小时后重新取令牌、`canRecover({ status: 401 })` 为真而 `{ status: 500 }` 为假、`invalidate()` 后再取一次；另一段断言取令牌抛出的错误（示例文案 `run aws sso login`）原样冒泡、下一次 `resolve()` 会重试；传输层断言 Bedrock 客户端发出的请求头 `authorization` 为 `Bearer bedrock-api-key-transport` 且 `x-api-key` 为 `null`，而原生 `anthropic` 协议客户端发出 `x-api-key: upstream-key` 与自定义 `authorization: Bearer gateway-token`](https://github.com/MoonshotAI/kimi-code/blob/88e3c20739a20a9a4003e366db7ecad9b88e10bd/packages/core/test/llm/bedrock.test.ts)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)

## 关联能力

- [Provider 类型](./model-provider.md)
- [API Key](./auth-api-key.md)
- [环境变量注入](./auth-environment.md)
