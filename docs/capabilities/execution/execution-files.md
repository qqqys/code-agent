# 文件读写

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-files)

> 核对日期：2026-08-24

## 定义

读取文本或媒体文件，并通过精确替换、补丁、整文件写入或 Notebook 单元编辑修改工作区内容。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `Read` · `Edit` · `Write` · 官方工具参考记录读后再改要求与模型差异 | 官方确认 |
| Codex | 内置读取 · 补丁编辑 · `apply_patch_preserve_line_endings` 换行保留（条件：main 分支，尚未发布） | 源码确认 |
| Qwen Code | `read_file` · `edit` · `write_file` | 源码确认 |
| Kimi Code | `Read` · `Edit` · `Write` · 条件：Edit/Write 拒绝未读取或读取后磁盘已变的已有文件（main 分支，尚未发布） | 源码确认 |
| Qoder CLI | `Read` · `Edit` · `Write` | 官方确认 |

## 比较边界

### 本页包含

- 文件读取、创建、覆盖和局部修改
- Notebook 或媒体文件的专用入口
- 修改前读取、权限审批与工作区边界

### 本页不包含

- 仅由 Shell 命令完成的文件操作
- 代码搜索和符号导航
- Git 暂存、提交与回退

## 跨产品事实

1. 五家都提供模型可直接调用的文件读写能力，不需要先拼接 Shell 命令。
2. Claude Code、Qwen Code 和 Qoder CLI 单独提供 Notebook 编辑工具；Kimi Code 的当前工具表把媒体读取与文本读取分开。
3. 工具名称相近不代表审批相同：只读工具通常可直接运行，写入和编辑仍受各自权限模式、工作区边界与沙箱约束。
4. 换行处理不同：Codex `apply_patch` 默认把更新文件归一为 LF，`apply_patch_preserve_line_endings` 开关（已合入 main，尚未发布）启用后才保留原换行；Qwen Code `edit` 默认检测并保留原换行风格。Claude Code、Kimi Code 与 Qoder CLI 的官方工具文档未列同类换行保留或规范化配置。
5. 写前读与过期写入保护不同：Claude Code 官方工具参考记录读后再改要求——当前会话先读取才能编辑，Claude Opus 4.6、Haiku 4.5 及更早模型始终要求先读，较新模型在读取无需权限提示且 Read 工具可用时可编辑未读文件；Kimi Code main 分支新增 staleGuard（尚未发布），Edit/Write 拒绝修改未经本 Agent 读取或读取后磁盘 mtime 已变的已有文件；Qwen Code `edit` 以 `checkPriorRead` 强制读后再改并在写入前复核过期；Codex 与 Qoder CLI 的官方工具文档未列同类写前读强制要求。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Read` · `Edit` · `Write` · 官方工具参考记录读后再改要求与模型差异 |
| 入口与工具 | 模型调用 `Read`、`Edit`、`Write`；Notebook 使用 `NotebookEdit`，图片和 PDF 可由 `Read` 读取。 |
| 核心机制 | `Read` 支持文本、图片、PDF 与 Notebook；`Edit` 做精确替换；`Write` 创建或覆盖；`NotebookEdit` 修改单元。 |
| 执行行为 | `Edit` 与 `Write` 会触发文件修改权限检查；读取和搜索工具默认不要求权限。编辑后 LSP 可自动回报类型错误。官方工具参考记录读后再改要求：当前会话需先读取目标文件，`PARTIAL view` 截断的读取不算；Claude Opus 4.6、Haiku 4.5 及更早模型始终要求先读，较新模型在读取无需权限提示且 Read 工具可用时可编辑未读文件；Bash 用 `cat`、`nl`、`bat`、`batcat`、`head`、`tail`、`sed -n 'X,Yp'`、`grep`、`egrep`、`fgrep`、`rg` 查看单文件且无管道或重定向也满足要求。`Write` 覆盖已有文件是否必须先读取决于模型与文件；Jupyter Notebook 与部分读取的文件对所有模型都要求先读；新建文件不受限。文件在上次读取后变化时，仅当 `old_string` 与当前内容精确且唯一匹配、读取无需提示才允许直接编辑，其余情况要先重读。 |
| 运行范围 | 以当前项目目录和已加入的工作目录为主要范围；目录外访问由文件权限规则决定。 |
| 后台与并发 | 文件工具本身同步返回；可由后台 Agent 或 Worktree 会话并行调用。 |
| Git 与平台联动 | IDE 扩展可把修改显示在原生 Diff 视图；Hooks 可在工具调用前后校验或阻止变更。 |
| 状态与产物 | 修改直接落在当前工作区或当前 Worktree；检查点与 Git 决定后续回退方式。 |
| 条件与边界 | 工具可被 `permissions.deny`、Subagent 工具列表或 Plugin 配置移除；Plan 模式会限制写入。官方工具参考未列 `Edit`/`Write` 的换行保留或规范化配置。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)、[Claude Code Permissions](https://code.claude.com/docs/en/permissions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 内置读取 · 补丁编辑 · `apply_patch_preserve_line_endings` 换行保留（条件：main 分支，尚未发布） |
| 入口与工具 | 模型使用内置文件读取与补丁编辑能力；需要整文件或批量机械操作时也可通过 Shell 完成。 |
| 核心机制 | 核心路径是读取文件后提交结构化补丁；`apply_patch` 默认 `NormalizeToLf`（把更新文件归一为 LF），main 分支新增 `PreserveLineEndings` 模式：未改动行保留原换行，插入行采用文件首个已有换行风格，文件无换行时用 LF。当前公开文档不要求用户记住内部工具名。 |
| 执行行为 | 补丁在应用前后仍受当前审批预设和文件系统沙箱控制；只读模式不会允许持久修改。官方 Apply Patch 指南（Responses API harness 说明）列出 `create_file`/`update_file`/`delete_file` 三种 V4A diff 操作并由 harness 应用，未设写前读强制要求；`update_file` 上下文与文件内容不匹配时应用失败并返回如 `Error: Invalid Context` 的错误，模型据此重读文件或简化改动后重试。 |
| 运行范围 | 默认受当前工作区、额外可写目录和所选沙箱边界约束；桌面 App Worktree 会把落盘位置切到隔离目录。 |
| 后台与并发 | 文件编辑随当前 Agent 线程执行；并发 Subagent 仍共享父线程审批与沙箱边界。 |
| Git 与平台联动 | 桌面 App 和 IDE 可展示 Diff；App Review pane 支持对改动进行暂存或回退。 |
| 状态与产物 | 结果是工作区文件修改和可审阅 Diff；不会因为生成补丁自动创建提交。 |
| 条件与边界 | 实际可写范围取决于 Read Only、Auto 等权限预设以及运行时沙箱；Cloud 任务使用远端环境。条件：`config.toml` 的 `[features]` 下 `apply_patch_preserve_line_endings` 开关（默认关闭、UnderDevelopment 阶段）启用换行保留；启用后进程内 apply_patch 直接读取该 Feature，Core 同时清除继承值并向子进程环境注入 `CODEX_APPLY_PATCH_PRESERVE_LINE_ENDINGS=1`，独立 `apply_patch` 可执行文件按该环境变量选择模式。该开关 2026-08-10 合入 main 分支，尚未进入 Release，官方配置参考未列出。 |
| 证据状态 | 源码确认 |
| 来源 | [Codex Documentation](https://developers.openai.com/codex)、[Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)、[Codex code review](https://learn.chatgpt.com/docs/code-review)、[Codex apply_patch line-ending preservation mode](https://github.com/openai/codex/commit/21aa552e8727c03189d0f7d18bbd6e7583e88f88)、[Codex apply_patch_preserve_line_endings feature flag](https://github.com/openai/codex/commit/c9c6c0daa994109cec50fddcb57d076fdf9e738c)、[Codex Apply Patch tool guide](https://developers.openai.com/api/docs/guides/tools-apply-patch) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `read_file` · `edit` · `write_file` |
| 入口与工具 | 模型调用 `read_file`、`edit`、`write_file` 和 `notebook_edit`。目录浏览工具 `list_directory` 自 v0.22.0 起默认关闭，启用后可用（`tools.listDirectory.enabled`），目录列表通常由 `glob` 完成。 |
| 核心机制 | `read_file` 分页读取；`edit` 做受控替换；`write_file` 写入完整内容；`notebook_edit` 修改 Notebook 单元。 |
| 执行行为 | 读取与编辑分别经过路径权限、工作区信任和 approval mode。`edit` 以 `checkPriorRead` 强制读后再改：未经合法读取的已有文件拒绝编辑，按 mtime/文件大小检测过期，并在读取后、写入前各复核一次以收紧 TOCTOU 窗口；工具描述也要求先查看文件当前内容再尝试替换。`edit` 匹配前把 CRLF 归一为 LF，写回已有文件时按检测到的原换行风格恢复。 |
| 运行范围 | 默认工作区是启动目录；`--include-directories`、Worktree 或 Daemon workspace 可改变有效路径范围。 |
| 后台与并发 | 后台 Agent 可使用文件工具；普通文件工具调用自身不是长驻任务。 |
| Git 与平台联动 | VS Code Companion 可打开原生 Diff；PreToolUse、PostToolUse 和 Permission Hooks 可观察或阻止调用。 |
| 状态与产物 | 修改写入当前工作区、当前 Worktree 或显式 Agent 工作目录；不会自动暂存或提交。 |
| 条件与边界 | Plan mode 禁止普通写入；auto-edit、auto、yolo 对审批的处理不同，沙箱仍是独立边界。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current built-in tools](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/tool-names.ts)、[Qwen Code Settings](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md)、[Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)、[Qwen Code current edit tool source](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/edit.ts)、[Qwen Code v0.22.0 settings (tools.listDirectory.enabled)](https://github.com/QwenLM/qwen-code/blob/1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb/docs/users/configuration/settings.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Read` · `Edit` · `Write` · 条件：Edit/Write 拒绝未读取或读取后磁盘已变的已有文件（main 分支，尚未发布） |
| 入口与工具 | 模型调用 `Read`、`Write`、`Edit`；图片和视频使用 `ReadMediaFile`。 |
| 核心机制 | `Read` 最多返回 1000 行或 100 KB；`Write` 支持 overwrite/append；`Edit` 支持唯一匹配或 `replace_all`。 |
| 执行行为 | Read 默认放行，Write/Edit 默认需审批；Grep/Glob 会过滤敏感文件，写入缺失父目录时会自动创建。v2 引擎的 staleGuard 在工具执行前拦截 Edit/Write：修改已有文件要求本 Agent 此前成功执行过 `Read`（`Read`/`Edit`/`Write` 成功后记录文件 mtimeMs，失败不记录），当前磁盘 mtime 与记录不一致即拒绝；同一批工具调用中已有对同一路径的 `Read` 时放行；新建文件不受影响。拒绝时分别提示 "has not been read by this agent yet" 或 "has been modified on disk since this agent last read it"，要求先（重新）读取；Agent 运行时变化会清空记录。 |
| 运行范围 | 相对路径基于当前工作目录；权限模式和工具策略继续限制路径与写入。 |
| 后台与并发 | 文件调用同步完成；后台 Agent 使用独立上下文，但默认仍操作被分配的同一工作目录。 |
| Git 与平台联动 | TUI、Web 与 VS Code Surface 可渲染文件修改和工具调用；Hooks 走统一工具执行链。 |
| 状态与产物 | 写入直接落盘；会话日志记录工具事件，但不会自动把修改变成 Git 提交。 |
| 条件与边界 | Plan 模式下 Write/Edit 只允许写计划文件；YOLO 跳过普通审批但不改变文件系统权限。官方工具文档未列换行保留或规范化配置；`Write` 的 append 模式不自动补换行。staleGuard 于 2026-08-19 合入 main（提交 `67fbcdf1ba7d`，PR #3096），changeset 为 patch 级、尚未发布；无配置开关，仅 agent-core-v2 引擎实现（该提交时点的官方配置文档称 agent-core-v2 为默认引擎，`kimi web` 始终使用 v2），`KIMI_CODE_LEGACY_FLAG=1` 选择的旧版引擎未实现；官方工具文档尚未同步。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)、[Kimi Code Edit/Write staleness guard commit](https://github.com/MoonshotAI/kimi-code/commit/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de)、[Kimi Code staleGuard service source](https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/packages/agent-core-v2/src/features/staleGuard/staleGuardService.ts)、[Kimi Code Edit/Write staleness guard changeset](https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/.changeset/file-write-staleness-guard.md)、[Kimi Code configuration documentation (default agent-core-v2 engine)](https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/docs/zh/configuration/config-files.md) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Read` · `Edit` · `Write` |
| 入口与工具 | 模型调用 `Read`、`Edit`、`Write` 与 `NotebookEdit`；SDK 可通过 `tools`、`allowedTools`、`disallowedTools` 控制暴露。 |
| 核心机制 | 内置工具覆盖文本读取、局部编辑、整文件写入和 Notebook 编辑，工具输入输出在 SDK Reference 中有类型定义。 |
| 执行行为 | Edit 权限规则同时覆盖 Edit、Write 和 NotebookEdit；Read 与 Edit 可按路径模式细分 Allow、Ask、Deny。 |
| 运行范围 | 当前 workspace 是主要目录；`--add-dir`、`/add-dir` 或 `permissions.additionalDirectories` 可增加可信目录。 |
| 后台与并发 | 文件工具本身同步返回；Subagent、Worktree Job 或 Cloud task 可并行运行。 |
| Git 与平台联动 | TUI、Headless、ACP 和 Agent SDK 共用内置工具集合，但每个入口可进一步过滤工具。 |
| 状态与产物 | 修改写入当前 workspace 或所选 Worktree；是否进入提交由后续 Git 操作决定。 |
| 条件与边界 | 权限规则、Subagent `tools`/`disallowedTools` 和 SDK query options 都可能缩小可用集合。官方内置工具文档未列换行保留、规范化配置或写前读/过期写入保护。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)、[Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)、[Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code Permissions](https://code.claude.com/docs/en/permissions)
- [Codex Documentation](https://developers.openai.com/codex)
- [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Codex code review](https://learn.chatgpt.com/docs/code-review)
- [Codex apply_patch line-ending preservation mode](https://github.com/openai/codex/commit/21aa552e8727c03189d0f7d18bbd6e7583e88f88)
- [Codex apply_patch_preserve_line_endings feature flag](https://github.com/openai/codex/commit/c9c6c0daa994109cec50fddcb57d076fdf9e738c)
- [Codex Apply Patch tool guide](https://developers.openai.com/api/docs/guides/tools-apply-patch)
- [Qwen Code current built-in tools](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/tool-names.ts)
- [Qwen Code Settings](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md)
- [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)
- [Qwen Code current edit tool source](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/edit.ts)
- [Qwen Code v0.22.0 settings (tools.listDirectory.enabled)](https://github.com/QwenLM/qwen-code/blob/1c3a385d9bc83e0b2a1ce5a24454ce1d090595fb/docs/users/configuration/settings.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/%40moonshot-ai/kimi-code%400.38.0/docs/zh/reference/tools.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)
- [Kimi Code Edit/Write staleness guard commit](https://github.com/MoonshotAI/kimi-code/commit/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de)
- [Kimi Code staleGuard service source](https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/packages/agent-core-v2/src/features/staleGuard/staleGuardService.ts)
- [Kimi Code Edit/Write staleness guard changeset](https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/.changeset/file-write-staleness-guard.md)
- [Kimi Code configuration documentation (default agent-core-v2 engine)](https://github.com/MoonshotAI/kimi-code/blob/67fbcdf1ba7dceeebb58875b3b7c81b4b30cf0de/docs/zh/configuration/config-files.md)
- [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [代码搜索](./execution-search.md)
- [Git 操作](./execution-git.md)
- [文件系统隔离](../security/security-filesystem.md)
