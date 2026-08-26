# Shell 执行

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-shell)

> 核对日期：2026-08-26

## 定义

由 Agent 启动本地命令行进程，用于构建、测试、包管理、Git、脚本和其他系统工具。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `Bash` · 条件：Linux Bash 命令内存 cgroup 限制（`CLAUDE_CODE_TOOL_MEMORY_LIMIT`，v2.1.233 引入） | 官方确认 |
| Codex | 统一 PTY Shell | 官方确认 |
| Qwen Code | `run_shell_command` | 源码确认 |
| Kimi Code | `Bash` | 源码确认 |
| Qoder CLI | `Bash` · `!` 模式 | 官方确认 |

## 比较边界

### 本页包含

- 模型调用的 Shell 工具
- 前台执行、超时、工作目录和命令输出
- 用户直接输入 Shell 命令的快捷入口

### 本页不包含

- 产品专用 GitHub Action
- 云端任务环境的完整生命周期
- MCP Server 中自定义的远程命令工具

## 跨产品事实

1. 五家都把 Shell 作为通用执行底座，因此“支持 Git/测试”通常首先意味着能运行相应 CLI，而不是提供独立语义 API。
2. Kimi Code 和 Qwen Code 对后台 Shell 暴露了明确参数；Codex 使用统一 PTY 执行并通过 `/ps`、`/stop` 管理后台进程。
3. Shell 的宿主权限、审批与沙箱是三个不同层次：自动批准不等于容器隔离，沙箱也不等于命令必然成功。
4. 资源约束方面，Claude Code 自 v2.1.233 起在 Linux 上提供 Bash 命令内存 cgroup 限制（`CLAUDE_CODE_TOOL_MEMORY_LIMIT`）；其余四家的官方 Shell 或沙箱文档当前只列超时、审批与文件/网络边界，未提供同类内置内存限制配置。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Bash` · 条件：Linux Bash 命令内存 cgroup 限制（`CLAUDE_CODE_TOOL_MEMORY_LIMIT`，v2.1.233 引入） |
| 入口与工具 | 模型调用 `Bash`；用户可用 `! <command>` 直接执行。Windows 可按配置启用原生 `PowerShell` 工具。 |
| 核心机制 | `Bash` 接受命令并在持久 Shell 会话中运行；命令可读写文件、运行 Git 和开发工具链。 |
| 执行行为 | 需要权限审批，规则可按命令前缀匹配；Shell 工作目录会按项目策略维护或重置。 |
| 运行范围 | 运行于当前本地会话或 Worktree 的环境；Web、Desktop 与 CI 使用各自宿主。 |
| 后台与并发 | `/background` 分离整个会话；后台 Bash 和 `/tasks` 管理会话内任务；`Monitor` 适合持续观察日志、PR 或 CI 状态。 |
| Git 与平台联动 | Bash 权限规则也用于 Monitor；Hooks 可在执行前改写、允许或拒绝工具调用。 |
| 状态与产物 | stdout/stderr 回到会话；文件、进程和 Git 修改保留在宿主环境。 |
| 条件与边界 | 默认需要审批；Sandbox、Managed settings 和 deny 规则可能限制文件、网络或命令。Linux 上可对 Bash 命令启用可选的内存 cgroup 限制（`CLAUDE_CODE_TOOL_MEMORY_LIMIT`，v2.1.233 引入），官方更新日志给出的用途是防止失控构建占满内存拖住会话；官方环境变量文档尚未列出该变量。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)、[Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code Sandboxing](https://code.claude.com/docs/en/sandboxing)、[Claude Code v2.1.233 changelog (Bash memory cgroup)](https://github.com/anthropics/claude-code/blob/0fa8c19d50f7/CHANGELOG.md) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 统一 PTY Shell |
| 入口与工具 | 模型通过统一 PTY Shell 运行命令；用户在任务中直接描述要执行的构建、测试或 Git 操作。 |
| 核心机制 | 同一执行通道支持短命令、交互式进程和持续输出；读写仍受当前沙箱边界。 |
| 执行行为 | 命令在审批策略允许后启动；危险操作可要求单次确认或被规则阻止。 |
| 运行范围 | 本地 CLI/IDE 使用本机工作区，App Worktree 使用隔离目录，Cloud 使用配置好的远端环境。 |
| 后台与并发 | `/ps` 查看后台终端及近期输出，`/stop` 停止全部后台终端。 |
| Git 与平台联动 | Hooks 可观察 command 执行；`codex exec` 可把同一执行能力放入脚本和 CI。 |
| 状态与产物 | 输出进入当前线程；进程、文件和 Git 状态保留在相应本地或云环境。 |
| 条件与边界 | Read Only 等预设会阻止写入型命令；网络和目录访问由沙箱配置决定。官方配置参考未提供 Shell 内存或 CPU 资源限制项，只有超时类设置（如后台终端轮询窗口 `background_terminal_max_timeout`，默认 300000 毫秒）。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Documentation](https://developers.openai.com/codex)、[Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)、[Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `run_shell_command` |
| 入口与工具 | 模型调用 `run_shell_command`；提示行也支持 Shell 输入处理器。 |
| 核心机制 | 参数包含 `command`、`description`、`directory` 和 `is_background`；命令输出由 PTY/子进程执行层收集。 |
| 执行行为 | 前台命令阻塞当前工具调用；长任务可原生后台化，TUI 中也可按 `Ctrl+B` 把正在运行的前台命令转入后台。 |
| 运行范围 | 工作目录默认是当前 workspace；Worktree 激活后所有 Shell 调用路由到 Worktree。 |
| 后台与并发 | `is_background: true` 返回 task id；`/tasks` 查看状态；`task_stop` 精确停止。后台模式拒绝 `git commit`。 |
| Git 与平台联动 | Approval mode、Sandbox、Hooks 和自动安全分类器共同决定命令是否运行。 |
| 状态与产物 | 前台输出直接回到模型；后台输出保存在任务日志并可从任务面板读取。 |
| 条件与边界 | 裸 `&` 不作为受管后台机制；交互命令可能需要 TTY；后台 Git commit 被明确拒绝。官方 Sandbox 文档未列 Shell 内存或 CPU 限制项；容器型沙箱可用 `SANDBOX_FLAGS` 向 `docker`/`podman` 命令注入自定义参数（如资源类 flag），属于用户自配而非内置限额。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current shell tool](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/shell.ts)、[Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)、[Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)、[Qwen Code Sandbox](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sandbox.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Bash` |
| 入口与工具 | 模型调用 `Bash`；参数包含 `command`、`cwd`、`timeout`、`run_in_background` 和 `disable_timeout`。 |
| 核心机制 | 前台默认超时 60 秒、最长 5 分钟；后台默认 10 分钟，print 模式默认无超时。 |
| 执行行为 | stdout/stderr 在 TUI 工具卡片流式显示；前台超时默认转成后台任务，而不是直接杀进程。 |
| 运行范围 | 命令基于当前工作目录或显式 `cwd`；Windows 默认使用 Git Bash。 |
| 后台与并发 | 后台立即返回 task id，结束后通知 Agent；停止采用 SIGTERM、5 秒宽限、SIGKILL 两阶段。 |
| Git 与平台联动 | Bash 与 TaskList、TaskOutput、TaskStop 组成完整的长任务管理链。 |
| 状态与产物 | 完整后台日志保存在磁盘，TaskOutput 内联最近 32 KB 并返回输出路径。 |
| 条件与边界 | stdin 始终关闭，交互式命令会收到 EOF；Bash 默认需要审批。官方配置文档未列 Shell 内存或资源限制项，长命令只由超时控制（前台超时后可经 `bash_auto_background_on_timeout` 转后台，后台默认超时 `bash_task_timeout_s`）。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Bash` · `!` 模式 |
| 入口与工具 | 模型调用 `Bash`；TUI 中输入 `!` 可切换 Bash 模式并由用户直接执行命令。 |
| 核心机制 | SDK 内置工具表提供 `BashInput`/`BashOutput` 类型；工具可被 query options 显式允许或拒绝。 |
| 执行行为 | 命令遵守 Allow、Ask、Deny 规则和当前 workspace 边界。 |
| 运行范围 | 本地 TUI/Headless、Worktree Job、Cloud Mode 与 SDK 分别在其宿主环境运行。 |
| 后台与并发 | 后台任务可通过 `/tasks` 及 TaskOutput、TaskStop 管理；具体 Bash 参数以当前 CLI 版本工具表为准。 |
| Git 与平台联动 | Qoder Action 在 GitHub Runner 上调用同一类 CLI 能力；ACP 和 SDK 也能暴露 Bash。 |
| 状态与产物 | 输出进入任务记录；文件与进程留在本地、Worktree、容器或 Cloud VM。 |
| 条件与边界 | 工具可能被权限规则、Subagent 配置或 SDK `tools` 过滤；非交互运行需要合适认证。官方权限与 Sandbox 文档未列 Shell 内存或资源限制项，Sandbox 隔离能力只覆盖文件系统、网络和命令执行安全检查。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)、[Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)、[Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)、[Qoder CLI Sandbox](https://docs.qoder.com/en/cli/sandbox) |

## 官方来源

- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code Sandboxing](https://code.claude.com/docs/en/sandboxing)
- [Claude Code v2.1.233 changelog (Bash memory cgroup)](https://github.com/anthropics/claude-code/blob/0fa8c19d50f7/CHANGELOG.md)
- [Codex Documentation](https://developers.openai.com/codex)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Qwen Code current shell tool](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/shell.ts)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)
- [Qwen Code Sandbox](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/features/sandbox.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)
- [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)
- [Qoder CLI Sandbox](https://docs.qoder.com/en/cli/sandbox)

## 关联能力

- [后台任务](./execution-background.md)
- [Git 操作](./execution-git.md)
- [交互审批](../security/security-approval.md)
