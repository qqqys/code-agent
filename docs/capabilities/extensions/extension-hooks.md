# 生命周期 Hooks

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-hooks)

> 核对日期：2026-07-29

## 定义

在提示词、工具、权限、会话、压缩或 Subagent 生命周期节点执行外部逻辑，并比较事件、Handler 类型和阻断语义。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/hooks` · 多类 Handler | 官方确认 |
| Codex | `/hooks` · 当前仅 command 执行 | 官方确认 |
| Qwen Code | `/hooks` · command/HTTP/prompt | 源码确认 |
| Kimi Code | `config.toml` · command | 官方确认 |
| Qoder CLI | `settings.json` · command/HTTP/prompt/agent | 官方确认 |

## 比较边界

### 本页包含

- Hook 配置位置与事件匹配
- command、HTTP、prompt、agent 或 MCP Tool Handler
- 允许、阻断、修改输入输出与记录事件

### 本页不包含

- 模型自行决定调用的普通工具
- CI 平台的远程 Workflow Hook
- 只提供说明文字而不绑定生命周期的项目指令

## 跨产品事实

1. 五家都公开了生命周期 Hook，但并不是同一实现：Kimi Code 当前独立 Hook 只执行 command，Codex 当前运行时也只执行 command。
2. Claude Code、Qwen Code 和 Qoder CLI 支持多种 Handler；可用事件与返回 JSON 结构仍需按各自文档配置，不能直接复制。
3. 项目 Hook 可以运行本地命令或访问网络，因此可信工作区、超时、退出码和失败时是否放行是比较中的核心边界。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · 多类 Handler |
| 入口与配置 | `/hooks` 查看已加载配置；Hook 可写入设置、Plugin，或放在 Skill 与 Subagent 的前置元数据中。 |
| 文件与目录 | 用户、项目、Local、Managed settings；Plugin 使用 `hooks/hooks.json`。 |
| 具体行为 | 可在工具前后、权限请求、提示提交、会话、压缩、Subagent、任务和通知等节点运行并返回控制结果。 |
| 作用域与优先级 | 用户、项目、本地、托管、Plugin、Skill 与 Agent 多种作用域。 |
| 扩展构成 | Handler 类型包括 command、HTTP、MCP Tool、prompt 和 agent。 |
| 加载与刷新 | 配置在会话启动或重新加载时汇总；`/hooks` 用于检查当前生效配置。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | Hook 可阻止工具或提示继续；项目 Hook 属于可执行代码，需要信任其来源。 |
| 条件与边界 | 事件支持的输入、输出和退出码语义不同；不能假设所有 Handler 都可用于每个事件。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Hooks](https://code.claude.com/docs/en/hooks) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · 当前仅 command 执行 |
| 入口与配置 | `/hooks` 检查、信任或禁用非托管 Hook；也可直接编辑 JSON/TOML 配置。 |
| 文件与目录 | 用户 `~/.codex/hooks.json` 或 `~/.codex/config.toml`；项目 `.codex/hooks.json` 或 `.codex/config.toml`；Plugin 可携带 Hook。 |
| 具体行为 | 覆盖工具、权限、压缩、提示、Subagent、停止和 Session 生命周期事件。 |
| 作用域与优先级 | 用户、可信项目、Managed 与 Plugin 来源。 |
| 扩展构成 | 当前执行的 Handler 类型是 command；prompt 与 agent 配置可解析但运行时跳过。 |
| 加载与刷新 | 项目 Hook 需要工作区信任；`/hooks` 展示来源并提供相应控制。 |
| 适用界面 | 以 Codex CLI 为准；桌面端、IDE 扩展、Cloud 和 `codex exec` 不自动继承全部交互命令。 |
| 权限与信任 | PreToolUse 或 PermissionRequest 等事件可影响是否继续；Managed Hook 不由普通用户关闭。 |
| 条件与边界 | 当前运行时不执行 prompt/agent Handler，async 也尚未支持；配置文件能解析不等于能力已经运行。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Hooks](https://learn.chatgpt.com/docs/hooks) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/hooks` · command/HTTP/prompt |
| 入口与配置 | `/hooks` 查看和管理已加载 Hook；设置文件和 Extension 都可声明。 |
| 文件与目录 | 用户与项目 `settings.json`；Extension 可内联 Hooks、引用文件或使用默认 `hooks/hooks.json`。 |
| 具体行为 | 覆盖提示、模型、工具、权限、会话、压缩、Subagent、通知等生命周期，并能阻断或返回修改后的控制结果。 |
| 作用域与优先级 | 用户、可信项目与 Extension 来源；项目 Hook 随仓库共享。 |
| 扩展构成 | 公开文档包括 command、HTTP 与 prompt；运行时还存在 session-only 的内部 function Hook。 |
| 加载与刷新 | 启动时合并配置；Extension 热重载与 Hook 管理入口可更新当前运行时状态。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | 项目 Hook 只在可信文件夹加载；Hook 自身的命令和网络访问需要按可执行配置审查。 |
| 条件与边界 | 内部 function Hook 不是普通配置格式；公开可配置范围应以 command、HTTP 与 prompt 为准。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current Hooks](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/hooks.md)、[Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `config.toml` · command |
| 入口与配置 | 没有独立 `/hooks` 命令；在 `~/.kimi-code/config.toml` 的 `[[hooks]]` 中配置。 |
| 文件与目录 | 独立 Hook 位于用户 `config.toml`；Plugin manifest 也可携带 Hook 配置。 |
| 具体行为 | 可监听提示、工具、权限、会话、压缩与 Subagent 等事件；退出码 2 可阻断，其他错误默认放行。 |
| 作用域与优先级 | 用户配置与已启用 Plugin；当前文档未列项目级独立 Hook 文件。 |
| 扩展构成 | 独立配置当前只有 command Handler。 |
| 加载与刷新 | 启动时读取配置；Plugin 改动通常需要 `/reload` 或新会话。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | Hook command 在本机执行；阻断与 fail-open 语义取决于退出码。 |
| 条件与边界 | “命令表没有 `/hooks`”不等于没有 Hook 能力；Kimi 的入口是 TOML 配置。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current Hooks](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/hooks.md)、[Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `settings.json` · command/HTTP/prompt/agent |
| 入口与配置 | 在 User、Project 或 Local settings 中配置；当前公开页面以配置为主。 |
| 文件与目录 | `~/.qoder/settings.json`、项目 `.qoder/settings.json` 与 `.qoder/settings.local.json`；Plugin 可携带 `hooks/hooks.json`。 |
| 具体行为 | 覆盖工具、提示、权限、通知、会话、压缩与 Subagent 等节点，并按 Handler 返回结果控制流程。 |
| 作用域与优先级 | User、Project、Local 和 Plugin。 |
| 扩展构成 | command、HTTP、prompt 与 agent Handler。 |
| 加载与刷新 | 随设置和 Plugin 加载；修改后的刷新方式取决于对应配置或插件重载入口。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | 项目 Hook 只应在可信工作区启用；Hook 能阻断关键操作，但自身仍是本机可执行配置。 |
| 条件与边界 | 不同 Handler 的超时、响应字段和阻断条件不同，需要按事件文档逐项设置。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI Hooks](https://docs.qoder.com/en/cli/hooks)、[Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins) |

## 官方来源

- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [Codex Hooks](https://learn.chatgpt.com/docs/hooks)
- [Qwen Code current Hooks](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/hooks.md)
- [Qwen Code current Extension runtime](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/extension/extensionManager.ts)
- [Kimi Code current Hooks](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/hooks.md)
- [Kimi Code current Plugins](https://github.com/MoonshotAI/kimi-code/blob/691ec4679ea1/docs/zh/customization/plugins.md)
- [Qoder CLI Hooks](https://docs.qoder.com/en/cli/hooks)
- [Qoder CLI Plugins](https://docs.qoder.com/en/cli/plugins)

## 关联能力

- [插件分发](./extension-plugins.md)
- [交互审批](../security/security-approval.md)
- [Agent 独立 Hooks](../subagents/agent-hooks.md)
