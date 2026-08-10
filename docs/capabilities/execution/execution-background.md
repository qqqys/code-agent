# 后台任务

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-background)

> 核对日期：2026-08-10

## 定义

让 Shell、Agent 或监视器脱离当前阻塞调用继续运行，并提供查看输出、停止和完成通知。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/background` · `/tasks` · `Monitor` | 官方确认 |
| Codex | `/ps` · `/stop` | 官方确认 |
| Qwen Code | `is_background` · `Ctrl+B` · `/tasks` | 源码确认 |
| Kimi Code | `run_in_background` · `/tasks` | 源码确认 |
| Qoder CLI | `/tasks` · `TaskOutput` · `TaskStop` | 官方确认 |

## 比较边界

### 本页包含

- 后台 Shell 与前台转后台
- 后台 Agent、任务列表和输出读取
- 精确停止、超时与完成通知

### 本页不包含

- 跨会话定时任务
- 云端异步任务平台
- 仅把命令末尾加 `&` 的非托管进程

## 跨产品事实

1. 五家都能管理后台工作，但对象不同：Codex 公开的是后台终端，Claude、Qwen、Kimi、Qoder 还把 Agent 或任务输出纳入统一面板。
2. Qwen Code 支持 `Ctrl+B` 把已经运行的前台 Shell 提升为后台任务；Kimi Code 的前台 Bash 超时默认也会转后台继续。
3. 后台不等于无人监管：TaskOutput、任务日志、完成通知、超时和精确停止共同决定任务是否可控。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/background` · `/tasks` · `Monitor` |
| 入口与工具 | `/background [prompt]` 把整个当前会话分离成后台 Agent；`/tasks` 查看当前会话的后台工作；模型也可启动后台 Bash/Agent。 |
| 核心机制 | `TaskList`、`TaskStop` 与已弃用的 `TaskOutput`；完整输出优先从任务文件读取；`Monitor` 持续观察事件流。 |
| 执行行为 | 分离后的会话释放当前终端，可用 `claude agents` 观察；普通后台任务完成后状态回到会话。Monitor 可在日志、PR 或 CI 变化时主动插入事件。 |
| 运行范围 | 绑定当前会话和宿主环境；恢复会话时普通进程能否继续取决于进程生命周期。 |
| 后台与并发 | Bash、Subagent 和 Monitor 都可后台运行；Agent frontmatter 也可声明 `background: true`。 |
| Git 与平台联动 | 任务面板、状态栏和权限规则共用；Monitor 复用 Bash allow/deny。 |
| 状态与产物 | 任务状态与输出文件可供后续 Read；进程产生的文件保留在工作区。 |
| 条件与边界 | Monitor 对部分托管 Provider 或禁用非必要流量的环境不可用。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)、[Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/ps` · `/stop` |
| 入口与工具 | `/ps` 显示后台终端及近期输出，`/stop` 停止当前会话的全部后台终端。 |
| 核心机制 | 统一 PTY 执行通道可保留长进程；命令管理入口面向终端进程而不是独立任务数据库。 |
| 执行行为 | Agent 可以在长命令运行时继续处理其他工作，并从终端输出检查进度。 |
| 运行范围 | 后台终端属于当前本地线程和工作目录；Cloud task 是另一种远端异步 Surface。 |
| 后台与并发 | 支持多个后台终端；`/stop` 是全停，不是按任务 ID 选择停止。 |
| Git 与平台联动 | 桌面 App 与 CLI 都可显示终端活动，但命令集合可能不同。 |
| 状态与产物 | 近期输出可从 `/ps` 查看；进程产生的文件留在当前工作区。 |
| 条件与边界 | 公开命令表没有与 Claude/Qwen/Kimi 相同的 TaskOutput 或后台 Agent 任务面板语义。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Documentation](https://developers.openai.com/codex) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `is_background` · `Ctrl+B` · `/tasks` |
| 入口与工具 | Shell 参数 `is_background: true`、TUI 运行中 `Ctrl+B`、Agent `run_in_background: true`；`/tasks` 查看。 |
| 核心机制 | `task_list`、`task_stop`、后台 Shell Registry、后台 Agent Registry 与 `monitor`。 |
| 执行行为 | 后台启动立即返回 ID；完成时发送通知。前台 Shell 可无重启地转入同一任务管理路径。 |
| 运行范围 | 任务绑定当前会话和 workspace；新建/清空会话前必须处理仍在运行的后台工作。 |
| 后台与并发 | Shell、Agent、Fork 与 Monitor 可并行；并发上限和 Agent 类型规则继续生效。 |
| Git 与平台联动 | Footer pill、任务对话框和 `/tasks` 展示 Shell 与 Agent；日志可继续读取。 |
| 状态与产物 | 后台输出持久到项目临时任务目录，任务结束后仍可检查；工作区修改直接保留。 |
| 条件与边界 | 后台 Shell 禁止 `git commit`；裸 `&` 会被受管后台路径拒绝或剥离。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current shell tool](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/shell.ts)、[Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `run_in_background` · `/tasks` |
| 入口与工具 | `Bash.run_in_background`、`Agent.run_in_background` 或后台 AskUserQuestion；`/tasks` 打开任务浏览器。 |
| 核心机制 | `TaskList`、`TaskOutput`、`TaskStop`；Bash/Agent/问题任务共用任务服务。 |
| 执行行为 | 立即返回 task id，终态自动通知主 Agent；TaskOutput 可阻塞等待最多 3600 秒。 |
| 运行范围 | 任务状态与输出保存在当前会话目录；后台 Agent 有独立上下文。 |
| 后台与并发 | Bash 默认 10 分钟、Agent 默认 2 小时；print 模式两者默认无超时，可在配置中调整。 |
| Git 与平台联动 | TUI、Web、SDK 都能显示或轮询任务状态；完整日志路径可交给 Read。 |
| 状态与产物 | TaskOutput 内联最近 32 KB，完整日志落盘；任务修改留在工作目录。 |
| 条件与边界 | 停止后台任务需要审批；Plan 模式会拦截 TaskStop。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)、[Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/tasks` · `TaskOutput` · `TaskStop` |
| 入口与工具 | `/tasks` 查看后台任务；模型可用 `TaskOutput` 读取结果、`TaskStop` 停止。 |
| 核心机制 | 内置工具表包含 TaskOutput、TaskStop；后台 Shell 或 Agent 的具体启动参数由当前 CLI 版本暴露。 |
| 执行行为 | 后台工作不阻塞主会话，可从任务界面查看状态和输出。 |
| 运行范围 | 任务属于当前本地会话、Worktree Job 或 Cloud session。 |
| 后台与并发 | Shell、Subagent 与远端 Job 都能形成长任务，但三者的生命周期和存储位置不同。 |
| Git 与平台联动 | TUI 任务面板、Agent SDK 工具输出与 Cloud Web console 分别提供观察入口。 |
| 状态与产物 | 输出和文件保留在对应执行环境；任务记录可供会话继续读取。 |
| 条件与边界 | Task 工具可被权限或 Agent 工具列表禁用；Cloud Mode 需要远端环境和账号权限。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command)、[Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)、[Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli) |

## 官方来源

- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Documentation](https://developers.openai.com/codex)
- [Qwen Code current shell tool](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/shell.ts)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)
- [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)

## 关联能力

- [Shell 执行](./execution-shell.md)
- [后台与并行](../subagents/agent-background.md)
- [任务列表](../commands/cmd-tasks.md)
