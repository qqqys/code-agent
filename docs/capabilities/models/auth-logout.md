# 退出与撤销本地凭据

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-logout)

> 核对日期：2026-08-22

## 定义

退出当前产品账号或撤销 CLI 对本地凭据的使用，并区分账号令牌与手工配置的 Provider Key。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/logout` | 官方确认 |
| Codex | `codex logout` | 官方确认 |
| Qwen Code | 无独立 logout；重配 Provider 或删除 Key | 条件项 |
| Kimi Code | `/logout` | 源码确认 |
| Qoder CLI | `/logout` | 官方确认 |

## 比较边界

### 本页包含

- 退出命令
- 被清理的凭据范围
- 没有独立退出命令时的明确操作

### 本页不包含

- 服务端永久删除账号
- 云厂商 IAM 撤销
- 轮换第三方 API Key 的完整流程

## 跨产品事实

1. Claude Code、Codex、Kimi Code 和 Qoder CLI 都有明确退出入口。
2. Qwen Code 当前基于 Provider Key 配置，没有独立 logout；撤销本地使用需要重配 Provider 或删除对应 Key。
3. 退出账号通常不会自动删除手工写入配置或环境中的第三方 Provider Key。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/logout` |
| 入口与配置 | `/logout`。 |
| 支持范围 | 清除当前 Claude 账号的本地登录状态。 |
| 具体行为 | 后续会话需要重新登录或改用 API/云 Provider 凭据。 |
| 会话与作用域 | 本机 Claude Code 账号凭据。 |
| 持久化位置 | 立即影响后续会话。 |
| 自动化用法 | 临时环境 Key 的撤销由外部环境/Secret Store 处理。 |
| 安全与管理 | 退出不替代服务端撤销泄露的 API Key。 |
| 条件与边界 | Managed 登录策略仍可能在下次启动要求指定账号。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code authentication and credential management](https://code.claude.com/docs/en/team) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `codex logout` |
| 入口与配置 | `codex logout`。 |
| 支持范围 | 移除本地保存的 Codex 登录凭据。 |
| 具体行为 | `codex login status` 随后应显示未登录。 |
| 会话与作用域 | 当前 Codex home。 |
| 持久化位置 | 跨会话生效。 |
| 自动化用法 | 隔离环境可直接丢弃临时 Codex home。 |
| 安全与管理 | 环境中的 Provider Key 仍需从环境或 Secret Store 移除。 |
| 条件与边界 | 不同 `CODEX_HOME` 各自有独立登录状态。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 无独立 logout；重配 Provider 或删除 Key |
| 入口与配置 | 无独立 logout；使用 `/auth` 重选 Provider，并从 Settings、`.env` 或系统环境删除 Key。 |
| 支持范围 | 当前认证是 Provider 配置，不是可统一注销的 Qwen 账号 OAuth。 |
| 具体行为 | 删除实际生效的最高优先级 Key 后，Provider 请求不再获得该凭据。 |
| 会话与作用域 | 进程、项目、用户和系统各层。 |
| 持久化位置 | 必须修改保存该 Key 的具体来源。 |
| 自动化用法 | CI 在任务结束时销毁临时 Secret 环境。 |
| 安全与管理 | 需要按优先级检查，避免低层已删但高层系统环境仍生效。 |
| 条件与边界 | 旧 OAuth 免费层停止后，不能用历史 logout 语义描述当前流程。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/logout` |
| 入口与配置 | `/logout`。 |
| 支持范围 | 清除当前所选账号的 OAuth 凭据。 |
| 具体行为 | 退出 Kimi Code 账号；静态 Provider Key 仍保留在配置中。 |
| 会话与作用域 | 当前账号记录。 |
| 持久化位置 | 跨会话生效。 |
| 自动化用法 | 临时环境模型凭据随进程结束消失。 |
| 安全与管理 | 需要单独移除 `config.toml` 中的静态 Key。 |
| 条件与边界 | 只在 CLI 空闲时执行登录/退出。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)、[Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/logout` |
| 入口与配置 | `/logout`。 |
| 支持范围 | 退出当前 Qoder 账号并移除本地登录状态。 |
| 具体行为 | 后续访问需要重新登录或使用 PAT。 |
| 会话与作用域 | 本机 Qoder CLI 登录。 |
| 持久化位置 | 跨会话生效。 |
| 自动化用法 | 环境 PAT 仍由调用环境控制。 |
| 安全与管理 | 退出本地账号不会撤销仍有效的 PAT；需要在账号侧撤销。 |
| 条件与边界 | Custom Model Key 的删除由模型设置处理。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)

## 关联能力

- [本地凭据存储](./auth-storage.md)
- [浏览器账号登录](./auth-browser.md)
- [认证状态检查](./auth-status.md)
