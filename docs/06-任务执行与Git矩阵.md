# 任务执行与 Git 矩阵

[返回文档目录](./README.md) · [网页矩阵](https://qqqys.github.io/code-agent/#execution) · [详情目录](./capabilities/execution/)

> 核对日期：2026-07-27

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| [文件读写](./capabilities/execution/execution-files.md) | `Read` · `Edit` · `Write` | 内置读取 · 补丁编辑 | `read_file` · `edit` · `write_file` | `Read` · `Edit` · `Write` | `Read` · `Edit` · `Write` |
| [Shell 执行](./capabilities/execution/execution-shell.md) | `Bash` | 统一 PTY Shell | `run_shell_command` | `Bash` | `Bash` · `!` 模式 |
| [代码搜索](./capabilities/execution/execution-search.md) | `Glob` · `Grep` · `LSP` | 内置搜索 · Shell/`rg` | `glob` · `grep_search` · `LSP` | `Glob` · `Grep` | `Glob` · `Grep` |
| [后台任务](./capabilities/execution/execution-background.md) | `/background` · `/tasks` · `Monitor` | `/ps` · `/stop` | `is_background` · `Ctrl+B` · `/tasks` | `run_in_background` · `/tasks` | `/tasks` · `TaskOutput` · `TaskStop` |
| [代码 Review](./capabilities/execution/execution-review.md) | `/review` · `/code-review` · GitHub Review | `/review` · GitHub Review | `/review` 内置 Skill | 自然语言；无内置 `/review` | `/review [instruction]` |
| [Git 操作](./capabilities/execution/execution-git.md) | `Bash` · `/diff` | Shell · `/diff` · App 暂存/回退 | `run_shell_command` · `/diff` | `Bash` | `Bash` · `!` 模式 |
| [Pull Request](./capabilities/execution/execution-pr.md) | `/review` · `/autofix-pr` · GitHub App | Codex Cloud · GitHub Review · `gh` | `/review --comment` · Actions · `gh` | `Bash`/`gh`；无专用入口 | Qoder Action · `@qoder` · `gh` |
| [CI 自动化](./capabilities/execution/execution-ci.md) | GitHub Actions · `/autofix-pr` | `openai/codex-action@v1` | `/setup-github` · Qwen Code Action | 自定义 Shell/CI；无内置工作流 | `/setup-github` · Qoder Action |
| [并行 Worktree](./capabilities/execution/execution-worktree.md) | `--worktree` · `EnterWorktree` · Agent 隔离 | 桌面 App Worktree；CLI 无对应隔离 | `--worktree` · `enter_worktree` · Agent 隔离 | 无内置入口；可在已有 Worktree 中运行 | `--worktree` Job · Agent 隔离 |

## 阅读边界

本矩阵把文件、Shell、搜索、后台任务、代码 Review、Git、Pull Request、CI 和 Worktree 拆开记录。能通过 Shell 完成某件事，不等于产品提供了专用命令、托管服务或稳定 API；详情页会分别写明入口、运行位置、外部写入和 Surface 条件。

## 详情字段

每个能力页分别记录五家的入口与工具、核心机制、执行行为、运行范围、后台与并发、Git 与平台联动、状态与产物、条件和官方来源。
