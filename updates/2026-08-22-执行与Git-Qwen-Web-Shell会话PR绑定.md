# Qwen Code Web Shell 会话 PR 绑定（v0.22.0）

Qwen Code v0.22.0（2026-08-22 发布）把 Web Shell Git 对话框创建的 GitHub PR 绑定到发起会话。此前 Git 对话框创建 PR 后只显示状态消息，不保留 PR 坐标；绑定后侧栏可以回答“哪个会话对应 PR #N”。绑定时机是 `GitDialog.doCreatePr` 创建 PR 成功后，用对话框已有的 `sessionId` 调 `updateSessionMetadata(sessionId, { pr: {number, url} })` 单条写入；Daemon 的 REST 与 workspace 作用域 `PATCH /session/:id/metadata` 路由以及 ACP `session/update_metadata` 都接受该字段。绑定按绑定时间排序、按 PR 号去重，重复绑定刷新 URL 并移到最新位，每会话上限 10 条、超出丢弃最旧。绑定持久化为会话旁挂 sidecar `<chatsDir>/<sessionId>.pr.json`（`{prs: [{number, url, createdAt}]}`），Daemon 重启后由会话列表回填，归档/取消归档随会话移动、删除会话时清理。侧栏会话行、任务总览面板与恢复/删除/释放会话选择器显示 `#N` 徽标（多条为 `#N +M`），点击经桌面适配外链打开最新 PR；会话详情悬浮列出全部绑定（最新在前）。侧栏与恢复对话框搜索除标题和会话 ID 外，还匹配任意绑定 PR 号（`9517` 或 `#9517` 精确匹配）、分支名与 worktree slug。`url` 仅限 http(s) 且不超过 2048 字符，在路由、bridge、SDK 校验器与 sidecar 四层统一校验。该能力只覆盖 Web Shell Git 对话框创建的 PR：Agent 在 Shell 内自行 `gh pr create` 不会被拦截绑定，无会话上下文的 workspace 级对话框不回写，也没有清除绑定的入口。

## 修正

- `execution-pr` 字段 Qwen Code 矩阵结论由 "`/review --comment` · Actions · `gh`" 改为追加 "· 条件：Web Shell Git 对话框创建的 PR 绑定源会话（v0.22.0 起）"。
- Qwen Code 详情 entry 补入 Web Shell Git 对话框（Commit 视图 Create Pull Request）创建 PR 成功后经 `updateSessionMetadata` 单条绑定；primitives 补入 Daemon 会话元数据路由与 `<chatsDir>/<sessionId>.pr.json` sidecar；behavior 补入绑定排序、去重、10 条上限、重启回填、归档/删除随动，以及 `#N` 徽标、悬浮列表与搜索匹配范围；scope 标注绑定限有会话上下文的 Web Shell Git 对话框创建路径；background 补入 `session_metadata_updated` SSE 与目录轮询约 2 秒传播；integration 补入两个 `PATCH /session/:id/metadata` 路由与 ACP `session/update_metadata`；artifacts 补入绑定 sidecar 与徽标；conditions 补入 v0.22.0 发布、仅覆盖 Git 对话框创建的 PR、`gh pr create` 不绑定、无清除入口与 URL 校验。
- `execution-pr` 跨产品事实新增一条：Qwen Code 自 v0.22.0 起把 Web Shell Git 对话框创建的 PR 绑定到源会话，侧栏与选择器显示 `#N` 徽标、可按 PR 号/分支名/worktree slug 反查，绑定持久化为 `<chatsDir>/<sessionId>.pr.json`，每会话上限 10 条。
- 新增来源：`qwen-v022-release`、`qwen-pr-binding-commit`（合并提交 `e2de7d288427`）、`qwen-pr-binding-design`（设计文档固定到该提交）、`qwen-pr-binding-service`/`qwen-pr-binding-badge`/`qwen-pr-binding-search`（固定到 v0.22.0 标签提交 `1c3a385d9bc8`）。
- `docs/09-版本与证据.md`：Qwen Code 核对日期保持 2026-08-22；主要材料补充 Web Shell 会话 PR 绑定；官方来源表执行与 Git 列新增 v0.22.0 发布说明、绑定提交、设计文档与 sidecar 源码链接。
- `npm run generate` 重新生成 `docs/capabilities/execution/`（`execution-pr.md` 内容更新）与 `docs/06-任务执行与Git矩阵.md`。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [Pull Request 详情](../docs/capabilities/execution/execution-pr.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- v0.22.0 发布说明（2026-08-22T14:58:36Z）亮点原文："Created GitHub PRs are now bound to originating sessions with a searchable list and sidebar badge. (#9543)"；Aone & GitHub Integration 节原文："Binds created GitHub PRs to their originating sessions with a searchable list and sidebar badge, supporting up to 10 PRs per session with latest-first ordering. (#9543)"。
- PR #9543（2026-08-22T01:30:48Z 合并，合并提交 `e2de7d288427faae072008f3aab60ada8fec612e`）说明原文："When a pull request is created from the Web Shell Git dialog, the PR number and URL are now bound to the session that created it. A session can produce several PRs (stacked or follow-up work), so the binding is a bounded list (10 entries, oldest dropped) ordered by binding time: re-binding the same PR number refreshes it and moves it to latest, and every bound PR stays searchable."；"persists the full list as a per-session sidecar file so the bindings survive daemon restarts and follow the session through archive, unarchive, and deletion"；"The same badge appears in the mission-control session overview panel and in the shared session picker row used by the resume / delete / release dialogs, and the resume dialog's search matches the same git context."。
- 设计文档 `docs/design/2026-08-20-webshell-session-pr-binding.md`（合并提交 `e2de7d288427`）原文："`prs` 按绑定时间排序（最后一个 = 最新），上限 10 个（超出丢弃最旧）。同号重复绑定刷新 url 并移到最新位"；"新增 sidecar `<chatsDir>/<sessionId>.pr.json`"；"绑定时机 = GitDialog 创建 PR 成功时。Agent 在 shell 里自行 `gh pr create` 的路径无法拦截，MVP 不覆盖"；"workspace 级打开 GitDialog（无会话上下文）时不回写"；"字段可选、可缺省；不提供\"清除\"语义"。
- 源码（v0.22.0 标签提交 `1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb`）：`packages/core/src/services/session-pr-service.ts` 的 `SESSION_PR_LIST_LIMIT = 10`、`SESSION_PR_URL_MAX_LENGTH = 2048` 与 http(s) 校验；`packages/web-shell/client/components/dialogs/GitDialog.tsx` 第 554 行 `ws.updateSessionMetadata(sid, { pr })`；`packages/web-shell/client/components/sidebar/sessionSearch.ts` 的 `sessionMatchesGitQuery`（PR 号 `9517`/`#9517` 精确匹配，分支名与 worktree slug 子串匹配）；`packages/web-shell/client/components/SessionPrBadge.tsx` 渲染 `#N` 或 `#N +M` 并经桌面适配外链打开。
- 其余四家本次无变化：Claude Code v2.1.240 更新日志仅为 "Bug fixes and reliability improvements"；Codex、Kimi Code、Qoder CLI 的官方命令与文档未出现同类“创建 PR 绑定源会话”能力。
