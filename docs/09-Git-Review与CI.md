# Git、Review 与 CI

[上一篇：多代理、后台任务与 Worktree](./08-多代理后台任务与Worktree.md) ·
[返回总矩阵](./02-功能总矩阵.md) ·
[下一篇：Headless、SDK、远程与多端](./10-Headless-SDK远程与多端.md)

真正进入研发流程以后，Code Agent 不只要“写出代码”，还要能解释差异、验证改动、
生成合适的提交，并和代码托管及 CI 协作。

## 五方表现

| 能力 | Claude Code | Codex | Qwen Code | Kimi Code | Qoder CLI |
| --- | --- | --- | --- | --- | --- |
| Git 基础操作 | 成熟，可检查 Diff、提交和处理分支 | 本地改动、Diff、提交与工作区管理 | Diff、提交、分支与 Worktree | 可通过 Shell 使用 Git；产品化细节待证 | 面向代码任务，可通过 CLI 工作流交付 |
| 代码审查 | 本地审查与 GitHub 工作流 | CLI Review、App/Cloud Review | Review Agent、严重度和多 Agent 入口 | 新版待验证 | 官方产品提供 Code Review 工作流 |
| PR/MR | 可创建 PR、处理评论和 CI | Cloud/GitHub 任务与 PR 工作流 | GitHub Action、PR/Review 工作流 | 原生集成待验证 | 与 Qoder 产品任务链路结合 |
| CI/非交互 | `-p`、GitHub Actions、GitLab CI/CD | `codex exec`、GitHub Action | `qwen -p`、结构化输出、GitHub Action | 新版待验证 | `qodercli -p`、PAT、SDK |
| 并行修复 | 后台 Agent/Worktree 可组合 | App 多 Agent 与 Cloud Task | Team/Workflow/Worktree | 待验证 | Subagent 与 Cloud Mode |

## “能跑 Git”不等于“适合交付”

成熟的交付 Agent 至少要做到：

1. 提交前展示完整改动范围，不夹带无关文件；
2. 用项目已有命令验证，而不是只说“应该可以”；
3. 区分代码缺陷、测试环境问题和历史 CI 失败；
4. 遵守仓库提交规范和 PR 模板；
5. Review 结论能定位到当前提交的具体代码；
6. 处理评论时不覆盖用户尚未提交的改动。

## 产品差异

Claude Code 的长板是终端、GitHub 和日常交付体验成熟。Codex 把本地 Review、云任务、
桌面多 Agent 和 GitHub 接起来，适合同时推进多个 Issue。Qwen Code 已有 Review、
GitHub Action、Team 和 Worktree 等组成部分，优势是可定制；需要继续提高默认流程的
一致性。Qoder CLI 的 CLI、Subagent、Cloud 与商业 Review 产品形成一条链路。Kimi
Code 的新版公开材料目前不足以给出完整原生 Git/Review 判断。

## 对 Qwen Code 的启示

优先打造一个默认“交付闭环”，而不是继续堆分散命令：

```text
理解任务 → 修改 → 聚焦测试 → 自查完整 Diff → Review → 提交/PR → 跟踪 CI
```

每一步应保存结构化状态，CLI、IDE、Desktop 和 IM 都能看到同一份结果。失败时明确是
代码、测试、权限、网络还是外部平台问题。
