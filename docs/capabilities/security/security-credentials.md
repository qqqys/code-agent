# 凭据保护

[返回权限与沙箱详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=security-credentials)

> 核对日期：2026-08-13

## 定义

限制 Agent 执行的命令及其子进程取得凭据文件与敏感环境变量的方式：拒绝读取、整体移除、以哨兵值打码，或由出站代理在请求中替换真实值。

## 权限结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `sandbox.credentials.files` · `envVars` `deny`/`mask` · `extract`/`decode: "jwt"` 打码 · `awsPairs`/`sigv4` SigV4 重签名 · 出站代理注入 | 官方确认 |
| Codex | `shell_environment_policy` 过滤子进程环境变量；无文件打码 | 官方确认 |
| Qwen Code | 官方沙箱文档未列凭据保护；容器挂载 `~/.qwen` | 官方确认 |
| Kimi Code | 未确认 OS 沙箱；文档未列凭据保护字段 | 未确认 |
| Qoder CLI | 本地 CLI/SDK 文档未列同类凭据保护 | 官方确认 |

## 比较边界

### 本页包含

- 凭据文件拒绝读取或打码
- 敏感环境变量移除或打码
- 出站请求真实值替换

### 本页不包含

- 产品自身账号登录凭据的存储与加密
- 云厂商凭据链
- 普通文件路径 Allow/Deny 规则

## 跨产品事实

1. Claude Code 在 `sandbox.credentials` 下提供 files 与 envVars 的 `deny`，以及变量的 `mask`；v2.1.221 起 Linux 与 WSL 的凭据文件也支持 `mask`。v2.1.224 起打码增加 `extract` 部分捕获、`decode: "jwt"` 假令牌替换和 `awsPairs`/`sigv4` 的 AWS SigV4 重签名。
2. Codex 通过 `[shell_environment_policy]` 在环境变量继承层过滤，官方文档用于避免把不必要的 secret 传给子进程；不提供凭据文件打码或出站替换。
3. Qwen Code、Kimi Code 与 Qoder CLI 的公开沙箱或权限文档未列出同类凭据保护字段。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `sandbox.credentials.files` · `envVars` `deny`/`mask` · `extract`/`decode: "jwt"` 打码 · `awsPairs`/`sigv4` SigV4 重签名 · 出站代理注入 |
| 入口与切换 | 在用户、Managed 或 `--settings` 设置中声明 `sandbox.credentials.files`、`sandbox.credentials.envVars`、`credentials.awsPairs` 与 `credentials.sigv4`。 |
| 默认状态 | 没有内置凭据拒绝清单，只保护显式列出的文件和变量；仅作用于沙箱内 Bash 命令。 |
| 具体行为 | 文件 `deny` 等同 `filesystem.denyRead`，变量 `deny` 在每条沙箱命令执行前 unset；`mask` 让命令看到每会话哨兵值，请求离开沙箱前往 `injectHosts`（未设 `injectHosts` 时为 `network.allowedDomains` 内全部主机）时由代理替换真实值，命令与其日志不持有真实凭据。`extract` 按正则只替换每个匹配的第 1 捕获组，连接串等结构化值其余部分保持可读；`decode: "jwt"` 校验后把 JWT 替换为结构有效的假令牌，`maskClaims` 可改为只打码列出的顶层 payload 声明，校验失败或无声明命中时按未打码放行并警告；代理按访问密钥哨兵值识别 SigV4 请求，替换真实凭据后重签名。 |
| 规则能力 | 文件 `deny` 合并所有设置作用域，任何作用域不能移除其他作用域加入的条目；同名变量 `deny` 优先于 `mask`；`injectHosts` 每个条目本身必须被 `network.allowedDomains` 覆盖。`extract` 必须含至少一个捕获组且不能与 `decode` 同用；`onExtractNoMatch` 默认 `warn`（警告并按未打码放行，文件条目则跳过打码），可选 `deny`（沙箱内 unset 变量）或 `error`（中止沙箱初始化直到修复配置）。`awsPairs` 命名的变量必须是整值 `mask` 条目且不带 `extract`/`decode`，代理在 access key ID 条目的 `injectHosts` 主机上重签名，设置 `sessionTokenVar` 时重签请求附带真实 `x-amz-security-token`；整体打码 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN` 时自动合并为一份凭据，`awsPairs` 中列出常规变量会替换自动配对。只打码 secret 而不配对时请求仍携带占位签名，会在 AWS 端失败，启动时给出警告。 |
| 隔离边界 | 文件保护属于文件系统层，`sandbox.filesystem.disabled` 时失效；变量保护仍生效。`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` 可不经沙箱从所有子进程剥离 Anthropic 与云 Provider 凭据。 |
| 保存与作用域 | 配置保存在用户、Managed 或 `--settings` 设置；仓库 `.claude/settings.json` 或 `.claude/settings.local.json` 中的 `mask`、`network.tlsTerminate`、`credentials.allowPlaintextInject`、`credentials.awsPairs`、`credentials.sigv4` 被忽略。 |
| 非交互行为 | Headless 与交互会话同样生效；`mask` 缺少 `network.tlsTerminate` 时启动报告配置错误并失败关闭：命令只见到哨兵值，认证失败。 |
| 条件与边界 | `sandbox.credentials` 需 v2.1.187+；envVars `mask` 需 v2.1.199+；v2.1.221 起 Linux 与 WSL 凭据文件支持 `mode: "mask"`（沙箱命令读取哨兵副本，可为整文件或 `extract` 正则捕获片段，代理在出站时替换真实值），macOS 文件打码回退 `deny`。v2.1.224 起新增 envVars `extract`/`onExtractNoMatch`、`decode: "jwt"`/`maskClaims`、`credentials.awsPairs` 与 `credentials.sigv4`；这些选项同样需要 `network.tlsTerminate`，且只在用户、Managed 或 `--settings` 设置中生效。`credentials.sigv4` 的 `streaming`（aws-chunked 流式上传）、`presigned`（预签名 URL）、`sigv4a`（SigV4A 非对称签名）设为 `passthrough` 时，代理转发占位签名请求，由工具收到 AWS 自身的拒绝响应而非代理错误；默认情况下这类无法重签名的占位签名请求由代理直接失败。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Sandboxing](https://code.claude.com/docs/en/sandboxing)、[Claude Code environment variables](https://code.claude.com/docs/en/env-vars)、[Claude Code v2.1.221 changelog](https://github.com/anthropics/claude-code/blob/dd796139237c/CHANGELOG.md)、[Claude Code v2.1.224 changelog](https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `shell_environment_policy` 过滤子进程环境变量；无文件打码 |
| 入口与切换 | `~/.codex/config.toml` 的 `[shell_environment_policy]`。 |
| 默认状态 | `ignore_default_excludes` 默认 `true`，即默认不自动移除名称含 KEY、SECRET、TOKEN 的变量；设为 `false` 才先应用该自动排除。 |
| 具体行为 | `[shell_environment_policy]` 决定传给所生成命令的环境变量：`inherit = "none"\|"core"`、`set` 显式赋值、`filters` exclude/include；官方文档用它避免把不必要的 secret 传给子进程。 |
| 规则能力 | 处理顺序为自动排除、自定义 exclude、`set` 赋值、include 允许列表；`set` 可恢复已排除变量，include 允许列表可再次移除。filter 大小写不敏感，支持 `*` 与 `?`；include 不恢复已被排除的变量。旧 `exclude`/`include_only` 数组仍受支持，但不能与 `filters` 在同一配置层混用。 |
| 隔离边界 | 只约束传给所生成命令的环境变量；不提供凭据文件拒绝或打码，也没有出站真实值替换。文件系统与网络边界由 `sandbox_mode` 等另行控制。 |
| 保存与作用域 | 写入 `config.toml`；filter 键跨配置层按大小写不敏感合并。 |
| 非交互行为 | 非交互运行同样按配置过滤子进程环境变量。 |
| 条件与边界 | `inherit = "none"` 从空环境开始，`"core"` 继承裁剪集合；无凭据文件打码或出站替换字段。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 官方沙箱文档未列凭据保护；容器挂载 `~/.qwen` |
| 入口与切换 | 无独立凭据保护入口；沙箱经 `tools.sandbox`/`--sandbox` 与 Seatbelt Profile 或容器配置。 |
| 默认状态 | 官方沙箱文档未列凭据文件或敏感变量的保护字段。 |
| 具体行为 | 沙箱文档未提供凭据文件或敏感变量的保护字段；容器沙箱挂载工作区与 `~/.qwen`，认证与设置在沙箱内可见并在运行之间保留。 |
| 规则能力 | 文件系统与网络边界由 Seatbelt Profile 或容器挂载与代理配置控制；文档不含凭据条目。 |
| 隔离边界 | 容器沙箱挂载工作区与 `~/.qwen`，认证与设置在运行之间保留；挂载范围内的凭据对沙箱命令可见。 |
| 保存与作用域 | 沙箱配置随 Settings 与环境变量保存。 |
| 非交互行为 | 沙箱行为在 Headless 同样按配置生效；文档未列凭据保护相关降级。 |
| 条件与边界 | 官方文档化的隔离路径是 Seatbelt 或容器路径限制；没有凭据专用字段。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code Sandbox](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sandbox.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 未确认 OS 沙箱；文档未列凭据保护字段 |
| 入口与切换 | 配置文档无凭据保护入口。 |
| 默认状态 | OS 或容器级沙箱未确认；无凭据保护默认行为。 |
| 具体行为 | 配置文档无凭据保护字段；OS 或容器级沙箱未确认。可用 permission rules 限制文件读取等工具调用，但属于工具规则层。 |
| 规则能力 | `[[permission.rules]]` 可限制文件读取等工具调用；属于工具规则层，不是沙箱凭据保护。 |
| 隔离边界 | 没有沙箱层承载凭据文件打码或出站真实值替换。 |
| 保存与作用域 | 工具规则保存在 `~/.kimi-code/config.toml`。 |
| 非交互行为 | `kimi -p` 固定使用 Auto 策略；静态 deny 规则仍生效（工具层）。 |
| 条件与边界 | 当前一手资料未列同类字段。 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code Interaction and Permissions](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/guides/interaction.md)、[Kimi Code Configuration](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 本地 CLI/SDK 文档未列同类凭据保护 |
| 入口与切换 | 权限文档提供 Read/Edit 路径规则；SDK 提供 Sandbox Settings。 |
| 默认状态 | 公开参考未列凭据文件或敏感变量的 deny/mask 清单。 |
| 具体行为 | 权限与 SDK 文档提供路径规则与 Sandbox Settings，但未列凭据文件或敏感变量的 deny/mask/替换；云端会话 `vault_ids` 引用云端凭据库，不是本地沙箱保护。 |
| 规则能力 | 路径权限规则与 `canUseTool` 控制工具调用；无凭据专用键。 |
| 隔离边界 | 本地 CLI/SDK 文档未列凭据文件打码或出站替换；云端会话 `vault_ids` 引用云端凭据库，不是本地沙箱保护。 |
| 保存与作用域 | 权限规则按用户、项目、本地项目等设置层保存。 |
| 非交互行为 | Headless 中 `ask` 自动变为 `deny`；文档未列凭据保护行为。 |
| 条件与边界 | 本地 CLI/SDK 文档未列同类凭据保护字段。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)、[Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code Sandboxing](https://code.claude.com/docs/en/sandboxing)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code v2.1.221 changelog](https://github.com/anthropics/claude-code/blob/dd796139237c/CHANGELOG.md)
- [Claude Code v2.1.224 changelog](https://github.com/anthropics/claude-code/blob/66edf5358349/CHANGELOG.md)
- [Codex Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [Qwen Code Sandbox](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sandbox.md)
- [Kimi Code Interaction and Permissions](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/guides/interaction.md)
- [Kimi Code Configuration](https://github.com/MoonshotAI/kimi-code/blob/086769bfadf1c86ba0569f16315010ffc77344f0/docs/zh/configuration/config-files.md)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [文件系统隔离](./security-filesystem.md)
- [网络隔离](./security-network.md)
- 本地凭据存储：见对应能力矩阵
