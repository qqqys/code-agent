# CI 自动化

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-ci)

> 核对日期：2026-08-13

## 定义

在 GitHub Actions 或其他流水线中非交互运行 Agent，用于审查、问题分派、失败诊断和受控修复。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | GitHub Actions · `/autofix-pr` | 官方确认 |
| Codex | `openai/codex-action@v1` | 官方确认 |
| Qwen Code | `/setup-github` · Qwen Code Action | 源码确认 |
| Kimi Code | 自定义 Shell/CI；无内置工作流 | 条件项 |
| Qoder CLI | `/setup-github` · Qoder Action | 官方确认 |

## 比较边界

### 本页包含

- 官方 GitHub Action 或安装命令
- PR、Issue、定时和手工触发
- Token、Runner、权限与写回边界

### 本页不包含

- 仅在本地运行测试命令
- 产品自身仓库的开发 CI
- 未由该产品提供的任意第三方自动化

## 跨产品事实

1. Claude Code、Codex、Qwen Code 和 Qoder CLI 都有面向 GitHub Actions 的产品级入口；Kimi Code 当前公开 CLI 文档没有对应内置 Workflow。
2. Codex 官方建议把只读分析与有写权限的 PR 创建分成不同 Job，通过 patch artifact 传递结果，缩小 Token 权限。
3. Qwen `/setup-github` 当前安装五个 Workflow，不只是 PR Review：还包括 dispatch、assistant、issue triage 和 scheduled triage。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | GitHub Actions · `/autofix-pr` |
| 入口与工具 | 使用 Claude Code GitHub Action；可通过 `/install-github-app` 或手工 Workflow 配置 GitHub App 与 Secret。 |
| 核心机制 | GitHub Action、Claude GitHub App、CLAUDE.md 和事件 Prompt。 |
| 执行行为 | 在 Runner 上执行 Claude Code，支持 `@claude`、PR Review、Issue 实现、定时维护和自定义自动化。 |
| 运行范围 | Workflow event 指定的仓库、分支、PR 或 Issue。 |
| 后台与并发 | 由 GitHub Runner 异步执行；状态进入 Actions run 和 PR checks。 |
| Git 与平台联动 | GitHub App 提供令牌，Action 读取项目指令和工作流参数。 |
| 状态与产物 | Action 日志、PR/Issue 评论、commit、PR 和 check run。 |
| 条件与边界 | Workflow permissions 与 Allowed Tools 必须最小化；第三方 PR 需要防范提示注入和 Secret 暴露。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)、[Claude Code Review](https://code.claude.com/docs/en/code-review) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `openai/codex-action@v1` |
| 入口与工具 | Workflow 使用 `openai/codex-action@v1`，通过 inline prompt 或 prompt file 调用 `codex exec`。 |
| 核心机制 | Codex Action、sandbox 配置、输出文件和 GitHub Actions 权限。 |
| 执行行为 | 可审查改动、生成 patch、执行受限修复并把最终输出传给后续步骤。 |
| 运行范围 | 当前 Workflow checkout；具体写权限由 Job token、sandbox 和脚本分配。 |
| 后台与并发 | 在 GitHub Runner 非交互运行；结果由 Actions step 和 artifact 持久。 |
| Git 与平台联动 | 官方自动修复示例把只读分析与写权限 PR Job 分开，并通过 patch artifact 传递结果。 |
| 状态与产物 | Action output、patch artifact、日志、Review 或后续 Job 创建的 PR。 |
| 条件与边界 | 需要 OpenAI/Codex 认证；Prompt、Token 权限和 sandbox 必须按不可信输入设计。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex GitHub Action](https://learn.chatgpt.com/docs/github-action)、[Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/setup-github` · Qwen Code Action |
| 入口与工具 | 运行 `/setup-github` 下载 Qwen Code Action Workflow，或按 integration 文档手工配置。 |
| 核心机制 | Qwen Code Action、GitHub App/凭据、五类 Workflow 和 QWEN.md/AGENTS.md。 |
| 执行行为 | 提供 dispatch、按评论调用 Assistant、Issue triage、定时 triage 与 PR review。 |
| 运行范围 | 当前 GitHub 仓库；触发事件与 Workflow permissions 决定能读写的对象。 |
| 后台与并发 | GitHub Runner 异步运行；本地 CLI 只负责安装配置和后续查看。 |
| Git 与平台联动 | `/setup-github` 写入 `.github/workflows` 并更新 `.gitignore`，随后打开 README/Secrets 页面完成认证。 |
| 状态与产物 | Workflow 文件、Action run、Issue/PR 评论、Review 和可选代码改动。 |
| 条件与边界 | 命令只支持交互式 TUI；下载安装依赖网络，Repository Secret 和 GitHub 权限需用户完成。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current GitHub Action](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-github-action.md)、[Qwen Code current GitHub setup](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/cli/src/services/setup-github.ts) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 自定义 Shell/CI；无内置工作流 |
| 入口与工具 | 可在自定义 CI 中执行 `kimi -p` 或项目脚本；当前公开命令目录没有 `/setup-github` 或官方产品 Workflow。 |
| 核心机制 | Headless CLI、Bash 和用户自行编写的 CI 配置。 |
| 执行行为 | 非交互 Agent 可以在 Runner 上读写代码，但触发、权限、评论和 PR 写回都由用户脚本负责。 |
| 运行范围 | 用户定义的 Runner checkout。 |
| 后台与并发 | 由 CI 平台管理；Kimi print 模式中的 Bash/Agent 默认可无超时，仍应由 Job timeout 兜底。 |
| Git 与平台联动 | 可结合 gh、MCP、Plugin 或自定义 Skill，但不计为内置 GitHub Action。 |
| 状态与产物 | 取决于自定义 Workflow：日志、文件、patch、评论或 PR。 |
| 条件与边界 | 矩阵只确认可用通用 Headless/Shell 组装，不宣称存在官方 Kimi GitHub Action。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-command.md)、[Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)、[Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/setup-github` · Qoder Action |
| 入口与工具 | `/setup-github` 引导配置 Qoder Action，或手工使用 `QoderAI/qoder-action@v0`。 |
| 核心机制 | Qoder GitHub App、Qoder PAT、Repository Secret、Workflow 和 AGENTS.md。 |
| 执行行为 | 开箱提供自动 PR Review 与 `@qoder` 按需协作，能解释、建议或直接修复。 |
| 运行范围 | 安装 Qoder App 并启用 Workflow 的仓库。 |
| 后台与并发 | GitHub Runner 异步执行并把状态显示为 Actions run。 |
| Git 与平台联动 | Action 调用 Qoder CLI，项目 AGENTS.md 参与 Review 标准。 |
| 状态与产物 | Action 日志、PR Review、评论和可选代码修改。 |
| 条件与边界 | 需要 App、PAT Secret 和适当 Workflow permissions；版本标签以当前 Qoder Action 文档为准。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder Action](https://docs.qoder.com/en/cli/qoder-action)、[Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference) |

## 官方来源

- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [Claude Code Review](https://code.claude.com/docs/en/code-review)
- [Codex GitHub Action](https://learn.chatgpt.com/docs/github-action)
- [Codex Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Qwen Code current GitHub Action](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/integration-github-action.md)
- [Qwen Code current GitHub setup](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/cli/src/services/setup-github.ts)
- [Kimi Code current CLI reference](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/reference/kimi-command.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Qoder Action](https://docs.qoder.com/en/cli/qoder-action)
- [Qoder CLI slash commands](https://docs.qoder.com/cli/slash-reference)

## 关联能力

- [Pull Request](./execution-pr.md)
- [代码 Review](./execution-review.md)
- Headless 调用：见对应能力矩阵
