# 并行 Worktree

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-worktree)

> 核对日期：2026-08-01

## 定义

为并行或高风险任务创建独立 Git checkout，使文件修改、分支和会话状态不直接污染主工作区。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `--worktree` · `EnterWorktree` · Agent 隔离 | 官方确认 |
| Codex | 桌面 App Worktree；CLI 无对应隔离 | 条件项 |
| Qwen Code | `--worktree` · `enter_worktree` · Agent 隔离 | 源码确认 |
| Kimi Code | 无内置入口；可在已有 Worktree 中运行 | 未确认 |
| Qoder CLI | `--worktree` Job · Agent 隔离 | 官方确认 |

## 比较边界

### 本页包含

- 会话级、任务级和 Subagent 级 Worktree
- 基础分支、目录、复制或复用依赖
- 退出、保留、清理和未合并改动保护

### 本页不包含

- 仅进程或容器沙箱
- 普通 Git branch 但共享同一工作目录
- 云端 VM 的仓库 checkout

## 跨产品事实

1. Claude Code、Qwen Code 和 Qoder CLI 都提供 CLI Worktree 入口；Codex 的托管 Worktree 当前只在 ChatGPT 桌面 App，Kimi Code 当前没有内置管理入口。
2. Claude 和 Qwen 都支持会话级与 Subagent 级 Worktree，但实现细节不同：Claude 默认可从 origin/HEAD 开始，Qwen 默认从当前本地分支开始。
3. Qoder CLI 把 Worktree 设计成可列出和删除的 Concurrent Job；Codex App 则把 Worktree 作为本地任务的一种启动位置。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `--worktree` · `EnterWorktree` · Agent 隔离 |
| 入口与工具 | `claude --worktree\|-w [name\|#PR\|URL]`；会话内用 `EnterWorktree`/`ExitWorktree`；Agent frontmatter 可写 `isolation: worktree`。 |
| 核心机制 | `.claude/worktrees/<name>`、`worktree-<name>` 分支、`.worktreeinclude` 与 WorktreeCreate/Remove Hooks。 |
| 执行行为 | 新会话、当前会话和 Subagent 都可隔离；无改动临时 Worktree 自动清理，有改动时提示保留或删除。 |
| 运行范围 | 默认从 `origin/HEAD` 创建，失败时回退本地 HEAD；`worktree.baseRef=head` 可改为当前本地 HEAD。 |
| 后台与并发 | `/batch` 把 5–30 个单元交给后台 Agent，每个单元用独立 Worktree 并可打开 PR。 |
| Git 与平台联动 | PR reference 可直接成为基础；`.worktreeinclude` 复制被 Git ignore 的本地文件；Hooks 可替换 Git 创建逻辑。 |
| 状态与产物 | 独立目录、分支、commit 和可选 PR；Headless 创建的 Worktree 不自动清理。 |
| 条件与边界 | 需要 Git 仓库和已接受 workspace trust；删除会丢弃未提交变更时必须谨慎确认。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code worktrees](https://code.claude.com/docs/en/worktrees)、[Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)、[Claude Code Commands](https://code.claude.com/docs/en/commands) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 桌面 App Worktree；CLI 无对应隔离 |
| 入口与工具 | 在 ChatGPT 桌面 App 创建任务时选择 Worktree；CLI 当前没有对应托管 Worktree 或 per-Agent 隔离入口。 |
| 核心机制 | `$CODEX_HOME/worktrees`、detached HEAD、本地后台任务、`.worktreeinclude` 和 Local/Worktree handoff。 |
| 执行行为 | App 创建独立 checkout 并在后台运行任务；用户可从 Worktree 创建分支、提交、推送和开 PR。 |
| 运行范围 | 只在 ChatGPT desktop app；不应推断为 Codex CLI Subagent 字段。 |
| 后台与并发 | 每个 Worktree 任务可本地后台运行；App 管理其生命周期和历史。 |
| Git 与平台联动 | 可在 Local 与 Worktree 之间 handoff；默认保留最近 15 个，清理前创建 snapshot。 |
| 状态与产物 | 隔离 checkout、snapshot、可选 branch/commit/PR。 |
| 条件与边界 | 当前能力限桌面 App；新任务默认 detached HEAD，交付前需显式创建分支。 |
| 证据状态 | 条件项 |
| 来源 | [Codex worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees)、[Codex code review](https://learn.chatgpt.com/docs/code-review) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `--worktree` · `enter_worktree` · Agent 隔离 |
| 入口与工具 | `qwen --worktree[=name\|#PR\|URL]`；会话内 `enter_worktree`/`exit_worktree`；Agent 可传 `isolation: "worktree"`。 |
| 核心机制 | `.qwen/worktrees/<slug>`、`worktree-<slug>` 分支、session sidecar 和 `worktree.symlinkDirectories`。 |
| 执行行为 | 启动前、会话中和 Agent 三条路径共用管理器；无差异 Agent Worktree 清理，有差异保留路径和分支。 |
| 运行范围 | 普通 Worktree 从当前本地分支创建；PR reference 从 fetch 的 PR tip 创建；Fork Agent 不支持 Worktree 隔离。 |
| 后台与并发 | 隔离 Agent 沿默认后台行为运行；Arena 使用另一套 Worktree 目录。 |
| Git 与平台联动 | 可复用 node_modules 等目录的 symlink；恢复会话用 `<sessionId>.worktree.json` 恢复绑定。 |
| 状态与产物 | Worktree、分支、sidecar、状态栏标识和可保留的 Agent Diff。 |
| 条件与边界 | ACP 不接受 `--worktree`，应把 Worktree path 作为 cwd；退出删除受 ownership、dirty 和未合并 commit 三重保护。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)、[Qwen Code current code review](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/code-review.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 无内置入口；可在已有 Worktree 中运行 |
| 入口与工具 | 当前 CLI 与 Agent 文档没有创建、切换或清理 Worktree 的内置入口；可先用 `git worktree add`，再从该目录启动 `kimi`。 |
| 核心机制 | 标准 Git Worktree 和当前工作目录；内部能识别 `.git` 文件形式，但这不是用户可调用的管理能力。 |
| 执行行为 | 从已有 Worktree 启动时，文件与 Bash 自然作用于该 checkout；产品不负责创建分支或清理。 |
| 运行范围 | 用户选定的启动目录；Subagent 默认共享被分配的工作目录。 |
| 后台与并发 | 后台 Agent 可以并行，但当前文档未提供每 Agent Worktree 隔离字段。 |
| Git 与平台联动 | 可用自定义 Skill/Plugin 封装 `git worktree`，仍属于用户扩展。 |
| 状态与产物 | 由 Git 手工创建的 Worktree 和分支；Kimi 只产生其中的文件修改。 |
| 条件与边界 | 本结论描述当前公开 Surface；不把内部 Git marker 检测当成 Worktree 管理功能。 |
| 证据状态 | 未确认 |
| 来源 | [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md)、[Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `--worktree` Job · Agent 隔离 |
| 入口与工具 | `qodercli --worktree "job"` 创建；`qodercli jobs --worktree` 列出；`qodercli rm <job-id>` 删除。Agent 也支持 `isolation: worktree`。 |
| 核心机制 | `~/.qoder/worktrees/<job-id>`、Concurrent Job、可选 `--branch` 与容器执行。 |
| 执行行为 | 多个终端可启动独立 Worktree Job；默认进入容器内 TUI，`-p` 可非交互执行后停止容器。 |
| 运行范围 | 当前 Git 仓库；`--branch` 选择任务代码分支，其他 Agent 参数透传给容器内 CLI。 |
| 后台与并发 | 每个 Job 有独立 ID、路径、状态和创建时间；可并行运行。 |
| Git 与平台联动 | Subagent `isolation: worktree` 提供任务内隔离；Quest 也有 Local/Worktree execution environment。 |
| 状态与产物 | Worktree 目录、Job 状态、分支和任务修改。 |
| 条件与边界 | 需要本机 Git；`qodercli rm` 会删除 Worktree 且不可撤销。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)、[Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent) |

## 官方来源

- [Claude Code worktrees](https://code.claude.com/docs/en/worktrees)
- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Codex worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees)
- [Codex code review](https://learn.chatgpt.com/docs/code-review)
- [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)
- [Qwen Code current code review](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/code-review.md)
- [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)
- [Qoder CLI Subagent](https://docs.qoder.com/en/cli/subagent)

## 关联能力

- [Worktree 隔离](../subagents/agent-worktree.md)
- [Git 操作](./execution-git.md)
- [Pull Request](./execution-pr.md)
