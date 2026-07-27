# 本地凭据存储

[返回模型与认证详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=auth-storage)

> 核对日期：2026-07-27

## 定义

记录 OAuth 登录令牌和静态 Provider Key 在本机的存储后端、路径、文件权限和公开程度。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | macOS Keychain；Linux/Windows credentials 文件 | 官方确认 |
| Codex | `auth.json` · Keyring · Auto | 官方确认 |
| Qwen Code | `settings.json` · `.env` · 进程环境 | 条件项 |
| Kimi Code | `credentials/` 0600 · `config.toml` 明文 Key | 条件项 |
| Qoder CLI | 登录缓存可复用；具体后端与路径未公开 | 未确认 |

## 比较边界

### 本页包含

- 系统 Keyring/Keychain
- 认证文件与静态配置文件
- 可配置的凭据存储后端

### 本页不包含

- 云端服务保存的账号数据
- 第三方 Secret Manager 的内部实现
- 没有公开证据的路径猜测

## 跨产品事实

1. Claude Code 在 macOS 使用 Keychain；Codex 可显式选择 file、keyring 或 auto。
2. Kimi Code 的 OAuth 凭据文件使用 0600，但静态 Provider Key 可明文写在 `config.toml`。
3. Qoder CLI 公共文档说明登录可复用，但未公开准确存储后端和路径，因此保留边界而不猜测。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | macOS Keychain；Linux/Windows credentials 文件 |
| 入口与配置 | 账号登录流程与平台凭据存储。 |
| 支持范围 | macOS 使用加密 Keychain；Linux 使用 `~/.claude/.credentials.json` 0600；Windows 使用同类文件并依 OS ACL。 |
| 具体行为 | 保存 OAuth 登录状态供后续会话复用。 |
| 会话与作用域 | 本机操作系统用户。 |
| 持久化位置 | 跨会话，直到 `/logout` 或凭据失效。 |
| 自动化用法 | 自动化通常绕过账号凭据库，改用环境 Key 或云身份。 |
| 安全与管理 | macOS 借助 Keychain；文件平台依靠 0600/ACL。 |
| 条件与边界 | API Key 环境变量不等同于账号登录凭据存储。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code authentication and credential management](https://code.claude.com/docs/en/team) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `auth.json` · Keyring · Auto |
| 入口与配置 | `cli_auth_credentials_store = "file"\|"keyring"\|"auto"`。 |
| 支持范围 | `file` 写 `~/.codex/auth.json`；`keyring` 使用系统凭据库；`auto` 优先 Keyring、失败回退文件。 |
| 具体行为 | 保存 ChatGPT OAuth、API Key 或 access token 登录状态。 |
| 会话与作用域 | Codex home 与当前 OS 用户。 |
| 持久化位置 | 跨会话，直到 `codex logout` 或令牌失效。 |
| 自动化用法 | CI 可使用隔离的 Codex home 或只注入短期环境凭据。 |
| 安全与管理 | 高安全环境应显式使用 Keyring，并保护 file fallback。 |
| 条件与边界 | 默认/可用后端依操作系统和 Keyring 可访问性。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex authentication](https://learn.chatgpt.com/docs/auth)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `settings.json` · `.env` · 进程环境 |
| 入口与配置 | Provider Settings、项目 `.env`、系统环境。 |
| 支持范围 | Key 可在 `settings.json.env`、`.env` 或进程环境；当前认证流程不依赖可用的 Qwen OAuth 浏览器缓存。 |
| 具体行为 | 按优先级读取 Provider Key。 |
| 会话与作用域 | 项目、用户、系统设置或当前进程。 |
| 持久化位置 | Settings 与 `.env` 为明文文件；进程环境不由 Qwen 持久化。 |
| 自动化用法 | CI 用环境变量，不需要写本地认证文件。 |
| 安全与管理 | 文档推荐把向导保存的 Key 从 Settings 移到 `.env`，并避免提交。 |
| 条件与边界 | 系统 override Settings 可覆盖项目/用户值；旧 OAuth 数据不代表当前登录可用。 |
| 证据状态 | 条件项 |
| 来源 | [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)、[Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `credentials/` 0600 · `config.toml` 明文 Key |
| 入口与配置 | `~/.kimi-code/credentials/` 与 `~/.kimi-code/config.toml`。 |
| 支持范围 | OAuth 凭据目录 0700、文件 0600；静态 Provider `api_key` 明文位于 config。 |
| 具体行为 | OAuth 账号可切换和退出；静态 Key 随 Provider 配置读取。 |
| 会话与作用域 | 本机用户的 Kimi Code home。 |
| 持久化位置 | 跨会话，直到退出账号或编辑配置。 |
| 自动化用法 | CI 可用临时 home 或 `KIMI_MODEL_*`，避免长期配置落盘。 |
| 安全与管理 | 保护 config 文件和备份；0600 只覆盖 credentials，不会自动加密 config 中的 Key。 |
| 条件与边界 | OAuth 与静态 Key 的安全属性不同，不能合并描述。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 登录缓存可复用；具体后端与路径未公开 |
| 入口与配置 | `qodercli login`、`/login` 与模型设置。 |
| 支持范围 | 登录状态可被后续 CLI 和 SDK 复用；公开文档未说明精确 Keychain/文件后端或路径。 |
| 具体行为 | 本地登录优先于 `QODER_PERSONAL_ACCESS_TOKEN`。 |
| 会话与作用域 | 本机用户。 |
| 持久化位置 | 跨会话，直到 `/logout`；Custom Model Key 由模型设置保存。 |
| 自动化用法 | CI 用 PAT 环境变量，避免依赖交互登录缓存。 |
| 安全与管理 | 因后端未公开，不对加密方式作推断。 |
| 条件与边界 | “可复用登录”不等于已确认具体磁盘路径。 |
| 证据状态 | 未确认 |
| 来源 | [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)、[Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)、[Qoder CLI model configuration](https://docs.qoder.com/en/cli/model) |

## 官方来源

- [Claude Code authentication and credential management](https://code.claude.com/docs/en/team)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code current authentication](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/auth.md)
- [Qwen Code current settings](https://github.com/QwenLM/qwen-code/blob/7f8adc659ebe2d2f809ef31c79fea5638f3bf5ab/docs/users/configuration/settings.md)
- [Kimi Code current data locations](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/data-locations.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/configuration/config-files.md)
- [Qoder CLI login and quick start](https://docs.qoder.com/en/cli/quick-start)
- [Qoder Agent SDK authentication](https://docs.qoder.com/en/cli/sdk/authentication)
- [Qoder CLI model configuration](https://docs.qoder.com/en/cli/model)

## 关联能力

- [环境变量注入](./auth-environment.md)
- [退出与撤销本地凭据](./auth-logout.md)
- [浏览器账号登录](./auth-browser.md)
