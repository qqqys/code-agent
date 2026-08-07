# 代码 Review

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-review)

> 核对日期：2026-08-07

## 定义

把待审范围固定为本地改动、提交、分支或 Pull Request，并输出可定位、分级且有证据的问题。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `/review` 为 `/code-review` 别名 · `ultra` 云审查 · GitHub Review | 官方确认 |
| Codex | `/review` · GitHub Review | 官方确认 |
| Qwen Code | `/review` 内置 Skill · `publish-assets` 证据图 · Web Shell 结构化结果 · `cost-ledger` 成本台账 | 源码确认 |
| Kimi Code | 自然语言；无内置 `/review` | 条件项 |
| Qoder CLI | `/review [instruction]` | 官方确认 |

## 比较边界

### 本页包含

- 本地 Diff 与指定文件审查
- Pull Request 审查和行内评论
- 安全审查、修复参数与审查规则

### 本页不包含

- CI 测试结果本身
- 普通自然语言“看看代码”但无产品工作流
- 自动合并或批准 Pull Request

## 跨产品事实

1. Codex、Qwen Code、Claude Code 和 Qoder CLI 都提供明确 Review 入口；Kimi Code 当前命令目录没有内置 `/review`。
2. Qwen Code `/review` 是随产品加载的内置 Skill，不是硬编码命令；它能审本地、文件与 PR，同仓 PR 使用隔离 Worktree。
3. Claude Code 自 v2.1.223 起把 `/review` 改为 `/code-review` 的别名；`/code-review` 不带级别时复用会话最近一次输入的级别，`ultra` 级别在云端运行 ultrareview。
4. Claude 与 Codex 的 GitHub 托管 Review 和本地 `/code-review` 是不同 Surface：前者可在 PR 上自动触发，后者在当前会话输出结果。
5. Qwen Code `/review` 自 2026-08-02 起提供 `publish-assets`：把证据图发布到用户指定的资产仓库并回写 URL，供 PR 评论嵌入；其余四家当前一手资料未列出同类内置入口。
6. Qwen Code medium/high effort Review 会在 `.qwen/reviews/` 保存结构化 JSON 产物，Web Shell 将其渲染为可筛选 findings 的交互式审查视图；其余四家当前一手资料未列出同类内置结构化审查结果视图。
7. Qwen Code v0.21.6 起提供 `qwen review cost-ledger`：从本次审查在磁盘上的用量记录聚合主循环与各 Agent 的模型调用和 token 消耗，内置 Review Skill 在 Step 8 运行并把结果归档进报告；其余四家当前一手资料未列出同类内置 Review 成本聚合入口。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/review` 为 `/code-review` 别名 · `ultra` 云审查 · GitHub Review |
| 入口与工具 | v2.1.223 起 `/review` 是 `/code-review` 的别名；`/code-review [low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [target]` 审查当前 Diff 或指定目标，`ultra` 运行云端 ultrareview；`/security-review` 检查 Diff 的安全漏洞。 |
| 核心机制 | `/code-review` 是 bundled Skill，默认作为带独立上下文窗口的后台 subagent 运行；`ultra` 与托管 Code Review 使用多 Agent 流水线，分别在云端与 GitHub PR 上分析并验证问题。 |
| 执行行为 | 默认审查分支领先 upstream 的提交加未提交改动；target 可为文件路径、PR 编号、分支名或 ref range（如 `main...my-feature`）。不带级别时复用会话最近一次输入的级别（v2.1.223，官方文档表述为使用会话当前 effort）；`low`/`medium` 只报高置信度 findings，`high` 至 `max` 放宽覆盖。`--fix` 把 findings 应用到工作树；`--comment` 把 findings 发布为 GitHub PR 行内评论。`/code-review ultra` 运行云端 ultrareview，不可用时回退为会话内本地审查。 |
| 运行范围 | 本地为当前分支 Diff 或指定 target；ultrareview 默认审查当前分支与默认分支的差异（含未提交与 staged 改动），可接受自定义 base 分支、PR 编号/URL 或说明文字，单次默认上限 500 个文件和 8,000 行变更。托管 Review 由仓库触发策略决定（PR 打开、每次 push 或手动 `@claude review`）。 |
| 后台与并发 | 本地审查默认后台 subagent，不占用会话上下文；上一次审查未完成、`-p` 模式或 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 时改为前台。托管 Code Review 在 Anthropic 基础设施并行运行。 |
| Git 与平台联动 | 本地审查遵循 `CLAUDE.md`，不读取 `REVIEW.md`；托管 Code Review 把仓库根目录 `REVIEW.md` 以最高优先级注入审查流水线每个 Agent。findings 去重、按严重级别排序后以行内评论发布到 PR，摘要进 review body，并生成 Claude Code Review check run。 |
| 状态与产物 | 本地 findings 文本（桌面等宿主应用经 `ReportFindings` 工具）、`--fix` 文件修改、GitHub 行内评论、review 摘要与 check run。 |
| 条件与边界 | `/code-review` 标记 `disable-model-invocation`，只在显式调用时运行。`ultra` 需要 claude.ai 账号登录并开启 usage credits；Amazon Bedrock、Google Cloud Agent Platform、Microsoft Foundry 与 ZDR 组织不可用，不可用时回退本地审查；账号可用 ultrareview 时 `/ultrareview` 是 `/code-review ultra` 的别名。后台审查的 `--fix` 编辑不经过会话检查点（`/rewind` 不回退），前台编辑可被 `/rewind` 回退。托管 Code Review 为 research preview，面向 Team/Enterprise，ZDR 组织不可用。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Commands](https://code.claude.com/docs/en/commands)、[Claude Code Review](https://code.claude.com/docs/en/code-review)、[Claude Code v2.1.223 changelog](https://github.com/anthropics/claude-code/blob/5cf69b18c86d/CHANGELOG.md)、[Claude Code ultrareview](https://code.claude.com/docs/en/ultrareview) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/review` · GitHub Review |
| 入口与工具 | CLI、IDE、App 使用 `/review`；可选择基线分支、未提交改动、指定提交或自定义审查说明。 |
| 核心机制 | 专用 Reviewer 以只读方式检查 Git 范围并输出按优先级排序的 findings。 |
| 执行行为 | 本地结果显示在当前对话或分离的 Review 线程；GitHub 集成可自动或通过 `@Codex` 审查 PR。 |
| 运行范围 | 本地只在 Git 仓库中运行；App 还可选择 unstaged、staged、commit、branch 或 last turn。 |
| 后台与并发 | App/IDE 可分离 Review，不阻塞主任务；GitHub Review 在远端执行。 |
| Git 与平台联动 | GitHub PR 评论和本地 Review 使用不同触发；项目指令可提供审查标准。 |
| 状态与产物 | 本地 findings、行内标注或 GitHub Review；默认不自动修改被审代码。 |
| 条件与边界 | 本地 `/review` 是只读 Reviewer；GitHub 自动化需要仓库连接和相应权限。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex code review](https://learn.chatgpt.com/docs/code-review)、[Codex GitHub integration](https://learn.chatgpt.com/docs/third-party/github)、[Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/review` 内置 Skill · `publish-assets` 证据图 · Web Shell 结构化结果 · `cost-ledger` 成本台账 |
| 入口与工具 | `/review` 审本地变化；`/review <file>` 审文件；`/review <pr>` 审 PR；`--comment` 发布 GitHub Review；`qwen review publish-assets` 发布证据图；`qwen review cost-ledger --plan <计划报告> [--out <路径>]` 聚合本次审查成本。 |
| 核心机制 | 内置 Skill 用 `qwen review fetch-pr`、并行审查 Agent、锚点验证和一次 Create Review API 提交；证据图经 Contents API（`gh` HTTPS）写入指定仓库，不克隆、不走 SSH。`cost-ledger` 聚合 chat 与 subagent transcript JSONL 中 assistant 事件携带的 `usageMetadata`，与 coverage gate 读取同一批记录。 |
| 执行行为 | 本地默认 medium effort，PR 默认 high；同仓 PR 强制在临时 Worktree 中读、测、审，跨仓 URL 使用轻量模式。证据图只接受 png/jpg/jpeg/gif/webp（拒绝 SVG），单文件 10 MiB、单批 40 MiB 上限，任一文件不合格则整批拒绝。medium/high effort 审查还会把规范 findings 与组合结论保存为与报告同名的结构化 JSON 产物，Web Shell 把它渲染成可筛选 findings 的交互式审查视图，Markdown 报告保持人类可读存档。`cost-ledger` 以 `--plan` 计划报告的 mtime 为计费窗口起点（计划前的引导轮次与台账运行后的组装不计入），按流输出主循环与每个审查 Agent 的模型调用数、输入/缓存/输出/思考 token 数与耗时；模型调用只统计携带 `usageMetadata` 的 assistant 记录，计数是下限而非精确 API 调用数。 |
| 运行范围 | 本地 working tree、单文件、PR number 或 URL；规则来自系统、项目 AGENTS.md 和 Skill。`cost-ledger` 的记录位置来自 CLI 导出的 `QWEN_CODE_PROJECT_DIR`/`QWEN_CODE_SESSION_ID` 环境变量，不接受模型指定的路径。 |
| 后台与并发 | 多维度审查 Agent 可并行执行；进度在当前 Surface 展示。 |
| Git 与平台联动 | `--comment` 在 GitHub 提交一次 Review；Qwen Code Action 还能在 PR 事件中自动运行审查。GitHub API 不能给 Review 评论附图，`publish-assets` 把证据图托管到 `QWEN_REVIEW_ASSETS_REPO`（`owner/repo`），写入 `pr-assets/<pr>-review` 分支并以 commit 固定的 URL 嵌入评论；GitHub Enterprise 加 `--host`。 |
| 状态与产物 | 同仓审查在项目 `.qwen/reviews/` 保存 Markdown 报告，medium/high effort 另有同名结构化 JSON 产物（跨仓轻量审查不落盘报告）；本地 findings、可选 GitHub 行内评论；findings 带 `assetFiles` 本地路径与 `assets` 已发布 URL，资产清单记录每个文件及落点 commit；Worktree 按流程清理。内置 Skill Step 8 运行 `cost-ledger`，把打印块原样粘贴进报告并在终端摘要转述首行；`--out` 保存完整台账 JSON（Skill 约定 `.qwen/reviews/<报告名>-cost-ledger.json`，worktree 模式落在主项目目录），打印块只列最大的 8 个 Agent，JSON 保留全部。 |
| 条件与边界 | Bare mode、禁用 Skills 或 Slash 时不可用；PR 读取/评论需要 GitHub 访问权限。`publish-assets` 还要求 `QWEN_REVIEW_ASSETS_REPO` 指定可推送仓库（未设置或格式错误退出码 3，不自动选仓库），并与 `submit` 共用授权门禁：只有被授权发布评论的运行才能推送，有效 `--comment` 强制 high effort，因此 low/medium 运行不会发布。结构化 JSON 产物与 Web Shell 视图只来自 medium/high effort 审查；low effort 不生成。`cost-ledger` 定位为 informational：记录缺失或无法计算时在 stderr 输出 `cost-ledger unavailable — <原因>` 并以退出码 0 结束，`--out` 写入失败降级为警告，均不阻塞审查。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current code review](https://github.com/QwenLM/qwen-code/blob/7dfc554dffcf52930ac35d4ea9c2558dfe36c22c/docs/users/features/code-review.md)、[Qwen Code review Skill](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/skills/bundled/review/SKILL.md)、[Qwen Code review evidence image publishing](https://github.com/QwenLM/qwen-code/commit/186812694c8d28c3434fa1c48dbca987281378f9)、[Qwen Code structured Web Shell review results](https://github.com/QwenLM/qwen-code/commit/7dfc554dffcf52930ac35d4ea9c2558dfe36c22c)、[Qwen Code review cost ledger](https://github.com/QwenLM/qwen-code/commit/4f79036a2269bb43f95f736ca8c44bc60b0cc9d6)、[Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 自然语言；无内置 `/review` |
| 入口与工具 | 直接用自然语言要求 Agent 审查改动，或创建自定义 Skill/Plugin Command；当前内置 Slash 目录没有 `/review`。 |
| 核心机制 | 使用 Read、Grep、Glob、Bash 和 Agent 组合完成分析，没有单独的内置 Review 协议。 |
| 执行行为 | 输出形式取决于提示词或自定义 Skill；不会自动获得固定的 Git 范围、严重级别或 PR 评论语义。 |
| 运行范围 | 由用户在提示中指定文件、Diff、提交或分支。 |
| 后台与并发 | 可把探索 Agent 放后台，或用 Swarm 并行审查不同文件；这不是专用 Review 入口。 |
| Git 与平台联动 | 可通过 Bash 调用 `git`/`gh`，或由 Plugin/Skill 封装团队审查流程。 |
| 状态与产物 | 默认是会话文本；是否修改文件或发布评论完全取决于后续工具调用。 |
| 条件与边界 | “没有内置 `/review`”只描述当前公开命令目录，不代表不能用通用 Agent 完成代码审查。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)、[Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)、[Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `/review [instruction]` |
| 入口与工具 | `/review [instruction]` 以 Prompt Command 审查本地待提交 Git 变化，支持 TUI 与 Headless。 |
| 核心机制 | 使用内置 Read/Grep/Glob/Bash 分析 pending changes；附加 instruction 可限定关注点。 |
| 执行行为 | 默认输出审查结果；Qoder Action 在 PR 上自动审查并发布反馈。 |
| 运行范围 | 本地 `/review` 面向 pending Git changes；PR Review 属于 GitHub Action Surface。 |
| 后台与并发 | Action 在 GitHub Runner 运行；本地命令在当前任务执行。 |
| Git 与平台联动 | AGENTS.md 可提供项目标准；Qoder Action 支持自动 PR Review 和 `@qoder` 交互。 |
| 状态与产物 | 本地报告或 GitHub PR 评论；不会自动批准或合并 PR。 |
| 条件与边界 | GitHub Review 需要安装 App、配置 PAT/Secret 和 Workflow。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI commands](https://docs.qoder.com/en/cli/command)、[Qoder Action](https://docs.qoder.com/en/cli/qoder-action)、[Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools) |

## 官方来源

- [Claude Code Commands](https://code.claude.com/docs/en/commands)
- [Claude Code Review](https://code.claude.com/docs/en/code-review)
- [Claude Code v2.1.223 changelog](https://github.com/anthropics/claude-code/blob/5cf69b18c86d/CHANGELOG.md)
- [Claude Code ultrareview](https://code.claude.com/docs/en/ultrareview)
- [Codex code review](https://learn.chatgpt.com/docs/code-review)
- [Codex GitHub integration](https://learn.chatgpt.com/docs/third-party/github)
- [Codex CLI commands](https://developers.openai.com/codex/cli/slash-commands)
- [Qwen Code current code review](https://github.com/QwenLM/qwen-code/blob/7dfc554dffcf52930ac35d4ea9c2558dfe36c22c/docs/users/features/code-review.md)
- [Qwen Code review Skill](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/skills/bundled/review/SKILL.md)
- [Qwen Code review evidence image publishing](https://github.com/QwenLM/qwen-code/commit/186812694c8d28c3434fa1c48dbca987281378f9)
- [Qwen Code structured Web Shell review results](https://github.com/QwenLM/qwen-code/commit/7dfc554dffcf52930ac35d4ea9c2558dfe36c22c)
- [Qwen Code review cost ledger](https://github.com/QwenLM/qwen-code/commit/4f79036a2269bb43f95f736ca8c44bc60b0cc9d6)
- [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)
- [Kimi Code current slash commands](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/slash-commands.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Kimi Code current agents](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/customization/agents.md)
- [Qoder CLI commands](https://docs.qoder.com/en/cli/command)
- [Qoder Action](https://docs.qoder.com/en/cli/qoder-action)
- [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)

## 关联能力

- [代码审查](../commands/cmd-review.md)
- [Pull Request](./execution-pr.md)
- [CI 自动化](./execution-ci.md)
