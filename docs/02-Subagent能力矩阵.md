# Subagent 能力矩阵

[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#subagents)

## 定义与调用

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| 内置 Agent | Explore、Plan、general-purpose | default、worker、explorer | general-purpose、Explore | coder、explore、plan | general-purpose、Explore、Plan；另有条件 Agent |
| 管理入口 | 编辑 `.claude/agents/`；`/agents` 给出管理指引 | `/agent`、`/subagents` | `/agents manage`、`/agents create` | 配置文件；`/swarm` 是多代理模式 | `/agents`、`/agents reload`、`qodercli agents list` |
| 自动委派 | 依据请求任务描述、`description` 与当前上下文自动委派；全部 `description` 合计超 15000 token 只启动告警；`permissions.deny` 拒绝 `Agent` 可全禁 | 本地版本（CLI、应用、IDE）只在直接请求或适用的 `AGENTS.md`、Skill 指令要求时委派；Web 端 ChatGPT Work 只在 Ultra 档位主动委派 | 依据请求任务描述、`description`、当前上下文与可用工具主动委派；Fork 由模型按需自动使用；单个 `description` 超 1000 字符为软告警 | 2.3.2（2026-10-25）起默认不主动派发，需用户显式要求、点名类型、`AGENTS.md` 或 Skill 指令、已开启的 swarm/tower 模式；`description` 与 `whenToUse` 只用于授权后选型；`AgentSwarm` 仅 swarm mode 开启时运行，否则拒绝 | 把任务描述与各 Subagent 的 `description` 匹配做隐式选择；派发未指定类型时默认 `general-purpose`；官方建议先显式点名验证 |
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
| 后台运行 | 默认后台；Fork 模式开启时 Fork 与命名 Subagent 一律后台、Claude 不能请求前台（交互会话 v2.1.232 起，`claude -p`、Agent SDK、桌面端与 VS Code v2.1.302 起） | 官方不区分前后台；并行派生后等全部结果再合并回复 | 顶层命名 Agent 默认后台、经完成通知回传 | `Agent` 的 `run_in_background` 默认 `false`；设 `true` 后立即返回任务 ID、完成时以合成 User 消息回到 main agent | `background` 决定默认后台，需先启用后台 Subagent 会话 |
| 前台运行 | Fork 模式关闭时由 Claude 按需选择；`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 与 Agent Team 队友派生一律前台 | 官方不区分前后台 | `run_in_background: false` 改为 inline；外部执行器与调用方自有 `working_dir` 固定前台 | 默认即前台，父 Agent 等待 subagent 完成再继续 | 官方只记录 `background` 为 Boolean、没有给出默认值；启用后台会话的开关未确认 |
| 恢复 Agent | 支持恢复 | `/agent` 检查和切换线程 | 任务列表与 UI 状态；Fork 独立 | Agent 实例可恢复 | 支持任务与 Agent 管理 |
| 并行执行 | 支持；单会话默认 20 个并发上限，`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` 可改、ultracode 会话豁免 | `max_concurrent_threads_per_session`（官方未公布默认值） | 支持多个命名 Agent；官方文档没有并发 Subagent 上限 | 支持；`AgentSwarm` 至多 128 个 subagent 并等全部完成 | 支持；`QODER_CLI_MAX_CONCURRENT_SUBAGENTS`（CLI 1.1.31 起，未公布默认值） |
| 查看与停止 | `/tasks`；`Ctrl+B` 把运行中任务转后台 | CLI `/subagents` 切换线程；网页侧栏 **Subagents** 只读 Active/Done；IDE background-agent 面板可停止 | `/tasks`；`list_agents` 与 `send_message` | `/tasks`（别名 `/task`）；`Ctrl+B` 转后台（0.19.0 起）；模型侧 `TaskList`/`TaskOutput`/`TaskStop`/`WaitFor` | `/tasks` 查看状态与结果或在运行中停止 |

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
| 全局并发与嵌套 | 并发 20 · 会话 200 · 嵌套 3 层 | `max_concurrent_threads_per_session`（旧别名 `max_threads`） | 官方文档没有并发 Subagent 上限；完成通知队列上限 20 条 | `[background] max_running_tasks` 与 `KIMI_CODE_BACKGROUND_MAX_RUNNING_TASKS`（不设即无上限）· `KIMI_CODE_AGENT_SWARM_MAX_CONCURRENCY` 限 swarm ramp 并发 | `QODER_CLI_MAX_CONCURRENT_SUBAGENTS`（CLI 1.1.31 起，默认值未公布） |

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
- [Claude Code Subagents 的 “Understand automatic delegation” 一节与内置 Subagent 限制清单（15000 token 描述告警、`permissions.deny` 拒绝 `Agent`、`CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS`、`CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS`）](https://code.claude.com/docs/en/sub-agents#understand-automatic-delegation)
- [Claude Code v2.1.232 更新日志（Subagent Fork 默认开启）](https://github.com/anthropics/claude-code/blob/1f6015b5d578/CHANGELOG.md)
- [Claude Code model configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code settings reference](https://code.claude.com/docs/en/settings-reference)
- [Claude Code environment variables](https://code.claude.com/docs/en/env-vars)
- [Claude Code v2.1.292 更新日志（Agent 工具 `effort` 参数）](https://github.com/anthropics/claude-code/blob/fbe20e00e285/CHANGELOG.md)
- [Claude Code Workflows（workflow agent 的模型解析）](https://code.claude.com/docs/en/workflows)
- [Claude Code v2.1.296 更新日志（`CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL`）](https://github.com/anthropics/claude-code/blob/2301018b1f61073c501a8e7a4813ef48c239163b/CHANGELOG.md)
- [Claude Code Subagents 的 “Run subagents in foreground or background” 与并发上限段](https://code.claude.com/docs/en/sub-agents#run-subagents-in-foreground-or-background)
- [Claude Code v2.1.302 更新日志（Fork 在 `claude -p`、Agent SDK、桌面端与 VS Code 默认开启，桌面端与 VS Code 一律后台）](https://github.com/anthropics/claude-code/blob/c017428c8c27e604840435048d5bce6a9a22c040/CHANGELOG.md)
- [Codex Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Codex Subagents 的 “Triggering subagent workflows” 一节（按 web、app、cli、ide 四组给出不同正文；本地版本只在直接请求或 `AGENTS.md`、Skill 指令要求时委派，Web 端只 Ultra 档位主动委派）](https://learn.chatgpt.com/docs/agent-configuration/subagents#triggering-subagent-workflows)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Subagent activity 记录解析后模型与推理强度的提交](https://github.com/openai/codex/commit/b0a6b8d86f455d3db9dd869fc1178a5fbd865e7f)
- [Qwen Code Subagents](https://github.com/QwenLM/qwen-code/blob/412eae24b48ff16f54166c2b17eb4d4a9cdcdd1e/docs/users/features/sub-agents.md)
- [Qwen Code v0.25.1-preview.2 Subagents 的 Model Selection 小节](https://github.com/QwenLM/qwen-code/blob/d381509d32e62a992a344de33207d54f436bcefc/docs/users/features/sub-agents.md)
- [Qwen Code Subagents 文档（main 分支 `97925919acb9`，后台默认值、外部执行器前台、调用方自有 `working_dir` 与通知队列上限）](https://github.com/QwenLM/qwen-code/blob/97925919acb92b089d817991bfefe4545601c8f6/docs/users/features/sub-agents.md)
- [Qwen Code Subagents 文档在 stable 标签 v0.25.2 下的同一文件（证明上述后台行为已发布）](https://github.com/QwenLM/qwen-code/blob/8a415cb628db88844e0196bdfdcce83b4f88d812/docs/users/features/sub-agents.md)
- [Qwen Code Subagents 文档在 stable 标签 v0.26.1 下的同一文件（“Automatic Delegation”、“When Fork is Used”、“Recursive Delegation Prevention” 与 “Limits” 四节；与核对日期 main 逐字节相同）](https://github.com/QwenLM/qwen-code/blob/b475278c4a300acebe6cfc990a9e1b1d18819bfc/docs/users/features/sub-agents.md)
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
- [Kimi Code 工具文档（main 分支 `4a82a07f08d0`，`Agent` 的 `run_in_background` 默认 false、`AgentSwarm` 128 个上限与 ramp 并发、`TaskList`/`TaskOutput`/`TaskStop`/`WaitFor`）](https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/reference/tools.md)
- [Kimi Code 工具文档在 Release 2.2.0 下的同一文件（证明上述后台与并发行为已发布）](https://github.com/MoonshotAI/kimi-code/blob/472192c34c1efad89a369870eff0da0b708ce9bb/docs/zh/reference/tools.md)
- [Kimi Code 配置文档（main 分支 `4a82a07f08d0`，`[background]`、`[subagent]` 与 `[swarm]` 三节）](https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/configuration/config-files.md)
- [Kimi Code 环境变量文档（main 分支 `4a82a07f08d0`，后台与 subagent 相关变量）](https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/configuration/env-vars.md)
- [Kimi Code Agents 文档（main 分支 `4a82a07f08d0`，后台运行、并行与状态存储）](https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/customization/agents.md)
- [Kimi Code 官方变更记录（main 分支 `4a82a07f08d0`，后台与并行时间线 0.14.1–0.43.0）](https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/release-notes/changelog.md)
- [Kimi Code Slash 命令表（main 分支 `4a82a07f08d0`，`/tasks` 别名 `/task`）](https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/reference/slash-commands.md)
- [Kimi Code 交互指南（main 分支 `4a82a07f08d0`，`Ctrl+B` 只覆盖命令）](https://github.com/MoonshotAI/kimi-code/blob/4a82a07f08d0b135c4349c20aae53a2d51e5c3fa/docs/zh/guides/interaction.md)
- [Kimi Code `apps/kimi-code/CHANGELOG.md`（2.3.2 标签提交 `b8dd3a134060`，2.3.2 段只有「默认不主动派发」与「swarm 只由用户开启」两条）](https://github.com/MoonshotAI/kimi-code/blob/b8dd3a134060c6e80ba4a1659335cd63b68483f2/apps/kimi-code/CHANGELOG.md)
- [Kimi Code 提交 `fd2e2c7e2a36`（PR #4386 “launch subagents only on explicit request”：`agent.md`、`system.md`、Plan 模式工具描述、swarm 退出提醒与 `explore` 档 `whenToUse` 五处提示词改动）](https://github.com/MoonshotAI/kimi-code/commit/fd2e2c7e2a3672dda91365d66b2ba74a1630521e)
- [Kimi Code 提交 `c9a48369843f`（PR #4384 “leave swarm mode to the user”：`AgentSwarm` 的三处代码硬门禁与中英文工具、Slash 命令文档同步）](https://github.com/MoonshotAI/kimi-code/commit/c9a48369843fdee1b494b9d49b1f4b3aeee73497)
- [Kimi Code `agent.md`（2.3.3 标签提交 `ec495f0cb00f`，`Agent` 工具描述基串与显式请求门禁全文）](https://github.com/MoonshotAI/kimi-code/blob/ec495f0cb00f6db9a9118bf979112886f4264a41/packages/agent-core-v2/src/agent/tools/agent/agent.md)
- [Kimi Code `agentProfileCatalog/system.md`（2.3.3 标签提交 `ec495f0cb00f`，主 Agent 系统提示词第 25 行的派发门禁）](https://github.com/MoonshotAI/kimi-code/blob/ec495f0cb00f6db9a9118bf979112886f4264a41/packages/agent-core-v2/src/app/agentProfileCatalog/system.md)
- [Kimi Code `agentTool.ts`（2.3.3 标签提交 `ec495f0cb00f`，`agent.md?raw` 为描述基串，`buildProfileDescriptions()` 把 `description` 与 `whenToUse` 拼成类型清单行）](https://github.com/MoonshotAI/kimi-code/blob/ec495f0cb00f6db9a9118bf979112886f4264a41/packages/agent-core-v2/src/agent/tools/agent/agentTool.ts)
- [Kimi Code 中文工具文档（2.3.3 标签提交 `ec495f0cb00f`，`AgentSwarm` 默认审批改为“自动放行；仅在 swarm mode 中可用”）](https://github.com/MoonshotAI/kimi-code/blob/ec495f0cb00f6db9a9118bf979112886f4264a41/docs/zh/reference/tools.md)
- [Kimi Code 中文 Agents 文档（2.3.3 标签提交 `ec495f0cb00f`，仍写“subagent 由 main agent 自动调度……无需用户手动指定”，与同标签下的工具描述和变更记录不一致）](https://github.com/MoonshotAI/kimi-code/blob/ec495f0cb00f6db9a9118bf979112886f4264a41/docs/zh/customization/agents.md)
- [Kimi Code 中文环境变量文档（2.3.3 标签提交 `ec495f0cb00f`，没有控制主 Agent 是否主动派发的开关）](https://github.com/MoonshotAI/kimi-code/blob/ec495f0cb00f6db9a9118bf979112886f4264a41/docs/zh/configuration/env-vars.md)
- [Kimi Code 2.3.3 Release（2026-10-26T13:22:15Z，被拒的 `AgentSwarm` 不再显示为失败 swarm、`/swarm` 开启时显示高用量告警）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.3.3)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)
- [Qoder CLI Subagent 的 “Implicit Invocation” 一节与字段表（`description` 用于选择、未指定类型默认 `general-purpose`、最佳实践建议先显式点名）](https://docs.qoder.com/en/cli/subagent#implicit-invocation)
- [Qoder CLI Release Notes（最新条目 CLI 1.1.78、October 23, 2026，无 Subagent 选择或委派条目）](https://docs.qoder.com/release-notes/qoder-cli)
- [Qoder CLI Parallel Tasks（Background Agents / Tasks 与 `/tasks`）](https://docs.qoder.com/cli/parallel-tasks)
- [Qoder CLI 设置参考（没有任何含 background 的设置键，`agents` 组只有 `agents.overrides`）](https://docs.qoder.com/cli/settings-reference)
- [Qoder CLI Release Notes（1.1.31 的 `QODER_CLI_MAX_CONCURRENT_SUBAGENTS` 与 0.1.43 的并发审批排队）](https://docs.qoder.com/release-notes/qoder-cli)
