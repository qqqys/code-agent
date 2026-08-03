# Qwen Code Review 结构化 Web Shell 结果

Qwen Code 在 2026-08-03（UTC）的官方仓库提交中为内置 `/review` 增加结构化 Web Shell 审查结果：medium/high effort 审查在 `.qwen/reviews/` 除 Markdown 报告外再保存同名结构化 JSON 产物，保存规范 findings 与组合结论，Web Shell 把该文档渲染为可筛选 findings 的交互式审查视图。本次把这个一手确认的功能并入现有 `execution-review` 字段的 Qwen Code 详情（不新增同义字段），并把 `qwen-review-current` 的 code-review.md 证据固定到记录该功能的提交 SHA。

## 修正

- `execution-review` 矩阵 Qwen Code 列由 `/review` 内置 Skill · `publish-assets` 证据图 更新为 `/review` 内置 Skill · `publish-assets` 证据图 · Web Shell 结构化结果。
- Qwen Code 详情的执行行为新增：medium/high effort 审查把规范 findings 与组合结论保存为与报告同名的结构化 JSON 产物，Web Shell 渲染为可筛选 findings 的交互式审查视图，Markdown 报告保持人类可读存档。
- Qwen Code 详情的状态与产物更新：同仓审查在项目 `.qwen/reviews/` 保存 Markdown 报告，medium/high effort 另有同名结构化 JSON 产物（跨仓轻量审查不落盘报告）。
- Qwen Code 详情的条件与边界新增：结构化 JSON 产物与 Web Shell 视图只来自 medium/high effort 审查，low effort 不生成。
- 跨产品事实新增：Qwen Code medium/high effort Review 在 `.qwen/reviews/` 保存结构化 JSON 产物并由 Web Shell 渲染交互式视图；其余四家当前一手资料未列出同类内置结构化审查结果视图。
- 新增来源 `qwen-review-web-shell`，固定到实现提交 SHA；`qwen-review-current` 的 code-review.md 链接由 `8a44b1b9f79341a0faca9814fb1b57f0f1b354a2` 固定到 `7dfc554dffcf52930ac35d4ea9c2558dfe36c22c`。
- `docs/09-版本与证据.md` 的 Qwen Code 坐标材料与官方来源表同步补充。
- 其余四家结论不变。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [代码 Review 详情](../docs/capabilities/execution/execution-review.md)

## 证据版本

- Qwen Code 官方仓库提交 `7dfc554dffcf52930ac35d4ea9c2558dfe36c22c`（`feat(review): Add structured Web Shell review results (#8402)`）：在 `docs/users/features/code-review.md` 的 “Review Reports” 一节新增结构化 JSON 产物与 Web Shell 视图说明，在 `docs/design/web-shell-review-result.md` 记录产物结构，在 `packages/cli/src/commands/review/` 与 `packages/web-shell/client/` 实现产物写入与渲染。
- 同一 SHA 的 `docs/users/features/code-review.md`：“Medium- and high-effort reviews also save a structured JSON companion with the same stem (for example, `2026-04-06-143022-pr-123.json`) holding the canonical findings and the composed verdict as data. Qwen Code's Web Shell renders that document as an interactive review view with filterable findings; the Markdown report stays the human-readable archive.”
- 同一 SHA 的 `docs/users/features/code-review.md` 记录既有边界：同仓审查结果保存为项目 `.qwen/reviews/` 下的 Markdown 文件，跨仓轻量审查不落盘报告。
- 设计文档说明 Web Shell 通过会话产物元数据 `artifactType: 'code_review'` 识别该文档，并在运行时校验 JSON；文档损坏时展示错误视图并回退到 Markdown 报告链接。
