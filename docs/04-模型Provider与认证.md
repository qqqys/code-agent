# 模型、Provider 与认证

[上一篇：终端、代码与任务执行](./03-终端代码与任务执行.md) ·
[返回总矩阵](./02-功能总矩阵.md) ·
[下一篇：权限、审批与沙箱](./05-权限审批与沙箱.md)

这一层决定三个现实问题：默认用谁的模型、能不能换模型，以及个人和企业怎样登录。

## 五方表现

| 维度 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 默认生态 | Claude | OpenAI Codex/GPT | 面向 Qwen 优化，但运行时不绑定单一模型 | Kimi | Qoder 服务 |
| 常用认证 | Claude 订阅或 Anthropic Console | ChatGPT 登录或 OpenAI API Key | Coding Plan、API Key、兼容 Provider 配置 | Kimi OAuth 或 Moonshot API Key | 浏览器登录、PAT、环境变量 |
| 多 Provider | 主产品路径围绕 Anthropic；企业可按官方方式接云平台 | 主路径围绕 OpenAI，也支持本地 OSS/兼容 Provider 配置 | **核心长板：Qwen、OpenAI、Anthropic、Gemini 等兼容协议** | 官方说明可配置兼容 Provider | 主要使用 Qoder 账号和服务 |
| 模型切换 | 支持模型与推理强度选择 | 支持模型与 Reasoning Effort | 支持模型、Fallback 与推理参数 | 公开文档持续补证 | 模型相关参数按 CLI/SDK 版本补证 |
| 自带 Key | 支持 API 路径 | 支持 API Key | 支持且选择面广 | 支持 Moonshot API Key | PAT/账号路径明确，自定义 Provider 待证 |

## 差异怎么看

Claude Code 和 Codex 的主线都是“账号、模型、产品体验”一体化，登录后很快进入工作
状态。它们也提供企业或 API 路径，但默认体验仍围绕各自模型生态。

Qwen Code 更像一个可更换发动机的 Agent 运行时。对个人用户，它意味着可以在成本、
速度和效果之间切换；对平台开发者，它意味着可以把已有模型网关接进同一套 Agent
能力。代价是 Provider 配置、模型能力差异和兼容性问题更容易暴露给用户。

Kimi Code 以 Kimi 为默认，同时公开说明可使用兼容 Provider。Qoder CLI 则更像商业
产品入口，账号、云任务与 SDK 由同一服务体系提供。

## 不能只看“支持多少模型”

“能填一个 Base URL”不等于完整支持。真正需要比较的是：

1. 模型能否稳定调用工具和输出结构化结果；
2. 图片、长上下文、推理强度等能力是否被正确传递；
3. 失败时能否看懂是模型、账号、配额还是网络问题；
4. 切换模型后，会话和工具状态是否仍然有效；
5. 企业能否统一下发 Provider、Key 与允许模型清单。

## 对 Qwen Code 的启示

多 Provider 已经是明确优势，下一步应把“自由度”变成“可预测”：

- 登录页直接展示每种路径适合谁；
- 启动前检查模型是否支持当前工具与输入类型；
- Provider 错误统一翻译成账号、配额、网络、模型兼容四类；
- 给团队提供可下发的模型白名单和默认 Fallback；
- 在会话中明确显示当前模型、Provider 和预计成本层级。

## 证据状态

产品的模型名单、套餐、地区可用性和认证方式变化很快。本页只给结构性结论；具体版本
见 [版本与证据](./13-版本与证据.md)，实际付费前应再次查看各家官方定价和账号文档。
