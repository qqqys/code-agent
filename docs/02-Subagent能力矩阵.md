# Subagent 能力矩阵

[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#subagents)

## 定义与调用

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 内置 Agent | Explore、Plan、general-purpose | default、worker、explorer | general-purpose、Explore | coder、explore、plan | general-purpose、Explore、Plan；另有条件 Agent |
| 管理入口 | 编辑 `.claude/agents/`；`/agents` 给出管理指引 | `/agent`、`/subagents` | `/agents manage`、`/agents create` | 配置文件；`/swarm` 是多代理模式 | `/agents`、`/agents reload`、`qodercli agents list` |
| 自动委派 | 根据 `description` 判断 | 根据请求、项目指令或 Skill 判断 | 根据 `description` 判断 | 根据 `description`、`whenToUse` 判断 | 根据 `description` 判断 |
| 显式调用 | 在提示词中点名；`/subtask` | 在提示词中要求；切换 `/agent` 查看 | 在提示词中点名 | 在提示词中点名 | 在提示词中点名或 `@name` |
| 配置格式 | Markdown + YAML | TOML | Markdown + YAML | Markdown + YAML | Markdown + YAML；`--agents` JSON |
| 项目级目录 | `.claude/agents/` | `.codex/agents/` | `.qwen/agents/` | `.kimi-code/agents/`、`.agents/agents/` | `.qoder/agents/` |
| 用户级目录 | `~/.claude/agents/` | `~/.codex/agents/` | `~/.qwen/agents/` | `$KIMI_CODE_HOME/agents/`、`~/.agents/agents/` | `~/.qoder/agents/` |
| 插件或扩展分发 | 插件 Agent | 未确认独立插件 Agent 目录 | 扩展 Agent | 额外 Agent 目录 | 插件 Agent |
| 命令行临时定义 | `--agents` | 未确认 | 未确认 | `--agent-file` | `--agents` JSON |

## 上下文与结果

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 独立上下文 | 是 | 是 | 命名 Agent 是 | 是 | 是 |
| 初始上下文 | 父任务传入的任务描述；可预载 Skills | 父任务与委派描述 | 命名 Agent 使用任务提示；Fork 可继承全部或最近若干轮 | 只接收任务提示 | 任务提示，可配置 `initialPrompt` |
| Fork 会话 | `/fork` 创建独立后台会话 | `/fork` 创建会话副本 | Fork Agent 继承父上下文 | `/fork` | 未确认 Slash Fork |
| 结果回传 | 返回父会话 | 返回主线程汇总 | 命名 Agent 返回；Fork 不自动回传给父模型 | 返回父会话 | 返回父会话 |
| 后台运行 | 支持 | 支持并发线程 | 命名 Agent 默认后台；可设前台 | 支持后台 | `background` 可配置 |
| 前台运行 | 支持 | 支持 | `run_in_background: false` | 支持 | `background: false` |
| 恢复 Agent | 支持恢复 | `/agent` 检查和切换线程 | 任务列表与 UI 状态；Fork 独立 | Agent 实例可恢复 | 支持任务与 Agent 管理 |
| 并行执行 | 支持 | `max_concurrent_threads_per_session` | 支持多个命名 Agent | 支持；另有 `/swarm` | 支持 |

## 模型、工具与扩展

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| Agent 单独选模型 | `model` | `model` | `model`：inherit、fast、modelId 或 authType:modelId | `model_preference`：`primary`、`secondary`（实验性） | `model` |
| Agent 单独设推理强度 | `effort` | `model_reasoning_effort` | 未确认独立字段 | 未确认独立 `effort` 字段 | `effort` |
| 工具白名单 | `tools` | 由 Agent 配置和沙箱控制 | `tools` | `tools` | `tools` |
| 工具黑名单 | `disallowedTools` | 未确认独立 `disallowedTools` 字段 | `disallowedTools` | `disallowedTools` | `disallowedTools` |
| MCP 范围 | `mcpServers`；工具规则可继续收窄 | `mcp_servers` | `mcpServers`；工具规则可继续收窄 | 通过工具列表控制 | `mcpServers` |
| 预载 Skills | `skills` | `skills.config` | 可调用 Skill；未确认独立预载字段 | 可调用 Skill；未确认独立预载字段 | `skills` |
| Agent Hooks | `hooks` | 未确认 Agent 独立 Hooks | `hooks`；v1 在 Agent 运行期按会话注册 | 未确认 | `hooks` |
| Agent 持久记忆 | `memory` | 主产品 Memories；Agent 独立记忆字段未确认 | 未确认独立字段 | 未确认独立字段 | `memory` |
| 最大轮数 | `maxTurns` | 未确认独立字段 | `maxTurns` | Agent 定义无独立字段 | `maxTurns` |
| 超时 | 未确认独立字段 | 未确认独立字段 | 未确认独立字段 | 全局 `[subagent] timeout_ms`（默认 2 h） | `timeoutMins` |
| 全局并发与嵌套 | 并发 20 · 会话 200 · 嵌套 3 层 | `max_concurrent_threads_per_session` | 未确认独立全局并发字段 | 未确认独立全局并发字段 | 未确认独立全局并发字段 |

## 权限、嵌套与工作区

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 权限继承 | 默认继承父会话；可设 `permissionMode` | 继承父会话沙箱和权限 | 父会话宽松模式优先 | 继承主会话权限 | 省略时继承；宽松父模式可限制子 Agent 变严格 |
| Agent 单独权限模式 | `permissionMode` | `sandbox_mode`；审批仍受会话控制 | `approvalMode` | 未提供独立权限字段 | `permissionMode` |
| 嵌套派生 | 默认最多 3 层；可限制可派生 Agent | 当前 Subagent 页面未确认 | 命名 Agent 受工具规则控制；Fork 禁止递归 Fork | coder 可嵌套；自定义 Agent 用 `subagents` 限制 | Agent 工具可嵌套并支持 `Agent(name)` |
| 嵌套白名单 | 可通过工具与 Agent 配置约束 | 未确认 | 工具规则约束 | `subagents` | `Agent(name)` |
| 禁止嵌套 | 移除相关 Agent 工具 | 未确认 | 禁用 Agent 工具；Fork 固定禁止递归 Fork | `subagents` 留空或禁用 Agent 工具 | 禁用 Agent 工具 |
| Worktree 隔离 | `isolation: worktree` | Subagent 页面未确认 | Agent 调用可设 `isolation: "worktree"`；Fork 不支持 | Agent 页面未确认 | `isolation: worktree` |
| Worktree 生命周期 | 无差异时清理，有差异时保留 | 未确认 | 无差异时清理，有差异时保留 | 未确认 | 由 Agent 隔离机制管理 |
| 非交互审批失败行为 | 取决于调用入口和权限模式 | 无法向用户展示的审批会失败并返回错误 | 取决于 approvalMode | 继承主会话权限 | 取决于 permissionMode |

## 来源

- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Codex Subagents](https://developers.openai.com/codex/subagents)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sub-agents.md)
- [Qwen Code Worktree](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/worktree.md)
- [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/main/docs/zh/customization/agents.md)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)
