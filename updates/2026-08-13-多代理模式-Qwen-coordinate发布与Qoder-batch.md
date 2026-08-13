# 多模型或多代理模式：Qwen `/coordinate` 随 v0.21.11 发布，Qoder 补录 `/batch`

本次更新 `cmd-collaboration`（多模型或多代理模式）字段的两处记录：

1. Qwen Code v0.21.11（2026-08-13T05:25:04Z 发布，标签提交 `7a48b9278f6524925420bc60e6e33e4d9ff6c44d`）的发布说明 Highlights 与 Features 均列出 PR #8804（提交 `8858d4340bbb`）：`/coordinate` 原生多代理工作流与 Agent Team 运行时进入正式通道。此前记录为“main 分支，尚未发布”的条件项随之解除，发布说明另写明结果会自动转发给 Leader Agent。
2. Qoder CLI 官方文档站已改版：原命令页 `docs.qoder.com/en/cli/command` 返回 404，Slash 命令参考迁移到 `docs.qoder.com/cli/slash-reference`。改版后的参考页“Built-in Skills”一节列出 `/batch`：在隔离 git worktree 中派出并行工作 Agent 对多个文件应用批量修改，要求当前目录为 Git 仓库。该命令此前未收录，本次补入。

## 修正

- `cmd-collaboration` 字段 Qwen Code 矩阵结论由 "`/arena` · `/batch` · `/coordinate`（条件：main 分支，尚未发布）" 改为 "`/arena` · `/batch` · `/coordinate`（v0.21.11 起）"；详情条件末尾由“条件：main 分支，尚未发布”改为“随 v0.21.11（2026-08-13 发布）进入正式通道”，来源新增 v0.21.11 发布说明。
- `cmd-collaboration` 字段 Qoder CLI 矩阵结论由 "`/quest`" 改为 "`/quest` · `/batch`"；详情补入 `/batch` 的执行行为（隔离 worktree 并行 Agent 批量修改）、条件（当前目录须为 Git 仓库），参数与模式范围按文档未说明记录，不推测引入版本（官方发行说明至 1.1.20 未提及）。
- 跨产品事实更新：`/coordinate` 条目改为随 v0.21.11 发布；新增 Qoder `/batch` 条目。
- `docs/01-Slash命令矩阵.md`：对照表“多模型或多代理协作模式”行更新 Qwen Code 与 Qoder CLI 两列；随产品 Skill 段落的 `/coordinate` 发布状态更新为随 v0.21.11 发布并补标签提交；Qoder CLI 命令目录补入 `/batch`，并注明文档站改版、旧地址 404、改版后参考页还有其他未收录命令（属于其他能力字段，另行核对）；来源列表新增 Qwen v0.21.11 发布说明，Qoder 命令来源改链到 `cli/slash-reference`。
- `docs/09-版本与证据.md`：Qwen Code 主要材料中“原生多代理协调”由“合入 main 尚未发布”改为“随 v0.21.11 发布”；Qoder CLI 核对日期更新为 2026-08-13，主要材料补入文档站改版与 `/batch` 内置 Skill；官方来源表 Qwen Code 命令列新增 v0.21.11 发布说明链接，Qoder CLI 命令列改链到 `cli/slash-reference`。
- `site/data.js` 来源：`qoder-commands` 更新为改版后的 Slash 命令参考页（标签改为 “Qoder CLI slash commands”）；新增 `qwen-v02111-release`。由于旧地址已失效，所有引用 `qoder-commands` 的产品记录页（命令、执行、扩展、会话、模型分类共 44 页）的来源链接经 `npm run generate` 一并指向新页面，内容字段未变。
- `npm run generate` 重新生成 `docs/capabilities/`（`cmd-collaboration.md` 内容更新，其余页面仅来源链接变化）；`npm test` 全部通过。

## 影响页面

- [Slash 命令矩阵](../docs/01-Slash命令矩阵.md)
- [多模型或多代理模式详情](../docs/capabilities/commands/cmd-collaboration.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Qwen Code v0.21.11 发布说明（2026-08-13T05:25:04Z 发布，标签提交 `7a48b9278f6524925420bc60e6e33e4d9ff6c44d`）Highlights 原文：“Enabled native multi-agent workflows with read-only teammates via the /coordinate command. (#8804)”；Features 原文：“The /coordinate command now supports native multi-agent workflows with read-only teammates and automated result forwarding to the leader agent. (#8804)”。
- Qoder CLI Slash 命令参考（`docs.qoder.com/cli/slash-reference`，2026-08-13 核对）Built-in Skills 一节原文：“`/batch`: Spawn parallel working agents in an isolated git worktree to apply batch changes across multiple files (requires the current directory to be a Git repository)”。原地址 `docs.qoder.com/en/cli/command` 与 `docs.qoder.com/cli/command` 均返回 404，`docs.qoder.com/en/cli/permissions` 等其余旧地址重定向到新路径仍可访问。
- Qoder CLI 发行说明（最近至 1.1.20，2026-08-12）未提及 `/batch`，故不写引入版本。
- 其他产品本次无同类变化：Claude Code v2.1.228–v2.1.231（2026-08-11 至 2026-08-13）更新日志无新增协作命令（v2.1.229 为 self-hosted runner hooks、plugin marketplace `command` 来源与 `ListAgents` 状态标注等）；Codex 2026-08-13 合入提交（#38390–#38406，含 tool lifecycle 扩展读取会话历史）不涉及协作入口；Kimi Code 0.36.0 发布后的提交为重构、测试与修复，`/swarm` 记录不变。
- 同属 v0.21.11 的 Agent Plugins v1（#8834）与 ACP Goal v3（#8732）分属 `extension-plugins` 与 Goal 相关字段，本次不处理；Qoder 改版命令参考列出的其他未收录命令（如 `/kanban`、`/loop`、`/marketplace`、`/rewind` 等）分属其他能力字段，另行核对。
