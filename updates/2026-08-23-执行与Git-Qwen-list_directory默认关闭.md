# 代码搜索字段：Qwen Code v0.22.0 `list_directory` 默认关闭（opt-in）

Qwen Code v0.22.0（2026-08-22 发布）把内置 `list_directory` 工具从默认注册改为默认关闭（PR #9424，2026-08-21 合并，合并提交 `e09399e0fbcf`）。官方说明的理由是 `glob` 已覆盖大多数目录列表场景，移除默认注册可减少提示词 token 占用、避免模型在近重复工具之间混淆。关闭时该工具不进入工具注册表，也不出现在模型可见的工具清单与系统提示中；模型仍调用 `list_directory`（或其别名）时返回专用错误文本，说明该工具是默认关闭的内置工具、可用 `tools.listDirectory.enabled` 启用并改用 `glob`，而不是通用的未找到提示。启用方式有两种：设置 `tools.listDirectory.enabled` 为 `true`（设置文档标注需重启）；或在 `coreTools` 白名单（`--core-tools` / `tools.core`）中显式列出 `list_directory` 自动启用，白名单条目按权限规则解析，别名 `ListFiles` 与 `list_directory(/src)` 等带路径限定形式同样匹配；已存在且不含该条目的 `coreTools` 白名单在注册表层面继续禁用该工具。源码中注册逻辑由 `isLsToolEnabled` 门控，`ToolNames.LS = 'list_directory'`、显示名 `ListFiles`；内置 Agent 与计划模式提示同步改为依赖 `glob`/`read_file`。`tools.core` 本身在 v0.22.0 设置文档中标记弃用，首次加载时自动迁移为 `permissions` 规则。矩阵 `execution-search`（代码搜索）字段此前在 Qwen Code 详情中把 `list_directory` 记为默认可用的目录浏览工具，本次改为默认关闭、显式启用后才可用；`execution-files`（文件读写）详情中同源的“目录浏览使用 `list_directory`”表述一并修正。

## 修正

- `execution-search` 字段 Qwen Code 矩阵结论由 "`glob` · `grep_search` · `LSP`" 改为追加 "；条件：`list_directory` 默认关闭，`tools.listDirectory.enabled` 启用（v0.22.0 起）"。
- `execution-search` 详情：Qwen Code entry 改为 `glob`/`grep_search`/实验 LSP 默认提供、`list_directory` 自 v0.22.0 起默认不注册；primitives 补入 `isLsToolEnabled` 注册门控与显示名 `ListFiles`；behavior 补入关闭时模型不可见、调用返回含启用说明的错误文本、别名调用解析到同一说明；integration 补入内置 Agent 与计划模式提示改用 `glob`/`read_file`；conditions 补入启用方式（`tools.listDirectory.enabled` 需重启、`coreTools` 白名单显式列出、别名与路径限定形式匹配、白名单未列出时注册表层面继续禁用、`tools.core` 弃用迁移）；跨产品事实新增一条；来源新增 `qwen-v022-release`、`qwen-list-directory-commit`（合并提交 `e09399e0fbcf`）、`qwen-list-directory-settings`/`qwen-list-directory-tools-doc`/`qwen-list-directory-registration`（固定到 v0.22.0 标签提交 `1c3a385d9bc8`）。
- `execution-files` 详情：Qwen Code entry 由“目录浏览使用 `list_directory`”改为 `list_directory` 自 v0.22.0 起默认关闭、启用后可用、目录列表通常由 `glob` 完成；来源补入 `qwen-list-directory-settings`。
- `docs/09-版本与证据.md`：Qwen Code 核对日期更新为 2026-08-23，主要材料补充 `list_directory` 默认关闭条目；官方来源表执行与 Git 列新增 list_directory 默认关闭提交、v0.22.0 设置文档、v0.22.0 文件系统工具文档与 v0.22.0 工具注册源码链接。
- 能力字段总数不变（112 个），`README.md` 计数无需调整；`npm run generate` 重新生成 `docs/capabilities/execution/`（`execution-search.md`、`execution-files.md` 内容更新）与 `docs/06-任务执行与Git矩阵.md`。

## 影响页面

- [任务执行与 Git 矩阵](../docs/06-任务执行与Git矩阵.md)
- [代码搜索详情](../docs/capabilities/execution/execution-search.md)
- [文件读写详情](../docs/capabilities/execution/execution-files.md)
- [版本与证据](../docs/09-版本与证据.md)

## 证据版本

- v0.22.0 发布说明（2026-08-22T14:58:36Z）New User-Facing Features 节原文："core: make list_directory opt-in (disabled by default) (#9424)"。
- PR #9424（2026-08-21T07:24:24Z 合并，合并提交 `e09399e0fbcf48d04a9f96a23db690b969ad8d35`）标题 "feat(core): make list_directory opt-in (disabled by default)"，说明原文："`list_directory` is no longer registered in the tool registry by default"、"Added a new configuration setting and logic (`isLsToolEnabled`) to gate tool registration"、"calling the unregistered tool returns a specific \"not found\" error with enablement instructions"、"Updated internal agents (e.g., skill-review, learn-skill) to rely on `read_file` or `glob` instead of `list_directory`"。
- 官方设置文档（v0.22.0 标签提交 `1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb`）`tools` 节原文："`tools.listDirectory.enabled` | boolean | Enable the built-in `list_directory` tool. Disabled by default because `glob` covers directory listing in most cases; the tool is also re-enabled automatically when explicitly listed in the `coreTools` allowlist (`--core-tools` / `tools.core`). | `false` | Requires restart: Yes"；同文档标注 `tools.core` 为 "**Deprecated.** Will be removed in next version."，首次加载自动迁移为 `permissions.allow`。
- 官方文件系统工具文档（同一标签提交）`list_directory` 节原文："**Note:** This tool is opt-in and disabled by default because `glob` covers directory listing in most cases. Enable it by setting `tools.listDirectory.enabled` to `true` in your settings, or by explicitly listing `list_directory` in the `coreTools` allowlist (`--core-tools` / `tools.core`)."，并列出工具名 `list_directory`、显示名 `ListFiles`。
- 源码（同一标签提交）：`packages/core/src/config/config.ts` 的 `isLsToolEnabled()`（设置为真，或 `coreTools` 中存在经 `parseRule` 解析后工具名为 `list_directory` 的条目；注释说明别名 `ListFiles` 与 `list_directory(/src)` 形式同样匹配）与 `if (this.isLsToolEnabled()) { await registerLazy(ToolNames.LS, ...) }` 注册分支；`packages/core/src/core/coreToolScheduler.ts` 对未注册 `list_directory`（含别名解析后）返回 "Tool \"list_directory\" is a built-in tool that is disabled by default because glob covers directory listing in most cases. Enable it with the tools.listDirectory.enabled setting. Use glob instead."，工作区工具开关禁用时返回另一条指向 workspace tools toggle 的文本；`packages/core/src/tools/tool-names.ts` 的 `LS: 'list_directory'` 与显示名 `ListFiles`；`packages/cli/src/config/config.ts` 的 `--core-tools` 选项。
- 其余四家本次无变化：Claude Code v2.1.240 与 v2.1.241 更新日志均为 "Bug fixes and reliability improvements"；Codex 近期发布为 rust-v0.150.0 alpha 通道，Kimi Code 最新稳定版仍为 0.38.0，Qoder CLI 官方文档未出现同类“目录列表工具默认关闭”条目。
