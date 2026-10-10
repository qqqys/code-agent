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
| 初始上下文 | 父任务传入的任务描述；可预载 Skills；Fork 继承完整对话与提示词缓存（v2.1.232 起交互会话默认开启） | 父任务与委派描述 | 命名 Agent 使用任务提示；Fork 可继承全部或最近若干轮 | 只接收任务提示；实验开关开启后 `fork` 参数可以调用方对话快照启动（v2 引擎，合入 main 尚未发布） | 任务提示，可配置 `initialPrompt` |
| Fork 会话 | `/fork` 创建独立后台会话 | `/fork` 创建会话副本 | Fork Agent 继承父上下文 | `/fork` 创建副本；fork 后停留原会话 | 未确认 Slash Fork |
| 结果回传 | 返回父会话 | 返回主线程汇总 | 命名 Agent 返回；Fork 不自动回传给父模型 | 返回父会话 | 返回父会话 |
| 后台运行 | 支持；Fork 模式开启时 Fork 与命名 Subagent 统一后台（v2.1.232 起交互会话默认开启） | 支持并发线程 | 命名 Agent 默认后台；可设前台 | 支持后台 | `background` 可配置 |
| 前台运行 | 支持；`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 强制前台 | 支持 | `run_in_background: false` | 支持 | `background: false` |
| 恢复 Agent | 支持恢复 | `/agent` 检查和切换线程 | 任务列表与 UI 状态；Fork 独立 | Agent 实例可恢复 | 支持任务与 Agent 管理 |
| 并行执行 | 支持 | `max_concurrent_threads_per_session` | 支持多个命名 Agent | 支持；另有 `/swarm` | 支持 |

## 模型、工具与扩展

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| Agent 单独选模型 | `model`：`sonnet`/`opus`/`haiku`/`fable`、完整模型 ID 或 `inherit`；顺序为每次调用 `model` → frontmatter → `CLAUDE_CODE_SUBAGENT_MODEL` → 主会话模型；`CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` 强制统一（v2.1.257）；v2.1.296 另加只统一 workflow agent 的 `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` | `model`；顺序为显式 spawn 值 → `agents.default_subagent_model` → 父会话值，Agent 文件写了 `model` 时文件值最后覆盖 | `model`：inherit、fast、modelId、authType:modelId 或 `modelGrades` 名称；`agents.builtin.exploreModel` 单独覆盖内置 Explore | `[secondary_model]` 池别名、保留值 `"primary"`、`force = true` 固定到 `default_model`；模型池自 0.42.0 起始终开启，无需开关 | `model`：任意模型名或 `inherit`、`auto`、`lite`、`efficient`、`performance` 别名；省略即 `inherit` |
| Agent 单独设推理强度 | `effort`；Agent 工具调用参数 `effort`（v2.1.292） | `model_reasoning_effort`、`[agents] default_subagent_reasoning_effort` 全局默认 | 未确认独立字段 | `[secondary_model] default_effort` 节级档位、`[models.<alias>.overrides] default_effort` 变体；Agent 文件 frontmatter 无 effort 字段 | `effort` |
| 工具白名单 | `tools` | 由 Agent 配置和沙箱控制 | `tools`；Fork 可用 `fork_tools` 限制执行 | `tools` | `tools` |
| 工具黑名单 | `disallowedTools` | 未确认独立 `disallowedTools` 字段 | `disallowedTools` | `disallowedTools` | `disallowedTools` |
| MCP 范围 | `mcpServers`；工具规则可继续收窄 | `mcp_servers` | `mcpServers`；工具规则可继续收窄 | 通过工具列表控制 | `mcpServers` |
| 预载 Skills | `skills` | `skills.config` | 可调用 Skill；未确认独立预载字段 | 可调用 Skill；未确认独立预载字段 | `skills` |
| Agent Hooks | `hooks` | 未确认独立字段；Hooks 为全局 `/hooks` | `hooks`；v1 在 Agent 运行期按会话注册 | 无独立字段；Hooks 在全局 `config.toml` | `hooks` |
| Agent 持久记忆 | `memory` | 主产品 Memories；Agent 独立记忆字段未确认 | 未确认独立字段 | 未确认独立字段 | `memory` |
| 最大轮数 | `maxTurns` | 未确认独立字段 | `maxTurns` | Agent 定义无独立字段 | `maxTurns` |
| 超时 | 未确认独立字段 | 未确认独立字段 | 未确认独立字段 | `[subagent] timeout_ms`（默认 2 h）；AgentSwarm 自 0.39.0 起用相互独立的 `[swarm] timeout_ms`（默认同为 2 h） | `timeoutMins` |
| 全局并发与嵌套 | 并发 20 · 会话 200 · 嵌套 3 层 | `max_concurrent_threads_per_session` | 未确认独立全局并发字段 | 未确认独立全局并发字段 | 未确认独立全局并发字段 |

## 权限、嵌套与工作区

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 权限继承 | 默认继承父会话；可设 `permissionMode` | 继承父会话沙箱和权限 | 父会话宽松模式优先 | 继承主会话权限 | 省略时继承；宽松父模式可限制子 Agent 变严格 |
| Agent 单独权限模式 | `permissionMode` | `sandbox_mode`；审批仍受会话控制 | `approvalMode` | 未提供独立权限字段 | `permissionMode` |
| 嵌套派生 | 默认最多 3 层；可限制可派生 Agent | 当前 Subagent 页面未确认 | 命名 Agent 受工具规则控制；Fork 禁止递归 Fork | 内置 coder 默认不可嵌套（0.35.0 起移除 `Agent`/`AgentSwarm`）；自定义 Agent 用 `subagents` 限制，显式列工具可恢复 | Agent 工具可嵌套并支持 `Agent(name)` |
| 嵌套白名单 | 可通过工具与 Agent 配置约束 | 未确认 | 工具规则约束 | `subagents` | `Agent(name)` |
| 禁止嵌套 | 移除相关 Agent 工具 | 未确认 | 禁用 Agent 工具；Fork 固定禁止递归 Fork | `subagents` 留空或禁用 Agent 工具；0.35.0 起内置 coder 默认不含 `Agent` 工具 | 禁用 Agent 工具 |
| Worktree 隔离 | `isolation: worktree` | Subagent 页面未确认 | Agent 调用可设 `isolation: "worktree"`；Fork 不支持 | Agent 页面未确认 | `isolation: worktree` |
| Worktree 生命周期 | 无差异时清理，有差异时保留 | 未确认 | 无差异时清理，有差异时保留 | 未确认 | 由 Agent 隔离机制管理 |
| 非交互审批失败行为 | 取决于调用入口和权限模式 | 无法向用户展示的审批会失败并返回错误 | 取决于 approvalMode | 继承主会话权限 | 取决于 permissionMode |

## 来源

- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code v2.1.232 更新日志（Subagent Fork 默认开启）](https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code v2.1.292 更新日志（Agent 工具 `effort` 参数）](https://github.com/anthropics/claude-code/blob/fbe20e00e285/CHANGELOG.md)
- [Claude Code Workflows（workflow agent 的模型解析）](https://code.claude.com/docs/en/workflows)
- [Claude Code v2.1.296 更新日志（`CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL`）](https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md)
- [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Subagent activity 记录解析后模型与推理强度的提交](https://github.com/openai/codex/commit/b0a6b8d86f455d3db9dd869fc1178a5fbd865e7f)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)
- [Qwen Code v0.25.1-preview.2 Subagents 的 Model Selection 小节](https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/docs/users/features/sub-agents.md)
- [Qwen Code Worktree](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/worktree.md)
- [Kimi Code Agents](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/customization/agents.md)
- [Kimi Code subagent and secondary model configuration](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/configuration/config-files.md)
- [Kimi Code Slash 命令参考（`/secondary-model`）](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/reference/slash-commands.md)
- [Kimi Code 官方变更记录](https://github.com/MoonshotAI/kimi-code/blob/c9f01f07388abc2cdca40c9c5267f58c65086710/docs/zh/release-notes/changelog.md)
- [Kimi Code 移除 Subagent 模型池实验开关的提交](https://github.com/MoonshotAI/kimi-code/commit/e831fd1ea9488ad5192bcc9d96579470cf0c4442)
- [Kimi Code 删除旧版 agent-core v1 包的提交](https://github.com/MoonshotAI/kimi-code/commit/bb16383aa15f72954224d37ee0b9babb807e03b3)
- [Kimi Code swarm 超时提交](https://github.com/MoonshotAI/kimi-code/commit/496bb6ce4e555c11304074c31312c01edf4d773a)
- [Kimi Code swarm 超时配置文档](https://github.com/MoonshotAI/kimi-code/blob/496bb6ce4e555c11304074c31312c01edf4d773a/docs/zh/configuration/config-files.md)
- [Kimi Code swarm 超时 changeset](https://github.com/MoonshotAI/kimi-code/blob/496bb6ce4e555c11304074c31312c01edf4d773a/.changeset/swarm-timeout-config.md)
- [Kimi Code Subagent fork 参数提交](https://github.com/MoonshotAI/kimi-code/commit/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb)
- [Kimi Code Subagent fork 环境变量文档](https://github.com/MoonshotAI/kimi-code/blob/f6736d7c0de609d44ed1cb761cfe9f195c4d94fb/docs/zh/configuration/env-vars.md)
- [Kimi Code Subagent 模型池提交](https://github.com/MoonshotAI/kimi-code/commit/c9bfe8b2c8314ba4ef8806fb3b92ac654c1d1860)
- [Kimi Code 0.36.0 发布说明](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.36.0)
- [Kimi Code coder profile Agent tool removal commit](https://github.com/MoonshotAI/kimi-code/commit/101c4d199746bf2ed4f26375b65a6fcb6cba2a60)
- [Kimi Code 0.35.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.35.0)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)
