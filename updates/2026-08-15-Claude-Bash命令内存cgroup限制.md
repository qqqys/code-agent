# Claude Code Bash 命令内存 cgroup 限制

Claude Code v2.1.233（2026-08-14 发布）为 Linux 上的 Bash 工具命令新增可选的内存 cgroup 限制：设置 `CLAUDE_CODE_TOOL_MEMORY_LIMIT` 后，失控构建不会占满内存拖住会话。官方环境变量文档尚未收录该变量，当前一手来源是固定到提交 SHA 的官方更新日志。矩阵 `execution-shell`（Shell 执行）字段此前只记录五家的 Shell 入口，本次把该限制补入 Claude Code 记录，并按官方文档核对了其余四家的同类边界：Codex 官方配置参考没有 Shell 内存或 CPU 资源限制项，Qwen Code Sandbox 文档未列内存限制但容器型沙箱可用 `SANDBOX_FLAGS` 注入自定义 docker/podman 参数，Kimi Code 配置文档只有超时类设置（`bash_auto_background_on_timeout`、`bash_task_timeout_s`），Qoder CLI 权限与 Sandbox 文档的隔离能力只覆盖文件系统、网络和命令执行安全检查。

## 修正

- `execution-shell`（Shell 执行）矩阵 Claude Code 列由 “`Bash`” 更新为 “`Bash` · 条件：Linux Bash 命令内存 cgroup 限制（`CLAUDE_CODE_TOOL_MEMORY_LIMIT`，v2.1.233 引入）”。
- `execution-shell` 详情：Claude Code 条件补充 Linux 内存 cgroup 限制的入口、版本与官方用途说明，来源新增固定到提交 SHA 的 v2.1.233 更新日志；Codex 条件补充官方配置参考无 Shell 资源限制项、仅超时类设置，来源新增配置参考；Qwen Code 条件补充 Sandbox 文档无内存限制项、`SANDBOX_FLAGS` 为用户自配通道，来源新增 Sandbox 文档；Kimi Code 条件补充官方配置文档无资源限制项、长命令只由超时控制；Qoder CLI 条件补充官方权限与 Sandbox 文档无资源限制项，来源新增 Sandbox 文档；跨产品事实新增资源约束对比条目。
- `docs/06-任务执行与Git矩阵.md`：Shell 执行行 Claude Code 列按上述结论更新（由 `npm run generate` 重新生成）。
- `docs/09-版本与证据.md`：Claude Code 核对日期更新为 2026-08-15，主要材料补充 Bash 命令内存 cgroup 限制条目；官方来源表 Claude Code 执行与 Git 列新增 v2.1.233 更新日志链接，Qoder CLI 权限与沙箱列新增 Sandbox 文档链接。
- `site/data.js` 新增来源 `claude-bash-memory-limit`（v2.1.233 更新日志，固定提交 SHA `0fa8c19d50f7`）与 `qoder-sandbox`（Qoder CLI Sandbox 文档）。
- 能力字段总数不变（110 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/capabilities/execution/execution-shell.md` 与各分类矩阵的核对日期。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [Shell 执行详情](../docs/capabilities/execution/execution-shell.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- Claude Code 官方更新日志 v2.1.233（提交 `0fa8c19d50f7`，2026-08-14T22:20:50Z；Release v2.1.233，2026-08-14T22:20:57Z）原文："Added opt-in memory cgroup support for Bash tool commands on Linux (`CLAUDE_CODE_TOOL_MEMORY_LIMIT`) so a runaway build can't stall the session"。
- Claude Code 官方环境变量文档（https://code.claude.com/docs/en/env-vars，2026-08-15 抓取）未列出 `CLAUDE_CODE_TOOL_MEMORY_LIMIT`；现有 Bash 资源相关变量为 `BASH_DEFAULT_TIMEOUT_MS`（默认 120000）、`BASH_MAX_OUTPUT_LENGTH`（默认 30000，上限 150000）、`BASH_MAX_TIMEOUT_MS`（默认 600000）。
- Codex 官方配置参考（https://learn.chatgpt.com/docs/config-file/config-reference，2026-08-15 抓取）无 Shell 内存、CPU 或进程资源限制项；超时类设置仅 `background_terminal_max_timeout`（默认 300000 毫秒）。
- Qwen Code 官方 Sandbox 文档（提交 `2e08486b529b`，2026-08-15 抓取）未列内存或 CPU 限制；"Custom Sandbox Flags" 章节原文："For container-based sandboxing, you can inject custom flags into the `docker` or `podman` command using the `SANDBOX_FLAGS` environment variable."。
- Kimi Code 官方配置文档（docs/zh/configuration/config-files.md main 分支，2026-08-15 抓取）无 Shell 内存或资源限制项；`[background]` 章节的 `bash_auto_background_on_timeout` 控制前台超时转后台，`bash_task_timeout_s` 为后台默认超时（`0` 为无超时，print 模式默认 `0`）。
- Qoder CLI 官方权限文档（https://docs.qoder.com/cli/permissions，2026-08-15 抓取）与 Sandbox 文档（https://docs.qoder.com/cli/sandbox，2026-08-15 抓取）均无 Shell 内存或资源限制项；Sandbox 页 Isolation Capabilities 只覆盖文件系统隔离、网络隔离和命令执行安全检查。
