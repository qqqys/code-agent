# 组织账号与策略

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-enterprise)

> 核对日期：2026-08-25

## 定义

组织统一控制登录方式、成员权限、模型范围、配置优先级和本地客户端策略。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | SSO · Managed settings · 强制登录策略 | 官方确认 |
| Codex | Workspace RBAC · Managed config · 强制 Workspace | 官方确认 |
| Qwen Code | 系统级 Settings · Provider 身份；无统一 SSO 层 | 条件项 |
| Kimi Code | 公开 CLI 文档未列 Managed/SSO 策略 | 未确认 |
| Qoder CLI | Teams 管理台 · 域名限制 · SAML SSO | 条件项 |

## 比较边界

### 本页包含

- SSO、Workspace 与组织账号
- Managed/System settings
- 强制登录、模型和域名策略

### 本页不包含

- 产品价格与采购比较
- 未公开的内部控制台功能
- 一般个人配置

## 跨产品事实

1. Claude Code 和 Codex 都公开了可强制登录方式、组织/Workspace 与托管配置的企业控制。
2. Qoder Teams 公开 SAML SSO、域名和管理台；其 Custom Model BYOK 不适用于 Teams。
3. Qwen Code 有机器级系统 Settings，但当前没有与前三者等价的 CLI 自带统一 SSO 管理层；Kimi Code 公共 CLI 文档也未列 Managed/SSO 策略。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | SSO · Managed settings · 强制登录策略 |
| 入口与配置 | Claude Team/Enterprise、SSO、Managed settings、server-managed settings。 |
| 支持范围 | 组织可强制登录方法、组织 UUID、模型集合、权限与配置。 |
| 具体行为 | Managed 层高于用户和项目 Settings，并可由服务端下发。 |
| 会话与作用域 | 组织、设备、系统、用户和项目多层。 |
| 持久化位置 | 本地 Managed 文件或服务端托管策略跨会话生效。 |
| 自动化用法 | 管理员通过设备管理、配置部署或服务端策略统一客户端。 |
| 安全与管理 | 支持 SSO、最小模型集合、网关和凭据辅助程序。 |
| 条件与边界 | 可用策略依 Team/Enterprise 计划与部署方式。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)、[Claude Code server-managed settings](https://code.claude.com/docs/en/server-managed-settings)、[Claude Code settings](https://code.claude.com/docs/en/settings) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Workspace RBAC · Managed config · 强制 Workspace |
| 入口与配置 | ChatGPT Workspace、Managed config、requirements 与管理策略。 |
| 支持范围 | Workspace RBAC/保留策略；`forced_login_method` 与 `forced_chatgpt_workspace_id` 约束本地登录。 |
| 具体行为 | 组织策略限制配置、审批、安全与可用身份。 |
| 会话与作用域 | Workspace、系统 Managed config、用户和项目配置。 |
| 持久化位置 | Managed 层跨会话并高于普通用户选择。 |
| 自动化用法 | 管理员部署托管配置和要求文件。 |
| 安全与管理 | 强制 Workspace 防止误用个人账号；RBAC 和保留策略作用于云端。 |
| 条件与边界 | 本地 API Key Provider 与 Codex Cloud Workspace 能力要分开判断。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)、[Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 系统级 Settings · Provider 身份；无统一 SSO 层 |
| 入口与配置 | 系统默认 Settings 与系统 override 文件；Provider 自身的组织身份。 |
| 支持范围 | 系统 override 优先级高于用户和项目设置，可统一 Provider、模型和运行配置。 |
| 具体行为 | 机器管理员可部署固定配置，但账号 SSO 仍由所接 Provider 承担。 |
| 会话与作用域 | 系统、用户、项目和进程。 |
| 持久化位置 | 系统配置跨用户/会话生效，具体路径依操作系统。 |
| 自动化用法 | 镜像、设备管理或配置管理系统部署 Settings。 |
| 安全与管理 | 可把 Provider 与模型限制在系统层，并从环境/Secret 管理凭据。 |
| 条件与边界 | 当前公共文档没有 Qwen Code 自带的集中式 SSO/组织管理台契约。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)、[Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 公开 CLI 文档未列 Managed/SSO 策略 |
| 入口与配置 | 公共 CLI 文档仅列本地 `config.toml`、Provider 与凭据目录。 |
| 支持范围 | 没有公开的 Managed settings、强制组织登录或 CLI SSO 策略层。 |
| 具体行为 | 组织可在外部通过镜像、文件权限和 Provider IAM 管理，但不是 Kimi Code 公共契约。 |
| 会话与作用域 | 当前可确认到本机用户配置。 |
| 持久化位置 | 本地配置跨会话。 |
| 自动化用法 | 可由外部配置管理部署文件，但无公开专用管理 API。 |
| 安全与管理 | Provider IAM 可独立实施组织控制。 |
| 条件与边界 | 不把外部运维能力标成 Kimi Code 内置企业策略。 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Teams 管理台 · 域名限制 · SAML SSO |
| 入口与配置 | Qoder Teams 管理台、团队域名限制、SAML SSO。 |
| 支持范围 | 管理员创建 Team、管理成员、访问和隐私设置，并配置 SSO。 |
| 具体行为 | 成员通过组织身份访问 Qoder 服务与受管资源。 |
| 会话与作用域 | Team/组织账号。 |
| 持久化位置 | 服务端组织策略跨设备生效。 |
| 自动化用法 | 管理员在账号控制台配置域名和 SAML IdP。 |
| 安全与管理 | 集中身份、域名约束和隐私控制。 |
| 条件与边界 | Custom Model BYOK 只适用于 Individual 计划，不适用于 Teams。 |
| 证据状态 | 条件项 |
| 来源 | [Qoder Teams administration](https://docs.qoder.com/account/teams/get-started-with-teams)、[Qoder Teams SSO](https://docs.qoder.com/account/teams/sso)、[Qoder CLI model configuration](https://docs.qoder.com/en/cli/model) |

## 官方来源

- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Claude Code server-managed settings](https://code.claude.com/docs/en/server-managed-settings)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md)
- [Qoder Teams administration](https://docs.qoder.com/account/teams/get-started-with-teams)
- [Qoder Teams SSO](https://docs.qoder.com/account/teams/sso)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)

## 关联能力

- [浏览器账号登录](./auth-browser.md)
- [本地凭据存储](./auth-storage.md)
- [Provider 类型](./model-provider.md)
