# Qwen Code Review 证据图发布与 execution-review 字段深化

Qwen Code 在 2026-08-02 的提交中为内置 `/review` Skill 增加 `publish-assets` 子命令：GitHub API 不能给 Review 评论附图，因此把证据图（TUI 截图、渲染对比等）托管到用户指定的资产仓库，并以 commit 固定的 URL 嵌入 PR 评论。本次把这个一手确认的功能并入现有 `execution-review` 字段的 Qwen Code 详情（不新增同义字段），并在跨产品事实中记录其余四家当前一手资料未列出同类内置入口。

## 修正

- `execution-review` 矩阵 Qwen Code 列由 `/review` 内置 Skill 改为 `/review` 内置 Skill · `publish-assets` 证据图。
- Qwen Code 详情的入口与工具新增：`qwen review publish-assets` 发布证据图。
- Qwen Code 详情的核心机制新增：证据图经 Contents API（`gh` HTTPS）写入指定仓库，不克隆、不走 SSH。
- Qwen Code 详情的执行行为新增：只接受 png/jpg/jpeg/gif/webp（拒绝 SVG），单文件 10 MiB、单批 40 MiB 上限，任一文件不合格则整批拒绝。
- Qwen Code 详情的 Git 与平台联动新增：`QWEN_REVIEW_ASSETS_REPO`（`owner/repo`）指定资产仓库，文件写入 `pr-assets/<pr>-review` 分支，评论嵌入 commit 固定的 URL；GitHub Enterprise 加 `--host`。
- Qwen Code 详情的状态与产物新增：findings 带 `assetFiles` 本地路径与 `assets` 已发布 URL，资产清单记录每个文件及落点 commit。
- Qwen Code 详情的条件与边界新增：`QWEN_REVIEW_ASSETS_REPO` 未设置或格式错误退出码 3，不自动选仓库；与 `submit` 共用授权门禁，只有被授权发布评论的运行才能推送，有效 `--comment` 强制 high effort，因此 low/medium 运行不会发布。
- 跨产品事实新增：Qwen Code `/review` 自 2026-08-02 起提供 `publish-assets`；其余四家当前一手资料未列出同类内置入口。
- 新增来源 `qwen-review-assets`，固定到实现提交 SHA。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [代码 Review 详情](../docs/capabilities/execution/execution-review.md)

## 证据版本

- Qwen Code 官方仓库提交 `186812694c8d28c3434fa1c48dbca987281378f9`（`feat(review): publish evidence images to a user-designated assets repo (#8351)`）：在 `packages/cli/src/commands/review/publish-assets.ts` 与 `lib/assets.ts` 增加 `publish-assets` 子命令，在 `packages/cli/src/commands/review.ts` 注册，并在 `docs/users/features/code-review.md`（新增 “Evidence Images in PR Comments”）与 `packages/core/src/skills/bundled/review/SKILL.md`（新增 “Evidence images (`publish-assets`)”）同步文档。
- 同一 SHA 的 `packages/cli/src/commands/review/lib/assets.ts` 定义 `ASSET_EXTENSIONS`（png/jpg/jpeg/gif/webp）、`MAX_ASSET_BYTES`（10 MiB）、`MAX_TOTAL_ASSET_BYTES`（40 MiB）、分支 `pr-assets/<pr>-review`、内容哈希命名和 commit 固定的 `/raw/` URL 形式。
- 用户用法为 `export QWEN_REVIEW_ASSETS_REPO=owner/repo` 后执行 `/review <pr> --comment`；未指定仓库时 findings 保留本地 `assetFiles` 路径，评论保持纯文本。
