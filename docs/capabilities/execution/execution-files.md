# 文件读写

[返回任务执行与 Git 详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=execution-files)

> 核对日期：2026-07-29

## 定义

读取文本或媒体文件，并通过精确替换、补丁、整文件写入或 Notebook 单元编辑修改工作区内容。

## 执行结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | `Read` · `Edit` · `Write` | 官方确认 |
| Codex | 内置读取 · 补丁编辑 | 官方确认 |
| Qwen Code | `read_file` · `edit` · `write_file` | 源码确认 |
| Kimi Code | `Read` · `Edit` · `Write` | 源码确认 |
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

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Read` · `Edit` · `Write` |
| 入口与工具 | 模型调用 `Read`、`Edit`、`Write`；Notebook 使用 `NotebookEdit`，图片和 PDF 可由 `Read` 读取。 |
| 核心机制 | `Read` 支持文本、图片、PDF 与 Notebook；`Edit` 做精确替换；`Write` 创建或覆盖；`NotebookEdit` 修改单元。 |
| 执行行为 | `Edit` 与 `Write` 会触发文件修改权限检查；读取和搜索工具默认不要求权限。编辑后 LSP 可自动回报类型错误。 |
| 运行范围 | 以当前项目目录和已加入的工作目录为主要范围；目录外访问由文件权限规则决定。 |
| 后台与并发 | 文件工具本身同步返回；可由后台 Agent 或 Worktree 会话并行调用。 |
| Git 与平台联动 | IDE 扩展可把修改显示在原生 Diff 视图；Hooks 可在工具调用前后校验或阻止变更。 |
| 状态与产物 | 修改直接落在当前工作区或当前 Worktree；检查点与 Git 决定后续回退方式。 |
| 条件与边界 | 工具可被 `permissions.deny`、Subagent 工具列表或 Plugin 配置移除；Plan 模式会限制写入。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)、[Claude Code Permissions](https://code.claude.com/docs/en/permissions) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 内置读取 · 补丁编辑 |
| 入口与工具 | 模型使用内置文件读取与补丁编辑能力；需要整文件或批量机械操作时也可通过 Shell 完成。 |
| 核心机制 | 核心路径是读取文件后提交结构化补丁；当前公开文档不要求用户记住内部工具名。 |
| 执行行为 | 补丁在应用前后仍受当前审批预设和文件系统沙箱控制；只读模式不会允许持久修改。 |
| 运行范围 | 默认受当前工作区、额外可写目录和所选沙箱边界约束；桌面 App Worktree 会把落盘位置切到隔离目录。 |
| 后台与并发 | 文件编辑随当前 Agent 线程执行；并发 Subagent 仍共享父线程审批与沙箱边界。 |
| Git 与平台联动 | 桌面 App 和 IDE 可展示 Diff；App Review pane 支持对改动进行暂存或回退。 |
| 状态与产物 | 结果是工作区文件修改和可审阅 Diff；不会因为生成补丁自动创建提交。 |
| 条件与边界 | 实际可写范围取决于 Read Only、Auto 等权限预设以及运行时沙箱；Cloud 任务使用远端环境。 |
| 证据状态 | 官方确认 |
| 来源 | [Codex Documentation](https://developers.openai.com/codex)、[Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)、[Codex code review](https://learn.chatgpt.com/docs/code-review) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `read_file` · `edit` · `write_file` |
| 入口与工具 | 模型调用 `read_file`、`edit`、`write_file` 和 `notebook_edit`；目录浏览使用 `list_directory`。 |
| 核心机制 | `read_file` 分页读取；`edit` 做受控替换；`write_file` 写入完整内容；`notebook_edit` 修改 Notebook 单元。 |
| 执行行为 | 读取与编辑分别经过路径权限、工作区信任和 approval mode；读后再改规则可阻止模型基于过期内容直接覆盖。 |
| 运行范围 | 默认工作区是启动目录；`--include-directories`、Worktree 或 Daemon workspace 可改变有效路径范围。 |
| 后台与并发 | 后台 Agent 可使用文件工具；普通文件工具调用自身不是长驻任务。 |
| Git 与平台联动 | VS Code Companion 可打开原生 Diff；PreToolUse、PostToolUse 和 Permission Hooks 可观察或阻止调用。 |
| 状态与产物 | 修改写入当前工作区、当前 Worktree 或显式 Agent 工作目录；不会自动暂存或提交。 |
| 条件与边界 | Plan mode 禁止普通写入；auto-edit、auto、yolo 对审批的处理不同，沙箱仍是独立边界。 |
| 证据状态 | 源码确认 |
| 来源 | [Qwen Code current built-in tools](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/tool-names.ts)、[Qwen Code Settings](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md)、[Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | `Read` · `Edit` · `Write` |
| 入口与工具 | 模型调用 `Read`、`Write`、`Edit`；图片和视频使用 `ReadMediaFile`。 |
| 核心机制 | `Read` 最多返回 1000 行或 100 KB；`Write` 支持 overwrite/append；`Edit` 支持唯一匹配或 `replace_all`。 |
| 执行行为 | Read 默认放行，Write/Edit 默认需审批；Grep/Glob 会过滤敏感文件，写入缺失父目录时会自动创建。 |
| 运行范围 | 相对路径基于当前工作目录；权限模式和工具策略继续限制路径与写入。 |
| 后台与并发 | 文件调用同步完成；后台 Agent 使用独立上下文，但默认仍操作被分配的同一工作目录。 |
| Git 与平台联动 | TUI、Web 与 VS Code Surface 可渲染文件修改和工具调用；Hooks 走统一工具执行链。 |
| 状态与产物 | 写入直接落盘；会话日志记录工具事件，但不会自动把修改变成 Git 提交。 |
| 条件与边界 | Plan 模式下 Write/Edit 只允许写计划文件；YOLO 跳过普通审批但不改变文件系统权限。 |
| 证据状态 | 源码确认 |
| 来源 | [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)、[Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md) |

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
| 条件与边界 | 权限规则、Subagent `tools`/`disallowedTools` 和 SDK query options 都可能缩小可用集合。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)、[Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)、[Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references) |

## 官方来源

- [Claude Code tools reference](https://code.claude.com/docs/en/tools-reference)
- [Claude Code Permissions](https://code.claude.com/docs/en/permissions)
- [Codex Documentation](https://developers.openai.com/codex)
- [Codex Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Codex code review](https://learn.chatgpt.com/docs/code-review)
- [Qwen Code current built-in tools](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/packages/core/src/tools/tool-names.ts)
- [Qwen Code Settings](https://github.com/QwenLM/qwen-code/blob/2e08486b529bf64ca3b31d13424ad12f1100de93/docs/users/configuration/settings.md)
- [Qwen Code current worktree](https://github.com/QwenLM/qwen-code/blob/8a44b1b9f79341a0faca9814fb1b57f0f1b354a2/docs/users/features/worktree.md)
- [Kimi Code current built-in tools](https://github.com/MoonshotAI/kimi-code/blob/77618e38c35a81e26134b3f83eb7f2b460c0ee05/docs/zh/reference/tools.md)
- [Kimi Code current configuration](https://github.com/MoonshotAI/kimi-code/blob/29783e471afcf7975852e496907646458264d2e6/docs/zh/configuration/config-files.md)
- [Qoder CLI built-in tools](https://docs.qoder.com/en/cli/sdk/tools)
- [Qoder CLI Permissions](https://docs.qoder.com/en/cli/permissions)
- [Qoder CLI SDK Reference](https://docs.qoder.com/en/cli/sdk/references)

## 关联能力

- [代码搜索](./execution-search.md)
- [Git 操作](./execution-git.md)
- [文件系统隔离](../security/security-filesystem.md)
