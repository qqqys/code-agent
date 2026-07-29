# Pull Request

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-pr)

> 核对日期：2026-07-29

## 定义

读取 Pull Request 元数据与 Diff，发布审查或修复结果，并在支持的 Surface 创建或更新 PR。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/review` · `/autofix-pr` · GitHub App | 官方确认 |
| Codex | Codex Cloud · GitHub Review · `gh` | 官方确认 |
| Qwen Code | `/review --comment` · Actions · `gh` | 源码确认 |
| Kimi Code | `Bash`/`gh`；无专用入口 | 源码确认 |
| Qoder CLI | Qoder Action · `@qoder` · `gh` | 官方确认 |

## 比较边界

### 本页包含

- 读取 PR、审查 PR 与发布行内评论
- 从 Agent 任务创建或更新 PR
- 根据 Review 或 CI 反馈修复 PR

### 本页不包含

- 仅本地 Git commit
- CI Runner 的通用执行
- 自动批准、合并和发布版本

## 跨产品事实

1. 五家都可通过 Shell 中的 `gh` 工作，但原生远端能力差异很大：Claude、Codex、Qwen、Qoder 都有 GitHub 专用工作流，Kimi 当前以通用 Shell 为主。
2. Qwen `/review --comment` 提交的是 GitHub Review，不是创建功能分支或 PR；创建 PR 仍主要通过 `gh` 或 Action 工作流。
3. Claude `/autofix-pr`、Codex GitHub/Cloud、Qoder `@qoder` 都能围绕现有 PR 继续处理评论或失败检查，但权限和运行位置不同。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/review` · `/autofix-pr` · GitHub App |
| 入口与工具 | `/review <PR>` 读取审查；`/autofix-pr` 监视并修复当前分支 PR；IDE/CLI 可用 `gh` 创建 PR。 |
| 核心机制 | GitHub App、GitHub Actions、`gh` 与 Claude Code 本地/远端会话。 |
| 执行行为 | 可生成 PR 描述、发布 Review、响应 `@claude`，并把 CI 或评论修复推回 PR 分支。 |
| 运行范围 | 当前仓库、当前分支或明确 PR；托管 Code Review 按仓库设置触发。 |
| 后台与并发 | `/autofix-pr` 启动远端 Web session 持续观察；Code Review 在托管基础设施并行运行。 |
| Git 与平台联动 | GitHub App 负责仓库权限和评论；Actions 适合自托管 Runner 工作流。 |
| 状态与产物 | PR、Review 评论、check run、分支 commit 和修复 push。 |
| 条件与边界 | 需要 GitHub 仓库、App/gh 认证和分支写权限；不同远端工作流可能需要相应订阅。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code Review](https://code.claude.com/docs/en/code-review)、[Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)、[Claude Code IDE integrations](https://code.claude.com/docs/en/ide-integrations) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Codex Cloud · GitHub Review · `gh` |
| 入口与工具 | Codex Cloud 连接仓库后可从任务产出 PR；GitHub 可用 `@Codex` 审查或处理任务；本地可用 `gh`。 |
| 核心机制 | Codex Cloud environment、GitHub integration、GitHub Review 与本地 Shell。 |
| 执行行为 | 云任务在远端 checkout 修改代码并提交 PR；Review 流程在 PR 上发布 findings。 |
| 运行范围 | 已连接的 GitHub 仓库、明确任务或 PR；本地 gh 使用当前仓库身份。 |
| 后台与并发 | Cloud 和 GitHub 任务异步运行；本地 Shell 由当前线程或后台终端执行。 |
| Git 与平台联动 | GitHub App/连接器、Cloud 环境和本地 Git 分支共同形成交付链。 |
| 状态与产物 | PR、commit、review findings 和任务链接。 |
| 条件与边界 | 远端任务需要仓库授权和配置好的环境；本地创建 PR 仍取决于 gh 权限。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex GitHub integration](https://learn.chatgpt.com/docs/third-party/github)、[Codex code review](https://learn.chatgpt.com/docs/code-review)、[Codex Documentation](https://developers.openai.com/codex) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/review --comment` · Actions · `gh` |
| 入口与工具 | `/review <pr> --comment` 发布 Review；`gh` 读取/创建 PR；Qwen Code Action 响应 PR 和评论事件。 |
| 核心机制 | 内置 Review Skill、GitHub CLI、Qwen Code Action 和安装的工作流。 |
| 执行行为 | 同仓 PR Review 在临时 Worktree 中运行并一次性提交评论；Action 可自动审查或由评论触发 Assistant。 |
| 运行范围 | 当前 GitHub 仓库、PR number/URL 或工作流事件。 |
| 后台与并发 | Review Agent 可并行；Action 在 GitHub Runner 异步运行。 |
| Git 与平台联动 | `/setup-github` 安装 dispatch、assistant、issue triage、scheduled triage、PR review 五类 Workflow。 |
| 状态与产物 | GitHub Review、Action run、评论、分支修改和通过 gh 创建的 PR。 |
| 条件与边界 | 创建 PR 没有独立 Slash 命令；需要 gh 或工作流权限，`--comment` 会产生外部写入。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current code review](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/code-review.md)、[Qwen Code current GitHub Action](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-github-action.md)、[Qwen Code current GitHub setup](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/cli/src/services/setup-github.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Bash`/`gh`；无专用入口 |
| 入口与工具 | 用 `Bash` 调用 `gh pr view\|create\|comment` 或项目脚本；当前没有专用 PR Slash 命令。 |
| 核心机制 | 标准 GitHub CLI、Git 和可选的自定义 Skill/Plugin。 |
| 执行行为 | 能否读、创建或修改 PR 取决于提示词、gh 登录和审批；产品没有固定的 PR 状态机。 |
| 运行范围 | 当前仓库和 gh 当前身份。 |
| 后台与并发 | 可在后台 Bash 或 Agent 中轮询 PR，但没有内置 PR Monitor 工作流。 |
| Git 与平台联动 | 用户可用 Plugin、Skill、MCP 或自己的 CI 封装 GitHub 流程。 |
| 状态与产物 | 由 gh 创建的 PR、评论、Review 或分支 push。 |
| 条件与边界 | 官方 CLI/Agent 文档当前没有等价 GitHub App/Action 能力说明；不要把通用 Bash 当成内置集成。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Qoder Action · `@qoder` · `gh` |
| 入口与工具 | Qoder Action 自动审查 PR；评论 `@qoder` 请求解释、建议或直接修复；本地也可用 `gh`。 |
| 核心机制 | Qoder GitHub App、`QoderAI/qoder-action`、Workflow 和 Qoder CLI。 |
| 执行行为 | PR 打开时自动 Review，或按评论触发任务；修复可在 GitHub Runner 上修改并回写分支。 |
| 运行范围 | 安装 App 并配置 Workflow 的仓库和 PR。 |
| 后台与并发 | Action 在 GitHub Runner 异步运行；本地任务可继续从 TUI/Headless 跟进。 |
| Git 与平台联动 | `/setup-github` 引导安装；AGENTS.md 提供 Review 规则。 |
| 状态与产物 | PR 评论、Review、Action run 和可选代码修复。 |
| 条件与边界 | 需要 Qoder PAT、GitHub App 权限、Repository Secret 和 Workflow；`@qoder` 只对已配置仓库生效。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder Action](https://docs.qoder.com/en/cli/qoder-action)、[Qoder CLI commands](https://docs.qoder.com/en/cli/command) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code Review](https://code.claude.com/docs/en/code-review)
- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Claude Code IDE integrations](https://code.claude.com/docs/en/ide-integrations)
- [Codex GitHub integration](https://learn.chatgpt.com/docs/third-party/github)
- [Codex code review](https://learn.chatgpt.com/docs/code-review)
- [Codex Documentation](https://developers.openai.com/codex)
- [Qwen Code current code review](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/code-review.md)
- [Qwen Code current GitHub Action](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-github-action.md)
- [Qwen Code current GitHub setup](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/cli/src/services/setup-github.ts)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Qoder Action](https://docs.qoder.com/en/cli/qoder-action)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)

## 关联能力

- [代码 Review](./execution-review.md)
- [CI 自动化](./execution-ci.md)
- [Git 操作](./execution-git.md)
