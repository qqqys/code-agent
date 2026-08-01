# Git 操作

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-git)

> 核对日期：2026-08-01

## 定义

读取 Git 状态与差异，并在用户授权下执行暂存、提交、分支、合并或回退等本地版本控制操作。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `Bash` · `/diff` | 官方确认 |
| Codex | Shell · `/diff` · App 暂存/回退 | 官方确认 |
| Qwen Code | `run_shell_command` · `/diff` | 源码确认 |
| Kimi Code | `Bash` | 源码确认 |
| Qoder CLI | `Bash` · `!` 模式 | 官方确认 |

## 比较边界

### 本页包含

- status、diff、log、branch、add 与 commit
- 产品提供的 Diff 视图或 Git 状态面板
- Worktree 与 Review 对 Git 状态的使用

### 本页不包含

- 远端 Pull Request API
- CI 工作流执行
- 非 Git 版本控制系统的专用集成

## 跨产品事实

1. 五家都能通过 Shell 运行 Git；专用 UI 的差别主要在 Diff、暂存、回退、Review 和 Worktree。
2. Codex App 提供 staging/revert 交互；Claude Code、Codex、Qwen Code 提供 `/diff`，Kimi Code 与 Qoder CLI 当前命令表没有等价 Slash 命令。
3. 能执行 `git commit` 不等于会自动提交：是否暂存、提交或推送仍应由任务授权、权限规则与产品工作流决定。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Bash` · `/diff` |
| 入口与工具 | 通过 `Bash` 运行 Git；`/diff` 查看当前改动；IDE 中可直接要求暂存、提交、切分支或生成 PR。 |
| 核心机制 | Git CLI 加上 Claude 的 Diff/IDE 展示；检查点不是 Git commit，二者可并存。 |
| 执行行为 | Agent 可根据实际 Diff 生成提交说明并运行 Git；破坏性命令仍受权限规则与用户审批。 |
| 运行范围 | 当前仓库或当前 Claude Worktree；Worktree 有独立分支和文件状态。 |
| 后台与并发 | 普通 Git 操作前台执行；Monitor 可观察远端分支、PR 或 CI。 |
| Git 与平台联动 | IDE 原生 Git/Diff、GitHub App 与 Worktree 工作流连接本地和远端交付。 |
| 状态与产物 | 工作树、Index、commit、branch 和 reflog 等标准 Git 状态。 |
| 条件与边界 | 仓库必须可用；权限规则可拒绝 push、reset 或其他高风险 Bash 命令。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code IDE integrations](https://code.claude.com/docs/en/ide-integrations)、[Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code worktrees](https://code.claude.com/docs/en/worktrees) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Shell · `/diff` · App 暂存/回退 |
| 入口与工具 | 通过 Shell 运行 Git；`/diff` 显示改动；Codex App Review pane 可选择 unstaged/staged/commit/branch。 |
| 核心机制 | Git CLI、Diff 视图，以及 App 中的 stage 和 revert 控件。 |
| 执行行为 | Agent 可读取状态、创建分支、提交和推送；App 可把选定改动暂存或回退。 |
| 运行范围 | 本地工作区或 App Worktree；Worktree 默认 detached HEAD，需要创建分支后再提交和推送。 |
| 后台与并发 | Git 命令可在终端执行；长时间 fetch/test 可由后台终端管理。 |
| Git 与平台联动 | 本地分支可交给 GitHub/Cloud 创建 PR；Worktree 支持 Local 与 Worktree 之间 handoff。 |
| 状态与产物 | 标准 Git 状态、commit/branch 以及 App 中可审阅的 Diff。 |
| 条件与边界 | 审批与沙箱仍约束 Shell；App Worktree 只在 ChatGPT 桌面应用提供。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)、[Codex code review](https://learn.chatgpt.com/docs/code-review)、[Codex worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `run_shell_command` · `/diff` |
| 入口与工具 | 通过 `run_shell_command` 运行 Git；`/diff` 查看会话改动；Worktree、Review 和 Arena 都使用 Git 状态。 |
| 核心机制 | Git CLI、Diff 命令、工作树状态检查和 Worktree 管理工具。 |
| 执行行为 | Agent 可执行 status/add/commit/branch 等命令；Worktree 退出前会检查 dirty files 与未合并 commit。 |
| 运行范围 | 当前 workspace、显式 Worktree 或 Agent/Arena Worktree。 |
| 后台与并发 | 读取类 Git 命令可后台运行，但受管后台 Shell 明确拒绝 `git commit`，提交需前台完成。 |
| Git 与平台联动 | VS Code Companion 展示 Diff；`/review`、`/setup-github` 和 Qwen Code Action 衔接 GitHub。 |
| 状态与产物 | 工作树、Index、commit、branch、Worktree sidecar 与可视 Diff。 |
| 条件与边界 | 删除 Worktree 有 dirty、ownership 和未合并提交保护；破坏性 Git 命令仍需权限。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current shell tool](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/shell.ts)、[Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)、[Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Bash` |
| 入口与工具 | 使用 `Bash` 运行 `git status`、`git diff`、`git add`、`git commit` 等命令。 |
| 核心机制 | 没有独立 Git 工具层；标准 Git CLI 是主要接口。 |
| 执行行为 | Agent 可按提示读取和修改 Git 状态；命令审批与 Bash 相同。 |
| 运行范围 | 当前工作目录所在仓库；如果用户从手工 Worktree 启动，Git 自然作用于该 Worktree。 |
| 后台与并发 | 长 Git 命令可后台运行；提交类操作是否后台执行由 Bash 和用户审批决定。 |
| Git 与平台联动 | 可通过 Bash 调用 `gh` 或其他 VCS 工具；当前命令目录没有 `/diff`。 |
| 状态与产物 | 标准 Git 工作树、Index、commit 和 branch。 |
| 条件与边界 | 当前公开文档没有专用暂存、回退或 Git UI；结论不限制自定义 Skill/Plugin。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Bash` · `!` 模式 |
| 入口与工具 | 模型通过 `Bash` 或用户通过 `!` 模式运行 Git；Worktree Job 由 CLI 启动参数管理。 |
| 核心机制 | 标准 Git CLI，加上 `qodercli --worktree`、`jobs --worktree` 和 `rm`。 |
| 执行行为 | Agent 可读写 Git 状态；Worktree Job 为每个并发任务创建隔离 checkout。 |
| 运行范围 | 当前 workspace 或 `~/.qoder/worktrees/<job-id>`。 |
| 后台与并发 | Worktree Job 可在独立终端或容器中并行；普通 Git 命令遵守任务生命周期。 |
| Git 与平台联动 | Qoder Action、`@qoder` 和 `/review` 在 GitHub 或本地 Review 中消费 Git Diff。 |
| 状态与产物 | 标准 Git 状态以及 Qoder Worktree Job 目录和任务 ID。 |
| 条件与边界 | 需要本机 Git；删除 Job 会同时删除 Worktree，属于不可撤销操作。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)、[Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)、[Qoder Action](https://docs.qoder.com/en/cli/qoder-action) |

## 官方来源

- [Claude Code IDE integrations](https://code.claude.com/docs/en/ide-integrations)
- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code worktrees](https://code.claude.com/docs/en/worktrees)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Codex code review](https://learn.chatgpt.com/docs/code-review)
- [Codex worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees)
- [Qwen Code current shell tool](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/shell.ts)
- [Qwen Code current commands](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/commands.md)
- [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Qoder CLI usage and worktrees](https://docs.qoder.com/en/cli/using-cli)
- [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)
- [Qoder Action](https://docs.qoder.com/en/cli/qoder-action)

## 关联能力

- [文件读写](./execution-files.md)
- [Pull Request](./execution-pr.md)
- [并行 Worktree](./execution-worktree.md)
