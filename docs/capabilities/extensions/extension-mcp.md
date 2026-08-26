# MCP 客户端

[返回扩展系统详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=extension-mcp)

> 核对日期：2026-08-26

## 定义

把外部 MCP Server 提供的工具、提示词或资源接入 Code Agent，并记录传输方式、配置作用域、认证和信任边界。

## 扩展结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/mcp` · stdio/HTTP/SSE/WS | 官方确认 |
| Codex | `/mcp` · STDIO/HTTP | 官方确认 |
| Qwen Code | `/mcp` · stdio/HTTP/SSE | 源码确认 |
| Kimi Code | `/mcp` · `/mcp-config` | 官方确认 |
| Qoder CLI | `/mcp` · stdio/HTTP/SSE/WS | 官方确认 |

## 比较边界

### 本页包含

- MCP Server 的添加、查看、删除与重载入口
- stdio、HTTP、SSE 或 WebSocket 等传输
- 工具、Prompt、Resource、OAuth 与工具过滤

### 本页不包含

- 产品自己的内置工具
- 未通过 MCP 协议暴露的普通 REST API
- 插件包中的其他 Skills、Hooks 或 Agents

## 跨产品事实

1. 五家都能作为 MCP 客户端，但支持的传输集合不同：Codex 当前公开范围是 STDIO 与 Streamable HTTP，Claude Code 和 Qoder CLI 还覆盖 WebSocket。
2. 项目级 MCP 配置通常进入仓库或工作目录，因此 Claude Code、Kimi Code 和 Qoder CLI 都明确区分项目配置与用户配置。
3. “连上 Server”不等于所有工具无条件执行；工具过滤、审批、沙箱和工作区信任仍在 MCP 之外继续生效。
4. Codex 公开了 MCP 发现项收集上限：工具、资源与资源模板的分页结果合计最多 2,048 项（`MAX_MCP_CATALOG_ITEMS`，原 1,024）；其余四家当前一手资料未列出同类上限。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/mcp` · stdio/HTTP/SSE/WS |
| 入口与配置 | `/mcp` 查看连接和认证状态；使用 `claude mcp add\|list\|get\|remove` 管理 Server。 |
| 文件与目录 | Local scope 写入用户目录下按项目保存的配置；Project scope 写入 `.mcp.json`；User scope 对该用户的全部项目生效。 |
| 具体行为 | 支持 MCP Tools、Prompts 和 Resources。远程 HTTP/SSE Server 可走 OAuth；Prompt 可作为 Slash 命令调用。 |
| 作用域与优先级 | Local、Project、User 三种 scope；Project 的 `.mcp.json` 可共享，但首次使用需要确认信任。 |
| 扩展构成 | stdio、Streamable HTTP、已弃用的 SSE，以及通过 JSON 配置声明的 WebSocket；可由 Plugin 携带 `.mcp.json`。 |
| 加载与刷新 | CLI 管理命令写入对应 scope；项目配置在信任后加载，远程认证状态可从 `/mcp` 处理。 |
| 适用界面 | 以 Claude Code CLI 为准；VS Code 扩展、桌面端或 Headless 中不同的入口会单独注明。 |
| 权限与信任 | MCP 工具仍受 Claude Code 权限规则控制；共享项目配置不会跳过用户确认。 |
| 条件与边界 | `claude mcp add --transport` 不接受 WebSocket；WebSocket 需要直接写 JSON 配置。SSE 保留兼容但已标为弃用。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code MCP](https://code.claude.com/docs/en/mcp) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/mcp` · STDIO/HTTP |
| 入口与配置 | `/mcp` 查看当前 Server；使用 `codex mcp add\|list\|get\|remove\|login\|logout` 管理连接和 OAuth。 |
| 文件与目录 | 用户配置在 `~/.codex/config.toml`；可信项目可在仓库内使用 `.codex/config.toml`。 |
| 具体行为 | MCP 工具进入工具列表；可为 Server 配置允许或禁用的工具、启动超时、调用超时和审批策略。 |
| 作用域与优先级 | 用户配置可被 CLI、桌面端和 IDE 扩展共享；项目配置只在可信工作区加载。 |
| 扩展构成 | STDIO 与 Streamable HTTP；远程 HTTP 支持 Bearer Token 或 OAuth。 |
| 加载与刷新 | 修改 TOML 或运行 `codex mcp` 后由客户端加载；OAuth 通过登录命令建立授权。 |
| 适用界面 | CLI、Codex 桌面端和 IDE 扩展共享 MCP 配置，但每个 Surface 的可用工具和交互入口仍可能不同。 |
| 权限与信任 | Server 级 `enabled_tools`、`disabled_tools` 与工具审批策略先缩小暴露范围，实际执行仍受当前审批和沙箱配置约束。 |
| 条件与边界 | 当前官方 MCP 文档未列 SSE 或 WebSocket；不要把其他客户端支持的传输推断给 Codex。MCP 工具、资源与资源模板的分页发现结果合计最多收集 2,048 项（`MAX_MCP_CATALOG_ITEMS`，原 1,024），超出部分不会进入工具列表。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp)、[Codex MCP discovery item limit](https://github.com/openai/codex/commit/582569998181aad08a88bacc151a94b2048a5d1f) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/mcp` · stdio/HTTP/SSE |
| 入口与配置 | `/mcp` 查看状态、工具和认证；使用 `qwen mcp add\|list\|get\|remove\|enable\|disable` 管理 Server。 |
| 文件与目录 | 用户配置在 `~/.qwen/settings.json`，项目配置在 `.qwen/settings.json`；Extension 也可携带 MCP 配置。 |
| 具体行为 | Tools 作为模型工具，Prompts 转成 Slash 命令，Resources 可用 `@server:uri` 引用；远程 Server 支持 OAuth。 |
| 作用域与优先级 | 用户、项目与 Extension 三类来源合并；项目配置随仓库共享并受工作区信任控制。 |
| 扩展构成 | stdio、Streamable HTTP 和兼容用 SSE；支持 `includeTools`、`excludeTools` 与 Server trust 设置。 |
| 加载与刷新 | 配置由启动流程加载；`/mcp` 可重新连接、授权并检查各 Server 状态。 |
| 适用界面 | 以 Qwen Code CLI 为准；Headless、ACP 和 IDE Companion 中不同的加载行为会单独注明。 |
| 权限与信任 | MCP 工具继续经过 approval mode 和工具策略；Server trust 与工作区信任是不同层次。 |
| 条件与边界 | SSE 属于兼容传输；HTTP 是当前远程 Server 的主要配置方式。Prompt 与 Resource 并非所有五家都以相同入口暴露。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current MCP](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/mcp.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/mcp` · `/mcp-config` |
| 入口与配置 | `/mcp` 查看 Server；`/mcp-config` 管理配置，并可用 `/mcp-config login` 完成 OAuth。 |
| 文件与目录 | 用户配置在 `$KIMI_CODE_HOME/mcp.json`，默认 `~/.kimi-code/mcp.json`；项目配置在 `.kimi-code/mcp.json`。 |
| 具体行为 | 把 Server 工具加入 Agent 工具集，支持工具允许列表和禁用列表；远程 Server 可进行 OAuth 登录。 |
| 作用域与优先级 | 项目配置覆盖用户配置中的同名 Server；Plugin 也可以声明 MCP Server。 |
| 扩展构成 | stdio、HTTP 与 SSE 三类传输。 |
| 加载与刷新 | 启动时合并用户、项目与 Plugin 配置；配置变化可通过相应命令或新会话生效。 |
| 适用界面 | 以 Kimi Code CLI 为准；ACP、Web UI 和外部编辑器只在对应能力中单独列出。 |
| 权限与信任 | 项目 MCP 配置可以执行本地命令或连接远程服务，官方文档要求只在可信仓库中加载。 |
| 条件与边界 | 当前公开文档未列 WebSocket。`/mcp-config` 是配置入口，`/mcp` 主要用于查看和操作已加载连接。 |
| 证据状态 | 官方确认 |
| 来源 | [Kimi Code current MCP](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/mcp.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/mcp` · stdio/HTTP/SSE/WS |
| 入口与配置 | `/mcp` 查看 Server，`/mcp reload` 重载；使用 `qodercli mcp add\|list\|get\|remove` 管理配置。 |
| 文件与目录 | 用户配置在 `~/.qoder/settings.json`；Local 默认在 `.qoder/settings.local.json`；Project scope 使用 `.mcp.json`。 |
| 具体行为 | 把 Server 工具接入 Agent，并支持运行中重载；工具调用继续走 Qoder CLI 权限流程。 |
| 作用域与优先级 | User、Local、Project 三种 scope；Local 适合不提交的工作区覆盖，Project 可随仓库共享。 |
| 扩展构成 | stdio、SSE、HTTP 与 WebSocket 四类传输。 |
| 加载与刷新 | 启动时加载各 scope；`/mcp reload` 可以在当前会话重新读取配置。 |
| 适用界面 | 以 Qoder CLI 为准；Agent SDK、ACP 和 Qoder IDE 中不同的入口会单独注明。 |
| 权限与信任 | MCP 工具按普通工具进入 permission rules；配置来源不自动获得免审批权限。 |
| 条件与边界 | Project 配置可被其他协作者取得，Local 配置适合机器或凭据相关覆盖；敏感值不应直接提交。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI MCP servers](https://docs.qoder.com/en/cli/mcp-servers)、[Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions) |

## 官方来源

- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp)
- [Codex MCP discovery item limit](https://github.com/openai/codex/commit/582569998181aad08a88bacc151a94b2048a5d1f)
- [Qwen Code current MCP](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/mcp.md)
- [Kimi Code current MCP](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/customization/mcp.md)
- [Qoder CLI MCP servers](https://docs.qoder.com/en/cli/mcp-servers)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)

## 关联能力

- [插件分发](./extension-plugins.md)
- [生命周期 Hooks](./extension-hooks.md)
- [交互审批](../security/security-approval.md)
