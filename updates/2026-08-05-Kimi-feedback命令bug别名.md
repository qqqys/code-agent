# Kimi Code `/feedback` 命令增加 `/bug` 别名

Kimi Code 官方仓库在 2026-08-04 合入提交 `8db7d42f2347`（PR #2614），把 `bug` 注册为 `/feedback` 命令的别名，并同步更新中英文 Slash 命令文档。矩阵的"反馈或问题上报"行和 Kimi Code 命令目录此前没有记录该别名，本次补入 `/bug`，并把命令目录来源固定到该提交 SHA。

## 修正

- Slash 命令矩阵"反馈或问题上报"行 Kimi Code 列由 `/feedback` 更新为 `/feedback`、`/bug`（条件：main 分支，尚未发布）。
- Kimi Code 命令目录新增 `/bug`，并注明它是 `/feedback` 的别名。
- 该别名于 2026-08-04T15:54Z 合入 main 分支；最新 Release 0.32.0 发布于 2026-08-04T07:14Z，早于合入，changeset 标记为 patch，因此记录为条件项。
- Kimi Code Slash 命令来源由 main 分支改固定到提交 `8db7d42f2347`；该提交的中文文档命令清单与矩阵 Kimi Code 目录完全一致（43 个主命令），期间没有其他命令增删。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Kimi Code 官方仓库提交 `8db7d42f23472a692eb389a0e0e5a3e18aa1b94d`（`feat(tui): add /bug as an alias for /feedback (#2614)`，2026-08-04）：changeset `.changeset/feedback-bug-alias.md` 原文 “Add /bug as an alias for the /feedback slash command. Type /bug to submit feedback.”，级别 patch；`apps/kimi-code/src/tui/commands/registry.ts` 将 feedback 命令的 `aliases` 由 `[]` 改为 `['bug']`；`apps/kimi-code/test/tui/commands/registry.test.ts` 断言 `findBuiltInSlashCommand('bug')?.name` 为 `feedback`；`docs/zh/reference/slash-commands.md` 该行更新为 “`/feedback` | `/bug` | 提交反馈，可附加诊断日志和代码库上下文 | 是”。
- Kimi Code 官方 Release：最新版本 `@moonshot-ai/kimi-code@0.32.0` 发布于 2026-08-04T07:14Z，早于该提交合入，发布说明不包含此别名。
