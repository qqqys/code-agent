# Qwen Code Review 仓库上下文清单 `repo-context`

Qwen Code 官方仓库在 2026-08-06 合入提交 `e76dff1c6b30`（PR #8401），为 Review 增加仓库上下文清单：仓库把严格 JSON 提交到 `.qwen/review-context.json`，声明路径、领域、推荐测试、必需审查角色等有界审查指引；`qwen review` CLI 同时注册 `repo-context` 子命令，medium/high effort 的本地与同仓 PR 审查在计划采集后调用它并把指引并入审查计划。该功能随 v0.21.7（2026-08-06T23:19:06Z 发布）进入正式版本。矩阵的“代码 Review”字段此前没有记录该入口，本次并入现有 `execution-review` 字段的 Qwen Code 详情（不新增同义字段），并新增来源固定到合入提交 SHA。其余四家核对无变化：Claude Code 仍是 `/code-review` 与托管 Review（`REVIEW.md` 注入），Codex 仍是 `/review` 与 GitHub Review，Kimi Code 仍无内置 `/review`，Qoder CLI 仍是 `/review [instruction]` 与 Qoder Action。

## 修正

- `execution-review` 矩阵 Qwen Code 列由 `/review` 内置 Skill · `publish-assets` 证据图 · Web Shell 结构化结果 · `cost-ledger` 成本台账 更新为 `/review` 内置 Skill · `publish-assets` 证据图 · Web Shell 结构化结果 · `cost-ledger` 成本台账 · `repo-context` 仓库上下文清单。
- Qwen Code 详情入口与工具新增：`qwen review repo-context --plan <计划 JSON> --worktree <工作树> --out <产物路径>`，medium/high effort 审查在计划采集后由流程调用。
- Qwen Code 详情核心机制新增：清单顶层字段固定为 `version`、`label`、`rules`；每条规则必填 `paths`（仓库相对、`/` 分隔 glob，支持 `*`、`?` 与完整 `**` 段，区分大小写），可选 `relatedPaths`、`domains`、`recommendedTests`、`requiredConfigurations`、`requiredAgents`、`unverifiedDimensions`、`verificationNotes`；未知字段、注释、不支持的版本、超限值、控制字符与重复数组项被拒绝；manifest provider 在进程内静态注册（provider 名 `manifest`），输出经共享 `validateRepositoryContext` 校验，不支持动态插件注册、shell 执行、模板或不透明载荷。
- Qwen Code 详情执行行为新增：规则在任一变更文件命中其 `paths` glob 时生效，所有命中规则的指引合并、去重并排序；审查 Agent 获得领域与相关文件，build-and-test Agent 获得推荐测试、必需配置与验证说明，`requiredAgents` 只在所选 effort 与拓扑本就运行相应角色时并入名册，`unverifiedDimensions` 作为非阻塞证据边界披露；`relatedPaths` 展开限定工作树内、不进入依赖或构建产物目录，访问条目 16384、解析文件 128 或匹配工作量预算超限即失败关闭；命令校验 `--out` 与 `--plan` 不同文件、worktree 与 `plan.worktreePath` 一致、`plan.mergeBaseSha` 可解析，成功后写入 `--out` 并原子覆写计划文件。
- Qwen Code 详情运行范围新增：仓库上下文只在 medium/high effort 的本地与同仓 PR 审查中生效；low effort 与跨仓轻量审查跳过；PR 审查的清单从 merge base 读取，PR head 无法为自己加入或移除指引；本地审查从当前 worktree 读取。
- Qwen Code 详情状态与产物新增：`repo-context` 产物为写入 `--out` 的 JSON（校验后的 `RepositoryContext` 对象，或无上下文时 `null`），并回写更新后的计划文件。
- Qwen Code 详情条件与边界新增：清单失败关闭——缺失得到 `null` 上下文，存在但不可读、超过 1 MB 或内容非法时抛错，存在但非法的上下文让所有下游消费者失败而不是被静默丢弃；PR 计划的 merge base 未解析（`mergeBaseSha: null` 或 base 抓取失败）时不读 worktree，直接写 `null` 产物。
- 跨产品事实新增一条：其余四家当前一手资料未列出同类内置 Review 仓库上下文入口。
- 新增来源 `qwen-review-repo-context`，固定到合入提交 SHA；Qwen Code 核对日期更新为 2026-08-07。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [代码 Review 详情](../docs/capabilities/execution/execution-review.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code 官方仓库提交 `e76dff1c6b3069cd12709a82bd15d62f7a6ab282`（`feat(review): add declarative repository-context manifest (#8401)`，2026-08-06T15:13:48Z 合入 main）：`packages/cli/src/commands/review.ts` 注册 `repo-context` 子命令（描述 “Attach bounded repository-specific context to a review plan”）；`packages/cli/src/commands/review/repo-context.ts` 定义必填选项 `--plan`（“Existing review plan JSON to update”）、`--worktree`（“Repository worktree used to resolve context”）、`--out`（“Independent repository-context artifact path”），校验 `--out` 与 `--plan` 不同文件（“repo-context: --out must differ from --plan”）、worktree 为目录、`plan.worktreePath` 一致、`plan.mergeBaseSha` 有效且可解析，成功后把上下文 JSON 写入 `--out` 并原子覆写计划，stdout 输出 `Wrote repository context (manifest) to <路径>` 或 `Wrote null repository context to <路径>`；`packages/cli/src/commands/review/lib/manifest-repository-context.ts` 实现清单解析、glob 匹配、大小与符号链接边界（失败关闭），`packages/cli/src/commands/review/lib/repository-context.ts` 定义共享校验；同一提交新增设计文档 `docs/design/review-repository-context.md` 并在 `docs/users/features/code-review.md` 增加 “Repository Context” 小节。
- 同一提交处 `docs/users/features/code-review.md`：清单为严格 JSON，顶层字段 `version`、`label`、`rules`；规则命中以变更文件匹配 `paths` glob 为准（`*`、`?`、`**` 段，区分大小写），命中规则指引合并；PR 审查从 merge base 读取清单、本地审查从当前 worktree 读取；low effort 与跨仓审查跳过仓库上下文。
- 同一提交处 `docs/design/review-repository-context.md`：清单读取上限 1 MB，缺失返回 `null`、不可读或超限抛错；`relatedPaths` 展开不进入依赖与构建产物目录，访问条目 16384、解析文件 128 与匹配工作量预算超限即失败关闭；`requiredAgents` 只在所选 effort、拓扑与模式本就允许时并入；`unverifiedDimensions` 作为非阻塞证据边界披露；PR 计划 merge base 未解析时不读 worktree、直接写 `null` 产物。
- Qwen Code 官方 Release v0.21.7（2026-08-06T23:19:06Z 发布）：Features 包含 “Introduces a declarative .qwen/review-context.json manifest and the review repo-context command to customize review plans with repository-specific context. (#8401)”。
