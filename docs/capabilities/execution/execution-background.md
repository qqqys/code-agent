# 后台任务

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-background)

> 核对日期：2026-08-25

## 定义

让 Shell、Agent 或监视器脱离当前阻塞调用继续运行，并提供查看输出、停止和完成通知。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/background` · `/tasks` · `Monitor` | 官方确认 |
| Codex | `/ps` · `/stop` | 官方确认 |
| Qwen Code | `is_background` · `Ctrl+B` · `/tasks` | 源码确认 |
| Kimi Code | `run_in_background` · `/tasks` · `WaitFor` 回合内等待（0.38.0 起）；条件：`/tasks` 后台 Agent 实时活动（0.35.0 起） | 源码确认 |
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
4. Kimi Code 的后台 Agent 输出原在任务终态时一次性捕获，完成前输出视图显示 `[no output captured]`；0.35.0 起 `/tasks` 预览窗格改为实时显示步骤级活动，活动记录只保存在内存、上限最近 20 步，不落盘。
5. Kimi Code 0.38.0 起提供 `WaitFor` 工具：模型在当前回合内挂起等待后台任务（子 Agent、后台 Bash、后台提问）结束，而不是结束回合等待重新调用；其余四家当前一手资料未列出同类专门的回合内等待工具。

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
| 矩阵结论 | `run_in_background` · `/tasks` · `WaitFor` 回合内等待（0.38.0 起）；条件：`/tasks` 后台 Agent 实时活动（0.35.0 起） |
| 入口与工具 | `Bash.run_in_background`、`Agent.run_in_background` 或后台 AskUserQuestion；`/tasks` 打开任务浏览器。0.38.0 起新增 `WaitFor` 工具，模型可在当前回合内等待后台任务结束。条件：0.35.0 起 `/tasks` 预览窗格实时显示后台 Agent（`run_in_background` 或 `Ctrl+B` 启动）的活动，Enter/O 打开全屏活动详情，Ctrl+O 展开或收起。 |
| 核心机制 | `TaskList`、`TaskOutput`、`TaskStop`、`WaitFor`；Bash/Agent/问题任务共用任务服务。`TaskOutput` 始终非阻塞，立即返回当前快照，任务完成经自动通知送达。`WaitFor` 参数：`timeout`（必填，单位秒，上限 600）与可选 `task_id`；不传 `task_id` 时调用时刻运行中的任意一个后台任务结束即返回，无运行中任务时立即返回，等待更久可再次调用。`WaitFor` 与 `TaskList`/`TaskOutput` 一样自动放行。条件：0.35.0 起新增按 Agent 的内存活动流（subagent activity store），子 Agent 事件分流进该存储，按引擎 `turn.step.started` 事件分段，上限 `MAX_SUBAGENT_ACTIVITY_STEPS = 20` 步、步骤文本尾段 4000 字符、单条工具输出 8000 字符、工具参数字符串 16 KiB。 |
| 执行行为 | 立即返回 task id，终态自动通知主 Agent；回合内等待由 `WaitFor` 承担：调用在当前回合内挂起，等待期间不发起 LLM 请求，超时不是错误、结果列出仍在运行的任务，等待结束时一并列出等待窗口内完成的其他任务，已通过 `WaitFor` 汇报结果的任务不再推送自动完成通知。Goal 模式可用 `WaitFor` 时，注入的指引文本要求模型优先在回合内调用 `WaitFor` 等待而不是结束回合。等待对被等待任务无副作用：`WaitFor` 不停止任务，用户打断等待时任务继续运行。条件：0.35.0 起后台 Agent 事件实时写入活动流，预览窗格展示步骤级进展，不再等待任务结束；全屏详情按步骤分组渲染 Markdown 文本和各工具结果。 |
| 运行范围 | 任务状态与输出保存在当前会话目录；后台 Agent 有独立上下文。`WaitFor` 只能等待本 Agent 启动的后台任务，其他 Agent 的任务 ID 不可见。 |
| 后台与并发 | Bash 默认 10 分钟、Agent 默认 2 小时；print 模式两者默认无超时，可在配置中调整。 |
| Git 与平台联动 | TUI、Web、SDK 都能显示或轮询任务状态；完整日志路径可交给 Read。实时活动视图只在 TUI 任务浏览器实现（`apps/kimi-code/src/tui/`），Web 与 SDK 未提供。 |
| 状态与产物 | TaskOutput 内联最近 32 KB，完整日志落盘；任务修改留在工作目录。活动流仅存内存，会话切换时释放（`clear`），不落盘。 |
| 条件与边界 | 停止后台任务需要审批；Plan 模式会拦截 TaskStop。条件：`WaitFor` 仅 v2 引擎（agent-core-v2）提供，实验标志 `wait_for` 默认开启，`KIMI_CODE_EXPERIMENTAL_WAIT_FOR=false` 可关闭，随 PR #3060（提交 `8440801de47d`）合入 main 并于 0.38.0 发布；实时活动随 PR #2816（提交 `ad12ad8a140d`）于 2026-08-11 合入 main 分支，随 0.35.0（2026-08-12 发布）交付；会话恢复后没有内存活动记录的任务（如 lost 任务）回退到原捕获输出视图，Agent 任务输出仍在终态时一次性捕获。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)、[Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md)、[Kimi Code /tasks live background agent activity commit](https://github.com/MoonshotAI/kimi-code/commit/ad12ad8a140d24051d93ec98a4a6921ab33723ff)、[Kimi Code background agent activity changeset](https://github.com/MoonshotAI/kimi-code/blob/ad12ad8a140d24051d93ec98a4a6921ab33723ff/.changeset/background-agent-activity-view.md)、[Kimi Code 0.35.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.35.0)、[Kimi Code 0.38.0 release notes (WaitFor tool)](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.38.0)、[Kimi Code WaitFor tool commit](https://github.com/MoonshotAI/kimi-code/commit/8440801de47ddae29224430048e1228b80cde370)、[Kimi Code built-in tools documentation (WaitFor, 0.38.0)](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md)、[Kimi Code WaitFor experimental flag source](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/packages/agent-core-v2/src/agent/tools/task/task-wait/flag.ts)、[Kimi Code WaitFor changeset](https://github.com/MoonshotAI/kimi-code/blob/8440801de47ddae29224430048e1228b80cde370/.changeset/wait-for-tool.md) |

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
| 来源 | [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)、[Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)、[Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli) |

## 官方来源

- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Documentation](https://developers.openai.com/codex)
- [Qwen Code current shell tool](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/shell.ts)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md)
- [Kimi Code /tasks live background agent activity commit](https://github.com/MoonshotAI/kimi-code/commit/ad12ad8a140d24051d93ec98a4a6921ab33723ff)
- [Kimi Code background agent activity changeset](https://github.com/MoonshotAI/kimi-code/blob/ad12ad8a140d24051d93ec98a4a6921ab33723ff/.changeset/background-agent-activity-view.md)
- [Kimi Code 0.35.0 release notes](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.35.0)
- [Kimi Code 0.38.0 release notes (WaitFor tool)](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai/kimi-code%400.38.0)
- [Kimi Code WaitFor tool commit](https://github.com/MoonshotAI/kimi-code/commit/8440801de47ddae29224430048e1228b80cde370)
- [Kimi Code built-in tools documentation (WaitFor, 0.38.0)](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md)
- [Kimi Code WaitFor experimental flag source](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/packages/agent-core-v2/src/agent/tools/task/task-wait/flag.ts)
- [Kimi Code WaitFor changeset](https://github.com/MoonshotAI/kimi-code/blob/8440801de47ddae29224430048e1228b80cde370/.changeset/wait-for-tool.md)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)
- [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)

## 关联能力

- [Shell 执行](./execution-shell.md)
- [后台与并行](../subagents/agent-background.md)
- [任务列表](../commands/cmd-tasks.md)
