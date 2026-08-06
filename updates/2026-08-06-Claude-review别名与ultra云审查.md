# Claude Code `/review` 成为 `/code-review` 别名与 `ultra` 云审查

Claude Code 在 v2.1.223（2026-08-06T00:52:37Z 发布）把 `/review` 改为 `/code-review` 的别名：`/code-review` 审查当前 Diff 或 PR（`/code-review <level> <pr#>`），不带级别时复用会话最近一次输入的级别，`ultra` 级别运行云端 ultrareview。此前 v2.1.222（2026-08-04T22:39:55Z 发布）移除了 ultraplan 功能，官方命令表不再列出 `/ultraplan`。矩阵的“代码 Review”字段和“代码审查”命令详情此前仍按旧的 `/review [PR]` 快速审查行为记录，本次更新 Claude Code 记录，并在命令目录中移除 `/ultraplan`（不新增同义字段，并入现有 `execution-review` 与 `cmd-review`）。新增来源固定到两个版本的更新日志提交 SHA。

## 修正

- `execution-review` 矩阵 Claude Code 列由 `/review` · `/code-review` · GitHub Review 更新为 `/review` 为 `/code-review` 别名 · `ultra` 云审查 · GitHub Review。
- Claude Code 详情入口与工具更新：v2.1.223 起 `/review` 是 `/code-review` 的别名；`/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [target]` 审查当前 Diff 或指定目标；`/security-review` 检查 Diff 安全漏洞。
- Claude Code 详情核心机制更新：`/code-review` 是 bundled Skill（官方 Skills 页 bundled skills 列表只含 `/code-review`，不再含 `/review`），默认作为带独立上下文窗口的后台 subagent 运行。
- Claude Code 详情执行行为更新：默认范围为分支领先 upstream 的提交加未提交改动；target 可为文件路径、PR 编号、分支名或 ref range（如 `main...my-feature`）；不带级别时复用会话最近一次输入的级别（v2.1.223 更新日志，官方 code-review 文档表述为“使用会话当前 effort”）；`low`/`medium` 只报高置信度 findings，`high` 至 `max` 放宽覆盖；`--fix` 应用 findings，`--comment` 发布 GitHub PR 行内评论；`/code-review ultra` 运行云端 ultrareview，不可用时回退会话内本地审查。
- Claude Code 详情运行范围更新：ultrareview 默认审查当前分支与默认分支的差异（含未提交与 staged 改动），可接受自定义 base 分支、PR 编号/URL 或说明文字，单次默认上限 500 个文件和 8,000 行变更；托管 Review 触发为 PR 打开、每次 push 或手动 `@claude review`。
- Claude Code 详情后台与并发更新：本地审查默认后台 subagent；上一次审查未完成、`-p` 模式或 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 时改为前台（原记录“本地 Review 占用当前会话或插件 Agent”不准确）。
- Claude Code 详情 Git 与平台联动更新：本地审查遵循 `CLAUDE.md`、不读取 `REVIEW.md`（原记录把 `REVIEW.md` 泛化为本地规则不准确）；`REVIEW.md` 由托管 Code Review 以最高优先级注入流水线每个 Agent；findings 去重、按严重级别排序后以行内评论发布并生成 Claude Code Review check run。
- Claude Code 详情条件与边界更新：`/code-review` 标记 `disable-model-invocation`；`ultra` 需要 claude.ai 账号登录并开启 usage credits，Amazon Bedrock、Google Cloud Agent Platform、Microsoft Foundry 与 ZDR 组织不可用，不可用时回退本地审查；账号可用 ultrareview 时 `/ultrareview` 是 `/code-review ultra` 的别名；后台审查的 `--fix` 编辑不经过会话检查点（`/rewind` 不回退），前台编辑可被 `/rewind` 回退；托管 Code Review 为 research preview，面向 Team/Enterprise，ZDR 组织不可用。
- `cmd-review` 命令详情 Claude Code 更新：主命令改为 `/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [target]` 与 `/security-review`，`/review` 移入别名；参数、可用模式（`-p` 支持 `/code-review ultra`，另有 `claude ultrareview` 子命令）、保存范围（后台 `--fix` 不经检查点）与条件同步更新。
- Claude Code 命令目录移除 `/ultraplan`（v2.1.222 “Removed ultraplan feature”，官方命令页全文无 ultraplan），并新增说明 `/review` 与 `/ultrareview` 的别名关系。
- 跨产品事实更新：`execution-review` 新增 Claude v2.1.223 别名与级别复用事实；`cmd-review` 的 Claude 三命令拆分表述改为别名表述。
- 新增来源 `claude-review-alias`（v2.1.223 更新日志）与 `claude-ultrareview`（ultrareview 文档），固定到更新日志提交 SHA；其余四家结论不变。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [代码 Review 详情](../docs/capabilities/execution/execution-review.md)
- [代码审查命令详情](../docs/capabilities/commands/cmd-review.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Claude Code 官方仓库提交 `5cf69b18c86d`（2026-08-06T00:52:31Z “chore: Update CHANGELOG.md and feed.xml”，对应 Release v2.1.223，2026-08-06T00:52:37Z）：更新日志原文 “Changed `/review` to be an alias of `/code-review`, which reviews the current diff or a PR (`/code-review <level> <pr#>`); use `/code-review ultra` for a deep cloud review” 与 “Changed `/code-review` with no effort level to reuse the level you typed last; type a level like `/code-review high` to change it”。
- Claude Code 官方仓库提交 `3b272769d0c8`（2026-08-04T22:39:48Z “chore: Update CHANGELOG.md and feed.xml”，对应 Release v2.1.222，2026-08-04T22:39:55Z）：更新日志原文 “Removed ultraplan feature”。2026-08-06 抓取的官方命令页（https://code.claude.com/docs/en/commands）全文无 “ultraplan” 出现。
- 官方命令页 `/code-review` 行：`/code-review [low|medium|high|xhigh|max|ultra] [--fix] [--comment] [target]`，描述为 bundled Skill，`--fix` 应用 findings、`--comment` 发布 GitHub PR 行内评论、`ultra` 运行深度云审查（链接 /docs/en/ultrareview）。
- 官方 Skills 页 bundled skills 列表包含 `/code-review`，不包含 `/review`（佐证 `/review` 不再是独立 bundled Skill）。
- 官方 code-review 文档页：本地审查默认作为带独立上下文窗口的后台 subagent 运行；范围为分支领先 upstream 的提交加未提交改动；target 为文件路径、PR 编号、分支名或 ref range（如 `main...my-feature`）；“Without an effort argument, the review uses the session's current effort”；`low`/`medium` 只报高置信度 findings、`high` 至 `max` 放宽覆盖；本地审查遵循 `CLAUDE.md` 但不读取 `REVIEW.md`；托管 Code Review 将 `REVIEW.md` 以最高优先级注入每个 Agent；findings 去重、按严重级别排序后以行内评论发布，摘要进 review body，并生成 Claude Code Review check run；托管 Review 触发为 PR 打开、每次 push 或手动 `@claude review`；“Code Review is in research preview, available for Team and Enterprise subscriptions”；ZDR 组织不可用。
- 官方 ultrareview 文档页：`/code-review ultra` 为主入口；“When ultrareview is available to your account, `/ultrareview` is an alias”；非交互入口 `claude ultrareview` 与 `claude -p '/code-review ultra'`；需要 claude.ai 账号认证与 usage credits；Amazon Bedrock、Google Cloud's Agent Platform、Microsoft Foundry 与 ZDR 组织不可用；不可用时 “`/code-review ultra` runs a local review in your session instead”；默认范围为当前分支与默认分支的差异（含未提交与 staged 改动），可接受 base 分支、PR 编号/URL 或说明文字；默认上限 500 个文件与 8,000 行变更。
- 说明：2026-08-06 抓取的官方命令页 `/review [pr]` 行仍按旧的“快速单遍只读 PR Review Skill”描述，该页面尚未同步 v2.1.223 行为；本次记录以 v2.1.223 更新日志与官方 Skills 页为准。
